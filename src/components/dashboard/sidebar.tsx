"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, Film, Layers, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/shared/logo";

interface SidebarProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: { full_name?: string };
  };
}

const navItems = [
  { key: "newVideo" as const, href: "/new-video", icon: Plus },
  { key: "myVideos" as const, href: "/my-videos", icon: Film },
  { key: "bulkGenerate" as const, href: "/bulk", icon: Layers },
  { key: "settings" as const, href: "/settings", icon: Settings },
];

export function Sidebar({ user }: SidebarProps) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();

  // Strip locale prefix for path matching
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  return (
    <aside className="hidden md:flex w-64 flex-col border-e bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center px-4">
        <Logo />
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathWithoutLocale.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      {/* Plan info */}
      <div className="p-4">
        <Separator className="mb-4" />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{t("plan", { plan: "Free" })}</Badge>
          </div>
          <Progress value={0} max={100} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {t("rendersUsed", { used: 0, limit: 10 })}
          </p>
        </div>
      </div>
    </aside>
  );
}
