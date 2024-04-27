import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import '@/app/globals.css'
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  metadataBase: new URL(`https://beta.gpt4max.cc`),
  title: {
    default: 'GPT-4 Max',
    template: `%s - GPT-4 MAX`
  },
  alternates: {
    canonical: 'https://beta.gpt4max.cc',
  },
  description:
    'GPT4MAX is a free AI chatbot app built with Next.js, the Vercel AI SDK, and OpenAI GPT-4 Turbo.',
  openGraph: {
    images: [
      {
        url: 'https://beta.gpt4max.cc/og.png',
        width: 1200,
        height: 630,
        alt: 'GPT4MAX - Free GPT-4 Turbo'
      }
    ]
  },
  twitter: {
    site: '@gpt4max',
    card: 'summary_large_image',
    images: [
      {
        url: 'https://beta.gpt4max.cc/og.png',
        width: 1200,
        height: 630,
        alt: 'GPT4MAX - Free GPT-4 Turbo'
      }
    ]
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'font-sans antialiased',
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <Toaster position="top-center" />
        <Providers
          attribute="class"
          defaultTheme="dark"
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex flex-col flex-1">
              {children}
            </main>
          </div>
          <TailwindIndicator />
        </Providers>
        <script async src="https://cdn.splitbee.io/sb.js" />
      </body>
    </html>
  )
}
