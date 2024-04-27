import 'server-only'

import {
    createAI,
    getMutableAIState,
    render,
    createStreamableValue
} from 'ai/rsc'
import OpenAI from 'openai'

import {
    BotCard,
    BotMessage
} from '@/components/stocks'

import { z } from 'zod'
import { nanoid } from '@/lib/utils'
import { SpinnerMessage } from '@/components/stocks/message'
import { format } from 'date-fns'
import { SearchResults } from '@/components/max/search-results'
import { experimental_streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai';
import { Temperature } from '@/components/max/temperature'
import { HourlyForecastData } from '@/lib/types'
import { CodeBlock } from '@/components/ui/codeblock'
import { Check, Cross, TerminalSquare } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { rateLimit } from './ratelimit'
import { SpinnerIcon } from '@/components/ui/icons'

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
})

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY ?? '',
    baseURL: 'https://api.groq.com/openai/v1',
});

const groqq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
})

const DAILY_SYSTEM_PROMPT = `
You are a weather chat bot and you can help users check weather conditions, step by step. You and the user can discuss weather forecasts for different locations, if the user doesn't select a city or region assume the user is asking about the weather in their current location (above).

The user just asked for the daily forecast for a specific location. You provided the user with the daily weather forecast for the next few days. DON'T RESPOND WITH ANY DATA, JUST WRITE A SUMMARY.

EXAMPLE: "Here's the daily forecast for the next few days in [location].
`
interface coordinates {
    latitude: string
    longitude: string
}


async function getDailyForecast({ latitude, longitude }: coordinates): Promise<HourlyForecastData> {
    console.log('Called getDailyForecast')

    const data = await fetch(
        `${process.env.OPEN_WEATHER_API_ENDPOINT}/api/daily_forecast?lat=${latitude}&lon=${longitude}`
    )

    if (!data.ok) throw new Error('Failed to fetch data')

    return data.json()
}

var imageHistory: any[] = []
var imageBase64Final: string[] = []

