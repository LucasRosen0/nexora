import { useState, useEffect } from 'react';
import demoOverviewData from './demoOverviewData';
import { API_BASE } from './src/lib/api';

export const useDashboardData = () => {
  const [data, setData] = useState(demoOverviewData);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tenta buscar da API com timeout curto para não travar a UI
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${API_BASE}/machines?limit=5000`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const result = await response.json();

        // Só desativamos o mock se a API de fato retornar máquinas
        if (result && result.data && result.data.length > 0) {
          const machines = result.data;
          
          // Clonamos o objeto demo para manter descrições e títulos, 
          // mas atualizamos os valores numéricos com os dados REAIS
          const updatedData = JSON.parse(JSON.stringify(demoOverviewData));
          
          const healthy = machines.filter(m => !m.alerta_critico).length;
          const critical = machines.filter(m => m.alerta_critico).length;

          updatedData.managedAssets = machines.length;
          updatedData.metrics.managedAssets.value = machines.length;
          updatedData.healthy = healthy;
          updatedData.metrics.healthy.value = healthy;
          updatedData.critical = critical;
          updatedData.metrics.critical.value = critical;

          setData(updatedData);
          setIsMock(false);
        } else {
          // Se a API retornar vazio (comum no Netlify se o arquivo sumir), 
          // forçamos o uso dos dados de demonstração
          setIsMock(true);
        }
      } catch (error) {
        console.warn("Usando dados de demonstração (fallback) devido a erro na API.");
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { 
    overviewData: data, 
    loading, 
    isMock,
    // Garante compatibilidade com os nomes solicitados
    hasRealData: !isMock 
  };
};