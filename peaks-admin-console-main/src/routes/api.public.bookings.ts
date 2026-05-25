import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const CreateBookingSchema = z.object({
  guestName: z.string().min(1, "Guest name is required"),
  guestEmail: z.string().email().optional().or(z.literal("")),
  guestPhone: z.string().min(9, "Phone number is required"),
  roomId: z.string().uuid("Invalid room ID").optional(),
  roomNumber: z.string().optional(),
  roomType: z.string().optional(),
  roomConfig: z.string().optional(),
  mealPlan: z.string().optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid check-in date format"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid check-out date format"),
  numGuests: z.number().int().positive().default(1),
  numberOfRooms: z.number().int().positive().default(1),
  pricePerNight: z.number().nonnegative().optional(),
  totalAmount: z.number().nonnegative(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  transactionRef: z.string().optional(),
  notes: z.string().optional(),
  specialRequests: z.string().optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).default("pending"),
});

// GET: List available rooms with pricing
export const Route = createFileRoute("/api/public/bookings")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async () => {
        try {
          // Get all available rooms
          const { data: rooms, error } = await supabaseAdmin
            .from("rooms")
            .select("*")
            .eq("status", "available")
            .order("room_number");

          if (error) throw error;

          return json({ ok: true, rooms: rooms ?? [] });
        } catch (e: any) {
          return json({ ok: false, error: e?.message ?? "Failed to fetch rooms" }, 500);
        }
      },
      POST: async ({ request }) => {
        try {
          const body = CreateBookingSchema.parse(await request.json());
          const {
            roomId, checkIn, checkOut, numGuests, totalAmount,
            guestName, guestEmail, guestPhone, notes, specialRequests,
            roomNumber, roomType, roomConfig, mealPlan, numberOfRooms,
            pricePerNight, paymentMethod, paymentStatus, transactionRef, status,
          } = body;

          // Find room by ID or room_number
          let room: any = null;
          if (roomId) {
            const { data } = await supabaseAdmin.from("rooms").select("id, name, room_number, price_per_night").eq("id", roomId).single();
            room = data;
          } else if (roomNumber) {
            const { data } = await supabaseAdmin.from("rooms").select("id, name, room_number, price_per_night").eq("room_number", roomNumber).single();
            room = data;
          }

          // Check for date conflicts — check by room_id AND room_number
          if (room) {
            const { data: existingById } = await supabaseAdmin
              .from("bookings")
              .select("id")
              .eq("room_id", room.id)
              .in("status", ["pending", "confirmed"])
              .lt("check_in", checkOut)
              .gt("check_out", checkIn)
              .limit(1);

            if (existingById && existingById.length > 0) {
              return json({ ok: false, error: "Room is already booked for these dates" }, 409);
            }
          }

          // Also check by room_number string (catches bookings saved without room_id)
          if (roomNumber || room?.room_number) {
            const rn = roomNumber || room?.room_number;
            const { data: existingByNum } = await (supabaseAdmin
              .from("bookings")
              .select("id")
              .eq("room_number" as any, rn)
              .in("status", ["pending", "confirmed"])
              .lt("check_in", checkOut)
              .gt("check_out", checkIn)
              .limit(1) as any);

            if (existingByNum && existingByNum.length > 0) {
              return json({ ok: false, error: "Room is already booked for these dates" }, 409);
            }
          }

          const { data: booking, error: bookingError } = await supabaseAdmin
            .from("bookings")
            .insert({
              room_id: room?.id ?? null,
              guest_name: guestName,
              guest_email: guestEmail || null,
              guest_phone: guestPhone,
              check_in: checkIn,
              check_out: checkOut,
              num_guests: numGuests,
              number_of_rooms: numberOfRooms,
              total_amount: totalAmount,
              room_number: roomNumber || room?.room_number || null,
              room_type: roomType || null,
              room_config: roomConfig || null,
              meal_plan: mealPlan || null,
              price_per_night: pricePerNight ?? null,
              payment_method: paymentMethod || null,
              payment_status: paymentStatus || (transactionRef ? "paid" : "pending"),
              transaction_ref: transactionRef || null,
              special_requests: specialRequests || notes || null,
              status,
            } as any)
            .select()
            .single();

          if (bookingError) {
            if (bookingError.message.includes("exclusion")) {
              return json({ ok: false, error: "Room is already booked for these dates" }, 409);
            }
            return json({ ok: false, error: bookingError.message }, 400);
          }

          return json({
            ok: true,
            booking: {
              id: booking.id,
              reference: booking.reference,
              guestName: booking.guest_name,
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              totalAmount: booking.total_amount,
              status: booking.status,
              room: room ? { name: room.name, number: room.room_number } : null,
            },
          });
        } catch (e: any) {
          if (e instanceof z.ZodError) {
            return json({ ok: false, error: e.errors[0]?.message ?? "Validation error" }, 400);
          }
          return json({ ok: false, error: e?.message ?? "Booking failed" }, 500);
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