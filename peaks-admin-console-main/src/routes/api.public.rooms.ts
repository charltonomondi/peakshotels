import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// GET: Get all available rooms with pricing
export const Route = createFileRoute("/api/public/rooms")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const checkIn = url.searchParams.get("checkIn");
          const checkOut = url.searchParams.get("checkOut");
          const category = url.searchParams.get("category");

          // Special mode: just return booked room numbers for given dates
          const bookedOnly = url.searchParams.get("bookedOnly");
          if (bookedOnly === "true" && checkIn && checkOut) {
            const { data: bookings } = await supabaseAdmin
              .from("bookings")
              .select("room_id, room_number")
              .in("status", ["pending", "confirmed"])
              .lt("check_in", checkOut)
              .gt("check_out", checkIn) as any;

            const bookedNumbers = [
              ...new Set([
                ...((bookings as any[])?.map((b: any) => b.room_number).filter(Boolean) ?? []),
              ])
            ];
            return json({ ok: true, bookedRoomNumbers: bookedNumbers });
          }

          // Get all available rooms
          let query = supabaseAdmin
            .from("rooms")
            .select("id, name, room_number, category, description, price_per_night, capacity, amenities, images")
            .eq("status", "available")
            .order("room_number");

          if (category) {
            query = query.eq("category", category as any);
          }

          const { data: rooms, error } = await query;
          if (error) throw error;

          // If dates provided, filter out booked rooms
          if (checkIn && checkOut) {
            const { data: bookings } = await supabaseAdmin
              .from("bookings")
              .select("room_id, room_number")
              .in("status", ["pending", "confirmed"])
              .lt("check_in", checkOut)
              .gt("check_out", checkIn) as any;

            const bookedRoomIds = new Set(((bookings as any[]) ?? []).map((b: any) => b.room_id).filter(Boolean));
            const bookedRoomNumbers = new Set(((bookings as any[]) ?? []).map((b: any) => b.room_number).filter(Boolean));

            const availableRooms = (rooms ?? []).filter((r) =>
              !bookedRoomIds.has(r.id) && !bookedRoomNumbers.has(r.room_number)
            );

            return json({ ok: true, rooms: availableRooms });
          }

          return json({ ok: true, rooms: rooms ?? [] });
        } catch (e: any) {
          return json({ ok: false, error: e?.message ?? "Failed to fetch rooms" }, 500);
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