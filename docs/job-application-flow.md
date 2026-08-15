# JOB APPLICATION FLOW — TECHNICAL DOCUMENTATION

**Web App:** Emploiplus Group | **Feature:** Apply button workflow | **Analysis Date:** 2026-08-15

---

## 1. APPLY BUTTON — ENTRY POINT

**File:** `src/pages/public/JobOfferDetailPage.tsx` (line 502)
**Condition:** Visible only if job has application channels (email, external link, or WhatsApp)
**On Click:** Routes to `/candidate/jobs/{job.slug}/apply`
**Not Authenticated:** Anonymous users see login/signup links instead
**Button Text:** "Postuler" | **Icon:** Send

---

## 2. NAVIGATION & ROUTE

**Path:** `/candidate/jobs/:slug/apply`
**Component:** `CandidateJobApplyPage` (src/pages/candidate/CandidateJobApplyPage.tsx:379)
**Redirect if Not Authenticated:** Redirects to `/candidate/login`
**Job Data Retrieval:** Via `useJobOfferBySlug(slug)` hook
**Candidate Data Retrieval:** Via `useCandidate()` hook
**Parameters Passed:** Job slug in URL path

---

## 3. FORM SECTIONS — ORDER & CONTENT

| Order | Section | Purpose | Editable | Required |
|-------|---------|---------|----------|----------|
| 1 | Your Information | Display/edit candidate details | Yes | No |
| 2 | Recruiter Message | Add motivation letter | Yes | No |
| 3 | Saved Documents | Select pre-uploaded docs | Yes | Yes (≥1) |
| 4 | Add Documents | Upload new PDF files | Yes | No |
| 5 | Application Summary | Review all data before submit | No | N/A |
| 6 | Consent | Data sharing agreement | Yes | Yes |

---

## 4. FIELD INVENTORY

### Your Information (Editable Form)
- **first_name** (text): Max 255 chars | Prérempli from candidates.first_name
- **last_name** (text): Max 255 chars | Prérempli from candidates.last_name
- **phone** (text): Any format | Prérempli from candidates.phone
- **headline** (text): Professional title | Prérempli from candidates.headline
- **email** (readonly): From candidates.email | Display only

### Recruiter Message
- **emailSubject** (text): Max 200 chars | Optional | Default: empty
- **message** (textarea): Max 2000 chars | Optional | Default: empty
- Character counter: "{X} / 2000 caractères"

### Saved Documents
- **selectedDocuments** (multi-checkbox): Set of document IDs
- Pre-loaded from localStorage (key: `emploiplus-candidate-documents-{candidateId}`)
- Display: Document name, type, date, size
- Mandatory: At least 1 selected

### Add Documents
- **temporaryDocuments** (file upload): PDF only
- Accept: Only MIME type "application/pdf"
- Max size: 2 MB per file
- Input method: Drag-drop or click to browse
- Storage: Client-side temporary state (not persisted)
- Note: "These documents are for this application only"

### Consent
- **consent** (checkbox): Checked/unchecked
- Text: "J'accepte que mes informations personnelles ainsi que les documents..."
- Mandatory: True

---

## 5. CV & DOCUMENTS HANDLING

**CV Mandatory?** NO (documents are mandatory, but not specifically CV)
**Document Format:** PDF only
**Max Size:** 2 MB per file
**Selectable Documents:** User's previously saved documents from localStorage
**Upload for This Application Only:** Yes — temp docs not persisted
**Field Name:** `selectedDocuments` (Set of IDs) + `temporaryDocuments` (File array)
**Validation:** At least 1 document required before submission
**Error Message:** "Veuillez sélectionner ou ajouter au moins un document."

---

## 6. VALIDATION LOGIC

**System:** React state + event handlers (no React Hook Form, no Zod)
**Required Fields:** 
- Application email (job.application_email must exist)
- At least 1 document (selectedDocuments.size > 0 OR temporaryDocuments.length > 0)
- Consent checkbox (consent === true)

**Character Limits Enforced on Change:**
- emailSubject: `.slice(0, 200)` (hard limit)
- message: `.slice(0, 2000)` (hard limit)

**Error Messages:**
- "Veuillez rechercher l'adresse mail dans la description de l'offre" (no email)
- "Veuillez sélectionner ou ajouter au moins un document." (no docs)
- "Veuillez accepter les conditions de confidentialité." (no consent)

---

## 7. SUBMISSION FLOW

