import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Loader2, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";
import { useAuth } from "../contexts/AuthContext";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useThemeLanguage();
  const { login, register } = useAuth();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus("");
      setIsVerified(false);
      setIsVerifying(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");

    if (!email.trim() || !password) {
      setStatus("请填写邮箱和密码");
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setStatus("请填写昵称");
        return;
      }

      if (password !== confirmPassword) {
        setStatus("两次密码不一致");
        return;
      }

      if (password.length < 8) {
        setStatus("密码至少需要 8 位");
        return;
      }

      if (!acceptedTerms) {
        setStatus("请确认条款和隐私政策");
        return;
      }

      if (!isVerified) {
        setStatus("请先完成安全验证");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isLogin) await login(email, password);
      else await register({ name, email, password });
      setStatus("登录成功");
      onClose();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "操作失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFakeVerify = () => {
    if (isVerified || isVerifying) return;

    setStatus("");
    setIsVerifying(true);
    window.setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setStatus("安全验证已通过");
    }, 900);
  };

  // Only render on client side where document is defined
  if (typeof document === "undefined") return null;

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ pointerEvents: 'auto' }}>
             <div className="min-h-full flex items-center justify-center p-4 sm:p-6 pb-20">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm pointer-events-none"
              />
              <div className="fixed inset-0 z-0" onClick={onClose} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                className="relative w-full max-w-[420px] bg-card border border-border shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] pt-6 pb-5 px-6 sm:pt-8 sm:pb-6 sm:px-10 z-10 flex flex-col" 
                style={{ borderRadius: '1.5rem' }}
              >
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 sm:right-5 sm:top-5 rounded-full p-2 bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors focus:outline-none z-20 cursor-pointer"
              >
                <X className="size-4.5" strokeWidth={2} />
              </button>
              
              <div className="flex flex-col gap-4 sm:gap-6 text-center w-full mt-1 sm:mt-2 relative z-10">
                <div className="flex justify-center mb-0">
                   <div className="relative size-16 bg-[#a4c639] rounded-[14px] rotate-[15deg] flex items-center justify-center shadow-[inset_0_-4px_8px_rgba(0,0,0,0.1),_0_8px_16px_rgba(0,0,0,0.15)]">
                      <div className="size-8 bg-white rounded-full flex items-center justify-center shadow-inner -rotate-[15deg]">
                         <div className="size-3 bg-black rounded-full" />
                      </div>
                   </div>
                </div>
                
                <div className="space-y-2.5">
                  <h2 className="font-bold text-[26px] tracking-tight text-foreground leading-none">
                    {isLogin ? t("auth.welcome") : t("auth.create")}
                  </h2>
                  <p className="text-[15px] text-muted-foreground font-medium">
                    {isLogin ? t("auth.login.desc") : t("auth.register.desc")}
                  </p>
                </div>

                <button type="button" disabled className="group flex items-center justify-center gap-3 rounded-2xl border-2 border-border shadow-sm bg-card text-[15px] font-semibold text-muted-foreground h-12 w-full transition-all mt-1 relative z-20 cursor-not-allowed opacity-60">
                  <svg className="size-[18px]" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  {t("auth.google")}（暂未启用）
                </button>

                <div className="relative flex items-center py-2 pointer-events-none">
                  <div className="flex-grow border-t border-border/60"></div>
                  <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t("auth.or")}</span>
                  <div className="flex-grow border-t border-border/60"></div>
                </div>

                <form className="space-y-4 text-left relative z-20" onSubmit={handleSubmit}>
                  <div className="space-y-3.5">
                    {!isLogin && (
                      <div className="space-y-1.5 flex flex-col">
                        <label className="text-[13px] font-semibold text-foreground/80 px-1 select-none">{t("auth.name")}</label>
                        <input 
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          className="flex h-[42px] sm:h-[46px] w-full rounded-xl border border-input bg-secondary/20 px-4 text-[14px] sm:text-[15px] transition-all focus:bg-card focus:outline-none focus:ring-2 focus:ring-[#a4c639]/30 focus:border-[#a4c639] hover:border-border placeholder:text-muted-foreground/50 relative z-30"
                          placeholder={t("auth.name.placeholder")}
                        />
                      </div>
                    )}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[13px] font-semibold text-foreground/80 px-1 select-none">{t("auth.email")}</label>
                      <input 
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="flex h-[42px] sm:h-[46px] w-full rounded-xl border border-input bg-secondary/20 px-4 text-[14px] sm:text-[15px] transition-all focus:bg-card focus:outline-none focus:ring-2 focus:ring-[#a4c639]/30 focus:border-[#a4c639] hover:border-border placeholder:text-muted-foreground/50 relative z-30"
                        placeholder={t("auth.email.placeholder")}
                      />
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[13px] font-semibold text-foreground/80 px-1 select-none">{t("auth.password")}</label>
                      <input 
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="flex h-[42px] sm:h-[46px] w-full rounded-xl border border-input bg-secondary/20 px-4 text-[14px] sm:text-[15px] transition-all focus:bg-card focus:outline-none focus:ring-2 focus:ring-[#a4c639]/30 focus:border-[#a4c639] hover:border-border placeholder:text-muted-foreground/50 relative z-30"
                        placeholder={isLogin ? t("auth.password.login") : t("auth.password.create")}
                      />
                    </div>
                    {!isLogin && (
                      <div className="space-y-1.5 flex flex-col">
                        <label className="text-[13px] font-semibold text-foreground/80 px-1 select-none">{t("auth.password.confirm")}</label>
                        <input 
                          type="password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          className="flex h-[42px] sm:h-[46px] w-full rounded-xl border border-input bg-secondary/20 px-4 text-[14px] sm:text-[15px] transition-all focus:bg-card focus:outline-none focus:ring-2 focus:ring-[#a4c639]/30 focus:border-[#a4c639] hover:border-border placeholder:text-muted-foreground/50 relative z-30"
                          placeholder={t("auth.password.confirm.placeholder")}
                        />
                      </div>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="pt-2 space-y-4">
                      <button
                        type="button"
                        onClick={handleFakeVerify}
                        disabled={isVerifying || isVerified}
                        className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-[#a4c639]/30 bg-[#a4c639]/10 px-4 py-3 text-left transition-all hover:border-[#a4c639]/60 hover:bg-[#a4c639]/15 disabled:cursor-default dark:bg-[#a4c639]/15"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:via-white/10" />
                        <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-card shadow-inner ring-1 ring-border">
                          {isVerifying ? <Loader2 className="size-5 animate-spin text-[#a4c639]" /> : isVerified ? <CheckCircle2 className="size-5 text-[#a4c639]" /> : <ShieldCheck className="size-5 text-[#a4c639]" />}
                        </div>
                        <div className="relative min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-black text-foreground">{isVerifying ? t("auth.verify.ing") : isVerified ? t("auth.verify.ed") : t("auth.verify.click")}</span>
                            <span className="rounded-full border border-[#a4c639]/30 bg-card px-2 py-0.5 text-[10px] font-black text-[#7d9827] dark:text-[#b5d54a]">AnySoul Guard</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/70">
                            <motion.div
                              className="h-full rounded-full bg-[#a4c639]"
                              animate={{ width: isVerified ? "100%" : isVerifying ? ["18%", "78%"] : "28%" }}
                              transition={{ duration: isVerifying ? 0.8 : 0.25, repeat: isVerifying ? Infinity : 0, repeatType: "reverse" }}
                            />
                          </div>
                          <p className="mt-1 text-[11px] font-semibold text-muted-foreground">模拟人机验证，仅用于恢复注册前的交互门槛。</p>
                        </div>
                      </button>

                      <div className="flex items-center space-x-2.5 px-1">
                        <input 
                          type="checkbox"
                          id="terms"
                          checked={acceptedTerms}
                          onChange={(event) => setAcceptedTerms(event.target.checked)}
                          className="size-4 shrink-0 rounded-[4px] border-border text-[#a4c639] focus:ring-[#a4c639]/30 transition-colors relative z-30 cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-[13px] font-medium text-muted-foreground/90 select-none cursor-pointer relative z-30">
                          {t("auth.terms.agree")} <a href="#terms" className="text-[#a4c639] hover:underline" onClick={(e) => e.stopPropagation()}>{t("auth.terms")}</a> {t("auth.and")} <a href="#privacy" className="text-[#a4c639] hover:underline" onClick={(e) => e.stopPropagation()}>{t("auth.privacy")}</a>
                        </label>
                      </div>
                    </div>
                  )}

                  {status ? <div className="rounded-xl bg-secondary/50 px-3 py-2 text-center text-[13px] font-semibold text-muted-foreground">{status}</div> : null}

                  <button type="submit" disabled={isSubmitting} className="mt-4 flex items-center justify-center rounded-xl text-[15px] font-bold bg-[#a4c639] text-[#1a1a1a] hover:bg-[#b5d54a] h-12 w-full shadow-sm transition-all active:scale-[0.98] relative z-30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? "处理中..." : isLogin ? t("auth.btn.login") : t("auth.btn.register")}
                  </button>
                </form>

                <div className="text-center text-[14px] font-medium text-muted-foreground mb-2 mt-1 relative z-30">
                  {isLogin ? t("auth.no_account") : t("auth.has_account")} 
                  <button 
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setStatus("");
                      setIsVerified(false);
                      setIsVerifying(false);
                    }}
                    className="text-foreground font-semibold hover:text-[#a4c639] transition-colors focus:outline-none ml-1 underline underline-offset-4 decoration-border hover:decoration-[#a4c639] cursor-pointer"
                  >
                    {isLogin ? t("auth.create") : t("auth.btn.login")}
                  </button>
                </div>
              </div>
            </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
