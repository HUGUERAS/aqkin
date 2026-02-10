import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function NetworkBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="bg-warning/10 text-warning py-2.5 px-4 text-sm border-b border-warning/30 text-center"
    >
      Sem conexao com a internet. Algumas acoes podem falhar.
    </div>
  );
}
