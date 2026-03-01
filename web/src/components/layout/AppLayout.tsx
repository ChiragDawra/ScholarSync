import { Sidebar } from './Sidebar'

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: 260,
                padding: '32px 48px',
                maxWidth: 'calc(100vw - 260px)',
                minHeight: '100vh',
            }} className="animate-fade-in-up">
                {children}
            </main>
        </div>
    )
}
