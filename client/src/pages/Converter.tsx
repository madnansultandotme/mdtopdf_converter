import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye, Settings, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Simple markdown to HTML converter
function markdownToHtml(markdown: string): string {
  let html = markdown
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headers
    .replace(/^###### (.+)$/gm, "<h6>$1</h6>")
    .replace(/^##### (.+)$/gm, "<h5>$1</h5>")
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Blockquotes
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr>")
    // Unordered lists
    .replace(/^\* (.+)$/gm, "<li>$1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Paragraphs (lines not already wrapped)
    .replace(/^(?!<[hpuolbcaq]|<li|<hr|<pre)(.+)$/gm, "<p>$1</p>")
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");

  return html;
}

interface FormattingOptions {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  pageSize: string;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

function generateStyledHtml(content: string, options: FormattingOptions): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: ${options.pageSize};
      margin: ${options.marginTop}mm ${options.marginRight}mm ${options.marginBottom}mm ${options.marginLeft}mm;
    }
    body {
      font-family: '${options.fontFamily}', sans-serif;
      font-size: ${options.fontSize}px;
      line-height: ${options.lineHeight};
      color: #333;
      max-width: 100%;
      padding: 20px;
    }
    h1 { font-size: 2em; font-weight: 700; margin: 1em 0 0.5em; }
    h2 { font-size: 1.5em; font-weight: 600; margin: 1em 0 0.5em; }
    h3 { font-size: 1.25em; font-weight: 600; margin: 1em 0 0.5em; }
    h4, h5, h6 { font-size: 1em; font-weight: 600; margin: 1em 0 0.5em; }
    p { margin: 0 0 1em; }
    code { 
      font-family: monospace; 
      background: #f5f5f5; 
      padding: 2px 6px; 
      border-radius: 3px; 
    }
    pre { 
      background: #f5f5f5; 
      padding: 12px; 
      border-radius: 4px; 
      overflow-x: auto; 
    }
    pre code { background: none; padding: 0; }
    blockquote { 
      border-left: 4px solid #ccc; 
      padding-left: 12px; 
      margin: 1em 0; 
      font-style: italic; 
      color: #666; 
    }
    ul, ol { margin: 0 0 1em 20px; }
    li { margin: 0.25em 0; }
    hr { border: none; border-top: 1px solid #ccc; margin: 2em 0; }
    a { color: #0066cc; }
  </style>
</head>
<body>${content}</body>
</html>`;
}

export default function Converter() {
  const [markdown, setMarkdown] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("editor");
  const [isGenerating, setIsGenerating] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [options, setOptions] = useState<FormattingOptions>({
    fontFamily: "Inter",
    fontSize: 12,
    lineHeight: 1.5,
    pageSize: "A4",
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  });

  const handleGeneratePDF = async () => {
    if (!markdown) {
      toast.error("Please add Markdown content first");
      return;
    }

    setIsGenerating(true);
    try {
      const htmlContent = markdownToHtml(markdown);
      const fullHtml = generateStyledHtml(htmlContent, options);
      
      // Create blob URL for preview
      const blob = new Blob([fullHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setActiveTab("preview");
      toast.success("Preview generated! Use browser print (Ctrl+P) to save as PDF");
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("Failed to generate preview");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfUrl || !iframeRef.current) {
      toast.error("Generate preview first");
      return;
    }
    
    // Trigger print dialog on iframe
    iframeRef.current.contentWindow?.print();
    toast.info("Use 'Save as PDF' in the print dialog");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setMarkdown(content);
      toast.success("File loaded successfully");
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setMarkdown("");
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    toast.success("Content cleared");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Markdown to PDF Converter</h1>
            <p className="text-sm text-muted-foreground">Convert Markdown to PDF with custom formatting</p>
          </div>
          <Button onClick={handleGeneratePDF} disabled={!markdown || isGenerating} size="lg">
            {isGenerating ? "Generating..." : "Generate Preview"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor and Preview Tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview" disabled={!pdfUrl}>Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="mt-4">
                <Card className="flex flex-col h-[600px] overflow-hidden">
                  <div className="flex items-center justify-between gap-2 p-4 border-b border-border bg-background/50">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input type="file" accept=".md,.markdown,.txt" onChange={handleFileUpload} className="hidden" />
                        <Button size="sm" variant="outline" className="gap-2" asChild>
                          <span><Upload className="w-4 h-4" />Upload .md</span>
                        </Button>
                      </label>
                      <Button size="sm" variant="outline" onClick={handleClear} disabled={!markdown} className="gap-2">
                        <Trash2 className="w-4 h-4" />Clear
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">{markdown.length} characters</div>
                  </div>
                  <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    placeholder="Enter your Markdown here... or upload a .md file"
                    className="flex-1 p-4 font-mono text-sm resize-none border-0 focus:outline-none bg-background text-foreground"
                  />
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                {pdfUrl ? (
                  <Card className="overflow-hidden bg-white h-[600px]">
                    <iframe ref={iframeRef} src={pdfUrl} className="w-full h-full border-0" title="PDF Preview" />
                  </Card>
                ) : (
                  <Card className="p-8 text-center h-[600px] flex items-center justify-center">
                    <div>
                      <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Generate a preview to see the result</p>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Formatting Options Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5" />
                <h2 className="font-bold text-lg">Formatting</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Page Size</label>
                  <select 
                    value={options.pageSize}
                    onChange={(e) => setOptions({...options, pageSize: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <select 
                    value={options.fontFamily}
                    onChange={(e) => setOptions({...options, fontFamily: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Base Font Size</label>
                  <input
                    type="number"
                    min="8"
                    max="20"
                    value={options.fontSize}
                    onChange={(e) => setOptions({...options, fontSize: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Line Height</label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    step="0.1"
                    value={options.lineHeight}
                    onChange={(e) => setOptions({...options, lineHeight: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="font-medium text-sm mb-3">Margins (mm)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Top</label>
                      <input type="number" min="0" value={options.marginTop} onChange={(e) => setOptions({...options, marginTop: Number(e.target.value)})} className="w-full px-2 py-1 border border-border rounded text-sm bg-background" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Bottom</label>
                      <input type="number" min="0" value={options.marginBottom} onChange={(e) => setOptions({...options, marginBottom: Number(e.target.value)})} className="w-full px-2 py-1 border border-border rounded text-sm bg-background" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Left</label>
                      <input type="number" min="0" value={options.marginLeft} onChange={(e) => setOptions({...options, marginLeft: Number(e.target.value)})} className="w-full px-2 py-1 border border-border rounded text-sm bg-background" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Right</label>
                      <input type="number" min="0" value={options.marginRight} onChange={(e) => setOptions({...options, marginRight: Number(e.target.value)})} className="w-full px-2 py-1 border border-border rounded text-sm bg-background" />
                    </div>
                  </div>
                </div>

                {pdfUrl && (
                  <Button onClick={handleDownloadPDF} variant="outline" className="w-full gap-2 mt-6">
                    <Download className="w-4 h-4" />Save as PDF (Print)
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
