# Property Flow Test Guide

## Test Steps

### 1. Test AI Property Analysis
1. Go to http://localhost:3000/admin/properties
2. Paste the following test property text:

```
Amazing investment opportunity in Austin, TX! 4523 Oak Ridge Drive, Austin, TX 78745. 
This 3-bedroom, 2-bathroom single-family home is priced at $425,000 with just 20% down ($85,000).
Currently renting for $2,800/month with potential to increase to $3,200. Built in 1985, 
1,650 sq ft on a 7,200 sq ft lot. Features include updated kitchen, new HVAC system, 
excellent schools nearby, and strong rental demand. Perfect BRRRR opportunity with 
ARV of $525,000 after $40,000 in renovations. Pro forma cap rate of 7.2% and 
cash-on-cash return of 15.8%. Located in rapidly appreciating neighborhood with 
tech companies moving in. Property taxes $6,800/year, insurance $1,200/year.
```

3. Click "Analyze with AI"
4. Verify the AI extracts all data correctly
5. Review the populated fields in the modal

### 2. Test Image Upload
1. In the review modal, scroll to "Property Images"
2. Click or drag to upload 1-3 property images
3. Verify images upload successfully
4. Check that image paths are displayed

### 3. Save Property
1. Review all fields are populated
2. Click "Save Property"
3. Verify success message

### 4. Verify Admin Display
1. Check the property appears in the admin list
2. Verify the property card shows:
   - Uploaded image (not placeholder)
   - Correct title and location
   - Financial metrics
   - Features

### 5. Verify Dashboard Display
1. Go to http://localhost:3000/dashboard
2. Find the newly added property
3. Verify:
   - Image displays correctly
   - All metrics show properly
   - "View Details" opens modal with full data

## Expected Results

✅ AI analysis populates all fields including:
- Market analysis with comparables
- Multiple investment scenarios
- 5-year projections
- Exit strategies
- Detailed expenses

✅ Images upload and display on:
- Admin property cards
- Dashboard property cards
- Detail modals

✅ Property data matches between admin and dashboard

## Common Issues

1. **Images not showing**: Check browser console for 404 errors
2. **Missing data**: Verify AI response includes all sections
3. **Property not appearing**: Check isDraft is false and status is 'active'