# AWS OIDC Setup Guide for GitHub Actions

This guide explains how to set up AWS IAM role assumption using OpenID Connect (OIDC) instead of storing AWS access keys in GitHub Secrets.

## Why OIDC Instead of Access Keys?

- ✅ **More secure**: No long-lived credentials stored in GitHub
- ✅ **Automatic rotation**: Tokens are short-lived and auto-refreshed
- ✅ **Better audit trail**: CloudTrail logs show which GitHub workflow assumed the role
- ✅ **Least privilege**: Fine-grained permissions per repository

## Setup Steps

### 1. Create OIDC Identity Provider in AWS

1. Open AWS Console → IAM → Identity Providers
2. Click **Add provider**
3. Select **OpenID Connect**
4. Configure:
   - **Provider URL**: `https://token.actions.githubusercontent.com`
   - **Audience**: `sts.amazonaws.com`
5. Click **Add provider**

### 2. Create IAM Role for GitHub Actions

1. Go to IAM → Roles → **Create role**
2. Select **Web identity**
3. Choose:
   - **Identity provider**: `token.actions.githubusercontent.com`
   - **Audience**: `sts.amazonaws.com`
4. Click **Next**
5. Attach policies (adjust based on your needs):
   - `AdministratorAccess` (for full deployment - use carefully!)
   - Or create a custom policy with specific permissions:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "cloudformation:*",
             "s3:*",
             "lambda:*",
             "apigateway:*",
             "cloudfront:*",
             "ec2:*",
             "rds:*",
             "secretsmanager:*",
             "ssm:*",
             "iam:*",
             "route53:*"
           ],
           "Resource": "*"
         }
       ]
     }
     ```
6. Name the role: `GitHubActionsDeployRole`
7. Click **Create role**

### 3. Verify Configuration

The CD workflow is already configured to use OIDC. The key section is:

```yaml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ secrets.AWS_REGION || 'us-east-1' }}
          role-session-name: GitHubActions-${{ github.run_id }}
```

### 4. Test the Setup

1. Trigger the CD workflow manually from GitHub Actions tab
2. Select a stage (dev/staging/production)
3. Monitor the workflow execution
4. Check the "Configure AWS credentials" step - it should succeed without any access keys

## Security Best Practices

1. **Restrict by branch**: Update trust policy to only allow deployments from specific branches:

   ```json
   "StringLike": {
     "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:ref:refs/heads/main"
   }
   ```

2. **Restrict by environment**: Allow only specific GitHub environments:

   ```json
   "StringLike": {
     "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:environment:production"
   }
   ```

3. **Use least privilege**: Instead of `AdministratorAccess`, create minimal policies for specific resources

4. **Enable CloudTrail**: Monitor all role assumption events

5. **Set session duration**: Add `MaxSessionDuration` to the role (default is 1 hour)

## Troubleshooting

### Error: "Not authorized to perform sts:AssumeRoleWithWebIdentity"

- Verify the trust policy matches your repository exactly
- Check the `token.actions.githubusercontent.com:sub` condition
- Ensure the OIDC provider is correctly configured

### Error: "OpenIDConnect provider not found"

- Create the OIDC identity provider in IAM as described in Step 1
- Verify the provider URL is exactly `https://token.actions.githubusercontent.com`

### Error: "No permissions to deploy resources"

- Attach appropriate IAM policies to the role
- For SST deployments, you need CloudFormation, S3, Lambda, and other service permissions

## Additional Resources

- [GitHub OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS IAM OIDC Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [SST Deployment Guide](https://sst.dev/docs/deployment)
