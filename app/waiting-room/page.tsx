'use server'

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { tryAgainIn } from '@/lib/chat/ratelimit'
import Link from "next/link"

export default async function Page() {
  const tryagainin = tryAgainIn()
  return (
    <div className="container mx-auto px-4 py-8 text-center space-y-6">
      <div>
        <h1 className="text-lg font-semibold mb-2">You are in the queue</h1>
        <p>Please try again in {tryagainin}.</p>
      </div>
      <p className="border-b border-black w-36 mx-auto"></p>
      <div className="flex flex-col mx-auto items-center justify-center text-center">
        <h1 className="text-lg font-semibold text-balance font-sans max-w-sm">
          Skip the queue and get unlimited access to GPT-4 Max with a Monthly Plan.
        </h1>
        <Button
          className="mt-4 items-center justify-center"
        >
          <Link href="/buy-license">
            Go Premium{" "}
          </Link>
          <ChevronRight size={18} className="ml-1" />
        </Button>
      </div>
    </div>
  )
}
