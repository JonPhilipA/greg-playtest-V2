// Exact canonical functional keys, not a lossy hash. Render/layout metadata is excluded.
const sorted = value => Array.isArray(value)?value.map(sorted):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,sorted(value[k])])):value;
export const canonicalJSON = value => JSON.stringify(sorted(value));
export function functionalSignature(circuit){
  if(!circuit||!Array.isArray(circuit.nodes)||!Array.isArray(circuit.wires))throw Error('Circuit needs nodes and wires.');
  const nodes=circuit.nodes.map(n=>Object.fromEntries(['id','type','width','role','value','faulty','fixed'].filter(k=>n[k]!==undefined).map(k=>[k,n[k]]))).sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  const wires=circuit.wires.map(w=>({from:w.from,out:w.out,to:w.to,in:w.in})).sort((a,b)=>canonicalJSON(a).localeCompare(canonicalJSON(b)));
  return canonicalJSON({nodes,wires,...(circuit.configuration!==undefined?{configuration:circuit.configuration}:{})});
}
// Non-security source fingerprint. Exact snapshots are retained; certificates are revalidated.
export function sourceDigest(text){let n=2166136261;for(let i=0;i<text.length;i++){n^=text.charCodeAt(i);n=Math.imul(n,16777619);}return (n>>>0).toString(16).padStart(8,'0');}
