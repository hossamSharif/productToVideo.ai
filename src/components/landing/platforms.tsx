"use client";

import { useTranslations } from "next-intl";
import { Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const platforms = [
  { name: "Shopify", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  { name: "WooCommerce", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  { name: "Amazon", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  { name: "Salla", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400" },
  { name: "Zid", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400" },
  { name: "Etsy", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400" },
  { name: "Noon", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { name: "Wix", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  { name: "Squarespace", color: "bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400" },
  { name: "BigCommerce", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400" },
];

export function PlatformsSection() {
  const t = useTranslations("landing");

  return (
    <section id="platforms" className="py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("platforms.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("platforms.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {platforms.map((platform) => (
            <Card
              key={platform.name}
              className={`${platform.color} border-0 transition-transform hover:scale-105`}
            >
              <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
                <Store className="size-6" />
                <span className="text-sm font-semibold">{platform.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
