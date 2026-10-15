# YogyaSetu (योग्यसेतु) — Bulk Scheme Import Format Specification

This document defines the standardized JSON format used to bulk-import 500+ government welfare schemes into the YogyaSetu platform via `prisma/import-schemes.ts`.

---

## File Location
All batch JSON files should be placed inside:
```
data/schemes/*.json
```
The importer automatically scans and loads all `.json` files in `data/schemes/` (including subdirectories). Each file may contain either:
- A single scheme object `{ ... }`, OR
- An array of scheme objects `[ { ... }, { ... } ]`

---

## Schema & Field Definitions

| Field Name | Type | Required | Description & Rules |
| :--- | :--- | :---: | :--- |
| `slug` | `string` | **Yes** | Unique identifier (e.g., `"mahadbt-post-matric-sc"`, `"pm-surya-ghar"`). Used as the upsert key. |
| `level` | `string` | **Yes** | `"CENTRAL"` for national schemes or `"STATE"` for state-specific schemes. |
| `state` | `string \| null` | Conditional | `"Maharashtra"` for state schemes, or `null` for All-India Central schemes. |
| `category` | `string` | **Yes** | One of the 12 canonical category slugs or recognizable names (see Category Mapping below). |
| `title_en` | `string` | **Yes** | Official scheme title in English. |
| `title_hi` | `string` | **Yes** | Official scheme title in authentic Devanagari Hindi (not Latin transliteration). |
| `description_en` | `string` | **Yes** | Detailed overview and purpose of the scheme in English. |
| `description_hi` | `string` | **Yes** | Detailed overview and purpose of the scheme in Hindi. |
| `benefits_en` | `string \| string[]` | **Yes** | Quantifiable and descriptive benefits in English. |
| `benefits_hi` | `string \| string[]` | **Yes** | Quantifiable and descriptive benefits in Hindi. |
| `eligibility_en` | `object \| string` | **Yes** | Eligibility criteria rules. Can be an object (`{ minAge, maxAge, gender, maxIncome, categories, education, occupations }`) or text. |
| `eligibility_hi` | `object \| string` | **Yes** | Eligibility criteria rules in Hindi. |
| `documents_en` | `string[] \| string` | **Yes** | List of required application documents in English. |
| `documents_hi` | `string[] \| string` | **Yes** | List of required application documents in Hindi. |
| `steps_en` | `object[] \| string[]` | **Yes** | Step-by-step application walkthrough in English (`[{ step: 1, title: "...", desc: "..." }]`). |
| `steps_hi` | `object[] \| string[]` | **Yes** | Step-by-step application walkthrough in Hindi. |
| `applyUrl` | `string` | **Yes** | Direct official application portal link (must be a valid `*.gov.in` or state portal URL). |
| `sourceUrl` | `string` | **Yes** | Official gazette, notification, or guideline reference URL (`*.gov.in` or `*.maharashtra.gov.in`). |
| `lastVerified` | `string` | **Yes** | ISO-8601 date string of when the scheme details were verified (e.g. `"2026-10-16"`). |

---

## 12 Canonical Categories

| Category Slug | English Label | Hindi Label | Typical Schemes |
| :--- | :--- | :--- | :--- |
| `students` | Students & Youth | छात्र एवं युवा | Post-matric, pre-matric, merit scholarships, coaching subsidies |
| `farmers` | Farmers & Agriculture | किसान एवं कृषि | PM-KISAN, crop insurance, drip irrigation, solar pumps, farm mechanization |
| `women` | Women & Child | महिला एवं बाल विकास | Majhi Ladki Bahin, PMMVY, maternity support, SHG livelihood |
| `senior-citizens` | Senior Citizens | वरिष्ठ नागरिक | Old-age pensions, Shravanbal, Vayoshri, assisted living devices |
| `divyangjan` | Disabled Persons | दिव्यांगजन | ADIP assistive equipment, disability pensions, UDID, concessional loans |
| `hostels` | Government Hostels | शासकीय वसतिगृह | Vasatigruh maintenance allowance, Swadhar, residential hostels, KGBV |
| `mahadbt` | Maha DBT | महाडीबीटी योजना | All scholarship and farmer direct benefit transfers via Maha DBT portal |
| `health` | Health & Wellness | स्वास्थ्य एवं परिवार कल्याण | MJPJAY, Ayushman Bharat, generic medicine centers, child screening |
| `housing` | Housing & Shelter | आवास एवं आश्रय | PMAY-G, PMAY-U, Ramai Awas, Shabari Gharkul, rooftop solar |
| `employment` | Employment | रोजगार एवं उपजीविका | MGNREGA, CMYKPY internship, PMEGP, MUDRA, micro-enterprise loans |
| `skills` | Skill Development | कौशल विकास | PMKVY, NAPS, NATS, ITI training, vocational certifications |
| `minority` | Minority Welfare | अल्पसंख्यक कल्याण | Post-matric scholarships, Maulana Azad fellowships, minority soft loans |

