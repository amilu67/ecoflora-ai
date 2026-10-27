import { SPECIES, lookupSpecies } from './data.js';
import { dbAll, dbPut, dbDelete, dbClear, dbGet } from './db.js';
import { DEFAULT_CONFIG } from './config.js';
import { setupCamera } from './camera.js';
import { searchGBIF, matchGBIF, wikiSummary, identifyPlant, resizePhoto, previewDataUrl } from './api.js';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
const safeUrl = url => /^https:\/\//i.test(url || '') ? esc(url) : '#';
const state = { filter: 'Tutte', search: '', remote: [], saved: [], history: [], file: null, preview: '', current: null, busy: false, apiKey: DEFAULT_CONFIG.plantnetApiKey, contributions: [] };
let cameraController;
const PLACEHOLDER = {
  health: {title:'Informazioni sanitarie non verificate', text:'Non esiste ancora in questo archivio una scheda specialistica verificata per questa specie. Non interpretare l’assenza di dati come assenza di rischi.', sources:[]},
  air: {title:'Impatto sull’aria non quantificato', text:'La tassonomia non fornisce misure di abbattimento degli inquinanti: servono studi e parametri ambientali.', sources:[]},
  climate: {title:'Impatto climatico non calcolato', text:'Assorbimento di CO₂ e raffrescamento non sono deducibili dal solo nome della specie.', sources:[]},
  biodiversity: {title:'Impatto ecologico da approfondire', text:'Servono fonti specialistiche e informazioni sull’habitat prima di valutare invasività o benefici.', sources:[]}
};

function showStatus(selector, message = '', kind = '') { const el = $(selector); el.textContent = message; el.className = `inline-status ${kind}`; }
let toastTimeout;
function toast(text) { const el = $('#toast'); el.textContent = text; el.classList.add('show'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => el.classList.remove('show'), 2800); }
function contributionFor(name) { return state.contributions.find(s => s.scientific.toLocaleLowerCase('it') === String(name).toLocaleLowerCase('it')); }
function speciesFor(name) {
  const base = lookupSpecies(name) || [...state.saved, ...state.remote].find(s => s.scientific.toLocaleLowerCase('it') === String(name).toLocaleLowerCase('it'));
  const amended = contributionFor(base?.scientific || name);
  return amended ? { ...(base || {}), ...amended, highlights:['Contributo studenti', 'Da verificare'] } : (base || { scientific:name, common:'', family:'', kind:'Specie' });
}
function isSaved(scientific) { return state.saved.some(s => s.scientific === scientific); }

function navigate(to) {
  if (!$('#view-' + to)) return;
  if (to !== 'identify') cameraController?.close(true);
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === 'view-' + to));
  document.querySelectorAll('.nav-link[data-view]').forEach(el => el.classList.toggle('active', el.dataset.view === to));
  if (to === 'saved') renderSaved();
  if (to === 'settings') $('#api-key').value = state.apiKey || '';
  if (to === 'lab') renderLabChoices();
  window.scrollTo({top:0,behavior:'instant'});
}

