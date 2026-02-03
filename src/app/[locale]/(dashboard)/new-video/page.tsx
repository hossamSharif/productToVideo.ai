"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight, Download, Plus } from "lucide-react";
import Image from "next/image";

import { useVideoProject, type VideoStep } from "@/hooks/use-video-project";
import { useRenderStatus } from "@/hooks/use-render-status";
import { createClient } from "@/lib/supabase/client";
import type { Template, VideoFormat, VideoProject } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TextPanel } from "@/components/editor/text-panel";
import { ColorsPanel } from "@/components/editor/colors-panel";
import { ImagesPanel } from "@/components/editor/images-panel";
import { MusicPanel } from "@/components/editor/music-panel";
import { LanguagePanel } from "@/components/editor/language-panel";
import { VideoPreview } from "@/components/editor/video-preview";

const TEMPLATES: Template[] = [
  { id: "MinimalLuxury", name: "Minimal Luxury", description: "Elegant, minimal aesthetic with smooth transitions", thumbnail: "/templates/minimal-luxury.jpg" },
  { id: "BoldSale", name: "Bold Sale", description: "High-energy, sale-focused with bold typography", thumbnail: "/templates/bold-sale.jpg" },
  { id: "ProductShowcase", name: "Product Showcase", description: "Clean, product-focused with feature highlights", thumbnail: "/templates/product-showcase.jpg" },
  { id: "StorySwipe", name: "Story Swipe", description: "Story/Reel style with swipe card transitions", thumbnail: "/templates/story-swipe.jpg" },
  { id: "CleanModern", name: "Clean Modern", description: "Modern, balanced layout with staggered animations", thumbnail: "/templates/clean-modern.jpg" },
];

const FORMAT_OPTIONS: { value: VideoFormat; label: string; desc: string }[] = [
  { value: "9:16", label: "9:16", desc: "Stories / Reels / TikTok" },
  { value: "1:1", label: "1:1", desc: "Feed Posts" },
  { value: "16:9", label: "16:9", desc: "YouTube / Web" },
];

const STEP_ORDER: VideoStep[] = ["url-input", "data-review", "template-select", "editor", "render"];

