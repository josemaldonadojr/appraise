# Technical Decisions and Rationale

## Architecture Decisions

### 1. No Convex Workflows
**Decision**: Use standard Convex actions + scheduler instead of @convex-dev/workflow

**Rationale**:
- Our process is short-running (minutes, not months)
- Standard Convex patterns are simpler and more appropriate
- Easier to debug and maintain
- No additional dependencies
- Better error handling per step

**Alternative Considered**: Convex workflows for complex retry logic
**Why Rejected**: Overkill for our use case, adds unnecessary complexity

### 2. CSV Storage Strategy
**Decision**: Extract account numbers only, don't store raw CSV files

**Rationale**:
- Account numbers are the only data we need from CSVs
- Reduces storage costs and complexity
- Simpler data model
- Easier to debug and maintain

**Alternative Considered**: Store complete CSV files
**Why Rejected**: Unnecessary storage overhead, account numbers are sufficient

### 3. Batch-First Approach
**Decision**: Use Firecrawl batch scraping instead of individual property scraping

**Rationale**:
- More efficient API usage
- Better rate limit management
- Cost-effective pricing
- Simpler error handling
- Single point of failure vs multiple

**Alternative Considered**: Individual property scraping
**Why Rejected**: More API calls, harder rate limit management, higher costs

### 4. Immediate Geocoding Response
**Decision**: Return geocoded data immediately, then process nearby properties

**Rationale**:
- Better user experience with immediate feedback
- User can see progress happening
- Allows for early error detection
- Maintains user engagement

**Alternative Considered**: Wait for all processing to complete
**Why Rejected**: Poor user experience, no progress indication

## Data Model Decisions

### 1. Enrichment Status Tracking
**Decision**: Add detailed status tracking to properties table

**Status Values**:
- `pending_csv_download`
- `csv_downloaded`
- `account_number_extracted`
- `scraping_in_progress`
- `enriched`
- `failed`

**Rationale**:
- Enables real-time progress tracking
- Allows for granular error handling
- Supports retry logic
- Provides audit trail

### 2. Separate Appraisal Requests Table
**Decision**: Create dedicated table for tracking overall process

**Rationale**:
- Separates process tracking from property data
- Enables progress monitoring
- Supports batch operation management
- Allows for process-level retry logic

### 3. Enriched Data Object Structure
**Decision**: Store enriched data as structured object in properties table

**Structure**:
```typescript
enrichedData: {
  squareFootage: number,
  bedrooms: number,
  bathrooms: number,
  // ... other fields
}
```

**Rationale**:
- Keeps related data together
- Easy to query and update
- Supports partial enrichment
- Maintains data integrity

## Error Handling Decisions

### 1. Per-Property Error Handling
**Decision**: Allow individual properties to fail without stopping entire process

**Rationale**:
- More resilient to partial failures
- Better user experience
- Allows for targeted retry
- Maintains progress on successful properties

### 2. Retry Strategy
**Decision**: Implement retry logic with exponential backoff

**Retry Rules**:
- CSV downloads: 3 retries with 1s, 2s, 4s delays
- Firecrawl batches: 2 retries with 5s, 10s delays
- Data processing: 1 retry with 2s delay

**Rationale**:
- Handles transient errors
- Prevents overwhelming external APIs
- Balances retry attempts with performance
- Provides reasonable failure recovery

### 3. Error Notification Strategy
**Decision**: Real-time error notifications via Convex subscriptions

**Rationale**:
- Immediate user feedback
- Enables proactive error handling
- Supports retry actions
- Maintains user engagement

## Performance Decisions

### 1. Parallel CSV Downloads
**Decision**: Download CSVs for all properties in parallel

**Rationale**:
- Faster overall processing
- Better resource utilization
- Reduces total processing time
- Maintains user engagement

### 2. Batch Size Limits
**Decision**: Limit batch operations to prevent overwhelming external APIs

**Limits**:
- Max 20 properties per appraisal request
- Max 10 concurrent CSV downloads
- Max 5 concurrent appraisal requests

**Rationale**:
- Prevents rate limit issues
- Maintains system stability
- Provides predictable performance
- Enables proper error handling

### 3. Caching Strategy
**Decision**: No caching of external API responses

**Rationale**:
- Data freshness is important
- External APIs handle caching
- Simpler implementation
- Reduces storage complexity

## Security Decisions

### 1. API Key Management
**Decision**: Store API keys in Convex environment variables

**Rationale**:
- Secure key storage
- Easy key rotation
- No hardcoded secrets
- Follows security best practices

### 2. Data Validation
**Decision**: Validate all external data before storage

**Validation Rules**:
- Account numbers must match expected format
- Enriched data must pass type checking
- URLs must be valid before Firecrawl calls
- Status transitions must be valid

**Rationale**:
- Prevents data corruption
- Maintains data integrity
- Enables proper error handling
- Supports debugging

### 3. Error Information Exposure
**Decision**: Expose detailed error information to users

**Rationale**:
- Enables user self-service
- Supports debugging
- Improves user experience
- Enables targeted retry

## Monitoring Decisions

### 1. Status Tracking
**Decision**: Track detailed status for all operations

**Rationale**:
- Enables real-time monitoring
- Supports debugging
- Provides audit trail
- Enables performance analysis

### 2. Error Logging
**Decision**: Log all errors with context information

**Context Includes**:
- Property ID
- Appraisal request ID
- Error type and message
- Timestamp
- Retry count

**Rationale**:
- Enables debugging
- Supports error analysis
- Provides audit trail
- Enables performance monitoring

### 3. Performance Metrics
**Decision**: Track key performance indicators

**Metrics**:
- Processing time per step
- Success rates per operation
- Error rates by type
- Retry success rates

**Rationale**:
- Enables performance optimization
- Supports capacity planning
- Identifies bottlenecks
- Enables proactive monitoring

## Future Considerations

### 1. Scalability
**Current Design**: Supports moderate load (10-20 concurrent requests)
**Future Needs**: May need to scale to 100+ concurrent requests
**Planned Changes**: Implement queue management and load balancing

### 2. Data Sources
**Current Design**: Single CSV source + Firecrawl
**Future Needs**: Multiple data sources (MLS, public records, etc.)
**Planned Changes**: Abstract data source interface, add source-specific handlers

### 3. Real-time Updates
**Current Design**: Polling-based status updates
**Future Needs**: True real-time updates
**Planned Changes**: Webhook integration, WebSocket support

### 4. Advanced Retry Logic
**Current Design**: Simple exponential backoff
**Future Needs**: More sophisticated retry strategies
**Planned Changes**: Circuit breaker pattern, adaptive retry delays

## Trade-offs Made

### 1. Simplicity vs. Features
**Chosen**: Simplicity
**Trade-off**: Fewer advanced features, easier to maintain
**Rationale**: MVP focus, can add features later

### 2. Performance vs. Reliability
**Chosen**: Reliability
**Trade-off**: Slower processing, more robust error handling
**Rationale**: Data accuracy is critical for appraisals

### 3. User Experience vs. Implementation Complexity
**Chosen**: User Experience
**Trade-off**: More complex implementation, better user experience
**Rationale**: User engagement is critical for adoption

### 4. Storage vs. Processing
**Chosen**: Processing
**Trade-off**: More API calls, less storage
**Rationale**: Fresh data is more important than storage efficiency
