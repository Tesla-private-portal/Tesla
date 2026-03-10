import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface SectionProps {
  key?: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImg: string;
  primaryBtnText: string;
  secondaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnLink?: string;
  darkText?: boolean;
}

export default function Section({
  title,
  subtitle,
  description,
  backgroundImg,
  primaryBtnText,
  secondaryBtnText,
  primaryBtnLink = "/shop",
  secondaryBtnLink = "/demo-drive",
  darkText = false,
}: SectionProps) {
  const navigate = useNavigate();

  return (
    <section
      className="relative h-screen w-full snap-start snap-always flex flex-col items-center justify-between overflow-hidden"
    >
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1 }}
        whileInView={{ scale: 1.05 }}
        transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${backgroundImg})` }}
      />
      <div className="absolute inset-0 bg-black/10 z-0" />

      {/* Content Container */}
      <div className={`relative z-10 flex flex-col items-center pt-32 text-center ${darkText ? 'text-gray-900' : 'text-white'}`}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[40px] font-medium tracking-tight drop-shadow-sm"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl font-medium mt-1 drop-shadow-sm"
          >
            {subtitle}
          </motion.h2>
        )}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm mt-2 text-gray-200 drop-shadow-sm"
          >
            {description}
          </motion.p>
        )}
      </div>

      {/* Buttons Container */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pb-24 w-full px-6">
        <motion.button
          onClick={() => navigate(primaryBtnLink)}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full sm:w-[264px] bg-[#f4f4f4] text-[#393c41] h-10 rounded text-sm font-medium hover:bg-white transition-colors"
        >
          {primaryBtnText}
        </motion.button>
        {secondaryBtnText && (
          <motion.button
            onClick={() => navigate(secondaryBtnLink)}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full sm:w-[264px] bg-[#171a20]/65 text-white h-10 rounded text-sm font-medium hover:bg-[#171a20]/80 transition-colors backdrop-blur-sm"
          >
            {secondaryBtnText}
          </motion.button>
        )}
      </div>
    </section>
  );
}
