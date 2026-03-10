import Section from '../components/Section';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

const SECTIONS = [
  {
    title: "Model Y",
    subtitle: "Lease starting at $329/mo*",
    backgroundImg: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop",
    primaryBtnText: "Order Now",
    secondaryBtnText: "Demo Drive",
  },
  {
    title: "Model 3",
    subtitle: "Lease starting at $299/mo*",
    backgroundImg: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?q=80&w=2070&auto=format&fit=crop",
    primaryBtnText: "Order Now",
    secondaryBtnText: "Demo Drive",
  },
  {
    title: "Model X",
    subtitle: "From $68,590*",
    description: "After Federal Tax Credit & Est. Gas Savings",
    backgroundImg: "https://images.unsplash.com/photo-1618022325802-7e5e732d97a1?q=80&w=2048&auto=format&fit=crop",
    primaryBtnText: "Order Now",
    secondaryBtnText: "Demo Drive",
  },
  {
    title: "Model S",
    subtitle: "From $71,090*",
    description: "After Est. Gas Savings",
    backgroundImg: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
    primaryBtnText: "Order Now",
    secondaryBtnText: "Demo Drive",
  },
  {
    title: "Cybertruck",
    backgroundImg: "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?q=80&w=2069&auto=format&fit=crop",
    primaryBtnText: "Order Now",
    secondaryBtnText: "Learn More",
  },
  {
    title: "Solar Panels",
    subtitle: "Schedule a Virtual Consult",
    backgroundImg: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop",
    primaryBtnText: "Order Now",
    secondaryBtnText: "Learn More",
  },
  {
    title: "Solar Roof",
    subtitle: "Produce Clean Energy From Your Roof",
    backgroundImg: "https://images.unsplash.com/photo-1559328963-2287411bc23f?q=80&w=2070&auto=format&fit=crop",
    primaryBtnText: "Order Now",
    secondaryBtnText: "Learn More",
  },
  {
    title: "Powerwall",
    backgroundImg: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop",
    primaryBtnText: "Order Now",
    secondaryBtnText: "Learn More",
  },
];

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1536700503339-1e4b06520771?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618022325802-7e5e732d97a1?q=80&w=2048&auto=format&fit=crop",
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen w-full overflow-y-auto snap-y snap-mandatory scroll-smooth bg-black">
      {/* Carousel Section */}
      <section className="relative h-screen w-full snap-start snap-always flex flex-col items-center justify-between overflow-hidden">
        {CAROUSEL_IMAGES.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSlide === index ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-black/20 z-0" />
        <div className="relative z-10 flex flex-col items-center pt-32 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[40px] font-medium tracking-tight drop-shadow-sm"
          >
            Experience Tesla
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl font-medium mt-1 drop-shadow-sm"
          >
            The Future of Driving
          </motion.p>
        </div>
        <div className="relative z-10 flex gap-2 pb-12">
          {CAROUSEL_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {SECTIONS.map((section, index) => (
        <Section
          key={index}
          title={section.title}
          subtitle={section.subtitle}
          description={section.description}
          backgroundImg={section.backgroundImg}
          primaryBtnText={section.primaryBtnText}
          secondaryBtnText={section.secondaryBtnText}
        />
      ))}
      <Footer />
    </div>
  );
}
