import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import puppeteer from "puppeteer-core";
import { FormattingRule } from "../drizzle/schema";

/**
 * Generate PDF from Markdown content
 */
export async function generatePdfFromMarkdown(
  markdown: string,
  rules: FormattingRule
): Promise<Buffer> {
  const html = await markdownToHtml(markdown, rules);
  
  // Connect to browser - uses BROWSER_WS_ENDPOINT env var or falls back to local Chrome
  const browserWSEndpoint = process.env.BROWSER_WS_ENDPOINT;
  
  let browser;
  if (browserWSEndpoint) {
    browser = await puppeteer.connect({ browserWSEndpoint });
  } else {
    // Try common Chrome paths for local development
    const chromePaths = [
      process.env.CHROME_PATH,
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    ].filter(Boolean) as string[];

    let executablePath: string | undefined;
    for (const p of chromePaths) {
      try {
        const fs = await import("fs");
        if (fs.existsSync(p)) {
          executablePath = p;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!executablePath) {
      throw new Error(
        "Chrome not found. Set BROWSER_WS_ENDPOINT or CHROME_PATH environment variable."
      );
    }

    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pageSize = rules.pageSize === "Letter" ? "Letter" : "A4";
    
    const pdfBuffer = await page.pdf({
      format: pageSize,
      margin: {
        top: `${rules.marginTop}mm`,
        bottom: `${rules.marginBottom}mm`,
        left: `${rules.marginLeft}mm`,
        right: `${rules.marginRight}mm`,
      },
      printBackground: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (browserWSEndpoint) {
      await browser.disconnect();
    } else {
      await browser.close();
    }
  }
}

/**
 * Markdown to HTML converter with formatting rules applied
 */
export async function markdownToHtml(markdown: string, rules: FormattingRule): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm);

  const ast = processor.parse(markdown) as any;

  // Transform AST with formatting rules
  const htmlContent = astToHtml(ast, rules);

  // Wrap with styling
  return generateStyledHtml(htmlContent, rules);
}

function astToHtml(node: any, rules: FormattingRule, depth: number = 0): string {
  let html = "";

  if (node.type === "root") {
    node.children?.forEach((child: any) => {
      html += astToHtml(child, rules, depth);
    });
  } else if (node.type === "heading") {
    const level = node.depth;
    const headingStyle = (rules.headingStyles as any)[`h${level}`] || {};
    const content = astToHtml({ type: "root", children: node.children }, rules, depth);
    html += `<h${level} style="font-size: ${headingStyle.fontSize || 16}px; font-weight: ${headingStyle.fontWeight || 600}; margin-top: ${headingStyle.marginTop || 12}px; margin-bottom: ${headingStyle.marginBottom || 6}px;">${content}</h${level}>`;
  } else if (node.type === "paragraph") {
    const content = astToHtml({ type: "root", children: node.children }, rules, depth);
    html += `<p style="margin-bottom: 1em; line-height: ${rules.lineHeight};">${content}</p>`;
  } else if (node.type === "text") {
    html += escapeHtml(node.value);
  } else if (node.type === "emphasis") {
    const content = astToHtml({ type: "root", children: node.children }, rules, depth);
    html += `<em>${content}</em>`;
  } else if (node.type === "strong") {
    const content = astToHtml({ type: "root", children: node.children }, rules, depth);
    html += `<strong>${content}</strong>`;
  } else if (node.type === "inlineCode") {
    const codeStyle = rules.codeBlockStyles as any;
    html += `<code style="font-family: ${codeStyle.fontFamily || 'monospace'}; font-size: ${codeStyle.fontSize || 11}px; background-color: ${codeStyle.backgroundColor || '#f5f5f5'}; padding: 2px 4px; border-radius: 3px;">${escapeHtml(node.value)}</code>`;
  } else if (node.type === "code") {
    const codeStyle = rules.codeBlockStyles as any;
    const content = escapeHtml(node.value);
    html += `<pre style="font-family: ${codeStyle.fontFamily || 'monospace'}; font-size: ${codeStyle.fontSize || 11}px; background-color: ${codeStyle.backgroundColor || '#f5f5f5'}; padding: ${codeStyle.padding || 12}px; border-radius: ${codeStyle.borderRadius || 4}px; overflow-x: auto; line-height: ${codeStyle.lineHeight || 1.4};"><code>${content}</code></pre>`;
  } else if (node.type === "list") {
    const tag = node.ordered ? "ol" : "ul";
    const content = astToHtml({ type: "root", children: node.children }, rules, depth + 1);
    html += `<${tag} style="margin-left: ${20 + depth * 20}px; margin-bottom: 1em;">${content}</${tag}>`;
  } else if (node.type === "listItem") {
    const content = astToHtml({ type: "root", children: node.children }, rules, depth);
    html += `<li>${content}</li>`;
  } else if (node.type === "blockquote") {
    const content = astToHtml({ type: "root", children: node.children }, rules, depth);
    html += `<blockquote style="border-left: 4px solid #ccc; padding-left: 12px; margin-left: 0; font-style: italic; color: #666;">${content}</blockquote>`;
  } else if (node.type === "table") {
    const tableStyle = rules.tableStyles as any;
    let tableHtml = `<table style="border-collapse: collapse; width: 100%; margin-bottom: 1em; border: 1px solid ${tableStyle.borderColor || '#ddd'};"><tbody>`;
    
    node.children?.forEach((row: any, rowIndex: number) => {
      const isHeader = rowIndex === 0 && node.children.length > 1;
      const tag = isHeader ? "th" : "td";
      tableHtml += `<tr style="background-color: ${isHeader ? tableStyle.headerBackgroundColor || '#f9f9f9' : 'white'};">`;
      
      row.children?.forEach((cell: any) => {
        const cellContent = astToHtml({ type: "root", children: cell.children }, rules, depth);
        tableHtml += `<${tag} style="border: 1px solid ${tableStyle.borderColor || '#ddd'}; padding: ${tableStyle.cellPadding || 8}px; font-size: ${tableStyle.fontSize || 11}px;">${cellContent}</${tag}>`;
      });
      
      tableHtml += `</tr>`;
    });
    
    tableHtml += `</tbody></table>`;
    html += tableHtml;
  } else if (node.type === "link") {
    const content = astToHtml({ type: "root", children: node.children }, rules, depth);
    html += `<a href="${escapeHtml(node.url)}" style="color: #0066cc; text-decoration: underline;">${content}</a>`;
  } else if (node.type === "image") {
    html += `<img src="${escapeHtml(node.url)}" alt="${escapeHtml(node.alt || '')}" style="max-width: 100%; height: auto; margin: 1em 0;" />`;
  } else if (node.type === "thematicBreak") {
    html += `<hr style="border: none; border-top: 1px solid #ccc; margin: 2em 0;" />`;
  } else if (node.children) {
    node.children.forEach((child: any) => {
      html += astToHtml(child, rules, depth);
    });
  }

  return html;
}

function generateStyledHtml(content: string, rules: FormattingRule): string {
  const pageSize = rules.pageSize === "Letter" ? "8.5in 11in" : "210mm 297mm"; // A4 default
  const marginTop = `${rules.marginTop}mm`;
  const marginBottom = `${rules.marginBottom}mm`;
  const marginLeft = `${rules.marginLeft}mm`;
  const marginRight = `${rules.marginRight}mm`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Document</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: ${pageSize};
      margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft};
      ${rules.headerText ? `@top-center { content: "${escapeHtml(rules.headerText)}"; }` : ""}
      ${rules.footerText ? `@bottom-center { content: "${escapeHtml(rules.footerText)}"; }` : ""}
    }

    body {
      font-family: '${rules.fontFamily}', sans-serif;
      font-size: ${rules.fontSize}px;
      line-height: ${rules.lineHeight};
      color: #333;
    }

    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
    }

    ${rules.pageBreakBeforeHeadings === "h1" ? "h1 { page-break-before: always; }" : ""}
    ${rules.pageBreakBeforeHeadings === "h2" ? "h2 { page-break-before: always; }" : ""}

    ${rules.preventOrphanHeadings ? "h1, h2, h3 { page-break-after: avoid; orphans: 3; widows: 3; }" : ""}

    pre {
      page-break-inside: avoid;
    }

    table {
      page-break-inside: avoid;
    }

    img {
      page-break-inside: avoid;
    }

    p {
      margin-bottom: 1em;
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 1em;
    }

    blockquote {
      border-left: 4px solid #ccc;
      padding-left: 12px;
      margin-left: 0;
      font-style: italic;
      color: #666;
      margin-bottom: 1em;
    }

    code {
      font-family: 'Courier New', monospace;
      background-color: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
    }

    pre code {
      padding: 0;
      background-color: transparent;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>
  `;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
