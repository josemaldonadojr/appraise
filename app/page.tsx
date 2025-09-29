"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Home,
  Building,
  MapPin,
  Calculator,
  Zap,
  Brain,
  Search,
  X,
  ChevronDown,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import type { Id } from "@/convex/_generated/dataModel"

export default function HomePage() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [originalAddress, setOriginalAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [loadingStateIndex, setLoadingStateIndex] = useState(0)
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

  const statusCopy: Record<string, string> = useMemo(() => ({
    running: "Initializing your appraisal...",
    "address-start": "Verifying the property address...",
    "lookup-start": "Finding comparable properties nearby...",
    "scrape-start": "Analyzing property details and market data...",
    "appraise-start": "Generating your appraisal report...",
    done: "Appraisal complete!",
    failed: "We encountered an issue while preparing your report.",
  }), [])

  useEffect(() => {
    if (!currentRequestId) return
    if (statusResult?.status === "done" && appraisalJson) {
      router.push(`/results?requestId=${currentRequestId}&address=${encodeURIComponent(originalAddress)}`)
    }
  }, [currentRequestId, statusResult?.status, appraisalJson, router, originalAddress])

  // Update search input text when status changes
  useEffect(() => {
    if (isLoading && currentRequestId) {
      setSearchValue(getCurrentStatusText())
    }
  }, [statusResult?.status, isLoading, currentRequestId])

  const loadingStates = [
    "Starting your appraisal...",
    "Verifying property details...",
    "Finding comparable sales...",
    "Generating your report...",
  ]

  // Use friendly status copy when we have real status, fall back to loading states
  const getCurrentStatusText = () => {
    if (statusResult?.status && statusCopy[statusResult.status]) {
      return statusCopy[statusResult.status]
    }
    return loadingStates[loadingStateIndex]
  }

  const handleSearch = async () => {
    if (!searchValue.trim()) return
    setShowLoginModal(true)
  }

  const handleLoginAndProceed = async () => {
    setShowLoginModal(false)
    const inputAddress = searchValue.trim()
    if (!inputAddress) return

    setOriginalAddress(inputAddress)
    setIsLoading(true)
    setLoadingStateIndex(0)
    setSearchValue(getCurrentStatusText())

    let stateInterval: NodeJS.Timeout | null = null
    try {
      const startPromise = startRequest({ address: inputAddress })

      stateInterval = setInterval(() => {
        setLoadingStateIndex((prev) => {
          if (prev < loadingStates.length - 1) {
            const nextIndex = prev + 1
            setSearchValue(getCurrentStatusText())
            return nextIndex
          }
          return prev
        })
      }, 1200)

      const { appraisalRequestId } = await startPromise
      setCurrentRequestId(appraisalRequestId)

      // Keep the user on this page; show friendly status copy below the input
      // Redirection handled by the effect when complete
    } catch (err) {
      if (stateInterval) clearInterval(stateInterval)
      setIsLoading(false)
      setSearchValue(originalAddress)
      console.error(err)
      // Optionally surface a toast here
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-background rounded-2xl border shadow-2xl">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="p-8 pt-12">
              <div className="text-center mb-8">
                <h3 className="font-serif text-2xl font-light text-foreground mb-3">Sign in to continue</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access professional appraisal reports for St Charles County properties
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleLoginAndProceed}
                  className="w-full py-3 text-base font-medium rounded-full bg-primary hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
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
              <div
                className={`relative bg-background border rounded-2xl shadow-sm transition-all duration-300 ${isSearchFocused || showSharePanel
                  ? "border-primary shadow-lg scale-105"
                  : "border-border hover:shadow-md"
                  } ${showSharePanel ? "rounded-b-xl" : ""}`}
              >
                {/* Search Input */}
                <div className="relative">
                  {isLoading ? (
                    <div className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                  ) : (
                    <Search
                      className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-200 ${isSearchFocused ? "text-primary" : "text-muted-foreground"
                        }`}
                    />
                  )}
                  {!isLoading && (
                    <button
                      onClick={() => setShowSharePanel(!showSharePanel)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/50 transition-all duration-200"
                    >
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground hover:text-primary transition-all duration-200 ${showSharePanel ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                  )}
                  <input
                    type="text"
                    placeholder="Enter property address..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="w-full bg-transparent py-4 pl-12 pr-12 text-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl"
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                </div>
              </div>
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

      {/* Appraisal Categories Section */}
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

      {/* Trust Indicators Section */}
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
