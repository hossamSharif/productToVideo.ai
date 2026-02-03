import { Video } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <Video className="h-6 w-6 text-primary" />
      <span className="text-lg font-bold">
        ProductToVideo<span className="text-primary">.ai</span>
      </span>
    </div>
  );
}
