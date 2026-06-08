import { cn } from "../lib/utils";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";

export function Pricing() {
  const { t } = useThemeLanguage();

  const plans = [
    {
      name: t("pr.1.name"),
      price: t("pr.1.price"),
      description: t("pr.1.desc"),
      features: [t("pr.1.f1"), t("pr.1.f2"), t("pr.1.f3"), t("pr.1.f4")],
      cta: t("pr.1.cta"),
      popular: false,
    },
    {
      name: t("pr.2.name"),
      price: t("pr.2.price"),
      period: t("pr.2.period"),
      description: t("pr.2.desc"),
      features: [t("pr.2.f1"), t("pr.2.f2"), t("pr.2.f3"), t("pr.2.f4"), t("pr.2.f5")],
      cta: t("pr.2.cta"),
      popular: true,
    },
    {
      name: t("pr.3.name"),
      price: t("pr.3.price"),
      description: t("pr.3.desc"),
      features: [t("pr.3.f1"), t("pr.3.f2"), t("pr.3.f3"), t("pr.3.f4"), t("pr.3.f5")],
      cta: t("pr.3.cta"),
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-32 md:py-48 px-4 w-full max-w-7xl mx-auto">
      <div className="mb-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
          {t("pr.title")}<span className="text-muted-foreground font-normal">{t("pr.title2")}</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t("pr.subtitle")}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-[2.5rem] border-2 bg-card p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
              plan.popular ? "border-primary/30 shadow-[0_8px_30px_rgb(134,158,113,0.15)] z-10" : "border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-sm uppercase tracking-widest whitespace-nowrap">
                {t("pr.2.pop")}
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-[15px] text-muted-foreground mt-2 min-h-[40px]">{plan.description}</p>
            </div>
            
            <div className="mb-8 flex items-baseline text-foreground">
              <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
              {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
            </div>
            
            <ul className="mb-10 flex-1 space-y-5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex flex-row items-start gap-4 text-[15px] text-muted-foreground">
                  <Check className="size-5 shrink-0 text-primary mt-0.5" strokeWidth={1.5} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              className={cn(
                "mt-auto h-14 w-full rounded-2xl text-[15px] font-bold transition-all focus-visible:ring-4 focus-visible:ring-primary/20 hover:-translate-y-0.5 active:scale-95 group",
                plan.popular 
                  ? "bg-primary text-primary-foreground hover:bg-primary/95 shadow-[0_4px_14px_0_rgb(134,158,113,0.39)] hover:shadow-[0_6px_20px_rgba(134,158,113,0.23)]" 
                  : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
              )}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
