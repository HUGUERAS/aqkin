export default function UploadDocumentos() {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginBottom: '1rem' }}>📄 Documentos</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Envie fotos ou PDFs dos seus documentos: RG, CPF, Comprovante de Residência,
          Escritura (se tiver), etc.
        </p>

        <div style={{
          border: '2px dashed #ddd',
          borderRadius: '8px',
          padding: '3rem',
          textAlign: 'center',
          background: '#fafafa',
          cursor: 'pointer',
          marginBottom: '2rem'
        }}>
          <p style={{ fontSize: '3rem', margin: 0 }}>📸</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '1rem 0' }}>
            Clique para tirar foto ou selecionar arquivo
          </p>
          <p style={{ color: '#666' }}>
            Formatos: JPG, PNG, PDF (máx 10MB por arquivo)
          </p>
        </div>

        <div>
          <h3 style={{ marginBottom: '1rem' }}>Documentos enviados:</h3>
          <div style={{
            padding: '2rem',
            background: '#f5f5f5',
            borderRadius: '6px',
            textAlign: 'center',
            color: '#666'
          }}>
            <p>Nenhum documento enviado ainda.</p>
          </div>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f0f4ff',
          borderRadius: '6px',
          border: '1px solid #667eea'
        }}>
          <h3>✅ Documentos necessários:</h3>
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
