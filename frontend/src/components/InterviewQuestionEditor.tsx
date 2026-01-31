import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Eye, Edit2 } from "lucide-react"
import { Button } from "./ui/button"
import { InterviewQuestionRenderer } from "./InterviewQuestionRenderer"

interface InterviewQuestionEditorProps {
  initialContent?: string
  onChange: (content: string) => void
}

export function InterviewQuestionEditor({ initialContent = "", onChange }: InterviewQuestionEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")

  const handleChange = (newContent: string) => {
    setContent(newContent)
    onChange(newContent)
  }

  // Parse content to show block count
  const blockInfo = useMemo(() => {
    const codeBlockMatches = content.match(/```[\s\S]*?```/g) || []
    return {
      codeBlocks: codeBlockMatches.length,
      totalLength: content.length,
    }
  }, [content])

  return (
    <div className="w-full space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "edit"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Edit Tab */}
      {activeTab === "edit" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              Write your answer using text and code blocks. Code blocks are automatically detected using triple backticks:
            </p>
            <code className="block bg-secondary p-2 rounded text-xs mb-2">
              ```javascript{"\n"}
              {"const code = 'here'"}
              {"\n"}```
            </code>
            <p className="text-xs">
              <strong>Detected:</strong> {blockInfo.codeBlocks} code block{blockInfo.codeBlocks !== 1 ? "s" : ""} •{" "}
              {blockInfo.totalLength} characters
            </p>
          </div>

          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Write your answer here. Use triple backticks for code blocks:

This is text content explaining the answer...

\`\`\`javascript
const example = "code block";
console.log(example);
\`\`\`

More explanation text here...`}
            className="w-full min-h-96 p-4 rounded-xl bg-secondary border border-border font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </motion.div>
      )}

      {/* Preview Tab */}
      {activeTab === "preview" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 rounded-xl bg-secondary/30 border border-border min-h-96"
        >
          {content ? (
            <InterviewQuestionRenderer content={content} />
          ) : (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              <p>No content to preview. Start editing to see the preview here.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
