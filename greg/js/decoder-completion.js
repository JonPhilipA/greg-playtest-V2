import {completionEmblem} from './completion-visual.js';
import {consoleCreditPreview} from './credit-visual.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** The shared circuit completion composition, with authoritative decoder rows. */
export function decoderCompletion(w,result){
 if(!result?.pass||!result.rows?.length||result.rows.some(row=>!row.pass))return '';
 const channels={temperature:['Cryogenic Temperature','Signed interpretation'],speed:['Equipment Speed','Unsigned interpretation']};
 const results=result.rows.map(row=>{const [name,mode]=channels[row.inputs.channel]||[row.label,'Interpretation'];return `<div class="decoder-result-row"><strong>✓ ${esc(name)}</strong><span>${esc(mode)}: <b>${esc(row.actual.value)}${row.unit==='°C'?'':' '}${esc(row.unit||'')}</b></span></div>`;}).join('');
 return `<div class="verification-window p11-completion-overlay is-results"><div class="verification-summary"><section class="verification-result-copy completion-card completion-success" role="dialog" aria-modal="true" aria-label="Decoder verification results" data-popup-kind="verification-results" data-popup-pagination="none"><button class="completion-close" data-console="return" aria-label="Review decoder">×</button><small class="verification-status-label">KESTREL / ENGINEERING DIAGNOSTIC</small><h3>ALL TESTS PASSED!</h3>${completionEmblem()}<h4 class="completion-puzzle">CRYOGENIC &amp; MOTOR DECODERS VERIFIED</h4><p class="verification-score">${result.rows.length} / ${result.rows.length} TESTS PASSED</p><div class="decoder-result-rows">${results}</div>${consoleCreditPreview(w,'cryo_signed')}<div class="diagnostic-controls"><button class="brass-button verification-engage" data-console="engage">ENGAGE SYSTEM</button><button class="brass-button subtle" data-console="return">REVIEW DECODER</button></div></section></div></div>`;
}
