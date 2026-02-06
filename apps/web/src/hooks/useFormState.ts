import { useState, useCallback } from 'react';

interface FormValidation<T> {
    [K in keyof T]?: string;
}

interface UseFormStateOptions<T> {
    onSubmit: (data: T) => Promise<void>;
    validators?: { [K in keyof T]?: (value: any) => string | null };
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Hook customizado para gerenciar estado de formulário
 * com validação, loading e tratamento de erros
 */
export const useFormState = <T extends Record<string, any>>(
    initialState: T,
    options: UseFormStateOptions<T>
) => {
    const [formData, setFormData] = useState<T>(initialState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormValidation<T>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const validate = useCallback(() => {
        const newErrors: FormValidation<T> = {};

        if (options.validators) {
            (Object.keys(options.validators) as Array<keyof T>).forEach((key) => {
                const validator = options.validators?.[key];
                if (validator) {
                    const error = validator(formData[key]);
                    if (error) {
                        newErrors[key] = error;
                    }
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, options.validators]);

    const handleChange = useCallback(
        (key: keyof T, value: any) => {
            setFormData((prev) => ({ ...prev, [key]: value }));
            setTouched((prev) => ({ ...prev, [key]: true }));

            if (errors[key]) {
                setErrors((prev) => {
                    const updated = { ...prev };
                    delete updated[key];
                    return updated;
                });
            }
        },
        [errors]
    );

    const handleBlur = useCallback((key: keyof T) => {
        setTouched((prev) => ({ ...prev, [key]: true }));
    }, []);

    const handleSubmit = useCallback(
        async (e?: React.FormEvent) => {
            e?.preventDefault();

            if (!validate()) {
                return;
            }

            setLoading(true);
            try {
                await options.onSubmit(formData);
                options.onSuccess?.();
            } catch (error) {
                const err = error instanceof Error ? error : new Error('Erro desconhecido');
                options.onError?.(err);
            } finally {
                setLoading(false);
            }
        },
        [formData, validate, options]
    );

    const reset = useCallback(() => {
        setFormData(initialState);
        setErrors({});
        setTouched({});
    }, [initialState]);

    const setFieldValue = useCallback((key: keyof T, value: any) => {
        handleChange(key, value);
    }, [handleChange]);

    const setFieldError = useCallback((key: keyof T, error: string) => {
        setErrors((prev) => ({ ...prev, [key]: error }));
    }, []);

    return {
        formData,
        errors,
        loading,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setFieldValue,
        setFieldError,
        validate,
    };
};

interface UseStatusFilterOptions<T extends { status: string }> {
    defaultStatus?: string;
}

/**
 * Hook customizado para gerenciar filtro por status
 * com contagem automática
 */
export const useStatusFilter = <T extends { status: string }>(
    items: T[],
    options?: UseStatusFilterOptions<T>
) => {
    const [filtroStatus, setFiltroStatus] = useState(options?.defaultStatus || 'TODOS');

    const filtered = items.filter(
        (item) => filtroStatus === 'TODOS' || item.status === filtroStatus
    );

    // Contar por status
    const statusMap = new Map<string, number>();
    items.forEach((item) => {
        const count = statusMap.get(item.status) || 0;
        statusMap.set(item.status, count + 1);
    });

    const counts = {
        TODOS: items.length,
        ...Object.fromEntries(statusMap),
    };

    return {
        filtroStatus,
        setFiltroStatus,
        filtered,
        counts: counts as Record<string, number>,
    };
};

interface UseApiCacheOptions {
    staleTimeMs?: number;
    maxAgeMs?: number;
}

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

/**
 * Hook customizado para cache simples de dados
 */
export const useApiCache = <T,>(options?: UseApiCacheOptions) => {
    const cacheRef = new Map<string, CacheEntry<T>>();
    const staleTimeMs = options?.staleTimeMs || 5 * 60 * 1000; // 5 min default
    const maxAgeMs = options?.maxAgeMs || 24 * 60 * 60 * 1000; // 24h default

    const get = useCallback(
        (key: string): T | null => {
            const entry = cacheRef.current?.get(key);
            if (!entry) return null;

            const now = Date.now();
            const age = now - entry.timestamp;

            // Expirado (max age)
            if (age > maxAgeMs) {
                cacheRef.current?.delete(key);
                return null;
            }

            return entry.data;
        },
        []
    );

    const isStale = useCallback(
        (key: string): boolean => {
            const entry = cacheRef.current?.get(key);
            if (!entry) return true;

            const now = Date.now();
            const age = now - entry.timestamp;

            return age > staleTimeMs;
        },
        []
    );

    const set = useCallback((key: string, data: T) => {
        cacheRef.current?.set(key, {
            data,
            timestamp: Date.now(),
        });
    }, []);

    const clear = useCallback((key?: string) => {
        if (key) {
            cacheRef.current?.delete(key);
        } else {
            cacheRef.current?.clear();
        }
    }, []);

    return { get, set, isStale, clear };
};
