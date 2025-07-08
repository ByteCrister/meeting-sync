'use client';

import React, { useRef } from 'react'
import { FaCalendarCheck, FaUsers, FaSyncAlt, FaShieldAlt } from "react-icons/fa";
import { motion, useReducedMotion } from 'framer-motion';
import * as RiIcons from 'react-icons/ri';
import { useRouter } from "next/navigation";
const sectionVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" },
    },
};
const extendedFeatures = [
    {
        title: 'Organize Smarter',
        desc: 'Create, edit, and cancel meetings in seconds.',
        Icon: RiIcons.RiCalendarCheckFill,
        from: 'from-indigo-500',
        to: 'to-purple-500'
    },
    {
        title: 'Time Zone Friendly',
        desc: 'Perfectly sync meetings regardless of where your team is.',
        Icon: RiIcons.RiMapPinTimeLine,
        from: 'from-teal-400',
        to: 'to-blue-500'
    },
    {
        title: 'Sort & Filter',
        desc: 'Filter by date, status, or members to find what matters.',
        Icon: RiIcons.RiFilter2Fill,
        from: 'from-yellow-400',
        to: 'to-red-400'
    },
    {
        title: 'Friend Sync',
        desc: 'Auto-sync with your contacts and avoid double-booking.',
        Icon: RiIcons.RiUserSharedFill,
        from: 'from-green-400',
        to: 'to-emerald-500'
    },
];

const roadmap = [
    {
        id: "smart-scheduling",
        title: "Smart Scheduling",
        desc: "Find the best time for everyone with smart conflict detection and time-zone awareness.",
        icon: FaCalendarCheck,
        bg: "bg-secondary/20",
        screenshot: "/screenshots/scheduling.png",
        bullets: [
            "Instant conflict detection across teams",
            "Time-zone aware slot suggestion",
            "Customizable meeting durations",
            "Drag-and-drop calendar UI",
        ],
        walkthrough: [
            "Click on 'Create Meeting' from the dashboard.",
            "Select participants and preferred time ranges.",
            "System suggests optimal time slots avoiding conflicts.",
            "Review and confirm the final schedule.",
        ],
    },
    {
        id: "team-collaboration",
        title: "Team Collaboration",
        desc: "Collaborate in real time with shared agendas, live notes, and integrated chat.",
        icon: FaUsers,
        bg: "bg-secondary/20",
        screenshot: "/screenshots/collab.png",
        bullets: [
            "Shared agendas & roles assignment",
            "Live note-taking with markdown",
            "Real-time task tracking",
            "Integrated chat & reactions",
        ],
        walkthrough: [
            "Invite team members to a meeting.",
            "Assign agenda topics and participant roles.",
            "Take shared notes during the session.",
            "Track assigned tasks and follow-up actions in real time.",
        ],
    },
    {
        id: "auto-sync",
        title: "Auto Sync",
        desc: "Keep all your calendars up to date automatically with instant sync and notifications.",
        icon: FaSyncAlt,
        bg: "bg-secondary/20",
        screenshot: "/screenshots/sync.png",
        bullets: [
            "One-click calendar updates",
            "Webhook notifications",
            "Bi-directional API integration",
            "Offline sync support",
        ],
        walkthrough: [
            "Connect your calendar under settings.",
            "Enable auto-sync for real-time updates.",
            "Changes in external calendars reflect instantly.",
            "Receive notifications on changes and conflicts.",
        ],
    },
    {
        id: "secure-access",
        title: "Secure Access",
        desc: "Enterprise-grade security with SSO, encryption, and detailed audit logs.",
        icon: FaShieldAlt,
        bg: "bg-secondary/20",
        screenshot: "/screenshots/security.png",
        bullets: [
            "SSO with SAML & OAuth2",
            "AES-256 data encryption",
            "Role-based access controls",
            "Audit logs & compliance reports",
        ],
        walkthrough: [
            "Sign in using SSO or OAuth2 credentials.",
            "Access is granted based on assigned roles.",
            "All data is encrypted both in transit and at rest.",
            "Admins can view logs and generate compliance reports.",
        ],
    },
];

