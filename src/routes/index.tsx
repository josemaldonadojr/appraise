import { createFileRoute } from '@tanstack/react-router'
import { Signup } from '@/components/signup'
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
} from "convex/react";

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <>
        <Authenticated>
          <div>Authenticated</div>
        </Authenticated>
        <Unauthenticated>
          <Signup />
        </Unauthenticated>
        <AuthLoading>
          <div>AuthLoading</div>
        </AuthLoading>
    </>
  )
}