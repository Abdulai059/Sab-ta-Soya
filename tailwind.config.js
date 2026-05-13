/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        'brand-primary': '#9dc43b',
        'brand-soft': '#d5f6e5',
        'brand-muted': '#f4fdf8',
        'brand-highlight': '#e7f68f',
        
        // Status Colors
        'status-danger': '#ef4444',
        'status-info': '#14b8a6',
        'status-warning': '#facc15',
        
        // Surface Colors
        'surface-page': '#ffffff',
        'surface-raised': '#f9fafb',
        'surface-sunken': '#f3f4f6',
        'surface-overlay': '#e5e7eb',
        
        // Text Colors
        'text-primary': '#111827',
        'text-secondary': '#4b5563',
        'text-muted': '#9ca3af',
        'text-inverted': '#ffffff',
        
        // Border Colors
        'border-default': '#e5e7eb',
        'border-strong': '#d1d5db',
        'border-subtle': '#f3f4f6',
        
        // Interactive Colors
        'interactive-default': '#2563eb',
        'interactive-hover': '#1e40af',
        
        // Dark UI Colors
        'dark-bg': '#171717',
        'dark-surface': '#262626',
        'dark-raised': '#2f2f2f',
        'dark-text': '#ededed',
        'dark-muted': '#d4d4d4',
      },
    },
  },
  plugins: [],
}
