/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        hand: ['Caveat', 'Shadows Into Light', 'cursive'],
        sketch: ['Patrick Hand', 'Caveat', 'cursive'],
        display: ['Caveat', 'cursive'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Handwritten UI colors
        'paper-cream': '#fefcf6',
        'paper-warm': '#faf6eb',
        'paper-aged': '#f5efe0',
        'paper-bg': '#faf6eb',
        'ink': '#1a1a2e',
        'ink-black': '#1a1a2e',
        'ink-dark': '#2c2c54',
        'ink-blue': '#4361ee',
        'ink-red': '#e63946',
        'ink-green': '#2a9d8f',
        'ink-purple': '#9b5de5',
        'ink-orange': '#f77f00',
        'ink-teal': '#00b4d8',
        'pencil': '#6b7280',
        'highlight-yellow': '#fff3b0',
        'highlight-pink': '#fecdd3',
        'highlight-blue': '#bfdbfe',
        'highlight-green': '#bbf7d0',
        'highlight-purple': '#ddd6fe',
        'highlight-orange': '#fed7aa',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'sketchy': '255px 15px 225px 15px/15px 225px 15px 255px',
        'blob': '60% 40% 30% 70%/60% 30% 70% 40%',
      },
      boxShadow: {
        'sketchy': '4px 4px 0px #1a1a2e',
        'sketchy-sm': '2px 2px 0px #1a1a2e',
        'sketchy-lg': '6px 6px 0px #1a1a2e',
        'soft': '0 4px 20px rgba(26, 26, 46, 0.08)',
        'glow': '0 0 40px rgba(67, 97, 238, 0.3)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(-1deg)" },
          "50%": { transform: "translateY(-12px) rotate(1deg)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-1.5deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0)", opacity: 0 },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        "blob-morph": {
          "0%, 100%": { borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40%/50% 60% 30% 60%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in": "slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-slow": "pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "wiggle": "wiggle 3s ease-in-out infinite",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "blob-morph": "blob-morph 8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
