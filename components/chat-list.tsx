import { UIState } from '@/lib/chat/actions-new'

export interface ChatList {
  messages: UIState
}

export function ChatList({ messages }: ChatList) {
  return messages.length ? (
    <div className="relative mx-auto max-w-2xl grid auto-rows-max gap-8 px-4">
      {messages.map(message => (
        <div key={message.id}>
          {message.display}
          {message.spinner}
          {message.attachments}
        </div>
      ))}
    </div>
  ) : null
}
