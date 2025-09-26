# Updated Schema Design Based on Firecrawl Data

## Analysis of Firecrawl Output

The Firecrawl data is incredibly rich and includes:

### Core Property Data
- Basic info: bedrooms, bathrooms, square footage, year built
- Physical characteristics: lot size, exterior walls, architectural type
- Location data: address, city, zip, subdivision, school district
- Legal data: parcel ID, legal description, neighborhood code

### Financial Data
- Market values by year (10-year history)
- Assessed values by year
- Land value, residential value, commercial value
- Sales history with prices and dates

### Ownership Data
- Current owner information
- Mailing address
- Previous owners (from sales history)

## Updated Schema Design

### Properties Table (Geocoding + All Firecrawl Data)
```typescript
properties: defineTable({
  // Existing geocoding fields (source of truth for coordinates)
  line1: v.union(v.string(), v.null()),
  fullAddress: v.string(),
  city: v.union(v.string(), v.null()),
  state: v.union(v.string(), v.null()),
  postalCode: v.union(v.string(), v.null()),
  countryCode: v.union(v.string(), v.null()),
  longitude: v.union(v.number(), v.null()),
  latitude: v.union(v.number(), v.null()),
  
  // Enrichment tracking
  enrichmentStatus: v.union(
    v.literal("pending_csv_download"),
    v.literal("csv_downloaded"),
    v.literal("account_number_extracted"),
    v.literal("scraping_in_progress"),
    v.literal("enriched"),
    v.literal("failed")
  ),
  accountNumber: v.optional(v.string()),
  
  // All Firecrawl property data (no duplication with geocoding)
  bedrooms: v.optional(v.number()),
  lotSize: v.optional(v.string()),
  bathrooms: v.optional(v.number()),
  halfBathrooms: v.optional(v.number()),
  parcelId: v.optional(v.string()),
  asOfDate: v.optional(v.string()),
  fireplaces: v.optional(v.number()),
  ownerName: v.optional(v.string()),
  yearBuilt: v.optional(v.number()),
  subdivision: v.optional(v.string()),
  totalRooms: v.optional(v.number()),
  qualityCode: v.optional(v.string()),
  fireDistrict: v.optional(v.string()),
  propertyType: v.optional(v.string()),
  baseAreaSqft: v.optional(v.number()),
  exteriorWalls: v.optional(v.string()),
  landValueUsd: v.optional(v.number()),
  schoolDistrict: v.optional(v.string()),
  totalAreaSqft: v.optional(v.number()),
  legalDescription: v.optional(v.string()),
  neighborhoodCode: v.optional(v.string()),
  parkingAreaSqft: v.optional(v.number()),
  architecturalType: v.optional(v.string()),
  basementAreaSqft: v.optional(v.number()),
  commercialValueUsd: v.optional(v.number()),
  agricultureValueUsd: v.optional(v.number()),
  residentialValueUsd: v.optional(v.number()),
  totalMarketValueUsd: v.optional(v.number()),
  finishedBasementAreaSqft: v.optional(v.number()),
  
  // Owner mailing address (from Firecrawl)
  ownerMailingStreet: v.optional(v.string()),
  ownerMailingCity: v.optional(v.string()),
  ownerMailingState: v.optional(v.string()),
  ownerMailingZip: v.optional(v.string()),
  
  // Data freshness
  enrichedAt: v.optional(v.number()),
  
  // Metadata
  appraisalRequestId: v.optional(v.id("appraisal_requests")),
  isPrimaryProperty: v.optional(v.boolean()),
})
  .index("byFullAddress", ["fullAddress"])
  .index("byCity", ["city"])
  .index("byCoordinates", ["longitude", "latitude"])
  .index("byEnrichmentStatus", ["enrichmentStatus"])
  .index("byAppraisalRequest", ["appraisalRequestId"])
  .index("byAccountNumber", ["accountNumber"])
  .index("byPropertyType", ["propertyType"])
  .index("byYearBuilt", ["yearBuilt"])
  .index("bySubdivision", ["subdivision"])
  .index("bySchoolDistrict", ["schoolDistrict"]);
```

### New Tables

#### Appraisal Requests (Process Tracking)
```typescript
appraisal_requests: defineTable({
  primaryPropertyId: v.id("properties"),
  status: v.union(
    v.literal("geocoded"),
    v.literal("csv_downloading"),
    v.literal("scraping_in_progress"),
    v.literal("completed"),
    v.literal("failed")
  ),
  totalProperties: v.number(),
  completedProperties: v.number(),
  firecrawlBatchId: v.optional(v.string()),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
  requestedBy: v.optional(v.id("users")),
  notes: v.optional(v.string()),
})
  .index("byStatus", ["status"])
  .index("byRequestedBy", ["requestedBy"])
  .index("byCreatedAt", ["createdAt"]);
```

