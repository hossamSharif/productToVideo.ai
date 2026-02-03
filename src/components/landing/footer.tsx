"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function Footer() {
  const t = useTranslations("landing");

  const columns = [
    {
      title: t("footer.product"),
      links: [
        { label: t("footer.features"), href: "#features" },
        { label: t("footer.pricing"), href: "#pricing" },
        { label: t("footer.templates"), href: "#templates" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { label: t("footer.about"), href: "/about" },
        { label: t("footer.blog"), href: "/blog" },
        { label: t("footer.contact"), href: "/contact" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.privacy"), href: "/privacy" },
        { label: t("footer.terms"), href: "/terms" },
      ],
    },
  ];

  return (
    <footer id="footer" className="bg-neutral-950 px-4 py-16 text-neutral-300">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="[&_span]:text-white [&_svg]:text-white">
              <Logo />
            </div>
            <p className="text-sm text-neutral-400">
              {t("footer.tagline")}
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-neutral-800 pt-8 text-center text-sm text-neutral-500">
          {new Date().getFullYear()} ProductToVideo.ai. {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
