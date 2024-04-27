import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
const gpt4maxRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(30, '1 d'),
  analytics: true,
  prefix: 'gpt4max_ratelimit'
})

export async function getIP() {
  const FALLBACK_IP_ADDRESS = '0.0.0.0'
  const forwardedFor = headers().get('x-forwarded-for')
 
  if (forwardedFor) {
    return forwardedFor.split(',')[0] ?? FALLBACK_IP_ADDRESS
  }
 
  return headers().get('x-real-ip') ?? FALLBACK_IP_ADDRESS
}

export async function rateLimit() {
  const limit = await gpt4maxRatelimit.limit(await getIP())
  if (!limit.success) {
    redirect('/waiting-room')
  }
}

export async function getRemaining() {
  const remaining = await gpt4maxRatelimit.getRemaining(await getIP())
  return remaining
}

export async function tryAgainIn() {
  const limit = await gpt4maxRatelimit.limit(await getIP())
  const diff = Math.abs(
    new Date(limit.reset).getTime() - new Date().getTime(),
  );
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor(diff / 1000 / 60) - hours * 60;
  return `${hours} hours and ${minutes} minutes`
}