---

## Example Scheme JSON Record

```json
{
  "slug": "mahadbt-post-matric-sc",
  "level": "STATE",
  "state": "Maharashtra",
  "category": "mahadbt",
  "title_en": "Government of India Post-Matric Scholarship for SC Students (Maharashtra Maha DBT)",
  "title_hi": "भारत सरकार अनुसूचित जाती मॅट्रिकोत्तर शिष्यवृत्ती योजना (महाडीबीटी)",
  "description_en": "Centrally sponsored scholarship implemented via Maha DBT portal providing full tuition, exam fees, and maintenance allowances for SC students in Class 11 through post-graduate courses.",
  "description_hi": "महाराष्ट्र महाडीबीटी पोर्टलद्वारे राबविण्यात येणारी केंद्र पुरस्कृत मॅट्रिकोत्तर शिष्यवृत्ती योजना, ज्यामध्ये अनुसूचित जातीच्या विद्यार्थ्यांना इयत्ता 11 वी पासून उच्च शिक्षणापर्यंत पूर्ण शिक्षण शुल्क, परीक्षा शुल्क आणि निर्वाह भत्ता दिला जातो.",
  "benefits_en": "100% Tuition & Exam Fee reimbursement + Up to ₹1,200/month Maintenance Allowance",
  "benefits_hi": "100% शिक्षण आणि परीक्षा शुल्क प्रतिपूर्ती + वसतिगृह विद्यार्थ्यांसाठी दरमहा ₹1,200 निर्वाह भत्ता",
  "eligibility_en": {
    "minAge": 15,
    "maxAge": 35,
    "gender": "All",
    "maxIncome": 250000,
    "states": ["Maharashtra"],
    "categories": ["SC"],
    "education": ["10th Pass", "12th Pass", "Graduate", "Post Graduate"]
  },
  "eligibility_hi": {
    "minAge": 15,
    "maxAge": 35,
    "gender": "All",
    "maxIncome": 250000,
    "states": ["Maharashtra"],
    "categories": ["SC"],
    "education": ["10th Pass", "12th Pass", "Graduate", "Post Graduate"]
  },
  "documents_en": [
    "Aadhaar Card",
    "Caste Certificate issued by Maharashtra Competent Authority",
    "Income Certificate issued by Tahsildar (Family Income ≤ ₹2.50 Lakh)",
    "Previous Academic Year Marksheet",
    "Current Year College Admission Fee Receipt"
  ],
  "documents_hi": [
    "आधार कार्ड",
    "सक्षम प्राधिकरणाने दिलेला अनुसूचित जातीचा दाखला",
    "तहसीलदारांचा उत्पन्न दाखला (कौटुंबिक उत्पन्न ₹2.50 लाखांपर्यंत)",
    "मागील वर्षाची गुणपत्रिका",
    "महाविद्यालयीन प्रवेश शुल्क पावती"
  ],
  "steps_en": [
    { "step": 1, "title": "Maha DBT Registration", "desc": "Register on mahadbt.maharashtra.gov.in using Aadhaar authentication." },
    { "step": 2, "title": "Select Scheme", "desc": "Choose Social Justice & Special Assistance Department and select SC Post-Matric Scholarship." },
    { "step": 3, "title": "Submit Application", "desc": "Upload required caste, income, and academic certificates and submit for institute scrutiny." }
  ],
  "steps_hi": [
    { "step": 1, "title": "महाडीबीटी नोंदणी", "desc": "mahadbt.maharashtra.gov.in वर आधार प्रमाणीकरणासह नोंदणी करा." },
    { "step": 2, "title": "योजना निवडा", "desc": "सामाजिक न्याय विभागांतर्गत अनुसूचित जाती मॅट्रिकोत्तर शिष्यवृत्ती योजना निवडा." },
    { "step": 3, "title": "कागदपत्रे जोडून सबमिट करा", "desc": "जात व उत्पन्न दाखला अपलोड करून महाविद्यालयीन पडताळणीसाठी अर्ज सबमिट करा." }
  ],
  "applyUrl": "https://mahadbt.maharashtra.gov.in",
  "sourceUrl": "https://sjsa.maharashtra.gov.in",
  "lastVerified": "2026-10-16T00:00:00.000Z"
}
```
