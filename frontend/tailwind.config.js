/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#f7f9fc',
                surface: '#ffffff',
                primary: '#6366f1',
                primaryHover: '#4f46e5',
                success: '#10b981',
                successBg: '#d1fae5',
                danger: '#ef4444',
                dangerBg: '#fee2e2',
                warning: '#f59e0b',
                warningBg: '#fef3c7',
                textMain: '#111827',
                textMuted: '#6b7280',
                borderLight: '#e5e7eb'
            },
            boxShadow: {
                'stripe': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'stripe-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
                'stripe-modal': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            }
        },
    },
    plugins: [],
}
