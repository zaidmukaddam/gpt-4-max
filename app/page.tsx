import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions-new'
import { getMissingKeys } from './actions'

export default async function IndexPage() {
  const id = nanoid()
  const missingKeys = await getMissingKeys()

  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <AI initialAIState={{ chatId: id, messages: [] }}>
        <Chat id={id} missingKeys={missingKeys} />
      </AI>
    </div>
  )
}
