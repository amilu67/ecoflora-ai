// Schede selezionate: informazioni qualitative con riferimenti, senza punteggi inventati.
export const GENERAL_SOURCE = {
  label: 'US Forest Service — metodi i-Tree (servizi ecosistemici e limiti)',
  url: 'https://research.fs.usda.gov/treesearch/68438'
};

export const SPECIES = [
  {
    scientific: 'Olea europaea', common: 'Olivo', family: 'Oleaceae', kind: 'Albero', icon: 'fa-tree',
    aliases: ['ulivo', 'olive', 'oliva'],
    highlights: ['Polline allergenico', 'Albero sempreverde'],
    impacts: {
      health: { level: 'attenzione', title: 'Polline con rilevanza allergologica', text: 'Il polline dell’olivo può provocare sintomi respiratori nelle persone sensibilizzate. L’esposizione varia secondo stagione, luogo e condizioni meteorologiche.', sources: [{ label: 'Polleninformation — Olea europaea', url: 'https://www.polleninformation.at/allergie/pflanzenkompass/olive-olea-europea' }] },
      air: { title: 'Interazione con la qualità dell’aria', text: 'La chioma può intercettare parte del particolato; non è possibile attribuire a questa specie un valore fisso di rimozione senza misure del singolo albero e del sito.', sources: [GENERAL_SOURCE] },
      climate: { title: 'Ombra e carbonio', text: 'Come albero, può offrire ombra e immagazzinare carbonio nella biomassa; l’effetto effettivo dipende da età, dimensioni, gestione e contesto.', sources: [GENERAL_SOURCE] },
      biodiversity: { title: 'Ruolo ecologico locale', text: 'Le interazioni con fauna e comunità vegetali dipendono dal paesaggio e dalla gestione. Non è disponibile qui una stima della biodiversità prodotta.', sources: [] }
    }
  },
  {
    scientific: 'Betula pendula', common: 'Betulla bianca', family: 'Betulaceae', kind: 'Albero', icon: 'fa-tree',
    aliases: ['betulla'], highlights: ['Polline allergenico', 'Caducifoglia'],
    impacts: {
      health: { level: 'attenzione', title: 'Polline allergenico documentato', text: 'Il polline di Betula pendula è un importante allergene primaverile. In persone sensibilizzate possono comparire sintomi respiratori e reazioni crociate con alcuni alimenti.', sources: [{ label: 'Polleninformation — Betula spp.', url: 'https://www.polleninformation.at/allergie/pflanzenkompass/birke-betula-spp?C=14&cHash=79d435e04c879b1ef5514db459f2c175&iframe=1' }] },
      air: { title: 'Potenziale di intercettazione', text: 'Le foglie possono trattenere alcuni inquinanti atmosferici; la quantità varia con superficie fogliare, posizione e condizioni ambientali.', sources: [GENERAL_SOURCE] },
      climate: { title: 'Ombra stagionale', text: 'La chioma caducifoglia produce ombra nella stagione vegetativa. Non vengono calcolate riduzioni di temperatura per singola specie.', sources: [GENERAL_SOURCE] },
      biodiversity: { title: 'Habitat e interazioni', text: 'Può contribuire alla struttura degli habitat arborei; benefici specifici da valutare in funzione dell’ecosistema locale.', sources: [] }
    }
  },
  {
    scientific: 'Cupressus sempervirens', common: 'Cipresso mediterraneo', family: 'Cupressaceae', kind: 'Albero', icon: 'fa-tree',
    aliases: ['cipresso'], highlights: ['Polline allergenico', 'Sempreverde'],
    impacts: {
      health: { level: 'attenzione', title: 'Allergia al polline di cipresso', text: 'Il polline di Cupressus sempervirens è associato ad allergie respiratorie, soprattutto nelle aree mediterranee. Il periodo di pollinazione cambia in funzione del luogo.', sources: [{ label: 'PubMed — Cypress pollen allergy', url: 'https://pubmed.ncbi.nlm.nih.gov/24314710/' }] },
      air: { title: 'Chioma sempreverde', text: 'La superficie fogliare può intercettare particelle atmosferiche; il beneficio netto dipende da più fattori e non è quantificabile con la sola identificazione.', sources: [GENERAL_SOURCE] },
      climate: { title: 'Biomassa e microclima', text: 'La vegetazione arborea partecipa al ciclo del carbonio e può influenzare il microclima, ma servono dati sul singolo esemplare per stimarne gli effetti.', sources: [GENERAL_SOURCE] },
      biodiversity: { title: 'Ruolo paesaggistico', text: 'La presenza e il valore ecologico variano in base all’habitat e alle specie con cui coesiste.', sources: [] }
    }
  },
  {
    scientific: 'Nerium oleander', common: 'Oleandro', family: 'Apocynaceae', kind: 'Arbusto', icon: 'fa-seedling',
    aliases: ['oleandro rosa'], highlights: ['Tossico se ingerito', 'Ornamentale'],
    impacts: {
      health: { level: 'pericolo', title: 'Pianta velenosa: rischio grave se ingerita', text: 'Tutte le parti dell’oleandro contengono sostanze tossiche. L’ingestione può determinare sintomi anche gravi, inclusi disturbi del ritmo cardiaco. In caso di sospetta ingestione, contattare subito il centro antiveleni o l’emergenza sanitaria.', sources: [{ label: 'MedlinePlus — Oleander poisoning', url: 'https://medlineplus.gov/ency/article/002884.htm' }] },
      air: { title: 'Dati insufficienti per una stima', text: 'La scheda non attribuisce all’oleandro valori quantitativi di abbattimento dell’inquinamento atmosferico.', sources: [] },
      climate: { title: 'Effetti dipendenti dal sito', text: 'Come arbusto, può contribuire alla copertura vegetale; non è disponibile una stima attendibile del carbonio o del raffrescamento.', sources: [] },
      biodiversity: { title: 'Interazioni locali', text: 'Le relazioni con insetti e fauna variano in base al contesto; non è presente qui una valutazione scientifica comparativa.', sources: [] }
    }
  },
  {
    scientific: 'Ambrosia artemisiifolia', common: 'Ambrosia comune', family: 'Asteraceae', kind: 'Erbacea', icon: 'fa-leaf',
    aliases: ['ambrosia', 'ragweed'], highlights: ['Polline fortemente allergenico', 'Invasiva'],
    impacts: {
      health: { level: 'pericolo', title: 'Polline ad elevato impatto allergologico', text: 'Il polline di ambrosia può causare rinite allergica e asma in persone sensibilizzate. Il rischio di esposizione dipende dalla concentrazione pollinica locale.', sources: [{ label: 'European Climate and Health Observatory — Pollen', url: 'https://climate-adapt.eea.europa.eu/en/observatory/topics/health-impacts/pollen' }] },
      air: { title: 'Polline aerodisperso', text: 'La principale criticità per l’aria è l’esposizione al polline allergenico, non una misura diretta di inquinanti chimici.', sources: [{ label: 'Pubblicazioni UE — Common ragweed', url: 'https://op.europa.eu/en/publication-detail/-/publication/4a633a9e-5da6-404b-8082-b0e4be4b39f1/language-en' }] },
      climate: { title: 'Nessuna stima quantitativa', text: 'Non è appropriato attribuire una quantità di CO₂ assorbita a partire dalla sola specie.', sources: [] },
      biodiversity: { level: 'attenzione', title: 'Specie alloctona invasiva', text: 'È riconosciuta come infestante problematica in varie aree europee, con ripercussioni potenziali su agricoltura e gestione del territorio.', sources: [{ label: 'EPPO — Liste delle piante invasive', url: 'https://www.eppo.int/ACTIVITIES/invasive_alien_plants/iap_lists' }] }
    }
  },
  {
    scientific: 'Ailanthus altissima', common: 'Ailanto', family: 'Simaroubaceae', kind: 'Albero', icon: 'fa-tree',
    aliases: ['albero del paradiso'], highlights: ['Specie invasiva', 'Albero'],
    impacts: {
      health: { title: 'Valutazione sanitaria non disponibile', text: 'Non è disponibile in questa scheda una valutazione verificata dei rischi sanitari per esposizione ordinaria.', sources: [] },
      air: { title: 'Nessun valore di rimozione stimato', text: 'Anche per questa specie l’effetto sugli inquinanti richiederebbe dati reali sull’esemplare e sull’ambiente.', sources: [GENERAL_SOURCE] },
      climate: { title: 'Biomassa non equivalente a beneficio netto', text: 'La crescita e l’accumulo di biomassa non annullano il possibile danno ecologico di una specie invasiva.', sources: [GENERAL_SOURCE] },
      biodiversity: { level: 'pericolo', title: 'Impatto sulla biodiversità documentato', text: 'L’ailanto è classificato come specie esotica invasiva di rilevanza unionale. Studi in habitat mediterranei documentano riduzioni della ricchezza e diversità floristica nelle aree invase.', sources: [{ label: 'EPPO — Ailanthus altissima', url: 'https://gd.eppo.int/taxon/AILAL/categorization' }, { label: 'EPPO — impatti negli habitat mediterranei', url: 'https://gd.eppo.int/reporting/article-7142' }] }
    }
  },
  {
    scientific: 'Pinus pinea', common: 'Pino domestico', family: 'Pinaceae', kind: 'Albero', icon: 'fa-tree',
    aliases: ['pino', 'pino marittimo', 'pino da pinoli'], highlights: ['Ampia chioma', 'Sempreverde'],
    impacts: {
      health: { title: 'Dati sanitari specifici non sufficienti', text: 'Non è assegnato alcun livello di allergenicità o tossicità senza dati scientifici specifici verificati.', sources: [] },
      air: { title: 'Intercettazione potenziale del particolato', text: 'Gli alberi possono intercettare particolato; l’efficacia dipende da chioma, superficie fogliare e condizioni locali.', sources: [GENERAL_SOURCE] },
      climate: { title: 'Ombreggiamento possibile', text: 'La chioma può ombreggiare il suolo e gli spazi urbani; non è possibile dedurre gradi di raffrescamento dalla foto.', sources: [GENERAL_SOURCE] },
      biodiversity: { title: 'Componente dell’habitat', text: 'Può contribuire alla struttura degli ambienti verdi; la valutazione ecologica richiede informazioni sull’area.', sources: [] }
    }
  },
  {
    scientific: 'Quercus ilex', common: 'Leccio', family: 'Fagaceae', kind: 'Albero', icon: 'fa-tree',
    aliases: ['quercia sempreverde'], highlights: ['Sempreverde', 'Chioma ombreggiante'],
    impacts: {
      health: { title: 'Dati sanitari specifici non sufficienti', text: 'La scheda non assegna un livello di rischio individuale, né esclude reazioni allergiche.', sources: [] },
      air: { title: 'Rimozione da modellare', text: 'La vegetazione arborea può rimuovere alcuni inquinanti atmosferici; il valore dipende dal contesto e non è universale.', sources: [GENERAL_SOURCE] },
      climate: { title: 'Ombra e accumulo di carbonio', text: 'La chioma e la biomassa arborea possono contribuire ai servizi ecosistemici. Per una stima serve una misura delle dimensioni e del sito.', sources: [GENERAL_SOURCE] },
      biodiversity: { title: 'Presenza di habitat', text: 'Il valore per la biodiversità dipende dalla composizione vegetale, dalla struttura del bosco e dalla gestione.', sources: [] }
    }
  },
  {
    scientific: 'Tilia cordata', common: 'Tiglio selvatico', family: 'Malvaceae', kind: 'Albero', icon: 'fa-tree',
    aliases: ['tiglio'], highlights: ['Albero caducifoglio', 'Ombreggiamento'],
    impacts: {
      health: { title: 'Rischio specifico non valutato', text: 'Non è presente una caratterizzazione medica verificata delle possibili esposizioni a questa specie.', sources: [] },
      air: { title: 'Intercettazione potenziale', text: 'La chioma può intercettare alcuni inquinanti; non sono riportati valori stimati per esemplare.', sources: [GENERAL_SOURCE] },
      climate: { title: 'Ombra stagionale', text: 'La chioma estiva può offrire ombra e influenzare le condizioni termiche locali; la misura richiede dati di sito.', sources: [GENERAL_SOURCE] },
      biodiversity: { title: 'Benefici ecologici da contestualizzare', text: 'La fioritura può offrire risorse a insetti; l’entità dei benefici dipende dal contesto ecologico.', sources: [] }
    }
  }
];

export function lookupSpecies(value) {
  const q = String(value || '').toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  if (!q) return null;
  return SPECIES.find(s => [s.scientific, s.common, ...(s.aliases || [])].some(x => x.toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'') === q)) || null;
}
