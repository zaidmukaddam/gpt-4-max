'use client'
// Description

// Current Time and Location: The top left shows that it is currently Sunday, 3:17:40 AM in Copenhagen.
// Current Temperature: A large numeral '7°' indicates the current temperature in Copenhagen, with a smaller note stating that the high is 7° and the low is 6°. It's cloudy.

// **Weather Summary Panel**: This component combines both the current time and temperature information. It displays that it's Sunday, 3:17:40 AM in Copenhagen, and the current weather condition is cloudy with a temperature of 7°C, highlighting a daily high of 7°C and a low of 6°C.

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { HourlyForecastData, HourlyForecastResponse } from '@/lib/types'
import Clock from '@/components/ui/clock'
import { convertToDate, formatSunTimeWithAMPM } from '@/lib/utils'
import IconComponent from '@/components/ui/icon-component'
import React from 'react'

interface TemperatureProps {
  data: HourlyForecastData
}

export function Temperature({ data }: TemperatureProps) {
  const initial = new Date()

  return (
    <div className="flex flex-row gap-2 h-[70%] mt-1">
      <Card className="flex flex-col justify-between overflow-hidden w-[70%] sm:w-full p-4">
        <div>
          <div className="flex sm:flex-row flex-col justify-between text-lg font-semibold">
            <span>
              {convertToDate(data.timezone, data.dt, 'long')}
            </span>
            <Clock initial={initial} timezone={data.timezone} />
          </div>
          <div className="text-md mt-2 flex">
            <span>{data.name}</span>
            <i>
              <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-0.5 mt-1 size-4 fill-none stroke-black"
              >
                <path
                  d="M7.39993 6.32003L15.8899 3.49003C19.6999 2.22003 21.7699 4.30003 20.5099 8.11003L17.6799 16.6C15.7799 22.31 12.6599 22.31 10.7599 16.6L9.91993 14.08L7.39993 13.24C1.68993 11.34 1.68993 8.23003 7.39993 6.32003Z"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.1101 13.6501L13.6901 10.0601"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </i>
          </div>
        </div>
        <div className="flex justify-center py-7 text-5xl md:py-10">
          {Math.round(data.main.temp)}&deg;
        </div>
        <div className="flex flex-row justify-between items-center">
          <div>
            <div className="font-semibold">{data.weather[0].main}</div>
            <div className="flex gap-2 dark:text-neutral-500">
              <span>H: {Math.round(data.main.temp_max)}&deg;</span>
              <span>L: {Math.round(data.main.temp_min)}&deg;</span>
            </div>
          </div>

          <IconComponent
            weatherCode={data.weather[0].id}
            className="size-9"
          />
        </div>
      </Card>

      <div className="flex flex-col gap-2 w-[50%]">
        <Card className="flex h-48 w-full flex-col justify-between">
          <CardHeader>
            <CardTitle className='flex flex-row gap-1 opacity-75 text-xs sm:text-base'>
              <i>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
                </svg>
              </i>
              Feels like
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-3 flex items-center justify-center font-bold text-base sm:text-lg">
            <p>{Math.floor(data.main.feels_like)}&deg;</p>
          </CardContent>
          <CardFooter className='sm:text-xs text-[10px]'>
            <p>
              {data.main.feels_like < data.main.temp
                ? 'Feels colder than the actual temperature.'
                : data.main.feels_like > data.main.temp
                  ? 'Feels warmer than the actual temperature.'
                  : 'Feels like the actual temperature.'}
            </p>
          </CardFooter>
        </Card>
        <Card className="flex h-48 w-full flex-col justify-between">
          <CardHeader>
            <CardTitle className='flex flex-row gap-1 opacity-75'>
              <i>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4 text-white"
                >
                  <path
                    d="M18.4802 12.25C18.7602 12.25 19.0002 12.01 18.9802 11.73C18.7102 8.11 15.6902 5.25 12.0002 5.25C8.31019 5.25 5.29021 8.1 5.02021 11.73C5.00021 12.01 5.24021 12.25 5.52021 12.25H18.4802Z"
                    fill="white"
                  />
                  <path
                    d="M22 13H21.92C21.37 13 20.92 12.55 20.92 12C20.92 11.45 21.37 11 21.92 11C22.47 11 22.96 11.45 22.96 12C22.96 12.55 22.55 13 22 13ZM2.08002 13H2C1.45 13 1 12.55 1 12C1 11.45 1.45 11 2 11C2.55 11 3.03998 11.45 3.03998 12C3.03998 12.55 2.63002 13 2.08002 13ZM19.01 5.99001C18.75 5.99001 18.5 5.89 18.3 5.7C17.91 5.31 17.91 4.67999 18.3 4.28999L18.43 4.16C18.82 3.77 19.45 3.77 19.84 4.16C20.23 4.55 20.23 5.18001 19.84 5.57001L19.71 5.7C19.52 5.89 19.27 5.99001 19.01 5.99001ZM4.98999 5.99001C4.72999 5.99001 4.48003 5.89 4.28003 5.7L4.15002 5.57001C3.76002 5.18001 3.76002 4.55 4.15002 4.16C4.54002 3.77 5.17 3.77 5.56 4.16L5.69 4.28999C6.08 4.67999 6.08 5.31 5.69 5.7C5.5 5.89 5.23999 5.99001 4.98999 5.99001ZM12 3.03999C11.45 3.03999 11 2.63 11 2.08V2C11 1.45 11.45 1 12 1C12.55 1 13 1.45 13 2C13 2.55 12.55 3.03999 12 3.03999Z"
                    fill="white"
                  />
                  <path
                    opacity="0.4"
                    d="M20 15.75H4C3.59 15.75 3.25 15.41 3.25 15C3.25 14.59 3.59 14.25 4 14.25H20C20.41 14.25 20.75 14.59 20.75 15C20.75 15.41 20.41 15.75 20 15.75Z"
                    fill="white"
                  />
                  <path
                    opacity="0.4"
                    d="M18 18.75H6C5.59 18.75 5.25 18.41 5.25 18C5.25 17.59 5.59 17.25 6 17.25H18C18.41 17.25 18.75 17.59 18.75 18C18.75 18.41 18.41 18.75 18 18.75Z"
                    fill="white"
                  />
                  <path
                    opacity="0.4"
                    d="M15 21.75H9C8.59 21.75 8.25 21.41 8.25 21C8.25 20.59 8.59 20.25 9 20.25H15C15.41 20.25 15.75 20.59 15.75 21C15.75 21.41 15.41 21.75 15 21.75Z"
                    fill="white"
                  />
                </svg>
              </i>
              Sunset
            </CardTitle>
          </CardHeader>
          <CardContent className='font-bold text-lg'>
            <p>{formatSunTimeWithAMPM(data.sys.sunset, data.timezone)}</p>
          </CardContent>
          <CardFooter>
            <p>
              Sunrise:{' '}
              {formatSunTimeWithAMPM(data.sys.sunrise, data.timezone)}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}