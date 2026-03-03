import { useState, useRef, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface TimePickerProps {
    value: string   // 'HH:mm'
    onChange: (value: string) => void
    placeholder?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

export function TimePicker({ value, onChange, placeholder = 'Select time' }: TimePickerProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const [selHour, selMin] = value ? value.split(':').map(Number) : [9, 0]

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const formatHour = (h: number) => {
        const hr12 = h === 0 ? 12 : h > 12 ? h - 12 : h
        const ampm = h < 12 ? 'AM' : 'PM'
        return { label: `${hr12}`, ampm }
    }

    const selectTime = (h: number, m: number) => {
        const hh = String(h).padStart(2, '0')
        const mm = String(m).padStart(2, '0')
        onChange(`${hh}:${mm}`)
        setOpen(false)
    }

    const displayValue = value
        ? (() => {
            const { label, ampm } = formatHour(selHour)
            return `${label}:${String(selMin).padStart(2, '0')} ${ampm}`
        })()
        : placeholder

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%', height: 40, padding: '0 16px',
                    background: 'var(--color-bg-input)',
                    border: `1px solid ${open ? 'var(--color-brand)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    fontSize: 14, fontFamily: 'var(--font-sans)',
                    cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'border-color 150ms ease',
                }}
            >
                <span>{displayValue}</span>
                <Clock size={16} color="var(--color-text-muted)" />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                    zIndex: 200, width: 260,
                    background: 'var(--color-bg-surface)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                    padding: 16,
                    animation: 'fadeInUp 150ms ease-out',
                }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {/* Hours column */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)',
                                textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em',
                            }}>
                                Hour
                            </div>
                            <div style={{
                                maxHeight: 200, overflowY: 'auto',
                                display: 'flex', flexDirection: 'column', gap: 2,
                            }}>
                                {HOURS.map(h => {
                                    const { label, ampm } = formatHour(h)
                                    const isActive = h === selHour
                                    return (
                                        <button
                                            type="button"
                                            key={h}
                                            onClick={() => selectTime(h, selMin)}
                                            style={{
                                                padding: '5px 10px',
                                                borderRadius: 'var(--radius-sm)',
                                                border: 'none',
                                                background: isActive ? 'var(--color-brand)' : 'transparent',
                                                color: isActive ? 'white' : 'var(--color-text-primary)',
                                                fontSize: 13, fontWeight: isActive ? 600 : 400,
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                display: 'flex', justifyContent: 'space-between',
                                                transition: 'all 100ms ease',
                                            }}
                                            onMouseEnter={e => {
                                                if (!isActive) (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                                            }}
                                            onMouseLeave={e => {
                                                if (!isActive) (e.target as HTMLElement).style.background = 'transparent'
                                            }}
                                        >
                                            <span>{label}</span>
                                            <span style={{
                                                fontSize: 10, color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)',
                                            }}>
                                                {ampm}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />

                        {/* Minutes column */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)',
                                textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em',
                            }}>
                                Min
                            </div>
                            <div style={{
                                maxHeight: 200, overflowY: 'auto',
                                display: 'flex', flexDirection: 'column', gap: 2,
                            }}>
                                {MINUTES.map(m => {
                                    const isActive = m === selMin
                                    return (
                                        <button
                                            type="button"
                                            key={m}
                                            onClick={() => selectTime(selHour, m)}
                                            style={{
                                                padding: '5px 10px',
                                                borderRadius: 'var(--radius-sm)',
                                                border: 'none',
                                                background: isActive ? 'var(--color-brand)' : 'transparent',
                                                color: isActive ? 'white' : 'var(--color-text-primary)',
                                                fontSize: 13, fontWeight: isActive ? 600 : 400,
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 100ms ease',
                                            }}
                                            onMouseEnter={e => {
                                                if (!isActive) (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                                            }}
                                            onMouseLeave={e => {
                                                if (!isActive) (e.target as HTMLElement).style.background = 'transparent'
                                            }}
                                        >
                                            :{String(m).padStart(2, '0')}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
