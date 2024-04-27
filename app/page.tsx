import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { getMissingKeys, getRemainingMessages } from './actions'

export default async function IndexPage() {
  const id = nanoid()
  const missingKeys = await getMissingKeys()
  const remaining = await getRemainingMessages()

  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <AI initialAIState={{ chatId: id, messages: [] }}>
        <Chat id={id} missingKeys={missingKeys} remaining={remaining} />
      </AI>
    </div>
  )
}
