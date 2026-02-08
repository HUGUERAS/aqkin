export default function UploadDocumentos() {
  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: 'linear-gradient(135deg, #0b0f14 0%, #111827 100%)', color: '#e5e7eb' }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(15, 23, 42, 0.92)',
        borderRadius: '14px',
        padding: '2rem',
        boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      }}>
        <h1 style={{ marginBottom: '1rem', color: '#f8fafc' }}>
          <span role="img" aria-label="Documento">📄</span> Documentos
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
          Envie fotos ou PDFs dos seus documentos: RG, CPF, Comprovante de Residência,
          Escritura (se tiver), etc.
        </p>

        <div style={{
          border: '2px dashed rgba(59, 130, 246, 0.35)',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          background: '#0b1220',
          cursor: 'pointer',
          marginBottom: '2rem',
          color: '#e5e7eb'
        }}>
          <p style={{ fontSize: '3rem', margin: 0 }}><span role="img" aria-label="Camera">📸</span></p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '1rem 0' }}>
            Clique para tirar foto ou selecionar arquivo
          </p>
          <p style={{ color: '#94a3b8' }}>
            Formatos: JPG, PNG, PDF (máx 10MB por arquivo)
          </p>
        </div>

        <div>
          <h3 style={{ marginBottom: '1rem', color: '#f8fafc' }}>Documentos enviados:</h3>
          <div style={{
            padding: '2rem',
            background: '#0b1220',
            borderRadius: '10px',
            textAlign: 'center',
            color: '#94a3b8',
            border: '1px solid rgba(59, 130, 246, 0.25)'
          }}>
            <p>Nenhum documento enviado ainda.</p>
          </div>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#0b1220',
          borderRadius: '10px',
          border: '1px solid rgba(59, 130, 246, 0.35)'
        }}>
          <h3><span role="img" aria-label="Sucesso">✅</span> Documentos necessários:</h3>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>RG e CPF do(s) proprietário(s)</li>
            <li>Comprovante de residência</li>
            <li>Escritura ou documento de posse (se tiver)</li>
            <li>Fotos da propriedade (opcional mas ajuda)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
