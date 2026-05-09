targetScope='subscription'

@allowed([ 'dev', 'test', 'prod' ])
param environment string
@description('Lowercase application slug used as the prefix for every resource name. Single source of truth — overrides nothing else.')
param applicationName string
@description('Specifies the location for resources.')
param resourceGroupLocation string = 'norwayeast'
@description('Create admin password for the database. Will be stored in the KeyVault')
@secure()
param postgresDBPassword string
@description('Email recipients for production exception alerts. Empty disables alert delivery.')
param alertEmailRecipients string[] = []

// Tunables — defaults live in main.bicepparam so the template body stays generic.
param logAnalyticsRetentionDays int
param logAnalyticsDailyQuotaGb int
param appInsightsRetentionDays int
param postgresSku object
param postgresStorageGb int
param postgresBackupRetentionDays int
param postgresGeoRedundantBackup bool
@description('Firewall allowlist for the database. Empty array means publicNetworkAccess is Disabled.')
param databaseAllowedIpRanges array = []

resource newRG 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: '${applicationName}-${environment}'
  location: resourceGroupLocation
}

module resources 'resources.bicep' = {
  name: '${applicationName}-${environment}-resources'
  scope: newRG
  params: {
    applicationName: applicationName
    storageLocation: resourceGroupLocation
    environment: environment
    postgresDBPassword: postgresDBPassword
    alertEmailRecipients: alertEmailRecipients
    logAnalyticsRetentionDays: logAnalyticsRetentionDays
    logAnalyticsDailyQuotaGb: logAnalyticsDailyQuotaGb
    appInsightsRetentionDays: appInsightsRetentionDays
    postgresSku: postgresSku
    postgresStorageGb: postgresStorageGb
    postgresBackupRetentionDays: postgresBackupRetentionDays
    postgresGeoRedundantBackup: postgresGeoRedundantBackup
    databaseAllowedIpRanges: databaseAllowedIpRanges
  }
}
