This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Setup

1. Copy the environment example file:
```bash
cp .env.local.example .env.local
```

2. Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key from: https://console.anthropic.com/account/keys

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

### AI-Powered Property Analysis
The admin panel includes Claude AI integration for automated property analysis. Simply paste property information in any format, and the AI will:
- Extract property details (address, price, rent, features)
- Calculate investment metrics (cap rate, ROI, cash flow)
- Assess risk levels and investment strategies
- Structure data for the dashboard

Access the admin panel at [http://localhost:3000/admin/properties](http://localhost:3000/admin/properties)

### Dashboard
View all investment properties with filtering, sorting, and detailed analysis at the main dashboard.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
