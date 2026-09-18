type Messages = Record<string, unknown>;

function getNestedValue(obj: Messages, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

export async function getT(locale: string, namespace: string) {
  const messages = (await import(`@/messages/${locale}.json`)).default as Messages;
  const ns = messages[namespace] as Messages ?? {};
  return (key: string) => getNestedValue(ns, key);
}
