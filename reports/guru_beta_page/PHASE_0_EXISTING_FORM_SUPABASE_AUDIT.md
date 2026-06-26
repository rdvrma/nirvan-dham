# PHASE 0: Existing Form & Supabase Audit

## Audit Target
- Page: /nirvan-shakti-snan-sadhna
- Components: NirvanShaktiSnanPage.tsx, EntryQuestionsForm.tsx
- API Route: /api/shakti-snan/apply/route.ts

## Findings
1. **Frontend Pattern**: The form uses controlled React state to capture fields and makes a POST request to the API route with JSON body. UI states include 'idle', 'sending', 'success', and 'error'.
2. **Backend Validation**: The API route verifies required fields, cleanses data, and checks rate limits (isRateLimited).
3. **Email Notification**: Uses nodemailer to send an email to the admin with all details before inserting into Supabase.
4. **Supabase Insert**: The data is inserted into a specific table named \shakti_snan_applications\. The schema is highly specific to the Shakti Snan program (e.g., expecting an \nswers\ array of 9 questions).

## Conclusion for Guru Beta Seva
We can perfectly reuse the frontend state pattern, rate limiting, nodemailer notifications, and general API structure. However, because the new form has completely different fields (16 specific fields), we CANNOT reuse the \shakti_snan_applications\ table. We must create a new table \guru_beta_applications\.
