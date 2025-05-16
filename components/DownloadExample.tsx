'use client'

import { Download } from 'lucide-react'

interface DownloadExampleProps {
  href: string
  filename: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function DownloadExample({ 
  href, 
  filename, 
  children, 
  className = '',
  size = 'sm'
}: DownloadExampleProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  }

  return (
    <a
      href={href}
      download={filename}
      className={`
        flex items-center gap-1 bg-blue-500 text-white rounded 
        hover:bg-blue-600 transition-colors ${sizeClasses[size]} ${className}
      `}
    >
      <Download size={iconSizes[size]} />
      {children}
    </a>
  )
}
