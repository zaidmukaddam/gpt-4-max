import { NextRequest } from "next/server";
import { get } from "@vercel/edge-config";

export async function GET(request: NextRequest) {
  const maintenance = await get("maintenance");

  if (maintenance === true) {
    return new Response("We're under maintenance.", { status: 503 });
  }

  return new Response("OK", { status: 200 });
}