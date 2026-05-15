function parseAdminEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

export function isAdminEmail(email: string): boolean {
  return parseAdminEmails(process.env.ADMIN_EMAILS).includes(email.toLowerCase());
}
