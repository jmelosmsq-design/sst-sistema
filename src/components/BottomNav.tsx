import React, { useRef, useEffect } from "react";
import {
  Building2,
  Factory,
  Users,
  AlertTriangle,
  FileText,
  Activity,
  Flame,
  CheckSquare,
  ShieldAlert,
  FileCheck,
  Stethoscope,
  FileCode,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TabType } from "../types";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    setores: number;
    funcoes: number;
    funcionarios?: number;
    riscos: number;
    pcmso?: number;
    esocial?: number;
    plano?: number;
    nr16?: number;
    aep?: number;
    srq20?: number;
    dds?: number;
    pt?: number;
  };
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Ordem estrita solicitada: Empresa, Setores, Funções, Riscos, Trabalhadores, PCMSO, eSocial, etc.
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "empresa",
      label: "Empresa",
      icon: <Building2 className="h-4.5 w-4.5" />,
    },
    {
      id: "setores",
      label: "Setores",
      icon: <Factory className="h-4.5 w-4.5" />,
      badge: counts.setores,
    },
    {
      id: "funcoes",
      label: "Funções",
      icon: <Users className="h-4.5 w-4.5" />,
      badge: counts.funcoes,
    },
    {
      id: "riscos",
      label: "Riscos",
      icon: <AlertTriangle className="h-4.5 w-4.5" />,
      badge: counts.riscos,
    },
    {
      id: "plano",
      label: "Plano de Ação",
      icon: <CheckSquare className="h-4.5 w-4.5" />,
      badge: counts.plano,
    },
    {
      id: "funcionarios",
      label: "Trabalhadores",
      icon: <UserCheck className="h-4.5 w-4.5" />,
      badge: counts.funcionarios,
    },
    {
      id: "pcmso",
      label: "PCMSO",
      icon: <Stethoscope className="h-4.5 w-4.5" />,
      badge: counts.pcmso,
    },
    {
      id: "esocial",
      label: "eSocial",
      icon: <FileCode className="h-4.5 w-4.5" />,
      badge: counts.esocial,
    },
    {
      id: "nr16",
      label: "NR-16",
      icon: <Flame className="h-4.5 w-4.5" />,
      badge: counts.nr16,
    },
    {
      id: "aep",
      label: "NR-17",
      icon: <Activity className="h-4.5 w-4.5" />,
      badge: (counts.aep || 0) + (counts.srq20 || 0),
    },
    {
      id: "dds",
      label: "DDS",
      icon: <ShieldAlert className="h-4.5 w-4.5" />,
      badge: counts.dds,
    },
    {
      id: "pt",
      label: "PT / PET",
      icon: <FileCheck className="h-4.5 w-4.5" />,
      badge: counts.pt,
    },
    {
      id: "relatorio",
      label: "PDF",
      icon: <FileText className="h-4.5 w-4.5" />,
    },
  ];

  // Auto-scroll para centralizar a aba ativa suavemente
  useEffect(() => {
    const btn = tabButtonRefs.current[activeTab];
    if (btn && scrollContainerRef.current) {
      btn.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeTab]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] transition-colors select-none">
      <div className="relative max-w-7xl mx-auto px-1 sm:px-2 flex items-center h-16 w-full overflow-hidden">
        {/* Botão de seta para rolagem lateral à esquerda (desktop) */}
        <button
          type="button"
          onClick={() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollBy({ left: -220, behavior: "smooth" });
            }
          }}
          className="hidden md:flex shrink-0 items-center justify-center w-6 h-10 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors z-10"
          aria-label="Rolar menu para a esquerda"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Container com rolagem lateral pura e NENHUMA rolagem vertical */}
        <div
          ref={scrollContainerRef}
          onWheel={(e) => {
            if (e.deltaY !== 0 && scrollContainerRef.current) {
              scrollContainerRef.current.scrollLeft += e.deltaY;
            }
          }}
          className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden scroll-smooth w-full h-full py-1.5 no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabButtonRefs.current[tab.id] = el;
                }}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center min-w-[72px] sm:min-w-[80px] h-12 rounded-xl px-2 transition-all duration-150 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/90 dark:bg-blue-950/70 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  {tab.icon}
                  {typeof tab.badge === "number" && tab.badge > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-semibold text-white shadow-xs ${
                        isActive
                          ? "bg-blue-600 ring-2 ring-white dark:ring-slate-900"
                          : "bg-slate-600 dark:bg-slate-600"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`mt-1 text-[10px] uppercase tracking-tight leading-none text-center whitespace-nowrap ${
                    isActive
                      ? "font-semibold text-blue-600 dark:text-blue-400"
                      : "font-medium text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0.5 h-1 w-6 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Botão de seta para rolagem lateral à direita (desktop) */}
        <button
          type="button"
          onClick={() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollBy({ left: 220, behavior: "smooth" });
            }
          }}
          className="hidden md:flex shrink-0 items-center justify-center w-6 h-10 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors z-10"
          aria-label="Rolar menu para a direita"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};

