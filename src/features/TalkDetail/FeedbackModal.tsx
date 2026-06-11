import { UploadCloud, X, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function FeedbackModal({
  isOpen,
  onClose,
  submitState,
  setSubmitState,
  onFinish,
  talk
}: {
  isOpen: boolean;
  onClose: () => void;
  submitState: 'diff' | 'loading' | 'success';
  setSubmitState: (state: 'diff' | 'loading' | 'success') => void;
  onFinish: () => void;
  talk: any;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8"
          onClick={() => submitState === 'diff' && onClose()}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background rounded-[2rem] shadow-2xl border border-border/50 overflow-hidden w-full max-w-2xl flex flex-col relative"
          >
            <AnimatePresence mode="wait">
              {submitState === 'diff' && (
                <motion.div 
                  key="diff"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col"
                >
                  <div className="flex items-center justify-between p-6 border-b border-border/50">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <UploadCloud className="size-5 text-orange-500" /> 上传补充比对
                    </h3>
                    <button 
                      onClick={onClose}
                      className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar">
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-muted-foreground">观看人数 (原数据 → 补充数据)</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-red-500/10 text-red-700 dark:text-red-400 p-3 rounded-xl border border-red-500/20 line-through text-center font-bold text-lg">{talk.viewers?.toLocaleString() || '1,245'}</div>
                        <div className="text-muted-foreground">→</div>
                        <div className="flex-1 bg-green-500/10 text-green-700 dark:text-green-400 p-3 rounded-xl border border-green-500/20 text-center font-bold text-lg">1,890</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-muted-foreground">本期简述 (原描述与补充内容)</div>
                      <div className="flex flex-col gap-2">
                        <div className="bg-red-500/10 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-500/20 line-through text-sm leading-relaxed">
                          {talk.desc}
                        </div>
                        <div className="bg-green-500/10 text-green-700 dark:text-green-400 p-4 rounded-xl border border-green-500/20 text-sm font-medium leading-relaxed">
                          {talk.desc} (特别提示：本期回放已包含后续增补的高光时刻与幕后访谈部分内容...)
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border-t border-border/50 bg-muted/20 flex justify-end gap-3">
                    <button 
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      onClick={() => {
                        setSubmitState('loading');
                        setTimeout(() => {
                          setSubmitState('success');
                          setTimeout(() => {
                              onFinish();
                          }, 1500);
                        }, 1500);
                      }}
                      className="px-6 py-2.5 rounded-xl font-bold bg-primary text-primary-foreground hover:shadow-lg transition-all hover:scale-105"
                    >
                      通过并继续
                    </button>
                  </div>
                </motion.div>
              )}

              {submitState === 'loading' && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center p-16 py-32 gap-6"
                >
                  <div className="relative flex justify-center items-center">
                    <Loader2 className="size-16 text-primary animate-spin" />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 bg-primary/20 blur-xl rounded-full" 
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                     <div className="text-2xl font-bold text-foreground tracking-tight">正在提交补充内容...</div>
                     <div className="text-sm font-medium text-muted-foreground">正在加密并同步至社区数据库</div>
                  </div>
                </motion.div>
              )}

              {submitState === 'success' && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center p-16 py-32 gap-6"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/20"
                  >
                    <CheckCircle className="size-12" />
                  </motion.div>
                  <div className="flex flex-col items-center gap-2 text-center mt-2">
                     <div className="text-3xl font-black text-foreground tracking-tight">成功投稿！</div>
                     <div className="text-sm font-medium text-muted-foreground mt-2 max-w-[280px]">感谢您的反馈与补充，审核通过后将合并至该页面。</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
