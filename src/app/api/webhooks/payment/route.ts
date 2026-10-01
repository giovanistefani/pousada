import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function tokensMatch(received: string, expected: string) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  const signature = request.headers.get("x-signature-token") ?? "";

  if (!secret || !signature || !tokensMatch(signature, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    event?: string;
    bookingId?: string;
    booking_id?: string;
    paymentId?: string;
    payment_id?: string;
  };

  const bookingId = payload.bookingId ?? payload.booking_id;
  if (payload.event !== "PAYMENT_CONFIRMED" || !bookingId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      payment_id: payload.paymentId ?? payload.payment_id ?? null,
      payment_method: "webhook",
    })
    .eq("id", bookingId)
    .in("status", ["pending_payment", "confirmed"]);

  if (error) {
    return NextResponse.json({ error: "Não foi possível confirmar o pagamento." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
