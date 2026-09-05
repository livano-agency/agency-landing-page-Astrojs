// Shared by rendering and the migration verification tests.
export function readingTime(body: ReadonlyArray<{ _type: string; children?: ReadonlyArray<{ text?: string }> }> | null | undefined): string {
  const text = (body ?? []).filter((block) => block._type === 'block')
    .flatMap((block) => block.children?.map((span) => span.text ?? '') ?? []).join(' ');
  return `${Math.max(1, Math.ceil((text.trim().match(/\S+/gu)?.length ?? 0) / 200))} min`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(value));
}

export function safeHref(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value || /[\u0000-\u0020\\]/u.test(value)) return undefined;
  if (value.startsWith('#') || (value.startsWith('/') && !value.startsWith('//'))) return value;
  try {
    const url = new URL(value);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? value : undefined;
  } catch {
    return undefined;
  }
}
