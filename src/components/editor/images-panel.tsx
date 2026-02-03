"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowUp, ArrowDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ImagesPanelProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export function ImagesPanel({ images, onImagesChange }: ImagesPanelProps) {
  const t = useTranslations("editor");

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const updated = [...images];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onImagesChange(updated);
  }

  function handleMoveDown(index: number) {
    if (index === images.length - 1) return;
    const updated = [...images];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onImagesChange(updated);
  }

  function handleRemove(index: number) {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground text-sm">
          {t("customize.noImages")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">
        {t("customize.productImages")}
      </label>
      <div className="grid grid-cols-2 gap-3">
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="group relative flex flex-col items-center gap-1 rounded-lg border border-input bg-card p-2"
          >
            <Badge
              variant="secondary"
              className="absolute top-1 left-1 z-10"
            >
              {index + 1}
            </Badge>
            <Button
              variant="destructive"
              size="icon-xs"
              className="absolute top-1 right-1 z-10 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => handleRemove(index)}
            >
              <X />
            </Button>
            <div className="relative h-[120px] w-[120px] overflow-hidden rounded-md">
              <Image
                src={src}
                alt={`${t("customize.productImages")} ${index + 1}`}
                width={120}
                height={120}
                className="object-cover"
              />
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
              >
                <ArrowUp />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => handleMoveDown(index)}
                disabled={index === images.length - 1}
              >
                <ArrowDown />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
