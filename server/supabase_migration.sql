-- Supabase Migration Script for Peaks Hotel Database
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE room_type AS ENUM ('standard', 'superior', 'executive');
CREATE TYPE room_config AS ENUM ('single', 'double', 'twin');
CREATE TYPE meal_plan AS ENUM ('bed_breakfast', 'half_board', 'full_board');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number INTEGER NOT NULL UNIQUE,
    room_type room_type NOT NULL,
    floor INTEGER NOT NULL,
    max_guests INTEGER NOT NULL DEFAULT 2,
    bed_description VARCHAR(255),
    size VARCHAR(50),
    is_available BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room pricing table
CREATE TABLE room_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type room_type NOT NULL,
    room_config room_config NOT NULL,
    meal_plan meal_plan NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_type, room_config, meal_plan)
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(20) NOT NULL UNIQUE,
    guest_first_name VARCHAR(100) NOT NULL,
    guest_last_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    room_id UUID REFERENCES rooms(id),
    room_number INTEGER NOT NULL,
    room_type room_type NOT NULL,
    room_config room_config NOT NULL,
    meal_plan meal_plan NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    number_of_guests INTEGER NOT NULL DEFAULT 1,
    number_of_rooms INTEGER NOT NULL DEFAULT 1,
    number_of_nights INTEGER NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    special_requests TEXT,
    status booking_status NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room availability table for tracking bookings
CREATE TABLE room_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id),
    date DATE NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    booking_id UUID REFERENCES bookings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, date)
);

