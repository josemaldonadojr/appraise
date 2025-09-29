"use client"

import { useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { searchSuggestions, retrieveLocation } from "@/app/actions/mapbox"

export interface SearchSuggestion {
    mapbox_id: string
    name: string
    name_preferred?: string
    place_formatted?: string
    context?: {
        country?: { name: string }
        region?: { name: string }
        place?: { name: string }
    }
}

export function useMapboxSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const queryClient = useQueryClient()
    const [query, setQuery] = useState(searchParams.get("q") || "")
    const [selectedResult, setSelectedResult] = useState<any>(null)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [sessionToken] = useState(() => crypto.randomUUID())
    const justSelectedRef = useRef(false)

    const updateURL = (newQuery: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (newQuery) {
            params.set("q", newQuery)
        } else {
            params.delete("q")
        }
        const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname
        router.replace(newURL, { scroll: false })
    }

    const handleQueryChange = (newQuery: string) => {
        setQuery(newQuery)
        updateURL(newQuery)
    }

    const {
        data: suggestions = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["mapbox-suggestions", query, sessionToken],
        queryFn: async () => {
            if (!query.trim() || justSelectedRef.current) {
                return []
            }
            const data = await searchSuggestions(query, sessionToken)
            return data.suggestions || []
        },
        enabled: !!query.trim() && !justSelectedRef.current,
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
    })

    const retrieveMutation = useMutation({
        mutationFn: async (mapboxId: string) => {
            return await retrieveLocation(mapboxId, sessionToken)
        },
        onSuccess: (result) => {
            setSelectedResult(result)
        },
        onError: (error) => {
            console.error("Retrieve error:", error)
        },
    })

    const handleSuggestionClick = async (suggestion: SearchSuggestion) => {
        justSelectedRef.current = true
        handleQueryChange(suggestion.name)
        setShowSuggestions(false)

        queryClient.setQueryData(["mapbox-suggestions", suggestion.name, sessionToken], [])

        retrieveMutation.mutate(suggestion.mapbox_id)

        // Reset the flag after a short delay
        setTimeout(() => {
            justSelectedRef.current = false
        }, 100)
    }

    const handleInputFocus = () => {
        if (suggestions.length > 0 && !justSelectedRef.current) {
            setShowSuggestions(true)
        }
    }

    const clearSearch = () => {
        handleQueryChange("")
        setShowSuggestions(false)
        setSelectedResult(null)
        justSelectedRef.current = false
    }

    const shouldShowSuggestions = showSuggestions && suggestions.length > 0 && !error && !justSelectedRef.current

    return {
        query,
        selectedResult,
        showSuggestions,
        suggestions,
        shouldShowSuggestions,
        isLoading,
        isRetrieving: retrieveMutation.isPending,
        searchError: error,
        retrieveError: retrieveMutation.error,
        handleQueryChange,
        handleSuggestionClick,
        handleInputFocus,
        clearSearch,
        setShowSuggestions,
    }
}
