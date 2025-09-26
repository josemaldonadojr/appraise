# Property Enrichment Implementation Checklist

## Phase 1: Foundation Setup

### Database Schema Updates
- [ ] **MAJOR UPDATE**: Completely redesign properties table based on rich Firecrawl data
- [ ] Add all property characteristics fields (bedrooms, bathrooms, sqft, etc.)
- [ ] Add financial data fields (market values, assessed values, etc.)
- [ ] Add location detail fields (subdivision, school district, etc.)
- [ ] Add legal information fields (parcel ID, legal description, etc.)
- [ ] Create `property_value_history` table for 10-year value data
- [ ] Create `property_sales_history` table for sales transactions
- [ ] Create `property_ownership` table for owner information
- [ ] Create `appraisal_requests` table for process tracking
- [ ] Add comprehensive indexes for all new fields
- [ ] Test schema migrations with sample data

### Core Functions - Appraisal Request Management
- [ ] `createAppraisalRequest` mutation
  - [ ] Geocode primary address
  - [ ] Create property record
  - [ ] Create appraisal request record
  - [ ] Return immediate response to user
- [ ] `getAppraisalRequest` query
  - [ ] Fetch appraisal request by ID
  - [ ] Include property details
  - [ ] Include progress information
- [ ] `updateAppraisalRequestStatus` mutation
  - [ ] Update status field
  - [ ] Log status changes
  - [ ] Trigger UI updates

### Core Functions - Property Management
- [ ] `updatePropertyStatus` mutation
  - [ ] Update enrichment status
  - [ ] Validate status transitions
  - [ ] Log changes
- [ ] `getPropertiesByAppraisalRequest` query
  - [ ] Fetch all properties for a request
  - [ ] Include status information
  - [ ] Order by creation time

## Phase 2: CSV Download and Processing

### CSV Download Functions
- [ ] `downloadCSVForProperty` action
  - [ ] Accept property ID
  - [ ] Download CSV from external source
  - [ ] Handle download errors
  - [ ] Update property status
- [ ] `extractAccountNumber` action
  - [ ] Parse CSV data
  - [ ] Extract account number
  - [ ] Validate account number format
  - [ ] Update property record
- [ ] `retryCSVDownload` mutation
  - [ ] Reset property status
  - [ ] Schedule retry
  - [ ] Track retry attempts

### Batch Processing Functions
- [ ] `findNearbyProperties` action
  - [ ] Query Mapbox for nearby addresses
  - [ ] Create property records
  - [ ] Schedule CSV downloads
- [ ] `checkBatchReadiness` mutation
  - [ ] Count ready properties
  - [ ] Schedule next phase if ready
  - [ ] Handle partial failures
- [ ] `scheduleCSVDownloads` action
  - [ ] Get all pending properties
  - [ ] Schedule parallel downloads
  - [ ] Handle rate limiting

## Phase 3: Firecrawl Integration

### URL Building Functions
- [ ] `buildFirecrawlURLs` action
  - [ ] Get properties with account numbers
  - [ ] Build URLs for each property
  - [ ] Validate URL format
  - [ ] Return URL list
- [ ] `validateAccountNumbers` action
  - [ ] Check account number format
  - [ ] Verify URL accessibility
  - [ ] Handle invalid accounts

### Firecrawl Batch Functions
- [ ] `executeFirecrawlBatch` action
  - [ ] Call Firecrawl batch API
  - [ ] Store batch job ID
  - [ ] Handle API errors
  - [ ] Update appraisal request status
- [ ] `processFirecrawlResults` action
  - [ ] Poll for batch completion
  - [ ] Process individual results
  - [ ] Handle partial failures
  - [ ] Update property records
- [ ] `retryFirecrawlBatch` mutation
  - [ ] Reset batch status
  - [ ] Reschedule batch
  - [ ] Handle retry limits

## Phase 4: Data Processing and Storage

### Data Enrichment Functions
- [ ] `processFirecrawlResponse` action
  - [ ] Parse raw Firecrawl JSON response
  - [ ] Extract basic property data
  - [ ] Extract value history data
  - [ ] Extract sales history data
  - [ ] Extract ownership data
  - [ ] Store all data in appropriate tables
- [ ] `extractBasicPropertyData` action
  - [ ] Extract core property characteristics
  - [ ] Validate required fields
  - [ ] Normalize data formats
- [ ] `extractValueHistory` action
  - [ ] Process 10-year value history
  - [ ] Create value history records
  - [ ] Link to property record
