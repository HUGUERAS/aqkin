import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // =============================================
        // EXISTING BRAND PALETTES (preserved)
        // =============================================
        bronze: {
          50: '#FDF5EC',
          100: '#FAE6C8',
          200: '#F5D4A6',
          300: '#F0C18A',
          400: '#E5A35C',
          500: '#D99A5C',
          600: '#CD7F32',
          700: '#B87333',
          800: '#9A6428',
          900: '#7A4F1E',
          950: '#5A3A18',
        },
        navy: {
          50: '#E6F0F9',
          100: '#1A6BAF',
          200: '#0A5199',
          300: '#004080',
          400: '#003366',
          500: '#002850',
          600: '#001F3F',
          700: '#001529',
          800: '#001020',
          900: '#000814',
          950: '#000509',
        },
        titanium: {
          50: '#F8F8F8',
          100: '#F0F0F0',
          200: '#E0E0E0',
          300: '#D4D4D4',
          400: '#C4C4C4',
          500: '#B0B0B0',
          600: '#808080',
          700: '#666666',
          800: '#4D4D4D',
          900: '#333333',
          950: '#1A1A1A',
        },

        // =============================================
        // SEMANTIC COLORS (HSL for opacity support)
        // =============================================
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          light: 'var(--color-primary-light)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
          hover: 'var(--color-secondary-hover)',
        },
        success: 'hsl(var(--success-channel) / <alpha-value>)',
        error: 'hsl(var(--error-channel) / <alpha-value>)',
        warning: 'hsl(var(--warning-channel) / <alpha-value>)',
        info: 'hsl(var(--info-channel) / <alpha-value>)',
        gold: {
          DEFAULT: 'hsl(var(--gold-channel) / <alpha-value>)',
          light: 'hsl(var(--gold-light-channel) / <alpha-value>)',
        },

        // =============================================
        // SHADCN/UI THEME COLORS
        // =============================================
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
      },

      // =============================================
      // SPACING (preserved)
      // =============================================
      spacing: {
        'px': '1px',
        '0': '0',
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
      },

      // =============================================
      // TYPOGRAPHY (preserved)
      // =============================================
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1' }],
        'sm': ['0.875rem', { lineHeight: '1.25' }],
        'base': ['1rem', { lineHeight: '1.5' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.375' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },

      // =============================================
      // BORDER RADIUS (preserved + shadcn DEFAULT)
      // =============================================
      borderRadius: {
        'none': '0',
        'sm': '4px',
        DEFAULT: 'var(--radius)',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },

      // =============================================
      // SHADOWS (preserved)
      // =============================================
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.2), 0 10px 10px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
        '3xl': '0 35px 60px rgba(0, 0, 0, 0.3)',
        'bronze': '0 8px 24px rgba(205, 127, 50, 0.3)',
        'bronze-lg': '0 16px 32px rgba(205, 127, 50, 0.4)',
        'gold': '0 8px 24px rgba(255, 215, 0, 0.3)',
        'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        'inner-lg': 'inset 0 4px 8px rgba(0, 0, 0, 0.15)',
      },

      // =============================================
      // TRANSITIONS (preserved)
      // =============================================
      transitionDuration: {
        'fast': '150ms',
        'base': '300ms',
        'slow': '500ms',
        'slower': '700ms',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },

      // =============================================
      // Z-INDEX (preserved)
      // =============================================
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'notification': '1080',
      },

      // =============================================
      // BACKDROP BLUR (preserved)
      // =============================================
      backdropBlur: {
        'sm': '10px',
        'md': '20px',
        'lg': '30px',
      },

      // =============================================
      // KEYFRAME ANIMATIONS (merged)
      // =============================================
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "fade-in-up-fast": "fadeInUp 0.3s ease-out forwards",
        "fade-in-up-slow": "fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        shimmer: "shimmer 2s linear infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
