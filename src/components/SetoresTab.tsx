import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Camera,
  ShieldAlert,
  Sparkles,
  X,
  Check,
  Flame,
  AlertCircle,
  Image as ImageIcon,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ListPlus,
  Tag,
} from "lucide-react";
import { SetorData, FotoEvidencia, ExtintorItem, EquipamentoEmergencia, PlanoAcaoItem } from "../types";
import { MODELOS_EXTINTOR, EQUIPAMENTOS_EMERGENCIA_OPCOES, DEFAULT_HORARIO_TRABALHO, DEFAULT_CARGA_HORARIA } from "../data/extinguisherCatalog";
import { parseFotos, parseExtintores, parseEquipamentos, parsePlanoAcao } from "../services/pdfGenerator";
import { ConfirmModal } from "./ConfirmModal";
import { CameraCaptureModal } from "./CameraCaptureModal";
import { maskArea, maskInteger, maskDate } from "../utils/masks";

interface SetoresTabProps {
  setores: SetorData[];
  onSaveSetor: (setor: SetorData) => void;
  onDeleteSetor: (id: string) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
}

const SUGESTOES_PLANO_ACAO = [
  {
    origem: "NR-12 (Máquinas e Equipamentos)",
    texto: "Instalar proteção mecânica enclausurada e intertravamento de segurança nas transmissões de força e zonas de perigo conforme NR-12.",
    prioridade: "Alta" as const,
    prazo: "30 dias",
  },
  {
    origem: "NR-23 (Proteção Contra Incêndios)",
    texto: "Desobstruir o acesso aos extintores/hidrantes e demarcar piso com pintura fotoluminescente normalizada (NR-23).",
    prioridade: "Média" as const,
    prazo: "15 dias",
  },
  {
    origem: "NR-24 (Condições Sanitárias e de Conforto)",
    texto: "Adequar instalações sanitárias (sabonete líquido, toalhas descartáveis, lixeira com tampa e ventilação) e refeitório conforme NR-24.",
    prioridade: "Média" as const,
    prazo: "30 dias",
  },
  {
    origem: "NR-06 (EPIs)",
    texto: "Garantir o fornecimento regular, ficha de entrega assinada e fiscalização do uso dos EPIs com CA válido (NR-06).",
    prioridade: "Alta" as const,
    prazo: "15 dias",
  },
  {
    origem: "NR-10 (Segurança em Eletricidade)",
    texto: "Adequar painéis e quadros elétricos com tampas de proteção, identificação de circuitos e sinalização de risco de choque (NR-10).",
    prioridade: "Crítica / Imediata" as const,
    prazo: "Imediato (48h)",
  },
  {
    origem: "NR-17 (Ergonomia e Conforto)",
    texto: "Disponibilizar suportes reguláveis para monitor, apoio para os pés e assentos estofados com regulagem de altura (NR-17).",
    prioridade: "Baixa" as const,
    prazo: "60 dias",
  },
  {
    origem: "NR-26 (Sinalização de Segurança e GHS)",
    texto: "Rotular todos os recipientes de produtos químicos com FISPQ/FDS e pictogramas de perigo do padrão GHS / NR-26.",
    prioridade: "Alta" as const,
    prazo: "15 dias",
  },
  {
    origem: "NR-20 (Inflamáveis e Combustíveis)",
    texto: "Instalar bacia de contenção para tambores de combustíveis/inflamáveis e aterramento antiestático conforme NR-20.",
    prioridade: "Alta" as const,
    prazo: "30 dias",
  },
  {
    origem: "NR-35 (Trabalho em Altura)",
    texto: "Instalar pontos de ancoragem certificados / linha de vida e garantir capacitação prévia para atividades acima de 2m (NR-35).",
    prioridade: "Crítica / Imediata" as const,
    prazo: "15 dias",
  },
  {
    origem: "NR-33 (Espaços Confinados)",
    texto: "Implantar Permissão de Entrada e Trabalho (PET), monitoramento contínuo de gases e vigia capacitado conforme NR-33.",
    prioridade: "Crítica / Imediata" as const,
    prazo: "15 dias",
  },
  {
    origem: "NR-11 (Movimentação de Cargas)",
    texto: "Demarcar faixas de circulação de pedestres e empilhadeiras, com manutenção preventiva registrada nos equipamentos (NR-11).",
    prioridade: "Média" as const,
    prazo: "30 dias",
  },
  {
    origem: "NR-01 (GRO / PGR)",
    texto: "Realizar treinamento admissional e periódico sobre os riscos ocupacionais e medidas de prevenção a todos os trabalhadores.",
    prioridade: "Média" as const,
    prazo: "30 dias",
  },
];

