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
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <div className="w-4 h-4 bg-primary rounded-sm shadow-[0_2px_10px_rgba(99,102,241,0.4)]"></div>
                                </div>
                                <span className="font-bold text-xl tracking-tight text-textMain">
                                    PayOrchestrator
                                </span>
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
