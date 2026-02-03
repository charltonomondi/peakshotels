import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_ANON_KEY not set in environment variables');
}

export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseKey || 'your-anon-key'
);

// Database helper functions
export async function getRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('room_number');
  
  if (error) throw error;
  return data;
}

export async function getRoomByNumber(roomNumber) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_number', roomNumber)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getRoomPricing(roomType, roomConfig, mealPlan) {
  const { data, error } = await supabase
    .from('room_pricing')
    .select('price')
    .eq('room_type', roomType)
    .eq('room_config', roomConfig)
    .eq('meal_plan', mealPlan)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAllPricing() {
  const { data, error } = await supabase
    .from('room_pricing')
    .select('*')
    .order('room_type');
  
  if (error) throw error;
  return data;
}

export async function checkRoomAvailability(roomNumber, checkIn, checkOut) {
  // Check if room is available for the given dates
  const { data: room } = await getRoomByNumber(roomNumber);
  if (!room) return { available: false, reason: 'Room not found' };

  // Check for overlapping bookings
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('room_number', roomNumber)
    .eq('status', 'confirmed')
    .or(`check_in.lte.${checkOut},check_out.gte.${checkIn}`);

  if (error) throw error;

  if (bookings && bookings.length > 0) {
    return { available: false, reason: 'Room already booked for selected dates' };
  }

  return { available: true, room };
}

export async function getAvailableRooms(checkIn, checkOut, roomType = null) {
  let query = supabase
    .from('rooms')
    .select('*')
    .eq('is_available', true);

  if (roomType) {
    query = query.eq('room_type', roomType);
  }

  const { data: rooms, error } = await query.order('room_number');

  if (error) throw error;

  // Filter out rooms with overlapping bookings
  const availableRooms = [];
  for (const room of rooms) {
    const availability = await checkRoomAvailability(room.room_number, checkIn, checkOut);
    if (availability.available) {
      availableRooms.push(room);
    }
  }

  return availableRooms;
}

export async function createBooking(bookingData) {
  // Generate booking reference
  const bookingRef = `PH${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      ...bookingData,
      booking_reference: bookingRef
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBookingByReference(bookingReference) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, rooms(*)')
    .eq('booking_reference', bookingReference)
    .single();

  if (error) throw error;
  return data;
}

export async function updateBookingStatus(bookingId, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateRoomAvailability(roomId, date, isAvailable, bookingId = null) {
  const { data, error } = await supabase
    .from('room_availability')
    .upsert({
      room_id: roomId,
      date,
      is_available: isAvailable,
      booking_id: bookingId
    })
    .select();

  if (error) throw error;
  return data;
}
