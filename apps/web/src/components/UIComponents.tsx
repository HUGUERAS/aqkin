/**
 * Reusable UI Components
 * Button, Card, Form inputs with consistent styling
 */

import React, { ReactNode, HTMLAttributes } from 'react';
import Icon from './Icon';
import clsx from 'clsx';

/* ============================================
   BUTTON COMPONENT
   ============================================ */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    isLoading?: boolean;
    children: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', icon, isLoading = false, className, children, disabled, ...props }, ref) => {
        const variantClass = {
            primary: 'button-primary',
            secondary: 'button-secondary',
            danger: 'button-danger',
            ghost: 'button-ghost',
        }[variant];

        const sizeClass = {
            sm: 'px-3 py-1 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
        }[size];

        return (
            <button
                ref={ref}
                className={clsx(variantClass, sizeClass, 'inline-flex items-center gap-2', className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? <Icon name="spark" size="sm" /> : icon && <Icon name={icon as any} size="sm" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

/* ============================================
   CARD COMPONENT
   ============================================ */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hover = true, children, ...props }, ref) => (
        <div
            ref={ref}
            className={clsx('panel-surface', hover && 'cursor-pointer', className)}
            {...props}
        >
            {children}
        </div>
    )
);

Card.displayName = 'Card';

/* ============================================
   CARD HEADER / BODY / FOOTER
   ============================================ */

export const CardHeader: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
    <div className={clsx('mb-4 pb-4 border-b border-gray-200', className)}>{children}</div>
);

export const CardBody: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
    <div className={className}>{children}</div>
);

export const CardFooter: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
    <div className={clsx('mt-4 pt-4 border-t border-gray-200 flex items-center gap-2', className)}>{children}</div>
);

/* ============================================
   TEXT INPUT COMPONENT
   ============================================ */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: string;
    helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, helperText, className, ...props }, ref) => (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon name={icon as any} size="sm" />
                    </div>
                )}
                <input
                    ref={ref}
                    className={clsx(
                        'w-full px-4 py-2 border border-gray-300 rounded-lg font-base transition-all',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        error && 'border-red-500 focus:ring-red-500',
                        icon && 'pl-10',
                        className
                    )}
                    {...props}
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {helperText && !error && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
        </div>
    )
);

Input.displayName = 'Input';

/* ============================================
   TEXTAREA COMPONENT
   ============================================ */

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helperText, className, ...props }, ref) => (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                className={clsx(
                    'w-full px-4 py-2 border border-gray-300 rounded-lg font-base transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                )}
                {...props}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {helperText && !error && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
        </div>
    )
);

Textarea.displayName = 'Textarea';

/* ============================================
   SELECT COMPONENT
   ============================================ */

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
    helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, helperText, className, ...props }, ref) => (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={clsx(
                    'w-full px-4 py-2 border border-gray-300 rounded-lg font-base transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                )}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {helperText && !error && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
        </div>
    )
);

Select.displayName = 'Select';

/* ============================================
   BADGE COMPONENT
   ============================================ */

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md';
    children: ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', size = 'md', className, children, ...props }) => {
    const variantClass = {
        default: 'bg-gray-200 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
    }[variant];

    const sizeClass = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
    }[size];

    return (
        <span className={clsx('inline-flex rounded-full font-semibold', variantClass, sizeClass, className)} {...props}>
            {children}
        </span>
    );
};

/* ============================================
   ALERT COMPONENT
   ============================================ */

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    children: ReactNode;
    dismissible?: boolean;
    onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
    type = 'info',
    title,
    children,
    dismissible = false,
    onDismiss,
    className,
    ...props
}) => {
    const colorMap = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error: 'bg-red-50 border-red-200 text-red-800',
    };

    const iconMap = {
        info: 'info',
        success: 'check',
        warning: 'alert',
        error: 'alert',
    } as const;

    return (
        <div className={clsx('rounded-lg border p-4 mb-4', colorMap[type], className)} {...props}>
            <div className="flex items-start gap-3">
                <Icon name={iconMap[type]} size="lg" className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    {title && <h4 className="font-semibold mb-1">{title}</h4>}
                    <div className="text-sm">{children}</div>
                </div>
                {dismissible && (
                    <button
                        onClick={onDismiss}
                        className="flex-shrink-0 ml-2 text-lg hover:opacity-70 transition-opacity"
                    >
                        <Icon name="close" size="md" />
                    </button>
                )}
            </div>
        </div>
    );
};

/* ============================================
   SKELETON LOADER
   ============================================ */

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    width?: string;
    height?: string;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = 'w-full', height = 'h-4', count = 1, className, ...props }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={clsx('bg-gray-200 rounded animate-pulse mb-2', width, height, className)} {...props} />
        ))}
    </>
);

/* ============================================
   CHECKBOX COMPONENT
   ============================================ */

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, error, helperText, className, ...props }, ref) => (
        <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    ref={ref}
                    type="checkbox"
                    className={clsx(
                        'w-4 h-4 rounded border-gray-300 text-blue-600 transition-colors',
                        'focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
                        error && 'border-red-500',
                        className
                    )}
                    {...props}
                />
                {label && <span className="text-sm text-gray-700">{label}</span>}
            </label>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {helperText && !error && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
        </div>
    )
);

Checkbox.displayName = 'Checkbox';

export default {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Input,
    Textarea,
    Select,
    Badge,
    Alert,
    Skeleton,
    Checkbox,
};
