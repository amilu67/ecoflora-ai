/**
 * Fotocamera per EcoFlora AI — JavaScript vanilla, senza dipendenze.
 * Usa getUserMedia per la ripresa live e un input capture=environment come ripiego.
 * Non invia fotografie in rete: consegna un File al callback onPhoto.
 */
export function setupCamera({ onPhoto, onStatus }) {
  const $ = selector => document.querySelector(selector);
  const video = $('#camera-video');
  const panel = $('#camera-panel');
  const openButton = $('#open-camera');
  const nativeButton = $('#native-camera');
  const nativeInput = $('#camera-input');
  let stream = null;
  let requestId = 0;
  let facingMode = 'environment';

  // Ferma SEMPRE le tracce hardware: il solo nascondere <video> non spegne la camera.
  function close(silent = false) {
    requestId += 1; // invalida anche eventuali richieste di permesso ancora in corso
    if (stream) stream.getTracks().forEach(track => track.stop());
    stream = null;
    video.pause();
    video.srcObject = null;
    panel.hidden = true;
    openButton.disabled = false;
    if (!silent) onStatus('Fotocamera chiusa. Puoi sempre caricare un’immagine dalla galleria.');
  }

  async function open() {
    close(true);
    nativeButton.hidden = true;

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      nativeButton.hidden = false;
      onStatus('La ripresa live richiede HTTPS (oppure localhost) e un browser compatibile. Prova la fotocamera di sistema o la galleria.', 'error');
      return;
    }

    const ticket = requestId;
    openButton.disabled = true;
    onStatus('Autorizza l’accesso alla fotocamera quando il browser lo chiede.');
    let acquired = null;
    try {
      acquired = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      // Un utente può uscire dalla schermata mentre il permesso viene richiesto.
      if (ticket !== requestId || !$('#view-identify').classList.contains('active')) {
        acquired.getTracks().forEach(track => track.stop());
        return;
      }
      stream = acquired;
      video.srcObject = stream;
      panel.hidden = false;
      await video.play();
      if (ticket !== requestId) return;
      onStatus('Inquadra foglie, fiori o frutti e premi «Scatta foto».', 'success');
    } catch (error) {
      if (ticket !== requestId) return;
      close(true);
      nativeButton.hidden = false;
      const reason = error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError'
        ? 'Permesso negato. Abilita la fotocamera nelle impostazioni del browser.'
        : error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError'
          ? 'Nessuna fotocamera disponibile sul dispositivo.'
          : 'Fotocamera non disponibile o già in uso da un’altra app.';
      onStatus(`${reason} Puoi usare «Fotocamera di sistema» o la galleria.`, 'error');
    } finally {
      if (ticket === requestId) openButton.disabled = false;
    }
  }

  function shoot() {
    if (!stream || !video.videoWidth || !video.videoHeight) {
      onStatus('La fotocamera non è ancora pronta. Riprova tra un istante.', 'error');
      return;
    }
    // Il canvas crea una foto JPEG senza metadati EXIF della fotocamera.
    const maxDimension = 1800;
    const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    close(true);
    onStatus('Foto acquisita, preparazione dell’anteprima…');
    canvas.toBlob(async blob => {
      if (!blob) {
        onStatus('Non è stato possibile acquisire l’immagine. Riprova.', 'error');
        return;
      }
      const file = new File([blob], `ecoflora-foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
      try {
        await onPhoto(file);
        onStatus('Scatto completato. Verifica l’anteprima prima dell’analisi.', 'success');
      } catch (error) {
        onStatus('Errore durante l’elaborazione dello scatto: ' + error.message, 'error');
      }
    }, 'image/jpeg', 0.88);
  }

  openButton.addEventListener('click', open);
  $('#take-photo').addEventListener('click', shoot);
  $('#switch-camera').addEventListener('click', () => {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    open();
  });
  $('#close-camera').addEventListener('click', () => close());
  nativeButton.addEventListener('click', () => nativeInput.click());
  nativeInput.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    close(true);
    try { await onPhoto(file); } finally { nativeInput.value = ''; }
  });
  $('#choose-photo').addEventListener('click', () => {
    close(true);
    $('#photo-input').click();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) close(true); // invalida anche richieste getUserMedia pendenti
  });
  window.addEventListener('pagehide', () => close(true));
  return { close };
}
