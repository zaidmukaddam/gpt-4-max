import { ExternalLink } from '@/components/external-link'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'


export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-2xl bg-zinc-50 dark:shadow-xl dark:bg-transparent/10 border sm:p-8 p-4 text-sm sm:text-base text-center">
        <div className='flex flex-row mx-auto gap-1 items-center text-center justify-center'>
          <h1 className="text-2xl sm:text-3xl tracking-tight font-semibold dark:text-white">
            GPT-4 MAX
          </h1>
          <Badge variant="secondary" className='mb-2 tracking-tight'>Beta</Badge>
        </div>

        <p className="leading-normal text-zinc-900 dark:text-neutral-50">
          This is an AI chatbot app built with{' '}
          <ExternalLink href="https://nextjs.org">Next.js</ExternalLink>, the{' '}
          <ExternalLink href="https://sdk.vercel.ai">
            Vercel AI SDK
          </ExternalLink>
          , and{' '}
          <ExternalLink href="https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4">
            OpenAI&apos;s GPT-4 Turbo with Vision
          </ExternalLink>
          .
        </p>
      </div>
    </div>
  )
}
