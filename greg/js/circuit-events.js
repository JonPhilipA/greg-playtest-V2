/** Read-only descriptions of actual graph edits, shared by production and disposable practice. */
export function circuitEditEvents(before,after,{placement=true}={}){
 const key=w=>w.from+':'+w.out+'>'+w.to+':'+w.in;
 const added=after.wires.filter(w=>!before.wires.some(old=>key(old)===key(w))),removed=before.wires.filter(w=>!after.wires.some(next=>key(next)===key(w)));
 const placed=after.nodes.filter(n=>!n.fixed&&!before.nodes.some(old=>old.id===n.id)),lost=before.nodes.filter(n=>!n.fixed&&!after.nodes.some(next=>next.id===n.id)),events=[];
 if(placement&&placed.length)events.push({type:'component.placed',parameters:{nodeIds:placed.map(n=>n.id)}});
 if(added.length)events.push({type:'wire.connected',parameters:{count:added.length}});
 else if(removed.length&&!lost.length)events.push({type:'wire.disconnected',parameters:{count:removed.length}});
 if(lost.length)events.push({type:after.nodes.some(n=>!n.fixed)?'component.removed':'panel.cleared',parameters:{nodeIds:lost.map(n=>n.id),wireCount:removed.length}});
 return events;
}
