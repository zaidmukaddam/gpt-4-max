import crypto from "node:crypto";
import { configureLemonSqueezy } from '@/lib/config/lemonsqueezy';

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function webhookHasMeta(obj: unknown): obj is {
    meta: {
        event_name: string;
    };
} {
    if (
        isObject(obj) &&
        isObject(obj.meta) &&
        typeof obj.meta.event_name === "string"
    ) {
        return true;
    }
    return false;
}

export async function POST(request: Request) {
    if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
        return new Response("Lemon Squeezy Webhook Secret not set in .env", {
            status: 500,
        });
    }

    configureLemonSqueezy();

    // First, make sure the request is from Lemon Squeezy.
    const rawBody = await request.text();
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signature = Buffer.from(
        request.headers.get("X-Signature") ?? "",
        "utf8",
    );

    if (!crypto.timingSafeEqual(digest, signature)) {
        return new Response("Invalid signature", { status: 400 });
    }

    const data = JSON.parse(rawBody);

    // Type guard to check if the object has a 'meta' property.
    if (webhookHasMeta(data)) {
        console.log("Webhook event:", data.meta.event_name);

        return new Response("OK", { status: 200 });
    }

    return new Response("Data invalid", { status: 400 });
}