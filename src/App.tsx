import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { EmpresaTab } from "./components/EmpresaTab";
import { SetoresTab } from "./components/SetoresTab";
import { FuncoesTab } from "./components/FuncoesTab";
import { FuncionariosTab } from "./components/FuncionariosTab";
import { PcmsoTab } from "./components/PcmsoTab";
import { ESocialTab } from "./components/ESocialTab";
import { RiscosTab } from "./components/RiscosTab";
import { PlanoAcaoTab } from "./components/PlanoAcaoTab";
import { Nr17Tab } from "./components/Nr17Tab";
import { Nr16Tab } from "./components/Nr16Tab";
import { DdsTab } from "./components/DdsTab";
import { PtTab } from "./components/PtTab";
import { Srq20WorkerView } from "./components/Srq20WorkerView";
import { RelatorioTab } from "./components/RelatorioTab";
import { GoogleDrivePromptModal } from "./components/GoogleDrivePromptModal";
import { DocumentHubModal } from "./components/DocumentHubModal";
import { AuthModal } from "./components/AuthModal";
import { CloudSyncModal } from "./components/CloudSyncModal";
import { DuplicateCompanyModal, DuplicateCompanyOptions } from "./components/DuplicateCompanyModal";
import { useAuth } from "./contexts/AuthContext";
import { firestoreSyncService, getDeletedCompanyIds, markCompanyAsDeleted } from "./services/firestoreSync";
import { Company, EmpresaData, SetorData, FuncaoData, FuncionarioData, TabType, ProdutoQuimicoItem, VinculoProdutoFuncao, AvaliacaoRiscoItem, MatrixDimension, AepItem, Nr16AvaliacaoItem, PlanoAcaoItem } from "./types";
import { localDB } from "./services/localDB";
import { googleDriveBackup } from "./services/googleDriveBackup";
import { CATALOGO_PRODUTOS_QUIMICOS } from "./data/chemicalsCatalog";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const STORAGE_KEY = "sst_coleta_empresas_v2";
const CURRENT_ID_KEY = "sst_coleta_current_id_v2";
const PROMPTED_DRIVE_KEY = "sst_prompted_drive_v1";

const generateId = () => Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);

const createEmptyCompany = (name?: string): Company => {
  const id = String(Date.now());
  return {
    id,
    empresa: {
      emp_razao: name || "Nova Empresa",
      emp_vistoria: new Date().toISOString().slice(0, 10),
      emp_grau_risco: "2",
      emp_uf: "SP",
    },
    setores: [],
    funcoes: [],
    riscos: {},
    produtosQuimicos: [],
    produtosPorFuncao: {},
    updatedAt: new Date().toISOString(),
  };
};

