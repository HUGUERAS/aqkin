import Icon from './Icon';

interface StateViewProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function LoadingState({ title, description }: StateViewProps) {
  return (
    <div className="text-center p-12 text-titanium-600 animate-pulse">
      <Icon name="spark" size="xl" className="text-primary mx-auto mb-4" />
      <p className="text-xl m-0 font-semibold">{title}</p>
      {description && <p className="mt-2">{description}</p>}
    </div>
  );
}

export function EmptyState({ title, description, actionLabel, onAction }: StateViewProps) {
  return (
    <div className="text-center p-12 text-titanium-600 bg-white rounded-lg animate-fade-in">
      <Icon name="search" size="xl" className="text-titanium-400 mx-auto mb-4" />
      <p className="text-xl m-0 font-semibold">{title}</p>
      {description && <p className="mt-2">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-3 bg-primary text-white border-none rounded-lg cursor-pointer text-base font-semibold hover:bg-primary-hover transition-all hover:shadow-bronze"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ title, description, actionLabel, onAction }: StateViewProps) {
  return (
    <div className="text-center p-12 text-error bg-error/10 rounded-lg border border-error/20 animate-fade-in">
      <Icon name="alert" size="xl" className="text-error mx-auto mb-4" />
      <p className="text-lg m-0 font-bold">{title}</p>
      {description && <p className="mt-2 text-error/80">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-3 bg-error text-white border-none rounded-lg cursor-pointer text-base font-semibold hover:opacity-90 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
