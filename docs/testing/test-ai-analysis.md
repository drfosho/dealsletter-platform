# Test AI Analysis Flow

## Test Property Text

Use this text to test the AI analysis:

```
1419 Leavenworth St, San Francisco, CA 94109

12-unit apartment building priced at $3,950,000. Currently has 6 vacant units that need renovation. 
Occupied units rent for $2,100/month average. Market rent after renovation is $3,200/month.
Built in 1925, 8,500 sq ft building on a 3,750 sq ft lot. 
Mix of studio and 1-bedroom units. 
Seller willing to carry 10% for 5 years at 6% interest.
Property taxes $42,000/year, insurance $18,000/year.
Each unit needs $25,000 in renovations.
Located in Nob Hill, walk score 98, near cable car line.
```

## Debug Steps

1. Open browser console (F12)
2. Go to `/admin/properties`
3. Paste the property text above
4. Click "Analyze with AI"
5. Watch console for:
   - "=== PARSED PROPERTY DATA ===" logs
   - Check if all sections are populated
   - "ComprehensiveReviewModal: Received data:" log

## Expected Console Output

```javascript
=== PARSED PROPERTY DATA ===
Strategic Overview: "This 1925-vintage Nob Hill apartment building..."
Value Add Description: "The property's 50% vacancy presents..."
Location Analysis: {overview: "...", walkScore: 98, ...}
Rent Analysis: {currentRentPerUnit: 2100, marketRentPerUnit: 3200, ...}
Property Metrics: {pricePerSqft: 465, pricePerUnit: 329167, ...}
Financing Scenarios: [{name: "Traditional Bank Financing", ...}, ...]
30-Year Projections: {assumptions: {...}, projections: [...]}
```

## Common Issues & Fixes

### Issue 1: No data in modal
- Check console for errors in AI response
- Verify ANTHROPIC_API_KEY is set
- Check if data structure matches expected format

### Issue 2: Some tabs show no data
- AI might not be generating all sections
- Check prompt includes all required sections
- Verify field names match exactly

### Issue 3: Basic info not populated
- Check field mapping in AI response
- Verify price, address, city parsing