function card(s, index = 0) {
  const tags = s.highlights || (s.kind === 'Specie da GBIF' ? ['Fonte GBIF', 'Impatto da verificare'] : ['Scheda botanica']);
  const alertClass = tag => /invasiv|tossic|velenos|fortemente/i.test(tag) ? ' danger' : /allergen/i.test(tag) ? ' caution' : '';
  return `<article class="species-card">
    <div class="species-visual v${index % 6}"><i class="fa-solid ${esc(s.icon || 'fa-leaf')}"></i><span class="species-kind">${esc(s.kind || 'Specie')}</span></div>
    <div class="species-card-body"><h3>${esc(s.common || s.scientific)}</h3><span class="scientific-name">${esc(s.scientific)}</span><span class="family-label">${esc(s.family || 'Famiglia da verificare')}</span>
    <div class="chip-list">${tags.slice(0,2).map(tag => `<span class="chip${alertClass(tag)}">${esc(tag)}</span>`).join('')}</div>
    <div class="card-actions"><button class="open-card" data-action="detail" data-scientific="${esc(s.scientific)}">Apri scheda <i class="fa-solid fa-arrow-right"></i></button><button class="bookmark ${isSaved(s.scientific) ? 'on' : ''}" data-action="favorite" data-scientific="${esc(s.scientific)}" title="${isSaved(s.scientific) ? 'Rimuovi dai preferiti' : 'Salva nei preferiti'}" aria-label="Salva o rimuovi ${esc(s.common || s.scientific)}"><i class="${isSaved(s.scientific) ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i></button></div></div></article>`;
}
function renderSpecies() {
  const term = state.search.toLocaleLowerCase('it').trim();
  const catalog = [...SPECIES.map(s => speciesFor(s.scientific)), ...state.contributions.filter(s => !lookupSpecies(s.scientific))];
  const matches = catalog.filter(s => (state.filter === 'Tutte' || s.kind === state.filter) && [s.common,s.scientific,s.family,...(s.aliases||[])].some(value=>value.toLocaleLowerCase('it').includes(term)));
  $('#species-grid').innerHTML = matches.length ? matches.map(card).join('') : `<div class="empty-state"><i class="fa-solid fa-magnifying-glass"></i><strong>Nessuna specie nel catalogo</strong><p>Premi “Cerca online” per consultare la banca dati GBIF.</p></div>`;
  $('#species-count').textContent = catalog.length;
  $('#remote-wrap').hidden = !state.remote.length;
  $('#remote-grid').innerHTML = state.remote.map((s,i) => card(s, i + 1)).join('');
}
async function refreshLocal() {
  try { state.saved = (await dbAll('records')).filter(item=>item.favorite); state.history = (await dbAll('history')).reverse(); state.contributions = await dbAll('contributions'); }
  catch (error) { toast('Archivio IndexedDB non disponibile'); }
  $('#saved-count').textContent = state.saved.length;
  renderSpecies();
  if ($('#view-saved').classList.contains('active')) renderSaved();
}
function renderSaved() {
  $('#saved-grid').innerHTML = state.saved.length ? state.saved.map(card).join('') : `<div class="empty-state"><i class="fa-regular fa-bookmark"></i><strong>Ancora nessuna specie salvata</strong><p>Apri una scheda e premi il segnalibro per ritrovarla qui.</p></div>`;
  $('#history-list').innerHTML = state.history.length ? state.history.slice(0, 30).map(item => `<article class="history-item">${item.preview ? `<img class="history-thumb" src="${esc(item.preview)}" alt="Fotografia riconosciuta">` : '<span class="history-thumb"></span>'}<div><strong>${esc(item.common || item.scientific)}</strong><span>${esc(item.scientific)} · ${new Date(item.date).toLocaleString('it-IT')} · ${(item.score*100).toFixed(1)}%</span></div><button data-action="detail" data-scientific="${esc(item.scientific)}" aria-label="Apri scheda"><i class="fa-solid fa-arrow-right"></i></button></article>`).join('') : `<div class="empty-state"><i class="fa-solid fa-clock-rotate-left"></i><strong>Nessun riconoscimento registrato</strong><p>Le identificazioni confermate appariranno in questa cronologia locale.</p></div>`;
}
async function toggleFavorite(name) {
  try {
    if (isSaved(name)) { await dbDelete('records', name); toast('Rimosso dalle schede salvate'); }
    else {
      const s = speciesFor(name);
      await dbPut('records', {scientific:s.scientific,common:s.common,family:s.family,kind:s.kind,icon:s.icon,highlights:s.highlights,favorite:true,savedAt:new Date().toISOString()});
      toast('Scheda salvata in IndexedDB');
    }
    await refreshLocal();
    if (state.current?.scientific === name && $('#species-dialog').open) $('#detail-bookmark').innerHTML = `<i class="fa-${isSaved(name)?'solid':'regular'} fa-bookmark"></i> ${isSaved(name)?'Salvata':'Salva scheda'}`;
  } catch (error) { toast('Errore nel salvataggio: ' + error.message); }
}

