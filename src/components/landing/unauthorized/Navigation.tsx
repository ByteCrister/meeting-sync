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
  const isFetching = useAppSelector((state) => state.userStore.fetching);

  const isLoggedIn = useMemo(() => Boolean(userId), [userId]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const baseLink = `relative text-sm font-semibold transition-all duration-300`;
  const activeLink =
    'relative text-[#1A365D] font-semibold after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:bg-gradient-to-r after:from-[#3B82F6] after:to-[#8B5CF6] after:rounded-full after:transition-all after:duration-300';
  const inactiveLink =
    'relative text-[#64748B] hover:text-[#1A365D] hover:after:absolute hover:after:inset-x-0 hover:after:-bottom-1 hover:after:h-[2px] hover:after:bg-gradient-to-r hover:after:from-[#3B82F6] hover:after:to-[#8B5CF6] hover:after:rounded-full hover:after:transition-all hover:after:duration-300';

  const handleCTAClick = () => {
    if (!isLoggedIn) {
      setIsModalOpen(true);
    } else {
      router.push('/profile');
    }
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 w-full z-50 transition-all ${scrolled ? 'backdrop-blur bg-white/95 shadow-md border-b border-[#E2E8F0]' : 'bg-transparent'
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
              whileHover={!isFetching ? { scale: 1.05 } : {}}
              whileTap={!isFetching ? { scale: 0.95 } : {}}
              onClick={() => {
                if (isFetching) return;
                handleCTAClick();
              }}
              disabled={isFetching}
              className={`
            px-6 py-2.5 rounded-xl font-semibold text-white
            bg-[#1A365D]
            shadow-md transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.15)]
            ${isFetching
                  ? "cursor-not-allowed opacity-80"
                  : "hover:bg-[#2D4A7C] hover:shadow-lg"}
          `}
            >
              {isFetching ? <ButtonLoader /> : "Dashboard"}
            </motion.button>
          ) : (
            <Link
              href="/meeting-sync?option=how-it-works"
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.15)]"
            >
              Get Started
            </Link>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="md:hidden focus:outline-none p-2 rounded-md hover:bg-[#F1F5F9] transition-colors"
        >
          {isMobileOpen ? <X className="w-6 h-6 text-[#0F172A]" /> : <Menu className="w-6 h-6 text-[#0F172A]" />}
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
            className="md:hidden bg-white backdrop-blur shadow-lg px-6 py-6 border-t border-[#E2E8F0]"
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

              <motion.li variants={linkItem} className="mt-2">
                {isLoggedIn ? (
                  <motion.button
                    onClick={() => {
                      if (isFetching) return;
                      handleCTAClick();
                    }}
                    disabled={isFetching}
                    whileTap={!isFetching ? { scale: 0.97 } : {}}
                    className={`
                    w-full py-3 rounded-xl font-semibold text-white
                    bg-[#1A365D]
                    shadow-md transition-all duration-300
                    ${isFetching
                        ? "cursor-not-allowed opacity-80"
                        : "hover:bg-[#2D4A7C]"}
                  `}
                  >
                    {isFetching ? <ButtonLoader /> : "Dashboard"}
                  </motion.button>
                ) : (
                  <Link
                    href="/meeting-sync?option=how-it-works"
                    onClick={() => setIsMobileOpen(false)}
                    className="w-full block text-center py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] shadow-md transition-all duration-300"
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


const ButtonLoader = () => (
  <motion.span
    className="flex items-center gap-2"
    initial="idle"
    animate="loading"
    variants={{
      loading: {
        transition: {
          staggerChildren: 0.15,
          repeat: Infinity,
        },
      },
    }}
  >
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1.5 h-1.5 bg-white rounded-full"
        variants={{
          idle: { opacity: 0.3, y: 0 },
          loading: {
            opacity: [0.3, 1, 0.3],
            y: [0, -4, 0],
          },
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    ))}
  </motion.span>
);
