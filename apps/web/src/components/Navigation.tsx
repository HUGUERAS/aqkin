/**
 * Navigation/UX Component - Back Button & Navigation Helper
 * Provides consistent back button, breadcrumbs, and navigation patterns
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';
import { Button } from './UIComponents';

interface BackButtonProps {
    label?: string;
    to?: string;
    onClick?: () => void;
    className?: string;
}

/**
 * BackButton - Consistently styled back button
 * Usage: <BackButton /> or <BackButton to="/custom-path" />
 */
export const BackButton: React.FC<BackButtonProps> = ({
    label = 'Voltar',
    to,
    onClick,
    className = '',
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <Button
            variant="secondary"
            size="sm"
            onClick={handleClick}
            className={className}
            icon="back"
        >
            {label}
        </Button>
    );
};

/**
 * BreadcrumbNav - Navigation trail showing current location
 * Usage: <BreadcrumbNav items={[{ label: 'Home', path: '/' }, { label: 'Projects' }]} />
 */
interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export const BreadcrumbNav: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
    const navigate = useNavigate();

    return (
        <nav className={`flex items-center gap-2 text-sm text-gray-600 mb-4 ${className}`}>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <Icon name="forward" size="sm" className="text-gray-400" />}
                    {item.path ? (
                        <button
                            onClick={() => navigate(item.path!)}
                            className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                        >
                            {item.label}
                        </button>
                    ) : (
                        <span className="text-gray-900 font-semibold">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

/**
 * PageHeader - Standard page header with title, description, and back button
 * Usage: <PageHeader title="Form" description="Edit your profile" />
 */
interface PageHeaderProps {
    title: string;
    description?: string;
    showBackButton?: boolean;
    backTo?: string;
    icon?: string;
    action?: React.ReactNode;
    className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    showBackButton = true,
    backTo,
    icon,
    action,
    className = '',
}) => {
    return (
        <div className={`mb-8 ${className}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    {showBackButton && <BackButton to={backTo} label="← Voltar" className="mb-4" />}
                    <div className="flex items-center gap-3">
                        {icon && <Icon name={icon as any} size="lg" color="primary" />}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                            {description && <p className="text-gray-600 mt-1">{description}</p>}
                        </div>
                    </div>
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
        </div>
    );
};

/**
 * ClosableDialog Wrapper - For modals/dialogs with close button
 * Usage: Importar em componentes modais
 */
interface DialogProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export const DialogHeader: React.FC<DialogProps> = ({ title, onClose, children, className = '' }) => (
    <div className={className}>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Fechar"
            >
                <Icon name="close" size="lg" />
            </button>
        </div>
        {children}
    </div>
);

export default {
    BackButton,
    BreadcrumbNav,
    PageHeader,
    DialogHeader,
};
