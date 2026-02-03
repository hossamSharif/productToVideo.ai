"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const platforms = [
  { name: "Shopify", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  { name: "Amazon", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  { name: "WooCommerce", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  { name: "Etsy", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400" },
  { name: "eBay", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" },
  }),
};

export function Hero() {
  const t = useTranslations("landing");

  return (
    <section
      id="hero"
      className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-4xl text-center">
        <motion.h1
          className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {t("hero.title")}
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <Button asChild size="lg" className="text-base">
            <Link href="/new-video">
              {t("hero.cta")}
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>

          <Button asChild variant="ghost" size="lg" className="text-base">
            <Link href="#showcase">
              <Play className="mr-1 size-4" />
              {t("hero.ctaSecondary")}
            </Link>
          </Button>
        </motion.div>

        <motion.div
          className="mt-14"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Works with your favorite platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {platforms.map((platform) => (
              <Badge
                key={platform.name}
                variant="outline"
                className={`px-3 py-1 text-sm ${platform.color}`}
              >
                {platform.name}
              </Badge>
            ))}
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              +5 more
            </Badge>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
