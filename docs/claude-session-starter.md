# Claude Code Session Starter

## ALWAYS START NEW SESSIONS WITH THIS:

"Before we work on anything DealsLetter related, please read and acknowledge the docs/property-addition-protocol.md file to understand the requirements for adding properties consistently."

## For Property Addition Sessions:
"I need to add properties to the dashboard. Follow the complete protocol in docs/property-addition-protocol.md exactly. Include ALL financial details, strategies, and market analysis provided in the source material."

## Session Commands for Consistency:

### 1. Starting a Property Addition Session:
```
Please read docs/property-addition-protocol.md and confirm you understand the complete property addition requirements. I will be adding [X number] properties to the dashboard.
```

### 2. Adding a Single Property:
```
Add this property to staticDeals.ts following the complete protocol in docs/property-addition-protocol.md. Include ALL information from the analysis - no summaries or N/A values.

[Paste property analysis here]
```

### 3. Batch Property Addition:
```
I have multiple properties to add. For each one:
1. Read the complete analysis
2. Extract ALL information per the protocol
3. Add to staticDeals.ts with complete data
4. Verify against the quality checklist

[Paste all property analyses]
```

### 4. Property Update Request:
```
Update property ID [X] in staticDeals.ts with this new information, maintaining all existing data completeness per the protocol:

[Paste updates]
```

### 5. Quality Check Request:
```
Review property ID [X] in staticDeals.ts against the quality control checklist in docs/property-addition-protocol.md. Report any missing information.
```

## CRITICAL REMINDERS:

### ✅ ALWAYS INCLUDE:
- Every dollar amount mentioned
- Every percentage or ratio
- Every strategy described
- Every timeline given
- Every risk identified
- Every opportunity listed
- Every exit strategy
- Every market factor

### ❌ NEVER DO:
- Summarize details away
- Mark data as "N/A" if it was provided
- Skip minor strategies or opportunities
- Round numbers unnecessarily
- Omit risks or concerns
- Simplify complex scenarios
- Use Supabase for property additions
- Miss any UI/formatting requirements

## File Locations:
- **Protocol:** `/docs/property-addition-protocol.md`
- **Properties:** `/src/lib/staticDeals.ts`
- **UI Components:** `/src/components/`
- **Dashboard:** `/src/app/dashboard/`

## Testing After Addition:
```bash
npm run dev
# Navigate to http://localhost:3000/dashboard
# Verify all property data displays correctly
# Check all tabs and sections for completeness
```

## Common Issues to Avoid:
1. **Missing 30-year projections** - Include full projections array with all years
2. **Incomplete financing scenarios** - Include all loan options with full details
3. **N/A values** - Never use N/A for provided data
4. **Summarized strategies** - Include every strategy mentioned, even briefly
5. **Missing risk factors** - Include all risks with ❌ format
6. **Incomplete rehab details** - Itemize all renovation costs
7. **Missing market comps** - Include all comparable properties mentioned
8. **Truncated descriptions** - Include full strategic overview text

## Final Verification:
Before completing any property addition, ask yourself:
"If someone read ONLY the dashboard card, would they have ALL the information from the original analysis?"

If the answer is no, the property is incomplete.