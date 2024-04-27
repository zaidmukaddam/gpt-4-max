import React from 'react'

import { cn } from '@/lib/utils'
import { ExternalLink } from '@/components/external-link'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-zinc-500',
        className
      )}
      {...props}
    >
      AI chatbot built with{' '}
      <ExternalLink href="https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4">
        OpenAI&apos;s GPT-4 Turbo
      </ExternalLink>
      , <ExternalLink href="https://nextjs.org">Next.js</ExternalLink> and{' '}
      <ExternalLink href="https://github.com/vercel/ai">
        Vercel AI SDK
      </ExternalLink>
      .
    </p>
  )
}
