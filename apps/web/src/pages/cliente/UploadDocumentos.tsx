import { useState, useEffect, useRef } from 'react';
import { useClientToken } from '../../hooks/useClientToken';
import apiClient from '../../services/api';

interface DocumentItem {
  id: number;
  tipo: string;
  nome_arquivo: string;
  url: string;
  tamanho_bytes: number;
  criado_em?: string;
}

const DOCUMENT_TYPES = [
  { value: 'RG_CPF', label: 'RG e CPF', required: true },
  { value: 'COMPROVANTE', label: 'Comprovante de Residencia', required: true },
  { value: 'MATRICULA', label: 'Escritura / Matricula', required: false },
  { value: 'CAR', label: 'CAR (Cadastro Ambiental Rural)', required: false },
  { value: 'OTHER', label: 'Outros Documentos', required: false },
];

export default function UploadDocumentos() {
  const { loteId, loading: tokenLoading, error: tokenError } = useClientToken();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [error, setError] = useState('');

  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load existing documents
  useEffect(() => {
    if (!loteId) return;
    setLoadingDocs(true);
    apiClient.getDocumentos(loteId).then((r) => {
      if (r.data && Array.isArray(r.data)) {
        setDocuments(r.data as DocumentItem[]);
      }
      setLoadingDocs(false);
    });
  }, [loteId]);

  const handleUpload = async (file: File) => {
    if (!loteId || !selectedType) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo excede 10MB.');
      return;
    }

    setUploading(selectedType);
    setError('');

    const result = await apiClient.uploadDocumento(loteId, selectedType, file);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setDocuments((prev) => [result.data as DocumentItem, ...prev]);
      setSelectedType('');
    }

    setUploading(null);
  };

  const handleDelete = async (docId: number) => {
    const result = await apiClient.deleteDocumento(docId);
    if (!result.error) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    }
  };

  const uploadedTypes = new Set(documents.map((d) => d.tipo));

  if (tokenLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
        color: '#e5e7eb',
      }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (tokenError || !loteId) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
        color: '#ef4444',
        padding: '2rem',
      }}>
        <p>{tokenError || 'Lote nao encontrado'}</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '1.5rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)',
      color: '#e5e7eb',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
          Documentos
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Envie fotos ou PDFs dos seus documentos.
        </p>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            color: '#ef4444',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {/* Document type cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          {DOCUMENT_TYPES.map((type) => {
            const isUploaded = uploadedTypes.has(type.value);
            const isSelected = selectedType === type.value;
            const isCurrentlyUploading = uploading === type.value;

            return (
              <div
                key={type.value}
                onClick={() => !isCurrentlyUploading && setSelectedType(isSelected ? '' : type.value)}
                style={{
                  padding: '1rem',
                  background: isSelected
                    ? 'rgba(59, 130, 246, 0.1)'
                    : 'rgba(15, 23, 42, 0.92)',
                  borderRadius: '10px',
                  border: isSelected
                    ? '1px solid rgba(59, 130, 246, 0.5)'
                    : isUploaded
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid rgba(59, 130, 246, 0.15)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isUploaded ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                    color: isUploaded ? '#fff' : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}>
                    {isUploaded ? '\u2713' : ''}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {type.label}
                      {type.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                    </div>
                    {isUploaded && (
                      <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Enviado</div>
                    )}
                  </div>
                </div>

                {isCurrentlyUploading && (
                  <div style={{ fontSize: '0.85rem', color: '#3b82f6' }}>
                    Enviando...
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Upload buttons */}
        {selectedType && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}>
            <button
              onClick={() => cameraRef.current?.click()}
              disabled={!!uploading}
              style={{
                width: '100%',
                padding: '1rem',
                background: uploading ? '#3a3a3a' : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: uploading ? 'not-allowed' : 'pointer',
              }}
            >
              Tirar Foto
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={!!uploading}
              style={{
                width: '100%',
                padding: '1rem',
                background: uploading ? '#3a3a3a' : 'rgba(15, 23, 42, 0.92)',
                color: '#e5e7eb',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: uploading ? 'not-allowed' : 'pointer',
              }}
            >
              Escolher Arquivo
            </button>

            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Uploaded documents list */}
        {!loadingDocs && documents.length > 0 && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.92)',
            borderRadius: '14px',
            padding: '1.5rem',
            border: '1px solid rgba(59, 130, 246, 0.25)',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1rem' }}>
              Documentos Enviados ({documents.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: '#0b1220',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e5e7eb' }}>
                      {DOCUMENT_TYPES.find((t) => t.value === doc.tipo)?.label || doc.tipo}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.nome_arquivo} - {Math.round(doc.tamanho_bytes / 1024)}KB
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.4rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