const Hero = ({ displayText, setIsModalOpen }: { displayText: string, setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const router = useRouter();
    const prefersReduced = useReducedMotion();
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    return (
        <main className="container mx-auto px-4 py-16 pt-24">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-display min-h-[120px] md:min-h-[160px]">
                    {displayText}
                    <span className="animate-pulse">|</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Connect, collaborate, and coordinate with your team effortlessly. MeetSync makes scheduling meetings simple and efficient.
                </p>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl hover:scale-105 transform transition-all duration-300"
                >
                    Start Scheduling Now
                </button>
            </div>

            {/* Features Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                {[
                    {
                        title: 'Smart Scheduling',
                        desc: 'Find the perfect time for everyone with intelligent scheduling algorithms.',
                        iconColor: 'blue'
                    },
                    {
                        title: 'Team Collaboration',
                        desc: 'Connect with your team members and manage meetings efficiently.',
                        iconColor: 'purple'
                    },
                    {
                        title: 'Reliable Platform',
                        desc: 'Trust in a secure and reliable platform for all your meeting needs.',
                        iconColor: 'green'
                    },
                ].map(({ title, desc, iconColor }, i) => (
                    <div
                        key={i}
                        className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                    >
                        <div className={`w-14 h-14 bg-${iconColor}-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-${iconColor}-200 transition-colors duration-300`}>
                            <svg className={`w-7 h-7 text-${iconColor}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                            {title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">{desc}</p>
                    </div>
                ))}
            </section>

            {/* Extended Features */}
            <section className="mt-32 text-center px-4">
                <h2
                    className="text-4xl font-bold text-gray-800 mb-4"
                    data-aos="fade-down"
                >
                    Why MeetSync?
                </h2>
                <p
                    className="text-lg text-gray-600 max-w-2xl mx-auto mb-12"
                    data-aos="fade-up"
                >
                    MeetSync is more than just a scheduler — it’s your team’s time wizard.
                    Streamline how you meet, manage calendars, and sync with your squad
                    across time zones.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {extendedFeatures.map(({ title, desc, Icon, from, to }) => (
                        <motion.div
                            key={title}
                            className={`
                relative overflow-hidden rounded-3xl p-8
                bg-gradient-to-br ${from} ${to}
                shadow-2xl transform transition-all duration-500
                group
              `}
                            data-aos="zoom-in"
                            whileHover={{ y: -10, rotate: 1 }}
                        >
                            {/* decorative circles */}
                            <span className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></span>
                            <span className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-500"></span>

                            <Icon
                                className="w-10 h-10 text-white mb-4 animate-spin-slow group-hover:animate-spin-fast"
                            />

                            <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
                            <p className="text-white text-sm leading-relaxed">{desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ****** */}

            <div className="font-sans text-gray-900 bg-gradient-to-b from-gray-50 to-gray-100">
                {/* Roadmap Bar */}
                <section className="mt-24 px-4 sm:px-6">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" data-aos="fade-down">
                        Your Meeting Journey
                    </h2>

                    <div className="relative">
                        {!prefersReduced && (
                            <motion.div
                                className="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-indigo-400 to-purple-400"
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                                style={{ transformOrigin: "left center" }}
                            />
                        )}

                        <div className="flex flex-wrap justify-center gap-6 relative z-10">
                            {roadmap.map(({ id, title, icon: Icon }, i) => (
                                <motion.button
                                    key={id}
                                    onClick={() => {
                                        router.replace(`#${id}`);
                                        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="flex flex-col items-center w-36 md:w-44 focus:outline-none rounded-lg transition-all duration-300 hover:scale-105"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.2 }}
                                    whileHover={!prefersReduced ? { scale: 1.1 } : {}}
                                >
                                    <div className="w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center mb-3 border-2 border-indigo-300">
                                        <Icon className="w-10 h-10 text-indigo-600" />
                                    </div>
                                    <span className="text-sm sm:text-base font-medium text-gray-800 text-center">{title}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Feature Sections */}
                {roadmap.map((feat) => (
                    <motion.section
                        key={feat.id}
                        id={feat.id}
                        ref={(el) => {
                            sectionRefs.current[feat.id] = el as HTMLDivElement | null;
                        }}
                        className={`py-16 sm:py-32 px-4 sm:px-6`}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={sectionVariant}
                    >
                        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Icon Preview */}
                            <div className="space-y-8 text-center lg:text-left">
                                <div className="w-48 h-48 mx-auto lg:mx-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl shadow-inner border-2 border-indigo-200">
                                    <feat.icon className="text-indigo-500 w-20 h-20" />
                                </div>
                                <p className="text-xl text-gray-700">{feat.desc || 'Enhance productivity with this powerful feature.'}</p>
                            </div>

                            {/* Right: Content */}
                            <div>
                                <h3 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">{feat.title}</h3>

                                <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 mb-8">
                                    {feat.bullets.map((b, idx) => (
                                        <li key={idx}>{b}</li>
                                    ))}
                                </ul>

                                <div className="mb-8 text-left">
                                    <h4 className="text-xl font-semibold mb-2 text-gray-800">How it works:</h4>
                                    <ol className="list-decimal list-inside text-gray-700 space-y-1">
                                        {feat.walkthrough?.map((step, i) => (
                                            <li key={i}>{step}</li>
                                        ))}
                                    </ol>
                                </div>

                                <motion.button
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.07 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                >
                                    Explore Feature
                                </motion.button>
                            </div>
                        </div>
                    </motion.section>
                ))}
            </div>
        </main>
    )
}

export default Hero