export default function NewVideoPage() {
  const t = useTranslations("editor");
  const tCommon = useTranslations("common");
  const project = useVideoProject();
  const searchParams = useSearchParams();
  const [renderIds] = useState<string[]>([]);
  const { renders, isComplete, overallProgress } = useRenderStatus(renderIds);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);

  // Load existing project for re-editing
  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (!projectId || projectId === loadedProjectId) return;

    async function loadProject() {
      const supabase = createClient();
      const { data } = await supabase
        .from("video_projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (data) {
        project.loadFromProject(data as VideoProject);
        setLoadedProjectId(projectId);
      }
    }

    loadProject();
  }, [searchParams, loadedProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const stepIndex = STEP_ORDER.indexOf(project.step);

  function canGoBack() {
    return stepIndex > 0 && project.step !== "render";
  }

  function goBack() {
    if (canGoBack()) {
      project.goToStep(STEP_ORDER[stepIndex - 1]);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {canGoBack() && (
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="size-4" />
            {tCommon("back")}
          </Button>
        )}
        <div className="flex gap-1 ml-auto">
          {STEP_ORDER.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i <= stepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error display */}
      {project.error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          {project.error}
        </div>
      )}

      {/* Step 1: URL Input */}
      {project.step === "url-input" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("urlInput.title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder={t("urlInput.placeholder")}
              value={project.url}
              onChange={(e) => project.setUrl(e.target.value)}
              disabled={project.isExtracting}
            />
            <Button
              onClick={() => project.extractProduct()}
              disabled={!project.url || project.isExtracting}
            >
              {project.isExtracting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {t("urlInput.extracting")}
                </>
              ) : (
                t("urlInput.submit")
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Data Review */}
      {project.step === "data-review" && project.productData && (
        <Card>
          <CardHeader>
            <CardTitle>{t("dataReview.title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("dataReview.name")}</label>
                <p className="text-lg font-semibold">{project.productData.name}</p>
              </div>
              {project.productData.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("dataReview.description")}</label>
                  <p className="text-sm">{project.productData.description}</p>
                </div>
              )}
              <div className="flex gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("dataReview.price")}</label>
                  <p className="text-lg font-semibold">
                    {project.productData.currency} {project.productData.price}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("dataReview.language")}</label>
                  <p className="text-sm">{project.productData.language}</p>
                </div>
              </div>
              {project.productData.images.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("dataReview.images")}</label>
                  <div className="mt-2 flex gap-2 overflow-x-auto">
                    {project.productData.images.slice(0, 5).map((img, i) => (
                      <Image
                        key={i}
                        src={img}
                        alt={`Product ${i + 1}`}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-md object-cover border"
                        unoptimized
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={() => project.generateScript()}
              disabled={project.isGeneratingScript}
            >
              {project.isGeneratingScript ? (
                <>
                  <Loader2 className="animate-spin" />
                  {t("dataReview.generating")}
                </>
              ) : (
                t("dataReview.generateScript")
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Template Selection */}
      {project.step === "template-select" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">{t("templateSelect.title")}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((tmpl) => (
              <Card
                key={tmpl.id}
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => project.selectTemplate(tmpl.id)}
              >
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="aspect-[9/16] w-full rounded-md bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    {tmpl.name}
                  </div>
                  <div>
                    <h3 className="font-semibold">{tmpl.name}</h3>
                    <p className="text-sm text-muted-foreground">{tmpl.description}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {t("templateSelect.select")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Editor / Customize */}
      {project.step === "editor" && project.script && project.productData && project.templateId && (
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold">{t("customize.title")}</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
            {/* Preview */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-medium">{t("customize.preview")}</h3>
              <div className="rounded-lg border bg-card p-4">
                <VideoPreview
                  templateId={project.templateId}
                  productData={project.productData}
                  script={project.script}
                  colors={project.colors}
                  musicTrackId={project.musicTrackId}
                  language={project.language}
                />
              </div>
            </div>

            {/* Editor panels */}
            <div className="flex flex-col gap-4">
              <Tabs defaultValue="text">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="text">{t("customize.text")}</TabsTrigger>
                  <TabsTrigger value="colors">{t("customize.colors")}</TabsTrigger>
                  <TabsTrigger value="images">{t("customize.images")}</TabsTrigger>
                  <TabsTrigger value="music">{t("customize.music")}</TabsTrigger>
                  <TabsTrigger value="language">{t("customize.language")}</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                  <TextPanel
                    script={project.script}
                    onScriptChange={project.updateScript}
                    onRegenerate={() => project.generateScript()}
                    isRegenerating={project.isGeneratingScript}
                  />
                </TabsContent>
                <TabsContent value="colors" className="mt-4">
                  <ColorsPanel
                    colors={project.colors}
                    onColorsChange={project.updateColors}
                  />
                </TabsContent>
                <TabsContent value="images" className="mt-4">
                  <ImagesPanel
                    images={project.productData.images}
                    onImagesChange={() => {}}
                  />
                </TabsContent>
                <TabsContent value="music" className="mt-4">
                  <MusicPanel
                    selectedTrackId={project.musicTrackId}
                    onTrackChange={project.setMusicTrack}
                  />
                </TabsContent>
                <TabsContent value="language" className="mt-4">
                  <LanguagePanel
                    language={project.language}
                    onLanguageChange={project.setLanguage}
                  />
                </TabsContent>
              </Tabs>

              {/* Proceed to render */}
              <Button
                className="mt-4"
                onClick={() => project.goToStep("render")}
              >
                {t("render.title")}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Render / Export */}
      {project.step === "render" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("render.title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Format selection */}
            {renderIds.length === 0 && (
              <>
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium">{t("render.selectFormats")}</label>
                  <div className="flex gap-3">
                    {FORMAT_OPTIONS.map((fmt) => {
                      const isSelected = project.selectedFormats.includes(fmt.value);
                      return (
                        <button
                          key={fmt.value}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              project.setFormats(project.selectedFormats.filter((f) => f !== fmt.value));
                            } else {
                              project.setFormats([...project.selectedFormats, fmt.value]);
                            }
                          }}
                          className={`flex flex-col items-center gap-1 rounded-lg border px-6 py-4 transition-colors hover:bg-accent ${
                            isSelected ? "border-ring ring-ring/50 ring-[2px]" : "border-input"
                          }`}
                        >
                          <span className="text-lg font-bold">{fmt.label}</span>
                          <span className="text-xs text-muted-foreground">{fmt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    await project.startRender();
                    // In a real implementation, the render IDs would come from the API response
                    // For now this is a placeholder
                  }}
                  disabled={project.selectedFormats.length === 0}
                >
                  {t("render.startRender")}
                </Button>
              </>
            )}

            {/* Render progress */}
            {renderIds.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("render.rendering")}</span>
                    <span>{t("render.progress", { percent: Math.round(overallProgress) })}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>

                {isComplete && (
                  <div className="flex flex-col gap-3">
                    <p className="text-lg font-semibold text-center">
                      {t("render.complete")}
                    </p>
                    <div className="flex gap-3 justify-center">
                      {Array.from(renders.values())
                        .filter((r) => r.status === "complete" && r.downloadUrl)
                        .map((r) => (
                          <Button key={r.id} variant="outline" asChild>
                            <a href={r.downloadUrl} download>
                              <Download className="size-4" />
                              {r.id}
                            </a>
                          </Button>
                        ))}
                    </div>
                    <Button variant="outline" onClick={project.reset}>
                      <Plus className="size-4" />
                      {t("render.generateAnother")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
