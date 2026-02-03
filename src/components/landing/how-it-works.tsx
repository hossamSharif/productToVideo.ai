"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link as LinkIcon, Brain, Layout, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  { key: "step1", icon: LinkIcon },
  { key: "step2", icon: Brain },
  { key: "step3", icon: Layout },
  { key: "step4", icon: Download },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
};

export function HowItWorks() {
  const t = useTranslations("landing");

  return (
    <section
      id="how-it-works"
      className="px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          {t("howItWorks.title")}
        </motion.h2>

        <div className="relative mt-16">
          {/* Connecting line on desktop */}
          <div className="absolute left-0 right-0 top-12 z-0 hidden h-0.5 bg-border lg:block" />

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.key}
                className="relative flex flex-col items-center text-center"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                custom={index}
              >
                {/* Step number badge + icon */}
                <div className="relative z-10 flex size-24 items-center justify-center rounded-2xl border bg-card shadow-sm">
                  <step.icon className="size-10 text-primary" strokeWidth={1.5} />
                  <Badge className="absolute -right-2 -top-2 size-7 items-center justify-center rounded-full p-0 text-xs">
                    {index + 1}
                  </Badge>
                </div>

                {/* Arrow between steps (desktop only, except last) */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-5 top-10 z-20 hidden text-muted-foreground lg:block">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-muted-foreground"
                    >
                      <path
                        d="M1 8h12m0 0L9 4m4 4L9 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}

                <h3 className="mt-5 text-lg font-semibold">
                  {t(`howItWorks.${step.key}Title`)}
                </h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  {t(`howItWorks.${step.key}Desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
