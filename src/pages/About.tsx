import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Award, Heart, Shield, Users } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Beauty and Taste, with Nature",
    description: "Beauty and nature are reflected in our surroundings, gardens, flowers and attention to detail. Taste is about our choices — our standards, services and commitment to excellence.",
  },
  // {
  //   icon: Users,
  //   title: "Something for Everybody",
  //   description: "From business travellers and holidaymakers to conference delegates, families and international visitors, Peaks welcomes all guests seeking comfort, value and memorable experiences.",
  // },
  {
    icon: Shield,
    title: "Sustainability in Action",
    description: "Solar energy, wastewater treatment and reuse, indigenous trees and resource recovery — sustainability is not a programme, it is a way of life.",
  },
  // {
  //   icon: Award,
  //   title: "Kenyan-Owned, Kenyan-Proud",
  //   description: "Peaks Hotel is a Kenyan-owned hospitality destination rooted in local culture, guided by genuine hospitality and committed to the communities we serve.",
  // },
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
              Our Story
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              About Peaks Hotel
            </h1>
            <div className="w-20 h-0.5 bg-accent mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="prose prose-lg mx-auto text-center"
            >
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Peaks Hotel is a hospitality destination located in Nanyuki town on the foothills of Mount Kenya.  The name Peaks was inspired by the three iconic landmarks that define our horizon and identity: Mount Kenya, the Aberdare Ranges and the Lolldaiga Hills. Together they represent the beauty, adventure and natural heritage that make Nanyuki one of Kenya's most remarkable destinations.
              </p>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
               
              </p>
              <p className="text-xl text-muted-foreground leading-relaxed">
                From business travellers and holidaymakers to conference delegates, families and international visitors, Peaks welcomes guests seeking comfort, value and memorable experiences.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Three Peaks Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">Our Name</p> */}
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">The Three Peaks</h2>
              <div className="w-20 h-0.5 bg-accent mx-auto mb-8" />
              <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                The name Peaks is inspired by three iconic landmarks that define our horizon and identity.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: "Mount Kenya", desc: "Africa's second-highest peak, our closest neighbour and the inspiration behind everything we do." },
                  { name: "The Aberdare Ranges", desc: "The sweeping highland range visible from our grounds, forming part of the dramatic landscape that surrounds us." },
                  { name: "The Lolldaiga Hills", desc: "The rolling hills that complete our horizon, home to wildlife and wild beauty on our doorstep." },
                ].map((peak, i) => (
                  <motion.div
                    key={peak.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="bg-card rounded-2xl p-8 shadow-elegant"
                  >
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-accent-foreground font-bold text-lg">{i + 1}</div>
                    <h3 className="font-heading text-xl font-bold text-foreground mb-3">{peak.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{peak.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4"></p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">Our Guiding Principle</h2>
            <div className="w-20 h-0.5 bg-accent mx-auto mb-8" />
            <p className="text-2xl font-heading font-bold text-foreground mb-6">Beauty and Taste, with Nature</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { word: "Beauty", desc: "Reflected in our surroundings, gardens, flowers, hospitality and attention to detail." },
                { word: "Taste", desc: "Reflected in our choices — our standards, service, quality, professionalism and commitment to excellence." },
                { word: "Nature", desc: "The setting in which all this takes place — wild, generous and ever-present around us." },
              ].map((item, i) => (
                <motion.div
                  key={item.word}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-secondary rounded-2xl p-8"
                >
                  <h3 className="font-heading text-2xl font-bold text-accent mb-3">{item.word}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
              
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              What We Stand For
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Manager's Message */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card rounded-2xl p-8 md:p-12 shadow-elegant"
            >
              <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4 text-center">
                
              </p>
              <h2 className="font-heading text-3xl font-bold text-foreground mb-8 text-center">
                A Message From Our CEO
              </h2>
              <blockquote className="text-lg text-muted-foreground italic leading-relaxed text-center mb-8">
                "Peaks Hotel is a place where beauty and nature meet taste and genuine hospitality. Our dedicated team welcomes guests from Nanyuki, across Kenya and beyond. Whether you are here for rest, adventure, business or celebration — this is your home away from home."
              </blockquote>
              {/* <p className="text-center font-semibold text-foreground">
                The Peaks Hotel Management Team
              </p> */}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