#### Property Value History (Optional - for detailed analysis)
```typescript
property_value_history: defineTable({
  propertyId: v.id("properties"),
  taxYear: v.number(),
  marketValueUsd: v.number(),
  assessedValueUsd: v.number(),
  landValueUsd: v.optional(v.number()),
  residentialValueUsd: v.optional(v.number()),
  commercialValueUsd: v.optional(v.number()),
  agricultureValueUsd: v.optional(v.number()),
})
  .index("byProperty", ["propertyId"])
  .index("byTaxYear", ["taxYear"])
  .index("byPropertyAndYear", ["propertyId", "taxYear"]);
```

#### Property Sales History (Optional - for comparable analysis)
```typescript
property_sales_history: defineTable({
  propertyId: v.id("properties"),
  saleDate: v.string(),
  salePriceUsd: v.number(),
  unitPriceSqftUsd: v.optional(v.number()),
  adjustedSalePriceUsd: v.optional(v.number()),
  previousOwner: v.optional(v.string()),
  bookYearPageDoc: v.optional(v.string()),
})
  .index("byProperty", ["propertyId"])
  .index("bySaleDate", ["saleDate"])
  .index("byPropertyAndDate", ["propertyId", "saleDate"]);
```


## Data Processing Strategy

### 1. Raw Data Storage
Store the complete Firecrawl response for future reference and debugging:
```typescript
rawFirecrawlData: v.optional(v.any()),
```

### 2. Complete Data Extraction
Extract all Firecrawl fields to the main properties table:
- All property characteristics (bedrooms, bathrooms, sqft, year built, etc.)
- All financial data (market values, assessed values, land value, etc.)
- All location details (subdivision, school district, fire district, etc.)
- All legal information (parcel ID, legal description, etc.)
- Owner information and mailing address

### 3. Complex Nested Data Storage
Store complex nested data as arrays in the properties table:
- Sales history as `salesHistory` array
- 10-year value history as `tenYearValueHistory` array

### 4. Data Access Patterns
- **All queries**: Use structured fields in properties table
- **Complex analysis**: Query nested arrays when needed
- **No separate tables needed**: Everything in one place
- **Fast queries**: All data indexed and accessible

## Updated Implementation Plan

### Phase 1: Complete Schema Updates
1. Update properties table with all Firecrawl fields
2. Create appraisal_requests table for process tracking
3. Add comprehensive indexes for all fields
4. Create migration scripts

### Phase 2: Complete Data Processing
1. `processFirecrawlResponse()` - Main orchestrator
2. `extractAllPropertyData()` - Extract all Firecrawl fields
3. `extractNestedData()` - Extract sales and value history arrays
4. `validateAllData()` - Validate all fields

### Phase 3: Advanced Query Functions
1. `getPropertiesBySubdivision()` - Query by subdivision
2. `getPropertiesBySchoolDistrict()` - Query by school district
3. `getPropertiesByValueRange()` - Query by value range
4. `getComparableProperties()` - Find similar properties

## Benefits of This Approach

### 1. Complete Data Model
- All Firecrawl data in structured fields
- No data duplication with geocoding
- Rich property information available
- Easy to query any property characteristic

### 2. Single Table Design
- Everything in one properties table
- No complex joins needed
- Fast queries on all data
- Simple to understand and maintain

### 3. Performance Optimized
- Indexed fields for common queries
- Nested arrays for complex data
- No unnecessary table relationships
- Scalable architecture

### 4. Appraisal-Ready
- All data needed for comparable analysis
- Historical value and sales data
- Neighborhood and subdivision data
- Complete property characteristics

## Considerations

### 1. Data Volume
- All Firecrawl data stored in structured fields
- Nested arrays for sales and value history
- Monitor storage usage as data grows
- Consider data archival strategies for old records

### 2. Data Freshness
- Track when data was last updated
- Handle partial updates gracefully
- Manage data staleness with timestamps

### 3. Performance
- All fields indexed for fast queries
- Nested array queries may be slower
- Consider caching for frequently accessed data
- Pagination for large result sets

### 4. Data Quality
- Validate all Firecrawl fields
- Error handling for malformed data
- Graceful degradation for missing fields
- Data type consistency across all fields

## Next Steps

1. **Update properties table** with all Firecrawl fields
2. **Create appraisal_requests table** for process tracking
3. **Implement complete data extraction** functions
4. **Add validation logic** for all fields
5. **Update UI** to display rich property data
6. **Add query functions** for all property characteristics
7. **Add indexes** for performance optimization
8. **Test with real Firecrawl data** to ensure everything works

This comprehensive schema design captures all the rich Firecrawl data while avoiding duplication with geocoding data, providing a complete foundation for appraisal workflows.
