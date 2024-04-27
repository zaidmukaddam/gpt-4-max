import { Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>


export type HourlyForecastData = {
  dt: number
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: {
    id: number
    main: string
    description: string
    icon: string
  }[]
  clouds: {
    all: number
  }
  wind: {
    speed: number
    deg: number
    gust: number
  }
  visibility: number
  pop: number
  rain?: {
    '1h': number
  }
  sys: {
    type: number
    id: number
    country: string
    sunrise: number
    sunset: number
  }
  dt_txt: string
  cod: number
  timezone: number
  name: string
  id: number
}

export type HourlyForecastResponse = {
  cod: string
  message: number
  cnt: number
  list: HourlyForecastData[]
  city: City
}

export type City = {
  id: number
  name: string
  coord: {
    lon: number
    lat: number
  }
  country: string
  population: number
  timezone: number
  sunrise: number
  sunset: number
}

type Weather = {
  id: number
  main: string
  description: string
  icon: string
}

export type MainF5 = {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  pressure: number
  humidity: number
  sea_level: number
  grnd_level: number
  temp_kf: number
}

export type Forecast = {
  dt: number
  main: MainF5
  weather: Weather[]
  clouds: {
    all: number
  }
  wind: {
    speed: number
    deg: number
    gust: number
  }
  visibility: number
  pop: number
  rain?: {
    '3h': number
  }
  sys: {
    pod: string
  }
  dt_txt: string
}

export type DailyForecastResponse = {
  city: City
  cod: string
  message: number
  cnt: number
  list: Forecast[]
}