async function submitUserMessage(content: string, ispro?: boolean, imageBase64List?: { id: string, url: string }[]) {
    'use server'

    if (!ispro) await rateLimit();

    const aiState = getMutableAIState<typeof AI>()

    if (imageBase64List) {
        console.log('Entered imageBase64List')
        // imageBase64Final = imageBase64List!.map(image => image.url.split(',')[1])

        imageHistory = [
            ...imageHistory,
            ...imageBase64List!.map(image => ({
                id: nanoid(),
                role: 'user',
                content: [{
                    type: 'image_url',
                    image_url: image,
                }]
            }))
        ]
        console.log('imageHistory is created')
        console.log(imageHistory)
    }


    aiState.update({
        ...aiState.get(),
        messages: [
            ...aiState.get().messages,
            {
                id: nanoid(),
                role: 'user',
                content,
                data: {
                    images: imageBase64Final
                }
            }
        ]
    })

    let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
    let textNode: undefined | React.ReactNode
    let searchData: any[] = []

    const ui = render({
        model: 'gpt-4-turbo',
        provider: client,
        initial: <SpinnerMessage />,
        messages: [
            {
                role: 'system',
                content: `\
                You are a friendly assistant that helps the user with their needs. You are an expert in everything from being a excellent programmer to the best doctor/diagnostician. But always follow point 6 in the instructions You can browse the web and get weather information.
  
                The date today is ${format(new Date(), 'd LLLL, yyyy')}.
                
                The rules you have to follow at all costs are:
                1. Browse the web for latest information or whenever the user uses the word "search".
                2. Provide the user with the weather forecast when the user uses the word "weather".
                3. Answer any questions the user may have.
                4. You can also call the tools when reading images.
                5. If the user seems interested in buying or shopping, you should browse the web for the best deals.
                6. If you think something doesn't exist in your knowledge, you can perform a web search about it.
                7. Queries regarding the current date(and previous years too) should be research-based. eg. Search for 13th April.
                8. For any latex/katex or any expression which requires special rendering, you have to write wrap them around $$. Eg. $$x^2$$, $$\mathbf{F}{12}$$. Even if you write it in a middle of a sentence you should wrap it around $$ AT ALL COSTS!
                9. DO NOT FORGET POINT 8.
                10. To run python code use the code interpreter. always write a print statement at the end of the code to display the output.
                11. DO NOT WRITE ALL THE CODE IN THE CODE INTERPRETER. JUST WRITE THE CODE YOU WANT TO RUN. NOT ALL CODE REQUESTS ARE CODE INTERPRETER REQUESTS.`
            },
            ...imageHistory.map((image: any) => ({
                role: image.role,
                content: image.content,
            })),
            ...aiState.get().messages.map((message: any) => ({
                role: message.role,
                content: message.content,
                name: message.name,
            }))
        ],
        text: ({ content, done, delta }) => {
            if (!textStream) {
                textStream = createStreamableValue('')
                textNode = <BotMessage content={textStream.value} />
            }

            if (done) {
                textStream.done()
                aiState.done({
                    ...aiState.get(),
                    messages: [
                        ...aiState.get().messages,
                        {
                            id: nanoid(),
                            role: 'assistant',
                            content
                        }
                    ]
                })
            } else {
                textStream.update(delta)
            }

            return textNode
        },
        functions: {
            webSearch: {
                description: 'Search the web for information with the given query, max results and search depth.',
                parameters: z.object({
                    query: z.string()
                        .describe('The search query to look up on the web.'),
                    maxResults: z.number()
                        .describe('The maximum number of results to return. Default to be used is 10.'),
                    searchDepth: // use basic | advanced 
                        z.enum(['basic', 'advanced'])
                            .describe('The search depth to use for the search. Default is basic.')
                }),
                render: async function* ({ query, maxResults, searchDepth }) {
                    yield (
                        <BotMessage content={`Searching for ${query}...`} className='animate-pulse' />
                    )
                    console.log('Max Results:', maxResults)
                    const apiKey = process.env.TAVILY_API_KEY
                    const response = await fetch('https://api.tavily.com/search', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            api_key: apiKey,
                            query,
                            max_results: maxResults < 5 ? 5 : maxResults,
                            search_depth: searchDepth,
                            include_images: true,
                            include_answers: true
                        })
                    })


                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`)
                    }

                    var webdata = await response.json()

                    console.log('data:', webdata.results)

                    // data.results is an array but I want to store the content of each result in the same type of array
                    // so I can use it later to display the content of the search results
                    webdata.results.map((result: any) => {
                        searchData.push(result)
                    })

                    var searchContentAI = ''

                    await experimental_streamText({
                        model: groqq('llama3-70b-8192'),
                        system: `\
                        You are a search result explainer. You have to explain the search results to the user in a way that is easy to understand but in very breif manner.
                        Make at least 4-5 paragraphs of the search results. Each paragraph should be 3-4 lines long. 
                        `,
                        messages: [
                            {
                                role: 'assistant',
                                content: `Here are some search results for you based on the query: ${query}. Resuslts Content:\n\n ${webdata.results.map((result: { content: any; url: any }) => `${result.content} - ${result.url}`)}.`,
                            }
                        ]
                    }).then(
                        async (result) => {
                            try {
                                for await (const delta2 of result.fullStream) {
                                    const { type } = delta2

                                    if (type === 'text-delta') {
                                        const { textDelta } = delta2
                                        searchContentAI += textDelta
                                    } else if (type === 'finish') {
                                        console.log('Finished')
                                    }
                                }
                            } catch (e) {
                                console.error(e)
                            }
                        }
                    )

                    aiState.done({
                        ...aiState.get(),
                        messages: [
                            ...aiState.get().messages,
                            {
                                id: nanoid(),
                                role: 'function',
                                name: 'webSearch',
                                content: JSON.stringify({ webdata })
                            }
                        ]
                    })

                    return (
                        <BotCard showAvatar={false}>
                            <BotMessage content={searchContentAI} />
                            <SearchResults results={searchData} />
                        </BotCard>
                    )
                }
            },
            getWeather: {
                description: 'Get the current weather for a location.',
                parameters: z.object({
                    lat: z
                        .string()
                        .describe(
                            'The latitude of the location for which the weather map is to be displayed.'
                        ),
                    lon: z
                        .string()
                        .describe(
                            'The longitude of the location for which the weather map is to be displayed.'
                        )
                }),
                render: async function* ({ lat, lon }) {
                    yield (
                        <BotMessage content={`Gathering weather data...`} className='animate-pulse' />
                    )

                    const weatherdata = await getDailyForecast({ latitude: lat, longitude: lon })

                    const messages: any = [
                        { role: 'system', content: DAILY_SYSTEM_PROMPT },
                        ...aiState.get().messages.map((info: any) => ({
                            role: info.role,
                            content: info.content,
                            name: info.name
                        })),
                        {
                            role: 'function',
                            name: 'getWeather',
                            content: JSON.stringify({ weatherdata })
                        }
                    ]

                    const cast_exp = await groq.chat.completions.create({
                        model: 'llama3-8b-8192',
                        messages: messages,
                        functions: [
                            {
                                name: 'getWeather',
                                description: 'Get the current weather for a location.',
                                parameters: {
                                    type: 'object',
                                    properties: {
                                        lat: {
                                            type: 'string',
                                            description: 'The latitude of the location for which the weather map is to be displayed.'
                                        },
                                        lon: {
                                            type: 'string',
                                            description: 'The longitude of the location for which the weather map is to be displayed.'
                                        }
                                    }
                                }
                            }
                        ],
                    })

                    let content = cast_exp.choices[0].message.content ?? ""

                    aiState.update({
                        ...aiState.get(),
                        messages: [
                            ...aiState.get().messages,
                            {
                                id: nanoid(),
                                role: 'function',
                                name: 'getWeather',
                                content: JSON.stringify({ weatherdata })
                            }
                        ]
                    })

                    return (
                        <div>
                            <BotMessage content={content} />
                            <BotCard showAvatar={false}>
                                <Temperature data={weatherdata} />
                            </BotCard>
                        </div>
                    )
                }
            },
            codeInterpreter: {
                description: 'Runs Python code and can also run Python code with it&apos;s internal libraries.',
                parameters: z.object({
                    code: z.string()
                        .describe('The code snippet to interpret.')
                }),
                render: async function* ({ code }) {
                    yield (
                        <BotCard>
                            <CodeBlock value={code} language='python' key={Math.random()} tool={true} />
                            <Card className="p-3 md:p-4 w-full flex justify-between items-center">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <TerminalSquare className="size-4 shrink-0" />
                                    <h5 className="text-black text-base">
                                        Executing Code...
                                    </h5>
                                </div>
                                <SpinnerIcon />
                            </Card>
                        </BotCard>
                    )
                    const response = await fetch('https://interpreter.gpt4max.cc/run_code/', {
                        method: 'POST',
                        headers: {
                            accept: 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            code: code
                        })
                    })

                    if (!response.ok) {
                        return (
                            <BotCard>
                                <CodeBlock value={code} language='python' key={Math.random()} />
                                <Card className="p-3 md:p-4 w-full flex justify-between items-center">
                                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                                        <TerminalSquare className="size-4 shrink-0" />
                                        <h5 className="text-red text-base">
                                            Error executing code...
                                        </h5>
                                    </div>
                                    <Cross size={16} className="text-red-500 size-4" />
                                </Card>
                            </BotCard>
                        )
                    }

                    const data = await response.json()

                    console.log('data:', data)

                    const code_explanation = await groq.chat.completions.create({
                        model: 'llama3-70b-8192',
                        messages: [
                            {
                                role: 'system',
                                content: `You gave a piece which has now been executed. Now, your job is to take the user's input and talk about the output of the code. The user's input, the code's input and output are all in the chat.`
                            },
                            {
                                role: 'user',
                                content: content,
                            },
                            {
                                role: 'assistant',
                                content: code,
                            },
                            {
                                name: 'codeInterpreter',
                                role: 'function',
                                content: JSON.stringify({ result: data.result })
                            }
                        ],
                        functions: [
                            {
                                name: 'codeInterpreter',
                                description: 'Runs Python code and can also run Python code with it&apos;s internal libraries.',
                                parameters: {
                                    type: 'object',
                                    properties: {
                                        code: {
                                            type: 'string',
                                            description: 'The code snippet to interpret.'
                                        }
                                    }
                                }
                            }
                        ],
                        max_tokens: 400
                    })
                    aiState.done({
                        ...aiState.get(),
                        messages: [
                            ...aiState.get().messages,
                            {
                                id: nanoid(),
                                role: 'function',
                                name: 'codeInterpreter',
                                content: JSON.stringify({ result: data.result })
                            },
                            {
                                id: nanoid(),
                                role: 'assistant',
                                content: code_explanation.choices[0].message.content || ""
                            }
                        ]
                    })

                    return (
                        <BotCard>
                            <CodeBlock value={code} language='python' key={Math.random()} />
                            <Card className="p-3 md:p-4 w-full flex justify-between items-center mb-2">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <TerminalSquare className="size-4 shrink-0" />
                                    <h5 className="text-white text-base">
                                        {data.result}
                                    </h5>
                                </div>
                                <Check size={16} className="text-green-500 size-4" />
                            </Card>
                            <BotMessage content={code_explanation.choices[0].message.content || ""} />
                        </BotCard>
                    )
                }
            },
        }
    })

    return {
        id: nanoid(),
        display: ui
    }
}

export type Message = {
    role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
    content: string
    id: string
    name?: string
    data?: any
}

export type AIState = {
    chatId: string
    messages: Message[]
}

export type UIState = {
    id: string
    display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
    actions: {
        submitUserMessage,
    },
    initialUIState: [],
    initialAIState: { chatId: nanoid(), messages: [] },
})