"use client";

import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const languages = [
  { name: "English", native: "English", rtl: false },
  { name: "Arabic", native: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", rtl: true },
  { name: "French", native: "Fran\u00E7ais", rtl: false },
  { name: "Spanish", native: "Espa\u00F1ol", rtl: false },
  { name: "German", native: "Deutsch", rtl: false },
  { name: "Turkish", native: "T\u00FCrk\u00E7e", rtl: false },
  { name: "Chinese", native: "\u4E2D\u6587", rtl: false },
  { name: "Hindi", native: "\u0939\u093F\u0928\u094D\u0926\u0940", rtl: false },
];

export function LanguagesSection() {
  const t = useTranslations("landing");

  return (
    <section id="languages" className="py-20 px-4 bg-muted/40">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("languages.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("languages.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {languages.map((lang) => (
            <Card
              key={lang.name}
              className="relative border transition-transform hover:scale-105"
            >
              <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
                <Globe className="size-6 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{lang.name}</p>
                  <p className="text-sm text-muted-foreground">{lang.native}</p>
                </div>
                {lang.rtl && (
                  <Badge variant="secondary" className="text-xs">
                    RTL
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
