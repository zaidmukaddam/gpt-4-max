// @ts-nocheck

/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import 'server-only'

import {
    createAI,
    createStreamableUI,
    getMutableAIState,
    createStreamableValue
} from 'ai/rsc'

import { BotCard, BotMessage } from '@/components/stocks'

import { nanoid } from '@/lib/utils'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat } from '../types'
import { format } from 'date-fns'
import { experimental_generateText, experimental_streamText } from 'ai'
import { openai } from 'ai/openai'
import { OpenAI } from 'openai'
import { z } from 'zod'
import { rateLimit } from './ratelimit'
import { SearchResults } from '@/components/max/search-results'
import { Temperature } from '@/components/max/temperature'
import { HourlyForecastData } from '@/lib/types'
import { CodeBlock } from '@/components/ui/codeblock'
import { Card } from '@/components/ui/card'
import { SpinnerIcon } from '@/components/ui/icons'
import { Check, Cross, TerminalSquare } from 'lucide-react'
import { anthropic } from '@ai-sdk/anthropic'
import Image from 'next/image'

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY ?? '',
    baseURL: 'https://api.groq.com/openai/v1',
});


async function getDailyForecast({ latitude, longitude }): Promise<HourlyForecastData> {
    console.log('Called getDailyForecast')

    const data = await fetch(
        `${process.env.OPEN_WEATHER_API_ENDPOINT}/api/daily_forecast?lat=${latitude}&lon=${longitude}`
    )

    if (!data.ok) throw new Error('Failed to fetch data')

    return data.json()
}

const DAILY_SYSTEM_PROMPT = `
You are a weather chat bot and you can help users check weather conditions, step by step. You and the user can discuss weather forecasts for different locations, if the user doesn't select a city or region assume the user is asking about the weather in their current location (above).

The user just asked for the daily forecast for a specific location. You provided the user with the daily weather forecast for the next few days. DON'T RESPOND WITH ANY DATA, JUST WRITE A SUMMARY.

The function details are given for context you cannot use them in your response. You cannot call the function in your response.

EXAMPLE: "Here's the daily forecast for the next few days in [location].
`

var imageHistory: any[] = []
var imageBase64Final: string[] = []

