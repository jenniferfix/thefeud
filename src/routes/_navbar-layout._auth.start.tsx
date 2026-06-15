import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_navbar-layout/_auth/start')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_navbar-layout/_auth/start"!</div>
}
