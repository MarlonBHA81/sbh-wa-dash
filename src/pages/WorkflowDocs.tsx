import { useState, useEffect } from 'react'
import { Layout } from '../components/layout/Layout'
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer'
import { Spinner } from '../components/ui/Spinner'

export function WorkflowDocs() {
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/orbie-docs.md')
      .then(r => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
        return r.text()
      })
      .then(setContent)
      .catch((e: Error) => setError(e.message))
  }, [])

  return (
    <Layout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="font-heading font-semibold text-2xl text-charcoal mb-1">
            Workflow Documentation
          </h1>
          <p className="font-body text-sm text-charcoal/50">
          Orbie n8n WhatsApp bot · team reference guide · v2.2.0
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 font-body text-sm text-red-600">
            Could not load documentation: {error}
          </div>
        )}

        {!content && !error && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {content && (
          <div className="bg-white rounded-xl border border-surface p-6 md:p-8">
            <MarkdownRenderer content={content} />
          </div>
        )}

      </div>
    </Layout>
  )
}
