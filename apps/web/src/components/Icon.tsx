/**
 * Icon Component - Wrapper around lucide-react
 * Professional icons for AtivoReal
 */

import {
    MapPin,
    Users,
    FileText,
    LayoutDashboard,
    CheckCircle,
    Zap,
    BarChart3,
    DollarSign,
    LogOut,
    Menu,
    X,
    Plus,
    Trash2,
    Edit,
    Save,
    AlertCircle,
    Info,
    Search,
    Filter,
    Download,
    Upload,
    Eye,
    EyeOff,
    Lock,
    Home,
    Building2,
    Compass,
    Map,
    Grid,
    List,
    ArrowLeft,
    ChevronRight,
    Mail,
    User,
    type LucideIcon,
} from 'lucide-react';

interface IconProps {
    name:
    | 'map-pin'
    | 'users'
    | 'file'
    | 'dashboard'
    | 'check'
    | 'spark'
    | 'chart'
    | 'dollar'
    | 'logout'
    | 'menu'
    | 'close'
    | 'plus'
    | 'trash'
    | 'edit'
    | 'save'
    | 'alert'
    | 'info'
    | 'search'
    | 'filter'
    | 'download'
    | 'upload'
    | 'eye'
    | 'eye-off'
    | 'lock'
    | 'home'
    | 'building'
    | 'compass'
    | 'map'
    | 'grid'
    | 'list'
    | 'back'
    | 'forward'
    | 'envelope'
    | 'user';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'white' | 'current';
    className?: string;
}

const iconMap: Record<IconProps['name'], LucideIcon> = {
    'map-pin': MapPin,
    users: Users,
    file: FileText,
    dashboard: LayoutDashboard,
    check: CheckCircle,
    spark: Zap,
    chart: BarChart3,
    dollar: DollarSign,
    logout: LogOut,
    menu: Menu,
    close: X,
    plus: Plus,
    trash: Trash2,
    edit: Edit,
    save: Save,
    alert: AlertCircle,
    info: Info,
    search: Search,
    filter: Filter,
    download: Download,
    upload: Upload,
    eye: Eye,
    'eye-off': EyeOff,
    lock: Lock,
    home: Home,
    building: Building2,
    compass: Compass,
    map: Map,
    grid: Grid,
    list: List,
    back: ArrowLeft,
    forward: ChevronRight,
    envelope: Mail,
    user: User,
};

const sizeMap: Record<IconProps['size'], number> = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
};

const colorMap: Record<Exclude<IconProps['color'], 'current'>, string> = {
    primary: '#3b82f6',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0ea5e9',
    white: '#ffffff',
};

export default function Icon({
    name,
    size = 'md',
    color = 'current',
    className = '',
}: IconProps) {
    const IconComponent = iconMap[name];
    const dimension = sizeMap[size];
    const iconColor = color === 'current' ? 'currentColor' : colorMap[color];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in icon library`);
        return null;
    }

    return (
        <IconComponent
            size={dimension}
            color={iconColor}
            className={`icon-${name} ${className}`}
        />
    );
}

/**
 * Helper hook to get icon component directly
 * Usage: const MapIcon = useIcon('map-pin');
 */
export function useIcon(name: IconProps['name']): LucideIcon | null {
    return iconMap[name] || null;
}
