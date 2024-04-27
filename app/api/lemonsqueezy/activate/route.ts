import { configureLemonSqueezy } from '@/lib/config/lemonsqueezy';
import { activateLicense } from '@lemonsqueezy/lemonsqueezy.js'
import type { ActivateLicense } from '@lemonsqueezy/lemonsqueezy.js'

export const dynamic = 'force-dynamic';
export const runtime = "edge";

type FetchResponse<T> = {
    statusCode: number | null;
    data: T | null;
    error: Error | null;
};

export async function POST(req: Request) {
    configureLemonSqueezy();

    const { name, email, key } = await req.json();
    try {
        const response: FetchResponse<ActivateLicense> = await activateLicense(key, name);
        const subscription: ActivateLicense | null = response.data;

        if (subscription && email === subscription.meta.customer_email) {
            return Response.json({ 
                activated: subscription.activated, 
                customer_name: subscription.meta.customer_name, 
                key: subscription.license_key,
                customer_id: subscription.meta.customer_id
            });
        } else {
            return Response.json({ 
                error: 'Subscription not found', 
                activated: false 
            });
        }
    }
    catch (error) {
        return Response.json({ error: "Subscription not found", activated: false });
    }
}