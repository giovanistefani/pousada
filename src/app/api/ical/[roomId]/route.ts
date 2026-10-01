import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function tokensMatch(received: string, expected: string) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function icalDate(iso: string) {
  return iso.slice(0, 10).replaceAll("-", "");
}

export async function GET(
  request: Request,
  context: { params: Promise<{ roomId: string }> },
) {
  const secret = process.env.ICAL_FEED_SECRET;
  const token = new URL(request.url).searchParams.get("token") ?? "";

  if (!secret || !token || !tokensMatch(token, secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { roomId } = await context.params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id, check_in, check_out, status")
    .eq("room_id", roomId)
    .in("status", ["pending_payment", "confirmed", "checked_in"]);

  if (error) {
    return new Response("Não foi possível gerar o calendário.", { status: 500 });
  }

  const events = (data ?? [])
    .map((booking) => {
      const checkIn = String(booking.check_in);
      const checkOut = String(booking.check_out);
      return [
        "BEGIN:VEVENT",
        `UID:${booking.id}@pousada-villa-serena`,
        `DTSTART;VALUE=DATE:${icalDate(checkIn)}`,
        `DTEND;VALUE=DATE:${icalDate(checkOut)}`,
        "SUMMARY:Ocupado",
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pousada Villa Serena//Reservas//PT",
    "CALSCALE:GREGORIAN",
    events,
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
