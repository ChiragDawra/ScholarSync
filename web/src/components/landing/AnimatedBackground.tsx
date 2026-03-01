import { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    opacity: number
    color: string
}

const COLORS = ['#5B5BD6', '#7C3AED', '#A855F7', '#EC4899', '#6366F1']

export default function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationId: number
        let particles: Particle[] = []

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        // Create particles
        const count = Math.min(80, Math.floor(window.innerWidth / 18))
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
            })
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 150) {
                        const alpha = (1 - dist / 150) * 0.08
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(91, 91, 214, ${alpha})`
                        ctx.lineWidth = 0.5
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.stroke()
                    }
                }
            }

            // Draw & update particles
            for (const p of particles) {
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
                ctx.fillStyle = p.color.replace(')', `, ${p.opacity})`).replace('rgb', 'rgba').replace('#', '')
                // Use hex to rgba conversion
                const r = parseInt(p.color.slice(1, 3), 16)
                const g = parseInt(p.color.slice(3, 5), 16)
                const b = parseInt(p.color.slice(5, 7), 16)
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`
                ctx.fill()

                // Glow effect for brighter particles
                if (p.opacity > 0.3) {
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.15})`
                    ctx.fill()
                }

                p.x += p.vx
                p.y += p.vy

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1
            }

            animationId = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />
    )
}
