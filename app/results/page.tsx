"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Home, Calendar, MapPin, DollarSign, AlertTriangle, FileText } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

/* eslint-disable @typescript-eslint/no-explicit-any */
type Comp = Record<string, any>;

// Mock data based on the provided JSON
const mockAppraisalData = {
  subject: {
    address: "5756 Westchester Farm Drive, Weldon Spring, Missouri 63304, United States",
    as_of_date: "2025-09-27",
    summary:
      "1-story ranch, 3 bed, 2.5 bath, 2,384 sqft GLA, built 1994, full unfinished basement (2,276 sqft), ~542 sqft garage, 0.46 ac lot, Estates at Westchester Farm #2.",
  },
  reconciliation: {
    final_value_opinion: 520000,
    indicated_range: { low: 505000, high: 540000 },
    reasoning:
      "Only one arm's-length, same-subdivision sale (2016) available. After applying a conservative monthly market factor (0.004) and modest physical adjustments, the indicated value is ~$523k. Given single-sale reliance and model risk around time adjustment, I bracket a ±3% range and conclude slightly below the single-point indicator for conservatism.",
  },
  comps: [
    {
      id: "Comp-2 A943001528 (5759 Westchester Farm Dr)",
      sale_date: "2016-07-20",
      unadjusted_price: 364000,
      adjusted_price: 523256,
      differences: {
        gla_sqft: 29,
        beds_diff: 0,
        baths_full_diff: 0,
        baths_half_diff: -1,
        garage_sqft_diff: -82,
      },
    },
  ],
  risks: [
    "Single usable comparable sale; heightened sensitivity to time-adjustment assumption.",
    "Older sale date (2016) requires substantial market conditions adjustment.",
    "No data on updates/condition beyond quality code; latent condition variance possible.",
    "Basement finish status relies on the provided fields; any finished area would affect value.",
    "Garage sizes based on reported parking area; measurement method differences could exist.",
  ],
}

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const address = searchParams.get("address") || mockAppraisalData.subject.address
  const requestId = searchParams.get("requestId") as Id<"appraisal_requests"> | null

  const appraisalJson = useQuery(
    api.appraisals.api.getAppraisalJson,
    requestId ? { appraisalRequestId: requestId } : "skip"
  )

  const data = appraisalJson || mockAppraisalData

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>
            <Badge variant="secondary" className="font-medium">
              <FileText className="mr-1 h-3 w-3" />
              AI Appraisal Report
            </Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Property Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-serif text-3xl font-light text-foreground sm:text-4xl text-balance leading-tight">
                Property Appraisal Report
              </h1>
              <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-lg">{address}</span>
              </div>
            </div>
              <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Appraised Value</div>
              <div className="font-serif text-3xl font-medium text-foreground">
                ${data.reconciliation.final_value_opinion.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Range: ${data.reconciliation.indicated_range.low.toLocaleString()} - $
                {data.reconciliation.indicated_range.high.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>As of {data.subject.as_of_date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Single Family Residence</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif font-light">Property Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{data.subject.summary}</p>
              </CardContent>
            </Card>

            {/* Comparable Sales */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif font-light">Comparable Sales Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {data.comps.map((comp: Comp, index: number) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">{comp.id}</h4>
                        <Badge variant="outline">Primary Comparable</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Sale Date:</span>
                          <span className="ml-2 font-medium">{comp.sale_date}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Original Price:</span>
                          <span className="ml-2 font-medium">${comp.unadjusted_price.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Adjusted Price:</span>
                          <span className="ml-2 font-medium text-primary">${comp.adjusted_price.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">GLA Difference:</span>
                          <span className="ml-2 font-medium">
                            {comp.differences.gla_sqft > 0 ? "+" : ""}
                            {comp.differences.gla_sqft} sqft
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Valuation Reasoning */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif font-light">Valuation Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{data.reconciliation.reasoning}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Value Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif font-light flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Value Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-serif font-medium text-foreground mb-1">
                    ${data.reconciliation.final_value_opinion.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Final Opinion of Value</div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Low Range:</span>
                    <span className="font-medium">
                      ${data.reconciliation.indicated_range.low.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">High Range:</span>
                    <span className="font-medium">
                      ${data.reconciliation.indicated_range.high.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif font-light flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Considerations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {data.risks.map((risk: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button className="w-full">Download Full Report</Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Share Report
                  </Button>
                  <Button variant="ghost" className="w-full">
                    Request Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  )
}
