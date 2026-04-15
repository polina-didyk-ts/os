/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "ts-web-starter",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          profile: "ts-web-starter",
          region: "eu-central-1",
        },
        "aws-native": {
          version: "1.45.0",
          region: "eu-central-1",
        },
      },
    };
  },
  async run() {
    // =========================================================================
    // Configuration (computed from stage)
    // =========================================================================
    const isProduction = $app.stage === "production";
    const config = {
      domain: isProduction
        ? "web-starter.techstack.dev"
        : `${$app.stage}.web-starter.techstack.dev`,
      sentry: {
        dsn: "",
        environment: isProduction ? "production" : "development",
      },
    };
    // =========================================================================

    // VPC for database connectivity
    const vpc = new sst.aws.Vpc("AppVpc", {
      nat: "ec2", // Cheaper NAT option
    });
    // Subnet group for the database with public subnets to allow public access
    const dbSubnetGroup = new aws.rds.SubnetGroup("DatabaseSubnetGroup", {
      name: "database-subnet-group",
      subnetIds: vpc.publicSubnets,
    });
    // PostgreSQL RDS instance
    const database = new sst.aws.Postgres("Database", {
      vpc,
      version: "17.6",
      instance: "t4g.small",
      transform: {
        instance: {
          publiclyAccessible: true,
          dbSubnetGroupName: dbSubnetGroup.name,
        },
      },
    });
    const databaseUrl = $interpolate`postgresql://${database.username}:${database.password}@${database.host}:${database.port}/${database.database}`;

    // Migrator - Runs Prisma migrations, invoked from CI/CD
    const migratorFunction = new sst.aws.Function("MigratorFunction", {
      handler: "functions/migrator/handler.handler",
      link: [database],
      vpc,
      timeout: "300 seconds", // 5 minutes for migrations
      memory: "512 MB",
      environment: {
        DATABASE_URL: databaseUrl,
        NODE_ENV: "production",
      },
      nodejs: { install: ["prisma"] },
      // Copy Prisma files needed for migrations
      copyFiles: [
        { from: "prisma.config.ts", to: "prisma.config.ts" },
        { from: "prisma/schema.prisma", to: "prisma/schema.prisma" },
        { from: "prisma/migrations", to: "prisma/migrations" },
      ],
    });

    // Workaround to allow public access to Lambda Function URL
    // See details here: https://github.com/sst/sst/issues/6198
    $transform(aws.lambda.FunctionUrl, (args, opts, name) => {
      const _permission = new awsnative.lambda.Permission(`${name}InvokePermission`, {
        action: "lambda:InvokeFunction",
        functionName: args.functionName,
        principal: "*",
        invokedViaFunctionUrl: true,
      });
    });

    // Next.js application
    const web = new sst.aws.Nextjs("Web", {
      link: [database],
      vpc,
      environment: {
        NODE_ENV: "production",
        DATABASE_URL: databaseUrl,
        NEXT_PUBLIC_BETTER_AUTH_URL: `https://${config.domain}`,
        BETTER_AUTH_SECRET: new sst.Secret("BetterAuthSecret").value,
        GOOGLE_CLIENT_ID: new sst.Secret("GoogleClientId").value,
        GOOGLE_CLIENT_SECRET: new sst.Secret("GoogleClientSecret").value,
        // Sentry
        NEXT_PUBLIC_SENTRY_DSN: config.sentry.dsn,
        NEXT_PUBLIC_SENTRY_ENVIRONMENT: config.sentry.environment,
      },
      domain: {
        name: config.domain,
        redirects: isProduction ? ["www." + config.domain] : undefined,
        dns: sst.aws.dns(),
      },
    });
    return {
      url: web.url,
      database: database.host,
      migratorFunction: migratorFunction.name,
    };
  },
});
