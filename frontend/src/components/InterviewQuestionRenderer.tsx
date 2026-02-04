import { useMemo } from "react"
import { MarkdownRenderer } from "./MarkdownRenderer"

interface InterviewQuestionRendererProps {
  content: string
}

interface ContentBlock {
  type: "text" | "code"
  language?: string
  text: string
}

export function InterviewQuestionRenderer({ content }: InterviewQuestionRendererProps) {
  // Parse content into blocks (text and code)
  const blocks = useMemo(() => {
    const result: ContentBlock[] = []
    const lines = content.split("\n")
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      // Check if this is the start of a code block
      if (line.trim().startsWith("```")) {
        // Extract language (if specified)
        const languageMatch = line.match(/```(\w+)?/)
        const language = languageMatch?.[1] || "plaintext"

        // Find the closing backticks
        let codeContent = ""
        i++
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeContent += lines[i] + "\n"
          i++
        }

        if (codeContent.endsWith("\n")) {
          codeContent = codeContent.slice(0, -1)
        }

        result.push({
          type: "code",
          language,
          text: codeContent,
        })

        i++ // Skip closing backticks
      } else {
        // Collect text lines until we hit a code block
        let textContent = ""
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          textContent += lines[i] + "\n"
          i++
        }

        if (textContent.trim()) {
          result.push({
            type: "text",
            text: textContent.trim(),
          })
        }
      }
    }

    return result
  }, [content])

  return (
    <div className="space-y-4 w-full">
      {blocks.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">No content to display</div>
      ) : (
        blocks.map((block, idx) => {
          if (block.type === "text") {
            return (
              <div key={idx} className="prose dark:prose-invert max-w-none break-words w-full">
                <MarkdownRenderer content={block.text} />
              </div>
            )
          } else {
            // Code block
            return (
              <div key={idx} className="rounded-lg overflow-auto bg-card border border-border">
                <div className="bg-secondary px-4 py-2 text-xs font-mono text-muted-foreground">
                  {block.language}
                </div>
                <div className="overflow-x-auto">
                  <MarkdownRenderer
                    content={`\`\`\`${block.language}\n${block.text}\n\`\`\``}
                  />
                </div>
              </div>
            )
          }
        })
      )}
    </div>
  )
}
