import React from 'react'

function parseInline(text: string): React.ReactNode {
  const result: React.ReactNode[] = []
  let remaining = text
  let idx = 0

  while (remaining.length > 0) {
    if (remaining.startsWith('**')) {
      const end = remaining.indexOf('**', 2)
      if (end !== -1) {
        result.push(
          <strong key={idx++} className="font-semibold text-charcoal">
            {remaining.slice(2, end)}
          </strong>
        )
        remaining = remaining.slice(end + 2)
        continue
      }
    }

    if (remaining.startsWith('`')) {
      const end = remaining.indexOf('`', 1)
      if (end !== -1) {
        result.push(
          <code key={idx++} className="bg-surface px-1.5 py-0.5 rounded font-mono text-xs text-secondary">
            {remaining.slice(1, end)}
          </code>
        )
        remaining = remaining.slice(end + 1)
        continue
      }
    }

    if (remaining.startsWith('[')) {
      const te = remaining.indexOf('](')
      if (te !== -1) {
        const ue = remaining.indexOf(')', te + 2)
        if (ue !== -1) {
          result.push(
            <a key={idx++} href={remaining.slice(te + 2, ue)}
               target="_blank" rel="noopener noreferrer"
               className="text-primary hover:text-primary-hover underline">
              {remaining.slice(1, te)}
            </a>
          )
          remaining = remaining.slice(ue + 1)
          continue
        }
      }
    }

    const next = remaining.search(/\*\*|`|\[/)
    if (next === -1) { result.push(remaining); break }
    if (next === 0)  { result.push(remaining[0]); remaining = remaining.slice(1) }
    else             { result.push(remaining.slice(0, next)); remaining = remaining.slice(next) }
  }

  return result.length === 1 ? result[0] : <>{result}</>
}

export function MarkdownRenderer({ content }: { content: string }) {
  const lines  = content.split('\n')
  const nodes: React.ReactNode[] = []
  let i   = 0
  let key = 0
  const K = () => key++

  while (i < lines.length) {
    const raw  = lines[i]
    const line = raw.trim()

    if (!line) { i++; continue }

    // ── Code block ──────────────────────────────────────────
    if (line.startsWith('```')) {
      i++
      const codeLines: string[] = []
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++
      nodes.push(
        <pre key={K()} className="bg-charcoal-dark rounded-lg p-4 my-4 overflow-x-auto">
          <code className="text-white/85 font-mono text-xs leading-relaxed whitespace-pre">
            {codeLines.join('\n')}
          </code>
        </pre>
      )
      continue
    }

    // ── Headings ─────────────────────────────────────────────
    if (line.startsWith('### ')) {
      nodes.push(
        <h3 key={K()} className="font-heading font-semibold text-sm text-charcoal mt-6 mb-2">
          {parseInline(line.slice(4))}
        </h3>
      )
      i++; continue
    }
    if (line.startsWith('## ')) {
      nodes.push(
        <h2 key={K()} className="font-heading font-semibold text-base text-charcoal mt-8 mb-3 pb-2 border-b border-surface">
          {parseInline(line.slice(3))}
        </h2>
      )
      i++; continue
    }
    if (line.startsWith('# ')) {
      nodes.push(
        <h1 key={K()} className="font-heading font-bold text-xl text-charcoal mb-4">
          {parseInline(line.slice(2))}
        </h1>
      )
      i++; continue
    }

    // ── HR ───────────────────────────────────────────────────
    if (line === '---') {
      nodes.push(<hr key={K()} className="border-surface my-6" />)
      i++; continue
    }

    // ── Blockquote ────────────────────────────────────────────
    if (line.startsWith('> ')) {
      const bqLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        bqLines.push(lines[i].trim().slice(2))
        i++
      }
      nodes.push(
        <blockquote key={K()} className="border-l-4 border-primary/40 pl-4 py-2 my-4 bg-primary/5 rounded-r">
          {bqLines.map((l, j) => (
            <p key={j} className="font-body text-sm text-charcoal/70">{parseInline(l)}</p>
          ))}
        </blockquote>
      )
      continue
    }

    // ── Table ─────────────────────────────────────────────────
    if (line.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      const parseRow = (l: string) => l.split('|').slice(1, -1).map(c => c.trim())
      const isSep    = (l: string) => /^\|[-|: ]+\|$/.test(l)
      const data     = tableLines.filter(l => !isSep(l))
      const headers  = parseRow(data[0] ?? '')
      const rows     = data.slice(1).map(parseRow)
      nodes.push(
        <div key={K()} className="overflow-x-auto my-4 rounded-lg border border-surface">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-surface">
                {headers.map((h, j) => (
                  <th key={j} className="text-left font-heading font-semibold text-charcoal px-3 py-2 border-b border-surface-2 whitespace-nowrap">
                    {parseInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, j) => (
                <tr key={j} className={j % 2 === 0 ? 'bg-white' : 'bg-surface/30'}>
                  {row.map((cell, k) => (
                    <td key={k} className="font-body text-charcoal/75 px-3 py-2 border-b border-surface/40 align-top">
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // ── Checklist ─────────────────────────────────────────────
    if (line.startsWith('- [')) {
      const items: Array<{ checked: boolean; text: string }> = []
      while (i < lines.length && lines[i].trim().startsWith('- [')) {
        const l = lines[i].trim()
        items.push({ checked: l.startsWith('- [x]') || l.startsWith('- [X]'), text: l.slice(6) })
        i++
      }
      nodes.push(
        <ul key={K()} className="my-3 space-y-2">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2.5 font-body text-sm text-charcoal/80">
              <span className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                item.checked ? 'bg-primary border-primary text-white' : 'border-surface-2 bg-white'
              }`}>
                {item.checked ? '✓' : ''}
              </span>
              <span>{parseInline(item.text)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    // ── Bullet list ───────────────────────────────────────────
    if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('- ') && !lines[i].trim().startsWith('- [')) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      nodes.push(
        <ul key={K()} className="my-2 space-y-1.5">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 font-body text-sm text-charcoal/80">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    // ── Ordered list (handles 1. 2. 5b. 5c. etc.) ─────────────
    if (/^\d+[a-c]?\.\s/.test(line)) {
      const items: Array<{ num: string; text: string }> = []
      while (i < lines.length && /^\d+[a-c]?\.\s/.test(lines[i].trim())) {
        const m = lines[i].trim().match(/^(\d+[a-c]?)\.\s(.*)/)
        if (m) items.push({ num: m[1], text: m[2] })
        i++
      }
      nodes.push(
        <ol key={K()} className="my-3 space-y-3">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 font-body text-sm text-charcoal/80">
              <span className="mt-0.5 min-w-[22px] h-[22px] rounded bg-primary text-white text-[10px] font-heading font-semibold flex-shrink-0 flex items-center justify-center px-1">
                {item.num}
              </span>
              <span className="flex-1">{parseInline(item.text)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }

    // ── Paragraph ─────────────────────────────────────────────
    const pLines: string[] = []
    const isBlock = (l: string) =>
      !l || l.startsWith('#') || l.startsWith('```') || l.startsWith('|') ||
      l.startsWith('> ') || l.startsWith('- ') || l === '---' || /^\d+[a-c]?\.\s/.test(l)

    while (i < lines.length && !isBlock(lines[i].trim())) {
      pLines.push(lines[i].trim())
      i++
    }
    if (pLines.length > 0) {
      nodes.push(
        <p key={K()} className="font-body text-sm text-charcoal/80 my-2 leading-relaxed">
          {parseInline(pLines.join(' '))}
        </p>
      )
    }
  }

  return <div>{nodes}</div>
}
