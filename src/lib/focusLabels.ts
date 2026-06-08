export const FOCUS_LABELS: Record<string, string> = {
  // Short-form keys (legacy)
  'Sell, negotiate & present':        'Sell & negotiate',
  'Business finances & compliance':   'Finances & compliance',
  'Finding customers & promotion':    'Finding customers',
  'Using AI to be productive':        'AI productivity',
  'Completing RFPs & Tenders':        'RFPs & Tenders',
  'Leadership, burnout & stress':     'Leadership & burnout',
  // Full n8n sentence labels
  'How to sell, negotiate and present my product or service': 'Sell & negotiate',
  'Understanding business finances, cashflow management or financial compliance': 'Finances & compliance',
  'Finding customers and promoting my business': 'Finding customers',
  'Using AI to be more productive and market my business': 'AI productivity',
  'Completing RFPs or Tenders': 'RFPs & Tenders',
  'How to lead my business or deal with burnout and stress': 'Leadership & burnout',
}

export function focusLabel(key: string): string {
  if (key === '(no category)') return 'Not selected yet'
  return FOCUS_LABELS[key] ?? (key.length > 35 ? key.slice(0, 33) + '…' : key)
}
