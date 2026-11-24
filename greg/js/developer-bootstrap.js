// The --dev server alone exposes this endpoint. Public packaging replaces this module with a stub.
export async function createDeveloper(options){const {DeveloperTools}=await import('/__dev/controller.js');return new DeveloperTools(options);}
