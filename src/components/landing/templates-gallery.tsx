"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";

const templates = [
  {
    name: "Minimal Luxury",
    description: "Elegant and refined with subtle animations",
    gradient: "from-neutral-900 to-neutral-700",
  },
  {
    name: "Bold Sale",
    description: "High-contrast, attention-grabbing promotions",
    gradient: "from-red-600 to-orange-500",
  },
  {
    name: "Product Showcase",
    description: "Clean focus on product details and features",
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    name: "Story Swipe",
    description: "Vertical-first, optimized for social stories",
    gradient: "from-purple-600 to-pink-500",
  },
  {
    name: "Clean Modern",
    description: "Minimalist design with smooth transitions",
    gradient: "from-emerald-600 to-teal-500",
  },
];

export function TemplatesGallery() {
  const t = useTranslations("landing");

  return (
    <section id="templates" className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("templates.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("templates.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
          {templates.map((template) => (
            <Card
              key={template.name}
              className="overflow-hidden border-0 transition-transform hover:scale-105"
            >
              <CardContent className="p-0">
                <div
                  className={`flex aspect-[9/16] flex-col items-center justify-center bg-gradient-to-br ${template.gradient} px-4 text-center text-white`}
                >
                  <h3 className="text-lg font-bold">{template.name}</h3>
                  <p className="mt-2 text-sm text-white/80">
                    {template.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
