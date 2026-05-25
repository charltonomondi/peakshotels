import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/mpesa/callback")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const payload = await request.json();
          const stk = payload?.Body?.stkCallback;
          if (!stk) return json({ ok: true });

          const checkoutId: string = stk.CheckoutRequestID;
          const resultCode: number = stk.ResultCode;
          const resultDesc: string = stk.ResultDesc;

          const items: Array<{ Name: string; Value?: string | number }> =
            stk.CallbackMetadata?.Item ?? [];
          const get = (k: string) =>
            items.find((i) => i.Name === k)?.Value;

          const mpesaReceipt = String(get("MpesaReceiptNumber") ?? "");
          const transactionDate = String(get("TransactionDate") ?? "");
          const amount = Number(get("Amount") ?? 0);
          const phone = String(get("PhoneNumber") ?? "");

          const status =
            resultCode === 0
              ? "success"
              : resultCode === 1032
                ? "cancelled"
                : "failed";

          // Update mpesa transaction
          const { data: tx } = await supabaseAdmin
            .from("mpesa_transactions")
            .update({
              status,
              result_code: String(resultCode),
              result_desc: resultDesc,
              mpesa_receipt: mpesaReceipt || null,
              transaction_date: transactionDate || null,
              callback_payload: payload,
              phone: phone ? String(phone) : undefined,
            })
            .eq("checkout_request_id", checkoutId)
            .select("id, booking_id, amount")
            .maybeSingle();

          // On success, create a payment row
          if (status === "success" && tx?.booking_id) {
            const { data: pay } = await supabaseAdmin
              .from("payments")
              .insert({
                booking_id: tx.booking_id,
                amount: amount || tx.amount,
                method: "mpesa",
                status: "paid",
                transaction_ref: mpesaReceipt,
                paid_at: new Date().toISOString(),
              })
              .select("id")
              .maybeSingle();

            if (pay?.id) {
              await supabaseAdmin
                .from("mpesa_transactions")
                .update({ payment_id: pay.id })
                .eq("id", tx.id);
            }
            // Mark booking as confirmed
            await supabaseAdmin
              .from("bookings")
              .update({ status: "confirmed" })
              .eq("id", tx.booking_id);
          }

          return json({ ResultCode: 0, ResultDesc: "Accepted" });
        } catch (e: any) {
          // Always 200 to Daraja so it doesn't keep retrying loudly
          return json({ ResultCode: 0, ResultDesc: "Accepted" });
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
