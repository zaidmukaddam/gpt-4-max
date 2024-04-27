"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { toast } from 'sonner'


const formSchema = z.object({
  licensekey: z.string().min(36, {
    message: "License Key must be at least 36 characters.",
  }).regex(/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/, {
    message: "License Key must be in the format XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX."
  }),
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Email must be a valid email address.",
  }),
})


export default function Component() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licensekey: "",
      name: "",
      email: "",
    },
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('key');
    const email = urlParams.get('email');
    const name = urlParams.get('name');
    if (key) {
      form.setValue('licensekey', key)
    }
    if (email) {
      form.setValue('email', email)
    }
    if (name) {
      form.setValue('name', name)
    }
  }, [form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast(`${values.licensekey}`)
    const response = await fetch(`/api/lemonsqueezy/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        name: values.name,
        email: values.email,
        key: values.licensekey 
      }),
    })
    const data = await response.json()
    console.log(data)
    if (data.activated) {
      toast.success(`Welcome, ${data.customer_name}!`,
        {
          description: `License key activated successfully!`
        }
      )
      localStorage.setItem('gpt4maxkey', values.licensekey)
      localStorage.setItem('ispro', "true")
      localStorage.setItem('customer_id', data.customer_id)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      window.location.href = '/'
    } else {
      const activeRes = await fetch(`/api/lemonsqueezy/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: values.name,
          email: values.email,
          key: values.licensekey 
        }),
      })
      const activeData = await activeRes.json()
      console.log(activeData)

      if (activeData.activated) {
        toast.success(`Welcome, ${activeData.customer_name}!`,
          {
            description: `License key activated successfully!`
          }
        )
        localStorage.setItem('gpt4maxkey', values.licensekey)
        localStorage.setItem('ispro', "true")
        localStorage.setItem('customer_id', activeData.customer_id)
        await new Promise(resolve => setTimeout(resolve, 2000))
        window.location.href = '/'
      } else
        toast.error(`License key is invalid or expired!`,
          {
            description: `Please check the key and try again.\nThe key may also be expired in case of incomplete payment.`
          }
        )
    }
  }


  return (
    <div className="py-12 mx-auto flex size-full mb-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-xl space-y-4 w-full bg-zinc-50 dark:bg-neutral-900 p-12 rounded-2xl">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Activate License</h1>
          </div>
          <div className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormDescription className="flex flex-col">
                        <span>
                          Your name used to buy the license.
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter Your Email</FormLabel>
                      <FormControl>
                        <Input placeholder="test@email.com" {...field} />
                      </FormControl>
                      <FormDescription className="flex flex-col">
                        <span>
                          Your email used to buy the license.
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licensekey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter Your License Key</FormLabel>
                      <FormControl>
                        <Input placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" {...field} />
                      </FormControl>
                      <FormDescription className="flex flex-col">
                        <span>
                          Your license key used to buy the license.
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full" type="submit">Activate</Button>
              </form>
            </Form>
          </div>

        </div>
      </div>
    </div>
  )
}