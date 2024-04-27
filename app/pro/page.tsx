"use client";

import { Check, PanelTopCloseIcon } from "lucide-react"
import Link from "next/link"
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react';
import { getPortalUrl } from "../actions";

export default function Component() {
    const [key, setKey] = useState<string | undefined>("");
    const [portal, setPortal] = useState("");
    useEffect(() => {
        const customer_id = localStorage.getItem('customer_id');
        const localKey = localStorage.getItem('gpt4maxkey');
        if(localKey) setKey(localKey!.toString());
        const fetchPortal = async () => {
            const portalR = await getPortalUrl(customer_id!);
            if (portalR) {
                setPortal(portalR!.toString());
            } else {
                setPortal("/")
            }
        }
        fetchPortal();
    }, [portal])
    return (
        <section key="1" className="w-full py-12 md:py-24 lg:py-32 overflow-auto">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">Simple Pricing</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Pay for what you use.</h2>
                        <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                            Upgrade your plan at any time. You&apos;re only billed for the time you&apos;re on the premium plan.
                        </p>
                    </div>
                </div>
                <div className="grid max-w-4xl gap-6 mx-auto items-start lg:grid-cols-1 lg:gap-12 mt-2">
                    {key === "" && (
                        <div className="flex flex-col gap-2 p-4 border rounded-xl border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50">
                            <h3 className="font-semibold">Free</h3>
                            <p className="text-sm">Limited no of responses per hour.</p>
                            <div className="text-2xl font-semibold">$0</div>
                            <div className="flex items-center gap-2">
                                <Check className="size-5 p-1 bg-green-400 rounded-full" />
                                <span>30 responses per day</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <PanelTopCloseIcon className="size-5 fill-red" />
                                <span>Limited customer support</span>
                            </div>
                            <Link
                                className="inline-flex h-8 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-xs font-medium shadow-sm w-full transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
                                href="/"
                            >
                                Current Plan
                            </Link>
                        </div>
                    )}
                    <div className="flex flex-col gap-2 p-4 border rounded-xl border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50">
                        <h3 className="font-semibold">Pro Monthly License</h3>
                        <p className="text-sm">Unimited nunber of responses.</p>
                        <div className="text-2xl font-semibold">$10/mo</div>
                        <div className="flex items-center gap-2">
                            <Check className="size-5 p-1 bg-green-400 rounded-full" />
                            <span>Unlimited usage and unlimited responses per month.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <PanelTopCloseIcon className="size-5 fill-red" />
                            <span>24/7 premium support</span>
                        </div>
                        {key === "" ?
                            (
                                <Link
                                    className="inline-flex h-8 items-center justify-center rounded-md bg-gray-900 px-8 text-xs font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                                    href={`/buy-license`}
                                >
                                    Buy License
                                </Link>
                            )
                            : (
                                <Link
                                    className="inline-flex h-8 items-center justify-center rounded-md bg-gray-900 px-8 text-xs font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                                    href={portal}
                                >
                                    Manage Subscription
                                </Link>
                            )
                        }
                    </div>
                </div>
            </div>
        </section>
    )
}
