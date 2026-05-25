import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getMpesaEnv, normalizePhone, stkPush } from "@/lib/mpesa";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const Schema = z.object({
  bookingId: z.string().uuid(),
  phone: z.string().min(9).max(15),
  amount: z.number().positive().max(1_000_000),
});

export const Route = createFileRoute("/api/mpesa/stk")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          // Auth: require a logged-in staff user
          const authHeader = request.headers.get("authorization");
          if (!authHeader?.startsWith("Bearer ")) {
            return json({ error: "Unauthorized" }, 401);
          }
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
          const env = getMpesaEnv();
          const phone = normalizePhone(body.phone);

          const { data: booking, error: bErr } = await supabaseAdmin
            .from("bookings")
            .select("id, reference, guest_name")
            .eq("id", body.bookingId)
            .single();
          if (bErr || !booking) return json({ error: "Booking not found" }, 404);

          // Build callback URL from request origin
          const origin = new URL(request.url).origin;
          const callbackUrl = `${origin}/api/mpesa/callback`;

          const stk = await stkPush({
            env,
            phone,
            amount: body.amount,
            accountReference: booking.reference,
            description: `Booking ${booking.reference}`.slice(0, 13),
            callbackUrl,
          });

          await supabaseAdmin.from("mpesa_transactions").insert({
            booking_id: booking.id,
            phone,
            amount: body.amount,
            environment: env,
            merchant_request_id: stk.MerchantRequestID,
            checkout_request_id: stk.CheckoutRequestID,
            status: "pending",
            created_by: userData.user.id,
          });

          return json({
            ok: true,
            checkoutRequestId: stk.CheckoutRequestID,
            customerMessage: stk.CustomerMessage,
          });
        } catch (e: any) {
          return json({ error: e?.message ?? "STK push failed" }, 500);
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
