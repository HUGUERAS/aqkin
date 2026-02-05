/**
 * Logo Component
 * Professional SVG logo for AtivoReal
 */

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'full' | 'icon';
    className?: string;
}

const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
};

export default function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
    const dimension = sizeMap[size];

    if (variant === 'icon') {
        return (
            <svg
                width={dimension}
                height={dimension}
                viewBox="0 0 64 64"
                className={`logo-icon ${className}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* 🏘️ Property/Land Icon */}
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#1d4ed8', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>

                {/* Base Shape - Hexagon (property/land) */}
                <path
                    d="M32 4L56 16V40L32 52L8 40V16Z"
                    fill="url(#logoGradient)"
                    opacity="0.9"
                />

                {/* Inner Circle - Location Pin */}
                <circle cx="32" cy="28" r="14" fill="white" opacity="0.95" />

                {/* Dot in center */}
                <circle cx="32" cy="28" r="6" fill="#3b82f6" />

                {/* Top accent lines - GPS signal */}
                <line
                    x1="32"
                    y1="8"
                    x2="32"
                    y2="14"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    // Full logo with text
    return (
        <div className={`logo-full ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg
                width={dimension}
                height={dimension}
                viewBox="0 0 64 64"
                className="logo-icon"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#1d4ed8', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>

                <path
                    d="M32 4L56 16V40L32 52L8 40V16Z"
                    fill="url(#logoGradient)"
                    opacity="0.9"
                />

                <circle cx="32" cy="28" r="14" fill="white" opacity="0.95" />
                <circle cx="32" cy="28" r="6" fill="#3b82f6" />

                <line
                    x1="32"
                    y1="8"
                    x2="32"
                    y2="14"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#0b1729' }}>AtivoReal</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', letterSpacing: '0.5px' }}>
                    Geolocation & Properties
                </span>
            </div>
        </div>
    );
}
