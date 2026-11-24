// Resolve the professor preview's Developer Mode from this game's deployment directory.
// Public release packaging replaces this module with a disabled stub.
export async function createDeveloper(options){
 const {DeveloperTools}=await import('../__dev/controller.js');
 return new DeveloperTools(options);
}
