import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Utensils, X, Download, FileText } from "lucide-react";
import restaurantImage from "@/assets/restaurant/mbaruk.jpg";
import summit from "@/assets/restaurant/rooftop.jpg";

const menuPdf = new URL("../assets/Mbaruk Restaurant & Spillover/menu.pdf", import.meta.url).href;

const DiningPreview = () => {
  const [showMenu, setShowMenu] = useState(false); 

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Restaurant & Dining Areas
          </h2>
          <div className="w-20 h-0.5 bg-accent mx-auto mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Savour our cuisine featuring the finest local and international flavours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Summit Card */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-2xl">
            <img src={summit} alt="The Summit Restaurant"
              className="w-full h-64 sm:h-80 md:h-[400px] lg:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
              <div className="flex items-center gap-2 text-accent mb-2">
                <Utensils className="h-4 w-4" />
                <span className="text-xs font-medium tracking-wide uppercase">The Summit Restaurant</span>
              </div>
              <h3 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground mb-2">Dining with a View.</h3>
             {/* <p className="text-primary-foreground/80 mb-3 text-sm hidden sm:block">Enjoy meals and refreshments while taking in panoramic views of Mount Kenya, the Aberdares and the Lolldaiga Hills.</p>*/}
              <Button variant="hero" size="sm" onClick={() => setShowMenu(true)}>View Menu</Button>
            </div>
          </motion.div>

          {/* Mbaruk Card */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative overflow-hidden rounded-2xl">
            <img src={restaurantImage} alt="Mbaruk Restaurant"
              className="w-full h-64 sm:h-80 md:h-[400px] lg:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
              <div className="flex items-center gap-2 text-accent mb-2">
                <Utensils className="h-4 w-4" />
                <span className="text-xs font-medium tracking-wide uppercase">Mbaruk Restaurant</span>
              </div>
              <h3 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground mb-2">Fresh. Comfortable. Welcoming.</h3>
              {/* <p className="text-primary-foreground/80 mb-3 text-sm hidden sm:block">Our all-day dining restaurant serving Kenyan, African and international favourites.</p> */}
              <Button variant="hero" size="sm" onClick={() => setShowMenu(true)}>View Menu</Button>
            </div>
          </motion.div>
        </div>
      </div>

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
    </section>
  );
};

export default DiningPreview;
