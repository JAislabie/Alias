import { buildAliasEmail, buildNextAliasEmail, sanitizeAlias } from '../utils/alias.js';
import { STORAGE_KEY } from '../utils/storage.js';

(() => {
  const REQUIRED_IDS = ['aliasForm','email','alias','counter','reset','save','status','pasteCurrent','pasteNext','previewBlock'];
  function byId(id){ return document.getElementById(id); }

  document.addEventListener('DOMContentLoaded', init);

  function init(){
    const els = collect();
    if(!verify(els)) return;
    let settings = { email:'', alias:'', counter:'1' };
    let dirty = false;

    function collect(){ return {
      form: byId('aliasForm'), email: byId('email'), alias: byId('alias'), counter: byId('counter'),
      reset: byId('reset'), save: byId('save'), status: byId('status'), pasteCurrent: byId('pasteCurrent'),
      pasteNext: byId('pasteNext'), previewBlock: byId('previewBlock')
    }; }
    function verify(els){ const miss = REQUIRED_IDS.filter(i=>!byId(i)); if(miss.length){ console.warn('Missing elements',miss); return false;} return true; }
    function showStatus(msg,type){ if(!els.status) return; els.status.textContent = msg||''; els.status.className=''; if(type) els.status.classList.add(type); }
    function setDirty(v){ dirty=v; if(v) showStatus('Unsaved changes…'); else if(!els.status.classList.contains('error')) showStatus(''); }
    function fieldError(input, show){ if(!input) return; const msg=document.querySelector('.error-msg[data-for="'+input.id+'"]'); if(show){ input.classList.add('error'); msg&&msg.classList.add('active'); } else { input.classList.remove('error'); msg&&msg.classList.remove('active'); } }

    // Validate fields. When show=false, compute validity and disable Save without showing red errors (used on initial load)
    function validate(show=true){
      let ok = true;
      const emailValid = !!els.email.value && els.email.checkValidity();
      const aliasClean = sanitizeAlias(els.alias.value);
      const counterValid = !(els.counter.value && (+els.counter.value < 1));

      if(show){
        if(!emailValid){ fieldError(els.email, true); ok = false; } else { fieldError(els.email, false); }
        if(!aliasClean){ fieldError(els.alias, true); ok = false; } else { fieldError(els.alias, false); }
        if(!counterValid){ els.counter.classList.add('error'); ok = false; } else { els.counter.classList.remove('error'); }
      } else {
        // Silent mode: don't show errors yet, but still compute ok
        ok = emailValid && !!aliasClean && counterValid;
      }

      els.save.disabled = !ok;
      return ok;
    }

    function updatePreview(){ if(!els.previewBlock) return; const email=els.email.value.trim(); const alias=sanitizeAlias(els.alias.value.trim()); const counter=(els.counter.value||'1').trim();
      const current = buildAliasEmail(email, alias, counter); const next = buildNextAliasEmail({ email, alias, counter });
      els.previewBlock.innerHTML = `<div class="line"><span class="preview-label">Current</span><span>${current||'—'}</span></div><div class="line"><span class="preview-label">Next</span><span>${next||'—'}</span></div>`; }

    function autoFocusFirstEmpty(){ if(!settings.email){ els.email.focus(); return; } if(!settings.alias){ els.alias.focus(); return; } }

    function persist(){ if(!validate()){ showStatus('Fix highlighted fields.', 'error'); return; }
      settings={ email: els.email.value.trim(), alias: sanitizeAlias(els.alias.value.trim()), counter: (els.counter.value||'1').trim() };
      els.save.disabled=true; showStatus('Saving…');
      chrome.storage.sync.set({ [STORAGE_KEY]: settings }, ()=>{ if(chrome.runtime.lastError){ console.error('Save error',chrome.runtime.lastError); showStatus('Save failed.','error'); els.save.disabled=false; return; }
        els.save.disabled=false; setDirty(false); showStatus('Saved.','success'); updatePreview(); }); }

    function reset(){ els.email.value=''; els.alias.value=''; els.counter.value=''; [els.email,els.alias,els.counter].forEach(i=>fieldError(i,false)); setDirty(true); updatePreview(); showStatus('Cleared (not saved).'); setTimeout(()=>{ if(dirty) showStatus('Unsaved changes…'); },1800); }

    function load(){ chrome.storage.sync.get(STORAGE_KEY, data=>{ if(chrome.runtime.lastError){ console.warn('Load error', chrome.runtime.lastError); showStatus('Load failed.','error'); return; }
      const s=data[STORAGE_KEY]||{}; settings.email=s.email||''; settings.alias=s.alias||''; settings.counter=s.counter||'1';
      els.email.value=settings.email; els.alias.value=settings.alias; els.counter.value=settings.counter; setDirty(false); validate(false); updatePreview(); autoFocusFirstEmpty(); }); }

    // PASTE handlers
    async function triggerPaste(increment){ try { await chrome.runtime.sendMessage({ type: increment?'CMD_PASTE_NEXT':'CMD_PASTE_CURRENT' }); showStatus(increment?'Incrementing & pasting…':'Pasting…'); } catch(e){ console.warn('Paste message failed', e); showStatus('Paste message failed','error'); } }

    // Listen for status callback (optional future enhancement)
    chrome.runtime.onMessage.addListener(msg=>{ if(msg && msg.type==='PASTE_DONE'){ showStatus('Alias pasted.','success'); }});

    els.form.addEventListener('submit', e=>{ e.preventDefault(); persist(); });
    els.reset.addEventListener('click', reset);
    els.pasteCurrent.addEventListener('click', ()=> triggerPaste(false));
    els.pasteNext.addEventListener('click', ()=> triggerPaste(true));

    [els.email,els.alias,els.counter].forEach(el=>{ el.addEventListener('input', ()=>{ setDirty(true); validate(); updatePreview(); }); el.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); persist(); } }); });

    load();
  }
})();