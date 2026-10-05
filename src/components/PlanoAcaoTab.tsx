import React, { useState, useMemo } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Download,
  FileSpreadsheet,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Building,
  UserCheck,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  BookOpen,
  X,
  Check,
  ShieldCheck,
  Wrench,
  Flame,
  Activity,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { Company, PlanoAcaoItem, SetorData, FuncaoData, AvaliacaoRiscoItem } from "../types";
import { CATALOGO_TODAS_NRS, NrCatalogItem } from "../data/nrCatalog";
import { gerarPDFPlanoAcao5W2H } from "../services/pdfGenerator";

interface PlanoAcaoTabProps {
  company: Company;
  onSavePlanoAcao: (itens: PlanoAcaoItem[]) => void;
  onAlert: (type: "success" | "error" | "info", message: string) => void;
}

const PRIORIDADES = ["Crítica / Imediata", "Alta", "Média", "Baixa"] as const;
const STATUS_LIST = ["Pendente", "Em Andamento", "Concluído"] as const;
const PRAZOS_PADRAO = [
  "Imediato (24-48h)",
  "15 dias",
  "30 dias",
  "45 dias",
  "60 dias",
  "90 dias",
  "120 dias",
  "180 dias",
  "Anual (PGR)",
];
const DEPARTAMENTOS_PADRAO = [
  "SESMT / Segurança do Trabalho",
  "Manutenção Mecânica / Elétrica",
  "Manutenção Predial / Facilities",
  "Recursos Humanos / Treinamento",
  "Gerência de Produção / Operações",
  "Diretoria / Alta Gestão",
  "Almoxarifado / Compras",
  "Medicina Ocupacional",
  "CIPA / Brigada de Emergência",
  "Engenharia / Projetos",
];

