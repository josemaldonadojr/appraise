"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Home, Building, MapPin, Calculator, Zap, Brain } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import type { Id } from "@/convex/_generated/dataModel"
import { MapboxSearch } from "@/components/mapbox-search"

export default function HomePage() {
  const router = useRouter()
  const startRequest = useMutation(api.appraisals.api.startRequest)
  const [currentRequestId, setCurrentRequestId] = useState<Id<"appraisal_requests"> | null>(null)
  const statusResult = useQuery(
    api.appraisals.api.getRequestStatus,
    currentRequestId ? { appraisalRequestId: currentRequestId } : "skip"
  )
  const appraisalJson = useQuery(
    api.appraisals.api.getAppraisalJson,
    currentRequestId ? { appraisalRequestId: currentRequestId } : "skip"
  )

  useEffect(() => {
    if (!currentRequestId) return
    if (statusResult?.status === "done" && appraisalJson) {
      router.push(`/results?requestId=${currentRequestId}`)
    }
  }, [currentRequestId, statusResult?.status, appraisalJson, router])

  const handleAddressSelect = async (address: string) => {
    const inputAddress = address.trim()
    if (!inputAddress) return

    try {
      const { appraisalRequestId } = await startRequest({ address: inputAddress })
      setCurrentRequestId(appraisalRequestId)
    } catch (err) {
      console.error(err)
    }
  }



  return (
    <div className="min-h-screen bg-background">
      <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance leading-tight sm:leading-tight lg:leading-tight">
            What <span className="font-medium">St Charles County home</span> do you want to appraise today?
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-relaxed text-pretty">
            Generate professional home appraisals in minutes with AI. Trusted by real estate professionals, lenders, and
            homeowners nationwide.
          </p>

          <div className="mt-12 flex justify-center">
            <div className="w-full max-w-md">
              <MapboxSearch onAddressSelect={handleAddressSelect} />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              View Sample Appraisal Reports
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="font-serif text-3xl font-light text-foreground sm:text-4xl text-balance leading-tight sm:leading-tight">
              AI-powered appraisals for every property type
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
              Our advanced AI analyzes market data, comparable sales, and property features instantly
            </p>
          </div>

          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Home, label: "Single Family Homes", description: "Detached residential properties" },
              { icon: Building, label: "Condominiums", description: "Condos & townhomes" },
              { icon: MapPin, label: "Multi-Family", description: "Duplexes & apartment buildings" },
              { icon: Calculator, label: "Investment Properties", description: "Rental & commercial real estate" },
              { icon: Zap, label: "New Construction", description: "Recently built homes" },
              { icon: Brain, label: "Unique Properties", description: "Custom & specialty homes" },
            ].map((category, index) => (
              <div key={index} className="group cursor-pointer transition-all duration-200 hover:translate-y-[-2px]">
                <div className="flex items-start space-x-5 py-10 px-8 border-b border-border/30 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b lg:[&:nth-child(4)]:border-b-0 lg:[&:nth-child(5)]:border-b-0 lg:[&:nth-child(6)]:border-b-0">
                  <category.icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors leading-relaxed">
                      {category.label}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{category.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-light text-foreground sm:text-4xl text-balance leading-tight">
              Why choose our AI appraisal platform
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto">
              The most advanced home appraisal technology trusted by real estate professionals
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 text-center">
            {[
              { number: "500K+", label: "Homes Appraised" },
              { number: "2,500+", label: "Real Estate Professionals" },
              { number: "98.5%", label: "Accuracy Rate" },
              { number: "5 min", label: "Average Report Time" },
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="font-serif text-2xl font-medium text-foreground sm:text-3xl">{stat.number}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
