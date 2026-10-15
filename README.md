# YogyaSetu (योग्यसेतु)
> **"Aapke Liye Sahi Yojana, Ab Ek Hi Jagah."**  
> An Indian Government Schemes & Scholarships Citizen Portal

YogyaSetu is a full-stack, production-ready digital bridge connecting Indian citizens to central and state government welfare schemes, scholarships, and DBT initiatives. Built with an Indian tricolor-inspired aesthetic (Saffron `#FF9933`, Ashoka Chakra Navy Blue `#0B3D91`, and Green `#138808`), full bilingual support (English & हिन्दी), an AI & rules-based weighted eligibility engine, and an authoritative information layer that directs citizens directly to official government portals (`*.gov.in` / `*.nic.in`).

---

## 🏛️ Key Features

1. **Home Gateway**:
   - Hero search box with instant text search, state dropdown (all 28 states + 8 Union Territories), and category selector.
   - Quick-access category tiles (Students, Farmers, Women & Child, Senior Citizens, Divyangjan/PwD, Employment, Housing, Health).
   - Live statistics counter and 3-step transparent walkthrough.

2. **Dedicated Scholarships Hub (`/scholarships`)**:
   - Curated portal for National Scholarship Portal (NSP), PM YASASVI, Central Sector Schemes, Pragati & Saksham for girls, and post-matric aids.
   - Filter presets for Pre-Matric, Post-Matric, Higher Education, Merit-cum-Means, and Reserved categories.

3. **AI & Rules-Based Eligibility Checker (`/eligibility`)**:
   - 7-step wizard: Age → State → Gender → Occupation → Family Income → Social Category → Education Level.
   - Multi-factor weighted scoring engine evaluating criteria against income ceilings, age brackets, geographic notifications, and affirmative quotas.
   - Animated evaluation state with match score percentages (e.g. 98% Match, 85% Match) and qualifying reasons breakdown.

4. **Scheme Discovery & Real-Time Filtering (`/schemes`)**:
   - Live multi-filter sidebar combining State (all 28 states + 8 UTs), Category, Gender, Social Category, Occupation, and Benefit Type.
   - Live autocomplete suggestions, pagination, and sorting (Most Popular, Recently Added, Alphabetical).

5. **Authoritative Scheme Details (`/schemes/[id]`)**:
   - Comprehensive breakdowns: Overview, Benefits, Structured Eligibility Checklist, Required Documents Checklist, and Step-by-Step Application Guide.
   - Prominent **"Apply on Official Portal"** button strictly linking to official government websites (e.g. `pmkisan.gov.in`, `scholarships.gov.in`, `pmjay.gov.in`).
   - Save / Bookmark schemes and share via link.

6. **Citizen Dashboard (`/dashboard`)**:
   - Personalized AI recommendations dynamically recalibrated whenever the citizen updates their profile.
   - Saved / Bookmarked schemes list.
   - Self-managed Application Tracker (status: Applied, In Progress, Approved, Rejected) with notes and direct portal links.
   - In-app notification center for scheme matches and updates.
   - Profile management for demographic criteria.

7. **Role-Protected Admin & Verification Portal (`/admin`)**:
   - Access restricted to `ADMIN` and `VERIFIED_OFFICER` roles.
   - Scheme management with verification lifecycle: `DRAFT` → `VERIFIED` → `PUBLISHED` → `CLOSED`.
   - Add, edit, and delete schemes with structured eligibility JSON and document checklists.
   - Citizen user management (search, role promotion, deactivation).
   - Analytics dashboard (schemes count, views, categories, user signups).
   - 1-click CSV export of all schemes and registered citizens.

8. **Production-Grade Real OTP Authentication (`/login`, `/register`)**:
   - **Email OTP via Gmail SMTP (Nodemailer)**:
     - 6-digit cryptographically random OTP dispatched to citizen's email with branded GovTech HTML layout.
     - Stored in database as bcrypt-hashed record with 10-minute expiry and attempt limits.
     - Automatic citizen account creation upon first OTP verification.
   - **Mobile SMS OTP via Firebase Phone Authentication (Free Tier: 10 daily SMS / 10k monthly)**:
     - Real-time SMS OTP with client-side invisible reCAPTCHA security.
     - Verified phone number directly linked to citizen's user account record.
   - **Modern OTP Interface**: 6 individual auto-focus digit boxes with keyboard navigation, paste distribution, 30-second cooldown resend countdown timer, and clear error states.
   - **Role-Based Admin Login**: Secondary password login tab for Super Admin / Verified Officers.

