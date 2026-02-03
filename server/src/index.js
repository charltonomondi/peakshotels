import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  getRooms, 
  getRoomByNumber, 
  getRoomPricing, 
  getAllPricing,
  checkRoomAvailability,
  getAvailableRooms,
  createBooking,
  getBookingByReference,
  updateBookingStatus,
  getAllBookings,
  updateRoomAvailability
} from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ ROOMS ============

// Get all rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await getRooms();
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get room by number
app.get('/api/rooms/:roomNumber', async (req, res) => {
  try {
    const room = await getRoomByNumber(parseInt(req.params.roomNumber));
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ PRICING ============

// Get all pricing
app.get('/api/pricing', async (req, res) => {
  try {
    const pricing = await getAllPricing();
    res.json({ success: true, data: pricing });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pricing for specific room type
app.get('/api/pricing/:roomType', async (req, res) => {
  try {
    const pricing = await getAllPricing();
    const filtered = pricing.filter(p => p.room_type === req.params.roomType);
    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ AVAILABILITY ============

// Check room availability
app.get('/api/availability/:roomNumber', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ 
        success: false, 
        error: 'Check-in and check-out dates are required' 
      });
    }

    const availability = await checkRoomAvailability(
      parseInt(req.params.roomNumber),
      checkIn,
      checkOut
    );
    res.json({ success: true, data: availability });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get available rooms
app.get('/api/available-rooms', async (req, res) => {
  try {
    const { checkIn, checkOut, roomType } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ 
        success: false, 
        error: 'Check-in and check-out dates are required' 
      });
    }

    const rooms = await getAvailableRooms(checkIn, checkOut, roomType);
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ BOOKINGS ============

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Validate required fields
    const required = [
      'guest_first_name', 'guest_last_name', 'guest_email',
      'room_number', 'room_type', 'room_config', 'meal_plan',
      'check_in', 'check_out', 'number_of_guests', 'number_of_nights',
      'price_per_night', 'total_price'
    ];

    const missing = required.filter(field => !bookingData[field]);
    if (missing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Missing required fields: ${missing.join(', ')}` 
      });
    }

    // Check availability before creating booking
    const availability = await checkRoomAvailability(
      bookingData.room_number,
      bookingData.check_in,
      bookingData.check_out
    );

    if (!availability.available) {
      return res.status(400).json({ 
        success: false, 
        error: availability.reason || 'Room not available for selected dates' 
      });
    }

    const booking = await createBooking(bookingData);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get booking by reference
app.get('/api/bookings/:reference', async (req, res) => {
  try {
    const booking = await getBookingByReference(req.params.reference);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all bookings (admin)
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const bookings = await getAllBookings();
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update booking status (admin)
app.patch('/api/admin/bookings/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await updateBookingStatus(req.params.id, status);
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update room availability (admin)
app.post('/api/admin/availability', async (req, res) => {
  try {
    const { roomId, date, isAvailable, bookingId } = req.body;
    const result = await updateRoomAvailability(roomId, date, isAvailable, bookingId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

export default app;
