import { cn } from "../lib/utils";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";

const ReviewCard = ({
  name,
  role,
  body,
}: {
  key?: string | number;
  name: string;
  role: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-[320px] md:w-[380px] shrink-0 overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        "bg-card border border-border shadow-sm flex flex-col min-h-[220px]"
      )}
    >
      <div className="absolute top-4 left-6 text-[80px] text-muted-foreground/10 font-serif leading-none select-none">
        "
      </div>
      <blockquote className="relative z-10 text-[15px] leading-relaxed text-foreground mt-4 mb-8 flex-grow">
        {body}
      </blockquote>
      <div className="flex flex-col relative z-10 mt-auto">
        <figcaption className="text-[15px] font-semibold text-foreground">
          {name}
        </figcaption>
        <p className="text-[13px] font-medium text-muted-foreground mt-0.5">{role}</p>
      </div>
    </figure>
  );
};

export function MarqueeSection() {
  const { t } = useThemeLanguage();

  const row1Reviews = [
    {
      name: t("mq.1.name"),
      role: t("mq.1.role"),
      body: t("mq.1.body"),
    },
    {
      name: t("mq.2.name"),
      role: t("mq.2.role"),
      body: t("mq.2.body"),
    },
    {
      name: t("mq.3.name"),
      role: t("mq.3.role"),
      body: t("mq.3.body"),
    },
  ];

  const row2Reviews = [
    {
      name: t("mq.4.name"),
      role: t("mq.4.role"),
      body: t("mq.4.body"),
    },
    {
      name: t("mq.5.name"),
      role: t("mq.5.role"),
      body: t("mq.5.body"),
    },
    {
      name: t("mq.6.name"),
      role: t("mq.6.role"),
      body: t("mq.6.body"),
    },
  ];

  return (
    <section id="showcase" className="py-32 md:py-48 overflow-hidden bg-background">
      <div className="text-center mb-16 md:mb-24 px-4">
        <h2 className="text-4xl md:text-[54px] font-bold tracking-tight mb-4 md:mb-8 text-foreground">{t("mq.title")}</h2>
        <p className="text-muted-foreground text-lg md:text-xl">{t("mq.subtitle")}</p>
      </div>
      
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden gap-6">
        {/* Row 1 */}
        <div className="flex w-full overflow-hidden group">
           <div className="flex w-fit animate-marquee flex-row gap-6 py-2 group-hover:[animation-play-state:paused] px-3">
             {[...row1Reviews, ...row1Reviews, ...row1Reviews, ...row1Reviews].map((review, i) => (
               <ReviewCard 
                key={`row1-${i}`} 
                name={review.name}
                role={review.role}
                body={review.body}
               />
             ))}
           </div>
        </div>

        {/* Row 2 */}
        <div className="flex w-full overflow-hidden group">
           <div className="flex w-fit flex-row gap-6 py-2 group-hover:[animation-play-state:paused] px-3 animate-marquee-reverse">
             {[...row2Reviews, ...row2Reviews, ...row2Reviews, ...row2Reviews].map((review, i) => (
               <ReviewCard 
                key={`row2-${i}`} 
                name={review.name}
                role={review.role}
                body={review.body}
               />
             ))}
           </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background to-transparent"></div>
      </div>
    </section>
  );
}
