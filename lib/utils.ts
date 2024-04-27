import { clsx, type ClassValue } from 'clsx'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export const isLocal =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const json = await res.json()
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number
      }
      error.status = res.status
      throw error
    } else {
      throw new Error('An unexpected error occurred')
    }
  }

  return res.json()
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)

export const runAsyncFnWithoutBlocking = (
  fn: (...args: any) => Promise<any>
) => {
  fn()
}

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const getStringFromBuffer = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

export enum ResultCode {
  InvalidCredentials = 'INVALID_CREDENTIALS',
  InvalidSubmission = 'INVALID_SUBMISSION',
  UserAlreadyExists = 'USER_ALREADY_EXISTS',
  UnknownError = 'UNKNOWN_ERROR',
  UserCreated = 'USER_CREATED',
  UserLoggedIn = 'USER_LOGGED_IN'
}

export const getMessageFromCode = (resultCode: string) => {
  switch (resultCode) {
    case ResultCode.InvalidCredentials:
      return 'Invalid credentials!'
    case ResultCode.InvalidSubmission:
      return 'Invalid submission, please try again!'
    case ResultCode.UserAlreadyExists:
      return 'User already exists, please log in!'
    case ResultCode.UserCreated:
      return 'User created, welcome!'
    case ResultCode.UnknownError:
      return 'Something went wrong, please try again!'
    case ResultCode.UserLoggedIn:
      return 'Logged in!'
  }
}

