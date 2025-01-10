param storageLocation string
param environment string
@secure()
param postgresDBPassword string

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'template-fastapi-react-${environment}-logWorkspace'
  location: storageLocation
  properties: {
    publicNetworkAccessForQuery: 'Enabled'
    publicNetworkAccessForIngestion: 'Enabled'
    forceCmkForQuery: false
    sku: {
      name: 'pergb2018'
    }
    retentionInDays: environment == 'prod' ? 730 : 90
    workspaceCapping: {
      dailyQuotaGb: environment == 'prod' ? 10 : 1
    }
  }
}

resource appInsight 'Microsoft.Insights/components@2020-02-02' = {
  name: 'template-fastapi-react-${environment}-logs'
  location: storageLocation
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Flow_Type: 'Bluefield'
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    Request_Source: 'rest'
    RetentionInDays: environment == 'prod' ? 730 : 90
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

resource queryPack 'Microsoft.OperationalInsights/queryPacks@2019-09-01' = {
  location: storageLocation
  name: 'template-fastapi-react-${environment}-queryPack'
  properties: {

  }
}


resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'template-fastapi-react-${environment}-keyVault'
  location: storageLocation
  properties: {
    tenantId: '3aa4a235-b6e2-48d5-9195-7fcf05b459b0'
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
  name: 'template-fastapi-react-database-${environment}-password'
  properties: {
    value: postgresDBPassword
  }
}


resource sqlServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: 'template-fastapi-react-${environment}-database'
  location: storageLocation
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: 'template-fastapi-react'
    administratorLoginPassword: postgresDBPassword
    maintenanceWindow: {
      customWindow: 'Enabled'
      dayOfWeek: 0
      startHour: 3
      startMinute: 18
    }
    network:{publicNetworkAccess: 'Enabled'}
    highAvailability: {
      mode: 'Disabled'
    }
    storage: {
      storageSizeGB: 64
      type: 'Premium_LRS'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
  }
}

resource template-fastapi-reactDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-12-01-preview' = {
  name: 'template-fastapi-react'
  parent: sqlServer
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}


resource databaseAllowRadixConnection 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-12-01-preview' = {
  name: 'allow-radix-connection'
  parent: sqlServer
  properties: {
    startIpAddress: '52.178.214.192'
    endIpAddress: '52.178.214.199'
  }
}

resource databaseAllowRadixConnection2 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-12-01-preview' = {
  name: 'allow-radix-connection2'
  parent: sqlServer
  properties: {
    startIpAddress: '137.135.191.80'
    endIpAddress: '137.135.191.95'
  }
}

resource sendEmailActionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'send-email-action-group'
  location: 'global'
  properties: {
    groupShortName: 'ErrorNotify'
    enabled: true
    emailReceivers: [
      {
        name: 'Notify Eirik by email_-EmailAction-'
        emailAddress: 'eaks@equinor.com'
        useCommonAlertSchema: false
      }
    ]
  }
}


resource metricAlerts 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'Send email on error in template-fastapi-react'
  location: 'global'
  properties: {
    description: 'When an error is detected in template-fastapi-react, an email is dispatched'
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
    targetResourceRegion: 'norwayeast'
    actions: [
      {
        actionGroupId: sendEmailActionGroup.id
      }
    ]
  }
}
