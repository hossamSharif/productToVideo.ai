"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export function FaqSection() {
  const t = useTranslations("landing");

  return (
    <section id="faq" className="py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("faq.title")}
          </h2>
        </div>

        <Accordion type="single" collapsible>
          {faqKeys.map((key) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger>{t(`faq.${key}`)}</AccordionTrigger>
              <AccordionContent>
                {t(`faq.a${key.slice(1)}` as "faq.a1")}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
