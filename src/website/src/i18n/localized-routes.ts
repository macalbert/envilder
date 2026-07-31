export const localizedRoutes = {
  '/': ['en', 'ca', 'es'],
  '/docs/': ['en', 'ca', 'es'],
  '/changelog/': ['en'],
} as const satisfies Record<string, readonly string[]>;
