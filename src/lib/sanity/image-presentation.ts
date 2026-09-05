export function imagePresentation(style?: string | null) {
  return {
    fit: style === 'contain' || style === 'contain-padded' ? 'contain' : 'cover',
    padded: style === 'contain-padded',
  } as const;
}