function impactCard(key, item) {
  const config = {health:['fa-heart-pulse','Salute umana'],air:['fa-wind','Qualità dell’aria'],climate:['fa-temperature-half','Clima e carbonio'],biodiversity:['fa-bug','Biodiversità']}[key];
  const klass = item.level === 'pericolo' ? 'danger' : item.level === 'attenzione' ? 'warn' : '';
  const sources = item.sources || [];
  return `<article class="impact-card ${klass}"><div class="impact-heading"><span class="impact-icon"><i class="fa-solid ${config[0]}"></i></span>${config[1]}</div><h4>${esc(item.title)}</h4><p>${esc(item.text)}</p>${sources.length ? `<div class="impact-sources">${sources.map(src => `<a href="${safeUrl(src.url)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square"></i> ${esc(src.label)}</a>`).join('')}</div>` : '<div class="impact-sources"><span style="font-size:10px;color:#95a398">Nessuna fonte specialistica associata</span></div>'}</article>`;
}
function detailTemplate(s, remote = {}) {
  const custom = contributionFor(s.scientific);
  const reference = custom || lookupSpecies(s.scientific);
  const information = reference?.impacts || PLACEHOLDER;
  const summary = remote.wiki?.summary || 'Descrizione enciclopedica non disponibile al momento. Consulta il collegamento alla tassonomia per ulteriori informazioni.';
  const image = remote.wiki?.image;
  const gbif = remote.gbif;
  return `<div class="detail-hero"><div><span class="detail-eyebrow">SCHEDA BOTANICA · ECOFLORA AI</span><h2>${esc(reference?.common || s.common || s.scientific)}</h2><em>${esc(s.scientific)}</em><p>Famiglia: ${esc(gbif?.family || s.family || 'non verificata')}</p></div><button id="detail-close" class="detail-close" aria-label="Chiudi">&times;</button></div><div class="detail-inner"><div class="detail-top">${image ? `<img class="detail-image" src="${safeUrl(image)}" alt="${esc(s.scientific)}">` : '<div class="detail-placeholder"><i class="fa-solid fa-leaf"></i></div>'}<div><h3>Descrizione e classificazione</h3><p>${esc(summary)}</p><div class="meta-list"><span class="meta-pill">${esc(gbif?.genus || s.scientific.split(' ')[0])}</span><span class="meta-pill">${esc(gbif?.family || s.family || 'Tassonomia da verificare')}</span>${gbif?.status ? `<span class="meta-pill">${esc(gbif.status)}</span>` : ''}</div>${remote.loading ? '<p><i class="fa-solid fa-spinner fa-spin"></i> Caricamento fonti esterne...</p>' : ''}</div></div><h3 class="detail-section-title">Impatto sulla salute e sull'ambiente</h3><div class="impact-grid">${Object.keys(PLACEHOLDER).map(k => impactCard(k, information[k] || PLACEHOLDER[k])).join('')}</div><div class="info-note"><i class="fa-solid fa-shield-heart"></i><span><strong>${custom ? 'Contributo didattico degli studenti: NON ancora validato.' : reference ? 'Scheda qualitativa con fonti esplicite.' : 'Nessuna scheda ambientale specialistica disponibile per questa specie.'}</strong> Identificazione e tassonomia non dimostrano che una pianta sia sicura, commestibile o benefica. I valori di CO₂, qualità dell’aria e temperatura richiedono misure locali e modelli validati.</span></div><div class="detail-footer"><button class="btn btn-primary btn-small" id="detail-bookmark" data-action="favorite" data-scientific="${esc(s.scientific)}"><i class="fa-${isSaved(s.scientific)?'solid':'regular'} fa-bookmark"></i> ${isSaved(s.scientific)?'Salvata':'Salva scheda'}</button><button class="btn btn-secondary btn-small" data-action="edit" data-scientific="${esc(s.scientific)}"><i class="fa-solid fa-pen"></i> Migliora scheda</button><button class="btn btn-secondary btn-small" id="detail-print"><i class="fa-solid fa-print"></i> Stampa / PDF</button>${gbif?.url ? `<a class="detail-source-link" href="${safeUrl(gbif.url)}" target="_blank" rel="noopener noreferrer">GBIF <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}${remote.wiki?.url ? `<a class="detail-source-link" href="${safeUrl(remote.wiki.url)}" target="_blank" rel="noopener noreferrer">Wikipedia / crediti immagine <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}</div></div>`;
}
let detailRequest = 0;
async function openDetail(name) {
  const s = speciesFor(name);
  state.current = s;
  const token = ++detailRequest;
  const dialog = $('#species-dialog');
  $('#species-detail').innerHTML = detailTemplate(s, {loading:true});
  if (!dialog.open) dialog.showModal();
  const [gbifResult, wikiResult] = await Promise.allSettled([matchGBIF(s.scientific), wikiSummary(s.scientific)]);
  if (token !== detailRequest || !dialog.open) return;
  $('#species-detail').innerHTML = detailTemplate(s, {gbif:gbifResult.status==='fulfilled'?gbifResult.value:null,wiki:wikiResult.status==='fulfilled'?wikiResult.value:null});
}

