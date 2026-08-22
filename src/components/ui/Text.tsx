interface TextProps {
  children: React.ReactNode
  className?: string
}

export function Label({ children, className = '' }: TextProps) {
  return (
    <label className={`text-gray-700 text-base font-medium ${className}`}>
      {children}
    </label>
  )
}

export function Text({ children, className = '' }: TextProps) {
  return (
    <p className={`text-gray-700 text-base ${className}`}>
      {children}
    </p>
  )
}

export function Caption({ children, className = '' }: TextProps) {
  return (
    <span className={`text-gray-600 text-sm ${className}`}>
      {children}
    </span>
  )
}
