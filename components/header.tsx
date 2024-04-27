/* eslint-disable @next/next/no-img-element */
import * as React from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Xlogo
} from '@/components/ui/icons'
import Image from 'next/image'
import { PlusIcon } from '@radix-ui/react-icons'

async function UserOrLogin() {
  return (
    <>
      <Link href="/new" rel="nofollow" className='flex flex-row items-center justify-center'>
        <h1 className='text-2xl font-semibold'>
          GPT-4 Max
        </h1>
      </Link>
    </>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 shrink-0 dark:bg-black">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button asChild size="sm" variant="ghost">
          <a
            target="_blank"
            href="https://x.com/zaidmukaddam"
            rel="noopener noreferrer"
          >
            <Xlogo />
            <span className="hidden ml-2 md:flex">Developer</span>
          </a>
        </Button>
        <Button asChild size="sm" className="rounded-lg gap-1">
          <Link href="/new">
            <PlusIcon className="size-3" />
            <span className="hidden sm:block">New Chat</span>
            <span className="sm:hidden">New Chat</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}
