extension microsoftGraph
param applicationName string = 'template-fastapi-react'
param repositoryName string = 'template-fastapi-react'

// The Entra ID application
// Resource format https://learn.microsoft.com/en-us/graph/templates/reference/applications?view=graph-bicep-1.0
resource app 'Microsoft.Graph/applications@v1.0' = {
  displayName: '${applicationName}'
  signInAudience: 'AzureADMyOrg'
  uniqueName: '${applicationName}'
  spa: {
    // The callback URL is the URL that the user is redirected to after the login,
    // and it contains the URL of the application that is registered in Radix and localhost for doing development.
    redirectUris: [
      // Development
      'https://proxy-${applicationName}-dev.radix.equinor.com/api/docs/oauth2-redirect'
      'https://proxy-${applicationName}-dev.radix.equinor.com'
      'https://proxy-${applicationName}-dev.radix.equinor.com/'
      // Staging
      'https://proxy-${applicationName}-staging.radix.equinor.com/api/docs/oauth2-redirect'
      'https://proxy-${applicationName}-staging.radix.equinor.com'
      'https://proxy-${applicationName}-staging.radix.equinor.com/'
      // Production
      'https://${applicationName}.app.radix.equinor.com/api/docs/oauth2-redirect'
      'https://proxy-${applicationName}-prod.radix.equinor.com/'
      'https://${applicationName}.app.radix.equinor.com/'
      'https://${applicationName}.app.radix.equinor.com'
      // For development
      'http://localhost/api/docs/oauth2-redirect'
      'http://localhost/'
      'http://localhost:5000/docs/oauth2-redirect'
    ]
  }
  api: {
    // In version 2 the audience is always the client id, and does not contain the api:// in the decoded JWT.
    // It is important to know this because the API expects a JWT token with a specific signature for validation,
    // and this is specified in the configuration settings and must match.
    requestedAccessTokenVersion: 2
    // To allow OpenAPI and clients to talk to the API, we need to add the scope to the API.
    oauth2PermissionScopes: [
        {
            id: '31a61854-0d6d-4c60-918b-efffd4fac373'
            adminConsentDescription: 'Allow users to access the API'
            adminConsentDisplayName: 'Read'
            isEnabled: true
            type: 'User'
            userConsentDescription: 'Access the API'
            userConsentDisplayName: 'Access the API'
            value: 'api${app.appId}'
        }
    ]
  }
  appRoles: [
    {
        id: '31a61854-0d6d-4c60-918b-efffd4fac379'
        allowedMemberTypes: [
          'User'
          'Application'
        ]
        description: '${applicationName} administrators. Access to all fields. Permission to edit admin values.'
        displayName: 'Admin'
        isEnabled: true
        value: 'admin'
      }
  ]
  // Resource format https://learn.microsoft.com/en-us/graph/templates/reference/federatedidentitycredentials?view=graph-bicep-1.0
  resource githubFic 'federatedIdentityCredentials' = {
    name: '${app.uniqueName}/githubFic'
    audiences: [
        'api://AzureADTokenExchange'
    ]
    description: 'Federated Identity Credentials for Github Actions to access Entra protected resources'
    issuer: 'https://token.actions.githubusercontent.com'
    // Subject is checked before issuing an Entra ID access token to access Azure resources.
    // GitHub Actions subject examples can be found in https://docs.github.com/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#example-subject-claims
    subject: 'repo:equinor/${repositoryName}:ref:refs/heads/main'
  }
}

// The Service Principle (or Enterprise App)
resource appSP 'Microsoft.Graph/servicePrincipals@v1.0' = {
  appId: app.appId
  displayName: '${applicationName}'

}
