import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      try {
        localStorage.removeItem("fifty_sound_last_screen");
      } catch (_) {}
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="max-w-lg mx-auto my-12 p-6 sm:p-8 bg-white/95 rounded-2xl border-2 border-stone-800 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif font-black text-stone-900 text-lg sm:text-xl">
              页面已安全拦截渲染异常
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
              因词库状态或数据切换时检测到渲染中断，已自动启动异常保护机制。您的个人进度与岁币均已完好保存。
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-serif text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>一键恢复主页</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
