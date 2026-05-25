import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const Schema = z.object({
  bookingId: z.string().uuid(),
  type: z.enum(["confirmation", "payment_receipt", "cancellation"]),
});

export const Route = createFileRoute("/api/notify")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          // Auth: require staff
          const authHeader = request.headers.get("authorization");
          if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
          const token = authHeader.slice(7);
          const { data: userData } = await supabaseAdmin.auth.getUser(token);
          if (!userData.user) return json({ error: "Unauthorized" }, 401);
          const { data: staff } = await supabaseAdmin
            .from("user_roles")
            .select("role")
            .eq("user_id", userData.user.id)
            .limit(1);
          if (!staff || staff.length === 0) return json({ error: "Forbidden" }, 403);

          const body = Schema.parse(await request.json());

          const { data: b, error } = await supabaseAdmin
            .from("bookings")
            .select("reference, guest_name, guest_email, guest_phone, check_in, check_out, num_guests, total_amount, status, rooms(name, room_number)")
            .eq("id", body.bookingId)
            .single();
          if (error || !b) return json({ error: "Booking not found" }, 404);

          const subjectMap: Record<string, string> = {
            confirmation: `Booking confirmed — ${b.reference}`,
            payment_receipt: `Payment received — ${b.reference}`,
            cancellation: `Booking cancelled — ${b.reference}`,
          };
          const subject = subjectMap[body.type];

          const html = renderEmail(b, body.type);
          const sms = renderSms(b, body.type);

          const results: Record<string, any> = {};

          // Email via Lovable Emails (best-effort)
          if (b.guest_email && process.env.LOVABLE_API_KEY) {
            try {
              const emailRes = await fetch("https://api.lovable.dev/v1/emails/send", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
                },
                body: JSON.stringify({
                  to: b.guest_email,
                  subject,
                  html,
                }),
              });
              results.email = { ok: emailRes.ok, status: emailRes.status };
            } catch (e: any) {
              results.email = { ok: false, error: e?.message };
            }
          } else {
            results.email = { skipped: true, reason: "no email or api key" };
          }

          // SMS — try Africa's Talking first (Kenya-friendly), then Twilio
          if (b.guest_phone) {
            const phone = normalizeKePhone(b.guest_phone);
            if (process.env.AT_API_KEY && process.env.AT_USERNAME) {
              try {
                const form = new URLSearchParams({
                  username: process.env.AT_USERNAME,
                  to: phone,
                  message: sms,
                });
                if (process.env.AT_SENDER_ID) form.set("from", process.env.AT_SENDER_ID);
                const r = await fetch("https://api.africastalking.com/version1/messaging", {
                  method: "POST",
                  headers: {
                    apiKey: process.env.AT_API_KEY,
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json",
                  },
                  body: form,
                });
                results.sms = { provider: "africastalking", ok: r.ok, status: r.status };
              } catch (e: any) {
                results.sms = { provider: "africastalking", ok: false, error: e?.message };
              }
            } else if (process.env.LOVABLE_API_KEY && process.env.TWILIO_API_KEY && process.env.TWILIO_FROM) {
              try {
                const r = await fetch("https://connector-gateway.lovable.dev/twilio/Messages.json", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
                    "X-Connection-Api-Key": process.env.TWILIO_API_KEY,
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: new URLSearchParams({
                    To: phone.startsWith("+") ? phone : `+${phone}`,
                    From: process.env.TWILIO_FROM,
                    Body: sms,
                  }),
                });
                results.sms = { provider: "twilio", ok: r.ok, status: r.status };
              } catch (e: any) {
                results.sms = { provider: "twilio", ok: false, error: e?.message };
              }
            } else {
              results.sms = { skipped: true, reason: "no SMS provider configured" };
            }
          } else {
            results.sms = { skipped: true, reason: "no phone" };
          }

          return json({ ok: true, results });
        } catch (e: any) {
          return json({ error: e?.message ?? "notify failed" }, 500);
        }
      },
    },
  },
});

function renderEmail(b: any, type: string) {
  const room = `${b.rooms?.name ?? ""} #${b.rooms?.room_number ?? ""}`;
  const heading =
    type === "payment_receipt"
      ? "Payment received"
      : type === "cancellation"
        ? "Booking cancelled"
        : "Booking confirmed";
  return `
  <div style="font-family:Arial,sans-serif;color:#222;max-width:600px;margin:0 auto;padding:24px;">
    <h2 style="color:#5a4632;margin:0 0 8px;">Peaks Hotel Nanyuki</h2>
    <h3 style="margin:0 0 16px;">${heading}</h3>
    <p>Dear ${b.guest_name},</p>
    <p>${
      type === "payment_receipt"
        ? `We have received your payment for booking <b>${b.reference}</b>. Asante sana!`
        : type === "cancellation"
          ? `Your booking <b>${b.reference}</b> has been cancelled.`
          : `Your booking <b>${b.reference}</b> is confirmed. We look forward to hosting you.`
    }</p>
    <table style="border-collapse:collapse;width:100%;margin-top:16px;">
      <tr><td style="padding:6px 0;color:#666;">Reference</td><td><b>${b.reference}</b></td></tr>
      <tr><td style="padding:6px 0;color:#666;">Room</td><td>${room}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Check-in</td><td>${b.check_in}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Check-out</td><td>${b.check_out}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Guests</td><td>${b.num_guests}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Total</td><td><b>KES ${Number(b.total_amount).toLocaleString()}</b></td></tr>
    </table>
    <p style="margin-top:24px;color:#666;font-size:12px;">Peaks Hotel Nanyuki · Mt Kenya, Nanyuki</p>
  </div>`;
}

function renderSms(b: any, type: string) {
  if (type === "payment_receipt")
    return `Peaks Hotel: Payment received for ${b.reference}. Total KES ${Number(b.total_amount).toLocaleString()}. Karibu!`;
  if (type === "cancellation")
    return `Peaks Hotel: Your booking ${b.reference} has been cancelled.`;
  return `Peaks Hotel: Booking ${b.reference} confirmed. Check-in ${b.check_in}. Karibu Nanyuki!`;
}

function normalizeKePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("7") || digits.startsWith("1")) return "254" + digits;
  return digits;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
