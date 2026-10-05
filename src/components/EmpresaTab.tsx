import React, { useState, useRef } from "react";
import {
  Search,
  MapPin,
  Loader2,
  ExternalLink,
  Building2,
  User,
  FileText,
  CheckCircle2,
  Briefcase,
  PenTool,
  Save,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Clock,
  Check,
  Image as ImageIcon,
  Upload,
  Copy,
} from "lucide-react";
import { EmpresaData } from "../types";
import { SignatureModal } from "./SignatureModal";
import { maskCNPJ, maskCPF, maskCEP, maskPhone, maskCNAE, maskInteger } from "../utils/masks";
import { fetchCNPJData } from "../services/cnpjService";

interface EmpresaTabProps {
  empresa: Partial<EmpresaData>;
  onChange: (field: keyof EmpresaData, value: string) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
  onDuplicateCompany?: () => void;
}

const CONSULTORIA_PADRAO_KEY = "sst_consultoria_padrao_v1";

export const EmpresaTab: React.FC<EmpresaTabProps> = ({ empresa, onChange, onAlert, onDuplicateCompany }) => {
  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [loadingGeocode, setLoadingGeocode] = useState(false);

  // Modais de Assinatura
  const [modalAssinatura, setModalAssinatura] = useState<"representante" | "tecnico" | null>(null);

  const fileInputEmpresaRef = useRef<HTMLInputElement | null>(null);
  const fileInputConsultoriaRef = useRef<HTMLInputElement | null>(null);

  const handleUploadLogo = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "emp_logo" | "emp_consultoria_logo",
    label: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onAlert("error", "Por favor selecione um arquivo de imagem válido (PNG, JPG, SVG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      // Redimensionar suavemente via canvas para não sobrecarregar memória/PDF
      const img = new Image();
      img.onload = () => {
        const maxW = 500;
        const maxH = 250;
        let w = img.width;
        let h = img.height;

        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/png", 0.9);
          onChange(field, compressed);
          onAlert("success", `Logotipo de ${label} carregado com sucesso!`);
        } else {
          onChange(field, dataUrl);
          onAlert("success", `Logotipo de ${label} carregado com sucesso!`);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    // Limpar o input
    e.target.value = "";
  };

  const titleCase = (text: string) => {
    return text
      .toLowerCase()
      .replace(/(^|\s|\/|-)([a-záàâãéêíóôõúç])/g, (_, p1, p2) => p1 + p2.toUpperCase());
  };

  const handleBuscarCNPJ = async () => {
    const raw = (empresa.emp_cnpj || "").replace(/\D/g, "");
    if (raw.length !== 14) {
      onAlert("info", "Digite um CNPJ válido com 14 dígitos para consultar.");
      return;
    }

    try {
      setLoadingCNPJ(true);
      onAlert("info", "Consultando dados cadastrais na base pública...");

      const data = await fetchCNPJData(raw);

      if (data.razao_social) onChange("emp_razao", data.razao_social);
      if (data.nome_fantasia) onChange("emp_fantasia", data.nome_fantasia);
      if (data.cnae_fiscal) {
        const cnaeRaw = String(data.cnae_fiscal);
        onChange("emp_cnae", maskCNAE(cnaeRaw));
      }
      if (data.cnae_fiscal_descricao) onChange("emp_cnae_desc", data.cnae_fiscal_descricao);

      // Endereço
      const logradouro = [data.descricao_tipo_de_logradouro, data.logradouro].filter(Boolean).join(" ");
      const numero = data.numero || "S/N";
      const compl = data.complemento ? ` - ${data.complemento}` : "";
      if (logradouro) onChange("emp_endereco", `${titleCase(logradouro)}, nº ${numero}${compl}`);
      if (data.bairro) onChange("emp_bairro", titleCase(data.bairro));
      if (data.municipio) onChange("emp_cidade", titleCase(data.municipio));
      if (data.uf) onChange("emp_uf", data.uf.toUpperCase());
      if (data.cep) onChange("emp_cep", maskCEP(String(data.cep)));

      // Contatos
      if (data.ddd_telefone_1) {
        onChange("emp_telefone", maskPhone(data.ddd_telefone_1));
      }
      if (data.email) onChange("emp_email", data.email.toLowerCase());
      if (data.data_inicio_atividade) onChange("emp_fundacao", data.data_inicio_atividade);

      // QSA / Responsável
      if (data.qsa && Array.isArray(data.qsa) && data.qsa.length > 0) {
        const socio = data.qsa[0];
        if (socio.nome_socio) {
          onChange("emp_responsavel", titleCase(socio.nome_socio));
        }
        if (socio.qualificacao_socio) {
          onChange("emp_cargo_resp", socio.qualificacao_socio);
        }
      }

      onAlert("success", "Dados da empresa carregados com sucesso!");
    } catch (err: any) {
      onAlert("error", err?.message || "Erro ao consultar CNPJ. Preencha manualmente.");
    } finally {
      setLoadingCNPJ(false);
    }
  };

  const handleCapturarGPS = () => {
    if (!navigator.geolocation) {
      onAlert("error", "Geolocalização não suportada pelo navegador.");
      return;
    }

    setLoadingGPS(true);
    onAlert("info", "Obtendo coordenadas do sensor GPS do dispositivo...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        const accuracy = Math.round(pos.coords.accuracy);
        const coordsStr = `${lat}, ${lon}`;

        onChange("emp_localizacao", coordsStr);
        setGpsStatus(`Coordenadas obtidas com precisão de ~${accuracy}m`);
        setLoadingGPS(false);
        onAlert("success", `GPS capturado com sucesso: ${coordsStr}`);
      },
      (err) => {
        setLoadingGPS(false);
        let msg = "Não foi possível obter a localização.";
        if (err.code === 1) msg = "Permissão de localização negada pelo usuário.";
        else if (err.code === 2) msg = "Sinal de GPS indisponível no momento.";
        else if (err.code === 3) msg = "Tempo esgotado para obter sinal GPS.";
        setGpsStatus(msg);
        onAlert("error", msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleBuscarCoordenadasPorEndereco = async () => {
    const endereco = empresa.emp_endereco || "";
    const cidade = empresa.emp_cidade || "";
    const uf = empresa.emp_uf || "";
    const cep = (empresa.emp_cep || "").replace(/\D/g, "");

    const queryParts = [endereco, cidade, uf, "Brasil"].filter(Boolean);
    if (queryParts.length < 2 && !cep) {
      onAlert("info", "Preencha ao menos o Endereço, Cidade/UF ou CEP da empresa para buscar as coordenadas.");
      return;
    }

    try {
      setLoadingGeocode(true);
      onAlert("info", "Buscando coordenadas geográficas pelo endereço oficial da empresa...");

      let lat = "";
      let lon = "";

      // 1. Tentar busca por endereço completo no OpenStreetMap
      const queryStr = queryParts.join(", ");
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr)}&countrycodes=br&limit=1`,
          {
            headers: {
              "Accept-Language": "pt-BR",
            },
          }
        );
        if (resp.ok) {
          const results = await resp.json();
          if (results && results.length > 0) {
            lat = parseFloat(results[0].lat).toFixed(6);
            lon = parseFloat(results[0].lon).toFixed(6);
          }
        }
      } catch (e) {
        console.warn("Geocoding OSM falhou:", e);
      }

      // 2. Fallback por Cidade e Estado se não achou
      if (!lat && cidade && uf) {
        try {
          const resp2 = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&city=${encodeURIComponent(cidade)}&state=${encodeURIComponent(uf)}&country=Brasil&limit=1`
          );
          if (resp2.ok) {
            const results2 = await resp2.json();
            if (results2 && results2.length > 0) {
              lat = parseFloat(results2[0].lat).toFixed(6);
              lon = parseFloat(results2[0].lon).toFixed(6);
            }
          }
        } catch (e) {
          console.warn("Geocoding cidade falhou:", e);
        }
      }

      if (lat && lon) {
        const coordsStr = `${lat}, ${lon}`;
        onChange("emp_localizacao", coordsStr);
        setGpsStatus(`Coordenadas obtidas pelo endereço (${lat}, ${lon})`);
        onAlert("success", `Coordenadas do endereço localizadas com sucesso: ${coordsStr}!`);
      } else {
        throw new Error("Endereço não localizado no mapa. Verifique a grafia ou capture via botão GPS.");
      }
    } catch (err: any) {
      onAlert("error", err?.message || "Erro ao localizar coordenadas do endereço.");
    } finally {
      setLoadingGeocode(false);
    }
  };

  // Funções de Consultoria Padrão
  const handleSalvarConsultoriaPadrao = () => {
    const dados = {
      emp_consultoria_razao: empresa.emp_consultoria_razao || empresa.emp_consultoria || "",
      emp_consultoria_cnpj: empresa.emp_consultoria_cnpj || "",
      emp_consultoria_tecnico: empresa.emp_consultoria_tecnico || empresa.emp_tecnico || "",
      emp_consultoria_registro: empresa.emp_consultoria_registro || "",
      emp_consultoria_cargo: empresa.emp_consultoria_cargo || "",
      emp_consultoria_telefone: empresa.emp_consultoria_telefone || "",
      emp_consultoria_email: empresa.emp_consultoria_email || "",
      emp_consultoria_logo: empresa.emp_consultoria_logo || "",
    };
    try {
      localStorage.setItem(CONSULTORIA_PADRAO_KEY, JSON.stringify(dados));
      onAlert("success", "Dados da sua Consultoria em SST salvos como modelo padrão para todas as vistorias!");
    } catch {
      onAlert("error", "Erro ao salvar consultoria no armazenamento local.");
    }
  };

  const handleCarregarConsultoriaPadrao = () => {
    try {
      const raw = localStorage.getItem(CONSULTORIA_PADRAO_KEY);
      if (!raw) {
        onAlert("info", "Nenhuma consultoria padrão salva ainda. Preencha os campos abaixo e clique em Salvar como Padrão.");
        return;
      }
      const dados = JSON.parse(raw);
      if (dados.emp_consultoria_razao) {
        onChange("emp_consultoria_razao", dados.emp_consultoria_razao);
        onChange("emp_consultoria", dados.emp_consultoria_razao);
      }
      if (dados.emp_consultoria_cnpj) onChange("emp_consultoria_cnpj", dados.emp_consultoria_cnpj);
      if (dados.emp_consultoria_tecnico) {
        onChange("emp_consultoria_tecnico", dados.emp_consultoria_tecnico);
        onChange("emp_tecnico", dados.emp_consultoria_tecnico);
      }
      if (dados.emp_consultoria_registro) onChange("emp_consultoria_registro", dados.emp_consultoria_registro);
      if (dados.emp_consultoria_cargo) onChange("emp_consultoria_cargo", dados.emp_consultoria_cargo);
      if (dados.emp_consultoria_telefone) onChange("emp_consultoria_telefone", dados.emp_consultoria_telefone);
      if (dados.emp_consultoria_email) onChange("emp_consultoria_email", dados.emp_consultoria_email);
      if (dados.emp_consultoria_logo) onChange("emp_consultoria_logo", dados.emp_consultoria_logo);
      onAlert("success", "Dados da sua Consultoria em SST carregados com sucesso!");
    } catch {
      onAlert("error", "Erro ao carregar consultoria padrão.");
    }
  };

  // Salvar Assinaturas na Tela
  const handleSaveSignature = (dataUrl: string, nome: string, docOrCargo: string) => {
    const agora = new Date().toLocaleString("pt-BR");
    if (modalAssinatura === "representante") {
      onChange("emp_ass_rep_img", dataUrl);
      onChange("emp_ass_rep_nome", nome);
      onChange("emp_ass_rep_cargo_cpf", docOrCargo);
      onChange("emp_ass_rep_data", agora);
      onAlert("success", `Assinatura de "${nome}" (Representante da Empresa) gravada com sucesso!`);
    } else if (modalAssinatura === "tecnico") {
      onChange("emp_ass_tec_img", dataUrl);
      onChange("emp_ass_tec_nome", nome);
      onChange("emp_ass_tec_registro", docOrCargo);
      onChange("emp_ass_tec_data", agora);
      onAlert("success", `Assinatura de "${nome}" (Vistoriador / Técnico SST) gravada com sucesso!`);
    }
    setModalAssinatura(null);
  };

  const coords = (empresa.emp_localizacao || "").split(",").map((s) => s.trim());
  const hasValidCoords = coords.length === 2 && !isNaN(Number(coords[0])) && !isNaN(Number(coords[1]));

  return (
    <div className="space-y-5 pb-24">
      {/* 1. DADOS DA EMPRESA */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-xs font-bold text-white shadow-xs">
              1
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Dados da Empresa
              </h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Informações cadastrais e endereço da empresa cliente em vistoria
              </p>
            </div>
          </div>
          {onDuplicateCompany && (
            <button
              type="button"
              onClick={onDuplicateCompany}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 active:scale-95 transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
              title="Duplicar todos os setores, funções, riscos, produtos e dados desta empresa"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Duplicar Empresa (Clonar Dados)</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* LOGOTIPO DA EMPRESA */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {empresa.emp_logo ? (
                  <div className="h-16 w-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 flex items-center justify-center overflow-hidden shadow-2xs">
                    <img
                      src={empresa.emp_logo}
                      alt="Logotipo da Empresa"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-28 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="h-5 w-5 mb-0.5" />
                    <span className="text-[10px] font-medium">Sem Logotipo</span>
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>Logotipo Oficial da Empresa (Cliente)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Aparecerá automaticamente no cabeçalho de todos os relatórios e atas em PDF
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputEmpresaRef}
                  onChange={(e) => handleUploadLogo(e, "emp_logo", "Empresa")}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputEmpresaRef.current?.click()}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-all cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{empresa.emp_logo ? "Alterar Logotipo" : "Carregar Logotipo"}</span>
                </button>
                {empresa.emp_logo && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("emp_logo", "");
                      onAlert("info", "Logotipo da empresa removido.");
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all cursor-pointer"
                    title="Remover logotipo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* CNPJ + Botão de Busca */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              CNPJ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={empresa.emp_cnpj || ""}
                  onChange={(e) => onChange("emp_cnpj", maskCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleBuscarCNPJ}
                disabled={loadingCNPJ}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loadingCNPJ ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>{loadingCNPJ ? "Consultando Receita..." : "Buscar Dados do CNPJ"}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              * Digite o CNPJ para preencher automaticamente razão social, CNAE, endereço e contatos oficiais.
            </p>
          </div>

          {/* Razão Social & Nome Fantasia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Razão Social <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={empresa.emp_razao || ""}
                onChange={(e) => onChange("emp_razao", e.target.value)}
                placeholder="Ex: Indústria e Comércio Brasil Ltda"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={empresa.emp_fantasia || ""}
                onChange={(e) => onChange("emp_fantasia", e.target.value)}
                placeholder="Ex: Grupo Brasil"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Inscrição Estadual, Municipal e Fundação */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Inscrição Estadual (IE)
              </label>
              <input
                type="text"
                value={empresa.emp_ie || ""}
                onChange={(e) => onChange("emp_ie", e.target.value)}
                placeholder="Ex: 123.456.789.000 ou ISENTO"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Inscrição Municipal (IM)
              </label>
              <input
                type="text"
                value={empresa.emp_im || ""}
                onChange={(e) => onChange("emp_im", e.target.value)}
                placeholder="Ex: 987654321"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Data de Fundação / Início
              </label>
              <input
                type="date"
                value={empresa.emp_fundacao || ""}
                onChange={(e) => onChange("emp_fundacao", e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Endereço Completo */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Endereço Completo (Rua / Logradouro / Número / Complemento)
            </label>
            <input
              type="text"
              value={empresa.emp_endereco || ""}
              onChange={(e) => onChange("emp_endereco", e.target.value)}
              placeholder="Ex: Av. das Indústrias, nº 1500, Bloco B"
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Bairro, Cidade, UF, CEP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Bairro
              </label>
              <input
                type="text"
                value={empresa.emp_bairro || ""}
                onChange={(e) => onChange("emp_bairro", e.target.value)}
                placeholder="Ex: Distrito Industrial"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Cidade / Município
              </label>
              <input
                type="text"
                value={empresa.emp_cidade || ""}
                onChange={(e) => onChange("emp_cidade", e.target.value)}
                placeholder="Ex: São Paulo"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                UF (Estado)
              </label>
              <input
                type="text"
                value={empresa.emp_uf || ""}
                onChange={(e) => onChange("emp_uf", e.target.value.toUpperCase().slice(0, 2))}
                placeholder="SP"
                maxLength={2}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                CEP
              </label>
              <input
                type="text"
                value={empresa.emp_cep || ""}
                onChange={(e) => onChange("emp_cep", maskCEP(e.target.value))}
                placeholder="00000-000"
                maxLength={9}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Telefone & E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Telefone de Contato
              </label>
              <input
                type="text"
                value={empresa.emp_telefone || ""}
                onChange={(e) => onChange("emp_telefone", maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                E-mail Institucional
              </label>
              <input
                type="email"
                value={empresa.emp_email || ""}
                onChange={(e) => onChange("emp_email", e.target.value)}
                placeholder="contato@empresa.com.br"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* CNAE e Grau de Risco (NR-04) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Código CNAE Principal
              </label>
              <input
                type="text"
                value={empresa.emp_cnae || ""}
                onChange={(e) => onChange("emp_cnae", maskCNAE(e.target.value))}
                placeholder="Ex: 25.11-0-00"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Descrição da Atividade Econômica (CNAE)
              </label>
              <input
                type="text"
                value={empresa.emp_cnae_desc || ""}
                onChange={(e) => onChange("emp_cnae_desc", e.target.value)}
                placeholder="Ex: Fabricação de estruturas metálicas"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Grau de Risco e Total Funcionários */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Grau de Risco (NR-04)
              </label>
              <select
                value={empresa.emp_grau_risco || "2"}
                onChange={(e) => onChange("emp_grau_risco", e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="1">Grau de Risco 1 (Baixo / Escritório)</option>
                <option value="2">Grau de Risco 2 (Médio / Comércio)</option>
                <option value="3">Grau de Risco 3 (Alto / Indústria)</option>
                <option value="4">Grau de Risco 4 (Máximo / Construção / Mineração)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Total de Funcionários
              </label>
              <input
                type="text"
                value={empresa.emp_total_func || ""}
                onChange={(e) => onChange("emp_total_func", maskInteger(e.target.value, 6))}
                placeholder="Ex: 45"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Data da Vistoria Técnica
              </label>
              <input
                type="date"
                value={empresa.emp_vistoria || ""}
                onChange={(e) => onChange("emp_vistoria", e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Responsável da Empresa que acompanhou */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Representante da Empresa (Acompanhante)
              </label>
              <input
                type="text"
                value={empresa.emp_responsavel || ""}
                onChange={(e) => onChange("emp_responsavel", e.target.value)}
                placeholder="Ex: Carlos Eduardo de Oliveira"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Cargo do Representante
              </label>
              <input
                type="text"
                value={empresa.emp_cargo_resp || ""}
                onChange={(e) => onChange("emp_cargo_resp", e.target.value)}
                placeholder="Ex: Gerente Operacional / RH"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                CPF do Representante
              </label>
              <input
                type="text"
                value={empresa.emp_cpf_resp || ""}
                onChange={(e) => onChange("emp_cpf_resp", maskCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Seção do GPS aprimorada */}
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Geolocalização / GPS da Vistoria Técnica
              </label>
              {hasValidCoords && (
                <a
                  href={`https://www.google.com/maps?q=${coords[0]},${coords[1]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Abrir no Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            <div className="space-y-2.5">
              <input
                type="text"
                value={empresa.emp_localizacao || ""}
                onChange={(e) => onChange("emp_localizacao", e.target.value)}
                placeholder="Latitude, Longitude (ex: -23.550520, -46.633308)"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                {/* Botão 1: GPS do Aparelho / Satélite */}
                <button
                  type="button"
                  onClick={handleCapturarGPS}
                  disabled={loadingGPS || loadingGeocode}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                  title="Captura coordenadas pelo GPS do celular/computador"
                >
                  {loadingGPS ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  <span>{loadingGPS ? "Obtendo GPS..." : "Capturar GPS do Aparelho"}</span>
                </button>

                {/* Botão 2: Localizar pelo Endereço */}
                <button
                  type="button"
                  onClick={handleBuscarCoordenadasPorEndereco}
                  disabled={loadingGPS || loadingGeocode}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 px-4 text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/40 active:scale-95 disabled:opacity-50 transition-all shadow-2xs cursor-pointer"
                  title="Busca as coordenadas através do endereço preenchido da empresa"
                >
                  {loadingGeocode ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  ) : (
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                  <span>{loadingGeocode ? "Buscando Endereço..." : "Geolocalizar pelo Endereço"}</span>
                </button>
              </div>

              {empresa.emp_localizacao && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("emp_localizacao", "");
                    setGpsStatus(null);
                    onAlert("info", "Coordenadas GPS removidas.");
                  }}
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3 text-xs font-semibold text-slate-500 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer"
                  title="Limpar Coordenadas"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Limpar Coordenadas GPS</span>
                </button>
              )}
            </div>

            {gpsStatus ? (
              <p className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                {gpsStatus}
              </p>
            ) : (
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                * Clique em <strong>"Capturar GPS do Aparelho"</strong> ou <strong>"Geolocalizar pelo Endereço"</strong> para vincular a empresa no mapa do Laudo Técnico.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Observações Gerais da Empresa / Estabelecimento
            </label>
            <textarea
              rows={3}
              value={empresa.emp_obs || ""}
              onChange={(e) => onChange("emp_obs", e.target.value)}
              placeholder="Informações adicionais relevantes sobre acesso, rotinas, histórico de acidentes..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* 2. DADOS DA EMPRESA DE CONSULTORIA EM SST & RESPONSÁVEL TÉCNICO */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs border border-blue-200 dark:border-blue-900/60 transition-colors">
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Empresa de Consultoria em SST & Responsável Técnico
              </h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Configuração dos dados da sua assessoria de segurança e credenciais do vistoriador
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
            <button
              type="button"
              onClick={handleCarregarConsultoriaPadrao}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-slate-500" />
              <span>Carregar Modelo Padrão</span>
            </button>
            <button
              type="button"
              onClick={handleSalvarConsultoriaPadrao}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Salvar Dados como Padrão</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* LOGOTIPO DA CONSULTORIA SST */}
          <div className="rounded-2xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30 p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {empresa.emp_consultoria_logo ? (
                  <div className="h-16 w-28 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 p-1.5 flex items-center justify-center overflow-hidden shadow-2xs">
                    <img
                      src={empresa.emp_consultoria_logo}
                      alt="Logotipo da Consultoria"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-28 rounded-xl border border-dashed border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-blue-400">
                    <ImageIcon className="h-5 w-5 mb-0.5" />
                    <span className="text-[10px] font-medium">Sem Logo Consultoria</span>
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>Logotipo da sua Consultoria / Assessoria SST</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Marca da sua empresa técnica para o cabeçalho dos laudos e documentos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputConsultoriaRef}
                  onChange={(e) => handleUploadLogo(e, "emp_consultoria_logo", "Consultoria SST")}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputConsultoriaRef.current?.click()}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-600 border border-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{empresa.emp_consultoria_logo ? "Alterar Logo" : "Carregar Logo"}</span>
                </button>
                {empresa.emp_consultoria_logo && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("emp_consultoria_logo", "");
                      onAlert("info", "Logotipo da consultoria removido.");
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all cursor-pointer"
                    title="Remover logotipo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nome da Consultoria e CNPJ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Razão Social / Nome da Consultoria SST
              </label>
              <input
                type="text"
                value={empresa.emp_consultoria_razao || empresa.emp_consultoria || ""}
                onChange={(e) => {
                  onChange("emp_consultoria_razao", e.target.value);
                  onChange("emp_consultoria", e.target.value);
                }}
                placeholder="Ex: SafeTech Consultoria e Engenharia de Segurança do Trabalho"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                CNPJ da Consultoria
              </label>
              <input
                type="text"
                value={empresa.emp_consultoria_cnpj || ""}
                onChange={(e) => onChange("emp_consultoria_cnpj", maskCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Responsável Técnico, Registro e Cargo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Responsável Técnico / Vistoriador
              </label>
              <input
                type="text"
                value={empresa.emp_consultoria_tecnico || empresa.emp_tecnico || ""}
                onChange={(e) => {
                  onChange("emp_consultoria_tecnico", e.target.value);
                  onChange("emp_tecnico", e.target.value);
                }}
                placeholder="Ex: Eng. João da Silva / TST Maria Santos"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Registro Profissional (CREA / CRM / MTE)
              </label>
              <input
                type="text"
                value={empresa.emp_consultoria_registro || ""}
                onChange={(e) => onChange("emp_consultoria_registro", e.target.value)}
                placeholder="Ex: CREA-SP 5060708090 / MTE 001234/SP"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Especialidade / Cargo
              </label>
              <input
                type="text"
                value={empresa.emp_consultoria_cargo || ""}
                onChange={(e) => onChange("emp_consultoria_cargo", e.target.value)}
                placeholder="Ex: Engenheiro de Segurança do Trabalho"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Telefone e E-mail da Consultoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Telefone / WhatsApp da Consultoria
              </label>
              <input
                type="text"
                value={empresa.emp_consultoria_telefone || ""}
                onChange={(e) => onChange("emp_consultoria_telefone", maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                E-mail de Contato da Consultoria
              </label>
              <input
                type="email"
                value={empresa.emp_consultoria_email || ""}
                onChange={(e) => onChange("emp_consultoria_email", e.target.value)}
                placeholder="contato@consultoriasst.com.br"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. ASSINATURA NA TELA (REPRESENTANTE DA EMPRESA & VISTORIADOR) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs border border-emerald-200 dark:border-emerald-900/60 transition-colors">
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs">
            <PenTool className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Termo de Encerramento e Assinatura na Tela (Vistoria Técnica)
            </h2>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Coleta da assinatura digital do representante da empresa e do técnico diretamente no celular/tablet
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card Assinatura do Representante da Empresa */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Representante da Empresa Auditada</span>
                </h3>
                {empresa.emp_ass_rep_img ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                    <Check className="h-3 w-3" /> Assinado
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    Pendente
                  </span>
                )}
              </div>

              {empresa.emp_ass_rep_img ? (
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 flex items-center justify-center h-24 overflow-hidden">
                    <img
                      src={empresa.emp_ass_rep_img}
                      alt="Assinatura Representante"
                      className="max-h-20 max-w-full object-contain filter dark:invert"
                    />
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    <p>
                      <strong>Signatário:</strong> {empresa.emp_ass_rep_nome || empresa.emp_responsavel || "Representante"}
                    </p>
                    <p>
                      <strong>Cargo/Doc:</strong> {empresa.emp_ass_rep_cargo_cpf || empresa.emp_cargo_resp || "Não informado"}
                    </p>
                    {empresa.emp_ass_rep_data && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{empresa.emp_ass_rep_data}</span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center bg-white dark:bg-slate-900">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nenhuma assinatura coletada</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    O responsável pela empresa pode assinar na tela agora com o dedo.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setModalAssinatura("representante")}
                className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
              >
                <PenTool className="h-4 w-4" />
                <span>{empresa.emp_ass_rep_img ? "Refazer Assinatura" : "Assinar na Tela"}</span>
              </button>
              {empresa.emp_ass_rep_img && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("emp_ass_rep_img", "");
                    onChange("emp_ass_rep_data", "");
                    onAlert("info", "Assinatura do representante removida.");
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all flex-shrink-0 active:scale-95"
                  title="Remover Assinatura"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Card Assinatura do Vistoriador / Técnico de Segurança */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Vistoriador / Responsável Técnico</span>
                </h3>
                {empresa.emp_ass_tec_img ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    <Check className="h-3 w-3" /> Assinado
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">
                    Opcional
                  </span>
                )}
              </div>

              {empresa.emp_ass_tec_img ? (
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 flex items-center justify-center h-24 overflow-hidden">
                    <img
                      src={empresa.emp_ass_tec_img}
                      alt="Assinatura Técnico"
                      className="max-h-20 max-w-full object-contain filter dark:invert"
                    />
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    <p>
                      <strong>Vistoriador:</strong> {empresa.emp_ass_tec_nome || empresa.emp_consultoria_tecnico || empresa.emp_tecnico || "Técnico"}
                    </p>
                    <p>
                      <strong>Registro:</strong> {empresa.emp_ass_tec_registro || empresa.emp_consultoria_registro || "CREA/MTE"}
                    </p>
                    {empresa.emp_ass_tec_data && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{empresa.emp_ass_tec_data}</span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center bg-white dark:bg-slate-900">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assinatura do Técnico</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Assine para validar o laudo técnico com rubrica digital no encerramento.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setModalAssinatura("tecnico")}
                className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
              >
                <PenTool className="h-4 w-4" />
                <span>{empresa.emp_ass_tec_img ? "Refazer Assinatura" : "Assinar na Tela"}</span>
              </button>
              {empresa.emp_ass_tec_img && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("emp_ass_tec_img", "");
                    onChange("emp_ass_tec_data", "");
                    onAlert("info", "Assinatura do técnico removida.");
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all flex-shrink-0 active:scale-95"
                  title="Remover Assinatura"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Assinatura na Tela */}
      <SignatureModal
        isOpen={modalAssinatura !== null}
        onClose={() => setModalAssinatura(null)}
        onSaveSignature={handleSaveSignature}
        isTecnico={modalAssinatura === "tecnico"}
        title={
          modalAssinatura === "tecnico"
            ? "Assinatura do Vistoriador / Responsável Técnico"
            : "Assinatura do Representante da Empresa Auditada"
        }
        subtitle={
          modalAssinatura === "tecnico"
            ? "Assine na tela para atestar as observações e laudo técnico de vistoria"
            : "Assine na tela para atestar o acompanhamento da vistoria técnica no local"
        }
        defaultNome={
          modalAssinatura === "tecnico"
            ? empresa.emp_ass_tec_nome || empresa.emp_consultoria_tecnico || empresa.emp_tecnico || ""
            : empresa.emp_ass_rep_nome || empresa.emp_responsavel || ""
        }
        defaultDocOrCargo={
          modalAssinatura === "tecnico"
            ? empresa.emp_ass_tec_registro || empresa.emp_consultoria_registro || ""
            : empresa.emp_ass_rep_cargo_cpf || (empresa.emp_cargo_resp ? `${empresa.emp_cargo_resp} / CPF ${empresa.emp_cpf_resp || ""}` : "")
        }
        docOrCargoLabel={
          modalAssinatura === "tecnico" ? "Registro Profissional (CREA / CRM / MTE)" : "Cargo e CPF do Representante"
        }
        docOrCargoPlaceholder={
          modalAssinatura === "tecnico" ? "Ex: CREA-SP 5060708090" : "Ex: Gerente Operacional / CPF 000.000.000-00"
        }
      />
    </div>
  );
};
