import { ReactNode } from 'react';

interface ResponsiveMapContainerProps {
  children: ReactNode;
  minHeight?: string;
  className?: string;
}

export const ResponsiveMapContainer = ({
  children,
  minHeight = '400px',
  className = '',
}: ResponsiveMapContainerProps) => {
  return (
    <div
      className={`responsive-map-container ${className}`}
      style={{ minHeight }}
    >
      {children}
    </div>
  );
};

export default ResponsiveMapContainer;
