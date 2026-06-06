# XpenS — Smart Expense Tracking

AI-powered expense tracking for freelancers, teams, and businesses. Scan receipts with [ParseFlow](https://parseflow.dev), track expenses, manage approvals, and generate reports.

## Features

- **AI Receipt Scanning** — Upload a receipt (PDF/image), ParseFlow extracts merchant, amount, tax, line items
- **Expense Management** — Full CRUD with categories, projects, notes, and file attachments
- **Dashboard** — Summary stats, monthly spending chart, category breakdown (Recharts)
- **Approval Workflows** — Submit → Manager/Admin approve/reject → Reimburse
- **Team Roles** — Admin, Manager, Employee, Accountant with role-based access
- **Multi-Currency** — 20 currencies with proper symbols and formatting
- **Reports & Export** — Filter by date/status/category/project, export CSV or JSON
- **Responsive UI** — shadcn/ui components, mobile sidebar, dark mode ready

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| UI | shadcn/ui (Base UI), Tailwind CSS v4 |
| Charts | Recharts |
| Database | PostgreSQL 16 + Prisma 7 ORM |
| Auth | JWT (bcryptjs + jsonwebtoken) |
| OCR | ParseFlow API |
| Deployment | Docker Compose |

## Quick Start

### Prerequisites

- Node.js 22+
- Docker & Docker Compose
- A [ParseFlow API key](https://parseflow.dev) (optional for dev)

### Development

```bash
# Clone
git clone https://github.com/Alrick92/xpens.git
cd xpens

# Start PostgreSQL
docker compose up db -d

# Install deps
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PARSEFLOW_API_KEY

# Run migrations and seed
npx prisma migrate dev --name init
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default admin account:** `admin@xpens.local` / `admin123`

### Production (Docker)

```bash
# Set your secrets
export JWT_SECRET=your-production-secret
export PARSEFLOW_API_KEY=pf_live_your_key

# Build and run
docker compose up --build -d
```

App runs on [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated pages (sidebar layout)
│   │   ├── dashboard/      # Stats, charts, recent expenses
│   │   ├── expenses/       # List, create, manage expenses
│   │   ├── projects/       # Project management
│   │   ├── approvals/      # Expense approval workflow
│   │   ├── reports/        # Filter & export reports
│   │   └── settings/       # Profile, categories, team
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── actions/            # Server Actions (auth, expenses, categories, projects)
│   └── api/                # Route Handlers (parse-receipt, upload, export)
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── sidebar.tsx         # Navigation sidebar
│   └── providers.tsx       # Toast provider
├── lib/
│   ├── auth.ts             # JWT session management
│   ├── db.ts               # Prisma client (PrismaPg adapter)
│   ├── currencies.ts       # Currency formatting (20 currencies)
│   └── parseflow.ts        # ParseFlow API client
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Default categories + admin user
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for signing JWT tokens | Yes (production) |
| `PARSEFLOW_API_KEY` | ParseFlow API key for receipt OCR | For OCR |
| `PARSEFLOW_API_URL` | ParseFlow API base URL | No (defaults to https://parseflow.dev/api/v1) |
| `UPLOAD_DIR` | Directory for file uploads | No (defaults to ./uploads) |

## License

MIT
