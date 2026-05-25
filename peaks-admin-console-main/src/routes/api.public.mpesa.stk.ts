import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getMpesaEnv, normalizePhone, stkPush } from "@/lib/mpesa";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const STKSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  phone: z.string().min(9, "Phone number is required"),
  amount: z.number().positive().max(1_000_000, "Amount exceeds maximum limit"),
});

// POST: Initiate M-Pesa STK push for a booking (public - no auth required)
export const Route = createFileRoute("/api/public/mpesa/stk")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const body = STKSchema.parse(await request.json());
          const { bookingId, phone, amount } = body;

          // Normalize phone number
          const normalizedPhone = normalizePhone(phone);

          // Get the booking
          const { data: booking, error: bErr } = await supabaseAdmin
            .from("bookings")
            .select("id, reference, guest_name, guest_email, status")
            .eq("id", bookingId)
            .single();

          if (bErr || !booking) {
            return json({ ok: false, error: "Booking not found" }, 404);
          }

          // Check booking status
          if (booking.status === "confirmed") {
            return json({ ok: false, error: "Booking is already paid" }, 400);
          }

          if (booking.status === "cancelled") {
            return json({ ok: false, error: "Booking has been cancelled" }, 400);
          }

          // Build callback URL from request origin
          const origin = new URL(request.url).origin;
          const callbackUrl = `${origin}/api/mpesa/callback`;

          // Get M-Pesa environment configuration
          const env = getMpesaEnv();

          // Initiate STK push
          const stk = await stkPush({
            env,
            phone: normalizedPhone,
            amount,
            accountReference: booking.reference,
            description: `Peaks Hotel Booking ${booking.reference}`.slice(0, 20),
            callbackUrl,
          });

          // Store the M-Pesa transaction
          await supabaseAdmin.from("mpesa_transactions").insert({
            booking_id: booking.id,
            phone: normalizedPhone,
            amount,
            environment: env,
            merchant_request_id: stk.MerchantRequestID,
            checkout_request_id: stk.CheckoutRequestID,
            status: "pending",
          });

          return json({
            ok: true,
            checkoutRequestId: stk.CheckoutRequestID,
            customerMessage: stk.CustomerMessage || "STK push sent to your phone",
            amount,
          });
        } catch (e: any) {
          if (e instanceof z.ZodError) {
            return json({ ok: false, error: e.errors[0]?.message ?? "Validation error" }, 400);
          }
          console.error("M-Pesa STK error:", e);
          return json({ ok: false, error: e?.message ?? "STK push failed" }, 500);
        }
      },
    },
  },
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}