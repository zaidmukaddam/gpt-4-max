'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import Link from 'next/link'


export function PremiumDialog({
  ...props
}) {

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>You have reached the 60 repsonses limit!</DialogTitle>
          <DialogDescription>
            To continue chatting, you can purchase the Monthly Plan.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 space-y-1 text-sm border rounded-lg">
          <div className="font-medium">GPT-4 Max Monthly Plan</div>
          <div className="text-muted-foreground">
            GPT-4 Max Monthly give you access to unlimited usage of the tool.
          </div>
        </div>
        <DialogFooter className="items-center">
          <Link
            href={`/buy-license`}
          >
            Buy License
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
