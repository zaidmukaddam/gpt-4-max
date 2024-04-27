'use client'

import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { Message } from '@/lib/chat/actions'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'

import { cn } from '@/lib/utils'
import api from "@/lib/api/config";
import { useAIState, useUIState } from 'ai/rsc'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  missingKeys: string[]
  remaining?: number | undefined
}

export function Chat({ id, className, missingKeys, remaining }: ChatProps) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [messages] = useUIState()
  const [aiState] = useAIState()
  const [ispro, setPro] = useState(false)
  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  
  useEffect(() => {
    const ispro = localStorage.getItem('ispro');
    if (ispro === "true") {
      setPro(true);
    }
  }
  , [ispro])

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    const key = localStorage.getItem('gpt4maxkey');
    const ispro = localStorage.getItem('ispro');
    if (ispro === "true") {
      setPro(true);
    }
    if (remaining === 0 && ispro === "false") {
      window.location.href = '/pro';
    } else if (!key) {
      setPro(false);
      localStorage.setItem('ispro', "false");
    } else if (ispro === "false") {
      setPro(false);
      localStorage.setItem('ispro', "false");
    } else if (remaining === 0 ) {
      window.location.href = '/pro';
    }
    const fetchData = async () => {
      const getAccess = await fetch('/api/lemonsqueezy/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: key }),
      });
      const res = await getAccess.json();
      if (!res.activated) {
        window.location.href = '/activate';
      } else if (res.activated) {
        setPro(true);
        localStorage.setItem('ispro', "true");
        localStorage.setItem('customer_id', res.customer_id);
      }
    };
    if (key && ispro) {
      fetchData();
    }
  }, [ispro, remaining])

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px] dark:bg-black/20 dark:text-white"
      ref={scrollRef}
    >
      <div className={cn('pb-[200px] pt-4', className)} ref={messagesRef}>
        {messages.length ? (
          <ChatList messages={messages} />
        ) : (
          <EmptyScreen remaining={remaining} ispro={ispro} />
        )
        }
        <div className="h-px w-full" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
        ispro={ispro}
      />
    </div>
  )
}
