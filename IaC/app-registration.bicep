extension 'br:mcr.microsoft.com/bicep/extensions/microsoftgraph/v1.0:1.0.0'
targetScope = 'subscription'

// Provisions the two Entra ID app registrations required by the BFF auth setup:
//   * <name>-api-<env>     — resource server. FastAPI validates JWTs whose
//                            `aud` claim equals this app's appId.
//   * <name>-oauth2-<env>  — OIDC client used by oauth2-proxy.
//
// Run via ./deploy-app-registration.sh (which also mints the BFF client secret).

@description('Lowercase application slug, used as both the unique app name and to derive Radix URLs.')
param applicationName string

@description('Environment slug. Affects the registration suffix and the redirect URIs registered.')
@allowed(['dev', 'test', 'prod'])
param environment string

@description('ServiceNow Configuration Item / Business Application ID. Required by Equinor IAM compliance for production use; may be empty for sandbox deployments.')
param serviceManagementReference string = ''

@description('Object IDs of users/groups that should own both App Registrations.')
param ownerObjectIds string[]

@description('Extra production hostnames whose /oauth2/callback should be a valid redirect URI.')
param productionHostnames string[] = []

var apiAccessScopeId = guid('api-access-${applicationName}')
var adminRoleId = guid('admin-role-${applicationName}')

var productionRedirectUris = [for host in productionHostnames: 'https://${host}/oauth2/callback']

var bffRedirectUris = concat(
  ['https://proxy-${applicationName}-${environment}.radix.equinor.com/oauth2/callback'],
  environment == 'prod'
    ? concat(
        ['https://${applicationName}.app.radix.equinor.com/oauth2/callback'],
        productionRedirectUris
      )
    : environment == 'dev' ? ['http://localhost/oauth2/callback'] : []
)

var graphAppId = '00000003-0000-0000-c000-000000000000'

// ------------------------------------------------------------------
// API app registration — the resource server.
// ------------------------------------------------------------------
resource apiApp 'Microsoft.Graph/applications@v1.0' = {
  displayName: '${applicationName}-api-${environment}'
  uniqueName: '${applicationName}-api-${environment}'
  signInAudience: 'AzureADMyOrg'
  serviceManagementReference: empty(serviceManagementReference) ? null : serviceManagementReference
  owners: {
    relationships: ownerObjectIds
    relationshipSemantics: 'replace'
  }
  identifierUris: [
    'https://${environment}.${applicationName}.equinor.com/api'
  ]
  api: {
    // v2 access tokens carry the appId (a GUID) in `aud`, not api://...
    requestedAccessTokenVersion: 2
    oauth2PermissionScopes: [
      {
        id: apiAccessScopeId
        adminConsentDescription: 'Allow users to access the API'
        adminConsentDisplayName: 'Read'
        isEnabled: true
        type: 'User'
        userConsentDescription: 'Access the API'
        userConsentDisplayName: 'Access the API'
        value: 'access'
      }
    ]
  }
  appRoles: [
    {
      id: adminRoleId
      allowedMemberTypes: ['User', 'Application']
      description: '${applicationName} administrators.'
      displayName: 'Admin'
      isEnabled: true
      value: 'admin'
    }
  ]
  requiredResourceAccess: [
    {
      resourceAppId: graphAppId
      resourceAccess: [
        // User.Read
        { id: 'e1fe6dd8-ba31-4d61-89e7-88639da4683d', type: 'Scope' }
      ]
    }
  ]
}

resource apiAppSP 'Microsoft.Graph/servicePrincipals@v1.0' = {
  appId: apiApp.appId
  owners: {
    relationships: ownerObjectIds
    relationshipSemantics: 'replace'
  }
}

// ------------------------------------------------------------------
// BFF (oauth2-proxy) app registration — the OIDC client.
// ------------------------------------------------------------------
resource oauth2App 'Microsoft.Graph/applications@v1.0' = {
  displayName: '${applicationName}-oauth2-${environment}'
  uniqueName: '${applicationName}-oauth2-${environment}'
  signInAudience: 'AzureADMyOrg'
  serviceManagementReference: empty(serviceManagementReference) ? null : serviceManagementReference
  owners: {
    relationships: ownerObjectIds
    relationshipSemantics: 'replace'
  }
  web: {
    redirectUris: bffRedirectUris
  }
  requiredResourceAccess: [
    {
      // The matching API registration.
      resourceAppId: apiApp.appId
      resourceAccess: [
        { id: apiAccessScopeId, type: 'Scope' }
      ]
    }
    {
      resourceAppId: graphAppId
      resourceAccess: [
        { id: '37f7f235-527c-4136-accd-4a02d197296e', type: 'Scope' } // openid
        { id: '14dad69e-099b-42c9-810b-d002981feec1', type: 'Scope' } // profile
        { id: '64a6cdd6-aab1-4aaf-94b8-3cc8405e90d0', type: 'Scope' } // email
        { id: '7427e0e9-2fba-42fe-b0c0-848c9e6a8182', type: 'Scope' } // offline_access
        { id: 'e1fe6dd8-ba31-4d61-89e7-88639da4683d', type: 'Scope' } // User.Read
      ]
    }
  ]
}

resource oauth2AppSP 'Microsoft.Graph/servicePrincipals@v1.0' = {
  appId: oauth2App.appId
  owners: {
    relationships: ownerObjectIds
    relationshipSemantics: 'replace'
  }
}

output apiApplicationId string = apiApp.appId
output apiScope string = 'api://${apiApp.appId}/access'
output oauth2ApplicationId string = oauth2App.appId
