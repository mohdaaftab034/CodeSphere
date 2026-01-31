import { useState, useEffect, useRef } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Prism from "prismjs";

// Prism themes aur languages (Ensure these are in your project)
import "../styles/prism-vscode-dark.css";
// ... baki languages imports ...

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  defaultExpanded?: boolean;
}

export function CodeBlock({
  code,
  language = "javascript",
  title,
  showLineNumbers = true,
  defaultExpanded = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [highlightedCode, setHighlightedCode] = useState("");

  useEffect(() => {
    const highlighted = Prism.highlight(
      code,
      Prism.languages[language] || Prism.languages.javascript,
      language,
    );
    setHighlightedCode(highlighted);
  }, [code, language]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = highlightedCode.split("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative my-6 rounded-xl overflow-hidden bg-[#0d0d0e] border border-white/10 shadow-2xl"
    >
      {/* 1. Header Section */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          {/* Traffic Lights */}
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]/80 shadow-[0_0_8px_rgba(255,95,87,0.4)]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]/80" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]/80" />
          </div>

          <div className="flex items-center gap-2 text-white/50">
            <Code2 size={14} />
            <span className="text-[11px] font-medium tracking-wider uppercase font-mono">
              {title || `${language}.js`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/40"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className="relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 text-white/70"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -5, opacity: 0 }}
                  className="flex items-center gap-1.5 text-emerald-400"
                >
                  <Check size={14} />
                  <span>Done!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -5, opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Copy size={14} />
                  <span>Copy</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* 2. Code Content Area */}
      <motion.div
        animate={{ height: isExpanded ? "auto" : "0px" }}
        className="overflow-hidden relative"
      >
        <div className="relative overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse py-4">
            <tbody className="font-mono text-[13px] leading-[1.8]">
              {lines.map((line, index) => (
                <tr
                  key={index}
                  className="group/line hover:bg-white/[0.03] transition-colors"
                >
                  {showLineNumbers && (
                    <td className="w-10 text-right pr-4 select-none text-white/20 border-r border-white/5 group-hover/line:text-white/40 transition-colors">
                      {index + 1}
                    </td>
                  )}
                  <td className="pl-4 pr-6 py-0.5">
                    <code
                      className={`language-${language} block`}
                      dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subtle Bottom Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </motion.div>

      {/* 3. Collapsed Preview (Optional) */}
      {!isExpanded && (
        <div
          className="h-8 flex items-center justify-center bg-white/[0.02] cursor-pointer hover:bg-white/[0.04]"
          onClick={() => setIsExpanded(true)}
        >
          <span className="text-[10px] text-white/30 tracking-widest font-bold uppercase">
            Show Code
          </span>
        </div>
      )}
    </motion.div>
  );
}
