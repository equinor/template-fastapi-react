using './main.bicep'

// ─────────────────────────────────────────────────────────────────────────────
// Required (resolved from environment by the iac:* mise tasks)
// ─────────────────────────────────────────────────────────────────────────────

param environment = readEnvironmentVariable('ENVIRONMENT')
param applicationName = readEnvironmentVariable('APPLICATION_NAME')
param resourceGroupLocation = readEnvironmentVariable('LOCATION', 'norwayeast')
param postgresDBPassword = readEnvironmentVariable('POSTGRES_DB_PASSWORD')
param alertEmailRecipients = json(readEnvironmentVariable('ALERT_EMAIL_RECIPIENTS', '[]'))

// ─────────────────────────────────────────────────────────────────────────────
// Tunables — edit per fork. The Bicep templates themselves stay generic.
// ─────────────────────────────────────────────────────────────────────────────

// Log Analytics & App Insights retention/quotas (longer + larger in prod).
param logAnalyticsRetentionDays = environment == 'prod' ? 730 : 90
param logAnalyticsDailyQuotaGb = environment == 'prod' ? 10 : 1
param appInsightsRetentionDays = environment == 'prod' ? 730 : 90

// PostgreSQL Flexible Server sizing.
param postgresSku = environment == 'prod'
  ? { name: 'Standard_D2s_v3', tier: 'GeneralPurpose' }
  : { name: 'Standard_B1ms', tier: 'Burstable' }
param postgresStorageGb = 64
param postgresBackupRetentionDays = environment == 'prod' ? 30 : 7
param postgresGeoRedundantBackup = environment == 'prod'

// Database firewall: IP ranges allowed to reach the Postgres server.
// In dev/test the Radix outbound ranges are pre-populated so the cluster is
// reachable from Radix workloads. In prod the array defaults to empty so
// `publicNetworkAccess` is automatically set to 'Disabled' — opt back in
// here only after deciding access cannot be done over a Private Endpoint.
param databaseAllowedIpRanges = environment == 'prod' ? [] : [
  { name: 'allow-radix-1', startIp: '52.178.214.192', endIp: '52.178.214.199' }
  { name: 'allow-radix-2', startIp: '137.135.191.80', endIp: '137.135.191.95' }
]
