import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Bed, Users, Maximize, Wifi, Wind, Coffee, Tv, Bath, ArrowRight, Check, X } from "lucide-react";
import roomDeluxe from "@/assets/bed.jpg";
import roomExecutive from "@/assets/bed1.jpg";
import roomPresidential from "@/assets/bed5.jpg";
import heroBackground from "@/assets/bed2.jpg";

const rooms = [
  {
    id: "standard",
    name: "Standard Rooms",
    image: roomDeluxe,
    priceRange: "From KES 8,400",
    priceDetails: {
      single: { bb: 8400, hb: 10400, fb: 12400 },
      double: { bb: 11400, hb: 15400, fb: 19400 },
      twin: { bb: 6200, hb: 8200, fb: 10200 }
    },
    size: "35 sqm",
    guests: "2 Adults",
    bed: "King Bed",
    description: "Our Standard Rooms offer elegant comfort with stunning mountain views and premium amenities. Perfect for couples or business travelers seeking a refined retreat.",
    amenities: ["Free WiFi", "Air Conditioning", "Coffee Maker", "Flat Screen TV", "Mini Bar", "En-suite Bathroom", "Room Service", "Balcony"],
  },
  {
    id: "superior",
    name: "Superior Rooms",
    image: roomExecutive,
    priceRange: "From KES 9,600",
    priceDetails: {
      single: { bb: 9600, hb: 11600, fb: 13600 },
      double: { bb: 12600, hb: 16600, fb: 20600 },
      twin: { bb: 6800, hb: 8800, fb: 10800 }
    },
    size: "55 sqm",
    guests: "3 Adults",
    bed: "King Bed + Sofa Bed",
    description: "Spacious and sophisticated, our Superior Rooms feature a separate living area and panoramic savanna views. Ideal for extended stays or families.",
    amenities: ["Free WiFi", "Air Conditioning", "Coffee Maker", "Flat Screen TV", "Mini Bar", "En-suite Bathroom", "Living Area", "Work Desk", "Bathtub", "Room Service"],
  },
  {
    id: "executive",
    name: "Executive Rooms",
    image: roomPresidential,
    priceRange: "From KES 13,400",
    priceDetails: {
      single: { bb: 13400, hb: 15400, fb: 17400 },
      double: { bb: 16900, hb: 20900, fb: 24900 },
      twin: null
    },
    size: "90 sqm",
    guests: "4 Adults",
    bed: "2 King Beds",
    description: "The ultimate in luxury, our Executive Rooms offer unmatched Mount Kenya vistas, a private dining area, and personalized butler service.",
    amenities: ["Free WiFi", "Air Conditioning", "Coffee Maker", "Flat Screen TV", "Full Bar", "Luxury Bathroom", "Living & Dining Area", "Private Balcony", "Jacuzzi", "Butler Service", "Complimentary Breakfast"],
  },
];

// Room numbers by floor
const roomNumbers = {
  1: Array.from({ length: 12 }, (_, i) => 101 + i), // 101-112
  2: Array.from({ length: 12 }, (_, i) => 201 + i), // 201-212
  3: Array.from({ length: 12 }, (_, i) => 301 + i), // 301-312
  4: [407, 408, 409, 410, 411, 412] // 407-412
};

// Function to determine room category
const getRoomCategory = (roomNumber: number) => {
  const lastTwoDigits = roomNumber % 100;
  if ([1, 6, 7].includes(lastTwoDigits)) return "superior";
  if (lastTwoDigits === 12) return "executive";
  return "standard";
};

// Get rooms by category and floor
const getRoomsByCategory = (category: string) => {
  const result: { [floor: number]: number[] } = {};

  Object.entries(roomNumbers).forEach(([floor, rooms]) => {
    const floorRooms = rooms.filter(room => getRoomCategory(room) === category);
    if (floorRooms.length > 0) {
      result[parseInt(floor)] = floorRooms;
    }
  });

  return result;
};