export const PlanoAcaoTab: React.FC<PlanoAcaoTabProps> = ({
  company,
  onSavePlanoAcao,
  onAlert,
}) => {
  const itens = useMemo<PlanoAcaoItem[]>(() => {
    return company.planoAcaoGlobal || [];
  }, [company.planoAcaoGlobal]);

  // Filtros e Busca
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("Todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("Todas");
  const [filtroOrigem, setFiltroOrigem] = useState<string>("Todas");
  const [filtroNr, setFiltroNr] = useState<string>("Todas");

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNrCatalogModalOpen, setIsNrCatalogModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanoAcaoItem | null>(null);

  // Form State
  const [itemText, setItemText] = useState("");
  const [itemNr, setItemNr] = useState("NR-01");
  const [itemOrigem, setItemOrigem] = useState("NR-01 (Disposições Gerais e GRO/PGR)");
  const [itemWhy, setItemWhy] = useState("");
  const [itemWhere, setItemWhere] = useState("");
  const [itemWho, setItemWho] = useState("SESMT / Segurança do Trabalho");
  const [itemWhen, setItemWhen] = useState("30 dias");
  const [itemDataSugerida, setItemDataSugerida] = useState("");
  const [itemDataConclusao, setItemDataConclusao] = useState("");
  const [itemHow, setItemHow] = useState("");
  const [itemHowMuch, setItemHowMuch] = useState("");
  const [itemIndicador, setItemIndicador] = useState("");
  const [itemPrioridade, setItemPrioridade] = useState<"Crítica / Imediata" | "Alta" | "Média" | "Baixa">("Alta");
  const [itemStatus, setItemStatus] = useState<"Pendente" | "Em Andamento" | "Concluído">("Pendente");

  // Busca no catálogo de NRs
  const [nrCatalogSearch, setNrCatalogSearch] = useState("");
  const [selectedNrCategory, setSelectedNrCategory] = useState<string>("Todas");

  // Estatísticas do Plano de Ação
  const stats = useMemo(() => {
    const total = itens.length;
    const concluidos = itens.filter((i) => i.status === "Concluído").length;
    const emAndamento = itens.filter((i) => i.status === "Em Andamento").length;
    const pendentes = itens.filter((i) => !i.status || i.status === "Pendente").length;
    const criticas = itens.filter((i) => i.prioridade === "Crítica / Imediata" || i.prioridade === "Alta").length;
    const percentConcluido = total > 0 ? Math.round((concluidos / total) * 100) : 0;

    return { total, concluidos, emAndamento, pendentes, criticas, percentConcluido };
  }, [itens]);

  // Itens filtrados
  const itensFiltrados = useMemo(() => {
    return itens.filter((item) => {
      // Busca
      const matchSearch =
        !searchTerm ||
        item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nrReferencia && item.nrReferencia.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.origemOuRisco && item.origemOuRisco.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.ondeLocal && item.ondeLocal.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.responsavel && item.responsavel.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.comoFazer && item.comoFazer.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status
      const matchStatus =
        filtroStatus === "Todos" ||
        (filtroStatus === "Pendente" && (!item.status || item.status === "Pendente")) ||
        item.status === filtroStatus;

      // Prioridade
      const matchPrioridade =
        filtroPrioridade === "Todas" || item.prioridade === filtroPrioridade;

      // NR
      const matchNr =
        filtroNr === "Todas" ||
        (item.nrReferencia && item.nrReferencia.toUpperCase().includes(filtroNr.toUpperCase())) ||
        (item.origemOuRisco && item.origemOuRisco.toUpperCase().includes(filtroNr.toUpperCase()));

      // Origem
      const matchOrigem =
        filtroOrigem === "Todas" ||
        (filtroOrigem === "risco" && item.origemTipo === "risco") ||
        (filtroOrigem === "setor" && item.origemTipo === "setor") ||
        (filtroOrigem === "aep" && item.origemTipo === "aep") ||
        (filtroOrigem === "nr16" && item.origemTipo === "nr16") ||
        (filtroOrigem === "manual" && (!item.origemTipo || item.origemTipo === "manual" || item.origemTipo === "nrPreset"));

      return matchSearch && matchStatus && matchPrioridade && matchNr && matchOrigem;
    });
  }, [itens, searchTerm, filtroStatus, filtroPrioridade, filtroNr, filtroOrigem]);

  // Sincronização Inteligente a partir dos Riscos, Setores, AEP e NR-16
  const handleSincronizarTudo = () => {
    const novosItens: PlanoAcaoItem[] = [...itens];
    let adicionadosCount = 0;

    // 1. Sincronizar dos Riscos Avaliados na Matriz (RiscosTab)
    if (company.avaliacoesRiscos) {
      Object.entries(company.avaliacoesRiscos).forEach(([funcId, riscosMap]) => {
        const funcao = company.funcoes.find((f) => f.id === funcId);
        const funcNome = funcao?.func_nome || "Função";
        const setorNome = funcao?.func_setor || "Geral";

        Object.entries(riscosMap).forEach(([riscoNome, aval]) => {
          if (!aval) return;
          // Se tiver medidas propostas ou risco for Alto/Crítico/Médio
          const precisaAcao =
            (aval.medidasControlePropostas && aval.medidasControlePropostas.trim().length > 3) ||
            aval.prioridadeAcao === "Crítica / Imediata" ||
            aval.prioridadeAcao === "Alta" ||
            aval.prioridadeAcao === "Média";

          if (precisaAcao) {
            const idOrigem = `risco-${funcId}-${riscoNome}`;
            const jaExiste = novosItens.some((it) => it.referenciaId === idOrigem || (it.item === aval.medidasControlePropostas && it.ondeLocal?.includes(funcNome)));

            if (!jaExiste) {
              const itemTexto =
                aval.medidasControlePropostas && aval.medidasControlePropostas.trim().length > 3
                  ? aval.medidasControlePropostas
                  : `Implantar medidas de controle e proteção para o risco de ${riscoNome} (${funcNome}).`;

              // Extrai ou estima NR correspondente
              let nrRef = "NR-01";
              const rLower = riscoNome.toLowerCase();
              if (rLower.includes("ruído") || rLower.includes("calor") || rLower.includes("vibração") || rLower.includes("químic")) nrRef = "NR-09";
              if (rLower.includes("elétr") || rLower.includes("choque")) nrRef = "NR-10";
              if (rLower.includes("máquina") || rLower.includes("prens") || rLower.includes("corte")) nrRef = "NR-12";
              if (rLower.includes("ergon") || rLower.includes("postur") || rLower.includes("peso")) nrRef = "NR-17";
              if (rLower.includes("altura") || rLower.includes("queda")) nrRef = "NR-35";
              if (rLower.includes("confinado") || rLower.includes("pet")) nrRef = "NR-33";
              if (rLower.includes("incêndio") || rLower.includes("explosão")) nrRef = "NR-23";
              if (rLower.includes("inflamáv") || rLower.includes("combustív")) nrRef = "NR-20";

              novosItens.push({
                id: `pa-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                item: itemTexto,
                origemOuRisco: `${nrRef} - Risco: ${riscoNome} (${funcNome})`,
                nrReferencia: nrRef,
                porQueFazer: aval.possiveisDanos || `Mitigar a severidade da exposição ao risco de ${riscoNome} classificado na Matriz de Risco do PGR.`,
                ondeLocal: `Setor: ${setorNome} | Função: ${funcNome}`,
                responsavel: aval.responsavel || "SESMT / Gestão da Área",
                prazo: aval.prazoSugerido || (aval.prioridadeAcao === "Crítica / Imediata" ? "Imediato (48h)" : aval.prioridadeAcao === "Alta" ? "30 dias" : "60 dias"),
                comoFazer: aval.medidasControleExistentes ? `Revisar e aprimorar controles existentes (${aval.medidasControleExistentes}) e implantar procedimentos de engenharia/EPI.` : "Elaborar procedimento operacional, adquirir EPI/EPC adequado e realizar treinamento operacional.",
                indicadorEficacia: "Reavaliação semestral na Matriz de Risco do PGR com redução do score para nível aceitável.",
                prioridade: aval.prioridadeAcao || "Alta",
                status: "Pendente",
                origemTipo: "risco",
                referenciaId: idOrigem,
              });
              adicionadosCount++;
            }
          }
        });
      });
    }

    // 2. Sincronizar dos Setores (SetoresTab)
    if (company.setores) {
      company.setores.forEach((setor) => {
        // Checa pendências cadastradas no setor
        let setorPlanoItens: any[] = [];
        try {
          if (setor.setor_plano_itens) {
            setorPlanoItens = JSON.parse(setor.setor_plano_itens);
          }
        } catch {}

        if (Array.isArray(setorPlanoItens) && setorPlanoItens.length > 0) {
          setorPlanoItens.forEach((sItem: any, idx: number) => {
            const idOrigem = `setor-${setor.id}-${idx}`;
            const jaExiste = novosItens.some((it) => it.referenciaId === idOrigem || (it.item === sItem.item && it.ondeLocal?.includes(setor.setor_nome)));

            if (!jaExiste && sItem.item) {
              const nrMatch = sItem.origemOuRisco?.match(/NR-\d+/i);
              const nrRef = nrMatch ? nrMatch[0].toUpperCase() : "NR-01";

              novosItens.push({
                id: `pa-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                item: sItem.item,
                origemOuRisco: sItem.origemOuRisco || `${nrRef} - Adequação do Setor`,
                nrReferencia: nrRef,
                porQueFazer: `Adequação estrutural e de conformidade do setor ${setor.setor_nome} conforme exigências da ${nrRef}.`,
                ondeLocal: `Setor: ${setor.setor_nome}`,
                responsavel: sItem.responsavel || setor.setor_plano_responsavel || "Manutenção Predial / Gestão",
                prazo: sItem.prazo || setor.setor_plano_prazo || "30 dias",
                comoFazer: "Contratar mão de obra especializada para regularização física e vistoria final com checklist de entrega.",
                indicadorEficacia: "Inspeção visual periódica com checklist predial 100% conforme.",
                prioridade: sItem.prioridade || setor.setor_plano_prioridade || "Alta",
                status: sItem.status || setor.setor_plano_status || "Pendente",
                origemTipo: "setor",
                referenciaId: idOrigem,
              });
              adicionadosCount++;
            }
          });
        }
      });
    }

    // 3. Sincronizar da AEP (NR-17 - AepTab)
    if (company.aepAvaliacoes && Array.isArray(company.aepAvaliacoes)) {
      company.aepAvaliacoes.forEach((aep) => {
        if (aep.recomendacoes && Array.isArray(aep.recomendacoes)) {
          aep.recomendacoes.forEach((rec, idx) => {
            if (!rec || rec.trim().length < 5) return;
            const idOrigem = `aep-${aep.id}-${idx}`;
            const jaExiste = novosItens.some((it) => it.referenciaId === idOrigem || (it.item === rec && it.ondeLocal?.includes(aep.funcaoNome)));

            if (!jaExiste) {
              novosItens.push({
                id: `pa-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                item: rec,
                origemOuRisco: `NR-17 - Ergonomia (${aep.funcaoNome})`,
                nrReferencia: "NR-17",
                porQueFazer: `Eliminar sobrecarga biomecânica, fadiga física e prevenir DORT/LER no posto de ${aep.funcaoNome}.`,
                ondeLocal: `Setor: ${aep.setorNome || "Geral"} | Posto: ${aep.funcaoNome}`,
                responsavel: "Ergonomia / Compras / RH",
                prazo: aep.classificacaoRisco?.includes("Alto") ? "30 dias" : "60 dias",
                comoFazer: "Adquirir acessórios ergonômicos reguláveis (suporte de monitor, apoio para pés, cadeiras NR-17) e implantar pausas.",
                indicadorEficacia: "AEP de reavaliação ergonômica sem queixas osteomusculares.",
                prioridade: aep.classificacaoRisco?.includes("Alto") ? "Alta" : "Média",
                status: "Pendente",
                origemTipo: "aep",
                referenciaId: idOrigem,
              });
              adicionadosCount++;
            }
          });
        }
      });
    }

    // 4. Sincronizar da NR-16 (Periculosidade - Nr16Tab)
    if (company.nr16Avaliacoes && Array.isArray(company.nr16Avaliacoes)) {
      company.nr16Avaliacoes.forEach((nr16) => {
        if (nr16.recomendacoesSST && Array.isArray(nr16.recomendacoesSST)) {
          nr16.recomendacoesSST.forEach((rec, idx) => {
            if (!rec || rec.trim().length < 5) return;
            const idOrigem = `nr16-${nr16.id}-${idx}`;
            const jaExiste = novosItens.some((it) => it.referenciaId === idOrigem || (it.item === rec && it.ondeLocal?.includes(nr16.funcaoNome)));

            if (!jaExiste) {
              novosItens.push({
                id: `pa-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                item: rec,
                origemOuRisco: `NR-16 - Periculosidade (${nr16.funcaoNome})`,
                nrReferencia: "NR-16",
                porQueFazer: `Controlar condições de perigo iminente (inflamáveis, explosivos, eletricidade) conforme Anexos da NR-16.`,
                ondeLocal: `Setor: ${nr16.setorNome || "Geral"} | Função: ${nr16.funcaoNome}`,
                responsavel: "SESMT / Manutenção Industrial",
                prazo: "15 dias",
                comoFazer: "Implantar contenções físicas, aterramento elétrico antiestático e sinalização de delimitação de área de risco.",
                indicadorEficacia: "Laudo pericial de periculosidade atestando conformidade com as regras do MTE.",
                prioridade: "Crítica / Imediata",
                status: "Pendente",
                origemTipo: "nr16",
                referenciaId: idOrigem,
              });
              adicionadosCount++;
            }
          });
        }
      });
    }

    if (adicionadosCount > 0) {
      onSavePlanoAcao(novosItens);
      onAlert("success", `${adicionadosCount} novas ações recomendadas foram consolidadas no Plano de Ação!`);
    } else {
      onAlert("info", "Todas as ações dos riscos, setores e laudos já estão integradas e atualizadas no Plano de Ação!");
    }
  };

  // Abrir Modal de Criação / Edição
  const handleOpenModal = (itemToEdit?: PlanoAcaoItem) => {
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setItemText(itemToEdit.item || "");
      setItemNr(itemToEdit.nrReferencia || "NR-01");
      setItemOrigem(itemToEdit.origemOuRisco || "NR-01 (Disposições Gerais e GRO/PGR)");
      setItemWhy(itemToEdit.porQueFazer || "");
      setItemWhere(itemToEdit.ondeLocal || "");
      setItemWho(itemToEdit.responsavel || "SESMT / Segurança do Trabalho");
      setItemWhen(itemToEdit.prazo || "30 dias");
      setItemDataSugerida(itemToEdit.dataSugerida || "");
      setItemDataConclusao(itemToEdit.dataConclusao || "");
      setItemHow(itemToEdit.comoFazer || "");
      setItemHowMuch(itemToEdit.custoEstimado || "");
      setItemIndicador(itemToEdit.indicadorEficacia || "");
      setItemPrioridade(itemToEdit.prioridade || "Alta");
      setItemStatus(itemToEdit.status || "Pendente");
    } else {
      setEditingItem(null);
      setItemText("");
      setItemNr("NR-01");
      setItemOrigem("NR-01 (Disposições Gerais e GRO/PGR)");
      setItemWhy("");
      setItemWhere(company.setores[0]?.setor_nome ? `Setor: ${company.setores[0].setor_nome}` : "");
      setItemWho("SESMT / Segurança do Trabalho");
      setItemWhen("30 dias");
      setItemDataSugerida("");
      setItemDataConclusao("");
      setItemHow("");
      setItemHowMuch("");
      setItemIndicador("");
      setItemPrioridade("Alta");
      setItemStatus("Pendente");
    }
    setIsModalOpen(true);
  };

  // Salvar Item do Form
  const handleSaveItem = () => {
    if (!itemText.trim()) {
      onAlert("info", "Por favor, digite a descrição da ação (O Que Fazer).");
      return;
    }

    let novosItens: PlanoAcaoItem[];
    if (editingItem) {
      novosItens = itens.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              item: itemText.trim(),
              nrReferencia: itemNr,
              origemOuRisco: itemOrigem,
              porQueFazer: itemWhy.trim(),
              ondeLocal: itemWhere.trim(),
              responsavel: itemWho.trim(),
              prazo: itemWhen.trim(),
              dataSugerida: itemDataSugerida,
              dataConclusao: itemDataConclusao,
              comoFazer: itemHow.trim(),
              custoEstimado: itemHowMuch.trim(),
              indicadorEficacia: itemIndicador.trim(),
              prioridade: itemPrioridade,
              status: itemStatus,
            }
          : i
      );
      onAlert("success", "Ação 5W2H atualizada com sucesso!");
    } else {
      const newItem: PlanoAcaoItem = {
        id: `pa-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        item: itemText.trim(),
        nrReferencia: itemNr,
        origemOuRisco: itemOrigem,
        porQueFazer: itemWhy.trim() || `Atendimento aos requisitos legais e preventivos da ${itemNr}.`,
        ondeLocal: itemWhere.trim() || "Instalações Gerais da Empresa",
        responsavel: itemWho.trim() || "SESMT / Diretoria",
        prazo: itemWhen.trim() || "30 dias",
        dataSugerida: itemDataSugerida,
        dataConclusao: itemDataConclusao,
        comoFazer: itemHow.trim() || "Executar adequação com registro documental e fotográfico.",
        custoEstimado: itemHowMuch.trim(),
        indicadorEficacia: itemIndicador.trim() || "Inspeção e evidência de conclusão arquivada no PGR.",
        prioridade: itemPrioridade,
        status: itemStatus,
        origemTipo: "manual",
      };
      novosItens = [newItem, ...itens];
      onAlert("success", "Nova ação 5W2H adicionada ao Plano de Ação!");
    }

    onSavePlanoAcao(novosItens);
    setIsModalOpen(false);
  };

  // Alternar Status Rápido
  const handleToggleStatus = (id: string, novoStatus: "Pendente" | "Em Andamento" | "Concluído") => {
    const novos = itens.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          status: novoStatus,
          dataConclusao: novoStatus === "Concluído" ? (i.dataConclusao || new Date().toLocaleDateString("pt-BR")) : "",
        };
      }
      return i;
    });
    onSavePlanoAcao(novos);
  };

  // Excluir Item
  const handleDeleteItem = (id: string) => {
    const novos = itens.filter((i) => i.id !== id);
    onSavePlanoAcao(novos);
    onAlert("info", "Ação removida do Plano de Ação.");
  };

  // Aplicar Preset do Catálogo de NRs
  const handleAplicarPresetNR = (nrItem: NrCatalogItem, desvio: NrCatalogItem["desviosComuns"][0]) => {
    const newItem: PlanoAcaoItem = {
      id: `pa-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      item: desvio.oQueFazer,
      nrReferencia: nrItem.nr,
      origemOuRisco: `${nrItem.nr} - ${desvio.tituloDesvio}`,
      porQueFazer: desvio.porQueFazer,
      ondeLocal: company.setores[0]?.setor_nome ? `Setor: ${company.setores[0].setor_nome}` : "Área Operacional / Geral",
      responsavel: desvio.responsavelSugerido,
      prazo: desvio.prazoSugerido,
      dataSugerida: "",
      comoFazer: desvio.comoFazer,
      custoEstimado: "",
      indicadorEficacia: desvio.indicadorEficacia,
      prioridade: desvio.prioridadeSugerida,
      status: "Pendente",
      origemTipo: "nrPreset",
    };

    onSavePlanoAcao([newItem, ...itens]);
    setIsNrCatalogModalOpen(false);
    onAlert("success", `Ação da ${nrItem.nr} (${desvio.tituloDesvio}) adicionada com sucesso!`);
  };

  // Exportar para CSV / Excel
  const handleExportCSV = () => {
    if (itens.length === 0) {
      onAlert("info", "Não há ações para exportar no momento.");
      return;
    }

    const headers = [
      "ID",
      "NR",
      "O Que Fazer (What)",
      "Por Que Fazer (Why)",
      "Onde / Local (Where)",
      "Quem / Responsável (Who)",
      "Quando / Prazo (When)",
      "Como Fazer (How)",
      "Quanto Custa (How Much)",
      "Indicador de Eficácia (How Check)",
      "Prioridade",
      "Status",
      "Data Conclusão",
    ];

    const rows = itens.map((i) => [
      `"${i.id}"`,
      `"${i.nrReferencia || "NR-01"}"`,
      `"${(i.item || "").replace(/"/g, '""')}"`,
      `"${(i.porQueFazer || "").replace(/"/g, '""')}"`,
      `"${(i.ondeLocal || "").replace(/"/g, '""')}"`,
      `"${(i.responsavel || "").replace(/"/g, '""')}"`,
      `"${(i.prazo || "").replace(/"/g, '""')}"`,
      `"${(i.comoFazer || "").replace(/"/g, '""')}"`,
      `"${(i.custoEstimado || "").replace(/"/g, '""')}"`,
      `"${(i.indicadorEficacia || "").replace(/"/g, '""')}"`,
      `"${i.prioridade || "Média"}"`,
      `"${i.status || "Pendente"}"`,
      `"${i.dataConclusao || ""}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Plano_de_Acao_5W2H_${company.empresa.emp_razao?.replace(/[^a-zA-Z0-9]/g, "_") || "Empresa"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAlert("success", "Planilha CSV do Plano de Ação 5W2H exportada com sucesso!");
  };

  // Gerar PDF do Plano de Ação
  const handleGerarPDF = async () => {
    try {
      await gerarPDFPlanoAcao5W2H(company, itens);
      onAlert("success", "Relatório do Plano de Ação (NR-01 - 5W2H) gerado com sucesso!");
    } catch (err) {
      onAlert("error", "Erro ao gerar PDF do Plano de Ação.");
    }
  };

  // Filtragem do Catálogo de NRs
  const catalogoFiltrado = useMemo(() => {
    return CATALOGO_TODAS_NRS.filter((item) => {
      const matchCat =
        selectedNrCategory === "Todas" || item.categoria === selectedNrCategory;

      const matchSearch =
        !nrCatalogSearch ||
        item.nr.toLowerCase().includes(nrCatalogSearch.toLowerCase()) ||
        item.titulo.toLowerCase().includes(nrCatalogSearch.toLowerCase()) ||
        item.desviosComuns.some(
          (d) =>
            d.tituloDesvio.toLowerCase().includes(nrCatalogSearch.toLowerCase()) ||
            d.oQueFazer.toLowerCase().includes(nrCatalogSearch.toLowerCase()) ||
            d.comoFazer.toLowerCase().includes(nrCatalogSearch.toLowerCase())
        );

      return matchCat && matchSearch && item.desviosComuns.length > 0;
    });
  }, [nrCatalogSearch, selectedNrCategory]);

  return (
    <div className="space-y-4 pb-24">
      {/* Header Principal & Métricas */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <CheckSquare className="h-3.5 w-3.5" />
              <span>NR-01 (GRO/PGR) • Metodologia 5W2H</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Plano de Ação Centralizado
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Cronograma consolidado de medidas de controle, prazos, responsáveis e indicadores de eficácia contemplando as 38 NRs.
            </p>
          </div>

          {/* Ações de Topo em Grid Padronizado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleSincronizarTudo}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              title="Consolidar automaticamente ações dos Riscos, Setores, AEP (NR-17) e NR-16"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Sincronizar Riscos & Setores</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNrCatalogModalOpen(true)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Catálogo 38 NRs</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Ação 5W2H</span>
            </button>
          </div>
        </div>

        {/* Dashboard de Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total de Ações
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats.total}
            </div>
            <div className="text-[10px] font-semibold text-slate-400">
              Mapeadas no PGR
            </div>
          </div>

          <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 p-3 border border-red-100 dark:border-red-900/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Críticas / Altas
            </div>
            <div className="text-xl sm:text-2xl font-black text-red-700 dark:text-red-300 mt-0.5">
              {stats.criticas}
            </div>
            <div className="text-[10px] font-semibold text-red-500/80">
              Prioridade Imediata
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-3 border border-amber-100 dark:border-amber-900/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Em Andamento
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-300 mt-0.5">
              {stats.emAndamento}
            </div>
            <div className="text-[10px] font-semibold text-amber-600/80">
              {stats.pendentes} pendentes
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-3 border border-emerald-100 dark:border-emerald-900/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Concluídas ({stats.percentConcluido}%)
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
              {stats.concluidos}
            </div>
            <div className="text-[10px] font-semibold text-emerald-600/80">
              Eficácia comprovada
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Busca, Filtros e Exportação */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-3">
        <div className="space-y-2.5">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por NR, ação (What), setor, responsável, risco..."
              className="h-11 w-full pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer shadow-2xs"
              title="Exportar em Planilha Excel / CSV"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Exportar Planilha (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleGerarPDF}
              className="inline-flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold hover:bg-slate-800 dark:hover:bg-white active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Gerar Relatório Técnico do Plano de Ação em PDF"
            >
              <Download className="h-4 w-4 text-blue-400 dark:text-blue-600" />
              <span>Gerar Relatório PDF 5W2H</span>
            </button>
          </div>
        </div>

        {/* Linha de Filtros por Tag */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <div className="flex items-center gap-1 font-bold text-slate-500 dark:text-slate-400">
            <Filter className="h-3 w-3" />
            <span>Filtros:</span>
          </div>

          {/* Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="h-7 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 text-[11px] focus:outline-none"
          >
            <option value="Todos">Status: Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluído">Concluído</option>
          </select>

          {/* Prioridade */}
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="h-7 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 text-[11px] focus:outline-none"
          >
            <option value="Todas">Prioridade: Todas</option>
            <option value="Crítica / Imediata">Crítica / Imediata</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>

          {/* Origem */}
          <select
            value={filtroOrigem}
            onChange={(e) => setFiltroOrigem(e.target.value)}
            className="h-7 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 text-[11px] focus:outline-none"
          >
            <option value="Todas">Origem: Todas</option>
            <option value="risco">Riscos Ocupacionais (GHE)</option>
            <option value="setor">Setores / Predial</option>
            <option value="aep">Ergonomia (NR-17)</option>
            <option value="nr16">Periculosidade (NR-16)</option>
            <option value="manual">Manual / Presets 38 NRs</option>
          </select>

          {(searchTerm || filtroStatus !== "Todos" || filtroPrioridade !== "Todas" || filtroOrigem !== "Todas" || filtroNr !== "Todas") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setFiltroStatus("Todos");
                setFiltroPrioridade("Todas");
                setFiltroOrigem("Todas");
                setFiltroNr("Todas");
              }}
              className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 hover:underline ml-auto"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de Ações no Formato 5W2H */}
      {itensFiltrados.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-8 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nenhuma ação cadastrada no Plano de Ação
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Clique em <strong>"Sincronizar de Riscos & Setores"</strong> para importar automaticamente as soluções ou use o <strong>"Catálogo 38 NRs"</strong> para inserir soluções prontas.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleSincronizarTudo}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Sincronizar Automaticamente</span>
            </button>
            <button
              type="button"
              onClick={() => setIsNrCatalogModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Explorar 38 NRs</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {itensFiltrados.map((item, index) => {
            const isCritica = item.prioridade === "Crítica / Imediata";
            const isAlta = item.prioridade === "Alta";
            const isConcluido = item.status === "Concluído";
            const isEmAndamento = item.status === "Em Andamento";

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900/90 shadow-2xs overflow-hidden ${
                  isConcluido
                    ? "border-emerald-200 dark:border-emerald-900/40 opacity-90"
                    : isCritica
                    ? "border-red-300 dark:border-red-800/80 ring-1 ring-red-500/20"
                    : isAlta
                    ? "border-amber-300 dark:border-amber-800/60"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Header do Card */}
                <div className="p-3.5 sm:p-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge da NR */}
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[11px] font-black tracking-wide border border-blue-200 dark:border-blue-800">
                      {item.nrReferencia || "NR-01"}
                    </span>

                    {/* Badge Prioridade */}
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        isCritica
                          ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800"
                          : isAlta
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {item.prioridade}
                    </span>

                    {/* Origem */}
                    {item.origemOuRisco && (
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                        • {item.origemOuRisco}
                      </span>
                    )}
                  </div>

                  {/* Seletor Rápido de Status */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id, "Pendente")}
                      className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        !item.status || item.status === "Pendente"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 ring-1 ring-amber-400"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                    >
                      Pendente
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id, "Em Andamento")}
                      className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        isEmAndamento
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 ring-1 ring-blue-400"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                    >
                      Em Andamento
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id, "Concluído")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        isConcluido
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                      <span>Concluído</span>
                    </button>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    <button
                      type="button"
                      onClick={() => handleOpenModal(item)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar Ação 5W2H"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Excluir Ação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Corpo 5W2H */}
                <div className="p-3.5 sm:p-4 space-y-3 text-xs">
                  {/* O QUE FAZER (WHAT) */}
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      O Que Fazer (What)
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.item}
                    </div>
                  </div>

                  {/* Grade 5W2H */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {/* POR QUE (WHY) */}
                    <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/40 p-2.5 space-y-0.5">
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                        Por Que Fazer (Why)
                      </div>
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        {item.porQueFazer || "Cumprir diretrizes de segurança da NR e prevenir acidentes."}
                      </div>
                    </div>

                    {/* ONDE (WHERE) */}
                    <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/40 p-2.5 space-y-0.5">
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span>Onde / Local (Where)</span>
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {item.ondeLocal || "Área Operacional da Empresa"}
                      </div>
                    </div>

                    {/* QUEM (WHO) */}
                    <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/40 p-2.5 space-y-0.5">
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        <span>Quem / Responsável (Who)</span>
                      </div>
                      <div className="font-bold text-blue-700 dark:text-blue-400">
                        {item.responsavel || "SESMT / Manutenção"}
                      </div>
                    </div>

                    {/* QUANDO (WHEN) */}
                    <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/40 p-2.5 space-y-0.5">
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Quando / Prazo (When)</span>
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <span>{item.prazo}</span>
                        {item.dataSugerida && (
                          <span className="text-[10.5px] font-normal text-slate-500">
                            ({item.dataSugerida})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* COMO FAZER (HOW) & INDICADOR DE EFICÁCIA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="rounded-xl bg-slate-50/50 dark:bg-slate-800/20 p-2.5 space-y-0.5 border border-slate-100 dark:border-slate-800/60">
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Wrench className="h-3 w-3" />
                        <span>Como Implementar (How)</span>
                      </div>
                      <div className="text-[11.5px] text-slate-700 dark:text-slate-300">
                        {item.comoFazer || "Elaborar procedimento e aplicar adequação física com registro fotográfico."}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50/50 dark:bg-slate-800/20 p-2.5 space-y-0.5 border border-slate-100 dark:border-slate-800/60">
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        <span>Indicador de Eficácia (How Check)</span>
                      </div>
                      <div className="text-[11.5px] text-slate-700 dark:text-slate-300">
                        {item.indicadorEficacia || "Inspeção e evidência de conclusão arquivada no prontuário do PGR."}
                      </div>
                    </div>
                  </div>

                  {item.dataConclusao && (
                    <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Ação concluída em: {item.dataConclusao}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO 5W2H */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingItem ? "Editar Ação do Plano (5W2H)" : "Nova Ação Técnica (5W2H)"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defina os parâmetros técnicos conforme o item 1.5.5 da NR-01.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* NR e Origem */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Norma Regulamentadora:
                  </label>
                  <select
                    value={itemNr}
                    onChange={(e) => {
                      setItemNr(e.target.value);
                      setItemOrigem(`${e.target.value} - Ação Técnica`);
                    }}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    {CATALOGO_TODAS_NRS.map((nr) => (
                      <option key={nr.nr} value={nr.nr}>
                        {nr.nr} - {nr.titulo.substring(0, 32)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Origem / Perigo / Risco Vinculado:
                  </label>
                  <input
                    type="text"
                    value={itemOrigem}
                    onChange={(e) => setItemOrigem(e.target.value)}
                    placeholder="Ex: NR-12 - Transmissões de força desprotegidas..."
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* WHAT - O QUE FAZER */}
              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  1. O Que Fazer (What) - Medida de Prevenção / Ação Corretiva: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={itemText}
                  onChange={(e) => setItemText(e.target.value)}
                  placeholder="Ex: Instalar proteção mecânica fixa enclausurada nas correias e polias do torno mecânico conforme NR-12..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* WHY - POR QUE FAZER */}
              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  2. Por Que Fazer (Why) - Justificativa / Risco Mitigado:
                </label>
                <input
                  type="text"
                  value={itemWhy}
                  onChange={(e) => setItemWhy(e.target.value)}
                  placeholder="Ex: Eliminar risco de amputação e prensagem de membros superiores..."
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* WHERE & WHO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    3. Onde / Local (Where) - Setor / Máquina / Posto:
                  </label>
                  <input
                    type="text"
                    value={itemWhere}
                    onChange={(e) => setItemWhere(e.target.value)}
                    placeholder="Ex: Setor de Usinagem - Torno Romi nº 02"
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    4. Quem / Responsável (Who):
                  </label>
                  <select
                    value={itemWho}
                    onChange={(e) => setItemWho(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    {DEPARTAMENTOS_PADRAO.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* WHEN - QUANDO / PRAZOS & PRIORIDADE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    5. Quando / Prazo (When):
                  </label>
                  <select
                    value={itemWhen}
                    onChange={(e) => setItemWhen(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    {PRAZOS_PADRAO.map((pz) => (
                      <option key={pz} value={pz}>
                        {pz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Prioridade da Ação:
                  </label>
                  <select
                    value={itemPrioridade}
                    onChange={(e) => setItemPrioridade(e.target.value as any)}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    {PRIORIDADES.map((pr) => (
                      <option key={pr} value={pr}>
                        {pr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Status da Implementação:
                  </label>
                  <select
                    value={itemStatus}
                    onChange={(e) => setItemStatus(e.target.value as any)}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    {STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* HOW - COMO FAZER */}
              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  6. Como Implementar (How) - Procedimento / Método Técnico:
                </label>
                <textarea
                  rows={2}
                  value={itemHow}
                  onChange={(e) => setItemHow(e.target.value)}
                  placeholder="Ex: Confeccionar proteção em chapa de aço perfurada com parafusos de fixação que exigem ferramenta para abertura e intertravamento de segurança categoria 4..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* INDICADOR DE EFICÁCIA & RECURSOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    7. Indicador de Eficácia (How Check):
                  </label>
                  <input
                    type="text"
                    value={itemIndicador}
                    onChange={(e) => setItemIndicador(e.target.value)}
                    placeholder="Ex: Checklist mensal de conformidade da NR-12 com 100% de aprovação..."
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Custo Estimado / Recursos (How Much):
                  </label>
                  <input
                    type="text"
                    value={itemHowMuch}
                    onChange={(e) => setItemHowMuch(e.target.value)}
                    placeholder="Ex: R$ 2.500,00 ou Recursos internos da Manutenção"
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Salvar no Plano de Ação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DO CATÁLOGO COMPLETO DAS 38 NRs */}
      {isNrCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Catálogo de Soluções das 38 Normas Regulamentadoras
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecione uma norma para importar medidas 5W2H predefinidas e acelerar o trabalho em campo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNrCatalogModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filtros de Busca das NRs */}
            <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={nrCatalogSearch}
                  onChange={(e) => setNrCatalogSearch(e.target.value)}
                  placeholder="Pesquisar NR (ex: NR-12, NR-24, NR-35, altura, caldeira, sanitário, ruído, químico)..."
                  className="h-10 w-full pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {(["Todas", "Geral", "Especial", "Setorial"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedNrCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedNrCategory === cat
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista com scroll das NRs */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {catalogoFiltrado.map((nrItem) => (
                <div
                  key={nrItem.nr}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 sm:p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black">
                        {nrItem.nr}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                        {nrItem.titulo}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {nrItem.categoria}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                    {nrItem.resumo}
                  </p>

                  {/* Desvios e Soluções da NR */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Não Conformidades / Desvios Frequentes & Soluções 5W2H:
                    </div>

                    {nrItem.desviosComuns.map((desvio, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 space-y-2 text-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                            <span>{desvio.tituloDesvio}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAplicarPresetNR(nrItem, desvio)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/60 dark:hover:bg-indigo-600 text-indigo-700 hover:text-white dark:text-indigo-300 dark:hover:text-white font-bold text-[11px] transition-all cursor-pointer flex-shrink-0 active:scale-95"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Inserir no Plano</span>
                          </button>
                        </div>

                        <div className="text-[11.5px] text-slate-600 dark:text-slate-300 font-medium">
                          <strong>O Que Fazer:</strong> {desvio.oQueFazer}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                          <div>
                            <strong>Responsável:</strong> {desvio.responsavelSugerido}
                          </div>
                          <div>
                            <strong>Prazo Padrão:</strong> {desvio.prazoSugerido}
                          </div>
                          <div>
                            <strong>Prioridade:</strong> {desvio.prioridadeSugerida}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Rodapé do Modal */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsNrCatalogModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Fechar Catálogo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
