import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />
            {/* Desktop: ml-60 offsets content past the fixed sidebar. Mobile: pt-14 clears the top bar. */}
            <div className="md:ml-60 pt-14 md:pt-0 min-h-screen">
                {children}
            </div>
        </div>
    );
}
