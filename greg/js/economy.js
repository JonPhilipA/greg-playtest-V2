// Balancing only. Stable puzzle/cosmetic identities never reprice historical receipts.
export const ECONOMY_VERSION=2;
export const NO_HINTS_RATE=.25;
export const noHintsCredits=base=>Math.round(base*NO_HINTS_RATE);
export const MILESTONE_REWARDS=Object.freeze(Object.fromEntries([
 ['nandor','nand-fabricator','NAND Fabricator Restored',500,'fabrication-restored'],
 ['addsub','arithmetic-systems','Arithmetic Systems Restored',5000],
 ['alu','alu-restored','ALU Restored',7500],
 ['array_recovery','memory-systems','Memory Systems Restored',12500],
 ['override','bridge-systems','Final Bridge Systems Restored',20000],
].map(([puzzleId,id,name,amount,condition='repair-applied'])=>[puzzleId,Object.freeze({id,name,amount,condition})])));
export const PUZZLE_REWARDS=Object.freeze(Object.fromEntries([
 ['ventilation',100],['security',150],['alarm',200],['scrubber',300],['safetycutoff',400],
 ['nandnot',550],['nandand',700],['nandor',900],['sensordiff',1100],['xorfab',1300],
 ['cryo_signed',1600],['hull',1900],['pressure_width',2200],['log_overflow',2600],
 ['navbits',3000],['trajectory',3500],['ripple_adder',4000],['twos_complement',4500],['addsub',5000],
 ['float_nav',5500],['mux',6000],['alu',6500],['memory',7000],['reactor',7500],['flightmemory',8000],
 ['array_recovery',8500],['first_instruction',9000],['flight_program',9500],['override',10000],
].map(([id,base],index)=>[id,Object.freeze({id,number:index+1,base,milestone:MILESTONE_REWARDS[id]||null})])));
export const COSMETIC_PRICE_PAIRS=Object.freeze([
 ['regular','standard',0],['navy','deepsea',750],['pink','rose',1200],['plumber','redline',2000],
 ['miner','orebot',2000],['scout','scoutsignal',3500],['speedster','velocity',6000],['hazmat','caution',6000],
 ['nebula','void',10000],['shadow','stealth',18000],['ranger','guardian',30000],['gold','gilded',60000],
 ['prismatic','spectrum',85000],['galaxy','cosmos',100000],
].map(Object.freeze));
export const COSMETIC_PRICES=Object.freeze(Object.fromEntries(['engineer','greg'].map((character,index)=>[character,Object.freeze(Object.fromEntries(COSMETIC_PRICE_PAIRS.map(pair=>[pair[index],pair[2]])))])));
export function campaignEconomyTotals(){
 const rewards=Object.values(PUZZLE_REWARDS),base=rewards.reduce((n,r)=>n+r.base,0),noHints=rewards.reduce((n,r)=>n+noHintsCredits(r.base),0),milestones=Object.values(MILESTONE_REWARDS).reduce((n,m)=>n+m.amount,0);
 return Object.freeze({base,noHints,milestones,maximum:base+noHints+milestones,allHints:base+milestones});
}
