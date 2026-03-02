import { motion } from 'framer-motion'

interface TimerRingProps {
    progress: number // 0-1
    size?: number
    strokeWidth?: number
    timeLeft: number
    state: 'idle' | 'focus' | 'break' | 'paused'
    label: string
}

export default function TimerRing({
    progress,
    size = 280,
    strokeWidth = 8,
    timeLeft,
    state,
    label,
}: TimerRingProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference * (1 - progress)

    // Color transitions: green → orange (50%) → red (80%)
    const getStrokeColor = () => {
        if (state === 'break') return '#3B82F6'
        if (state === 'idle') return 'rgba(91,91,214,0.3)'
        if (progress < 0.5) return '#10B981'
        if (progress < 0.8) return '#F59E0B'
        return '#EF4444'
    }

    const getTrackColor = () => {
        return state === 'idle' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)'
    }

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getTrackColor()}
                    strokeWidth={strokeWidth}
                />
                {/* Progress ring */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getStrokeColor()}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
                />
                {/* Glow effect */}
                {state !== 'idle' && (
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={getStrokeColor()}
                        strokeWidth={strokeWidth + 6}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        opacity={0.15}
                        style={{ transition: 'stroke-dashoffset 1s linear', filter: 'blur(8px)' }}
                    />
                )}
            </svg>

            {/* Center content */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
            }}>
                <motion.span
                    key={timeStr}
                    style={{
                        fontSize: 72,
                        fontWeight: 800,
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.02em',
                        color: 'var(--color-text-primary)',
                        lineHeight: 1,
                    }}
                >
                    {timeStr}
                </motion.span>
                <span style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: state === 'paused' ? '#F59E0B' : 'var(--color-text-muted)',
                    marginTop: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                }}>
                    {state === 'paused' ? '⏸ Paused' : label}
                </span>
            </div>
        </div>
    )
}
