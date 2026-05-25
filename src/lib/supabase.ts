import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !key) {
  console.warn("Supabase env vars not set — bookings will not be saved to DB");
}

export const supabase = createClient(url || "", key || "");
