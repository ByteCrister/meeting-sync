'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/layout/Logo";

const NAV_LINKS = [
  { label: "Home", href: "/user-authentication" },
  { label: "Features", href: "/meeting-sync?option=features" },
  { label: "Roadmap", href: "/meeting-sync?option=roadmap" },
  { label: "How It Works", href: "/meeting-sync?option=how-it-works" },
];

// Motion variants
const linkItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Navigation({
  setIsModalOpen,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const baseLink = `relative text-sm font-semibold transition-all duration-300`;

  const activeLink =
    "text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:bg-gradient-to-r after:from-indigo-500 after:to-pink-500 after:rounded-full after:animate-pulse";

  const inactiveLink =
    "text-gray-700 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-500 hover:via-pink-500 hover:to-yellow-500 hover:after:absolute hover:after:inset-x-0 hover:after:-bottom-1 hover:after:h-[2px] hover:after:bg-gradient-to-r hover:after:from-indigo-500 hover:after:to-pink-500 hover:after:rounded-full";

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 w-full z-50 transition-all ${
        scrolled ? "backdrop-blur bg-white/80 shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Logo />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map(({ label, href }) => (
            <motion.div
              key={href}
              initial="hidden"
              animate="visible"
              variants={linkItem}
            >
              <Link
                href={href}
                className={`${baseLink} ${
                  pathname === href ? activeLink : inactiveLink
                }`}
              >
                {label}
              </Link>
            </motion.div>
          ))}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-500 shadow-md hover:shadow-xl transition"
          >
            Get Started
          </motion.button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="md:hidden focus:outline-none p-2 rounded-md"
        >
          {isMobileOpen ? (
            <X className="w-6 h-6 text-gray-800" />
          ) : (
            <Menu className="w-6 h-6 text-gray-800" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 180 }}
            className="md:hidden bg-white backdrop-blur shadow-lg px-6 py-6"
          >
            <ul className="flex flex-col gap-5">
              {NAV_LINKS.map(({ label, href }) => (
                <motion.li key={href} variants={linkItem}>
                  <Link
                    href={href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`${baseLink} ${
                      pathname === href ? activeLink : inactiveLink
                    }`}
                  >
                    {label}
                  </Link>
                </motion.li>
              ))}

              <motion.li variants={linkItem}>
                <motion.button
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsMobileOpen(false);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-500 shadow-md"
                >
                  Get Started
                </motion.button>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