export const SetoresTab: React.FC<SetoresTabProps> = ({
  setores,
  onSaveSetor,
  onDeleteSetor,
  onAlert,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sectorToDelete, setSectorToDelete] = useState<{ id: string; name: string } | null>(null);

  // Form State with pre-filled defaults!
  const [nome, setNome] = useState("");
  const [horarioDesc, setHorarioDesc] = useState(DEFAULT_HORARIO_TRABALHO);
  const [cargaHoraria, setCargaHoraria] = useState(DEFAULT_CARGA_HORARIA);
  const [andares, setAndares] = useState("1");
  const [edificacao, setEdificacao] = useState("Galpão Industrial");
  const [area, setArea] = useState("");
  const [iluminacao, setIluminacao] = useState("Artificial - LED");
  const [ventilacao, setVentilacao] = useState("Natural e Artificial (Exaustão/Ventiladores)");
  const [piso, setPiso] = useState("Concreto de Alta Resistência");
  const [fechamento, setFechamento] = useState("Alvenaria");
  const [obs, setObs] = useState("");
  const [maquinas, setMaquinas] = useState("");
  const [controles, setControles] = useState("");

  // Múltiplos Itens de Plano de Ação
  const [planoItens, setPlanoItens] = useState<PlanoAcaoItem[]>([]);
  const [itemTexto, setItemTexto] = useState("");
  const [itemOrigem, setItemOrigem] = useState("NR-12 (Máquinas)");
  const [itemPrioridade, setItemPrioridade] = useState<"Crítica / Imediata" | "Alta" | "Média" | "Baixa">("Alta");
  const [itemPrazoTipo, setItemPrazoTipo] = useState("30 dias");
  const [itemDataSugerida, setItemDataSugerida] = useState("");
  const [itemResponsavel, setItemResponsavel] = useState("Gestão do Setor / Manutenção");
  const [itemStatus, setItemStatus] = useState<"Pendente" | "Em Andamento" | "Concluído">("Pendente");
  const [editingPlanoId, setEditingPlanoId] = useState<string | null>(null);

  const [fotos, setFotos] = useState<FotoEvidencia[]>([]);
  const [extintores, setExtintores] = useState<ExtintorItem[]>([]);
  const [equipamentos, setEquipamentos] = useState<EquipamentoEmergencia[]>([]);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const handleCameraPhotoCapture = (dataUrl: string, fileName: string) => {
    setFotos((prev) => [
      ...prev,
      {
        id: String(Date.now()) + Math.random().toString().slice(2, 6),
        nome: fileName,
        dataUrl,
        data: new Date().toISOString(),
      },
    ]);
  };

  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sub-forms for Extinguisher & Equipment
  const [extModelo, setExtModelo] = useState("");
  const [extClasse, setExtClasse] = useState("");
  const [extCapacidade, setExtCapacidade] = useState("");
  const [extQtd, setExtQtd] = useState("1");
  const [extValidade, setExtValidade] = useState("");
  const [extLocal, setExtLocal] = useState("");
  const [extSinalizado, setExtSinalizado] = useState("Sim");
  const [extDesobstruido, setExtDesobstruido] = useState("Sim");

  const [equipTipo, setEquipTipo] = useState("");
  const [equipTipoOutro, setEquipTipoOutro] = useState("");
  const [equipQtd, setEquipQtd] = useState("1");
  const [equipObs, setEquipObs] = useState("");

  const handleOpenNew = () => {
    setEditingId(null);
    setNome("");
    setHorarioDesc(DEFAULT_HORARIO_TRABALHO);
    setCargaHoraria(DEFAULT_CARGA_HORARIA);
    setAndares("1");
    setEdificacao("Galpão Industrial");
    setArea("");
    setIluminacao("Artificial - LED");
    setVentilacao("Natural e Artificial (Exaustão/Ventiladores)");
    setPiso("Concreto de Alta Resistência");
    setFechamento("Alvenaria");
    setObs("");
    setMaquinas("");
    setControles("");
    setPlanoItens([]);
    setItemTexto("");
    setItemOrigem("NR-12 (Segurança em Máquinas e Equipamentos)");
    setItemPrioridade("Alta");
    setItemPrazoTipo("30 dias");
    setItemDataSugerida("");
    setItemResponsavel("Gestão do Setor / Manutenção");
    setItemStatus("Pendente");
    setEditingPlanoId(null);
    setFotos([]);
    setExtintores([]);
    setEquipamentos([]);
    setExtSinalizado("Sim");
    setExtDesobstruido("Sim");
    setEquipTipoOutro("");
    setModalOpen(true);
  };

  const handleOpenEdit = (s: SetorData) => {
    setEditingId(s.id);
    setNome(s.setor_nome || "");
    setHorarioDesc(s.setor_horario_desc || DEFAULT_HORARIO_TRABALHO);
    setCargaHoraria(s.setor_carga || DEFAULT_CARGA_HORARIA);
    setAndares(s.setor_andares || "1");
    setEdificacao(s.setor_edificacao || "Galpão Industrial");
    setArea(s.setor_area || "");
    setIluminacao(s.setor_iluminacao || "Artificial - LED");
    setVentilacao(s.setor_ventilacao || "Natural e Artificial (Exaustão/Ventiladores)");
    setPiso(s.setor_piso || "Concreto de Alta Resistência");
    setFechamento(s.setor_fechamento || "Alvenaria");
    setObs(s.setor_obs || "");
    setMaquinas(s.setor_maquinas || "");
    setControles(s.setor_controles || "");
    
    // Parse Plano de Ação Itens
    const parsedItens = parsePlanoAcao(
      s.setor_plano_itens,
      s.setor_plano_acao,
      s.setor_plano_prioridade,
      s.setor_plano_prazo
    );
    setPlanoItens(parsedItens);
    setItemTexto("");
    setItemOrigem("NR-12 (Máquinas)");
    setItemPrioridade("Alta");
    setItemPrazoTipo("30 dias");
    setItemDataSugerida("");
    setItemResponsavel(s.setor_plano_responsavel || "Gestão do Setor / Manutenção");
    setItemStatus("Pendente");
    setEditingPlanoId(null);

    setFotos(parseFotos(s.setor_fotos));
    setExtintores(parseExtintores(s.setor_extintores));
    setEquipamentos(parseEquipamentos(s.setor_equipamentos));
    setExtSinalizado("Sim");
    setExtDesobstruido("Sim");
    setModalOpen(true);
  };

  const handleAddOrUpdatePlanoItem = () => {
    if (!itemTexto.trim()) {
      onAlert("info", "Informe a descrição da ação ou recomendação.");
      return;
    }

    if (editingPlanoId) {
      setPlanoItens(
        planoItens.map((p) =>
          p.id === editingPlanoId
            ? {
                ...p,
                item: itemTexto.trim(),
                origemOuRisco: itemOrigem,
                prioridade: itemPrioridade,
                prazo: itemPrazoTipo,
                dataSugerida: itemDataSugerida.trim() || undefined,
                responsavel: itemResponsavel.trim() || "Gestão do Setor / Manutenção",
                status: itemStatus,
              }
            : p
        )
      );
      setEditingPlanoId(null);
      onAlert("success", "Item do plano de ação atualizado!");
    } else {
      const newItem: PlanoAcaoItem = {
        id: String(Date.now()) + Math.random().toString().slice(2, 5),
        item: itemTexto.trim(),
        origemOuRisco: itemOrigem,
        prioridade: itemPrioridade,
        prazo: itemPrazoTipo,
        dataSugerida: itemDataSugerida.trim() || undefined,
        responsavel: itemResponsavel.trim() || "Gestão do Setor / Manutenção",
        status: itemStatus,
      };
      setPlanoItens([...planoItens, newItem]);
      onAlert("success", "Item adicionado ao plano de ação!");
    }

    setItemTexto("");
    setItemDataSugerida("");
  };

  const handleEditPlanoItem = (p: PlanoAcaoItem) => {
    setEditingPlanoId(p.id);
    setItemTexto(p.item);
    setItemOrigem(p.origemOuRisco || "NR-12 (Máquinas)");
    setItemPrioridade(p.prioridade || "Alta");
    setItemPrazoTipo(p.prazo || "30 dias");
    setItemDataSugerida(p.dataSugerida || "");
    setItemResponsavel(p.responsavel || "Gestão do Setor / Manutenção");
    setItemStatus(p.status || "Pendente");
  };

  const handleCancelEditPlanoItem = () => {
    setEditingPlanoId(null);
    setItemTexto("");
    setItemDataSugerida("");
  };

  const handleRemovePlanoItem = (id: string) => {
    setPlanoItens(planoItens.filter((p) => p.id !== id));
    if (editingPlanoId === id) {
      setEditingPlanoId(null);
      setItemTexto("");
      setItemDataSugerida("");
    }
  };

  const handleTogglePlanoStatus = (id: string) => {
    setPlanoItens(
      planoItens.map((p) => {
        if (p.id !== id) return p;
        const nextStatus: "Pendente" | "Em Andamento" | "Concluído" =
          p.status === "Pendente"
            ? "Em Andamento"
            : p.status === "Em Andamento"
            ? "Concluído"
            : "Pendente";
        return { ...p, status: nextStatus };
      })
    );
  };

  const handleApplySugestao = (sug: typeof SUGESTOES_PLANO_ACAO[0]) => {
    setItemTexto(sug.texto);
    setItemOrigem(sug.origem);
    setItemPrioridade(sug.prioridade);
    setItemPrazoTipo(sug.prazo);
  };

  const handleExtModeloChange = (modelo: string) => {
    setExtModelo(modelo);
    const item = MODELOS_EXTINTOR.find((m) => m.modelo === modelo);
    if (item) {
      setExtClasse(item.classe);
      if (!extCapacidade) setExtCapacidade(item.capacidades.split(",")[0].trim());
    }
  };

  const handleAddExtintor = () => {
    if (!extModelo) {
      onAlert("info", "Selecione o modelo do extintor.");
      return;
    }
    const newExt: ExtintorItem = {
      id: String(Date.now()),
      modelo: extModelo,
      classe: extClasse || "A:B:C",
      capacidade: extCapacidade || "Padrão",
      qtd: extQtd || "1",
      validade: extValidade || new Date().toISOString().slice(0, 10),
      local: extLocal || "Próximo à rota de circulação",
      sinalizado: extSinalizado,
      desobstruido: extDesobstruido,
    };
    setExtintores([...extintores, newExt]);
    setExtModelo("");
    setExtClasse("");
    setExtCapacidade("");
    setExtLocal("");
    setExtQtd("1");
    setExtValidade("");
    setExtSinalizado("Sim");
    setExtDesobstruido("Sim");
    onAlert("success", "Extintor adicionado ao setor!");
  };

  const handleAddEquipamento = () => {
    if (!equipTipo) {
      onAlert("info", "Selecione o tipo de equipamento de emergência.");
      return;
    }
    const isOutro = equipTipo.toLowerCase().includes("outro");
    if (isOutro && !equipTipoOutro.trim()) {
      onAlert("info", "Por favor, digite o nome/descrição do outro equipamento.");
      return;
    }
    const finalTipo = isOutro ? equipTipoOutro.trim() : equipTipo;

    const newEquip: EquipamentoEmergencia = {
      id: String(Date.now()),
      tipo: finalTipo,
      qtd: equipQtd || "1",
      obs: equipObs || "Em bom estado de conservação e operacional.",
    };
    setEquipamentos([...equipamentos, newEquip]);
    setEquipTipo("");
    setEquipTipoOutro("");
    setEquipQtd("1");
    setEquipObs("");
    onAlert("success", "Equipamento de emergência adicionado ao setor!");
  };

  const handleAddFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    for (const file of files) {
      try {
        const dataUrl = await comprimirFoto(file, 1000, 0.7);
        setFotos((prev) => [
          ...prev,
          {
            id: String(Date.now()) + Math.random().toString().slice(2, 6),
            nome: file.name || "foto_vistoria.jpg",
            dataUrl,
            data: new Date().toISOString(),
          },
        ]);
      } catch {
        onAlert("error", "Não foi possível processar uma das fotos.");
      }
    }
    e.target.value = "";
    onAlert("success", "Foto adicionada!");
  };

  const comprimirFoto = (file: File, maxSize: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = () => {
    if (!nome.trim()) {
      onAlert("error", "Por favor, informe o nome do setor.");
      return;
    }

    const resumoPlano = planoItens
      .map(
        (p) =>
          `- [${p.prioridade} | Prazo: ${p.prazo}${p.dataSugerida ? ` (${p.dataSugerida})` : ""}] ${p.item}`
      )
      .join("\n");

    const setor: SetorData = {
      id: editingId || String(Date.now()),
      setor_nome: nome.trim(),
      setor_horario_desc: horarioDesc,
      setor_carga: cargaHoraria,
      setor_andares: andares,
      setor_edificacao: edificacao,
      setor_area: area,
      setor_iluminacao: iluminacao,
      setor_ventilacao: ventilacao,
      setor_piso: piso,
      setor_fechamento: fechamento,
      setor_obs: obs,
      setor_maquinas: maquinas,
      setor_controles: controles,
      setor_plano_acao: resumoPlano,
      setor_plano_itens: JSON.stringify(planoItens),
      setor_plano_prioridade: planoItens[0]?.prioridade || "Alta",
      setor_plano_prazo: planoItens[0]?.prazo || "30 dias",
      setor_plano_responsavel: planoItens[0]?.responsavel || "Gestão do Setor / Manutenção",
      setor_plano_status: planoItens[0]?.status || "Pendente",
      setor_fotos: JSON.stringify(fotos),
      setor_extintores: JSON.stringify(extintores),
      setor_equipamentos: JSON.stringify(equipamentos),
    };

    onSaveSetor(setor);
    setModalOpen(false);
    onAlert("success", `Setor "${nome}" salvo com sucesso!`);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-xs font-bold text-white shadow-xs">
              2
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">Setores e Ambientes de Trabalho</h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Mapeamento físico, extintores, emergência e plano de ação</p>
            </div>
          </div>
          
          <button
            onClick={handleOpenNew}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar Novo Setor / Ambiente</span>
          </button>
        </div>

        {setores.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Nenhum setor cadastrado ainda.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Cadastre os ambientes da empresa (ex: Produção, Almoxarifado, Escritório Administrativo, Refeitório).
            </p>
            <button
              onClick={handleOpenNew}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Cadastrar Primeiro Setor</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {setores.map((setor) => {
              const fotosCount = parseFotos(setor.setor_fotos).length;
              const extList = parseExtintores(setor.setor_extintores);
              const equipList = parseEquipamentos(setor.setor_equipamentos);
              const planoList = parsePlanoAcao(
                setor.setor_plano_itens,
                setor.setor_plano_acao,
                setor.setor_plano_prioridade,
                setor.setor_plano_prazo
              );

              return (
                <div
                  key={setor.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{setor.setor_nome}</h3>
                      {planoList.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                          <ShieldAlert className="h-3 w-3" />
                          {planoList.length} {planoList.length === 1 ? "ação" : "ações"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {[
                        setor.setor_edificacao,
                        setor.setor_area ? `${setor.setor_area} m²` : "",
                        setor.setor_horario_desc,
                        setor.setor_carga ? `${setor.setor_carga}h/dia` : "",
                        extList.length > 0 ? `🧯 ${extList.length} extintor(es)` : "",
                        equipList.length > 0 ? `🚨 ${equipList.length} equip. emergência` : "",
                        fotosCount > 0 ? `📷 ${fotosCount} foto(s)` : "",
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEdit(setor)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 shadow-2xs transition-all"
                      title="Editar Setor"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSectorToDelete({ id: setor.id, name: setor.setor_nome })}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 active:scale-95 transition-all"
                      title="Excluir Setor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição de Setor - Sem corte de tela e responsivo */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl my-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {editingId ? "Editar Setor" : "Novo Setor / Ambiente"}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Preencha os dados e características do ambiente</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1 overscroll-contain">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Nome do Setor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Produção, Almoxarifado, Escritório Administrativo..."
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Horário de Trabalho Pré-preenchido */}
              <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  Horário de Trabalho Padrão (Pré-preenchido)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={horarioDesc}
                      onChange={(e) => setHorarioDesc(e.target.value)}
                      placeholder="Ex: Segunda a Sexta: 08h às 17h"
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={cargaHoraria}
                      onChange={(e) => setCargaHoraria(maskInteger(e.target.value, 2))}
                      placeholder="8h/dia"
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Características da Edificação */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Tipo de Edificação
                  </label>
                  <select
                    value={edificacao}
                    onChange={(e) => setEdificacao(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="Galpão Industrial">Galpão Industrial</option>
                    <option value="Prédio Comercial">Prédio Comercial</option>
                    <option value="Sala Comercial">Sala Comercial</option>
                    <option value="Casa / Residência Adaptada">Casa / Residência Adaptada</option>
                    <option value="Armazém / Depósito">Armazém / Depósito</option>
                    <option value="Loja / Pavimento Térreo">Loja / Pavimento Térreo</option>
                    <option value="Área Aberta / Pátio">Área Aberta / Pátio</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Área Aproximada (m²)
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(maskArea(e.target.value))}
                    placeholder="Ex: 120"
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Tipo de Iluminação
                  </label>
                  <select
                    value={iluminacao}
                    onChange={(e) => setIluminacao(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="Artificial - LED">Artificial - LED</option>
                    <option value="Natural e Artificial (Mista)">Natural e Artificial (Mista)</option>
                    <option value="Natural (Janelas/Telhas Translúcidas)">Natural (Janelas/Telhas)</option>
                    <option value="Artificial - Fluorescente">Artificial - Fluorescente</option>
                    <option value="Artificial - Incandescente/Mista">Artificial - Mista</option>
                    <option value="Insuficiente / Necessita Melhoria">Insuficiente / A melhorar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Tipo de Ventilação
                  </label>
                  <select
                    value={ventilacao}
                    onChange={(e) => setVentilacao(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="Natural e Artificial (Exaustão/Ventiladores)">Natural e Artificial (Exaustão)</option>
                    <option value="Ar Condicionado Central / Split">Ar Condicionado Split/Central</option>
                    <option value="Natural (Janelas e Portas)">Natural (Janelas e Portas)</option>
                    <option value="Artificial / Sistema de Exaustão Forçada">Exaustão Forçada</option>
                    <option value="Mista">Mista</option>
                    <option value="Insuficiente / Precária">Insuficiente / Precária</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Tipo de Piso
                  </label>
                  <select
                    value={piso}
                    onChange={(e) => setPiso(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="Concreto de Alta Resistência">Concreto de Alta Resistência</option>
                    <option value="Cerâmica / Porcelanato">Cerâmica / Porcelanato</option>
                    <option value="Cimento Queimado">Cimento Queimado</option>
                    <option value="Piso Epóxi Industrial">Piso Epóxi Industrial</option>
                    <option value="Antiderrapante com Ranhuras">Antiderrapante</option>
                    <option value="Carpete">Carpete</option>
                    <option value="Terra Batida / Pavimentação">Terra Batida / Pavimentação</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Tipo de Fechamento (Paredes)
                  </label>
                  <select
                    value={fechamento}
                    onChange={(e) => setFechamento(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="Alvenaria">Alvenaria</option>
                    <option value="Estrutura Metálica com Telhas">Estrutura Metálica c/ Telhas</option>
                    <option value="Drywall / Gesso Acartonado">Drywall / Divisórias</option>
                    <option value="Vidro Temperado / Fachada de Vidro">Vidro Temperado</option>
                    <option value="Misto (Alvenaria e Metal)">Misto</option>
                    <option value="Aberto / Sem Fechamento Lateral">Aberto / Pátio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Máquinas, Equipamentos e Processos Operacionais
                </label>
                <textarea
                  rows={2}
                  value={maquinas}
                  onChange={(e) => setMaquinas(e.target.value)}
                  placeholder="Ex: Compressores, empilhadeira a GLP, torno mecânico, bancada de solda, computadores..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
              </div>

              {/* Extintores de Incêndio do Setor com Opções de Sinalizado e Desobstruído */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 p-3.5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-red-500" />
                  Extintores de Incêndio do Setor
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Modelo / Agente</label>
                    <select
                      value={extModelo}
                      onChange={(e) => handleExtModeloChange(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="">Selecione o Modelo</option>
                      {MODELOS_EXTINTOR.map((m) => (
                        <option key={m.modelo} value={m.modelo}>
                          {m.modelo} - {m.classe}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Capacidade</label>
                    <input
                      type="text"
                      value={extCapacidade}
                      onChange={(e) => setExtCapacidade(e.target.value)}
                      placeholder="Ex: 4 kg, 6 kg, 10 L"
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Qtd</label>
                    <input
                      type="text"
                      value={extQtd}
                      onChange={(e) => setExtQtd(maskInteger(e.target.value, 4))}
                      placeholder="1"
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Data de Validade</label>
                    <input
                      type="date"
                      value={extValidade}
                      onChange={(e) => setExtValidade(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Localização</label>
                    <input
                      type="text"
                      value={extLocal}
                      onChange={(e) => setExtLocal(e.target.value)}
                      placeholder="Ex: Ao lado do quadro elétrico"
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Opções de Sinalizado e Desobstruído (Atendendo ao pedido explícito do usuário) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Sinalizado Conforme Norma?
                    </label>
                    <select
                      value={extSinalizado}
                      onChange={(e) => setExtSinalizado(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Sim">✅ Sim (Sinalização Completa e Fotoluminescente)</option>
                      <option value="Não">❌ Não (Sem Sinalização)</option>
                      <option value="Parcial">⚠️ Parcial (Sinalização Incompleta / Danificada)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Desobstruído e Acesso Livre?
                    </label>
                    <select
                      value={extDesobstruido}
                      onChange={(e) => setExtDesobstruido(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Sim">✅ Sim (Acesso 100% Livre e Desimpedido)</option>
                      <option value="Não">❌ Não (Obstruído por materiais / caixas)</option>
                      <option value="Parcial">⚠️ Parcial (Acesso Dificultado)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddExtintor}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 active:scale-95 shadow-xs transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Extintor</span>
                </button>

                {extintores.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {extintores.map((ext, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs shadow-2xs"
                      >
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {ext.qtd}x {ext.modelo} ({ext.classe}) - {ext.capacidade}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {ext.local} {ext.validade ? `• Validade: ${ext.validade}` : ""}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                ext.sinalizado === "Sim"
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                  : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                              }`}
                            >
                              Sinalizado: {ext.sinalizado || "Sim"}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                ext.desobstruido === "Sim"
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                  : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                              }`}
                            >
                              Desobstruído: {ext.desobstruido || "Sim"}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExtintores(extintores.filter((_, i) => i !== idx))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all flex-shrink-0"
                          title="Remover Extintor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Equipamentos de Emergência */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 p-3.5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Outros Equipamentos de Proteção / Emergência / Resgate
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={equipTipo}
                      onChange={(e) => setEquipTipo(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Selecione Equipamento</option>
                      {EQUIPAMENTOS_EMERGENCIA_OPCOES.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={equipQtd}
                      onChange={(e) => setEquipQtd(maskInteger(e.target.value, 4))}
                      placeholder="Qtd"
                      className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {equipTipo.toLowerCase().includes("outro") && (
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-bold text-blue-800 dark:text-blue-300">
                      Especifique o Outro Equipamento de Proteção / Emergência / Resgate: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={equipTipoOutro}
                      onChange={(e) => setEquipTipoOutro(e.target.value)}
                      placeholder="Ex: Conjunto autônomo com máscara facial panorâmica, trava-quedas retrátil..."
                      className="h-10 w-full rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    value={equipObs}
                    onChange={(e) => setEquipObs(e.target.value)}
                    placeholder="Condições operacionais / localização / testes (Opcional)"
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddEquipamento}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Equipamento de Emergência</span>
                </button>

                {equipamentos.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {equipamentos.map((equip, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs shadow-2xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {equip.qtd}x {equip.tipo}
                          </p>
                          {equip.obs && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{equip.obs}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => setEquipamentos(equipamentos.filter((_, i) => i !== idx))}
                          className="rounded-lg p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fotos e Evidências */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Fotos e Evidências do Ambiente
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer select-none"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Tirar Foto na Câmera (Ao Vivo)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer select-none"
                  >
                    <ImageIcon className="h-4 w-4 text-slate-500" />
                    <span>Galeria / Anexar Fotos</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddFotos}
                    className="hidden"
                  />
                </div>

                {fotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {fotos.map((foto, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs">
                        <img src={foto.dataUrl} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFotos(fotos.filter((_, i) => i !== idx))}
                          className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center text-[10px] font-bold hover:bg-red-600 transition-all cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Medidas de Controle Existentes
                </label>
                <textarea
                  rows={2}
                  value={controles}
                  onChange={(e) => setControles(e.target.value)}
                  placeholder="Ex: Sinalização de piso, guarda-corpos, exaustão, manutenção preventiva..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
              </div>

              {/* Plano de Ação e Pendências para PGR / Laudos (Múltiplos Itens com Prioridade e Data Sugerida) */}
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 sm:p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-white text-xs font-bold">
                      <ShieldAlert className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 dark:text-amber-200">
                        Plano de Ação e Pendências Técnicas (PGR / NR-01)
                      </h4>
                      <p className="text-[10px] text-amber-800 dark:text-amber-300">
                        Cadastre cada não conformidade com sua respectiva prioridade e data/prazo sugerido
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-amber-200/80 dark:bg-amber-900/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                    {planoItens.length} {planoItens.length === 1 ? "item" : "itens"}
                  </span>
                </div>

                {/* Sugestões Rápidas de Preenchimento */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-900/80 dark:text-amber-300/90">
                    <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    <span>Sugestões Rápidas de Pendências Frequentes:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGESTOES_PLANO_ACAO.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplySugestao(sug)}
                        className="rounded-lg border border-amber-300 dark:border-amber-800/80 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 text-[10.5px] font-semibold text-amber-950 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:border-amber-400 transition-all active:scale-95 text-left"
                      >
                        + {sug.origem.split(" ")[0]}: {sug.texto.slice(0, 38)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formulário do Item de Ação */}
                <div className="rounded-xl border border-amber-300/80 dark:border-amber-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ListPlus className="h-3.5 w-3.5 text-amber-600" />
                      {editingPlanoId ? "Editar Item do Plano" : "Adicionar Nova Pendência / Ação"}
                    </span>
                    {editingPlanoId && (
                      <button
                        type="button"
                        onClick={handleCancelEditPlanoItem}
                        className="text-[10px] font-bold text-slate-500 hover:text-red-500"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Descrição da Não Conformidade / Medida Recomendada <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={itemTexto}
                      onChange={(e) => setItemTexto(e.target.value)}
                      placeholder="Ex: Instalar proteção física enclausurada nas polias da serra fita conforme NR-12..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Origem / Norma */}
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        Norma / Origem da Pendência
                      </label>
                      <select
                        value={itemOrigem}
                        onChange={(e) => setItemOrigem(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                      >
                        <option value="NR-01 (Disposições Gerais e GRO/PGR)">NR-01 (Disposições Gerais e GRO/PGR)</option>
                        <option value="NR-05 (CIPA - Prevenção de Acidentes)">NR-05 (CIPA - Prevenção de Acidentes)</option>
                        <option value="NR-06 (EPI - Equipamentos de Proteção)">NR-06 (EPI - Equipamentos de Proteção)</option>
                        <option value="NR-07 (PCMSO - Saúde Ocupacional)">NR-07 (PCMSO - Saúde Ocupacional)</option>
                        <option value="NR-09 / NR-15 (Agentes Ambientais - Físicos/Químicos/Biológicos)">NR-09 / NR-15 (Agentes Ambientais e Insalubridade)</option>
                        <option value="NR-10 (Segurança em Instalações Elétricas)">NR-10 (Segurança em Eletricidade)</option>
                        <option value="NR-11 (Transporte e Movimentação de Cargas)">NR-11 (Movimentação e Armazenagem de Materiais)</option>
                        <option value="NR-12 (Segurança em Máquinas e Equipamentos)">NR-12 (Segurança em Máquinas e Equipamentos)</option>
                        <option value="NR-13 (Caldeiras, Vasos de Pressão e Tubulações)">NR-13 (Caldeiras e Vasos de Pressão)</option>
                        <option value="NR-16 (Atividades e Operações Perigosas)">NR-16 (Periculosidade)</option>
                        <option value="NR-17 (Ergonomia e Conforto no Posto)">NR-17 (Ergonomia e Conforto no Trabalho)</option>
                        <option value="NR-18 (Condições de Segurança na Construção)">NR-18 (Indústria da Construção)</option>
                        <option value="NR-20 (Inflamáveis e Combustíveis)">NR-20 (Segurança com Inflamáveis e Combustíveis)</option>
                        <option value="NR-23 (Proteção Contra Incêndios)">NR-23 (Proteção Contra Incêndios)</option>
                        <option value="NR-24 (Condições Sanitárias e de Conforto)">NR-24 (Condições Sanitárias e de Conforto nos Locais de Trabalho)</option>
                        <option value="NR-26 (Sinalização de Segurança e GHS)">NR-26 (Sinalização de Segurança e Rotulagem GHS)</option>
                        <option value="NR-33 (Segurança em Espaços Confinados)">NR-33 (Espaços Confinados)</option>
                        <option value="NR-35 (Trabalho em Altura)">NR-35 (Trabalho em Altura)</option>
                        <option value="NR-38 (Limpeza Urbana e Resíduos Sólidos)">NR-38 (Limpeza Urbana e Resíduos)</option>
                        <option value="Outras Recomendações e Diretrizes Técnicas">Outras Recomendações e Diretrizes Técnicas</option>
                      </select>
                    </div>

                    {/* Grau de Prioridade */}
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        Grau de Prioridade
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { label: "Crítica / Imediata" as const, short: "Crítica", color: "bg-red-800 text-white", border: "border-red-800" },
                          { label: "Alta" as const, short: "Alta", color: "bg-red-600 text-white", border: "border-red-600" },
                          { label: "Média" as const, short: "Média", color: "bg-amber-500 text-white", border: "border-amber-500" },
                          { label: "Baixa" as const, short: "Baixa", color: "bg-emerald-600 text-white", border: "border-emerald-600" },
                        ].map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setItemPrioridade(p.label)}
                            className={`h-9 rounded-lg text-[10px] font-bold transition-all border ${
                              itemPrioridade === p.label
                                ? `${p.color} ${p.border} shadow-2xs font-extrabold scale-102`
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            {p.short}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Prazo Limite */}
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        Prazo Sugerido
                      </label>
                      <select
                        value={itemPrazoTipo}
                        onChange={(e) => setItemPrazoTipo(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                      >
                        <option value="Imediato (48h)">Imediato (24h-48h)</option>
                        <option value="15 dias">15 dias</option>
                        <option value="30 dias">30 dias</option>
                        <option value="60 dias">60 dias</option>
                        <option value="90 dias">90 dias</option>
                        <option value="120 dias">120 dias</option>
                        <option value="180 dias">180 dias (Semestral)</option>
                        <option value="Contínuo">Contínuo / Permanente</option>
                      </select>
                    </div>

                    {/* Data Sugerida */}
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        Data Específica (Opcional)
                      </label>
                      <input
                        type="text"
                        value={itemDataSugerida}
                        onChange={(e) => setItemDataSugerida(maskDate(e.target.value))}
                        placeholder="DD/MM/AAAA"
                        className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Responsável */}
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        Responsável
                      </label>
                      <input
                        type="text"
                        value={itemResponsavel}
                        onChange={(e) => setItemResponsavel(e.target.value)}
                        placeholder="Ex: Manutenção / Gestão"
                        className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Botão de Adicionar / Salvar Item */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddOrUpdatePlanoItem}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-amber-600 dark:bg-amber-500 px-4 text-xs font-bold text-white hover:bg-amber-700 active:scale-95 transition-all shadow-xs"
                    >
                      {editingPlanoId ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      <span>{editingPlanoId ? "Salvar Alterações no Item" : "+ Adicionar Item ao Plano de Ação"}</span>
                    </button>
                  </div>
                </div>

                {/* Lista de Itens Cadastrados */}
                {planoItens.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-amber-950 dark:text-amber-200">
                      Itens do Plano de Ação deste Setor ({planoItens.length}):
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {planoItens.map((p, idx) => {
                        const isCritica = p.prioridade.includes("Crítica");
                        const isAlta = p.prioridade === "Alta";
                        const isMedia = p.prioridade === "Média";

                        const badgeColor = isCritica
                          ? "bg-red-800 text-white"
                          : isAlta
                          ? "bg-red-600 text-white"
                          : isMedia
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-600 text-white";

                        return (
                          <div
                            key={p.id || idx}
                            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all hover:border-amber-300 dark:hover:border-amber-800"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                                  {p.prioridade}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                                  <Clock className="h-2.5 w-2.5" />
                                  {p.prazo}{p.dataSugerida ? ` (${p.dataSugerida})` : ""}
                                </span>
                                {p.origemOuRisco && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                                    <Tag className="h-2.5 w-2.5" />
                                    {p.origemOuRisco}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 break-words">
                                {p.item}
                              </p>
                              <div className="flex items-center gap-3 text-[10.5px] text-slate-500 dark:text-slate-400">
                                <span>Resp: <strong>{p.responsavel || "Gestão / Manutenção"}</strong></span>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePlanoStatus(p.id)}
                                  className={`font-bold hover:underline ${
                                    p.status === "Concluído"
                                      ? "text-emerald-600"
                                      : p.status === "Em Andamento"
                                      ? "text-blue-600"
                                      : "text-amber-600"
                                  }`}
                                  title="Clique para alternar status"
                                >
                                  Status: {p.status || "Pendente"} ↻
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleEditPlanoItem(p)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                                title="Editar Item"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemovePlanoItem(p.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100"
                                title="Excluir Item"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Pinned */}
            <div className="border-t border-slate-100 dark:border-slate-800 p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-end gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="h-10 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
              >
                Salvar Setor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Setor */}
      <ConfirmModal
        isOpen={Boolean(sectorToDelete)}
        title="Excluir Setor"
        message={`Deseja realmente excluir o setor "${sectorToDelete?.name}"? Esta ação removerá o setor e suas fotos/extintores associados.`}
        confirmLabel="Sim, Excluir Setor"
        onConfirm={() => {
          if (sectorToDelete) {
            onDeleteSetor(sectorToDelete.id);
            setSectorToDelete(null);
          }
        }}
        onCancel={() => setSectorToDelete(null)}
      />

      {/* Modal de Câmera em Tempo Real */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraPhotoCapture}
        onAlert={onAlert}
      />
    </div>
  );
};
