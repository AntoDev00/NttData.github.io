import { RenderMode, ServerRoute } from '@angular/ssr';

// Configurazione semplificata per evitare problemi di building
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
