"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface RenderStatus {
  id: string;
  status: string;
  progress: number;
  downloadUrl?: string;
  fileSize?: number;
  error?: string;
}

const POLL_INTERVAL_MS = 2000;

const TERMINAL_STATUSES = new Set(["complete", "failed"]);

export function useRenderStatus(renderIds: string[]) {
  const [renders, setRenders] = useState<Map<string, RenderStatus>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async (id: string): Promise<RenderStatus> => {
    try {
      const response = await fetch(`/api/render-video/${id}/status`);
      if (!response.ok) {
        throw new Error(`Status fetch failed (${response.status})`);
      }
      const data = await response.json();
      return {
        id,
        status: data.status ?? "queued",
        progress: data.progress ?? 0,
        downloadUrl: data.downloadUrl,
        fileSize: data.fileSize,
        error: data.error,
      };
    } catch {
      return {
        id,
        status: "failed",
        progress: 0,
        error: "Failed to fetch render status",
      };
    }
  }, []);

  useEffect(() => {
    if (renderIds.length === 0) {
      return;
    }

    async function pollAll() {
      const results = await Promise.all(renderIds.map(fetchStatus));
      setRenders((prev) => {
        const next = new Map(prev);
        for (const result of results) {
          next.set(result.id, result);
        }
        return next;
      });

      const allTerminal = results.every((r) =>
        TERMINAL_STATUSES.has(r.status)
      );
      if (allTerminal && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    pollAll();
    intervalRef.current = setInterval(pollAll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [renderIds, fetchStatus]);

  const isComplete =
    renderIds.length > 0 &&
    renderIds.every((id) => {
      const render = renders.get(id);
      return render ? TERMINAL_STATUSES.has(render.status) : false;
    });

  const overallProgress =
    renderIds.length === 0
      ? 0
      : renderIds.reduce((sum, id) => {
          const render = renders.get(id);
          return sum + (render?.progress ?? 0);
        }, 0) / renderIds.length;

  return {
    renders,
    isComplete,
    overallProgress,
  };
}
