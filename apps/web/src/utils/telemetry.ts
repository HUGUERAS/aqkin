import LogRocket from 'logrocket';

type TelemetryContext = {
  [key: string]: unknown;
};

let isInitialized = false;

export function initTelemetry(): void {
  if (isInitialized) return;
  const appId = import.meta.env.VITE_LOGROCKET_APP_ID as string | undefined;
  if (!appId) return;

  LogRocket.init(appId);
  isInitialized = true;
}

export function reportError(error: unknown, context?: TelemetryContext): void {
  const payload = {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
  };

  if (isInitialized && LogRocket.captureException) {
    const tags = context
      ? Object.fromEntries(
        Object.entries(context).map(([key, value]) => [
          key,
          typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
            ? value
            : JSON.stringify(value),
        ])
      )
      : undefined;
    LogRocket.captureException(error as Error, { extra: tags });
  }

  // eslint-disable-next-line no-console
  console.error('ClientError', payload);
}
