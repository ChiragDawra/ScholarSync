/**
 * Hero background — loops a video seamlessly with a dark overlay
 * so the text content remains readable on top.
 */
export default function AnimatedBackground() {
    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                zIndex: 0,
            }}
        >
            {/* Looping video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    minWidth: '100%',
                    minHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    transform: 'translate(-50%, -50%) scale(1.35)',
                    objectFit: 'cover',
                    opacity: 0.7,
                }}
            >
                <source src="/hero-bg.mp4" type="video/mp4" />
            </video>

            {/* Dark gradient overlay for text readability */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(180deg, rgba(10,10,20,0.15) 0%, rgba(10,10,20,0.3) 50%, rgba(10,10,20,0.75) 100%)',
                    zIndex: 1,
                }}
            />

            {/* Vignette edges */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    boxShadow: 'inset 0 0 150px 40px rgba(0,0,0,0.3)',
                    zIndex: 2,
                    pointerEvents: 'none',
                }}
            />
        </div>
    )
}
