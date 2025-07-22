'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/layout/Logo';
import { useAppSelector } from '@/lib/hooks';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/meeting-sync?option=features' },
  { label: 'Roadmap', href: '/meeting-sync?option=roadmap' },
  { label: 'How It Works', href: '/meeting-sync?option=how-it-works' },
];

const linkItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Navigation({
  setIsModalOpen,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userId = useAppSelector((state) => state.userStore.user?._id);

  const isLoggedIn = useMemo(() => Boolean(userId), [userId]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const baseLink = `relative text-sm font-semibold transition-all duration-300`;
  const activeLink =
    'relative text-blue-800 font-medium after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:bg-gradient-to-r after:from-blue-300 after:to-blue-600 after:rounded-full after:transition-all after:duration-300';
  const inactiveLink =
    'relative text-gray-700 hover:text-blue-800 hover:after:absolute hover:after:inset-x-0 hover:after:-bottom-1 hover:after:h-[2px] hover:after:bg-gradient-to-r hover:after:from-blue-300 hover:to-blue-600 hover:rounded-full hover:transition-all hover:duration-300';

  const handleCTAClick = () => {
    if (!isLoggedIn) {
      setIsModalOpen(true);
    }else{
      router.push('/profile');
    }
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 w-full z-50 transition-all ${scrolled ? 'backdrop-blur bg-white/80 shadow-md' : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Logo />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map(({ label, href }) => (
            <motion.div key={href} initial="hidden" animate="visible" variants={linkItem}>
              <Link href={href} className={`${baseLink} ${pathname === href ? activeLink : inactiveLink}`}>
                {label}
              </Link>
            </motion.div>
          ))}

          {isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCTAClick}
              className="px-5 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-500 shadow-md hover:shadow-xl transition"
            >
              Dashboard
            </motion.button>
          ) : (
            <Link
              href="/meeting-sync?option=how-it-works"
              className="px-5 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-500 shadow-md hover:shadow-xl transition"
            >
              Get Started
            </Link>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="md:hidden focus:outline-none p-2 rounded-md"
        >
          {isMobileOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 180 }}
            className="md:hidden bg-white backdrop-blur shadow-lg px-6 py-6"
          >
            <ul className="flex flex-col gap-5">
              {NAV_LINKS.map(({ label, href }) => (
                <motion.li key={href} variants={linkItem}>
                  <Link
                    href={href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`${baseLink} ${pathname === href ? activeLink : inactiveLink}`}
                  >
                    {label}
                  </Link>
                </motion.li>
              ))}

              <motion.li variants={linkItem}>
                {isLoggedIn ? (
                  <button
                    onClick={handleCTAClick}
                    className="w-full py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-500 shadow-md"
                  >
                    Dashboard
                  </button>
                ) : (
                  <Link
                    href="/meeting-sync?option=how-it-works"
                    onClick={() => setIsMobileOpen(false)}
                    className="w-full block text-center py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-500 shadow-md"
                  >
                    Get Started
                  </Link>
                )}
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}