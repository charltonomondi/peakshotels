import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
// Use service key for server-side operations (bypasses RLS)
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_KEY not set');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function getRooms() {
  const { data, error } = await supabase.from('rooms').select('*').order('room_number');
  if (error) throw error;
  return data;
}

export async function getRoomByNumber(roomNumber) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_number', String(roomNumber))
    .single();
  if (error) throw error;
  return data; // returns the room record directly
}

export async function getAllPricing() {
  // Pricing is embedded in the frontend; this returns rooms with price_per_night
  const { data, error } = await supabase.from('rooms').select('id, room_number, category, price_per_night').order('room_number');
  if (error) throw error;
  return data;
}

export async function checkRoomAvailability(roomNumber, checkIn, checkOut) {
  // Get room record
  const { data: room, error: roomErr } = await supabase
    .from('rooms')
    .select('id, room_number, status')
    .eq('room_number', String(roomNumber))
    .single();

  if (roomErr || !room) return { available: false, reason: 'Room not found' };
  if (room.status !== 'available') return { available: false, reason: `Room is ${room.status}` };

  // Check for overlapping confirmed/pending bookings
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('room_id', room.id)
    .in('status', ['confirmed', 'pending'])
    .lt('check_in', checkOut)
    .gt('check_out', checkIn);

  if (error) throw error;
  if (bookings && bookings.length > 0) {
    return { available: false, reason: 'Room already booked for selected dates' };
  }

  return { available: true, room };
}

export async function createBooking(bookingData) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getBookingByReference(reference) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, rooms(*)')
    .eq('reference', reference)
    .single();
  if (error) throw error;
  return data;
}

export async function updateBookingStatus(bookingId, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAllBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, rooms(name, room_number)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
