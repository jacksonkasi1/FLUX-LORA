import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1.25rem',
			screens: {
				'sm': '425px',
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				'apple-blue': '#007AFF',
				'apple-gray': {
					50: '#F2F2F7',
					100: '#E5E5EA',
					200: '#D1D1D6',
					300: '#C7C7CC',
					400: '#AEAEB2',
					500: '#8E8E93',
					600: '#636366',
					700: '#48484A',
					800: '#3A3A3C',
					900: '#1C1C1E',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'apple': '12px',
			},
			spacing: {
				'apple-xs': '0.5rem',
				'apple-sm': '1rem',
				'apple-md': '1.5rem',
				'apple-lg': '2rem',
				'apple-xl': '3rem',
				'safe-bottom': '2.125rem',
				'nav-height': '5rem',
			},
			fontSize: {
				'large-title': ['34px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
				'title-1': ['28px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '400' }],
				'title-2': ['22px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
				'body': ['17px', { lineHeight: '1.4', fontWeight: '400' }],
				'caption': ['12px', { lineHeight: '1.3', letterSpacing: '0.01em', fontWeight: '400' }],
			},
			fontFamily: {
				'apple': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
			},
			boxShadow: {
				'apple': '0 2px 10px rgba(0, 0, 0, 0.1)',
				'apple-hover': '0 4px 20px rgba(0, 0, 0, 0.15)',
				'apple-pressed': '0 1px 5px rgba(0, 0, 0, 0.2)',
			},
			backdropBlur: {
				'apple': '20px',
			},
			transitionTimingFunction: {
				'apple': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'apple-quick': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			},
			transitionDuration: {
				'apple': '300ms',
				'apple-quick': '150ms',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
