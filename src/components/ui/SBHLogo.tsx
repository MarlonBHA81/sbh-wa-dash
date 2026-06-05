interface SBHLogoProps {
  variant?: 'color' | 'white'
  className?: string
}

export function SBHLogo({ variant = 'color', className = '' }: SBHLogoProps) {
  const isWhite = variant === 'white'
  const teal    = isWhite ? '#FFFFFF' : '#4e8a88'
  const plum    = isWhite ? '#FFFFFF' : '#683f59'
  const text    = isWhite ? '#FFFFFF' : '#484851'

  return (
    <svg
      viewBox="0 0 186 46"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Small Business Helpdesk"
      fill="none"
    >
      {/* Outer ring — teal */}
      <circle cx="23" cy="23" r="21" stroke={teal} strokeWidth="3" />
      {/* Inner ring — plum */}
      <circle cx="23" cy="23" r="14" stroke={plum} strokeWidth="2.5" />
      {/* Badge label */}
      <text
        x="23" y="27"
        textAnchor="middle"
        fontFamily="Poppins, system-ui, sans-serif"
        fontSize="10"
        fontWeight="600"
        fill={text}
      >
        sbh
      </text>

      {/* Wordmark */}
      <text
        x="54" y="19"
        fontFamily="Poppins, system-ui, sans-serif"
        fontSize="13"
        fontWeight="400"
        fill={text}
        letterSpacing="0.01em"
      >
        small business
      </text>
      <text
        x="54" y="35"
        fontFamily="Poppins, system-ui, sans-serif"
        fontSize="13"
        fontWeight="400"
        fill={text}
        letterSpacing="0.01em"
      >
        helpdesk
      </text>
    </svg>
  )
}
