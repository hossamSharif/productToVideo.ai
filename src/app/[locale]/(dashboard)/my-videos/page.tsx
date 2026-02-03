"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { Plus, Search, Grid3X3, List, ArrowUpDown } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoCard } from "@/components/dashboard/video-card";
import { createClient } from "@/lib/supabase/client";
import type { VideoProject, RenderedVideo } from "@/types";

type SortOption = "date" | "name";
type ViewMode = "grid" | "list";
type ProjectWithVideos = VideoProject & { rendered_videos: RenderedVideo[] };

export default function MyVideosPage() {
  const t = useTranslations("videos");

  const [search, setSearch] = useQueryState("q", { defaultValue: "" });
  const [sort, setSort] = useQueryState("sort", { defaultValue: "date" });
  const [view, setView] = useQueryState("view", { defaultValue: "grid" });

  const [projects, setProjects] = useState<ProjectWithVideos[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sortOption = (sort === "name" ? "name" : "date") as SortOption;
  const viewMode = (view === "list" ? "list" : "grid") as ViewMode;

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data: videoProjects, error } = await supabase
        .from("video_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!videoProjects || videoProjects.length === 0) {
        setProjects([]);
        return;
      }

      const projectIds = videoProjects.map((p) => p.id);
      const { data: renderedVideos } = await supabase
        .from("rendered_videos")
        .select("*")
        .in("project_id", projectIds);

      const videosMap = new Map<string, RenderedVideo[]>();
      for (const rv of renderedVideos ?? []) {
        const list = videosMap.get(rv.project_id) ?? [];
        list.push(rv as RenderedVideo);
        videosMap.set(rv.project_id, list);
      }

      const combined: ProjectWithVideos[] = videoProjects.map((p) => ({
        ...(p as VideoProject),
        rendered_videos: videosMap.get(p.id) ?? [],
      }));

      setProjects(combined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter and sort
  const filtered = projects.filter((p) => {
    if (!search) return true;
    return p.product_name.toLowerCase().includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "name") {
      return a.product_name.localeCompare(b.product_name);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Button asChild>
          <Link href="/new-video">
            <Plus className="size-4" />
            {t("createFirst")}
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      {projects.length > 0 && (
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value || null)}
              className="ps-9"
            />
          </div>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="size-4" />
                {sortOption === "date" ? t("sortByDate") : t("sortByName")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSort("date")}>
                {t("sortByDate")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("name")}>
                {t("sortByName")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-e-none"
              onClick={() => setView("grid")}
            >
              <Grid3X3 className="size-4" />
              <span className="sr-only">{t("gridView")}</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-s-none"
              onClick={() => setView("list")}
            >
              <List className="size-4" />
              <span className="sr-only">{t("listView")}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          : "flex flex-col gap-3"
        }>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className={viewMode === "grid" ? "aspect-[4/3] rounded-lg" : "h-20 rounded-lg"}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16">
          <div className="text-center">
            <h2 className="text-lg font-semibold">{t("empty")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("emptyDesc")}</p>
          </div>
          <Button asChild>
            <Link href="/new-video">
              <Plus className="size-4" />
              {t("createFirst")}
            </Link>
          </Button>
        </div>
      )}

      {/* No search results */}
      {!isLoading && projects.length > 0 && sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <Search className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">{t("searchPlaceholder")}</p>
        </div>
      )}

      {/* Video grid/list */}
      {!isLoading && sorted.length > 0 && (
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          : "flex flex-col gap-3"
        }>
          {sorted.map((project) => (
            <VideoCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              onDeleted={fetchProjects}
            />
          ))}
        </div>
      )}
    </div>
  );
}
