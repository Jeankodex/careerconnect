
// app/api/debug-env/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hash: process.env.ADMIN_PASSWORD_HASH,
    length: process.env.ADMIN_PASSWORD_HASH?.length,
  });
}