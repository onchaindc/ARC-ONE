import { NextRequest, NextResponse } from "next/server";

const registry = new Map<string, string>([
  ["onchaindc", "0x7adf4d8f71d1834b36df518a15d99661f267b8a2"],
  ["alex", "0x92ea28e4f39f4f52bc81b917fd1d7c9c90808c21"],
  ["merchant", "0xe4d33f5ccB30A7B0B92263f87e80A37F9f8E5166"]
]);

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username")?.replace(/^@/, "").toLowerCase();

  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  const address = registry.get(username);

  return NextResponse.json({
    username: `@${username}`,
    available: !address,
    address: address ?? null,
    network: "Arc Testnet"
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { username?: string; address?: string };
  const username = body.username?.replace(/^@/, "").toLowerCase();

  if (!username || !body.address) {
    return NextResponse.json({ error: "username and address are required" }, { status: 400 });
  }

  if (registry.has(username)) {
    return NextResponse.json({ error: "username already claimed" }, { status: 409 });
  }

  registry.set(username, body.address);

  return NextResponse.json({
    username: `@${username}`,
    address: body.address,
    status: "claimed"
  });
}
