"use server";

import { get } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";
import { isLocal } from "./lib/utils";

export const config = { matcher: ["/"] };

export async function middleware(request: NextRequest) {
  const maintenance = await get("maintenance");

  if (isLocal) return NextResponse.next();

  if (maintenance === true) {
    console.log("Maintenance mode is enabled");
    return NextResponse.redirect(new URL("/maintenance", request.url));
  } else {
    return NextResponse.next();
  }
}