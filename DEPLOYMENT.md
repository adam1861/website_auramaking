# Vercel Deployment Guide

## Prerequisites
1. **PostgreSQL Database**: You need a PostgreSQL database (Vercel Postgres, Supabase, PlanetScale, etc.)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Environment Variables
Set these in your Vercel project settings:

### Required
```
DATABASE_URL=postgresql://username:password@host:port/database
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=your-admin-password
```

### Optional (for PayPal)
```
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

## Deployment Steps

1. **Push your code to GitHub**
2. **Connect your repository to Vercel**
3. **Set environment variables** in Vercel dashboard
4. **Deploy** - Vercel will use the `vercel-build` script

## Build Process
The deployment uses this sequence:
1. `npm install` (installs dependencies)
2. `prisma generate` (generates Prisma client)
3. `prisma db push` (pushes schema to database)
4. `next build` (builds the Next.js app)

## Common Issues & Solutions

### Prisma Errors
- Ensure `DATABASE_URL` is correct
- Check database connection from Vercel's region
- Verify database permissions

### Build Failures
- Check Vercel logs for specific error messages
- Ensure all environment variables are set
- Verify database is accessible from Vercel

### Runtime Errors
- Check function timeout settings (set to 30s)
- Verify API routes are properly configured
- Check database connection pooling

## Database Setup
1. Create a PostgreSQL database
2. Update `DATABASE_URL` in Vercel
3. Deploy - schema will be automatically pushed
4. Seed data if needed using the seed script

## Support
If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connection locally
4. Check Prisma schema syntax
