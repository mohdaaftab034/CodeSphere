import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import "./markdown-renderer.css"

interface MarkdownRendererProps {
  content: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-renderer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : "javascript"

            if (inline) {
              return (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              )
            }

            return (
              <div className="code-block-wrapper">
                <SyntaxHighlighter
                  language={language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    borderRadius: "6px",
                    fontSize: "13px",
                    lineHeight: "1.5",
                    maxWidth: "100%",
                    overflowX: "auto",
                  }}
                  showLineNumbers={true}
                  lineNumberStyle={{
                    color: "#858585",
                    paddingRight: "1.5rem",
                    userSelect: "none",
                  }}
                  wrapLongLines={false}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            )
          },
          h1: ({ node, children, ...props }) => (
            <h1 className="markdown-h1" {...props}>{children}</h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 className="markdown-h2" {...props}>{children}</h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="markdown-h3" {...props}>{children}</h3>
          ),
          h4: ({ node, children, ...props }) => (
            <h4 className="markdown-h4" {...props}>{children}</h4>
          ),
          h5: ({ node, children, ...props }) => (
            <h5 className="markdown-h5" {...props}>{children}</h5>
          ),
          h6: ({ node, children, ...props }) => (
            <h6 className="markdown-h6" {...props}>{children}</h6>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
