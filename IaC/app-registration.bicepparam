using './app-registration.bicep'

var env = readEnvironmentVariable('ENVIRONMENT')

param applicationName = readEnvironmentVariable('APPLICATION_NAME')
param environment = env
param ownerObjectIds = json(readEnvironmentVariable('OWNER_OBJECT_IDS', '[]'))
param serviceManagementReference = readEnvironmentVariable('SERVICE_MANAGEMENT_REFERENCE')
param productionHostnames = env == 'prod' ? ['template-fastapi-react.equinor.com'] : []
