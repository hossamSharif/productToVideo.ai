"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const plans = [
  {
    key: "starter" as const,
    features: [
      "10 video renders/month",
      "All 5 templates",
      "3 export formats",
      "Email support",
    ],
    highlighted: false,
  },
  {
    key: "growth" as const,
    features: [
      "50 video renders/month",
      "All 5 templates",
      "3 export formats",
      "Bulk generation (up to 20)",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    key: "scale" as const,
    features: [
      "200 video renders/month",
      "All 5 templates",
      "3 export formats",
      "Bulk generation (up to 20)",
      "API access",
      "Dedicated support",
    ],
    highlighted: false,
  },
];

export function PricingSection() {
  const t = useTranslations("landing");

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("pricing.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.key}
              className={
                plan.highlighted
                  ? "relative scale-105 border-primary shadow-lg"
                  : "relative"
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>{t("pricing.growthBadge")}</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">
                  {t(`pricing.${plan.key}`)}
                </CardTitle>
                <CardDescription>
                  {t(`pricing.${plan.key}Desc`)}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {t(`pricing.${plan.key}Price`)}
                  </span>
                  <span className="text-muted-foreground">
                    {t(`pricing.${plan.key}Period`)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <Link href="/signup">{t("pricing.cta")}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          {t("pricing.overage")}
        </p>
      </div>
    </section>
  );
}
