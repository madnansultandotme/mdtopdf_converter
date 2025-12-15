import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FileUp, Zap, Settings } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary"></div>
            <span className="font-bold text-lg">MDtoPDF</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/converter">
                  <Button variant="default">Converter</Button>
                </Link>
                <Button variant="outline">Profile</Button>
              </>
            ) : (
              <Button variant="default" onClick={() => window.location.href = getLoginUrl()}>
                {loading ? "Loading..." : "Sign In"}
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="container py-20 md:py-32 flex flex-col items-center text-center geometric-accent">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-black mb-6 text-balance">
              Markdown to PDF,
              <br />
              <span className="text-primary">Perfectly Formatted</span>
            </h1>
            <p className="subtitle text-lg mb-8 text-muted-foreground">
              Convert Markdown with deterministic, rule-driven PDF generation. Define your formatting rules once, get consistent output every time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/converter">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Converting
                  </Button>
                </Link>
              ) : (
                <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
                  Get Started Free
                </Button>
              )}
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-card border-t border-border py-20">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-16">Why MDtoPDF?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col items-start">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <FileUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Easy Input</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Upload .md files or paste Markdown directly. Full GitHub-flavored Markdown support with syntax highlighting.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-start">
                <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Formatting Rules</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Configure typography, layout, margins, headers/footers, and Markdown-specific rules. Save and reuse configurations.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-start">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-2">Deterministic Output</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  AST-based rendering ensures consistent, predictable PDF generation every single time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to convert?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Start converting your Markdown files to beautifully formatted PDFs in seconds.
          </p>
          {isAuthenticated ? (
            <Link href="/converter">
              <Button size="lg">Open Converter</Button>
            </Link>
          ) : (
            <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
              Sign In to Get Started
            </Button>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 MDtoPDF. Built with precision for developers and technical writers.</p>
        </div>
      </footer>
    </div>
  );
}
