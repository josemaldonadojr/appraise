"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Home, MapPin, DollarSign, AlertTriangle, FileText } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

/* eslint-disable @typescript-eslint/no-explicit-any */
type Comp = Record<string, any>;


function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get("requestId") as Id<"appraisal_requests"> | null

  const appraisalJson = useQuery(
    api.appraisals.api.getAppraisalJson,
    requestId ? { appraisalRequestId: requestId } : "skip"
  )

  const hasData = appraisalJson && requestId
  const address = appraisalJson?.subject?.address || "Address not provided"

  if (!hasData) {
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
          <div className="text-center py-16">
            <div className="mx-auto max-w-md">
              <AlertTriangle className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
              <h1 className="font-serif text-2xl font-light text-foreground mb-4">
                Appraisal Not Available
              </h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {requestId 
                  ? "The appraisal data could not be retrieved. This may be because the appraisal is still processing or there was an error."
                  : "No appraisal request was found. Please try searching for a property again."
                }
              </p>
              <div className="space-y-3">
                <Button onClick={() => router.push('/')} className="w-full">
                  Start New Search
                </Button>
                <Button variant="outline" onClick={() => router.back()} className="w-full">
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const data = appraisalJson

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
                        <div className="flex gap-2">
                          <Badge variant="outline">Weight: {(comp.weight * 100).toFixed(0)}%</Badge>
                          {comp.price_per_sqft && (
                            <Badge variant="secondary">${comp.price_per_sqft.toFixed(1)}/sf</Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">Sale Date:</span>
                          <span className="ml-2 font-medium">{comp.sale_date}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Original Price:</span>
                          <span className="ml-2 font-medium">${comp.unadjusted_price.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time Adjustment:</span>
                          <span className="ml-2 font-medium">${comp.time_adjustment.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Net Adjustments:</span>
                          <span className="ml-2 font-medium">${comp.net_adjustment.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Final Adjusted Price:</span>
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

                      {/* Adjustments Detail */}
                      {comp.adjustments && comp.adjustments.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-3 text-sm">Feature Adjustments</h5>
                          <div className="space-y-2">
                            {comp.adjustments.map((adjustment: any, adjIndex: number) => (
                              <div key={adjIndex} className="flex justify-between items-start text-xs bg-muted/30 p-2 rounded">
                                <div className="flex-1">
                                  <span className="font-medium">{adjustment.feature}:</span>
                                  <span className="ml-1 text-muted-foreground">{adjustment.rationale}</span>
                                </div>
                                <span className={`font-medium ml-2 ${adjustment.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {adjustment.amount >= 0 ? '+' : ''}${adjustment.amount.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Valuation Assumptions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif font-light">Valuation Assumptions & Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">Adjustment Rates</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GLA Rate:</span>
                        <span className="font-medium">${data.assumptions.gla_rate_per_sqft}/sqft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bedroom Rate:</span>
                        <span className="font-medium">${data.assumptions.bedroom_rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Full Bath Rate:</span>
                        <span className="font-medium">${data.assumptions.bath_full_rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Half Bath Rate:</span>
                        <span className="font-medium">${data.assumptions.bath_half_rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Garage Rate:</span>
                        <span className="font-medium">${data.assumptions.garage_rate_per_sqft}/sqft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Basement Finished Rate:</span>
                        <span className="font-medium">${data.assumptions.basement_finished_rate}/sqft</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">Market Conditions</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time Adjustment:</span>
                        <span className="font-medium">{(data.assumptions.time_adjustment_monthly_rate * 100).toFixed(2)}%/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lot Method:</span>
                        <span className="font-medium capitalize">{data.assumptions.lot_adjustment_method.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h5 className="font-medium text-sm mb-2">Location Analysis</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {data.assumptions.location_adjustments_note}
                      </p>
                    </div>
                  </div>
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
                    <span className="text-muted-foreground">Weighted Value:</span>
                    <span className="font-medium">
                      ${data.reconciliation.weighted_value.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mean:</span>
                    <span className="font-medium">
                      ${data.reconciliation.central_tendency.mean.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Median:</span>
                    <span className="font-medium">
                      ${data.reconciliation.central_tendency.median.toLocaleString()}
                    </span>
                  </div>
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
