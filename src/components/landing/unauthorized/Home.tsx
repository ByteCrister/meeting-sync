'use client';

import React, { useEffect, useState } from "react";
import FormModal from './FormModal';
import { useSessionSecureStorage } from '@/hooks/useSessionSecureStorage';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Hero from "./Hero";
import { useAppSelector } from "@/lib/hooks";


const advantages = [
  "Schedule Meetings with Ease",
  "Connect with Your Team",
  "Find Perfect Time Slots",
  "Boost Productivity",
  "Simplify Collaboration"
];

export default function Register() {
  const [currentAdvantage, setCurrentAdvantage] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [isModalOpen, setIsModalOpen] = useSessionSecureStorage<boolean>('isModalOpen', false, true);
  const isUserExist = useAppSelector(state => state.userStore.user?._id);

  // Scroll to hash on load
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.substring(1);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {

    const handleTyping = () => {
      const currentText = advantages[currentAdvantage];

      if (isDeleting) {
        setDisplayText(currentText.substring(0, displayText.length - 1));
        setTypingSpeed(75);
      } else {
        setDisplayText(currentText.substring(0, displayText.length + 1));
        setTypingSpeed(150);
      }

      if (!isDeleting && displayText === currentText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setCurrentAdvantage((prev) => (prev + 1) % advantages.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentAdvantage, typingSpeed]);

  // initialize AOS
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
      {/* Hero Section */}
      <Hero displayText={displayText} setIsModalOpen={setIsModalOpen} />
      {!isUserExist && (<FormModal open={isModalOpen} onOpenChange={setIsModalOpen} />)}
    </div>

  );
}