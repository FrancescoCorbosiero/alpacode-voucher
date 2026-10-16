/** Runtime env first (Docker / systemd), then build-time (Vite). */
export function readEnv(key: string): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env?.[key] : undefined;
  const value = fromProcess ?? (import.meta.env as Record<string, string | undefined>)[key];
  return value === "" ? undefined : value;
}
