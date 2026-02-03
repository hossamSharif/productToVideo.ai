"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Play, Pause, Music, VolumeX } from "lucide-react";
import type { MusicTrack } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MusicPanelProps {
  selectedTrackId: string | null;
  onTrackChange: (trackId: string | null) => void;
}

const MUSIC_TRACKS: MusicTrack[] = [
  { id: "upbeat", name: "Upbeat Energy", duration: 15, url: "/audio/upbeat.mp3" },
  { id: "chill", name: "Chill Vibes", duration: 15, url: "/audio/chill.mp3" },
  { id: "corporate", name: "Corporate Clean", duration: 15, url: "/audio/corporate.mp3" },
  { id: "dramatic", name: "Dramatic Impact", duration: 15, url: "/audio/dramatic.mp3" },
  { id: "minimal", name: "Minimal Beat", duration: 15, url: "/audio/minimal.mp3" },
];

export function MusicPanel({ selectedTrackId, onTrackChange }: MusicPanelProps) {
  const t = useTranslations("editor");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = useCallback(
    (track: MusicTrack) => {
      if (playingTrackId === track.id) {
        audioRef.current?.pause();
        setPlayingTrackId(null);
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(track.url);
      audioRef.current = audio;
      audio.play().catch(() => {
        // Audio playback may fail if file doesn't exist yet
      });
      audio.addEventListener("ended", () => setPlayingTrackId(null));
      setPlayingTrackId(track.id);
    },
    [playingTrackId]
  );

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">{t("customize.music")}</label>

      {/* No Music option */}
      <button
        type="button"
        onClick={() => onTrackChange(null)}
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent ${
          selectedTrackId === null
            ? "border-ring ring-ring/50 ring-[2px]"
            : "border-input"
        }`}
      >
        <VolumeX className="size-5 text-muted-foreground" />
        <span className="text-sm font-medium">{t("customize.noMusic")}</span>
      </button>

      {/* Track list */}
      {MUSIC_TRACKS.map((track) => {
        const isSelected = selectedTrackId === track.id;
        const isPlaying = playingTrackId === track.id;

        return (
          <button
            key={track.id}
            type="button"
            onClick={() => onTrackChange(track.id)}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent ${
              isSelected
                ? "border-ring ring-ring/50 ring-[2px]"
                : "border-input"
            }`}
          >
            <Music className="size-5 text-muted-foreground shrink-0" />
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-sm font-medium">{track.name}</span>
              <Badge variant="secondary" className="w-fit">
                {track.duration}s
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause(track);
              }}
            >
              {isPlaying ? <Pause /> : <Play />}
            </Button>
          </button>
        );
      })}
    </div>
  );
}
