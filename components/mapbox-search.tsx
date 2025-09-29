"use client"

import { Search, MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMapboxSearch, type SearchSuggestion } from "@/hooks/use-mapbox-search"
import { abbreviateStreet } from "@/lib/address-utils"

interface MapboxSearchProps {
  onAddressSelect?: (address: string) => void
}

export function MapboxSearch({ onAddressSelect }: MapboxSearchProps = {}) {
  const {
    query,
    suggestions,
    shouldShowSuggestions,
    isLoading,
    isRetrieving,
    searchError,
    retrieveError,
    handleQueryChange,
    handleSuggestionClick,
    handleInputFocus,
    clearSearch,
    setShowSuggestions,
  } = useMapboxSearch()

  const formatSuggestionText = (suggestion: SearchSuggestion) => {
    const name = suggestion.name_preferred || suggestion.name
    const formatted = suggestion.place_formatted

    if (formatted) {
      return `${name}, ${formatted}`
    }

    const parts = [name]
    if (suggestion.context?.place?.name) parts.push(suggestion.context.place.name)
    if (suggestion.context?.region?.name) parts.push(suggestion.context.region.name)
    if (suggestion.context?.country?.name) parts.push(suggestion.context.country.name)

    return parts.join(", ")
  }

  const handleCustomSuggestionClick = (suggestion: SearchSuggestion) => {
    const fullText = formatSuggestionText(suggestion)
    const abbreviatedAddress = abbreviateStreet(fullText)

    handleSuggestionClick(suggestion)

    if (onAddressSelect) {
      onAddressSelect(abbreviatedAddress)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
          <Input
            type="text"
            placeholder="Enter a property address..."
            value={query}
            onChange={(e) => {
              handleQueryChange(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={handleInputFocus}
            className="pl-14 pr-14 py-5 text-lg rounded-2xl border-border/30 bg-background shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-200 focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
          />
          {(isLoading || isRetrieving) && (
            <Loader2 className="absolute right-5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6 animate-spin" />
          )}
        </div>

        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full hover:bg-muted/50 transition-colors text-lg"
            onClick={clearSearch}
          >
            ×
          </Button>
        )}

        {(searchError || retrieveError) && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-background rounded-2xl border border-destructive/20 shadow-lg">
            <div className="p-4">
              <p className="text-sm text-destructive leading-relaxed">
                {searchError
                  ? "Failed to search. Please check if MAPBOX_ACCESS_TOKEN is configured."
                  : "Failed to get location details."}
              </p>
            </div>
          </div>
        )}

        {shouldShowSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-background rounded-2xl border border-border/30 shadow-2xl max-h-80 overflow-y-auto">
            <div className="p-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion.mapbox_id}
                  variant="ghost"
                  className="w-full justify-start p-5 h-auto text-left hover:bg-muted/50 rounded-xl transition-all duration-200 hover:translate-y-[-1px] hover:shadow-sm"
                  onClick={() => handleCustomSuggestionClick(suggestion)}
                >
                  <MapPin className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
                  <span className="text-sm leading-relaxed text-foreground">{formatSuggestionText(suggestion)}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
