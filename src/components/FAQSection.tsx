import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, BookOpen, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useContent } from '../content/useContent';
import type { FaqContent } from '../content/types';

export function FAQSection() {
  const { t } = useThemeLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqContent = useContent<FaqContent>("home.faq.items", {
    title: t("faq.title"),
    items: [
      {
        question: t("faq.q1"),
        answer: t("faq.a1")
      },
      {
        question: t("faq.q2"),
        answer: t("faq.a2")
      },
      {
        question: t("faq.q3"),
        answer: t("faq.a3")
      }
    ]
  });

  return (
    <section className="py-24 md:py-32 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-center mb-16 text-foreground">{faqContent.title}</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Accordion */}
          <div className="flex flex-col gap-4">
            {faqContent.items.map((faq, idx) => (
              <div 
                key={idx}
                className="border-[4px] border-[#e5e5e5] rounded-2xl bg-card px-8 relative group transition-colors duration-500 hover:border-[#b4c053] dark:border-border dark:hover:border-primary"
              >
                
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between py-6 text-left"
                >
                  <span className="text-xl font-medium text-foreground">{faq.question}</span>
                  <ChevronDown 
                    className={cn(
                      "text-muted-foreground size-6 transition-transform duration-500",
                      openIndex === idx ? "rotate-180 text-primary" : ""
                    )} 
                  />
                </button>
                
                <AnimatePresence>
                  {openIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 text-muted-foreground leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right Column: Links and Reference Cards */}
          <div className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: 深入了解 */}
              <div className="border-[4px] border-[#e5e5e5] rounded-2xl bg-card p-6 flex flex-col min-h-[220px] dark:border-border">
                <div className="flex items-center gap-2 mb-6 text-foreground">
                  <BookOpen className="size-5 text-[#b4c053]" />
                  <h3 className="font-bold text-lg">{t("faq.card1.title")}</h3>
                </div>
                
                <ul className="flex flex-col gap-3">
                  <li className="flex items-start gap-2.5 group cursor-pointer">
                    <ArrowRight className="size-4 mt-1 text-[#b4c053]/60 group-hover:text-[#b4c053] transition-colors shrink-0" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">{t("faq.card1.l1")}</span>
                  </li>
                  <li className="flex items-start gap-2.5 group cursor-pointer">
                    <ArrowRight className="size-4 mt-1 text-[#b4c053]/60 group-hover:text-[#b4c053] transition-colors shrink-0" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">{t("faq.card1.l2")}</span>
                  </li>
                  <li className="flex items-start gap-2.5 group cursor-pointer">
                    <ArrowRight className="size-4 mt-1 text-[#b4c053]/60 group-hover:text-[#b4c053] transition-colors shrink-0" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">{t("faq.card1.l3")}</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: 产品对比 */}
              <div className="border-[4px] border-[#e5e5e5] rounded-2xl bg-card p-6 flex flex-col min-h-[220px] dark:border-border">
                <div className="flex items-center gap-2 mb-6 text-foreground">
                  <BookOpen className="size-5 text-muted-foreground" />
                  <h3 className="font-bold text-lg">{t("faq.card2.title")}</h3>
                </div>
                
                <ul className="flex flex-col gap-3">
                  <li className="flex items-center gap-2.5 group cursor-pointer">
                    <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">AnySoul vs SillyTavern</span>
                  </li>
                  <li className="flex items-center gap-2.5 group cursor-pointer">
                    <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">AnySoul vs OpenClaw</span>
                  </li>
                  <li className="flex items-center gap-2.5 group cursor-pointer">
                    <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">AnySoul vs Manus</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Button */}
            <a 
              href="#"
              className="border-[4px] border-[#e5e5e5] rounded-2xl bg-card px-8 py-4 flex items-center justify-center gap-3 hover:bg-muted/30 transition-colors group dark:border-border"
            >
              <span className="text-xl font-bold tracking-widest text-foreground">{t("faq.doc")}</span>
              <ArrowRight className="size-5 text-foreground group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </a>

          </div>
        </div>
      </div>
    </section>
  );
}
