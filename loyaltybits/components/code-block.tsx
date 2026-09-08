'use client'

import { useEffect, useRef, useState } from 'react'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

interface CodeBlockProps {
  code: string
  language?: string
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.textContent = code
      hljs.highlightElement(codeRef.current)
    }
  }, [code])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{ background: '#0d1117', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          {language}
        </span>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy code'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 7, border: 'none',
            cursor: 'pointer', fontSize: 12, fontWeight: 500,
            transition: 'all 0.18s',
            background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
            color: copied ? '#4ade80' : 'rgba(255,255,255,0.50)',
            outline: 'none',
          }}
          onMouseEnter={e => {
            if (!copied) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
            }
          }}
          onMouseLeave={e => {
            if (!copied) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.50)'
            }
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Code */}
      <pre style={{ overflow: 'auto', flex: 1, padding: 24, margin: 0 }}>
        <code
          ref={codeRef}
          className={`language-${language}`}
          style={{ fontSize: 13, fontFamily: "'Geist Mono', monospace", whiteSpace: 'pre', display: 'block' }}
        >
          {code}
        </code>
      </pre>
    </div>
  )
}
