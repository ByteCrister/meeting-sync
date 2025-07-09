'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle,
  Cloud,
  Shield,
  Puzzle,
  BarChart2,
  WifiOff,
  Layers,
  Rocket,
  AlarmClock,
  Users,
  Server,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import Footer from '../unauthorized/Footer';

const FEATURES = [
  {
    id: 'analytics',
    title: 'Real-Time Analytics',
    icon: <BarChart2 className="w-8 h-8 text-white" />,
    description:
      'Track every event as it happens with live dashboards, custom KPIs, and smart alerts.',
    details: [
      'Instant chart updates',
      'Custom alert thresholds',
      'Exportable reports',
    ],
    bg: 'bg-gradient-to-r from-indigo-500 to-indigo-400',
    textColor: 'text-white',
  },
  {
    id: 'collaboration',
    title: 'Collaborative Workspace',
    icon: <Puzzle className="w-8 h-8 text-white" />,
    description:
      'Co-author docs, assign tasks, and chat inline—all in a secure, shared space.',
    details: ['Task boards & timelines', 'In-context chat threads', 'Version history'],
    bg: 'bg-white',
    textColor: 'text-gray-800',
  },
  {
    id: 'insights',
    title: 'AI-Powered Insights',
    icon: <Cloud className="w-8 h-8 text-white" />,
    description:
      'Let AI analyze your data, predict trends, and draft executive summaries.',
    details: [
      'Predictive trend modeling',
      'Natural language queries',
      'Auto-generated summaries',
    ],
    bg: 'bg-gradient-to-r from-pink-400 to-pink-300',
    textColor: 'text-white',
  },
  {
    id: 'security',
    title: 'Secure Cloud Storage',
    icon: <Shield className="w-8 h-8 text-white" />,
    description:
      '256-bit encryption, automated backups, and geo-redundant storage ensure zero downtime.',
    details: ['End-to-end encryption', 'Automated backups', 'Multi-region replication'],
    bg: 'bg-gray-50',
    textColor: 'text-gray-900',
  },
  {
    id: 'integrations',
    title: 'Custom Integrations',
    icon: <Puzzle className="w-8 h-8 text-white" />,
    description:
      'Connect to third-party tools via REST APIs, webhooks, or Zapier—no code needed.',
    details: ['Full REST API', 'Webhook listener', 'Zapier & Make support'],
    bg: 'bg-gradient-to-r from-green-400 to-green-300',
    textColor: 'text-white',
  },
  {
    id: 'offline',
    title: 'Offline Mode',
    icon: <WifiOff className="w-8 h-8 text-white" />,
    description:
      'Continue working without interruption even when you lose internet connectivity.',
    details: ['Local data caching', 'Seamless sync on reconnect', 'Conflict resolution'],
    bg: 'bg-gradient-to-r from-yellow-400 to-yellow-300',
    textColor: 'text-white',
  },
  {
    id: 'multi-calendar',
    title: 'Multi-Calendar Sync',
    icon: <Layers className="w-8 h-8 text-white" />,
    description:
      'Seamlessly manage events across Google, Outlook, Apple Calendar and more.',
    details: [
      'Unified calendar view',
      'Two-way sync with major platforms',
      'Conflict detection & merge logic',
    ],
    bg: 'bg-gradient-to-r from-cyan-500 to-blue-400',
    textColor: 'text-white',
  },
  {
    id: 'smart-reminders',
    title: 'Smart Reminders',
    icon: <AlarmClock className="w-8 h-8 text-white" />,
    description:
      'Get notified exactly when you need to act—across devices and platforms.',
    details: [
      'Smart rescheduling based on context',
      'In-app, email, and push reminders',
      'AI-based urgency detection',
    ],
    bg: 'bg-gradient-to-r from-red-400 to-pink-500',
    textColor: 'text-white',
  },
  {
    id: 'team-permissions',
    title: 'Advanced Team Permissions',
    icon: <Users className="w-8 h-8 text-white" />,
    description:
      'Delegate roles, control access, and manage user visibility across teams.',
    details: [
      'Granular access control',
      'Admin/moderator delegation',
      'Private vs public team settings',
    ],
    bg: 'bg-gradient-to-r from-violet-500 to-purple-400',
    textColor: 'text-white',
  },
  {
    id: 'performance',
    title: 'Lightning-Fast Performance',
    icon: <Rocket className="w-8 h-8 text-white" />,
    description:
      'Blazing-fast page loads, real-time sync, and smooth offline support.',
    details: [
      'Optimized with Next.js 15',
      'Edge-ready APIs',
      'Caching, preload, and prefetch',
    ],
    bg: 'bg-gradient-to-r from-orange-400 to-red-400',
    textColor: 'text-white',
  },
  {
    id: 'data-control',
    title: 'Data Ownership & Compliance',
    icon: <FileText className="w-8 h-8 text-white" />,
    description:
      'You fully control your data with export tools, GDPR, and privacy-first defaults.',
    details: [
      'Full data export anytime',
      'GDPR & CCPA compliant',
      'User-level data control',
    ],
    bg: 'bg-gradient-to-r from-gray-800 to-gray-700',
    textColor: 'text-white',
  },
  {
    id: 'infrastructure',
    title: 'Scalable Infrastructure',
    icon: <Server className="w-8 h-8 text-white" />,
    description:
      'Auto-scaling backend to handle thousands of users, meetings, and integrations.',
    details: [
      'Serverless edge compute',
      'Auto horizontal scaling',
      'Resilient fault-tolerant design',
    ],
    bg: 'bg-gradient-to-r from-teal-500 to-emerald-400',
    textColor: 'text-white',
  },
];

export default function Feature() {
  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <>
      <div className="space-y-20">
        {FEATURES.map((feat, idx) => (
          <motion.section
            id={feat.id}
            key={feat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
            className={`${feat.bg} ${feat.textColor} py-24 px-6 md:px-12`}
          >
            {/* Decorative Blob */}
            <motion.div
              className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10 mix-blend-multiply"
              style={{
                background: feat.bg.includes('to-') ? undefined : '',
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative max-w-3xl mx-auto text-center">
              <div
                className={`
                inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full
                ${feat.bg.includes('bg-white') ? 'bg-indigo-500' : 'bg-opacity-75'}
              `}
              >
                {feat.icon}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {feat.title}
              </h2>
              <p className="mb-6 text-lg">{feat.description}</p>
              <ul className="mx-auto max-w-md space-y-2 text-left">
                {feat.details.map((d) => (
                  <li key={d} className="flex items-start">
                    <CheckCircle
                      className={`w-5 h-5 flex-shrink-0 mt-1 mr-2 ${feat.textColor.startsWith('text-white')
                        ? 'text-white'
                        : 'text-indigo-500'
                        }`}
                    />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>
        ))}

        {/* Back to Home */}
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: FEATURES.length * 0.2 }}
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold rounded-full shadow-lg"
            >
              ← Back to Home
            </motion.button>
          </Link>
        </motion.div>
      </div>

      <Footer scrollToTop={scrollToTop} />
    </>
  );
}
