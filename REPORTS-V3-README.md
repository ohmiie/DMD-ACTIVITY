# DMD ACTIVITY — Reporting V3 (2026-10-09)

Based on the working V2 code and Vercel AJV build fix. Preserves `package.json` Node 22.x and AJV dependency pins.

## Added
- Admin: report overview with breakdown by four activity categories and in/out of curriculum, with filters, printable report, CSV, record editing.
- Admin: individual student report with approved hours broken down by activity category and inside/outside curriculum; individual history.
- Admin: **รายงานอาจารย์**: teacher directory with created activity count, record count, student participation, approved student-hours, drilldown and CSV.
- Teacher: **รายงานกิจกรรม** and a separate **รายงานรายบุคคล** sidebar entry. Student reports are limited to students whose records are supervised by the current teacher.
- All reports: legacy records with missing categories displayed as **ยังไม่ระบุ**, with fallback to parent activity metadata when available.
- Approved-only totals; pending/rejected records remain visible in detail. Within/outside curriculum may be checked simultaneously, and those categories overlap rather than adding to a unique total.

## Deployment
Upload **only `src/App.js`** to the existing GitHub repository. The full ZIP is a full project copy; do not upload it as a nested folder to GitHub. No Firestore migrations are required. Keep the existing `package.json` as-is from AJV fix.

## Verification
Static JSX parse passed; source transpiles with TypeScript JSX, and pure reporting checks passed. A complete `npm run build` was not run in this environment because npm package installation timed out. The live Vercel deployment and Firestore connectivity still need testing.

## Security caveat
The existing application's admin password is embedded in frontend JavaScript, and the client loads all profiles, activities and records. Hiding entries in the UI is not server-side access control. Use Firebase Authentication and restrictive Firestore Security Rules before using sensitive student data at scale.
