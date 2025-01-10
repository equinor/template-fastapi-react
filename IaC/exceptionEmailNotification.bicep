/* Example of separate deployment that uses existing resource.
E.g.: sending email notifications on exceptions in (existing) Application Insights.
Needs to be deployed on resource group level:
az deployment group create --resource-group template-fastapi-react-dev --template-file ./exceptionEmailNotifications.bicep --parameters environment=staging
*/
resource appInsight 'Microsoft.Insights/components@2020-02-02' existing = {
  name: '${resourceGroup().name}-logs'
}

resource sendEmailActionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'send-email-action-group'
  location: 'global'
  properties: {
    groupShortName: 'ErrorNotify'
    enabled: true
    emailReceivers: [
      {
        name: 'Notify Chris by email_-EmailAction-'
        emailAddress: 'chcl@equinor.com'
        useCommonAlertSchema: false
      }
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
