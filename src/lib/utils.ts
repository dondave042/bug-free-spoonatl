export function money(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "Date TBD"
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatDateTime(iso: string | number) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function rid() {
  return Math.random().toString(36).slice(2, 10);
}

export function bookingId() {
  return "ATL-" + Math.floor(1000 + Math.random() * 9000);
}

export function requestId() {
  return "TR-" + Math.floor(1000 + Math.random() * 9000);
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(file);
  });
}

export const FIELD =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 placeholder:font-medium placeholder:text-slate-400 outline-none focus:border-accent focus:ring-2 focus:ring-orange-100";

export const FIELD_LG =
  "w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-100";