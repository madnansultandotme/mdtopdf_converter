import { describe, it, expect } from "vitest";
import { markdownToHtml } from "./pdfGenerator";
import { DEFAULT_HEADING_STYLES, DEFAULT_CODE_BLOCK_STYLES, DEFAULT_TABLE_STYLES } from "../drizzle/schema";

describe("PDF Generator", () => {
  const mockFormattingRule = {
    id: 1,
    userId: 1,
    name: "Default",
    description: null,
    fontFamily: "Inter",
    fontSize: 12,
    lineHeight: "1.50" as any,
    headingStyles: DEFAULT_HEADING_STYLES,
    pageSize: "A4",
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    headerText: null,
    footerText: null,
    codeBlockStyles: DEFAULT_CODE_BLOCK_STYLES,
    tableStyles: DEFAULT_TABLE_STYLES,
    pageBreakBeforeHeadings: "h1",
    preventOrphanHeadings: 1,
    keepCodeBlocksTogether: 1,
    isPreset: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should convert basic markdown to HTML", async () => {
    const markdown = "# Hello World\n\nThis is a paragraph.";
    const html = await markdownToHtml(markdown, mockFormattingRule);

    expect(html).toContain("<h1");
    expect(html).toContain("Hello World");
    expect(html).toContain("<p");
    expect(html).toContain("This is a paragraph");
  });

  it("should handle bold and italic text", async () => {
    const markdown = "**bold** and *italic* text";
    const html = await markdownToHtml(markdown, mockFormattingRule);

    expect(html).toContain("<strong>");
    expect(html).toContain("bold");
    expect(html).toContain("<em>");
    expect(html).toContain("italic");
  });

  it("should handle code blocks", async () => {
    const markdown = "```\nconst x = 1;\n```";
    const html = await markdownToHtml(markdown, mockFormattingRule);

    expect(html).toContain("<pre");
    expect(html).toContain("<code");
    expect(html).toContain("const x = 1");
  });

  it("should handle inline code", async () => {
    const markdown = "Use `const x = 1` in your code";
    const html = await markdownToHtml(markdown, mockFormattingRule);

    expect(html).toContain("<code");
    expect(html).toContain("const x = 1");
  });

  it("should handle lists", async () => {
    const markdown = "- Item 1\n- Item 2\n- Item 3";
    const html = await markdownToHtml(markdown, mockFormattingRule);

    expect(html).toContain("<ul");
    expect(html).toContain("<li>");
    expect(html).toContain("Item 1");
    expect(html).toContain("Item 2");
    expect(html).toContain("Item 3");
  });

  it("should handle blockquotes", async () => {
    const markdown = "> This is a quote";
    const html = await markdownToHtml(markdown, mockFormattingRule);

    expect(html).toContain("<blockquote");
    expect(html).toContain("This is a quote");
  });

  it("should handle links", async () => {
    const markdown = "[Google](https://google.com)";
    const html = await markdownToHtml(markdown, mockFormattingRule);

    expect(html).toContain("<a");
    expect(html).toContain("https://google.com");
    expect(html).toContain("Google");
  });

  it("should include proper HTML structure", async () => {
    const markdown = "# Test";
    const html = await markdownToHtml(markdown, mockFormattingRule);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("<head>");
    expect(html).toContain("<body>");
    expect(html).toContain("</html>");
  });

  it("should apply formatting rules to page size", async () => {
    const markdown = "# Test";
    const letterRule = { ...mockFormattingRule, pageSize: "Letter" };
    const html = await markdownToHtml(markdown, letterRule);

    expect(html).toContain("8.5in 11in");
  });

  it("should apply margins from formatting rules", async () => {
    const markdown = "# Test";
    const customRule = { ...mockFormattingRule, marginTop: 30, marginBottom: 25 };
    const html = await markdownToHtml(markdown, customRule);

    expect(html).toContain("30mm");
    expect(html).toContain("25mm");
  });

  it("should escape HTML special characters", async () => {
    const markdown = "This has & characters";
    const html = await markdownToHtml(markdown, mockFormattingRule);

    expect(html).toContain("&amp;");
  });

  it("should handle multiple headings with proper styling", async () => {
    const markdown = "# H1\n## H2\n### H3";
    const html = await markdownToHtml(markdown, mockFormattingRule);

    expect(html).toContain("<h1");
    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
    expect(html).toContain("font-size: 32px");
    expect(html).toContain("font-size: 24px");
    expect(html).toContain("font-size: 20px");
  });
});
