# Project Setup Guide

Complete guide for setting up this project from scratch in a new environment.

## Prerequisites

- Node.js 22+
- Yarn 4+ (via Corepack)
- AWS Account with admin access
- GitHub repository
- Sentry account
- PostgreSQL 16+ (local) or Docker

## 1. AWS Setup

### 1.1 Create AWS Profile

**Option A: SSO (recommended)**

```bash
aws configure sso --profile ts-web-starter
# Follow prompts: SSO start URL, region, account, role
```

Login before using:

```bash
aws sso login --profile ts-web-starter
```

**Option B: Access Keys**

```bash
aws configure --profile ts-web-starter
# Enter: Access Key ID, Secret Access Key, Region (us-east-1)
```

### 1.2 Create OIDC Identity Provider

1. AWS Console → IAM → Identity Providers → **Add provider**
2. Select **OpenID Connect**
3. Configure:
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
4. Click **Add provider**

### 1.3 Create IAM Role for GitHub Actions

1. IAM → Roles → **Create role**
2. Select **Web identity**
3. Choose:
   - Identity provider: `token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
4. Attach policy: `AdministratorAccess` (or custom minimal policy)
5. Name: `GitHubActionsDeployRole`
6. Edit trust policy to restrict to your repo:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:*"
        }
      }
    }
  ]
}
```

7. Copy the Role ARN: `arn:aws:iam::ACCOUNT_ID:role/GitHubActionsDeployRole`

See [AWS_OIDC_SETUP.md](./AWS_OIDC_SETUP.md) for detailed instructions.

### 1.4 Create Route53 Hosted Zone

1. AWS Console → Route53 → Hosted zones → **Create hosted zone**
2. Domain name: `web-starter.techstack.dev` (or your domain)
3. Type: Public hosted zone
4. Copy the NS records
5. Add NS records to your domain registrar pointing to Route53 nameservers

**Important:** Complete this before first SST deployment. SST will create DNS records in this hosted zone.

## 2. GitHub Setup

### 2.1 Repository Secrets

Go to Repository → Settings → Secrets and variables → Actions → **New repository secret**

| Secret              | Value                                                  | Required |
| ------------------- | ------------------------------------------------------ | -------- |
| `AWS_ROLE_ARN`      | `arn:aws:iam::ACCOUNT_ID:role/GitHubActionsDeployRole` | Yes      |
| `AWS_REGION`        | `us-east-1`                                            | No       |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source maps                      | Yes      |

## 3. Sentry Setup

### 3.1 Create Sentry Project

1. Go to [sentry.io](https://sentry.io) → Create Project
2. Select **Next.js** platform
3. Note the DSN (already configured in `sst.config.ts`)

### 3.2 Create Auth Token

1. Sentry → Settings → Auth Tokens → **Create New Token**
2. Scopes: `project:releases`, `org:read`
3. Copy token → Add as `SENTRY_AUTH_TOKEN` GitHub secret

### 3.3 Verify Configuration

DSN and org/project are configured in `sst.config.ts`:

```typescript
const config = {
  sentry: {
    dsn: "https://...",
    environment: isProduction ? "production" : "development",
  },
};
```

## 4. SST Initialization

### 4.1 Install SST

```bash
yarn install
yarn sst install
```

### 4.2 Set SST Secrets

Set secrets for each stage:

```bash
# Development stage
yarn sst secret set BetterAuthSecret "your-random-secret-32-chars-min" --stage dev
yarn sst secret set GoogleClientId "your-id.apps.googleusercontent.com" --stage dev
yarn sst secret set GoogleClientSecret "GOCSPX-your-secret" --stage dev

# Production stage
yarn sst secret set BetterAuthSecret "different-random-secret-32-chars" --stage production
yarn sst secret set GoogleClientId "your-id.apps.googleusercontent.com" --stage production
yarn sst secret set GoogleClientSecret "GOCSPX-your-secret" --stage production
```

### 4.3 First Deployment

```bash
# Deploy to dev (creates all AWS resources)
yarn sst deploy --stage dev
```

This creates:

- VPC with NAT Gateway
- RDS PostgreSQL instance
- Lambda functions
- CloudFront distribution
- Route53 DNS records

## 5. Database Setup

### 5.1 Get Database URL

After first deployment, get the database connection string:

```bash
yarn sst shell --stage dev
# Then in the shell:
echo $DATABASE_URL
```

### 5.2 Run Migrations

```bash
# Set DATABASE_URL from previous step
export DATABASE_URL="postgresql://..."

# Generate Prisma client
yarn prisma generate

# Run migrations
yarn prisma migrate deploy
```

### 5.3 Verify Connection

```bash
yarn prisma studio
```

## 6. Google OAuth Setup

### 6.1 Create OAuth Credentials

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create Project (or select existing)
3. OAuth consent screen → Configure
4. Credentials → Create Credentials → OAuth client ID
5. Application type: Web application
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://web-starter.techstack.dev/api/auth/callback/google` (prod)
   - `https://dev.web-starter.techstack.dev/api/auth/callback/google` (staging)

### 6.2 Set Credentials

Add Client ID and Secret as SST secrets (see section 4.2).

## 7. Local Development

### 7.1 Clone and Install

```bash
git clone <repo-url>
cd ts-web-starter
corepack enable
yarn install
```

### 7.2 Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/ts_web_starter_dev"
BETTER_AUTH_SECRET="local-dev-secret-32-characters-min"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret"
NEXT_PUBLIC_SENTRY_DSN="https://..."  # Optional for local
```

### 7.3 Start Database

```bash
yarn docker:up
```

### 7.4 Initialize Database

```bash
yarn prisma generate
yarn prisma migrate dev
```

### 7.5 Start Development Server

```bash
yarn dev
```

Visit http://localhost:3000

### 7.6 Run E2E Tests (Optional)

```bash
# Install Playwright browsers (first time only)
yarn playwright install chromium

# Run E2E tests
yarn test:e2e
```

## 8. Deployment Checklist

### First-Time Setup

- [ ] AWS profile configured
- [ ] OIDC provider created in AWS
- [ ] IAM role created with trust policy
- [ ] Route53 hosted zone created, NS records delegated
- [ ] GitHub secrets configured (`AWS_ROLE_ARN`, `SENTRY_AUTH_TOKEN`)
- [ ] SST secrets set for all stages
- [ ] Google OAuth credentials created
- [ ] First deployment completed (`yarn sst deploy --stage dev`)
- [ ] Database migrations applied
- [ ] Smoke test passed

### Per-Stage Deployment

```bash
# Manual deployment
yarn sst deploy --stage <stage>

# Or trigger GitHub Actions workflow
# Actions → CD - Continuous Deployment → Run workflow
```

## 9. Domain Configuration

Domains are auto-configured via SST after Route53 hosted zone is created (see section 1.4):

| Stage      | Domain                              |
| ---------- | ----------------------------------- |
| production | `web-starter.techstack.dev`         |
| dev        | `dev.web-starter.techstack.dev`     |
| other      | `<stage>.web-starter.techstack.dev` |

## Troubleshooting

### SST Deploy Fails

```bash
# Reinstall SST platform
yarn sst install

# Check AWS credentials
aws sts get-caller-identity --profile ts-web-starter
```

### Database Connection Issues

```bash
# Verify RDS security group allows your IP
# Check VPC NAT gateway is running
# Verify DATABASE_URL format
```

### GitHub Actions OIDC Fails

- Verify trust policy `sub` matches your repo
- Check OIDC provider thumbprint
- Ensure `id-token: write` permission in workflow
