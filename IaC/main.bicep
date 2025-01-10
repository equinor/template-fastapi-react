targetScope='subscription'

@allowed([ 'dev', 'staging', 'prod' ])
param environment string
@description('Specifies the location for resources.')
param resourceGroupLocation string = 'norwayeast'
@description('Create admin password for the database. Will be stored in the KeyVault')
@secure()
param postgresDBPassword string

resource newRG 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'template-fastapi-react-${environment}'
  location: resourceGroupLocation
}

module resources 'resources.bicep' = {
  name: 'template-fastapi-react-${environment}-resources'
  scope: newRG
  params: {
    storageLocation: resourceGroupLocation
    environment: environment
    postgresDBPassword: postgresDBPassword
  }
}
