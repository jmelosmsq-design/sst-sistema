import React, { useState } from "react";
import { Activity, Heart, Sparkles, Brain, CheckCircle2, AlertTriangle, Layers, Users } from "lucide-react";
import { Company, FuncaoData, SetorData, AepItem } from "../types";
import { AepTab } from "./AepTab";
import { Srq20Tab } from "./Srq20Tab";

export interface Nr17TabProps {
  company: Company;
  funcoes: FuncaoData[];
  setores: SetorData[];
  aepAvaliacoes: AepItem[];
  onSaveAep: (aep: AepItem) => void;
  onDeleteAep: (id: string) => void;
  onUpdateCompany: (updated: Company) => void;
  onAlert: (type: "success" | "error" | "info", msg: string) => void;
  activeSubTab?: "aep" | "srq20";
  onSubTabChange?: (subTab: "aep" | "srq20") => void;
}

export const Nr17Tab: React.FC<Nr17TabProps> = ({
  company,
  funcoes,
  setores,
  aepAvaliacoes,
  onSaveAep,
  onDeleteAep,
  onUpdateCompany,
  onAlert,
  activeSubTab,
  onSubTabChange,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<"aep" | "srq20">("aep");
  const currentSubTab = activeSubTab !== undefined ? activeSubTab : internalSubTab;

  const handleSwitchTab = (tab: "aep" | "srq20") => {
    if (onSubTabChange) {
      onSubTabChange(tab);
    } else {
      setInternalSubTab(tab);
    }
  };

  const srqAvaliacoes = company.srq20Avaliacoes || [];
  const srqAtencaoCount = srqAvaliacoes.filter((a) => a.classificacao === "Atenção Necessária").length;
  const aepComNcCount = aepAvaliacoes.filter((a) => !a.classificacaoRisco.includes("Baixo")).length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6">
      {/* Barra de Subnavegação Unificada da NR-17 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-2.5 px-1 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-xs">
              17
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>NR-17 • Ergonomia & Saúde no Trabalho</span>
                <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Física + Psicossocial
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Avaliação ergonômica biomecânica integrada ao rastreamento psicossocial da organização do trabalho.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-stretch sm:self-auto justify-end text-[11px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              <Activity className="h-3 w-3 text-indigo-500" />
              {aepAvaliacoes.length} {aepAvaliacoes.length === 1 ? "AEP" : "AEPs"}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              <Heart className="h-3 w-3 text-emerald-500" />
              {srqAvaliacoes.length} {srqAvaliacoes.length === 1 ? "SRQ-20" : "SRQs"}
            </span>
          </div>
        </div>

        {/* Sub-abas adaptadas para celular: 100% da largura, altura confortável */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Aba 1: AEP / Biomecânica */}
          <button
            type="button"
            onClick={() => handleSwitchTab("aep")}
            className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
              currentSubTab === "aep"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 text-left min-w-0">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  currentSubTab === "aep" ? "bg-white/20 text-white" : "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                }`}
              >
                <Activity className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-black">AEP / Biomecânica</div>
                <div
                  className={`text-[10px] truncate ${
                    currentSubTab === "aep" ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Checklist Couto • Postura • Cargas • NR-17.3
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  currentSubTab === "aep"
                    ? "bg-white text-indigo-700"
                    : "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                }`}
              >
                {aepAvaliacoes.length}
              </span>
              {aepComNcCount > 0 && (
                <span
                  title={`${aepComNcCount} avaliação(ões) com atenção ou indicação de AET`}
                  className={`flex h-2 w-2 rounded-full ${
                    currentSubTab === "aep" ? "bg-amber-300" : "bg-amber-500"
                  } animate-pulse`}
                />
              )}
            </div>
          </button>

          {/* Aba 2: SRQ-20 / Psicossocial */}
          <button
            type="button"
            onClick={() => handleSwitchTab("srq20")}
            className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
              currentSubTab === "srq20"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 text-left min-w-0">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  currentSubTab === "srq20" ? "bg-white/20 text-white" : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <Heart className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-black">SRQ-20 / Psicossocial</div>
                <div
                  className={`text-[10px] truncate ${
                    currentSubTab === "srq20" ? "text-emerald-100" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Saúde Mental OMS • Organização do Trabalho NR-17.4
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  currentSubTab === "srq20"
                    ? "bg-white text-emerald-700"
                    : "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {srqAvaliacoes.length}
              </span>
              {srqAtencaoCount > 0 && (
                <span
                  title={`${srqAtencaoCount} caso(s) de atenção psicossocial`}
                  className={`flex h-2 w-2 rounded-full ${
                    currentSubTab === "srq20" ? "bg-rose-300" : "bg-rose-500"
                  } animate-pulse`}
                />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico da Sub-Aba Selecionada */}
      {currentSubTab === "aep" ? (
        <AepTab
          company={company}
          funcoes={funcoes}
          setores={setores}
          aepAvaliacoes={aepAvaliacoes}
          onSaveAep={onSaveAep}
          onDeleteAep={onDeleteAep}
          onAlert={onAlert}
        />
      ) : (
        <Srq20Tab
          company={company}
          onUpdateCompany={onUpdateCompany}
          onAlert={onAlert}
        />
      )}
    </div>
  );
};
