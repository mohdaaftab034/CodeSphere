import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  BookmarkCheck,
  Bookmark,
  ArrowLeft,
  FileText,
  TrendingUp,
  Share2,
  Loader2,
  Maximize2,
  Info,
  Calendar,
  Layers,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { pdfsAPI, usersAPI } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export default function HandwrittenNotePDFPreviewPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [note, setNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [downloadCount, setDownloadCount] = useState<number>(0);

  useEffect(() => {
    if (note?.title) {
      document.title = `${note.title} | ${websiteName}`
    } else {
      document.title = `PDF Preview | ${websiteName}`
    }
  }, [note?.title, websiteName])

  useEffect(() => {
    const fetchNote = async () => {
      try {
        if (!id) return;
        const response = await pdfsAPI.getById(id);
        setNote(response.pdf);
        setDownloadCount(response.pdf.downloads || 0);

        if (token) {
          const savedResponse = await usersAPI.checkSaved(token, [], [id]);
          setIsSaved(savedResponse.savedPDFs?.[id] || false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNote();
  }, [id, token]);

  const handleSaveToggle = async () => {
    if (!token) return navigate("/login");
    try {
      if (isSaved) {
        await usersAPI.unsavePDF(token, id!);
        setIsSaved(false);
      } else {
        await usersAPI.savePDF(token, id!);
        setIsSaved(true);
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleDownload = () => {
    if (!note?.pdfUrl) {
      alert("PDF URL not available");
      return;
    }

    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = note.pdfUrl;
    link.download = `${note.title || "document"}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-background">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 pt-28 pb-20">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/handwritten-notes")}
            className="group text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Library
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* PDF VIEWER COLUMN */}
          <div className="flex-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Reader Toolbar */}
              <div className="bg-secondary/30 border-b border-border px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[200px] sm:max-w-md">
                      {note.title}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      PDF Reader
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="hidden sm:flex items-center gap-1">
                    <Layers className="w-4 h-4" /> {note.totalPages || "—"}{" "}
                    Pages
                  </span>
                  <Maximize2 className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
                </div>
              </div>

              {/* PDF Canvas */}
              <div className="relative bg-neutral-100 dark:bg-neutral-900 min-h-[500px] lg:h-[85vh] flex items-center justify-center">
                {note.pdfUrl ? (
                  <iframe
                    src={`${note.pdfUrl}#toolbar=0&navpanes=0`}
                    className="w-full h-full border-none shadow-inner"
                    title={note.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-8 text-center text-muted-foreground">
                    PDF preview is not available.
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* SIDEBAR INFO COLUMN */}
          <div className="w-full lg:w-[400px] space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-28 space-y-6"
            >
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="mb-6">
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-4 ${difficultyColors[note.level?.toLowerCase()] || "bg-secondary text-muted-foreground"}`}
                  >
                    {note.level || "Beginner"}
                  </div>
                  <h1
                    className="text-3xl font-bold tracking-tight mb-2"
                    style={{ fontFamily: "var(--font-cal-sans)" }}
                  >
                    {note.title}
                  </h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {note.description ||
                      "Master these concepts with our detailed handwritten guides."}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xl font-bold">{downloadCount}</span>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Downloads
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50">
                    <div className="flex items-center gap-2 text-foreground mb-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-bold">
                        {new Date(note.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Published
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleDownload}
                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-xl shadow-primary/10 transition-all active:scale-[0.98]"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleSaveToggle}
                      className={`h-12 rounded-xl border-border transition-all ${isSaved ? "bg-primary/5 border-primary text-primary" : ""}`}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 mr-2" />
                      ) : (
                        <Bookmark className="w-4 h-4 mr-2" />
                      )}
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 rounded-xl border-border"
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Help
                    </Button>
                  </div>
                </div>
              </div>

              {/* Trust/Quality Badge */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex items-start gap-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400">
                    Verified Content
                  </h4>
                  <p className="text-xs text-emerald-800/70 dark:text-emerald-500/70 leading-relaxed">
                    Checked for accuracy by senior developers. Includes diagrams
                    and interview tips.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
