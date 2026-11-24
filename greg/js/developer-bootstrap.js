// Professor preview: Developer Mode modules are relative to this game deployment.
export async function createDeveloper(options){
 const {DeveloperTools}=await import('../developer/controller.js');
 return new DeveloperTools(options);
}
