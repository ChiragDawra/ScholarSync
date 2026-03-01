import { motion } from 'framer-motion'

export default function DashboardWireframe() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 1.4, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            style={{ perspective: 1200, maxWidth: 900, width: '100%', margin: '0 auto' }}
        >
            <div style={{
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(15,15,25,0.8)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(91,91,214,0.08)',
                overflow: 'hidden',
            }}>
                {/* Browser chrome */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
                    <div style={{
                        flex: 1, marginLeft: 12, padding: '4px 12px',
                        borderRadius: 6, background: 'rgba(255,255,255,0.04)',
                        fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center',
                    }}>
                        scholarsync.app
                    </div>
                </div>

                {/* Dashboard content */}
                <svg
                    viewBox="0 0 880 480"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: '100%', display: 'block' }}
                >
                    {/* Sidebar */}
                    <rect x="0" y="0" width="200" height="480" fill="rgba(255,255,255,0.02)" />
                    <line x1="200" y1="0" x2="200" y2="480" stroke="rgba(255,255,255,0.06)" />

                    {/* Sidebar logo */}
                    <rect x="20" y="20" width="32" height="32" rx="8" fill="#5B5BD6" opacity="0.8" />
                    <text x="60" y="42" fontSize="14" fontWeight="700" fill="rgba(255,255,255,0.9)" fontFamily="system-ui">ScholarSync</text>

                    {/* Sidebar nav items */}
                    {[
                        { y: 80, label: 'Dashboard', active: true },
                        { y: 112, label: 'Exams', active: false },
                        { y: 144, label: 'Assignments', active: false },
                        { y: 176, label: 'Pomodoro', active: false },
                        { y: 208, label: 'Goals', active: false },
                        { y: 240, label: 'Analytics', active: false },
                        { y: 272, label: 'GPA Predictor', active: false },
                        { y: 304, label: 'AI Coach', active: false },
                    ].map((item) => (
                        <g key={item.label}>
                            {item.active && (
                                <rect x="8" y={item.y - 4} width="184" height="28" rx="6" fill="rgba(91,91,214,0.12)" />
                            )}
                            <circle cx="28" cy={item.y + 10} r="4" fill={item.active ? '#5B5BD6' : 'rgba(255,255,255,0.15)'} />
                            <text
                                x="42" y={item.y + 14}
                                fontSize="11" fontFamily="system-ui"
                                fill={item.active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)'}
                                fontWeight={item.active ? '600' : '400'}
                            >
                                {item.label}
                            </text>
                        </g>
                    ))}

                    {/* User avatar at bottom */}
                    <circle cx="36" cy="450" r="14" fill="rgba(91,91,214,0.3)" stroke="rgba(91,91,214,0.5)" strokeWidth="1" />
                    <rect x="58" y="442" width="60" height="8" rx="4" fill="rgba(255,255,255,0.15)" />
                    <rect x="58" y="454" width="40" height="6" rx="3" fill="rgba(255,255,255,0.08)" />

                    {/* ─── Main content ─── */}
                    {/* Greeting */}
                    <rect x="224" y="24" width="180" height="14" rx="7" fill="rgba(255,255,255,0.12)" />
                    <rect x="224" y="44" width="120" height="10" rx="5" fill="rgba(255,255,255,0.06)" />

                    {/* Stat cards row */}
                    {[
                        { x: 224, color: '#6366F1', label: 'Study Hours', value: '12.5' },
                        { x: 387, color: '#F97316', label: 'Day Streak', value: '24' },
                        { x: 550, color: '#10B981', label: 'Exams', value: '3' },
                        { x: 713, color: '#A855F7', label: 'Focus', value: '87%' },
                    ].map((card) => (
                        <g key={card.label}>
                            <rect x={card.x} y="70" width="148" height="80" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                            <circle cx={card.x + 20} cy={90} r="8" fill={`${card.color}25`} />
                            <circle cx={card.x + 20} cy={90} r="3" fill={card.color} />
                            <text x={card.x + 16} y={118} fontSize="18" fontWeight="700" fill="rgba(255,255,255,0.85)" fontFamily="system-ui">{card.value}</text>
                            <text x={card.x + 16} y={134} fontSize="9" fill="rgba(255,255,255,0.35)" fontFamily="system-ui">{card.label}</text>
                        </g>
                    ))}

                    {/* Heatmap section */}
                    <rect x="224" y="168" width="420" height="140" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <text x="240" y="192" fontSize="11" fontWeight="600" fill="rgba(255,255,255,0.6)" fontFamily="system-ui">Study Consistency</text>

                    {/* Heatmap grid */}
                    {Array.from({ length: 20 }, (_, col) =>
                        Array.from({ length: 5 }, (_, row) => {
                            const intensity = Math.random()
                            let fill = 'rgba(255,255,255,0.03)'
                            if (intensity > 0.8) fill = '#5B5BD6'
                            else if (intensity > 0.6) fill = 'rgba(91,91,214,0.6)'
                            else if (intensity > 0.4) fill = 'rgba(91,91,214,0.3)'
                            else if (intensity > 0.25) fill = 'rgba(91,91,214,0.12)'
                            return (
                                <rect
                                    key={`${col}-${row}`}
                                    x={240 + col * 19}
                                    y={206 + row * 19}
                                    width="14" height="14" rx="3"
                                    fill={fill}
                                />
                            )
                        })
                    )}

                    {/* Today's Schedule */}
                    <rect x="660" y="168" width="200" height="140" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <text x="676" y="192" fontSize="11" fontWeight="600" fill="rgba(255,255,255,0.6)" fontFamily="system-ui">Today's Schedule</text>

                    {/* Schedule items */}
                    {[
                        { y: 210, time: '9:00', title: 'Physics', color: '#6366F1' },
                        { y: 238, time: '11:00', title: 'Calculus', color: '#10B981' },
                        { y: 266, time: '2:00', title: 'CS Lab', color: '#F97316' },
                    ].map((item) => (
                        <g key={item.title}>
                            <line x1="694" y1={item.y} x2="694" y2={item.y + 22} stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                            <circle cx="694" cy={item.y + 4} r="3" fill={item.color} />
                            <text x="706" y={item.y + 6} fontSize="8" fill="rgba(255,255,255,0.35)" fontFamily="system-ui">{item.time}</text>
                            <text x="706" y={item.y + 18} fontSize="10" fill="rgba(255,255,255,0.7)" fontFamily="system-ui">{item.title}</text>
                        </g>
                    ))}

                    {/* AI Insight card */}
                    <rect x="224" y="324" width="636" height="80" rx="10" fill="rgba(91,91,214,0.04)" stroke="rgba(91,91,214,0.15)" strokeWidth="1" />
                    <circle cx="256" cy="364" r="16" fill="rgba(91,91,214,0.15)" />
                    <text x="252" y="368" fontSize="14" textAnchor="middle" fill="#5B5BD6">✦</text>
                    <text x="284" y="352" fontSize="10" fontWeight="600" fill="rgba(255,255,255,0.7)" fontFamily="system-ui">AI Study Coach</text>
                    <text x="284" y="368" fontSize="9" fill="rgba(255,255,255,0.35)" fontFamily="system-ui">Based on your patterns, switch to Calculus before 4pm for a 23% retention boost.</text>
                    <rect x="284" y="380" width="52" height="16" rx="8" fill="rgba(91,91,214,0.15)" />
                    <text x="293" y="391" fontSize="8" fill="#5B5BD6" fontFamily="system-ui">Action</text>
                    <rect x="344" y="380" width="52" height="16" rx="8" fill="rgba(255,255,255,0.04)" />
                    <text x="355" y="391" fontSize="8" fill="rgba(255,255,255,0.35)" fontFamily="system-ui">Dismiss</text>

                    {/* Floating gradient accent */}
                    <defs>
                        <linearGradient id="cardGlow" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#5B5BD6" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                    <rect x="224" y="420" width="200" height="50" rx="10" fill="url(#cardGlow)" stroke="rgba(91,91,214,0.1)" strokeWidth="1" />
                    <rect x="240" y="432" width="80" height="8" rx="4" fill="rgba(255,255,255,0.12)" />
                    <rect x="240" y="446" width="120" height="6" rx="3" fill="rgba(255,255,255,0.06)" />

                    <rect x="440" y="420" width="200" height="50" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <rect x="456" y="432" width="80" height="8" rx="4" fill="rgba(255,255,255,0.12)" />
                    <rect x="456" y="446" width="120" height="6" rx="3" fill="rgba(255,255,255,0.06)" />

                    <rect x="660" y="420" width="200" height="50" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <rect x="676" y="432" width="80" height="8" rx="4" fill="rgba(255,255,255,0.12)" />
                    <rect x="676" y="446" width="120" height="6" rx="3" fill="rgba(255,255,255,0.06)" />
                </svg>
            </div>

            {/* Reflection glow underneath */}
            <div style={{
                width: '70%',
                height: 60,
                margin: '-10px auto 0',
                background: 'radial-gradient(ellipse, rgba(91,91,214,0.15) 0%, transparent 70%)',
                filter: 'blur(20px)',
            }} />
        </motion.div>
    )
}
