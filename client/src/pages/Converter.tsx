import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye, Settings, Upload, Trash2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Converter() {
  const { user } = useAuth();
  const [markdown, setMarkdown] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("editor");

  const generatePdfMutation = trpc.converter.generatePdf.useMutation({
    onSuccess: (data) => {
      setPdfUrl(data.pdfUrl);
      setActiveTab("preview");
      toast.success("PDF generated successfully!");
    },
    onError: (error) => {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF: " + (error.message || "Unknown error"));
    },
  });

  const handleGeneratePDF = () => {
    if (!markdown || !user) {
      toast.error("Please add Markdown content first");
      return;
    }

    generatePdfMutation.mutate({
      markdown,
      fontFamily: "Inter",
      fontSize: 12,
      lineHeight: 1.5,
      pageSize: "A4",
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 20,
      marginRight: 20,
    });
  };

  const handleDownloadPDF = () => {
    if (!pdfUrl) return;

    // For data URLs, we need to convert to blob and download
    if (pdfUrl.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("PDF downloaded!");
    }
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
    setPdfUrl(null);
    toast.success("Content cleared");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Converter</h1>
            <p className="text-sm text-muted-foreground">Convert Markdown to PDF with custom formatting</p>
          </div>
          <Button 
            onClick={handleGeneratePDF} 
            disabled={!markdown || generatePdfMutation.isPending} 
            size="lg"
          >
            {generatePdfMutation.isPending ? "Generating..." : "Generate PDF"}
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
                <TabsTrigger value="preview" disabled={!pdfUrl}>
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="mt-4">
                <Card className="flex flex-col h-[600px] overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between gap-2 p-4 border-b border-border bg-background/50">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".md,.markdown,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4" />
                            Upload .md
                          </span>
                        </Button>
                      </label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleClear}
                        disabled={!markdown}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {markdown.length} characters
                    </div>
                  </div>

                  {/* Editor */}
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
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <div className="text-center">
                        <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">PDF Preview (HTML representation)</p>
                        <p className="text-xs text-muted-foreground mb-4">
                          This shows the HTML structure that will be converted to PDF
                        </p>
                        <Button onClick={handleDownloadPDF} variant="default">
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-8 text-center h-[600px] flex items-center justify-center">
                    <div>
                      <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Generate a PDF to see the preview</p>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Formatting Rules Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5" />
                <h2 className="font-bold text-lg">Formatting</h2>
              </div>

              <div className="space-y-4">
                {/* Page Size */}
                <div>
                  <label className="block text-sm font-medium mb-2">Page Size</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                    <option>A4</option>
                    <option>Letter</option>
                  </select>
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                    <option>Inter</option>
                    <option>Georgia</option>
                    <option>Times New Roman</option>
                    <option>Courier New</option>
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium mb-2">Base Font Size</label>
                  <input
                    type="number"
                    min="8"
                    max="20"
                    defaultValue="12"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>

                {/* Line Height */}
                <div>
                  <label className="block text-sm font-medium mb-2">Line Height</label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    step="0.1"
                    defaultValue="1.5"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>

                {/* Margins */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-medium text-sm mb-3">Margins (mm)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Top</label>
                      <input
                        type="number"
                        min="0"
                        defaultValue="20"
                        className="w-full px-2 py-1 border border-border rounded text-sm bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Bottom</label>
                      <input
                        type="number"
                        min="0"
                        defaultValue="20"
                        className="w-full px-2 py-1 border border-border rounded text-sm bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Left</label>
                      <input
                        type="number"
                        min="0"
                        defaultValue="20"
                        className="w-full px-2 py-1 border border-border rounded text-sm bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Right</label>
                      <input
                        type="number"
                        min="0"
                        defaultValue="20"
                        className="w-full px-2 py-1 border border-border rounded text-sm bg-background"
                      />
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                {pdfUrl && (
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="w-full gap-2 mt-6"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
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
