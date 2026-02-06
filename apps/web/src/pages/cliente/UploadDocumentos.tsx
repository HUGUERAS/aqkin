import { Alert, Card } from '../../components/UIComponents';
import './UploadDocumentos.css';

export default function UploadDocumentos() {
  return (
    <div className="documentos-container">
      <Card className="documentos-card" hover={false}>
        <header className="documentos-header">
          <h1>Documentos</h1>
          <p>
            Envie fotos ou PDFs dos seus documentos: RG, CPF, Comprovante de Residência,
            Escritura (se tiver), etc.
          </p>
        </header>

        <div className="documentos-dropzone">
          <p className="documentos-icon">📸</p>
          <p className="documentos-title">Clique para tirar foto ou selecionar arquivo</p>
          <p className="documentos-subtitle">Formatos: JPG, PNG, PDF (máx 10MB por arquivo)</p>
        </div>

        <section className="documentos-list">
          <h3>Documentos enviados:</h3>
          <div className="documentos-empty">
            <p>Nenhum documento enviado ainda.</p>
          </div>
        </section>

        <Alert type="info" title="Documentos necessários">
          <ul className="documentos-needed">
            <li>RG e CPF do(s) proprietário(s)</li>
            <li>Comprovante de residência</li>
            <li>Escritura ou documento de posse (se tiver)</li>
            <li>Fotos da propriedade (opcional mas ajuda)</li>
          </ul>
        </Alert>
      </Card>
    </div>
  );
}
