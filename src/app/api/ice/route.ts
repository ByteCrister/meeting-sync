// For App Router
// File: /app/api/ice/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const o = { format: "urls" };
  const bodyString = JSON.stringify(o);

  const auth = Buffer.from(`${process.env.ICE_IDENT}:${process.env.ICE_SECRET}`).toString("base64");

  const URL = `https://global.xirsys.net/_turn/${process.env.ICE_CHANNEL}`
  const res = await fetch(`${URL}`, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      "Content-Length": bodyString.length.toString(),
    },
    body: bodyString,
  });

  const iceData = await res.json();
  return NextResponse.json(iceData);
}