export default function App() {
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const deletedIds = getDeletedCompanyIds();
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((c) => !deletedIds.has(String(c.id)));
          if (filtered.length > 0) return filtered;
        }
      }
    } catch {}
    return [createEmptyCompany("Minha Empresa")];
  });

  const [currentCompanyId, setCurrentCompanyId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_ID_KEY);
      if (saved) return saved;
    } catch {}
    return "";
  });

  const [activeTab, setActiveTab] = useState<TabType>("empresa");
  const [nr17SubTab, setNr17SubTab] = useState<"aep" | "srq20">("aep");
  const [showAutoDrivePrompt, setShowAutoDrivePrompt] = useState(false);

  // Redirecionamento de compatibilidade: se activeTab for srq20, direciona para NR-17 com sub-aba srq20
  useEffect(() => {
    if (activeTab === "srq20") {
      setActiveTab("aep");
      setNr17SubTab("srq20");
    }
  }, [activeTab]);
  const [isDocumentHubOpen, setIsDocumentHubOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [selectedWorkerForAso, setSelectedWorkerForAso] = useState<FuncionarioData | null>(null);

  const { user, signInWithEmail } = useAuth();

  const [alertInfo, setAlertInfo] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showAlert = useCallback((type: "success" | "error" | "info", message: string) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  // Auto-login instantâneo via Link Mágico (WhatsApp) ou QR Code
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const autoEmail = params.get("autoEmail");
    const autoPass = params.get("autoPass");

    if (autoEmail && autoPass) {
      const cleanPass = decodeURIComponent(autoPass);
      signInWithEmail(autoEmail, cleanPass)
        .then(() => {
          showAlert("success", "Celular conectado e sincronizado à Nuvem instantaneamente!");
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        })
        .catch((err) => {
          console.warn("Auto-login falhou:", err);
        });
    }
  }, [signInWithEmail, showAlert]);

  // Modo Trabalhador: Verifica se o link é para preenchimento de saúde mental SRQ-20
  const [workerMode] = useState<{
    active: boolean;
    companyId: string;
    setor: string;
  }>(() => {
    if (typeof window === "undefined") return { active: false, companyId: "", setor: "" };
    const p = new URLSearchParams(window.location.search);
    const isSrq = p.get("srq20") === "1" || p.get("srq20") === "true";
    const cid = p.get("cid") || "";
    const setor = p.get("setor") || "";
    return { active: isSrq && !!cid, companyId: cid, setor };
  });

  // Dark Mode Theme State with Persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sst_theme");
      if (saved) return saved === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sst_theme", darkMode ? "dark" : "light");
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      console.warn("Theme storage error:", e);
    }
  }, [darkMode]);

  // Guarantee current company exists
  const activeCompany =
    companies.find((c) => c.id === currentCompanyId) || companies[0] || createEmptyCompany();

  useEffect(() => {
    if (!companies.find((c) => c.id === currentCompanyId) && companies.length > 0) {
      setCurrentCompanyId(companies[0].id);
    }
  }, [companies, currentCompanyId]);

  // Real-time Cloud Sync with Firestore
  useEffect(() => {
    if (!user?.uid) {
      firestoreSyncService.stopRealtimeSync();
      return;
    }

    const unsub = firestoreSyncService.startRealtimeSync(user.uid, (remoteCompanies) => {
      const deletedIds = getDeletedCompanyIds();
      const validRemote = (remoteCompanies || []).filter((c) => !deletedIds.has(String(c.id)));

      if (validRemote.length > 0) {
        setCompanies((currentLocal) => {
          const remoteIds = new Set(validRemote.map((c) => String(c.id)));
          const unSyncedLocal = currentLocal.filter(
            (c) => !remoteIds.has(String(c.id)) && !deletedIds.has(String(c.id))
          );

          if (unSyncedLocal.length > 0) {
            firestoreSyncService.migrateLocalToCloud(unSyncedLocal, user.uid).catch(console.warn);
            return [...validRemote, ...unSyncedLocal];
          }
          return validRemote;
        });
      } else {
        // Upload current local companies to cloud if cloud is newly initialized
        setCompanies((currentLocal) => {
          const validLocal = currentLocal.filter((c) => !deletedIds.has(String(c.id)));
          if (validLocal.length > 0) {
            firestoreSyncService.migrateLocalToCloud(validLocal, user.uid).catch(console.warn);
          }
          return validLocal.length > 0 ? validLocal : currentLocal;
        });
      }
    });

    return () => unsub();
  }, [user?.uid]);

  // Initial Load from Local IndexedDB / SQLite store
  useEffect(() => {
    localDB.getAllCompanies().then((stored) => {
      if (stored && stored.length > 0) {
        const deletedIds = getDeletedCompanyIds();
        const validStored = stored.filter((c) => !deletedIds.has(String(c.id)));
        if (validStored.length > 0) {
          setCompanies(validStored);
        }
      }
    });

    // Check if user has already seen Google Drive connection prompt
    const hasPrompted = localStorage.getItem(PROMPTED_DRIVE_KEY);
    const driveState = googleDriveBackup.getState();
    if (!hasPrompted && !driveState.isConnected) {
      const timer = setTimeout(() => {
        setShowAutoDrivePrompt(true);
        localStorage.setItem(PROMPTED_DRIVE_KEY, "true");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Persist locally in IndexedDB/SQLite local store and trigger Auto-Backup to Drive
  useEffect(() => {
    try {
      const deletedIds = getDeletedCompanyIds();
      const cleanCompanies = companies.filter((c) => !deletedIds.has(String(c.id)));
      if (cleanCompanies.length === 0) return;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanCompanies));
      if (activeCompany && !deletedIds.has(String(activeCompany.id))) {
        localStorage.setItem(CURRENT_ID_KEY, activeCompany.id);
      }
      localDB.saveAllCompanies(cleanCompanies);
      // Continuous debounced auto-backup to Google Drive
      googleDriveBackup.triggerAutoBackup(cleanCompanies);
      // Continuous debounced auto-save to Firestore if authenticated
      if (user?.uid && activeCompany && activeCompany.id && !deletedIds.has(String(activeCompany.id))) {
        firestoreSyncService.saveVistoria(activeCompany, user.uid).catch(console.warn);
      }
    } catch (e) {
      console.warn("Local storage error:", e);
    }
  }, [companies, activeCompany, user?.uid]);

  // Update specific company in state and trigger local + Drive + Cloud storage
  const updateActiveCompany = useCallback(
    (updater: (c: Company) => Company) => {
      setCompanies((prev) => {
        let updatedItem: Company | null = null;
        const next = prev.map((c) => {
          if (c.id === activeCompany.id) {
            const updated = updater(c);
            updated.updatedAt = new Date().toISOString();
            updatedItem = updated;
            return updated;
          }
          return c;
        });

        if (updatedItem) {
          localDB.saveCompany(updatedItem);
          if (user?.uid) {
            firestoreSyncService.saveVistoria(updatedItem, user.uid).catch(console.warn);
          }
        }
        return next;
      });
    },
    [activeCompany.id, user?.uid]
  );

  // Empresa handlers
  const handleEmpresaFieldChange = (field: keyof EmpresaData, value: string) => {
    updateActiveCompany((c) => ({
      ...c,
      empresa: {
        ...c.empresa,
        [field]: value,
      },
    }));
  };

  // Setores handlers
  const handleSaveSetor = (setor: SetorData) => {
    updateActiveCompany((c) => {
      const idx = c.setores.findIndex((s) => s.id === setor.id);
      let updatedSetores = [...c.setores];
      if (idx >= 0) {
        updatedSetores[idx] = setor;
      } else {
        updatedSetores.push(setor);
      }
      return { ...c, setores: updatedSetores };
    });
  };

  const handleDeleteSetor = (id: string) => {
    updateActiveCompany((c) => ({
      ...c,
      setores: c.setores.filter((s) => s.id !== id),
    }));
  };

  // Funcoes handlers
  const handleSaveFuncao = (funcao: FuncaoData) => {
    updateActiveCompany((c) => {
      const idx = c.funcoes.findIndex((f) => f.id === funcao.id);
      let updatedFuncoes = [...c.funcoes];
      if (idx >= 0) {
        updatedFuncoes[idx] = funcao;
      } else {
        updatedFuncoes.push(funcao);
      }
      return { ...c, funcoes: updatedFuncoes };
    });
  };

  const handleDeleteFuncao = (id: string) => {
    updateActiveCompany((c) => ({
      ...c,
      funcoes: c.funcoes.filter((f) => f.id !== id),
    }));
  };

  // Riscos handlers
  const handleToggleRisco = (funcaoId: string, riscoDesc: string) => {
    updateActiveCompany((c) => {
      const currentList = c.riscos[funcaoId] || [];
      let nextList: string[];
      if (currentList.includes(riscoDesc)) {
        nextList = currentList.filter((r) => r !== riscoDesc);
      } else {
        nextList = [...currentList, riscoDesc];
      }
      return {
        ...c,
        riscos: {
          ...c.riscos,
          [funcaoId]: nextList,
        },
      };
    });
  };

  const handleSaveAvaliacaoRisco = (funcaoId: string, avaliacao: AvaliacaoRiscoItem) => {
    updateActiveCompany((c) => {
      const mapaGeral = { ...(c.avaliacoesRiscos || {}) };
      const mapaDaFuncao = { ...(mapaGeral[funcaoId] || {}) };
      mapaDaFuncao[avaliacao.riscoNome] = avaliacao;
      mapaGeral[funcaoId] = mapaDaFuncao;

      const currentRiscos = c.riscos[funcaoId] || [];
      const nextRiscos = currentRiscos.includes(avaliacao.riscoNome)
        ? currentRiscos
        : [...currentRiscos, avaliacao.riscoNome];

      return {
        ...c,
        riscos: {
          ...c.riscos,
          [funcaoId]: nextRiscos,
        },
        avaliacoesRiscos: mapaGeral,
      };
    });
    showAlert("success", `Risco "${avaliacao.riscoNome}" avaliado na matriz com sucesso!`);
  };

  const handleChangeTipoMatrizPadrao = (tipo: MatrixDimension) => {
    updateActiveCompany((c) => ({
      ...c,
      tipoMatrizPadrao: tipo,
    }));
    showAlert("info", `Metodologia padrão da empresa definida para Matriz ${tipo}.`);
  };

  // Chemical Products Handlers
  const handleSaveProdutoQuimico = (produto: ProdutoQuimicoItem) => {
    updateActiveCompany((c) => {
      const existing = c.produtosQuimicos || [];
      const idx = existing.findIndex((p) => p.id === produto.id);
      let nextList = [...existing];
      if (idx >= 0) {
        nextList[idx] = produto;
      } else {
        nextList.push(produto);
      }
      return {
        ...c,
        produtosQuimicos: nextList,
      };
    });
  };

  const handleDeleteProdutoQuimico = (produtoId: string) => {
    updateActiveCompany((c) => {
      const nextProds = (c.produtosQuimicos || []).filter((p) => p.id !== produtoId);
      const nextPorFuncao = { ...(c.produtosPorFuncao || {}) };
      Object.keys(nextPorFuncao).forEach((fId) => {
        nextPorFuncao[fId] = (nextPorFuncao[fId] || []).filter((v) => v.produtoId !== produtoId);
      });
      return {
        ...c,
        produtosQuimicos: nextProds,
        produtosPorFuncao: nextPorFuncao,
      };
    });
  };

  const handleImportStandardChemicals = () => {
    updateActiveCompany((c) => {
      const existing = c.produtosQuimicos || [];
      const existingNames = new Set(existing.map((p) => p.nome.toLowerCase().trim()));
      const toAdd: ProdutoQuimicoItem[] = CATALOGO_PRODUTOS_QUIMICOS
        .filter((p) => !existingNames.has(p.nome.toLowerCase().trim()))
        .map((p) => ({
          ...p,
          id: generateId(),
        }));

      if (toAdd.length === 0) {
        return c;
      }
      return {
        ...c,
        produtosQuimicos: [...existing, ...toAdd],
      };
    });
    showAlert("success", "Catálogo padrão de produtos químicos importado com sucesso!");
  };

  const handleToggleVinculoProduto = (funcaoId: string, produto: ProdutoQuimicoItem) => {
    updateActiveCompany((c) => {
      const map = { ...(c.produtosPorFuncao || {}) };
      const list = map[funcaoId] || [];
      const idx = list.findIndex((v) => v.produtoId === produto.id);

      if (idx >= 0) {
        map[funcaoId] = list.filter((v) => v.produtoId !== produto.id);
      } else {
        const newVinculo: VinculoProdutoFuncao = {
          id: generateId(),
          produtoId: produto.id,
          produtoNome: produto.nome,
          cas: produto.cas,
          tempoExposicao: "Habitual (6h a 8h/dia)",
          concentracao: "Puro (100%)",
          formaUso: "Aplicação manual",
          viaExposicao: "Inalatória e Dérmica",
          episUtilizados: produto.episRecomendados || "EPIs conforme NR-06",
        };
        map[funcaoId] = [...list, newVinculo];
      }
      return {
        ...c,
        produtosPorFuncao: map,
      };
    });
  };

  const handleUpdateVinculoProduto = (funcaoId: string, vinculo: VinculoProdutoFuncao) => {
    updateActiveCompany((c) => {
      const map = { ...(c.produtosPorFuncao || {}) };
      const list = map[funcaoId] || [];
      const idx = list.findIndex((v) => v.produtoId === vinculo.produtoId);

      if (idx >= 0) {
        list[idx] = vinculo;
      } else {
        list.push(vinculo);
      }
      map[funcaoId] = [...list];
      return {
        ...c,
        produtosPorFuncao: map,
      };
    });
  };

  // AEP (Avaliação Ergonômica Preliminar - NR-17) Handlers
  const handleSaveAep = (aep: AepItem) => {
    updateActiveCompany((c) => {
      const list = [...(c.aepAvaliacoes || [])];
      const idx = list.findIndex((a) => a.id === aep.id);
      if (idx >= 0) {
        list[idx] = aep;
      } else {
        list.push(aep);
      }
      return {
        ...c,
        aepAvaliacoes: list,
      };
    });
  };

  const handleDeleteAep = (id: string) => {
    updateActiveCompany((c) => ({
      ...c,
      aepAvaliacoes: (c.aepAvaliacoes || []).filter((a) => a.id !== id),
    }));
  };

  // NR-16 (Periculosidade) Handlers
  const handleSaveNr16 = (avaliacao: Nr16AvaliacaoItem) => {
    updateActiveCompany((c) => {
      const list = [...(c.nr16Avaliacoes || [])];
      const idx = list.findIndex((a) => a.funcaoId === avaliacao.funcaoId || a.id === avaliacao.id);
      if (idx >= 0) {
        list[idx] = avaliacao;
      } else {
        list.push(avaliacao);
      }
      return {
        ...c,
        nr16Avaliacoes: list,
      };
    });
  };

  const handleDeleteNr16 = (id: string) => {
    updateActiveCompany((c) => ({
      ...c,
      nr16Avaliacoes: (c.nr16Avaliacoes || []).filter((a) => a.id !== id),
    }));
  };

  // Company management
  const handleCreateCompany = () => {
    const newComp = createEmptyCompany(`Nova Empresa ${companies.length + 1}`);
    setCompanies((prev) => [...prev, newComp]);
    setCurrentCompanyId(newComp.id);
    setActiveTab("empresa");
    localDB.saveCompany(newComp);
    if (user?.uid) {
      firestoreSyncService.saveVistoria(newComp, user.uid).catch(console.warn);
    }
    showAlert("success", "Nova empresa cadastrada e selecionada!");
  };

  const handleDuplicateCompany = (options: DuplicateCompanyOptions) => {
    const source = companies.find((c) => String(c.id) === String(options.sourceCompanyId));
    if (!source) {
      showAlert("error", "Empresa de origem não encontrada para duplicação.");
      return;
    }

    try {
      const newCompanyId = String(Date.now()) + "_" + Math.random().toString(36).substring(2, 7);
      const setorIdMap = new Map<string, string>();
      const funcaoIdMap = new Map<string, string>();

      // 1. Clona Setores com novos IDs e preserva sub-itens
      const clonedSetores: SetorData[] = (source.setores || []).map((s) => {
        const newSetorId = generateId();
        setorIdMap.set(s.id, newSetorId);
        return {
          ...s,
          id: newSetorId,
        };
      });

      // 2. Clona Funções com novos IDs
      const clonedFuncoes: FuncaoData[] = (source.funcoes || []).map((f) => {
        const newFuncaoId = generateId();
        funcaoIdMap.set(f.id, newFuncaoId);
        return {
          ...f,
          id: newFuncaoId,
          func_epis_lista: (f.func_epis_lista || []).map((epi) => ({ ...epi, id: generateId() })),
        };
      });

      // 3. Clona Riscos mapeando para as novas funções
      const clonedRiscos: Record<string, string[]> = {};
      Object.entries(source.riscos || {}).forEach(([oldFuncId, riscosList]) => {
        const targetFuncId = funcaoIdMap.get(oldFuncId) || oldFuncId;
        clonedRiscos[targetFuncId] = [...riscosList];
      });

      // 4. Clona Avaliações de Riscos (matrizes e dados) mapeando para as novas funções
      const clonedAvaliacoesRiscos: Record<string, Record<string, AvaliacaoRiscoItem>> = {};
      Object.entries(source.avaliacoesRiscos || {}).forEach(([oldFuncId, riscosMap]) => {
        const targetFuncId = funcaoIdMap.get(oldFuncId) || oldFuncId;
        clonedAvaliacoesRiscos[targetFuncId] = JSON.parse(JSON.stringify(riscosMap));
      });

      // 5. Clona Vínculos de Produtos Químicos por Função
      const clonedProdutosPorFuncao: Record<string, VinculoProdutoFuncao[]> = {};
      Object.entries(source.produtosPorFuncao || {}).forEach(([oldFuncId, vinculos]) => {
        const targetFuncId = funcaoIdMap.get(oldFuncId) || oldFuncId;
        clonedProdutosPorFuncao[targetFuncId] = (vinculos || []).map((v) => ({
          ...v,
          id: generateId(),
          funcaoId: targetFuncId,
        }));
      });

      // 6. Clona Protocolos do PCMSO por Função
      const clonedPcmsoProtocolos: Record<string, any[]> = {};
      Object.entries(source.pcmsoProtocolos || {}).forEach(([oldFuncId, protos]) => {
        const targetFuncId = funcaoIdMap.get(oldFuncId) || oldFuncId;
        clonedPcmsoProtocolos[targetFuncId] = (protos || []).map((p: any) => ({
          ...p,
          id: generateId(),
          funcaoId: targetFuncId,
        }));
      });

      // 7. Clona AEPs (NR-17)
      const clonedAep: AepItem[] = (source.aepAvaliacoes || []).map((aep) => ({
        ...aep,
        id: generateId(),
        funcaoId: funcaoIdMap.get(aep.funcaoId || "") || aep.funcaoId,
      }));

      // 8. Clona Avaliações NR-16
      const clonedNr16: Nr16AvaliacaoItem[] = (source.nr16Avaliacoes || []).map((nr) => ({
        ...nr,
        id: generateId(),
        funcaoId: funcaoIdMap.get(nr.funcaoId || "") || nr.funcaoId,
      }));

      // 9. Clona Plano de Ação (5W2H)
      let clonedPlano: PlanoAcaoItem[] = [];
      if (options.includePlanoAcao !== false) {
        clonedPlano = (source.planoAcaoGlobal || []).map((p) => {
          let refId = p.referenciaId;
          if (refId) {
            if (funcaoIdMap.has(refId)) refId = funcaoIdMap.get(refId);
            else if (setorIdMap.has(refId)) refId = setorIdMap.get(refId);
          }
          return {
            ...p,
            id: generateId(),
            referenciaId: refId,
          };
        });
      }

      // 10. Clona Trabalhadores / Funcionários
      let clonedFuncionarios: FuncionarioData[] = [];
      if (options.includeFuncionarios !== false) {
        clonedFuncionarios = (source.funcionarios || []).map((func) => ({
          ...func,
          id: generateId(),
          funcaoId: funcaoIdMap.get(func.funcaoId || "") || func.funcaoId,
        }));
      }

      // 11. Clona Produtos Químicos gerais
      const clonedProdutosQuimicos: ProdutoQuimicoItem[] = (source.produtosQuimicos || []).map((pq) => ({
        ...pq,
        id: generateId(),
      }));

      // 12. Monta o objeto final da nova empresa
      const finalRazao = options.newName?.trim() || `${source.empresa?.emp_razao || "Empresa"} (Cópia)`;
      const newCompany: Company = {
        ...JSON.parse(JSON.stringify(source)),
        id: newCompanyId,
        empresa: {
          ...source.empresa,
          emp_razao: finalRazao,
          emp_fantasia: options.newFantasia !== undefined ? options.newFantasia : (source.empresa?.emp_fantasia ? `${source.empresa.emp_fantasia} (Cópia)` : ""),
          emp_cnpj: options.newCnpj !== undefined ? options.newCnpj : "",
          emp_vistoria: options.newVistoriaDate || new Date().toISOString().slice(0, 10),
        },
        setores: clonedSetores,
        funcoes: clonedFuncoes,
        riscos: clonedRiscos,
        avaliacoesRiscos: clonedAvaliacoesRiscos,
        produtosQuimicos: clonedProdutosQuimicos,
        produtosPorFuncao: clonedProdutosPorFuncao,
        pcmsoProtocolos: clonedPcmsoProtocolos,
        aepAvaliacoes: clonedAep,
        nr16Avaliacoes: clonedNr16,
        planoAcaoGlobal: clonedPlano,
        funcionarios: clonedFuncionarios,
        // Limpa eventos transacionais históricos individuais da empresa anterior
        asosRegistrados: [],
        ddsRegistros: [],
        ptPermissoes: [],
        esocialCats: [],
        encaminhamentosAso: [],
        srq20Avaliacoes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 13. Adiciona à lista de empresas e seleciona
      const nextCompanies = [...companies, newCompany];
      setCompanies(nextCompanies);
      setCurrentCompanyId(newCompanyId);
      setActiveTab("empresa");

      // 14. Persistência local imediata
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCompanies));
        localStorage.setItem(CURRENT_ID_KEY, newCompanyId);
      } catch {}

      localDB.saveCompany(newCompany);
      localDB.saveAllCompanies(nextCompanies);

      // 15. Backup automático na nuvem
      googleDriveBackup.triggerAutoBackup(nextCompanies);
      if (user?.uid) {
        firestoreSyncService.saveVistoria(newCompany, user.uid).catch(console.warn);
      }

      const totalRiscos = Object.values(clonedRiscos).flat().length;
      showAlert(
        "success",
        `Empresa "${finalRazao}" duplicada com sucesso! (${clonedSetores.length} setores, ${clonedFuncoes.length} funções e ${totalRiscos} riscos clonados)`
      );
    } catch (err) {
      console.error("Erro ao duplicar empresa:", err);
      showAlert("error", "Ocorreu um erro ao duplicar a empresa.");
    }
  };

  const handleDeleteCompany = async (id: string) => {
    const compId = String(id);
    const targetComp = companies.find((c) => String(c.id) === compId);
    const companyRazao = targetComp?.empresa?.emp_razao || targetComp?.empresa?.emp_fantasia || "Empresa";

    // 1. Marca imediatamente como deletada no histórico local para evitar ressuscitação
    markCompanyAsDeleted(compId);

    // 2. Cancela qualquer salvamento pendente em debounce
    firestoreSyncService.cancelPendingSave(compId);

    // 3. Calcula o próximo estado das empresas
    const remaining = companies.filter((c) => String(c.id) !== compId);
    let nextCompanies: Company[];
    let nextActiveId: string;

    if (remaining.length === 0) {
      // Se era a única empresa cadastrada (ex: Minha Empresa Modelo), cria uma nova empresa limpa
      const freshCompany = createEmptyCompany("Nova Empresa");
      nextCompanies = [freshCompany];
      nextActiveId = freshCompany.id;
    } else {
      nextCompanies = remaining;
      nextActiveId = String(currentCompanyId) === compId ? nextCompanies[0].id : currentCompanyId;
    }

    // 4. Atualiza os estados React
    setCurrentCompanyId(nextActiveId);
    setCompanies(nextCompanies);

    // 5. Persiste localmente de imediato
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCompanies));
      localStorage.setItem(CURRENT_ID_KEY, nextActiveId);
    } catch {}

    await localDB.deleteCompany(compId);
    await localDB.saveAllCompanies(nextCompanies);

    // 6. Atualiza backup no Google Drive se conectado
    googleDriveBackup.performBackupToDrive(nextCompanies).catch(console.warn);

    // 7. Deleta da nuvem Firestore (incluindo varredura de duplicatas caso seja a empresa modelo)
    if (user?.uid) {
      firestoreSyncService.deleteVistoria(compId, user.uid, targetComp?.empresa?.emp_razao).catch(console.warn);
    }

    showAlert("info", `Empresa "${companyRazao}" excluída com sucesso.`);
  };

  const handleUpdateAllCompanies = useCallback(
    (updatedList: Company[]) => {
      setCompanies(updatedList);
      localDB.saveAllCompanies(updatedList);
      if (user?.uid) {
        firestoreSyncService.migrateLocalToCloud(updatedList, user.uid).catch(console.warn);
      }
    },
    [user?.uid]
  );

  const handleImportBackup = (data: any) => {
    if (Array.isArray(data.companies) && data.companies.length > 0) {
      setCompanies(data.companies);
      setCurrentCompanyId(data.companies[0].id);
      localDB.saveAllCompanies(data.companies);
      googleDriveBackup.performBackupToDrive(data.companies).catch(console.warn);
      if (user?.uid) {
        firestoreSyncService.migrateLocalToCloud(data.companies, user.uid).catch(console.warn);
      }
      showAlert("success", `${data.companies.length} empresa(s) importada(s) e sincronizada(s) na nuvem!`);
    }
  };

  const handleSavePlanoAcaoGlobal = (itens: PlanoAcaoItem[]) => {
    updateActiveCompany((c) => ({
      ...c,
      planoAcaoGlobal: itens,
    }));
    showAlert("success", "Plano de Ação (5W2H) atualizado com sucesso!");
  };

  const handleRestoreCompanies = (restored: Company[]) => {
    if (restored && restored.length > 0) {
      setCompanies(restored);
      setCurrentCompanyId(restored[0].id);
      localDB.saveAllCompanies(restored);
      if (user?.uid) {
        firestoreSyncService.migrateLocalToCloud(restored, user.uid).catch(console.warn);
      }
    }
  };

  // Counts for bottom nav badges
  const totalSetores = activeCompany.setores.length;
  const totalFuncoes = activeCompany.funcoes.length;
  const totalFuncionarios = (activeCompany.funcionarios || []).length;
  const totalRiscos = Object.values(activeCompany.riscos).flat().length;
  const totalPcmso = (activeCompany.asosRegistrados || []).length;
  const totalEsocial =
    (activeCompany.esocialS2240?.length || 0) +
    (activeCompany.esocialCats?.length || 0) +
    (activeCompany.asosRegistrados?.length || 0);
  const totalPlano = (activeCompany.planoAcaoGlobal || []).length;
  const totalNr16 = (activeCompany.nr16Avaliacoes || []).length;
  const totalAep = (activeCompany.aepAvaliacoes || []).length;
  const totalSrq20 = (activeCompany.srq20Avaliacoes || []).length;
  const totalDds = (activeCompany.ddsRegistros || []).length;
  const totalPt = (activeCompany.ptPermissoes || []).length;

  // Renderização direta caso o trabalhador tenha aberto o link do SRQ-20
  if (workerMode.active) {
    return (
      <Srq20WorkerView
        companyId={workerMode.companyId}
        initialSetor={workerMode.setor}
        onSubmitted={(newEval) => {
          setCompanies((prev) =>
            prev.map((c) => {
              if (c.id === workerMode.companyId) {
                const list = c.srq20Avaliacoes || [];
                return { ...c, srq20Avaliacoes: [newEval, ...list] };
              }
              return c;
            })
          );
        }}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
      {/* Sticky Header with Navigation & Company Selector */}
      <Header
        companies={companies}
        currentCompanyId={currentCompanyId}
        onSelectCompany={setCurrentCompanyId}
        onCreateCompany={handleCreateCompany}
        onOpenDuplicateCompany={() => setIsDuplicateModalOpen(true)}
        onDeleteCompany={handleDeleteCompany}
        onRestoreCompanies={handleRestoreCompanies}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onOpenDocumentHub={() => setIsDocumentHubOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onAlert={showAlert}
      />

      {/* Floating Alert / Toast */}
      {alertInfo && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-bounce-short">
          <div
            className={`flex items-center justify-between gap-2.5 rounded-2xl p-3.5 shadow-xl border text-xs font-semibold backdrop-blur-md ${
              alertInfo.type === "success"
                ? "bg-slate-900/95 text-white border-slate-800"
                : alertInfo.type === "error"
                ? "bg-red-900/95 text-white border-red-800"
                : "bg-slate-900/95 text-white border-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {alertInfo.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
              {alertInfo.type === "error" && <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
              {alertInfo.type === "info" && <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />}
              <span>{alertInfo.message}</span>
            </div>
            <button
              onClick={() => setAlertInfo(null)}
              className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 pt-3.5">
        {activeTab === "empresa" && (
          <EmpresaTab
            empresa={activeCompany.empresa}
            onChange={handleEmpresaFieldChange}
            onAlert={showAlert}
            onDuplicateCompany={() => setIsDuplicateModalOpen(true)}
          />
        )}

        {activeTab === "setores" && (
          <SetoresTab
            setores={activeCompany.setores}
            onSaveSetor={handleSaveSetor}
            onDeleteSetor={handleDeleteSetor}
            onAlert={showAlert}
          />
        )}

        {activeTab === "funcoes" && (
          <FuncoesTab
            funcoes={activeCompany.funcoes}
            setores={activeCompany.setores}
            riscosPorFuncao={activeCompany.riscos}
            onSaveFuncao={handleSaveFuncao}
            onDeleteFuncao={handleDeleteFuncao}
            onAlert={showAlert}
          />
        )}

        {activeTab === "funcionarios" && (
          <FuncionariosTab
            company={activeCompany}
            onUpdateCompany={(updated) => updateActiveCompany(() => updated)}
            onAlert={showAlert}
            onNavigateToPcmsoWithWorker={(worker) => {
              setSelectedWorkerForAso(worker);
              setActiveTab("pcmso");
            }}
            onNavigateToEsocialWithWorker={(worker, tipoEvento) => {
              setActiveTab("esocial");
            }}
          />
        )}

        {activeTab === "pcmso" && (
          <PcmsoTab
            company={activeCompany}
            companies={companies}
            onUpdateCompany={(updated) => updateActiveCompany(() => updated)}
            onUpdateAllCompanies={handleUpdateAllCompanies}
            onAlert={showAlert}
            preSelectedWorker={selectedWorkerForAso}
            onClearPreSelectedWorker={() => setSelectedWorkerForAso(null)}
          />
        )}

        {activeTab === "riscos" && (
          <RiscosTab
            funcoes={activeCompany.funcoes}
            setores={activeCompany.setores}
            riscosPorFuncao={activeCompany.riscos}
            tipoMatrizPadrao={activeCompany.tipoMatrizPadrao || "5x5"}
            avaliacoesRiscos={activeCompany.avaliacoesRiscos || {}}
            produtosQuimicos={activeCompany.produtosQuimicos || []}
            produtosPorFuncao={activeCompany.produtosPorFuncao || {}}
            onToggleRisco={handleToggleRisco}
            onSaveAvaliacaoRisco={handleSaveAvaliacaoRisco}
            onChangeTipoMatrizPadrao={handleChangeTipoMatrizPadrao}
            onSaveProdutoQuimico={handleSaveProdutoQuimico}
            onDeleteProdutoQuimico={handleDeleteProdutoQuimico}
            onImportStandardChemicals={handleImportStandardChemicals}
            onToggleVinculoProduto={handleToggleVinculoProduto}
            onUpdateVinculoProduto={handleUpdateVinculoProduto}
            onAlert={showAlert}
          />
        )}

        {activeTab === "esocial" && (
          <ESocialTab
            company={activeCompany}
            onUpdateCompany={(updated) => updateActiveCompany(() => updated)}
            onAlert={showAlert}
          />
        )}

        {activeTab === "plano" && (
          <PlanoAcaoTab
            company={activeCompany}
            onSavePlanoAcao={handleSavePlanoAcaoGlobal}
            onAlert={showAlert}
          />
        )}

        {activeTab === "nr16" && (
          <Nr16Tab
            company={activeCompany}
            funcoes={activeCompany.funcoes}
            setores={activeCompany.setores}
            onSaveNr16={handleSaveNr16}
            onDeleteNr16={handleDeleteNr16}
            onAlert={showAlert}
          />
        )}

        {activeTab === "aep" && (
          <Nr17Tab
            company={activeCompany}
            funcoes={activeCompany.funcoes}
            setores={activeCompany.setores}
            aepAvaliacoes={activeCompany.aepAvaliacoes || []}
            onSaveAep={handleSaveAep}
            onDeleteAep={handleDeleteAep}
            onUpdateCompany={(updated) => updateActiveCompany(() => updated)}
            onAlert={showAlert}
            activeSubTab={nr17SubTab}
            onSubTabChange={setNr17SubTab}
          />
        )}

        {activeTab === "dds" && (
          <DdsTab
            company={activeCompany}
            onUpdateCompany={(updated) => updateActiveCompany(() => updated)}
            onShowAlert={showAlert}
          />
        )}

        {activeTab === "pt" && (
          <PtTab
            company={activeCompany}
            onUpdateCompany={(updated) => updateActiveCompany(() => updated)}
            onShowAlert={showAlert}
          />
        )}

        {activeTab === "relatorio" && (
          <RelatorioTab
            company={activeCompany}
            companies={companies}
            onOpenDocumentHub={() => setIsDocumentHubOpen(true)}
            onImportBackup={handleImportBackup}
            onRestoreCompanies={handleRestoreCompanies}
            onAlert={showAlert}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          setores: totalSetores,
          funcoes: totalFuncoes,
          funcionarios: totalFuncionarios,
          riscos: totalRiscos,
          pcmso: totalPcmso,
          esocial: totalEsocial,
          plano: totalPlano,
          nr16: totalNr16,
          aep: totalAep,
          srq20: totalSrq20,
          dds: totalDds,
          pt: totalPt,
        }}
      />

      {/* Central de Emissão de Documentos & Laudos Modal */}
      <DocumentHubModal
        isOpen={isDocumentHubOpen}
        onClose={() => setIsDocumentHubOpen(false)}
        company={activeCompany}
        onAlert={showAlert}
      />

      {/* Auto Prompt Google Drive on First Launch */}
      <GoogleDrivePromptModal
        isOpen={showAutoDrivePrompt}
        onClose={() => setShowAutoDrivePrompt(false)}
        onSuccess={(email) => {
          googleDriveBackup.performBackupToDrive(companies).catch(console.warn);
        }}
        onAlert={showAlert}
      />

      {/* Autenticação e Nuvem Firestore (Celular & PC) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(msg) => showAlert("success", msg)}
      />

      <CloudSyncModal
        isOpen={isCloudSyncModalOpen}
        onClose={() => setIsCloudSyncModalOpen(false)}
        companies={companies}
        onCompaniesSynced={(synced) => {
          if (synced && synced.length > 0) {
            setCompanies(synced);
            setCurrentCompanyId(synced[0].id);
            localDB.saveAllCompanies(synced);
          }
        }}
        onOpenAuthModal={() => {
          setIsCloudSyncModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onAlert={showAlert}
      />

      {/* Modal de Duplicação Completa da Empresa */}
      <DuplicateCompanyModal
        isOpen={isDuplicateModalOpen}
        sourceCompany={activeCompany}
        onClose={() => setIsDuplicateModalOpen(false)}
        onConfirm={handleDuplicateCompany}
      />
    </div>
  );
}
