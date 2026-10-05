import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";

export interface ErrorBoundaryProps {
  children?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReload = () => {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
      if (typeof caches !== 'undefined') {
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        });
      }
    } catch {}
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-slate-100">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
            
            <h1 className="text-xl font-bold text-white mb-2">
              SST Sistema
            </h1>
            <p className="text-xs text-slate-400 mb-4">
              Ocorreu uma instabilidade ao inicializar a interface no dispositivo. Clique abaixo para recarregar com a versão mais recente.
            </p>

            {this.state.error && (
              <div className="mb-5 rounded-xl bg-slate-950 p-3 text-left border border-slate-800 text-[11px] font-mono text-red-400 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-600 font-bold text-white shadow-md hover:bg-emerald-500 active:scale-95 transition-all text-xs"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Recarregar Aplicativo</span>
              </button>

              <button
                onClick={this.handleClearAndReload}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-slate-800 font-medium text-slate-300 hover:bg-slate-700 active:scale-95 transition-all text-xs"
              >
                <Trash2 className="h-4 w-4 text-slate-400" />
                <span>Limpar Cache e Recarregar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
