import { createFileRoute, Outlet } from "@tanstack/react-router";

// Rota de layout: só existe para agrupar /site-survey e /site-survey/$id.
// O conteúdo da lista vive em site-survey.index.tsx.
export const Route = createFileRoute("/site-survey")({
  component: () => <Outlet />,
});