async function submitUserMessage(content: string, imageBase64List?: { id: string, url: string }[]) {
    'use server'

    const aiState = getMutableAIState()

    if (imageBase64List?.length > 0) {
        console.log('Entered imageBase64List')
        imageBase64Final = imageBase64List?.map(image => image.url.split(',')[1])

        imageHistory = [
            ...imageHistory,
            ...imageBase64Final.map(image => ({
                id: nanoid(),
                role: 'user',
                content: [{
                    type: 'image',
                    image: image,
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
                content: `${content}`,
                data: {
                    images: imageBase64Final
                }
            }
        ]
    })

    const history = aiState.get().messages.map(message => ({
        role: message.role,
        content: message.content,
        data: message.data
    }))

    console.log('history created')

    const textStream = createStreamableValue('')
    const spinnerStream = createStreamableUI(<SpinnerMessage />)
    const messageStream = createStreamableUI(null)
    const uiStream = createStreamableUI()
    var searchData: any[] = []

        ; (async () => {
            try {
                console.log('Entered try block')
                const result = await experimental_streamText({
                    model: openai.chat('gpt-4-turbo'),
                    temperature: 0.5,
                    tools: {
                        webSearch: {
                            description: 'Search the web for information.',
                            parameters: z.object({
                                query: z.string()
                                    .describe('The search query to look up on the web.'),
                                maxResults: z.number().optional().default(10)
                                    .describe('The maximum number of results to return.'),
                                searchDepth: // use basic | advanced 
                                    z.enum(['basic', 'advanced']).optional().default('basic')
                                        .describe('The search depth to use for the search.')
                            })
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
                            })
                        },
                        codeInterpreter: {
                            description: 'Runs Python code and can also run Python code with it&apos;s internal libraries.',
                            parameters: z.object({
                                code: z.string()
                                    .describe('The code snippet to interpret.')
                            })
                        }
                    },
                    system: `\
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
                    11. DO NOT WRITE ALL THE CODE IN THE CODE INTERPRETER. JUST WRITE THE CODE YOU WANT TO RUN. NOT ALL CODE REQUESTS ARE CODE INTERPRETER REQUESTS.
                    12. YOU CANNOUT PUT ANY COMMENTS IN THE CODE INTERPRETER. JUST THE CODE!
                    13. Python Libraries available: matplotlib-pyodide, six, cycler, pyparsing, packaging, kiwisolver, python-dateutil, pytz, fonttools, pillow, numpy, matplotlib, pandas.
                    14. Do not use plt.show() in the code interpreter. use plt.savefig('filename.png') to save the plot.`,
                    messages: [...imageHistory, ...history]
                })

                let textContent = ''
                spinnerStream.done(null)

                for await (const delta of result.fullStream) {
                    const { type } = delta

                    if (type === 'text-delta') {
                        const { textDelta } = delta

                        textContent += textDelta
                        messageStream.update(<BotMessage content={textContent} />)

                        aiState.done({
                            ...aiState.get(),
                            messages: [
                                ...aiState.get().messages,
                                {
                                    id: nanoid(),
                                    role: 'assistant',
                                    content: textContent
                                }
                            ]
                        })
                    } else if (type === 'tool-call') {
                        const { toolName, args } = delta

                        if (toolName === 'webSearch') {
                            const { query, maxResults, searchDepth } = args
                            uiStream.update(<BotMessage content={`Searching for ${query}...`} className='animate-pulse' />)

                            console.log('searching for:', query)
                            console.log('max results:', maxResults)
                            console.log('search depth:', searchDepth)

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

                            var data = await response.json()

                            console.log('data:', data.results)

                            // data.results is an array but I want to store the content of each result in the same type of array
                            // so I can use it later to display the content of the search results
                            data.results.map((result: any) => {
                                searchData.push(result)
                            })

                            var searchContentAI = ''

                            await experimental_streamText({
                                model: openai.chat('gpt-4-turbo'),
                                system: `\
                I found some search results for you based on the query: ${query}. Here are the top ${maxResults} results. 

                ${data.results.map(result => `${result.content} - ${result.url}`).join('\n\n')}

                Now, explain the content of the results to me.
                `,
                                messages: [
                                    {
                                        role: 'assistant',
                                        content: `Here are some search results for you based on the query: ${query}. Resuslts Content:\n\n ${data.results.map(result => `${result.content} - ${result.url}`)}.`,
                                        display: {
                                            name: 'webSearch',
                                            props: {
                                                query,
                                                maxResults,
                                                searchDepth
                                            }
                                        }
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
                                                uiStream.update(<BotMessage content={searchContentAI} />)
                                            } else if (type === 'finish') {
                                                console.log('Finished')
                                                uiStream.append(<SearchResults results={searchData} />)
                                            }
                                        }
                                    } catch (e) {
                                        console.error(e)
                                    }
                                }
                            )

                            aiState.done({
                                ...aiState.get(),
                                interactions: [],
                                messages: [
                                    ...aiState.get().messages,
                                    {
                                        id: nanoid(),
                                        role: 'assistant',
                                        content: `Here are some search results for you based on the query: ${query}. Resuslts Content:\n\n ${data.results.map(result => `${result.content} - ${result.url}`)}.`,
                                        display: {
                                            name: 'webSearch',
                                            props: {
                                                query,
                                                maxResults,
                                                searchDepth
                                            }
                                        }
                                    }
                                ]
                            })

                        } else if (toolName === 'getWeather') {
                            const { lat, lon } = args

                            console.log('lat:', lat)
                            console.log('lon:', lon)

                            uiStream.update(<BotMessage content={`Gathering weather data...`} className='animate-pulse' />)

                            const data = await getDailyForecast({ latitude: lat, longitude: lon })
                            const messages: any = [
                                { role: 'system', content: DAILY_SYSTEM_PROMPT },
                                ...aiState.get().messages.map((info: any) => ({
                                    role: info.role,
                                    content: info.content,
                                    name: info.name
                                })),
                                {
                                    role: 'function',
                                    name: 'show_daily_forecast',
                                    content: JSON.stringify({ data })
                                }
                            ]

                            const stream = await client.chat.completions.create({
                                model: 'llama3-70b-8192',
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

                            let content = stream.choices[0].message.content

                            uiStream.update(
                                <div>
                                    <BotMessage content={content} />
                                    <BotCard showAvatar={false}>
                                        <Temperature data={data} />
                                    </BotCard>
                                </div>
                            )
                        } else if (toolName === 'codeInterpreter') {
                            const { code } = args

                            uiStream.update(
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

                            const response = await fetch('http://localhost:8080/', {
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
                                throw new Error(`Error: ${response.status}`)
                            }

                            const data = await response.json()

                            console.log('data:', data)

                            if (data.error) {
                                uiStream.update(
                                    <BotCard>
                                        <CodeBlock value={code} language='python' key={Math.random()} />
                                        <Card className="p-3 md:p-4 w-full flex justify-between items-center">
                                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                <TerminalSquare className="size-4 shrink-0" />
                                                <h5 className="text-red text-base">
                                                    Error executing code...
                                                    {data.error.message}
                                                </h5>
                                            </div>
                                            <Cross size={16} className="text-red-500 size-4" />
                                        </Card>
                                    </BotCard>
                                )
                                aiState.update({
                                    ...aiState.get(),
                                    messages: [
                                        ...aiState.get().messages,
                                        {
                                            id: nanoid(),
                                            role: 'function',
                                            name: 'codeInterpreter',
                                            content: JSON.stringify({ error: data.error })
                                        },
                                        {
                                            id: nanoid(),
                                            role: 'assistant',
                                            content: `Error executing code: ${data.error.message}`
                                        }
                                    ]
                                })
                            }

                            var final_exp
                            if (data.output_files.length > 0) {
                                const output = data.output_files[0].b64_data
                                const code_haiku_exp = await experimental_generateText({
                                    model: anthropic('claude-3-haiku-20240307'),
                                    system: `You gave a code which has now been executed to result in an image output. Now, talk about the output of the code. The user's input, the code's input and output are all in the chat. You can also talk about the code's output in a fun and creative way.`,
                                    messages: [
                                        {
                                            role: "user",
                                            content: [
                                                {
                                                    type: "text",
                                                    text: content
                                                }
                                            ]
                                        },
                                        {
                                            role: 'assistant',
                                            content: code
                                        },
                                        {
                                            role: 'user',
                                            content: [
                                                {
                                                    type: "image",
                                                    image: output
                                                },
                                                {
                                                    type: "text",
                                                    text: "Output Image of the code."
                                                }
                                            ]
                                        }
                                    ]
                                })


                                final_exp = code_haiku_exp.text 
                                aiState.update({
                                    ...aiState.get(),
                                    messages: [
                                        ...aiState.get().messages,
                                        {
                                            id: nanoid(),
                                            role: 'assistant',
                                            content: code_haiku_exp.text || ""
                                        }
                                    ]
                                })
                            }
                            else {
                                const code_explanation = await client.chat.completions.create({
                                    model: 'llama3-70b-8192',
                                    messages: [
                                        {
                                            role: 'system',
                                            content: `You gave a piece of code which has now been executed and returned an output. Now, your job is to talk about the output of the code. The user's input, the code's input and output are all in the chat.`
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
                                            content: JSON.stringify({ code_out: data.std_out || data.final_expression  })
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
                                final_exp = code_explanation.choices[0].message.content 
                                aiState.update({
                                    ...aiState.get(),
                                    messages: [
                                        ...aiState.get().messages,
                                        {
                                            id: nanoid(),
                                            role: 'function',
                                            name: 'codeInterpreter',
                                            content: JSON.stringify({ result: data })
                                        },
                                        {
                                            id: nanoid(),
                                            role: 'assistant',
                                            content: code_explanation.choices[0].message.content || ""
                                        }
                                    ]
                                })
                            }
                            uiStream.update(
                                <BotCard>
                                    <CodeBlock value={code} language='python' key={Math.random()} />
                                    <Card className="p-3 md:p-4 w-full flex justify-between items-center mb-2">
                                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                                            <TerminalSquare className="size-4 shrink-0" />
                                            {data.output_files.length > 0 ? (
                                                <Image src={`data:image/png;base64,${data.output_files[0].b64_data}`} alt="Output Image" height={500} width={400} />
                                            ) : (
                                                <h5 className="text-white text-base">
                                                    {data.std_out || data.final_expression}
                                                </h5>
                                            )}
                                        </div>
                                        <Check size={16} className="text-green-500 size-4" />
                                    </Card>
                                    <BotMessage content={final_exp} />
                                </BotCard>
                            )
                        }
                    }
                }

                uiStream.done()
                textStream.done()
                messageStream.done()
            } catch (e) {
                console.error(e)

                const error = new Error(
                    'The AI got rate limited, please try again later.'
                )
                uiStream.error(error)
                textStream.error(error)
                messageStream.error(error)
                aiState.done()
            }
        })()

    return {
        id: nanoid(),
        attachments: uiStream.value,
        spinner: spinnerStream.value,
        display: messageStream.value
    }
}

export type Message = {
    role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
    content: string
    id?: string
    name?: string
    display?: {
        name: string
        props: Record<string, any>
    }
}

export type AIState = {
    chatId: string
    interactions?: string[]
    messages: Message[]
}

export type UIState = {
    id: string
    display: React.ReactNode
    spinner?: React.ReactNode
    attachments?: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
    actions: {
        submitUserMessage,
    },
    initialUIState: [],
    initialAIState: { chatId: nanoid(), interactions: [], messages: [] },
})

export const getUIStateFromAIState = (aiState: Chat) => {
    return aiState.messages
        .filter(message => message.role !== 'system')
        .map((message, index) => ({
            id: `${aiState.chatId}-${index}`,
            display:
                message.role === 'assistant' ? (
                    message.display?.name === 'searchWeb' ? (
                        <BotCard>
                            <SearchResults results={message.display.props.results} />
                        </BotCard>
                    ) : message.display?.name === 'getWeather' ? (
                        <BotCard>
                            <Temperature data={message.display.props.data} />
                        </BotCard>
                    ) : (
                        <BotMessage content={message.content} />
                    )
                ) : message.role === 'user' ? (
                    <UserMessage showAvatar>
                        {message.content}
                        {message.data?.images?.map((image: string, index: number) => (
                            <img key={index} src={`data:image/jpeg;base64,${image}`} />
                        ))}
                    </UserMessage>
                ) : (
                    <BotMessage content={message.content} />
                )
        }))
}