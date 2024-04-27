'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { useActions, useUIState } from 'ai/rsc'
import { Cross2Icon } from '@radix-ui/react-icons'

import { UserMessage } from './stocks/message'
import { type AI } from '@/lib/chat/actions'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'

export function PromptForm({
  input,
  setInput,
  ispro
}: {
  input: string
  setInput: (value: string) => void
  ispro?: boolean
}) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()
  const [images, setImages] = React.useState<{ id: string, url: string }[]>([])

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const fileRef = React.useRef<HTMLInputElement>(null)

  const handleRemoveImage = (idToRemove: string) => {
    setImages(currentImages => currentImages.filter(image => image.id !== idToRemove));
  };
  return (
    <form
      ref={formRef}
      className='bg-zinc-100 sm:rounded-xl dark:bg-neutral-900'
      onSubmit={async (e: any) => {
        e.preventDefault()
        e.stopPropagation()

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        const value = input.trim()
        setInput('')
        setImages([])
        if (!value) return

        // Optimistically add user message UI
        setMessages(currentMessages => [
          ...currentMessages,
          {
            id: nanoid(),
            display:
              (
                <UserMessage>
                  {value}
                  {images?.length > 0 && (
                    <div className="flex space-x-2 mt-2">
                      {images.map(({ id, url }) => (
                        <div
                          key={id}
                          className="relative size-16 bg-cover bg-center rounded-lg m-1"
                          style={{ backgroundImage: `url(${url})` }}
                        >
                        </div>
                      ))}
                    </div>
                  )}
                </UserMessage>
              )
          }
        ])

        try {
          // Submit and get response message
          const responseMessage = await submitUserMessage(value, ispro, images.length > 0 ? images : undefined)
          setMessages(currentMessages => [...currentMessages, responseMessage])
        } catch {
          toast(
            <div className="text-red-600">
              You have reached your message limit! Please try again later.
            </div>
          )
        }
      }}
    >
      {images.length > 0 && (
        <div className="flex space-x-2 mt-2 ml-2">
          {images.map(({ id, url }) => (
            <div
              key={id}
              className="relative size-16 bg-cover bg-center rounded-lg m-1"
              style={{ backgroundImage: `url(${url})` }}
            >
              <button
                onClick={(event) => {
                  event.preventDefault(); // Prevent form submission
                  event.stopPropagation(); // Stop event bubbling
                  handleRemoveImage(id);
                }}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-white text-black border-[1.5px] border-gray-200"
                aria-label="Remove image"
              >
                <Cross2Icon />
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        type="file"
        multiple
        className="hidden"
        id="file"
        ref={fileRef}
        onChange={async event => {
          event.stopPropagation()
          event.preventDefault()

          if (!event.target.files) {
            toast.error('No file selected')
            return
          }

          const files = event.target.files

          // Filter out non-image files
          const imageFiles = Array.from(files).filter(file =>
            file.type.startsWith('image/')
          )

          // for iOS, we need to convert the image from heic to jpeg
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
          if (isIOS) {
            const promises = imageFiles.map(async file => {
              if (file.type === 'image/heic') {
                const blob = await fetch(URL.createObjectURL(file)).then(res =>
                  res.blob()
                )
                const newFile = new File([blob], file.name.replace(/\.heic$/, '.jpeg'), {
                  type: 'image/jpeg'
                })
                return newFile
              }
              return file
            })

            const newFiles = await Promise.all(promises)
            imageFiles.splice(0, imageFiles.length, ...newFiles)
          }
          
          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i]
            const reader = new FileReader()
            reader.readAsDataURL(file)

            reader.onloadend = () => {
              const base64String = reader.result as string
              setImages(currentImages => [...currentImages, { id: nanoid(), url: base64String }]);
            }
          }
        }}
      />

      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden px-12">
        {/* <Tooltip>
          <TooltipTrigger asChild> */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            fileRef.current?.click();
          }}
        >
          <IconPlus />
          <span className="sr-only">Add Images</span>
        </Button>
        {/* </TooltipTrigger>
          <TooltipContent>Add Images</TooltipContent>
        </Tooltip> */}
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message."
          className="min-h-[60px] w-full bg-transparent placeholder:text-zinc-900 dark:placeholder:text-zinc-50 resize-none px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute right-4 top-[13px] sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                disabled={input === ''}
                className="bg-transparent shadow-none text-zinc-950 rounded-full hover:bg-zinc-200 dark:text-zinc-50 dark:hover:bg-zinc-700"
              >
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className='dark:bg-zinc-700 dark:text-zinc-50'>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
