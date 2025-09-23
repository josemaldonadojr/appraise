import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { Signup } from '@/components/signup'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const {
    data: { viewer, numbers },
  } = useSuspenseQuery(convexQuery(api.myFunctions.listNumbers, { count: 10 }))

  const addNumber = useMutation(api.myFunctions.addNumber)

  return (
    <Signup />
  )
}

function ResourceCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <div className="flex flex-col gap-2 bg-slate-200 dark:bg-slate-800 p-4 rounded-md h-28 overflow-auto">
      <a href={href} className="text-sm underline hover:no-underline">
        {title}
      </a>
      <p className="text-xs">{description}</p>
    </div>
  )
}