const Rooms = () => {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [checkingRoomNumber, setCheckingRoomNumber] = useState<number | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeRoomNumber, setWelcomeRoomNumber] = useState<number | null>(null);

  const handleRoomClick = async (roomNumber: number) => {
    setCheckingRoomNumber(roomNumber);
    setIsCheckingAvailability(true);
    setSelectedCategory(null); // Close the modal

    // Simulate checking availability for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    setIsCheckingAvailability(false);
    setShowWelcome(true);
    setWelcomeRoomNumber(roomNumber);

    // Show welcome message for 2 seconds then navigate
    setTimeout(() => {
      setShowWelcome(false);
      navigate(`/room-features/${roomNumber}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={heroBackground}
            alt="Rooms & Suites"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </motion.div>

        <div className="relative h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
                Accommodation
              </p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Rooms & Suites
              </h1>
              <div className="w-24 h-1 bg-accent mx-auto mb-6" />
              <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                Each of our rooms is designed to provide the perfect balance of African elegance and modern comfort.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rooms List */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center cursor-pointer ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                onClick={() => setSelectedCategory(room.id)}
              >
                {/* Image */}
                <div className={`relative overflow-hidden rounded-2xl ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-6 py-3 rounded-full font-bold">
                    {room.priceRange}<span className="text-sm font-normal">/night</span>
                  </div>
                </div>

                {/* Content */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {room.name}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {room.description}
                  </p>

                  {/* Room Details */}
                  <div className="flex flex-wrap gap-6 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-foreground">
                      <Maximize className="h-5 w-5 text-accent" />
                      {room.size}
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <Users className="h-5 w-5 text-accent" />
                      {room.guests}
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <Bed className="h-5 w-5 text-accent" />
                      {room.bed}
                    </div>
                  </div>

                  {/* Pricing Table */}
                  <div className="bg-accent/10 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-foreground mb-3 text-sm">Room Rates (per night)</h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-4 gap-2 font-semibold text-foreground border-b border-border pb-2">
                        <div>Configuration</div>
                        <div className="text-right">B&B</div>
                        <div className="text-right">Half Board</div>
                        <div className="text-right">Full Board</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-muted-foreground">
                        <div>Single</div>
                        <div className="text-right">{room.priceDetails.single.bb.toLocaleString()}</div>
                        <div className="text-right">{room.priceDetails.single.hb.toLocaleString()}</div>
                        <div className="text-right">{room.priceDetails.single.fb.toLocaleString()}</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-muted-foreground">
                        <div>Double</div>
                        <div className="text-right">{room.priceDetails.double.bb.toLocaleString()}</div>
                        <div className="text-right">{room.priceDetails.double.hb.toLocaleString()}</div>
                        <div className="text-right">{room.priceDetails.double.fb.toLocaleString()}</div>
                      </div>
                      {room.priceDetails.twin && (
                        <div className="grid grid-cols-4 gap-2 text-muted-foreground">
                          <div>Twin (pp)</div>
                          <div className="text-right">{room.priceDetails.twin.bb.toLocaleString()}</div>
                          <div className="text-right">{room.priceDetails.twin.hb.toLocaleString()}</div>
                          <div className="text-right">{room.priceDetails.twin.fb.toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 italic">All rates in KES, inclusive of taxes</p>
                  </div>

                  {/* Amenities */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {room.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-accent" />
                        {amenity}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="gold"
                    size="lg"
                    onClick={() => setSelectedCategory(room.id)}
                  >
                    Book This Room
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Policies */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="font-heading text-3xl font-bold text-foreground mb-8 text-center">
              Room Policies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-xl">
                <h3 className="font-semibold text-foreground mb-4">Check-in & Check-out</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Check-in: 2:00 PM</li>
                  <li>• Check-out: 11:00 AM</li>
                  <li>• Early check-in subject to availability</li>
                  <li>• Late check-out available on request</li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-xl">
                <h3 className="font-semibold text-foreground mb-4">Cancellation Policy</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Free cancellation up to 48 hours before arrival</li>
                  <li>• 50% charge for late cancellations</li>
                  <li>• Full charge for no-shows</li>
                  <li>• Special rates may have different terms</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Room Selection Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
            onClick={() => setSelectedCategory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-2xl font-bold text-foreground">
                    {rooms.find(r => r.id === selectedCategory)?.name} - Room Numbers
                  </h2>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {Object.entries(getRoomsByCategory(selectedCategory)).map(([floor, roomNumbers]) => (
                  <div key={floor} className="mb-6">
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                      Floor {floor}
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {roomNumbers.map((roomNumber) => (
                        <div
                          key={roomNumber}
                          onClick={() => handleRoomClick(roomNumber)}
                          className="bg-secondary hover:bg-accent hover:text-accent-foreground rounded-lg p-3 text-center font-medium transition-colors cursor-pointer"
                        >
                          {roomNumber}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checking Availability Modal */}
      <AnimatePresence>
        {isCheckingAvailability && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl p-12 max-w-md w-full text-center"
            >
              <div className="mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mx-auto"></div>
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                Checking Room Availability
              </h3>
              <p className="text-muted-foreground mb-2">
                Room {checkingRoomNumber}
              </p>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify room readiness...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-accent/20 via-background to-background rounded-2xl p-12 max-w-md w-full text-center border-2 border-accent/50"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-10 w-10 text-accent-foreground" />
                </div>
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-heading text-3xl font-bold text-foreground mb-3"
              >
                Room Available!
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-accent font-semibold mb-2"
              >
                Welcome to Room {welcomeRoomNumber}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground"
              >
                Redirecting to room details...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Rooms;
