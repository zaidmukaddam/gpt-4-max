'use server'

import { redirect } from 'next/navigation'
import { getRemaining } from '@/lib/chat/ratelimit'
import { Customer } from '@lemonsqueezy/lemonsqueezy.js'

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getPortalUrl(customer_id: string) {
  const resp = await fetch(`https://api.lemonsqueezy.com/v1/customers/${customer_id}`, {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`
    }
  });

  const customer: Customer = await resp.json();

  return customer.data.attributes.urls.customer_portal
}

export async function getRemainingMessages() {
  const remaining = await getRemaining();
  return remaining
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}
