import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background text-textMain selection:bg-primary/30">
                <nav className="border-b border-borderLight bg-white/70 backdrop-blur-xl sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-[0_2px_12px_rgba(99,102,241,0.45)]">
                                    <span className="text-white font-black text-base tracking-tight">N</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-xl tracking-tight text-textMain">NexusPay</span>
                                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">ORCHESTRATOR</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
                    <div className="absolute inset-0 bg-mesh pointer-events-none -z-10 absolute-background"></div>

                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
