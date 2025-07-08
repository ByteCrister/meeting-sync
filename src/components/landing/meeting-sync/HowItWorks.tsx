'use client';

import { motion } from 'framer-motion';
import {
  CalendarPlus, LayoutTemplate, Smartphone, Clock, ShieldCheck,
  Users, Zap, Rocket, ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const STEPS = [
  {
    icon: <CalendarPlus />,
    title: 'Account Setup',
    desc: 'Sign up and personalize your availability, time zone, and preferences.',
    bulletPoints: ['Google/Outlook Sync', 'Time Zone Detection', 'Custom Buffers'],
    from: 'from-indigo-500', to: 'to-indigo-400',
  },
  {
    icon: <LayoutTemplate />,
    title: 'Create Scheduling Pages',
    desc: 'Build custom booking pages that reflect your brand and workflow.',
    bulletPoints: ['Custom Domains', 'Multiple Event Types', 'Branding Controls'],
    from: 'from-pink-500', to: 'to-pink-400',
  },
  {
    icon: <Smartphone />,
    title: 'Share Booking Links',
    desc: 'Share booking links via email, embed them, or use QR codes.',
    bulletPoints: ['One-click Sharing', 'QR Code Embed', 'Link Previews'],
    from: 'from-sky-500', to: 'to-sky-400',
  },
  {
    icon: <Clock />,
    title: 'Automated Reminders',
    desc: 'Reduce no-shows with email/SMS reminders and calendar invites.',
    bulletPoints: ['Custom Reminders', 'iCal & Google Invites', 'Follow-up Emails'],
    from: 'from-yellow-500', to: 'to-yellow-400',
  },
  {
    icon: <ShieldCheck />,
    title: 'Secure & Compliant',
    desc: 'We protect user data with strong encryption and privacy practices.',
    bulletPoints: ['GDPR Compliant', 'OAuth2 & SSO', 'Activity Logs'],
    from: 'from-red-500', to: 'to-red-400',
  },
  {
    icon: <Users />,
    title: 'Team Scheduling',
    desc: 'Round-robin, collective or one-to-one meetings across teams.',
    bulletPoints: ['Load Balancing', 'Shared Availability', 'Priority Routing'],
    from: 'from-purple-500', to: 'to-purple-400',
  },
  {
    icon: <Zap />,
    title: 'Integrations & Workflows',
    desc: 'Connect with CRMs, video tools, and thousands of Zapier apps.',
    bulletPoints: ['Zoom/Meet Integration', 'Zapier & Make.com', 'Webhooks'],
    from: 'from-emerald-500', to: 'to-emerald-400',
  },
  {
    icon: <Rocket />,
    title: 'Launch & Scale',
    desc: 'Monitor analytics, optimize bookings, and grow with ease.',
    bulletPoints: ['Analytics Dashboard', 'A/B Test Pages', 'Growth Insights'],
    from: 'from-orange-500', to: 'to-orange-400',
  },
];

const HowItWorks = () => {
  const router = useRouter();

  return (
    <section className="relative py-28 px-6 sm:px-12 bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-white text-4xl font-extrabold mb-16"
        >
          How Scheduling Becomes Effortless
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {STEPS.map((step, index) => (
            <motion.div
              key={index}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group perspective"
            >
              <div
                className={`relative transform transition-transform duration-500 group-hover:rotateX-6 group-hover:-rotate-y-6 group-hover:translate-z-10 bg-white/10 border border-white/10 p-6 rounded-3xl shadow-xl backdrop-blur-md`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className={`w-14 h-14 flex items-center justify-center rounded-full mb-4 text-white bg-gradient-to-br ${step.from} ${step.to}`}>
                  {step.icon}
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-white/80 mb-4">{step.desc}</p>
                <ul className="list-disc list-inside text-white/60 text-sm space-y-1">
                  {step.bulletPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-full hover:bg-white/20 backdrop-blur transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
