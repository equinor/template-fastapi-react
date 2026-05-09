param applicationName string
param storageLocation string
param environment string
@secure()
param postgresDBPassword string

@description('Email recipients for production exception alerts. Empty disables alert delivery.')
param alertEmailRecipients string[] = []

// Tunables (defaults supplied via main.bicepparam).
param logAnalyticsRetentionDays int
param logAnalyticsDailyQuotaGb int
param appInsightsRetentionDays int
param postgresSku object
param postgresStorageGb int
param postgresBackupRetentionDays int
param postgresGeoRedundantBackup bool
@description('Firewall allowlist. Empty array → publicNetworkAccess Disabled.')
param databaseAllowedIpRanges array = []

var publicAccess = empty(databaseAllowedIpRanges) ? 'Disabled' : 'Enabled'

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${applicationName}-${environment}-log-workspace'
  location: storageLocation
  properties: {
    publicNetworkAccessForQuery: 'Enabled'
    publicNetworkAccessForIngestion: 'Enabled'
    forceCmkForQuery: false
    sku: {
      name: 'pergb2018'
    }
    retentionInDays: logAnalyticsRetentionDays
    workspaceCapping: {
      dailyQuotaGb: logAnalyticsDailyQuotaGb
    }
  }
}

resource appInsight 'Microsoft.Insights/components@2020-02-02' = {
  name: '${applicationName}-${environment}-logs'
  location: storageLocation
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Flow_Type: 'Bluefield'
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    Request_Source: 'rest'
    RetentionInDays: appInsightsRetentionDays
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

resource queryPack 'Microsoft.OperationalInsights/queryPacks@2019-09-01' = {
  location: storageLocation
  name: '${applicationName}-${environment}-query-pack'
  properties: {

  }
}


resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${applicationName}-${environment}-key-vault'
  location: storageLocation
  properties: {
    tenantId: subscription().tenantId
    softDeleteRetentionInDays: 30
    enabledForDeployment: true
    enableSoftDelete: true
    accessPolicies: []  // Grant each user explicit access after the vault has been created
    sku: {
      name: 'standard'
      family: 'A'
    }
    publicNetworkAccess: 'Disabled'
  }
}

resource databasePassword 'Microsoft.KeyVault/vaults/secrets@2024-04-01-preview' = {
  parent: keyVault
  name: '${applicationName}-database-${environment}-password'
  properties: {
    value: postgresDBPassword
  }
}


resource sqlServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: '${applicationName}-${environment}-database'
  location: storageLocation
  sku: postgresSku
  properties: {
    version: '16'
    administratorLogin: applicationName
    administratorLoginPassword: postgresDBPassword
    maintenanceWindow: {
      customWindow: 'Enabled'
      dayOfWeek: 0
      startHour: 3
      startMinute: 18
    }
    network: { publicNetworkAccess: publicAccess }
    highAvailability: {
      mode: 'Disabled'
    }
    storage: {
      storageSizeGB: postgresStorageGb
      type: 'Premium_LRS'
    }
    backup: {
      backupRetentionDays: postgresBackupRetentionDays
      geoRedundantBackup: postgresGeoRedundantBackup ? 'Enabled' : 'Disabled'
    }
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-12-01-preview' = {
  name: applicationName
  parent: sqlServer
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}


resource databaseFirewallRules 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-12-01-preview' = [for rule in databaseAllowedIpRanges: {
  name: rule.name
  parent: sqlServer
  properties: {
    startIpAddress: rule.startIp
    endIpAddress: rule.endIp
  }
}]

resource sendEmailActionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'send-email-action-group'
  location: 'global'
  properties: {
    groupShortName: 'ErrorNotify'
    enabled: true
    emailReceivers: [for (recipient, i) in alertEmailRecipients: {
      name: 'recipient-${i}'
      emailAddress: recipient
      useCommonAlertSchema: true
    }]
  }
}


resource metricAlerts 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'Send email on error in ${applicationName}'
  location: 'global'
  properties: {
    description: 'When an error is detected in ${applicationName}, an email is dispatched'
    severity: 1
    enabled: true
    scopes: [
      appInsight.id
    ]
    evaluationFrequency: 'PT1H'
    windowSize: 'PT1H'
    criteria: {
      allOf: [
        {
          threshold: 0
          name: 'Metric1'
          metricNamespace: 'microsoft.insights/components'
          metricName: 'exceptions/count'
          operator: 'GreaterThan'
          timeAggregation: 'Count'
          skipMetricValidation: false
          criterionType: 'StaticThresholdCriterion'
        }
      ]
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
    }
    autoMitigate: false
    targetResourceType: 'microsoft.insights/components'
    targetResourceRegion: storageLocation
    actions: [
      {
        actionGroupId: sendEmailActionGroup.id
      }
    ]
  }
}
