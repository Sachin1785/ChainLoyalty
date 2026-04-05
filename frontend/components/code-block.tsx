'use client'

import { useEffect, useRef } from 'react'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.textContent = code
      hljs.highlightElement(codeRef.current)
    }
  }, [code])

  return (
    <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/5 min-h-[500px] flex flex-col">
      <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-b border-white/5 sticky top-0 z-10">
        <span className="text-xs font-semibold text-white/80 tracking-wider">{language.toUpperCase()}</span>
        <span className="text-xs text-white/40">Code</span>
      </div>
      <pre className="overflow-auto flex-1 p-6">
        <code
          ref={codeRef}
          className={`language-${language} text-sm font-mono text-white whitespace-pre block`}
        >
          {code}
        </code>
      </pre>
    </div>
  )
}
