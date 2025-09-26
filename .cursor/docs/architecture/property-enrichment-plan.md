# Property Enrichment Architecture Plan

## Overview
This document outlines the complete architecture for property enrichment in the Appraise system, from address input to fully enriched property data.

## High-Level Flow
```
User enters address
    ↓
Geocode primary address (immediate feedback)
    ↓
Find nearby addresses (background)
    ↓
Download CSV for each address (parallel)
    ↓
Extract account numbers from CSVs
    ↓
Build URLs for Firecrawl batch scraping
    ↓
Execute Firecrawl batch scrape
    ↓
Process and store enriched data
    ↓
Update UI with results
```

## Detailed Step Breakdown

### Phase 1: Initial Setup and Geocoding

#### Step 1.1: Create Primary Property Record
- **Function**: `createAppraisalRequest`
- **Type**: Mutation
- **Input**: `{ address: string }`
- **Actions**:
  - Geocode the address using existing Mapbox integration
  - Create initial property record in database
  - Set status to "geocoded"
  - Return property ID and basic data to user

#### Step 1.2: Find Nearby Properties
- **Function**: `findNearbyProperties`
- **Type**: Action
- **Input**: `{ propertyId: Id<"properties"> }`
- **Actions**:
  - Query Mapbox for nearby addresses within radius
  - Create property records for each nearby address
  - Set status to "pending_csv_download"
  - Schedule CSV download for each property

### Phase 2: CSV Download and Processing

#### Step 2.1: Download CSV for Single Property
- **Function**: `downloadCSVForProperty`
- **Type**: Action
- **Input**: `{ propertyId: Id<"properties"> }`
- **Actions**:
  - Download CSV file for the property address
  - Store CSV temporarily (or extract account number immediately)
  - Update property status to "csv_downloaded"
  - Trigger account number extraction

#### Step 2.2: Extract Account Number
- **Function**: `extractAccountNumber`
- **Type**: Action
- **Input**: `{ propertyId: Id<"properties">, csvData: string }`
- **Actions**:
  - Parse CSV data
  - Extract account number
  - Update property record with account number
  - Set status to "account_number_extracted"
  - Check if all properties are ready for batch scraping

#### Step 2.3: Check Batch Readiness
- **Function**: `checkBatchReadiness`
- **Type**: Mutation
- **Input**: `{ appraisalRequestId: Id<"appraisal_requests"> }`
- **Actions**:
  - Count properties with status "account_number_extracted"
  - If all properties ready, schedule batch scraping
  - If not ready, wait for more CSV downloads

### Phase 3: Firecrawl Batch Scraping

#### Step 3.1: Build Firecrawl URLs
- **Function**: `buildFirecrawlURLs`
- **Type**: Action
- **Input**: `{ appraisalRequestId: Id<"appraisal_requests"> }`
- **Actions**:
  - Get all properties with account numbers
  - Build URLs for each property using account numbers
  - Prepare batch scrape request
  - Return URL list for Firecrawl

#### Step 3.2: Execute Firecrawl Batch Scrape
- **Function**: `executeFirecrawlBatch`
- **Type**: Action
- **Input**: `{ urls: string[], appraisalRequestId: Id<"appraisal_requests"> }`
- **Actions**:
  - Call Firecrawl batch scrape API
  - Store batch job ID
  - Set appraisal request status to "scraping_in_progress"
  - Return batch job ID

#### Step 3.3: Process Firecrawl Results
- **Function**: `processFirecrawlResults`
- **Type**: Action
- **Input**: `{ batchJobId: string, appraisalRequestId: Id<"appraisal_requests"> }`
- **Actions**:
  - Poll Firecrawl for batch completion
  - Process each property's scraped data
  - Update property records with enriched data
  - Set status to "enriched"
  - Update appraisal request status to "completed"

### Phase 4: Data Storage and UI Updates

#### Step 4.1: Store Enriched Property Data
- **Function**: `storeEnrichedData`
- **Type**: Mutation
- **Input**: `{ propertyId: Id<"properties">, enrichedData: object }`
- **Actions**:
  - Validate enriched data
  - Update property record with all fields
  - Set status to "enriched"
  - Trigger UI update

#### Step 4.2: Update Appraisal Request Status
- **Function**: `updateAppraisalRequestStatus`
- **Type**: Mutation
- **Input**: `{ appraisalRequestId: Id<"appraisal_requests">, status: string }`
- **Actions**:
  - Update appraisal request status
  - Log status change
  - Trigger UI refresh

## Database Schema Updates

### Properties Table
```typescript
// Add to existing properties table
accountNumber: v.optional(v.string()),
enrichmentStatus: v.union(
  v.literal("pending_csv_download"),
  v.literal("csv_downloaded"),
  v.literal("account_number_extracted"),
  v.literal("scraping_in_progress"),
  v.literal("enriched"),
  v.literal("failed")
),
enrichedData: v.optional(v.object({
  squareFootage: v.optional(v.number()),
  bedrooms: v.optional(v.number()),
  bathrooms: v.optional(v.number()),
  // ... other enriched fields
})),
```

### Appraisal Requests Table
```typescript
// New table for tracking the overall process
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
})
```

## Error Handling Strategy

### CSV Download Failures
- Retry up to 3 times with exponential backoff
- Mark individual property as "failed"
- Continue with other properties
- Allow manual retry for failed properties

### Firecrawl Batch Failures
- Retry entire batch up to 2 times
- If batch fails completely, mark appraisal request as "failed"
- Allow manual retry of entire process

### Individual Property Enrichment Failures
- Mark specific property as "failed"
- Continue processing other properties
- Allow individual property retry

## Implementation Order

### Week 1: Foundation
1. Update database schema
2. Create appraisal request management functions
3. Implement CSV download for single property
4. Add account number extraction

### Week 2: Batch Processing
1. Implement nearby property finding
2. Add parallel CSV download orchestration
3. Create batch readiness checking
4. Build Firecrawl URL construction

### Week 3: Firecrawl Integration
1. Implement Firecrawl batch scraping
2. Add result processing
3. Create data storage functions
4. Add error handling and retry logic

### Week 4: UI and Polish
1. Add real-time status updates
2. Implement progress tracking
3. Add error handling UI
4. Create manual retry functionality

## Success Criteria

### Technical
- [ ] All properties can be geocoded successfully
- [ ] CSV downloads work for 95%+ of addresses
- [ ] Account number extraction is 99%+ accurate
- [ ] Firecrawl batch scraping completes successfully
- [ ] Data is stored correctly in database
- [ ] UI updates in real-time

### Performance
- [ ] Initial geocoding response < 2 seconds
- [ ] CSV downloads complete within 5 minutes
- [ ] Full enrichment process completes within 15 minutes
- [ ] System handles 10+ concurrent appraisal requests

### User Experience
- [ ] Clear progress indicators
- [ ] Meaningful error messages
- [ ] Ability to retry failed operations
- [ ] Real-time status updates

## Future Enhancements

### Phase 2 Features
- Webhook integration for real-time updates
- Advanced retry strategies
- Property data validation
- Duplicate detection and merging

### Phase 3 Features
- Workflow management UI
- Batch operation monitoring
- Performance analytics
- Automated quality checks
