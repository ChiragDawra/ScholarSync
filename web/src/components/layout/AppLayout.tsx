import { Sidebar } from './Sidebar'

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main className="app-main animate-fade-in-up">
                {children}
            </main>
        </div>
    )
}