9. **Accessibility & Divyangjan Inclusivity**:
   - WCAG AA compliant high-contrast mode toggle.
   - Text size controls ($A-$, $A$, $A+$).
   - Dedicated Persons with Disabilities (Divyangjan) schemes category (ADIP, UDID, Swavalamban).
   - Mobile bottom navigation bar with $\ge 48\text{px}$ touch targets.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React
- **Backend**: Next.js 14 Route Handlers
- **Database**: PostgreSQL (Supabase / Neon) with Prisma ORM; zero-config SQLite out-of-the-box for local testing
- **Authentication**: NextAuth.js (bcryptjs, JWT sessions, role-based authorization) + Firebase Phone Auth SDK
- **Email Delivery**: Nodemailer via Gmail SMTP (`nodemailer` SDK)
- **Internationalization (i18n)**: English & हिन्दी site-wide dictionary provider

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
# 1. Database URL (SQLite for local zero-config, PostgreSQL for production)
DATABASE_URL="file:./dev.db"

# 2. NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="yogyasetu_secret_jwt_encryption_key_2026_india"

# 3. Gmail SMTP (Nodemailer)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-character-app-password"

# 4. Firebase Phone Authentication (https://console.firebase.google.com)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy_your_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:abcdef"

# 5. Optional AI Providers
ANTHROPIC_API_KEY=""
OPENAI_API_KEY=""
```

---

## 🔑 How to Setup Authentication Providers

### 📧 1. Gmail SMTP Setup (Google App Password)
1. Go to your **[Google Account Security](https://myaccount.google.com/security)** and ensure **2-Step Verification** is enabled.
2. Search for or navigate to **[App passwords](https://myaccount.google.com/apppasswords)**.
3. Create an app password named `YogyaSetu`.
4. Copy the 16-character generated password (without spaces).
5. In your `.env` file, set:
   - `GMAIL_USER="your-gmail-address@gmail.com"`
   - `GMAIL_APP_PASSWORD="your-16-character-password"`

### 📱 2. Firebase Phone Authentication Setup (Free SMS OTP)
1. Go to **[Firebase Console](https://console.firebase.google.com)** and click **Add Project** (e.g. `yogyasetu-portal`).
2. In the project dashboard, navigate to **Build** $\to$ **Authentication** $\to$ Click **Get Started**.
3. Under the **Sign-in method** tab, enable **Phone**.
4. *(Optional for testing)*: Under Phone $\to$ "Phone numbers for testing", you can add test numbers (e.g. `+91 9999999999` with code `123456`) to test without consuming daily SMS quota.
5. In **Authentication** $\to$ **Settings** $\to$ **Authorized domains**, make sure `localhost` is listed (and add your Vercel production domain when deploying).
6. Click the ⚙️ **Project settings** icon $\to$ Under **General** $\to$ Scroll down to **Your apps** $\to$ Click the **Web** (`</>`) icon $\to$ Register app.
7. Copy the configuration object keys into your `.env` file:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client & Push Database Schema
```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Database with 23+ Real Central Government Schemes
```bash
npm run seed
```
*(Seeds 8 categories, 23 authentic schemes from india.gov.in/myscheme.gov.in, Admin account, Demo User, bookmarks, and notifications).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ How to Deploy to Vercel (with Neon / Supabase PostgreSQL)

### 1. Switch Prisma Schema to PostgreSQL
Run the switch script to set the schema provider to PostgreSQL:
```bash
npm run db:postgres
```

### 2. Set Up PostgreSQL Database
- Create a free serverless PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
- Copy your connection string: `postgresql://user:pass@ep-hostname.neon.tech/yogyasetu?sslmode=require`

### 3. Push Schema and Seed Database
```bash
DATABASE_URL="your-postgresql-url" npx prisma db push
DATABASE_URL="your-postgresql-url" npm run seed
```

### 4. Configure Vercel Environment Variables
In your Vercel Project Settings → Environment Variables, add:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_URL`: Your production domain (e.g. `https://yogyasetu.vercel.app`)
- `NEXTAUTH_SECRET`: A secure 32+ character random string

Deploy with Git or `vercel --prod`.

---

## 👥 Pre-Seeded Evaluation Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@yogyasetu.gov.in` | `Admin@12345` | Full access to `/admin` panel, schemes CRUD, verification workflow, user promotion, CSV export |
| **Citizen User** | `rahul.sharma@example.com` | `User@12345` | Full access to Citizen Dashboard, AI Recommendations, Bookmarks, Application Tracker |

*(Both personas can also be filled in with a single click on the login screen).*