- [ ] `extractSalesHistory` action
  - [ ] Process sales transactions
  - [ ] Create sales history records
  - [ ] Link to property record
- [ ] `extractOwnershipData` action
  - [ ] Process current ownership info
  - [ ] Create ownership record
  - [ ] Link to property record
- [ ] `validateEnrichedData` action
  - [ ] Check data completeness
  - [ ] Validate data types
  - [ ] Flag missing fields
  - [ ] Verify data relationships

### Status Management Functions
- [ ] `updatePropertyEnrichmentStatus` mutation
  - [ ] Update individual property status
  - [ ] Check overall progress
  - [ ] Trigger completion checks
- [ ] `markAppraisalRequestComplete` mutation
  - [ ] Verify all properties enriched
  - [ ] Update request status
  - [ ] Set completion timestamp
  - [ ] Trigger notifications

## Phase 5: Error Handling and Retry Logic

### Error Handling Functions
- [ ] `handleCSVDownloadError` action
  - [ ] Log error details
  - [ ] Update property status
  - [ ] Schedule retry if appropriate
  - [ ] Notify user of failure
- [ ] `handleFirecrawlError` action
  - [ ] Log batch error details
  - [ ] Update appraisal request status
  - [ ] Schedule retry if appropriate
  - [ ] Notify user of failure
- [ ] `handleDataProcessingError` action
  - [ ] Log processing error
  - [ ] Mark property as failed
  - [ ] Continue with other properties
  - [ ] Notify user of partial failure

### Retry Logic Functions
- [ ] `scheduleRetry` action
  - [ ] Calculate retry delay
  - [ ] Check retry limits
  - [ ] Schedule retry action
  - [ ] Update retry count
- [ ] `checkRetryLimits` action
  - [ ] Verify retry count
  - [ ] Check time limits
  - [ ] Mark as permanently failed
  - [ ] Notify user

## Phase 6: UI Integration

### Real-time Queries
- [ ] `getAppraisalRequestProgress` query
  - [ ] Real-time status updates
  - [ ] Progress percentage
  - [ ] Error information
  - [ ] Completion status
- [ ] `getPropertyEnrichmentStatus` query
  - [ ] Individual property status
  - [ ] Enriched data preview
  - [ ] Error details
  - [ ] Retry options

### User Actions
- [ ] `retryFailedProperty` mutation
  - [ ] Reset property status
  - [ ] Schedule retry
  - [ ] Update UI
- [ ] `retryEntireRequest` mutation
  - [ ] Reset appraisal request
  - [ ] Reschedule all steps
  - [ ] Clear previous errors
- [ ] `cancelAppraisalRequest` mutation
  - [ ] Stop all processing
  - [ ] Clean up resources
  - [ ] Update status

## Testing Checklist

### Unit Tests
- [ ] Test each individual function
- [ ] Test error conditions
- [ ] Test retry logic
- [ ] Test data validation
- [ ] Test status transitions

### Integration Tests
- [ ] Test complete flow end-to-end
- [ ] Test with various address types
- [ ] Test error recovery
- [ ] Test concurrent requests
- [ ] Test performance limits

### User Acceptance Tests
- [ ] Test with real addresses
- [ ] Test error handling UI
- [ ] Test retry functionality
- [ ] Test progress indicators
- [ ] Test completion notifications

## Performance Monitoring

### Metrics to Track
- [ ] Geocoding response time
- [ ] CSV download success rate
- [ ] Account number extraction accuracy
- [ ] Firecrawl batch completion time
- [ ] Overall enrichment duration
- [ ] Error rates by step
- [ ] Retry success rates

### Alerts to Set Up
- [ ] High error rates
- [ ] Slow response times
- [ ] Failed batch jobs
- [ ] Retry limit exceeded
- [ ] Data quality issues

## Documentation Updates

### API Documentation
- [ ] Document all new functions
- [ ] Add usage examples
- [ ] Document error conditions
- [ ] Add troubleshooting guide

### User Documentation
- [ ] Update user guide
- [ ] Add error handling guide
- [ ] Document retry process
- [ ] Add FAQ section

## Deployment Checklist

### Pre-deployment
- [ ] Run all tests
- [ ] Check performance metrics
- [ ] Verify error handling
- [ ] Test with production data
- [ ] Review security implications

### Post-deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify UI updates
- [ ] Test retry functionality
- [ ] Monitor user feedback