async function doSearch(event) {
  event.preventDefault();
  const term = $('#search-input').value.trim();
  if (term.length < 3) { showStatus('#search-status','Scrivi almeno 3 caratteri per cercare su GBIF.','error'); return; }
  showStatus('#search-status','Ricerca internazionale in corso…');
  try {
    state.remote = await searchGBIF(term);
    renderSpecies();
    showStatus('#search-status',state.remote.length ? `Trovate ${state.remote.length} specie su GBIF. Le schede senza fonti ambientali sono indicate chiaramente.` : 'GBIF non ha restituito specie accettate per questa ricerca.',state.remote.length?'success':'');
  } catch (error) { showStatus('#search-status',`Impossibile completare la ricerca: ${error.message}. Il catalogo locale resta disponibile.`,'error'); }
}

async function selectPhoto(file) {
  if (!file) return;
  state.file = null;
  state.matches = [];
  $('#identify-button').disabled = true;
  $('#identify-results').innerHTML = '';
  try {
    state.file = await resizePhoto(file);
    state.preview = await previewDataUrl(state.file);
    $('#photo-preview').src = state.preview;
    $('#photo-preview').hidden = false;
    $('#photo-filename').textContent = `${file.name} · ${(state.file.size/1024).toFixed(0)} KB dopo ottimizzazione`;
    $('#identify-button').disabled = false;
    $('#identify-results').innerHTML = '';
    showStatus('#identify-status','Foto pronta per il riconoscimento.');
  } catch (error) { showStatus('#identify-status',error.message,'error'); }
}

