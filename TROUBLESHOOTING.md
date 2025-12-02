# Troubleshooting Guide

## Issue: "Failed to mark error as resolved"

If you're getting this error when clicking "Mark Resolved", here are the steps to fix it:

### Step 1: Verify the `Fixed` field exists in Airtable

1. Go to your Airtable table: https://airtable.com/appMM5UgZo7YtQDrq/tblnJr1q53jEiSUoJ/viwKZbsNV3k735YzU
2. Check if you have a field named **`Fixed`** (exact name, case-sensitive)
3. The field should be a **Checkbox** type (boolean: TRUE/FALSE)

### Step 2: Create the `Fixed` field if it doesn't exist

1. In Airtable, click the "+" button to add a new field
2. Name it exactly: **`Fixed`**
3. Set the field type to **"Checkbox"**
4. Save the field

### Step 3: Check browser console for detailed errors

1. Open your browser's Developer Tools (F12 or right-click → Inspect)
2. Go to the "Console" tab
3. Try marking an error as resolved again
4. Look for error messages starting with `[Airtable]` or `[Frontend]`
5. These will show exactly what's failing

### Step 4: Check server logs

1. Look at your terminal where `npm run dev` is running
2. You should see detailed logs showing:
   - The error ID being used
   - The Airtable record ID
   - The fields being updated
   - Any error responses from Airtable

### Common Issues:

1. **Field doesn't exist**: The `Fixed` field must exist in your Airtable table
2. **Wrong field type**: The `Fixed` field must be a Checkbox (boolean), not text
3. **Field name mismatch**: The field must be named exactly `Fixed` (not `fixed`, `FIXED`, or `Fixed?`)
4. **API permissions**: Make sure your Airtable API token has write permissions

### Testing the Fix:

After creating the `Fixed` field:
1. Restart your dev server: `npm run dev`
2. Try marking an error as resolved
3. Check your Airtable table - the `Fixed` field should now be set to `TRUE`
4. The error should disappear from the Errors page and appear in the Fixed Errors page

