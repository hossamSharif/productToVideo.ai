"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Link as LinkIcon,
  Database,
  Layout,
  Play,
  Download,
} from "lucide-react";

const scenes = [
  {
    key: "url-input",
    label: "URL Input",
    icon: LinkIcon,
    gradient: "from-blue-500/20 to-cyan-500/20",
    accent: "text-blue-500",
    description: "Paste any product URL",
  },
  {
    key: "data-extraction",
    label: "Data Extraction",
    icon: Database,
    gradient: "from-purple-500/20 to-pink-500/20",
    accent: "text-purple-500",
    description: "AI extracts product details",
  },
  {
    key: "template-selection",
    label: "Template Selection",
    icon: Layout,
    gradient: "from-orange-500/20 to-yellow-500/20",
    accent: "text-orange-500",
    description: "Choose your video style",
  },
  {
    key: "video-preview",
    label: "Video Preview",
    icon: Play,
    gradient: "from-green-500/20 to-emerald-500/20",
    accent: "text-green-500",
    description: "Preview your video ad",
  },
  {
    key: "export-ready",
    label: "Export Ready",
    icon: Download,
    gradient: "from-rose-500/20 to-red-500/20",
    accent: "text-rose-500",
    description: "Download in any format",
  },
] as const;

const INTERVAL_MS = 4000;

export function AnimatedShowcase() {
  useTranslations("landing");
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % scenes.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / (INTERVAL_MS / 50);
        if (next >= 100) {
          advance();
          return 0;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [advance]);

  const activeScene = scenes[activeIndex];

  return (
    <section
      id="showcase"
      className="px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-4xl">
        {/* Showcase display */}
        <div className="relative mx-auto aspect-video max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScene.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${activeScene.gradient}`}
            >
              <activeScene.icon
                className={`size-16 sm:size-20 ${activeScene.accent}`}
                strokeWidth={1.5}
              />
              <p className={`mt-4 text-xl font-semibold sm:text-2xl ${activeScene.accent}`}>
                {activeScene.label}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeScene.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scene indicators */}
        <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4">
          {scenes.map((scene, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={scene.key}
                onClick={() => {
                  setActiveIndex(index);
                  setProgress(0);
                }}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-full border-2 transition-colors sm:size-12 ${
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-muted bg-muted/50 group-hover:border-muted-foreground/50"
                  }`}
                >
                  <scene.icon
                    className={`size-4 sm:size-5 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>

                {/* Progress bar under active indicator */}
                <div className="h-1 w-10 overflow-hidden rounded-full bg-muted sm:w-12">
                  {isActive ? (
                    <motion.div
                      className="h-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  ) : null}
                </div>

                <span
                  className={`hidden text-xs sm:block ${
                    isActive
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {scene.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
