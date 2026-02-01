import { useState, useEffect } from 'react';
import ViewMap from '../../components/maps/ViewMap';
import apiClient from '../../services/api';

export default function DashboardConfluencia() {
  const [loading, setLoading] = useState(true);
  const [parcels, setParcels] = useState<any[]>([]);
  const [overlaps, setOverlaps] = useState<any[]>([]);
  const [geometries, setGeometries] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Buscar projetos (assumindo primeiro projeto para demo)
      const projectsResponse = await apiClient.getProjects();
      
      if (projectsResponse.data && projectsResponse.data.length > 0) {
        const projectId = projectsResponse.data[0].id;
        
        // Buscar parcelas do projeto
        const parcelsResponse = await apiClient.getParcels(projectId);
        if (parcelsResponse.data) {
          setParcels(parcelsResponse.data);
          
          // Converter parcelas para geometrias ViewMap
          const geomsFromParcels = parcelsResponse.data
            .filter((p: any) => p.geometry_wkt)
            .map((p: any) => ({
              id: p.id,
              wkt: p.geometry_wkt,
              type: p.status === 'validado' ? 'oficial' : 'rascunho',
              label: p.owner_name
            }));
          
          setGeometries(geomsFromParcels);
        }
        
        // Buscar sobreposições
        const overlapsResponse = await apiClient.getOverlaps(projectId);
        if (overlapsResponse.data) {
          setOverlaps(overlapsResponse.data);
          
          // Adicionar sobreposições ao mapa
          const overlapGeoms = overlapsResponse.data.map((o: any) => ({
            id: `overlap-${o.id}`,
            wkt: o.intersection_wkt,
            type: 'sobreposicao' as const,
            label: 'Overlap'
          }));
          
          setGeometries(prev => [...prev, ...overlapGeoms]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas
  const totalParcels = parcels.length;
  const totalOverlaps = overlaps.length;
  const validatedParcels = parcels.filter(p => p.status === 'validado').length;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>
        📊 Dashboard de Confluência
        {loading && <span style={{ fontSize: '0.8rem', marginLeft: '1rem' }}>⏳ Carregando...</span>}
      </h1>

      {/* Resumo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: '#667eea',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalParcels}</p>
          <p style={{ margin: '0.5rem 0 0 0' }}>Imóveis Totais</p>
        </div>

        <div style={{
          background: '#f44336',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalOverlaps}</p>
          <p style={{ margin: '0.5rem 0 0 0' }}>Sobreposições</p>
        </div>

        <div style={{
          background: '#4caf50',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{validatedParcels}</p>
          <p style={{ margin: '0.5rem 0 0 0' }}>Validados</p>
        </div>
      </div>

      {/* Mapa de Confluência */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>🗺️ Mapa de Confluência (Azure Data)</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Dados em tempo real do PostgreSQL + PostGIS no Azure
        </p>

        {/* Mapa OpenLayers com dados reais */}
        {!loading && geometries.length > 0 ? (
          <ViewMap geometries={geometries} />
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p style={{ fontSize: '2rem' }}>⏳</p>
            <p>Carregando dados do Azure...</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p style={{ fontSize: '2rem' }}>📭</p>
            <p>Nenhuma parcela cadastrada ainda</p>
          </div>
        )}
      </div>

      {/* Lista de Imóveis */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>📋 Imóveis do Projeto</h2>

        {parcels.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Proprietário</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((parcel) => (
                <tr key={parcel.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>#{parcel.id.slice(0, 8)}</td>
                  <td style={{ padding: '1rem' }}>{parcel.owner_name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      background: parcel.status === 'validado' ? '#d4edda' : '#fff3cd',
                      color: parcel.status === 'validado' ? '#155724' : '#856404',
                      fontSize: '0.9rem'
                    }}>
                      {parcel.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{
                      padding: '0.5rem 1rem',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '0.5rem'
                    }}>
                      Ver
                    </button>
                    <button style={{
                      padding: '0.5rem 1rem',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      Validar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            Nenhuma parcela cadastrada
          </div>
        )}
      </div>
    </div>
  );
}
