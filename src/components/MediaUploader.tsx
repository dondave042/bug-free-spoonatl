import { useRef, useState } from "react";
import { Image as ImageIcon, Upload, Video, X } from "lucide-react";
import { rid } from "../lib/utils";
import type { MediaItem, MediaType } from "../lib/types";

const MAX_MB = 12;

export function MediaUploader({
  onAdd,
}: {
  onAdd: (items: MediaItem[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const handle = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    const items: MediaItem[] = [];
    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) continue;
      if (file.size > MAX_MB * 1024 * 1024) continue;
      const url = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = () => rej(new Error("read fail"));
        r.readAsDataURL(file);
      });
      items.push({
        id: rid(),
        url,
        type: (isVideo ? "video" : "photo") as MediaType,
        title: file.name,
        source: "upload",
      });
    }
    if (items.length) onAdd(items);
    setBusy(false);
    if (input.current) input.current.value = "";
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        void handle(e.dataTransfer.files);
      }}
      onClick={() => input.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-10 text-center transition ${
        drag
          ? "border-accent bg-orange-50"
          : "border-slate-200 bg-slate-50 hover:border-accent/50"
      }`}
    >
      <input
        ref={input}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => void handle(e.target.files)}
      />
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-accent shadow-sm">
        <Upload className="h-5 w-5" />
      </span>
      <p className="text-sm font-bold text-primary">
        {busy ? "Uploading…" : "Drop single or multiple images/videos here"}
      </p>
      <p className="flex items-center gap-3 text-xs font-medium text-slate-400">
        <span className="flex items-center gap-1">
          <ImageIcon className="h-3.5 w-3.5" /> JPG / PNG
        </span>
        <span className="flex items-center gap-1">
          <Video className="h-3.5 w-3.5" /> MP4 / MOV
        </span>
        <span>max {MAX_MB}MB each</span>
      </p>
      <X className="hidden" />
    </div>
  );
}