async function getJson(url, timeout = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const r = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`Servizio non disponibile (HTTP ${r.status})`);
    return await r.json();
  } finally { clearTimeout(timer); }
}

export async function searchGBIF(query) {
  const q = new URLSearchParams({ q: query, kingdom: 'Plantae', rank: 'SPECIES', limit: '24' });
  const json = await getJson(`https://api.gbif.org/v1/species/search?${q}`);
  const seen = new Set();
  return (json.results || []).filter(item => {
    const name = item.canonicalName || item.scientificName;
    if (!name || item.kingdom !== 'Plantae' || (item.taxonomicStatus && item.taxonomicStatus !== 'ACCEPTED') || seen.has(name)) return false;
    seen.add(name); return true;
  }).slice(0, 12).map(item => ({
    scientific: item.canonicalName || item.scientificName,
    common: item.vernacularName || '', family: item.family || 'Non specificata',
    kind: 'Specie da GBIF', key: item.key
  }));
}

export async function matchGBIF(scientific) {
  const q = new URLSearchParams({ name: scientific, kingdom: 'Plantae' });
  const json = await getJson(`https://api.gbif.org/v1/species/match?${q}`);
  if (!json.usageKey || json.matchType === 'NONE') return null;
  return {
    key: json.usageKey, scientific: json.canonicalName || json.scientificName,
    family: json.family, genus: json.genus, order: json.order, rank: json.rank,
    status: json.status, confidence: json.confidence,
    url: `https://www.gbif.org/species/${json.usageKey}`
  };
}

export async function wikiSummary(scientific) {
  const query = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: `intitle:"${scientific}" OR "${scientific}"`,
    gsrnamespace: '0', gsrlimit: '1', prop: 'extracts|pageimages|info', inprop: 'url',
    exintro: '1', explaintext: '1', exsentences: '4', piprop: 'thumbnail', pithumbsize: '750',
    format: 'json', formatversion: '2', origin: '*'
  });
  const json = await getJson(`https://it.wikipedia.org/w/api.php?${query}`);
  const page = json.query?.pages?.[0];
  if (!page || page.missing) return null;
  return {
    title: page.title,
    summary: (page.extract || '').slice(0, 1000),
    image: page.thumbnail?.source || '',
    url: page.fullurl || `https://it.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ', '_'))}`
  };
}

export async function identifyPlant(file, apiKey) {
  if (!apiKey?.trim()) throw new Error('Inserisci prima la tua chiave API Pl@ntNet nelle impostazioni.');
  const payload = new FormData();
  payload.append('images', file, file.name || 'pianta.jpg');
  const params = new URLSearchParams({ 'api-key': apiKey.trim(), lang: 'it', 'nb-results': '5' });
  let response;
  try {
    response = await fetch(`https://my-api.plantnet.org/v2/identify/all?${params}`, {
      method: 'POST', body: payload
    });
  } catch (error) {
    throw new Error('Connessione a Pl@ntNet non riuscita. Controlla Internet e l’autorizzazione CORS del tuo dominio nelle impostazioni Pl@ntNet.');
  }
  if (!response.ok) {
    let body = {};
    try { body = await response.json(); } catch (_) { /* risposta non JSON */ }
    throw new Error(body.message || body.error || `Pl@ntNet ha risposto con HTTP ${response.status}. Controlla la chiave e le autorizzazioni.`);
  }
  const json = await response.json();
  return (json.results || []).slice(0, 5).map(r => ({
    scientific: r.species?.scientificNameWithoutAuthor || r.species?.scientificName || 'Specie sconosciuta',
    common: r.species?.commonNames?.[0] || '',
    family: r.species?.family?.scientificNameWithoutAuthor || '',
    score: r.score || 0
  }));
}

export async function resizePhoto(file, maxDimension = 1400, quality = 0.83) {
  if (!file?.type?.startsWith('image/')) throw new Error('Seleziona un file immagine valido.');
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('Impossibile elaborare la fotografia.');
  return new File([blob], 'ecoflora-foto.jpg', { type: 'image/jpeg' });
}

export async function previewDataUrl(file, maxDimension = 420) {
  const resized = await resizePhoto(file, maxDimension, .72);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(resized);
  });
}
