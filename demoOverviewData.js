const demoOverviewData = {
  metrics: {
    managedAssets: {
      id: "managedAssets",
      value: 248,
      label: "Ativos Gerenciados",
      description: "Total de dispositivos cadastrados e monitorados no sistema.",
      details: [
        { label: "Estações de Trabalho", value: 156 },
        { label: "Servidores", value: 42 },
        { label: "Dispositivos Móveis", value: 50 }
      ]
    },
    healthy: {
      id: "healthy",
      value: 214,
      label: "Dispositivos Saudáveis",
      description: "Dispositivos sem alertas críticos ou pendências de segurança.",
      details: [
        { label: "Windows Defender Ativo", value: 190 },
        { label: "Sem Malware", value: 214 }
      ]
    },
    attention: {
      id: "attention",
      value: 27,
      label: "Atenção Necessária",
      description: "Dispositivos com avisos moderados ou atualizações pendentes.",
      details: [
        { label: "Updates Pendentes", value: 15 },
        { label: "Espaço em Disco Baixo", value: 12 }
      ]
    },
    critical: {
      id: "critical",
      value: 7,
      label: "Alertas Críticos",
      description: "Dispositivos com vulnerabilidades graves ou offline por longo período.",
      details: [
        { label: "Ameaça Detectada", value: 3 },
        { label: "Serviço Crítico Parado", value: 4 }
      ]
    },
    compliance: {
      id: "compliance",
      value: 96,
      label: "Conformidade",
      description: "Percentual de aderência às políticas de segurança da empresa.",
      details: [
        { label: "Criptografia Ativa", value: "98%" },
        { label: "Senha Forte", value: "94%" }
      ]
    },
    onlineNow: {
      id: "onlineNow",
      value: 183,
      label: "Online Agora",
      description: "Dispositivos com comunicação ativa nos últimos 5 minutos.",
      details: [
        { label: "Via VPN", value: 45 },
        { label: "Rede Interna", value: 138 }
      ]
    },
    averageRisk: {
      id: "averageRisk",
      value: 18,
      label: "Risco Médio",
      description: "Pontuação média de risco baseada em vulnerabilidades e comportamento.",
      details: [
        { label: "Score Anterior", value: 22 },
        { label: "Tendência", value: "Queda" }
      ]
    }
  },
  managedAssets: 248,
  healthy: 214,
  attention: 27,
  critical: 7,
  compliance: 96,
  onlineNow: 183,
  averageRisk: 18,
  unassigned: 12,
  osDistribution: [
    { name: "Windows", value: 156 },
    { name: "Linux", value: 42 },
    { name: "macOS", value: 31 },
    { name: "Android", value: 14 },
    { name: "iOS", value: 5 }
  ],
  unitDistribution: [
    { name: "Matriz São Paulo", value: 92 },
    { name: "Filial Rio de Janeiro", value: 48 },
    { name: "Unidade Curitiba", value: 37 },
    { name: "Unidade Belo Horizonte", value: 29 },
    { name: "Remoto/Home Office", value: 42 }
  ]
};

export default demoOverviewData;