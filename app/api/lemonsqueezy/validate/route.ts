import { configureLemonSqueezy } from '@/lib/config/lemonsqueezy';
import { validateLicense } from '@lemonsqueezy/lemonsqueezy.js'
import type { ValidateLicense } from '@lemonsqueezy/lemonsqueezy.js'

export const dynamic = 'force-dynamic';
export const runtime = "edge";

type FetchResponse<T> = {
    statusCode: number | null;
    data: T | null;
    error: Error | null;
};

export async function POST(req: Request) {
    configureLemonSqueezy();

    const { key } = await req.json();

    const response: FetchResponse<ValidateLicense> = await validateLicense(key);
    const subscription: ValidateLicense | null = response.data;

    if (subscription && subscription.license_key.status === 'active') {
        return Response.json({ 
            activated: subscription.valid, 
            customer_name: subscription.meta.customer_name, 
            key: subscription.license_key,
            customer_id: subscription.meta.customer_id
        });
    } else {
        return Response.json({ error: 'Subscription not found' });
    }
}