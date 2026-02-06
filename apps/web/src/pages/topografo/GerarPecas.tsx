import { Button, Card, CardBody, CardFooter, CardHeader } from '../../components/UIComponents';
import './GerarPecas.css';

const cadernetaRows = [
  { ponto: 'P1', latitude: '-15.7942', longitude: '-47.8822', descricao: 'Vértice Nordeste' },
  { ponto: 'P2', latitude: '-15.7950', longitude: '-47.8822', descricao: 'Vértice Sudeste' },
];

export default function GerarPecas() {
  return (
    <div className="gerar-pecas-container">
      <header className="gerar-pecas-header">
        <h1>📄 Gerar Peças Técnicas</h1>
        <p>Baixe documentos técnicos a partir da geometria validada.</p>
      </header>

      <div className="gerar-pecas-grid">
        <Card className="gerar-pecas-card" hover={false}>
          <CardHeader>
            <h2>📋 Memorial Descritivo</h2>
            <p>Geração automática com base nos dados dos confrontantes.</p>
          </CardHeader>
          <CardBody>
            <div className="memorial-box">
              <p><strong>MEMORIAL DESCRITIVO</strong></p>
              <p>Imóvel: #001</p>
              <p>Proprietário: João Silva</p>
              <p>Área: 5.240,00 m²</p>
              <div className="memorial-spacer" />
              <p><strong>CONFRONTAÇÕES:</strong></p>
              <p>NORTE: Maria Santos (Imóvel #002) - 52,00m</p>
              <p>SUL: Pedro Costa (Imóvel #003) - 52,00m</p>
              <p>LESTE: Rua Principal - 100,00m</p>
              <p>OESTE: Ana Oliveira - 100,00m</p>
              <div className="memorial-spacer" />
              <p><em>Dados preenchidos automaticamente pelo sistema</em></p>
            </div>
          </CardBody>
          <CardFooter className="section-actions">
            <Button icon="download" variant="primary">Baixar Memorial (PDF)</Button>
            <Button icon="download" variant="secondary">Baixar Memorial (DOCX)</Button>
          </CardFooter>
        </Card>

        <Card className="gerar-pecas-card" hover={false}>
          <CardHeader>
            <h2>🗺️ Planta de Situação</h2>
            <p>Preview com legenda, norte e coordenadas principais.</p>
          </CardHeader>
          <CardBody>
            <div className="preview-box">
              <div className="preview-box-content">
                <div className="emoji">📐</div>
                <p>Preview da Planta</p>
                <p>Mapa com coordenadas + legenda + norte</p>
              </div>
            </div>
          </CardBody>
          <CardFooter className="section-actions">
            <Button icon="download" variant="primary">Baixar Planta (PDF A3)</Button>
          </CardFooter>
        </Card>

        <Card className="gerar-pecas-card" hover={false}>
          <CardHeader>
            <h2>📊 Caderneta de Campo</h2>
            <p>Pontos levantados com coordenadas (SIRGAS 2000).</p>
          </CardHeader>
          <CardBody>
            <table className="caderneta-table">
              <thead>
                <tr>
                  <th>Ponto</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {cadernetaRows.map((row) => (
                  <tr key={row.ponto}>
                    <td>{row.ponto}</td>
                    <td>{row.latitude}</td>
                    <td>{row.longitude}</td>
                    <td>{row.descricao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
          <CardFooter className="section-actions">
            <Button icon="download" variant="primary">Baixar Caderneta (XLSX)</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
