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
            Orbie n8n WhatsApp bot · setup guide &amp; node map · v1.1.2
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

        <div className="mt-8 p-5 bg-surface/50 rounded-xl border border-surface-2">
          <p className="font-heading font-semibold text-xs text-charcoal mb-1">
            Keeping docs in sync with n8n
          </p>
          <p className="font-body text-xs text-charcoal/60 mb-3">
            This page fetches <code className="bg-surface px-1 rounded font-mono">public/orbie-docs.md</code> at
            runtime. To update it, replace that file and redeploy. For fully automatic sync when you save the
            workflow in n8n, store the markdown in Supabase and have an n8n HTTP Request node upsert it on workflow
            save — then update this component to read from Supabase instead.
          </p>
          <ol className="space-y-2">
            {[
              'In Supabase SQL editor: CREATE TABLE workflow_docs (key text primary key, content text, updated_at timestamptz default now());',
              'Grant SELECT to authenticated, and INSERT/UPDATE to your service role.',
              'In n8n, add an HTTP Request node to POST the markdown content to the Supabase REST API (Authorization: Bearer [service key]) whenever you export/save the workflow.',
              'Update WorkflowDocs.tsx to call supabase.from("workflow_docs").select("content").eq("key","orbie").single() instead of fetch.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 font-body text-xs text-charcoal/60">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-semibold flex-shrink-0 flex items-center justify-center">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Layout>
  )
}
