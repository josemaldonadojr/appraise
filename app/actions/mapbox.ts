"use server"

interface SearchSuggestion {
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

interface SearchResult {
    suggestions: SearchSuggestion[]
    attribution: string
    response_id: string
}

export async function searchSuggestions(query: string, sessionToken: string) {
    const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN
    if (!MAPBOX_ACCESS_TOKEN) {
        throw new Error("Mapbox access token not configured")
    }

    if (!query.trim()) {
        return { suggestions: [] }
    }

    try {
        const url =
            `https://api.mapbox.com/search/searchbox/v1/suggest?` +
            new URLSearchParams({
                q: query,
                access_token: MAPBOX_ACCESS_TOKEN,
                session_token: sessionToken,
                limit: "5",
                language: "en",
            })


        const response = await fetch(url)


        if (!response.ok) {
            await response.text()
            throw new Error(`Search failed: ${response.statusText}`)
        }

        const data: SearchResult = await response.json()
        return data
    } catch {
        throw new Error("Failed to search suggestions")
    }
}

export async function retrieveLocation(mapboxId: string, sessionToken: string) {
    const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN

    if (!MAPBOX_ACCESS_TOKEN) {
        throw new Error("Mapbox access token not configured")
    }

    try {
        const response = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?` +
            new URLSearchParams({
                access_token: MAPBOX_ACCESS_TOKEN,
                session_token: sessionToken,
            }),
        )

        if (!response.ok) {
            throw new Error(`Retrieve failed: ${response.statusText}`)
        }

        const data = await response.json()
        return data.features[0]
    } catch {
        throw new Error("Failed to retrieve location details")
    }
}
