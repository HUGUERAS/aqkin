import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function NetworkBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      style={{
        background: '#fef3c7',
        color: '#92400e',
        padding: '10px 16px',
        fontSize: '14px',
        borderBottom: '1px solid #fcd34d',
        textAlign: 'center',
      }}
    >
      Sem conexao com a internet. Algumas acoes podem falhar.
    </div>
  );
}