export const weatherIconMappings: Record<string, string> = {
  '200': 'thunderstorm',
  '201': 'thunderstorm',
  '202': 'thunderstorm',
  '210': 'lightning',
  '211': 'lightning',
  '212': 'lightning',
  '221': 'lightning',
  '230': 'thunderstorm',
  '231': 'thunderstorm',
  '232': 'thunderstorm',
  '300': 'sprinkle',
  '301': 'sprinkle',
  '302': 'rain',
  '310': 'rain-mix',
  '311': 'rain',
  '312': 'rain',
  '313': 'showers',
  '314': 'rain',
  '321': 'sprinkle',
  '500': 'sprinkle',
  '501': 'rain',
  '502': 'rain',
  '503': 'rain',
  '504': 'rain',
  '511': 'rain-mix',
  '520': 'showers',
  '521': 'showers',
  '522': 'showers',
  '531': 'storm-showers',
  '600': 'snow',
  '601': 'snow',
  '602': 'sleet',
  '611': 'rain-mix',
  '612': 'rain-mix',
  '615': 'rain-mix',
  '616': 'rain-mix',
  '620': 'rain-mix',
  '621': 'snow',
  '622': 'snow',
  '701': 'showers',
  '711': 'smoke',
  '721': 'day-haze',
  '731': 'dust',
  '741': 'fog',
  '761': 'dust',
  '762': 'dust',
  '771': 'cloudy-gusts',
  '781': 'tornado',
  '800': 'day-sunny',
  '801': 'cloudy-gusts',
  '802': 'cloudy-gusts',
  '803': 'cloudy-gusts',
  '804': 'cloudy',
  '900': 'tornado',
  '901': 'storm-showers',
  '902': 'hurricane',
  '903': 'snowflake-cold',
  '904': 'hot',
  '905': 'windy',
  '906': 'hail',
  '957': 'strong-wind',
  '200d': 'day-thunderstorm',
  '201d': 'day-thunderstorm',
  '202d': 'day-thunderstorm',
  '210d': 'day-lightning',
  '211d': 'day-lightning',
  '212d': 'day-lightning',
  '221d': 'day-lightning',
  '230d': 'day-thunderstorm',
  '231d': 'day-thunderstorm',
  '232d': 'day-thunderstorm',
  '300d': 'day-sprinkle',
  '301d': 'day-sprinkle',
  '302d': 'day-rain',
  '310d': 'day-rain',
  '311d': 'day-rain',
  '312d': 'day-rain',
  '313d': 'day-rain',
  '314d': 'day-rain',
  '321d': 'day-sprinkle',
  '500d': 'day-sprinkle',
  '501d': 'day-rain',
  '502d': 'day-rain',
  '503d': 'day-rain',
  '504d': 'day-rain',
  '511d': 'day-rain-mix',
  '520d': 'day-showers',
  '521d': 'day-showers',
  '522d': 'day-showers',
  '531d': 'day-storm-showers',
  '600d': 'day-snow',
  '601d': 'day-sleet',
  '602d': 'day-snow',
  '611d': 'day-rain-mix',
  '612d': 'day-rain-mix',
  '615d': 'day-rain-mix',
  '616d': 'day-rain-mix',
  '620d': 'day-rain-mix',
  '621d': 'day-snow',
  '622d': 'day-snow',
  '701d': 'day-showers',
  '711d': 'smoke',
  '721d': 'day-haze',
  '731d': 'dust',
  '741d': 'day-fog',
  '761d': 'dust',
  '762d': 'dust',
  '781d': 'tornado',
  '800d': 'day-sunny',
  '801d': 'day-cloudy-gusts',
  '802d': 'day-cloudy-gusts',
  '803d': 'day-cloudy-gusts',
  '804d': 'day-sunny-overcast',
  '900d': 'tornado',
  '902d': 'hurricane',
  '903d': 'snowflake-cold',
  '904d': 'hot',
  '906d': 'day-hail',
  '957d': 'strong-wind',
  '200n': 'night-alt-thunderstorm',
  '201n': 'night-alt-thunderstorm',
  '202n': 'night-alt-thunderstorm',
  '210n': 'night-alt-lightning',
  '211n': 'night-alt-lightning',
  '212n': 'night-alt-lightning',
  '221n': 'night-alt-lightning',
  '230n': 'night-alt-thunderstorm',
  '231n': 'night-alt-thunderstorm',
  '232n': 'night-alt-thunderstorm',
  '300n': 'night-alt-sprinkle',
  '301n': 'night-alt-sprinkle',
  '302n': 'night-alt-rain',
  '310n': 'night-alt-rain',
  '311n': 'night-alt-rain',
  '312n': 'night-alt-rain',
  '313n': 'night-alt-rain',
  '314n': 'night-alt-rain',
  '321n': 'night-alt-sprinkle',
  '500n': 'night-alt-sprinkle',
  '501n': 'night-alt-rain',
  '502n': 'night-alt-rain',
  '503n': 'night-alt-rain',
  '504n': 'night-alt-rain',
  '511n': 'night-alt-rain-mix',
  '520n': 'night-alt-showers',
  '521n': 'night-alt-showers',
  '522n': 'night-alt-showers',
  '531n': 'night-alt-storm-showers',
  '600n': 'night-alt-snow',
  '601n': 'night-alt-sleet',
  '602n': 'night-alt-snow',
  '611n': 'night-alt-rain-mix',
  '612n': 'night-alt-rain-mix',
  '615n': 'night-alt-rain-mix',
  '616n': 'night-alt-rain-mix',
  '620n': 'night-alt-rain-mix',
  '621n': 'night-alt-snow',
  '622n': 'night-alt-snow',
  '701n': 'night-alt-showers',
  '711n': 'smoke',
  '721n': 'day-haze',
  '731n': 'dust',
  '741n': 'night-fog',
  '761n': 'dust',
  '762n': 'dust',
  '781n': 'tornado',
  '800n': 'night-clear',
  '801n': 'night-alt-cloudy-gusts',
  '802n': 'night-alt-cloudy-gusts',
  '803n': 'night-alt-cloudy-gusts',
  '804n': 'night-alt-cloudy',
  '900n': 'tornado',
  '902n': 'hurricane',
  '903n': 'snowflake-cold',
  '904n': 'hot',
  '906n': 'night-alt-hail',
  '957n': 'strong-wind'
}

export function convertToDate(
  timezone: number,
  dt: number,
  weekdayFormat: 'short' | 'long'
): string {
  let utc_time = new Date(dt * 1000)
  let local_time = new Date(utc_time.getTime() + timezone * 1000)

  const options = { weekday: weekdayFormat }
  const dateFormatter = new Intl.DateTimeFormat('UTC', options)

  return dateFormatter.format(local_time)
}

export function formatSunTimeWithAMPM(
  timestamp: number,
  timezoneOffset: number
): string {
  const date = new Date((timestamp + timezoneOffset) * 1000)
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
  return formattedTime
}