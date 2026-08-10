import { useRef, useState } from 'react';
import { CloudUpload, Film, ImageIcon, Loader2, X } from 'lucide-react';
import { useStore } from '../lib/store';
import type { MediaItem } from '../lib/types';

const MAX_FILE_MB = 2.5;

export default function MediaUploader({ compact = false }: { compact?: boolean }) {
  const { addMedia, notify } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handle = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    const items: MediaItem[] = [];
    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');
      if (!isVideo && !isImage) {
        notify(`${file.name}: only images and videos are supported`, 'error');
        continue;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        notify(`${file.name} is over ${MAX_FILE_MB}MB — skipped (standalone demo storage)`, 'error');
        continue;
      }
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
        items.push({
          id: `up-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          url: dataUrl,
          type: isVideo ? 'video' : 'photo',
          title: file.name.replace(/\.[^.]+$/, ''),
          source: 'upload',
        });
      } catch {
        notify(`Failed to read ${file.name}`, 'error');
      }
    }
    if (items.length > 0) {
      addMedia(items);
      notify(`${items.length} file${items.length !== 1 ? 's' : ''} uploaded by Admin`);
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handle(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition ${
        dragOver
          ? 'border-accent bg-orange-50 shadow-md'
          : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
      } ${compact ? 'px-4 py-6' : 'px-6 py-12'}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
      {busy ? (
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      ) : (
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <CloudUpload className="h-7 w-7" />
        </span>
      )}
      <p className="text-sm font-bold text-primary">
        {busy ? 'Uploading…' : 'Drop single or multiple images/videos here'}
      </p>
      <p className="flex items-center gap-3 text-xs font-medium text-slate-400">
        <span className="flex items-center gap-1">
          <ImageIcon className="h-3.5 w-3.5" /> JPG / PNG
        </span>
        <span className="flex items-center gap-1">
          <Film className="h-3.5 w-3.5" /> MP4 / MOV
        </span>
        <span>max {MAX_FILE_MB}MB each</span>
      </p>
      {compact && <X className="hidden" />}
    </div>
  );
}
