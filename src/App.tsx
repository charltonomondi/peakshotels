import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Index from "./pages/Index";
import About from "./pages/About";
import Rooms from "./pages/Rooms";
import Facilities from "./pages/Facilities";
import Activities from "./pages/Activities";
import News from "./pages/News";
import Restaurant from "./pages/Restaurant";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import Gym from "./pages/Gym";
import Swimming from "./pages/Swimming";
import SteamBath from "./pages/SteamBath";
import Sauna from "./pages/Sauna";
import Massage from "./pages/Massage";
import BeautyParlour from "./pages/BeautyParlour";
import Spa from "./pages/Spa";
import NotFound from "./pages/NotFound";
import RoomFeatures from "./pages/RoomFeatures";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash ? (
            <SplashScreen onComplete={handleSplashComplete} />
          ) : (
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/dining" element={<Restaurant />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/news" element={<News />} />
              <Route path="/restaurant" element={<Restaurant />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/gym" element={<Gym />} />
              <Route path="/swimming" element={<Swimming />} />
              <Route path="/steam-bath" element={<SteamBath />} />
              <Route path="/sauna" element={<Sauna />} />
              <Route path="/massage" element={<Massage />} />
              <Route path="/beauty-parlour" element={<BeautyParlour />} />
              <Route path="/spa" element={<Spa />} />
              <Route path="/room-features/:roomNumber" element={<RoomFeatures />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
