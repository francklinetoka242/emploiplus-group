export function readContactSubject(search: string): string {
  const subject = new URLSearchParams(search).get("subject") ?? "";
  return subject.trim();
}