-- Create index for faster queries
CREATE INDEX idx_rooms_room_type ON rooms(room_type);
CREATE INDEX idx_rooms_floor ON rooms(floor);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_check_out ON bookings(check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_room_number ON bookings(room_number);
CREATE INDEX idx_room_availability_date ON room_availability(date);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_pricing_updated_at BEFORE UPDATE ON room_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_availability_updated_at BEFORE UPDATE ON room_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default room pricing
INSERT INTO room_pricing (room_type, room_config, meal_plan, price) VALUES
-- Standard Rooms
('standard', 'single', 'bed_breakfast', 8400),
('standard', 'single', 'half_board', 10400),
('standard', 'single', 'full_board', 12400),
('standard', 'double', 'bed_breakfast', 11400),
('standard', 'double', 'half_board', 15400),
('standard', 'double', 'full_board', 19400),
('standard', 'twin', 'bed_breakfast', 6200),
('standard', 'twin', 'half_board', 8200),
('standard', 'twin', 'full_board', 10200),
-- Superior Rooms
('superior', 'single', 'bed_breakfast', 9600),
('superior', 'single', 'half_board', 11600),
('superior', 'single', 'full_board', 13600),
('superior', 'double', 'bed_breakfast', 12600),
('superior', 'double', 'half_board', 16600),
('superior', 'double', 'full_board', 20600),
('superior', 'twin', 'bed_breakfast', 6800),
('superior', 'twin', 'half_board', 8800),
('superior', 'twin', 'full_board', 10800),
-- Executive Rooms
('executive', 'single', 'bed_breakfast', 13400),
('executive', 'single', 'half_board', 15400),
('executive', 'single', 'full_board', 17400),
('executive', 'double', 'bed_breakfast', 16900),
('executive', 'double', 'half_board', 20900),
('executive', 'double', 'full_board', 24900);

-- Insert rooms
-- Floor 1: Mix of standard and superior rooms
INSERT INTO rooms (room_number, room_type, floor, max_guests, bed_description, size) VALUES
(101, 'standard', 1, 2, 'King Bed', '35 sqm'),
(102, 'standard', 1, 2, 'King Bed', '35 sqm'),
(103, 'standard', 1, 2, 'King Bed', '35 sqm'),
(104, 'standard', 1, 2, 'King Bed', '35 sqm'),
(105, 'standard', 1, 2, 'King Bed', '35 sqm'),
(106, 'superior', 1, 3, 'King Bed + Sofa Bed', '55 sqm'),
(107, 'superior', 1, 3, 'King Bed + Sofa Bed', '55 sqm'),
(108, 'standard', 1, 2, 'King Bed', '35 sqm'),
(109, 'standard', 1, 2, 'King Bed', '35 sqm'),
(110, 'standard', 1, 2, 'King Bed', '35 sqm'),
(111, 'standard', 1, 2, 'King Bed', '35 sqm'),
(112, 'executive', 1, 4, '2 King Beds', '90 sqm');

-- Floor 2: Mix of standard and superior rooms
INSERT INTO rooms (room_number, room_type, floor, max_guests, bed_description, size) VALUES
(201, 'standard', 2, 2, 'King Bed', '35 sqm'),
(202, 'standard', 2, 2, 'King Bed', '35 sqm'),
(203, 'standard', 2, 2, 'King Bed', '35 sqm'),
(204, 'standard', 2, 2, 'King Bed', '35 sqm'),
(205, 'standard', 2, 2, 'King Bed', '35 sqm'),
(206, 'superior', 2, 3, 'King Bed + Sofa Bed', '55 sqm'),
(207, 'superior', 2, 3, 'King Bed + Sofa Bed', '55 sqm'),
(208, 'standard', 2, 2, 'King Bed', '35 sqm'),
(209, 'standard', 2, 2, 'King Bed', '35 sqm'),
(210, 'standard', 2, 2, 'King Bed', '35 sqm'),
(211, 'standard', 2, 2, 'King Bed', '35 sqm'),
(212, 'executive', 2, 4, '2 King Beds', '90 sqm');

-- Floor 3: Mix of standard and superior rooms
INSERT INTO rooms (room_number, room_type, floor, max_guests, bed_description, size) VALUES
(301, 'standard', 3, 2, 'King Bed', '35 sqm'),
(302, 'standard', 3, 2, 'King Bed', '35 sqm'),
(303, 'standard', 3, 2, 'King Bed', '35 sqm'),
(304, 'standard', 3, 2, 'King Bed', '35 sqm'),
(305, 'standard', 3, 2, 'King Bed', '35 sqm'),
(306, 'superior', 3, 3, 'King Bed + Sofa Bed', '55 sqm'),
(307, 'superior', 3, 3, 'King Bed + Sofa Bed', '55 sqm'),
(308, 'standard', 3, 2, 'King Bed', '35 sqm'),
(309, 'standard', 3, 2, 'King Bed', '35 sqm'),
(310, 'standard', 3, 2, 'King Bed', '35 sqm'),
(311, 'standard', 3, 2, 'King Bed', '35 sqm'),
(312, 'executive', 3, 4, '2 King Beds', '90 sqm');

-- Floor 4: Only superior and executive rooms
INSERT INTO rooms (room_number, room_type, floor, max_guests, bed_description, size) VALUES
(407, 'superior', 4, 3, 'King Bed + Sofa Bed', '55 sqm'),
(408, 'superior', 4, 3, 'King Bed + Sofa Bed', '55 sqm'),
(409, 'superior', 4, 3, 'King Bed + Sofa Bed', '55 sqm'),
(410, 'superior', 4, 3, 'King Bed + Sofa Bed', '55 sqm'),
(411, 'superior', 4, 3, 'King Bed + Sofa Bed', '55 sqm'),
(412, 'executive', 4, 4, '2 King Beds', '90 sqm');

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your needs)
-- For public read access to rooms and pricing
CREATE POLICY "Public can view rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Public can view pricing" ON room_pricing FOR SELECT USING (true);
CREATE POLICY "Public can view availability" ON room_availability FOR SELECT USING (true);

-- For authenticated insert/update on bookings
CREATE POLICY "Users can insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid()::text = guest_email);

-- Create a function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS VARCHAR(20) AS $$
DECLARE
    ref VARCHAR(20);
BEGIN
    SELECT 'PH' || TO_CHAR(NOW(), 'YYMMDD') || '-' || 
           (SELECT LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'))
    INTO ref;
    RETURN ref;
END;
$$ LANGUAGE plpgsql;
