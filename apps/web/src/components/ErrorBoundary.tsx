import React from 'react';
import { reportError } from '../utils/telemetry';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    message?: string;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    override state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, message: error.message };
    }

    override componentDidCatch(error: Error, info: React.ErrorInfo) {
        reportError(error, { componentStack: info.componentStack });
    }

    handleReload = () => {
        window.location.reload();
    };

    override render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    background: '#f9fafb',
                    color: '#111827',
                }}>
                    <div style={{
                        maxWidth: '520px',
                        width: '100%',
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    }}>
                        <h2 style={{ margin: 0, fontSize: '20px' }}>Algo deu errado</h2>
                        <p style={{ margin: '12px 0', color: '#4b5563' }}>
                            Ocorreu um erro inesperado. Voce pode tentar recarregar a pagina.
                        </p>
                        {this.state.message && (
                            <pre style={{
                                background: '#f3f4f6',
                                padding: '12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                whiteSpace: 'pre-wrap',
                                color: '#6b7280',
                            }}>
                                {this.state.message}
                            </pre>
                        )}
                        <button
                            onClick={this.handleReload}
                            style={{
                                marginTop: '16px',
                                background: '#111827',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 16px',
                                cursor: 'pointer',
                            }}
                        >
                            Recarregar
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
