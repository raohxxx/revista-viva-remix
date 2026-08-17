import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/resumen" });
  },
  component: () => null,
});
