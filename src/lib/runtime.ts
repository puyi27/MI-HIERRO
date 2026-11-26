export function isServerlessRuntime(): boolean {
  return process.env.VERCEL === "1";
}
