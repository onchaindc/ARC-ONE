import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    amount?: string;
    settlementToken?: string;
    merchant?: string;
  };

  if (!body.amount) {
    return NextResponse.json({ error: "amount is required" }, { status: 400 });
  }

  const invoiceId = `arc_${crypto.randomUUID().slice(0, 8)}`;

  return NextResponse.json({
    invoiceId,
    merchant: body.merchant ?? "@merchant",
    amount: body.amount,
    payToken: "ETH",
    settlementToken: body.settlementToken ?? "USDC",
    checkoutUrl: `https://arc.one/pay/${invoiceId}`,
    qrPayload: `arc-one://pay/${invoiceId}`,
    status: "created",
    network: "Arc Testnet"
  });
}

export async function GET() {
  return NextResponse.json({
    invoices: [
      { id: "arc_demo_01", amount: "89.00", settlementToken: "USDC", status: "paid" },
      { id: "arc_demo_02", amount: "240.00", settlementToken: "USDC", status: "pending" }
    ]
  });
}