**Button Text:** "Envoyer ma candidature" (when idle) or "Envoi en cours..." (when submitting)
**Button Disabled If:** `!isFormValid || isSubmitting`
**Form Valid If:** `submissionChannelAvailable && totalDocuments > 0 && consent`

**Process:**
1. Validate form (3 checks)
2. Get candidate email from auth session or profile
3. Escape HTML in message
4. Read temporary file(s) as Base64
5. Call `applyToJob(candidateId, jobId, message, subject)`
6. Send email via `POST /api/send-email` with:
   - recipient: job.application_email
   - replyTo: candidateEmail
   - subject: emailSubject or default "{job.title}"
   - html: message with escaped HTML + line breaks as `<br/>`
   - attachments: documents (URLs for saved docs, Base64 for temp docs)
7. On success: Redirect to `/candidate/applications`
8. On error: Show error message, stay on form

---

## 8. DATABASE & BACKEND

**Table:** `job_applications` (Supabase)
**Operation:** UPSERT (one candidacy per candidate+job combo)
**Fields Written:**
- candidate_id (UUID)
- job_offer_id (UUID)
- cover_letter (string | null) — the message
- subject (string | null) — email subject
- status (string) — always "submitted"

**Email Service:** `POST /api/send-email`
**Validation Checks:**
- Candidate email exists
- Profile ID exists
- Job ID exists
- Application email not empty

**Duplicate Prevention:** UPSERT with onConflict on (candidate_id, job_offer_id) — updates if exists

---

## 9. AFTER SUBMISSION

**Success State:**
- Message: "Votre candidature a bien été envoyée à {recipientEmail}."
- (Or: "...enregistrée. L'envoi du mail...a échoué" if email fails but DB insert succeeds)
- Auto-redirect to `/candidate/applications` after success
- Candidate can see application in their list

**Error State:**
- Error message displayed in Alert component
- No redirect
- Form state preserved (user can retry or modify)

**No Confirmation Page:** Redirect is automatic to applications list

---

## 10. RULES TO PRESERVE IN MOBILE

1. **Authentication Required:** Non-authenticated users cannot access form
2. **One Application Per Job:** UPSERT logic prevents duplicates
3. **Documents Mandatory:** At least 1 required
4. **Consent Mandatory:** User must explicitly accept data sharing
5. **Email Mandatory:** Job must have application_email configured
6. **Email Sending Optional:** If email API fails, app still creates DB entry
7. **Temporary Docs Not Persisted:** Files for this application only
8. **Character Limits Enforced:** emailSubject (200), message (2000)
9. **PDF Only:** Document format strictly PDF
10. **File Size Limit:** 2 MB max per document

---

## 11. IMPORTANT IMPLEMENTATION DETAILS FOR MOBILE

- **Profile Edition:** User can edit profile info (name, phone, headline) before submitting
- **Profile Save:** Separate "Save" button updates candidates table via updateProfile()
- **Loading States:** Apply page shows skeletons while fetching job/profile
- **Edit Toggle:** Profile edit mode toggled via isEditingProfile state
- **Drag-Drop:** Full drag-drop support for document upload (not click-only)
- **Document Preview:** Saved documents show name, type, date, size with view button
- **HTML Escaping:** Message content escaped to prevent injection (& < > " ')
- **Base64 Attachment:** Temporary documents converted to Base64 for email API
- **URL Attachment:** Saved documents sent as URL references (if doc.url exists)
- **Subject Default:** If no subject entered, defaults to "Nouvelle candidature - {job.title}"

---

## SPECIFICATION FOR MOBILE REPRODUCTION

**1. Route:** `/candidate/jobs/:slug/apply`  
**2. Sections (in order):** Info → Message → Saved Docs → Upload → Summary → Consent → Buttons  
**3. Mandatory Fields:** ≥1 document + consent checkbox  
**4. Editable Fields:** first_name, last_name, phone, headline, emailSubject, message  
**5. Pre-filled From DB:** All profile fields from candidates table  
**6. Validation:** Enforce char limits + at least 1 doc + consent checked + email exists  
**7. Documents:** Checkbox multi-select from localStorage, plus PDF drag-drop upload (max 2MB)  
**8. On Submit:** UPSERT job_applications, send email with attachments, redirect to /applications  
**9. On Error:** Show message, allow retry (form state preserved)  
**10. Prevent:** Double-submit via disabled button during isSubmitting state
