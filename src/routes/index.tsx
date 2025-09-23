import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '~/components/SignIn'
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
          <SignIn />
        </Unauthenticated>
        <AuthLoading>
          <div>AuthLoading</div>
        </AuthLoading>
    </>
  )
}