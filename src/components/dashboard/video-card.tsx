"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Download,
  Trash2,
  Pencil,
  MoreVertical,
  Film,
  Calendar,
  Globe,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { VideoProject, RenderedVideo } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface VideoCardProps {
  project: VideoProject & { rendered_videos: RenderedVideo[] };
  viewMode: "grid" | "list";
  onDeleted: () => void;
}

const FORMAT_LABELS: Record<string, string> = {
  "9:16": "9:16",
  "1:1": "1:1",
  "16:9": "16:9",
};

export function VideoCard({ project, viewMode, onDeleted }: VideoCardProps) {
  const t = useTranslations("videos");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const thumbnail = project.product_images?.[0] ?? null;
  const completedVideos = project.rendered_videos.filter(
    (v) => v.status === "complete"
  );
  const completedFormats = completedVideos.map((v) => v.format);
  const createdDate = new Date(project.created_at).toLocaleDateString();

  async function handleDownload(renderedVideo?: RenderedVideo) {
    setIsDownloading(true);
    try {
      const supabase = createClient();
      const videosToDownload = renderedVideo
        ? [renderedVideo]
        : completedVideos;

      for (const video of videosToDownload) {
        if (!video.file_path) continue;

        const { data, error } = await supabase.storage
          .from("rendered-videos")
          .createSignedUrl(video.file_path, 3600);

        if (error || !data?.signedUrl) continue;

        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = `${project.product_name}-${video.format}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const supabase = createClient();

      // Delete storage files
      const filePaths = project.rendered_videos
        .map((v) => v.file_path)
        .filter(Boolean) as string[];

      if (filePaths.length > 0) {
        await supabase.storage.from("rendered-videos").remove(filePaths);
      }

      // Delete the video project (cascade deletes rendered_videos)
      const { error } = await supabase
        .from("video_projects")
        .delete()
        .eq("id", project.id);

      if (error) throw error;

      setDeleteDialogOpen(false);
      onDeleted();
    } catch {
      setIsDeleting(false);
    }
  }

  function handleReEdit() {
    const params = new URLSearchParams({ projectId: project.id });
    router.push(`/new-video?${params.toString()}`);
  }

  if (viewMode === "list") {
    return (
      <>
        <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
          {/* Thumbnail */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={project.product_name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Film className="size-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            <h3 className="truncate font-medium">{project.product_name}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {createdDate}
              </span>
              {project.detected_language && (
                <span className="flex items-center gap-1">
                  <Globe className="size-3" />
                  {project.detected_language}
                </span>
              )}
            </div>
          </div>

          {/* Formats */}
          <div className="flex gap-1.5 shrink-0">
            {completedFormats.map((f) => (
              <Badge key={f} variant="secondary" className="text-xs">
                {FORMAT_LABELS[f] ?? f}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleDownload()}
                disabled={completedVideos.length === 0 || isDownloading}
              >
                <Download className="size-4" />
                {tCommon("download")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReEdit}>
                <Pencil className="size-4" />
                {t("reEdit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" />
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          t={t}
          tCommon={tCommon}
        />
      </>
    );
  }

  // Grid view
  return (
    <>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={project.product_name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Film className="size-10 text-muted-foreground" />
            </div>
          )}

          {/* Actions overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDownload()}
              disabled={completedVideos.length === 0 || isDownloading}
            >
              <Download className="size-4" />
              {tCommon("download")}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleReEdit}>
              <Pencil className="size-4" />
              {t("reEdit")}
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">{project.product_name}</h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {createdDate}
                </span>
                {project.detected_language && (
                  <span className="flex items-center gap-1">
                    <Globe className="size-3" />
                    {project.detected_language}
                  </span>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 shrink-0">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {completedVideos.map((v) => (
                  <DropdownMenuItem
                    key={v.id}
                    onClick={() => handleDownload(v)}
                    disabled={isDownloading}
                  >
                    <Download className="size-4" />
                    {tCommon("download")} ({FORMAT_LABELS[v.format] ?? v.format})
                  </DropdownMenuItem>
                ))}
                {completedVideos.length > 1 && (
                  <DropdownMenuItem
                    onClick={() => handleDownload()}
                    disabled={isDownloading}
                  >
                    <Download className="size-4" />
                    {tCommon("downloadAll")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleReEdit}>
                  <Pencil className="size-4" />
                  {t("reEdit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="size-4" />
                  {t("delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Format badges */}
          {completedFormats.length > 0 && (
            <div className="mt-3 flex gap-1.5">
              {completedFormats.map((f) => (
                <Badge key={f} variant="secondary" className="text-xs">
                  {FORMAT_LABELS[f] ?? f}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        t={t}
        tCommon={tCommon}
      />
    </>
  );
}

function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  t,
  tCommon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  t: ReturnType<typeof useTranslations<"videos">>;
  tCommon: ReturnType<typeof useTranslations<"common">>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("delete")}</DialogTitle>
          <DialogDescription>{t("deleteConfirm")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? tCommon("loading") : tCommon("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