async function runIdentification() {
  if (!state.file || state.busy) return;
  const key = state.apiKey || '';
  if (!key.trim()) {
    showStatus('#identify-status', 'Per riconoscere la pianta, apri Impostazioni API e inserisci la tua chiave Pl@ntNet personale.', 'error');
    return;
  }
  state.busy = true; $('#identify-button').disabled = true;
  $('#identify-button').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Riconoscimento in corso...';
  showStatus('#identify-status','Invio della foto a Pl@ntNet. I dati della foto lasciano il tuo browser.');
  $('#identify-results').innerHTML = '';
  try {
    const matches = await identifyPlant(state.file, key);
    if (!matches.length) { showStatus('#identify-status','Nessuna specie riconosciuta. Prova un’immagine più chiara.','error'); return; }
    state.matches = matches;
    showStatus('#identify-status','Ecco le possibili identificazioni. Verifica sempre prima di confermare.','success');
    $('#identify-results').innerHTML = matches.map((item,i) => `<div class="result-row"><span class="result-score">${(item.score*100).toFixed(1)}%</span><div><strong>${esc(item.common || item.scientific)}</strong><small>${esc(item.scientific)}</small></div><button data-action="confirm" data-index="${i}">Apri scheda</button></div>`).join('');
  } catch (error) { showStatus('#identify-status',error.message,'error'); }
  finally { state.busy = false; $('#identify-button').disabled = false; $('#identify-button').innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Analizza con intelligenza artificiale'; }
}

async function confirmMatch(index) {
  const item = state.matches?.[index]; if (!item) return;
  if (!lookupSpecies(item.scientific) && !state.remote.some(s=>s.scientific===item.scientific)) state.remote.push({scientific:item.scientific,common:item.common,family:item.family,kind:'Specie da AI'});
  try { await dbPut('history',{scientific:item.scientific,common:item.common,score:item.score,date:Date.now(),preview:state.preview}); await refreshLocal(); }
  catch (error) { toast('Impossibile salvare la cronologia'); }
  openDetail(item.scientific);
}

const AREAS = ['health','air','climate','biodiversity'];
const AREA_LABELS = { health:'Salute umana',air:'Qualità dell’aria',climate:'Clima e carbonio',biodiversity:'Biodiversità' };
function renderLabChoices() {
  const names=[...new Set([...SPECIES,...state.contributions,...state.saved,...state.remote].map(s=>s.scientific))].sort((a,b)=>a.localeCompare(b,'it'));
  $('#known-species').innerHTML=names.map(s=>`<option value="${esc(s)}"></option>`).join('');
}
function loadContributionForm(name) {
  const base = speciesFor(name);
  if(!name || !base.scientific) {showStatus('#lab-status','Inserisci un nome scientifico.','error');return;}
  $('#lab-scientific').value = base.scientific;
  $('#lab-common').value = base.common || '';
  $('#lab-family').value = base.family || '';
  $('#lab-kind').value = ['Albero','Arbusto','Erbacea'].includes(base.kind) ? base.kind : 'Specie';
  for(const area of AREAS) {
    $('#lab-'+area).value=base.impacts?.[area]?.text || '';
    $('#lab-source-'+area).value=base.impacts?.[area]?.sources?.[0]?.url || '';
  }
  $('#lab-notes').value=contributionFor(base.scientific)?.notes || '';
  showStatus('#lab-status',contributionFor(base.scientific)?'Contributo locale caricato.':'Scheda caricata: rivedi testi e fonti prima di salvarla.');
}
function validSource(raw) {
  if(!raw) return '';
  try {const url=new URL(raw);if(url.protocol==='https:' && url.hostname) return url.href;}catch(_e){}
  throw new Error('Le fonti devono essere URL HTTPS validi.');
}
function sanitizeContribution(raw) {
  if (!raw || typeof raw!=='object') throw new Error('Scheda non valida.');
  const scientific=String(raw.scientific||'').trim().slice(0,140);
  if(scientific.split(/\s+/).length < 2 || !/^[\p{L}\p{M}×.\-\s]+$/u.test(scientific)) throw new Error('Inserisci un nome scientifico binomiale valido.');
  const contribution={scientific,common:String(raw.common||'').slice(0,100),family:String(raw.family||'').slice(0,120),kind:['Albero','Arbusto','Erbacea'].includes(raw.kind)?raw.kind:'Specie',notes:String(raw.notes||'').slice(0,700),updatedAt:new Date().toISOString(),origin:'contributo studente',impacts:{}};
  let filled=0;
  for(const area of AREAS){
    const info=raw.impacts?.[area]||{};
    const body=String(info.text||'').trim().slice(0,1600);
    const src=validSource(info.sources?.[0]?.url || '');
    if(body && !src) throw new Error(`Aggiungi una fonte HTTPS per: ${AREA_LABELS[area]}.`);
    if(body) filled++;
    contribution.impacts[area]=body?{title:`${AREA_LABELS[area]} · contributo da verificare`,text:body,sources:[{label:'Fonte segnalata dagli studenti',url:src}],level:''}:PLACEHOLDER[area];
  }
  if(!filled) throw new Error('Compila almeno un’area con una fonte.');
  return contribution;
}
async function saveContribution(event){
  event.preventDefault();
  const draft={scientific:$('#lab-scientific').value,common:$('#lab-common').value,family:$('#lab-family').value,kind:$('#lab-kind').value,notes:$('#lab-notes').value,impacts:{}};
  for(const area of AREAS){draft.impacts[area]={text:$('#lab-'+area).value,sources:[{url:$('#lab-source-'+area).value}]};}
  try {const item=sanitizeContribution(draft);await dbPut('contributions',item);await refreshLocal();renderLabChoices();showStatus('#lab-status',`Scheda «${item.scientific}» salvata. Contributo da sottoporre a revisione.`, 'success');}
  catch(error){showStatus('#lab-status',error.message,'error');}
}
async function deleteContribution(){
  const scientific=$('#lab-scientific').value.trim();
  const entry=contributionFor(scientific);
  if(!entry){showStatus('#lab-status','Nessun contributo locale da eliminare.');return;}
  if(!confirm('Eliminare il contributo per '+scientific+'? La scheda originale, se presente, resterà disponibile.'))return;
  await dbDelete('contributions',entry.scientific);await refreshLocal();renderLabChoices();showStatus('#lab-status','Contributo eliminato.','success');
}
function downloadJson(data, name){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
}
async function exportArchive(){
  try {
    const data={application:'EcoFlora AI',schemaVersion:1,exportedAt:new Date().toISOString(),contributions:await dbAll('contributions'),records:await dbAll('records'),history:await dbAll('history')};
    // Le credenziali sono volutamente ESCLUSE dall'export.
    downloadJson(data,'ecoflora-archivio-'+new Date().toISOString().slice(0,10)+'.json');
    showStatus('#import-status','Archivio esportato senza la chiave API.','success');
  } catch(error){showStatus('#import-status','Esportazione non riuscita: '+error.message,'error');}
}
async function importArchive(event){
  const file=event.target.files?.[0];if(!file)return;
  try{
    if(file.size>10*1024*1024)throw new Error('File troppo grande (massimo 10 MB).');
    const data=JSON.parse(await file.text());
    if(data.application!=='EcoFlora AI'||data.schemaVersion!==1)throw new Error('Formato non riconosciuto.');
    for(const key of ['contributions','records','history']) if(!Array.isArray(data[key])||data[key].length>500)throw new Error('Archivio incompleto o troppo grande.');
    // Prima si convalidano TUTTE le schede per ridurre import parziali inattesi.
    const contributions=data.contributions.map(sanitizeContribution);
    const records=data.records.filter(s=>s&&typeof s.scientific==='string'&&s.scientific.length<=140).map(s=>({scientific:s.scientific.slice(0,140),common:String(s.common||'').slice(0,100),family:String(s.family||'').slice(0,120),kind:['Albero','Arbusto','Erbacea'].includes(s.kind)?s.kind:'Specie',favorite:true}));
    const history=data.history.filter(s=>s&&typeof s.scientific==='string'&&s.scientific.length<=140).map(s=>({scientific:s.scientific.slice(0,140),common:String(s.common||'').slice(0,100),date:Number.isFinite(+s.date)?+s.date:Date.now(),score:Math.max(0,Math.min(1,Number(s.score)||0)),preview:typeof s.preview==='string'&&/^data:image\/(jpeg|png|webp);base64,/i.test(s.preview)&&s.preview.length<300000?s.preview:''}));
    for(const item of contributions)await dbPut('contributions',item);
    for(const item of records)await dbPut('records',item);
    for(const item of history)await dbPut('history',item);
    await refreshLocal();renderLabChoices();showStatus('#import-status',`Importati ${contributions.length} contributi, ${records.length} preferiti e ${history.length} osservazioni. I dati esistenti sono stati mantenuti.`, 'success');
  }catch(error){showStatus('#import-status','Importazione non riuscita: '+error.message,'error');}
  finally{event.target.value='';}
}

async function setup() {
  $('#connection-label').textContent = navigator.onLine ? 'Online' : 'Offline';
  document.querySelector('.connection').classList.toggle('offline',!navigator.onLine);
  window.addEventListener('online', () => { $('#connection-label').textContent='Online'; document.querySelector('.connection').classList.remove('offline'); });
  window.addEventListener('offline', () => { $('#connection-label').textContent='Offline'; document.querySelector('.connection').classList.add('offline'); });
  document.addEventListener('click', async event => {
    const view = event.target.closest('[data-view]');
    if (view) { event.preventDefault(); navigate(view.dataset.view); return; }
    const action = event.target.closest('[data-action]');
    if (action) {
      if (action.dataset.action === 'detail') openDetail(action.dataset.scientific);
      if (action.dataset.action === 'favorite') toggleFavorite(action.dataset.scientific);
      if (action.dataset.action === 'confirm') confirmMatch(Number(action.dataset.index));
      if (action.dataset.action === 'edit') { $('#species-dialog').close(); navigate('lab'); loadContributionForm(action.dataset.scientific); }
    }
  });
  $('#settings-shortcut').addEventListener('click',()=>navigate('settings'));
  $('#search-input').addEventListener('input', event => { state.search=event.target.value; renderSpecies(); if (!state.search) {state.remote=[];renderSpecies();showStatus('#search-status');} });
  $('#search-form').addEventListener('submit',doSearch);
  document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {state.filter=button.dataset.filter; document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active', b===button));renderSpecies();}));
  $('#photo-input').addEventListener('change',async event=>{
    try { await selectPhoto(event.target.files?.[0]); } finally { event.target.value=''; }
  });
  cameraController = setupCamera({ onPhoto: selectPhoto, onStatus: (message, kind) => showStatus('#camera-status', message, kind) });
  const dropzone = $('#dropzone');
  for (const eventName of ['dragenter','dragover']) dropzone.addEventListener(eventName,event=>{event.preventDefault();dropzone.classList.add('dragging');});
  for (const eventName of ['dragleave','drop']) dropzone.addEventListener(eventName,event=>{event.preventDefault();dropzone.classList.remove('dragging');});
  dropzone.addEventListener('drop',event=>selectPhoto(event.dataTransfer?.files?.[0]));
  $('#identify-button').addEventListener('click',runIdentification);
  $('#save-key').addEventListener('click', async () => {
    const value = $('#api-key').value.trim();
    if (!value) {showStatus('#settings-status','Inserisci una chiave API oppure premi «Rimuovi chiave salvata» per cancellare quella locale.','error'); return;}
    try { await dbPut('settings',{key:'plantnetApiKey', value}); state.apiKey=value; showStatus('#settings-status','Chiave personale salvata in IndexedDB su questo browser. Non è aggiunta al progetto GitHub.','success'); }
    catch(e) { showStatus('#settings-status','Errore nel salvataggio locale: '+e.message,'error'); }
  });
  $('#reset-key').addEventListener('click', async () => {
    try { await dbDelete('settings','plantnetApiKey'); state.apiKey=''; $('#api-key').value=''; showStatus('#settings-status','Chiave API locale rimossa. Per usare il riconoscimento, inseriscine una personale.','success'); }
    catch(e) { showStatus('#settings-status','Errore: '+e.message,'error'); }
  });
  $('#test-api').addEventListener('click',async () => {
    showStatus('#settings-status','Controllo connessione Pl@ntNet in corso…');
    const key = $('#api-key').value.trim();
    if (!key) {showStatus('#settings-status','Inserisci una chiave API.','error');return;}
    try {
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);let res;
      try {res=await fetch(`https://my-api.plantnet.org/v2/_status?api-key=${encodeURIComponent(key)}`,{signal:controller.signal});} finally {clearTimeout(timer);}
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      showStatus('#settings-status','Pl@ntNet raggiungibile. La chiave e i permessi per identificare foto devono comunque essere validi.','success');
    } catch(e) {showStatus('#settings-status','Connessione non riuscita. Verifica chiave, Internet e origine autorizzata (CORS). Dettaglio: '+e.message,'error');}
  });
  $('#toggle-key').addEventListener('click',()=>{$('#api-key').type=$('#api-key').type==='password'?'text':'password';});
  $('#species-dialog').addEventListener('click',event=>{if(event.target.id==='species-dialog'||event.target.closest('#detail-close'))$('#species-dialog').close();if(event.target.closest('#detail-print'))window.print();});
  $('#species-dialog').addEventListener('close',()=>{detailRequest++;});
  $('#clear-history').addEventListener('click',async()=>{if(!state.history.length)return;if(!confirm('Vuoi cancellare la cronologia locale dei riconoscimenti?'))return;try{await dbClear('history');await refreshLocal();toast('Cronologia cancellata');}catch(err){toast('Errore nella cancellazione');}});
  $('#contribution-form').addEventListener('submit',saveContribution);
  $('#load-contribution').addEventListener('click',()=>loadContributionForm($('#lab-scientific').value.trim()));
  $('#delete-contribution').addEventListener('click',deleteContribution);
  $('#export-json').addEventListener('click',exportArchive);
  $('#import-file').addEventListener('change',importArchive);
  renderSpecies(); await refreshLocal();
  try { state.apiKey = (await dbGet('settings','plantnetApiKey'))?.value || DEFAULT_CONFIG.plantnetApiKey; }
  catch(e) { state.apiKey = DEFAULT_CONFIG.plantnetApiKey; }
  $('#api-key').value=state.apiKey;
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
setup().catch(error => { console.error(error); showStatus('#search-status','Impossibile inizializzare una funzionalità: '+error.message,'error'); });
