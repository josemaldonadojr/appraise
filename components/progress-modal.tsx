"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Home, Search, FileText, Check, CheckCircle } from "lucide-react"
import { cn, statusToStepIndex } from "@/lib/utils"

interface AppraisalProgressModalProps {
  isOpen: boolean
  onClose: () => void
  address?: string
  status?: string
}

type AppraisalStep = {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: "pending" | "active" | "completed"
}

export function AppraisalProgressModal({ isOpen, onClose, address, status }: AppraisalProgressModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const effectiveCurrentStep = status ? statusToStepIndex(status) : currentStep
  const isDone = status === "done"

  const steps: AppraisalStep[] = [
    {
      id: "property-details",
      title: "Analyzing Property Details",
      description: "Gathering comprehensive property information and characteristics",
      icon: Home,
      status: isDone || effectiveCurrentStep > 0 ? "completed" : effectiveCurrentStep === 0 ? "active" : "pending",
    },
    {
      id: "comparable-search",
      title: "Finding Comparable Properties",
      description: "Searching for similar properties in the area for accurate comparison",
      icon: Search,
      status: isDone || effectiveCurrentStep > 1 ? "completed" : effectiveCurrentStep === 1 ? "active" : "pending",
    },
    {
      id: "generating-appraisal",
      title: "Generating Appraisal Report",
      description: "AI is analyzing comparables and calculating property value",
      icon: FileText,
      status: isDone || effectiveCurrentStep > 2 ? "completed" : effectiveCurrentStep === 2 ? "active" : "pending",
    },
    {
      id: "finalizing-report",
      title: "Finalizing Report",
      description: "Preparing your comprehensive appraisal report for delivery",
      icon: CheckCircle,
      status: isDone || effectiveCurrentStep > 3 ? "completed" : effectiveCurrentStep === 3 ? "active" : "pending",
    },
  ]

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      return
    }

    if (status) {
      return
    }

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 3) {
          clearInterval(stepInterval)
          return 3
        }
        return prev + 1
      })
    }, 3000)

    return () => {
      clearInterval(stepInterval)
    }
  }, [isOpen, status])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-background p-0 overflow-hidden">
        <div className="px-8 py-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl font-light text-foreground mb-2">Appraising Your Property</h2>
            {address && <p className="text-sm text-muted-foreground leading-relaxed">{address}</p>}
          </div>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            <div
              className="absolute left-6 top-0 w-px bg-foreground transition-all duration-1000 ease-out"
              style={{
                height: effectiveCurrentStep === 0 ? "0%" :
                  effectiveCurrentStep === 1 ? "33.33%" :
                    effectiveCurrentStep === 2 ? "66.66%" :
                      "100%",
              }}
            />

            <div className="space-y-8">
              {steps.map((step) => {
                const Icon = step.icon
                const isActive = step.status === "active"
                const isCompleted = step.status === "completed"
                const isPending = step.status === "pending"

                return (
                  <div key={step.id} className="relative flex items-start">
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full transition-all duration-300",
                          isCompleted && "bg-foreground",
                          isActive && "bg-background border border-foreground",
                          isPending && "bg-muted",
                        )}
                      >
                        {isCompleted && (
                          <Check className="w-2 h-2 text-background absolute inset-0.5" />
                        )}
                        {isActive && <Icon className="w-2 h-2 text-foreground absolute inset-0.5" />}
                      </div>
                    </div>
                    <div className="ml-6 flex-1 min-w-0">
                      <h3
                        className={cn(
                          "text-base font-medium leading-tight transition-colors duration-300",
                          isCompleted && "text-foreground",
                          isActive && "text-foreground",
                          isPending && "text-muted-foreground",
                        )}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={cn(
                          "text-sm leading-relaxed mt-1 transition-colors duration-300",
                          isCompleted && "text-muted-foreground",
                          isActive && "text-muted-foreground",
                          isPending && "text-muted-foreground/60",
                        )}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border/30">
            <div className="text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                This usually takes 2-5 minutes to complete
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
