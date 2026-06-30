import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, Phone, Utensils, Wine, Coffee, Award, MapPin, Calendar, X, Download, FileText } from "lucide-react";

const menuPdf = new URL("../assets/Mbaruk Restaurant & Spillover/menu.pdf", import.meta.url).href;

// Use simpler image paths from main assets folder
const getImagePath = (filename: string) => {
  return new URL(`../assets/Mbaruk Restaurant & Spillover/${filename}`, import.meta.url).href;
};

const Restaurant = () => {
  const [showMenu, setShowMenu] = useState(false);
  // Define image paths
  const images = {
    main: getImagePath('spillover2.jpg'),
    interior1: getImagePath('ngt.jpg'),
    interior2: getImagePath('IMG_0147.JPG'),
    dining1: getImagePath('IMG_0148.JPG'),
    dining2: getImagePath('IMG_0150.JPG'),
    dining3: getImagePath('IMG_0151.JPG'),
    setup1: getImagePath('IMG_0832.JPG'),
    setup2: getImagePath('IMG_0841.JPG'),
    food1: getImagePath('IMG_1130.JPG'),
    food2: getImagePath('IMG_1134.JPG'),
    food3: getImagePath('IMG_1149.JPG'),
    ambiance1: getImagePath('meat.jpg'),
    ambiance2: getImagePath('IMG_1580.JPG'),
    ambiance3: getImagePath('IMG_1582.JPG'),
    event1: getImagePath('IMG_1595.JPG'),
    event2: getImagePath('IMG_1604.JPG'),
    event3: getImagePath('IMG_1605.JPG'),
    event4: getImagePath('IMG_1608.JPG'),
    outdoor1: getImagePath('IMG_20230616_133000.jpg'),
    outdoor2: getImagePath('IMG_20230616_133007.jpg'),
    outdoor3: getImagePath('IMG_20230616_133229.jpg'),
    dish1: getImagePath('IMG_20231110_130116_889 (1).jpg'),
    dish2: getImagePath('IMG_20231116_144834_014.jpg'),
    dish3: getImagePath('IMG_20231116_144925_163.jpg'),
    plate1: getImagePath('IMG_20231123_150001_742.jpg'),
    plate2: getImagePath('IMG_20231123_150032_097.jpg'),
    cake: getImagePath('red cake.jpeg'),
    modern1: getImagePath('PXL_20240908_125927458.jpg'),
    modern2: getImagePath('PXL_20240908_130319072.jpg'),
    modern3: getImagePath('PXL_20240908_132433354.jpg'),
    evening1: getImagePath('PXL_20241224_184750186.jpg'),
    evening2: getImagePath('PXL_20241224_184847229.jpg'),
    evening3: getImagePath('PXL_20241224_191954033.jpg'),
    rooftop:getImagePath('rooftop.jpg'),
    garden:getImagePath('garden.jpg'),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Restaurant & Fine Dining | Peaks Hotel Nanyuki"
        description="Enjoy fine dining at Mbaruk Restaurant, Peaks Hotel Nanyuki. Breakfast, lunch and dinner with stunning views. Best restaurant in Nanyuki with indoor and outdoor seating."
        keywords="Peaks Hotel restaurant, Mbaruk restaurant Nanyuki, fine dining Nanyuki, best restaurant Nanyuki, breakfast Nanyuki, lunch Nanyuki, dinner Nanyuki, hotel restaurant Kenya"
        canonical="https://www.peakshotels.co.ke/restaurant"
      />
      <Navbar />

      {/* Hero Section with Parallax Effect */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={images.main}
            alt="Mbaruk Restaurant"
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
              {/* <p className="text-accent font-medium tracking-[0.3em] uppercase mb-4 text-sm md:text-base">
                Mbaruk Restaurant & Spillover
              </p> */}
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                Taste in Every Choice
              </h1>
              <div className="w-24 h-1 bg-accent mx-auto mb-6" />
              <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                From family meals, Peaks offers a variety of dining experiences to suit every occasion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" asChild>
                  <Link to="#">Reserve a Table</Link>
                </Button>
                {/* <Button variant="hero" size="lg" onClick={() => setShowMenu(true)}></Button> */}
                <Button variant="heroOutline" size="lg" onClick={() => setShowMenu(true)} asChild>
                  <a href="#menu">View Menu</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-3 text-white"
            >
              <Clock className="h-5 w-5 text-accent" />
              <div className="text-left">
                <p className="text-sm text-white/70">Opening Hours</p>
                <p className="font-semibold">6:00 AM - 10:00 PM Daily</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-3 text-white"
            >
              <Phone className="h-5 w-5 text-accent" />
              <div className="text-left">
                <p className="text-sm text-white/70">Reservations</p>
                <p className="font-semibold">+254 711 969 690</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-3 text-white"
            >
              <MapPin className="h-5 w-5 text-accent" />
              <div className="text-left">
                <p className="text-sm text-white/70">Location</p>
                <p className="font-semibold">Peaks Hotel Nanyuki</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Restaurant Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
                MBARUK RESTAURANT
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
                Fresh. Comfortable. Welcoming.
              </h2>
              <div className="w-20 h-1 bg-accent mb-6" />
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Our all-day dining restaurant serving Kenyan, African and international favourites.
              </p>
              {/* <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                From family meals and quiet breakfasts to business lunches and celebrations, our versatile spaces and warm service ensure every moment is memorable.
              </p> */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-card rounded-xl shadow-elegant">
                  <Award className="h-8 w-8 text-accent mx-auto mb-3" />
                  <p className="font-bold text-2xl text-foreground mb-1">8+</p>
                  <p className="text-sm text-muted-foreground">Years Experience</p>
                </div>
                <div className="text-center p-6 bg-card rounded-xl shadow-elegant">
                  <Utensils className="h-8 w-8 text-accent mx-auto mb-3" />
                  <p className="font-bold text-2xl text-foreground mb-1">50+</p>
                  <p className="text-sm text-muted-foreground">Menu Items</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src={images.interior1}
                    alt="Restaurant Interior"
                    className="w-full h-64 object-cover rounded-2xl shadow-lg"
                  />
                  <img
                    src={images.food1}
                    alt="Delicious Food"
                    className="w-full h-48 object-cover rounded-2xl shadow-lg"
                  />
                </div>
                <div className="space-y-4 mt-8">
                  <img
                    src={images.dining1}
                    alt="Dining Experience"
                    className="w-full h-48 object-cover rounded-2xl shadow-lg"
                  />
                  <img
                    src={images.ambiance1}
                    alt="Restaurant Ambiance"
                    className="w-full h-64 object-cover rounded-2xl shadow-lg"
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Other Dining Venues */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">More Dining at Peaks</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Every Occasion, Every Setting
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto" />
          </motion.div>

          <div className="space-y-16">
            {[
              {
                tag: "Outdoor Dining",
                title: "The Spillover",
                subtitle: "Outdoor Dining at Its Best.",
                desc: "A popular open-air dining space where guests enjoy food, refreshments and conversation surrounded by the fresh air of our gardens.",
                img: images.modern1,
                alt: "The Spillover outdoor dining",
                reverse: false,
              },
              {
                tag: "Rooftop ",
                title: "Summit  Restaurant",
                subtitle: "Dining with a View.",
                desc: "Enjoy meals and refreshments while taking in panoramic views of Mount Kenya, the Aberdares and the Lolldaiga Hills.",
                img: images.rooftop,
                alt: "Summit Rooftop Restaurant",
                reverse: true,
              },
              // {
              //   // tag: "Wellness Centre",
              //   title: "The Eatery",
              //   subtitle: "Fresh and Refreshing.",
              //   desc: "Located at the Wellness Centre, The Eatery offers lighter meals, healthy options and refreshing beverages in a relaxed setting.",
              //   img: images.dining2,
              //   alt: "The Eatery at Wellness Centre",
              //   reverse: false,
              // },
              {
                tag: "Garden Dining",
                title: "Front Garden",
                subtitle: "Food in a Natural Setting.",
                desc: "Enjoy meals and refreshments in our front garden amidst greenery, flowers and the peaceful surroundings that define Peaks.",
                img: images.garden,
                alt: "Front Garden Dining",
                reverse: true,
              },
              {
                tag: "Outdoor Gatherings",
                title: "Events Grounds ",
                subtitle: "Great Food. Great Company. Great Outdoors.",
                desc: "Perfect for group meals, celebrations, team-building programmes and outdoor gatherings.",
                img: images.event1,
                alt: "Events Grounds Dining",
                reverse: false,
              },
              {
                tag: "Signature Experience",
                title: "Peaks Signature BBQ",
                subtitle: "A Favourite Among Our Guests.",
                desc: "Our themed barbecue experiences combine delicious food, outdoor dining and the beauty of the Peaks environment.",
                img: images.ambiance1,
                alt: "Peaks Signature BBQ",
                reverse: true,
              },
            ].map((venue, i) => (
              <motion.div
                key={venue.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.05 * i }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${venue.reverse ? "lg:flex-row-reverse" : ""}`}
              >
                <div className={`overflow-hidden rounded-3xl shadow-xl h-72 md:h-96 ${venue.reverse ? "lg:order-2" : ""}`}>
                  <img
                    src={venue.img}
                    alt={venue.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className={venue.reverse ? "lg:order-1" : ""}>
                  <span className="inline-block bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                    {venue.tag}
                  </span>
                  <h3 className="font-heading text-3xl font-bold text-foreground mb-2">{venue.title}</h3>
                  <p className="text-accent font-medium mb-3 italic">{venue.subtitle}</p>
                  <p className="text-muted-foreground text-lg leading-relaxed">{venue.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dining Spaces, Our Menu, Gallery — hidden */}
      {false && (
        <>
            <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
              Dining Spaces
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Versatile Venues for Every Occasion
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto" />
          </motion.div>

          {/* Main Restaurant */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 relative overflow-hidden rounded-3xl group h-[500px]">
                <img
                  src={images.interior2}
                  alt="Main Restaurant"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="font-heading text-3xl font-bold text-white mb-3">
                   Mbaruk Restaurant
                  </h3>
                  {/* <p className="text-white/90 text-lg mb-4">
                    Elegant and spacious, perfect for family gatherings and special celebrations
                  </p> */}
                  <div className="flex gap-4 text-sm text-white/80">
                    {/* <span className="flex items-center gap-2">
                      <Utensils className="h-4 w-4" />
                      Capacity:  guests
                    </span> */}
                    {/* <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      All day dining
                    </span> */}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-3xl group h-[240px]">
                  <img
                    src={images.setup1}
                    alt="Private Dining"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="font-heading text-xl font-bold text-white mb-2">
                      Summit Restaurant
                    </h4>
                    <p className="text-white/80 text-sm"></p>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-3xl group h-[240px]">
                  <img
                    src={images.outdoor1}
                    alt="Outdoor Seating"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="font-heading text-xl font-bold text-white mb-2">
                      Spillover Terrace
                    </h4>
                    {/* <p className="text-white/80 text-sm">Al fresco dining with garden views</p> */}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional Spaces Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: images.event1, title: "Event Space", desc: "Perfect for celebrations" },
              { img: images.modern1, title: "Lounge Area", desc: "Casual dining & drinks" },
              { img: images.evening1, title: "Evening Ambiance", desc: "Romantic atmosphere" },
              { img: images.dining3, title: "Breakfast Corner", desc: "Start your day right" },
            ].map((space, index) => (
              <motion.div
                key={space.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-2xl group h-80"
              >
                <img
                  src={space.img}
                  alt={space.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h4 className="font-heading text-xl font-bold text-white mb-2">
                    {space.title}
                  </h4>
                  <p className="text-white/80 text-sm">{space.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

            <section id="menu" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
              Our Menu
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Culinary Delights
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto mb-6" />
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From hearty breakfasts to exquisite dinners, our menu celebrates the finest ingredients 
              and authentic flavors
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                img: images.food2,
                category: "Breakfast",
                title: "Continental Breakfast",
                desc: "Fresh pastries, fruits, and hot beverages",
                price: "KSh 1,200",
                icon: Coffee,
              },
              {
                img: images.dish1,
                category: "Main Course",
                title: "Grilled Specialties",
                desc: "Premium cuts with seasonal vegetables",
                price: "KSh 2,800",
                icon: Utensils,
              },
              {
                img: images.plate1,
                category: "Signature Dish",
                title: "Mbaruk Special",
                desc: "Chef's signature creation with local flavors",
                price: "KSh 3,500",
                icon: Award,
              },
              {
                img: images.food3,
                category: "Seafood",
                title: "Fresh Catch",
                desc: "Daily selection of fresh seafood",
                price: "KSh 3,200",
                icon: Utensils,
              },
              {
                img: images.dish2,
                category: "Traditional",
                title: "Kenyan Classics",
                desc: "Authentic local dishes with a modern twist",
                price: "KSh 1,800",
                icon: Utensils,
              },
              {
                img: images.cake,
                category: "Desserts",
                title: "Sweet Endings",
                desc: "Decadent desserts and pastries",
                price: "KSh 800",
                icon: Coffee,
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden shadow-elegant group hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-accent text-white px-4 py-1 rounded-full text-sm font-medium">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-heading text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <item.icon className="h-5 w-5 text-accent flex-shrink-0" />
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-accent font-bold text-xl">{item.price}</span>
                    <Button variant="outline" size="sm">Order Now</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

            <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
              Gallery
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Moments & Memories
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto" />
          </motion.div>

          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {[
              images.ambiance2,
              images.event2,
              images.modern2,
              images.setup2,
              images.ambiance3,
              images.event3,
              images.evening2,
              images.outdoor2,
              images.dish3,
              images.plate2,
              images.event4,
              images.modern3,
              images.outdoor3,
              images.evening3,
            ].map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="break-inside-avoid"
              >
                <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
                  <img
                    src={img}
                    alt={`Restaurant Gallery ${index + 1}`}
                    className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        </>
      )}
      {/* Reservation CTA */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src={images.main}
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Reserve Your Experience
            </h2>
            {/* <p className="text-white/90 text-lg mb-8 leading-relaxed">
              Book your table today for a romantic dinner, family celebration, or business lunch, we're here to serve you.
            </p> */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" onClick={() => setShowMenu(true)}>
                <FileText className="h-5 w-5 mr-2" />
                View Menu
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <a href="tel:+254711969690">
                  <Phone className="h-5 w-5 mr-2" />
                  Call +254 711 969 690
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Menu PDF Modal */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-background rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground">Our Menu</h2>
                    <p className="text-xs text-muted-foreground">Mbaruk Restaurant & Spillover</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={menuPdf}
                    download="Mbaruk-Menu.pdf"
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={`${menuPdf}#toolbar=0&navpanes=0`}
                  className="w-full h-full"
                  title="Mbaruk Restaurant Menu"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Restaurant;
