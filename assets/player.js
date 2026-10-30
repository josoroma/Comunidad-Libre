(() => {
  "use strict";

  const episodes = [
    {
      number: 1,
      title: "Libertad encarnada",
      summary: "Fundamentos: libertad como no dominación, propiedad distribuida, comunidad voluntaria y límites al poder.",
      duration: "5:56",
      src: "audio/01-libertad-encarnada.mp3",
      transcript: "transcripts/01-libertad-encarnada.vtt"
    },
    {
      number: 2,
      title: "La persona real",
      summary: "Antropología política: ni ángeles ni demonios, cooperación, poder, racionalidad limitada y virtud cívica.",
      duration: "5:20",
      src: "audio/02-la-persona-real.mp3",
      transcript: "transcripts/02-la-persona-real.vtt"
    },
    {
      number: 3,
      title: "Comunidad sin colectivismo",
      summary: "Comunidad voluntaria, subsidiariedad, Ostrom, tradición sin tradicionalismo y derecho de salida.",
      duration: "5:05",
      src: "audio/03-comunidad-sin-colectivismo.mp3",
      transcript: "transcripts/03-comunidad-sin-colectivismo.vtt"
    },
    {
      number: 4,
      title: "Estado pequeño, municipios fuertes",
      summary: "Funciones mínimas, descentralización, límites al gasto, deuda, regulación y transición gradual.",
      duration: "5:18",
      src: "audio/04-estado-pequeno-municipios-fuertes.mp3",
      transcript: "transcripts/04-estado-pequeno-municipios-fuertes.vtt"
    },
    {
      number: 5,
      title: "Economía de propietarios",
      summary: "Propiedad amplia, mercado sin privilegios, anti clientelismo, fiscalidad limitada y bienestar con elección.",
      duration: "5:20",
      src: "audio/05-economia-de-propietarios.mp3",
      transcript: "transcripts/05-economia-de-propietarios.vtt"
    },
    {
      number: 6,
      title: "Constitución antitiránica",
      summary: "Diez formas de tiranía, división, auditoría, limitación, revocabilidad y propuesta constitucional.",
      duration: "5:02",
      src: "audio/06-constitucion-antitiranica.mp3",
      transcript: "transcripts/06-constitucion-antitiranica.vtt"
    },
    {
      number: 7,
      title: "Programa para Costa Rica",
      summary: "Agenda legislativa: municipios, responsabilidad fiscal, educación, transparencia, economía y democracia directa.",
      duration: "5:00",
      src: "audio/07-programa-para-costa-rica.mp3",
      transcript: "transcripts/07-programa-para-costa-rica.vtt"
    },
    {
      number: 8,
      title: "Críticas y manifiesto",
      summary: "Objeciones internas y externas, respuestas académicas, riesgos residuales y llamado a construir desde abajo.",
      duration: "5:03",
      src: "audio/08-criticas-y-manifiesto.mp3",
      transcript: "transcripts/08-criticas-y-manifiesto.vtt"
    }
  ];

  const audio = document.querySelector("#audio");
  const episodeKicker = document.querySelector("#episodeKicker");
  const episodeTitle = document.querySelector("#episodeTitle");
  const episodeDescription = document.querySelector("#episodeDescription");
  const episodeList = document.querySelector("#episodeList");
  const downloadLink = document.querySelector("#downloadLink");
  const playerStatus = document.querySelector("#playerStatus");
  const transcriptStatus = document.querySelector("#transcriptStatus");
  const activeSpeaker = document.querySelector("#activeSpeaker");
  const activeLine = document.querySelector("#activeLine");
  const transcriptList = document.querySelector("#transcriptList");

  let activeIndex = 0;
  let cues = [];
  let activeCueIndex = -1;
  let episodeButtons = [];
  let cueButtons = [];
  let episodeVersion = 0;
  let playAttempt = 0;
  let transcriptController = null;

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${rest}`;
  }

  function parseTimestamp(value) {
    const match = value.match(/^(?:(\d+):)?(\d{2}):(\d{2})\.(\d{3})$/);
    if (!match || Number(match[2]) > 59 || Number(match[3]) > 59) return NaN;
    return Number(match[1] || 0) * 3600 + Number(match[2]) * 60
      + Number(match[3]) + Number(match[4]) / 1000;
  }

  function parseVtt(text) {
    return text
      .replace(/^\uFEFF/, "")
      .replace(/\r/g, "")
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter((block) => block && !/^(WEBVTT|NOTE|STYLE|REGION)(?:\s|$)/.test(block))
      .map((block) => {
        const lines = block.split("\n");
        const timingIndex = lines.findIndex((line) => line.includes("-->"));
        if (timingIndex < 0) return null;
        const [startRaw, endRaw] = lines[timingIndex].split("-->").map((part) => part.trim());
        if (!startRaw || !endRaw) return null;
        const start = parseTimestamp(startRaw);
        const end = parseTimestamp(endRaw.split(/\s+/)[0]);
        if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
        const textLines = lines.slice(timingIndex + 1).join(" ").trim();
        const match = textLines.match(/^([^:]+):\s*(.*)$/);
        return {
          start,
          end,
          speaker: match ? match[1] : "Transcripción",
          text: match ? match[2] : textLines
        };
      })
      .filter(Boolean);
  }

  function setPlayerStatus(message) {
    if (playerStatus) playerStatus.textContent = message;
  }

  async function playAudio() {
    const version = episodeVersion;
    const attempt = ++playAttempt;
    setPlayerStatus("");
    try {
      await audio.play();
    } catch (error) {
      if (version !== episodeVersion || attempt !== playAttempt || error.name === "AbortError") return;
      setPlayerStatus(error.name === "NotAllowedError"
        ? "Pulsa reproducir en el audio para comenzar."
        : "No se pudo reproducir el audio. Inténtalo de nuevo.");
    }
  }

  function updatePlaylist() {
    episodeButtons.forEach((button, index) => {
      const isActive = index === activeIndex;
      button.classList.toggle("active", isActive);
      if (isActive) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  }

  function renderPlaylist() {
    episodeList.replaceChildren();
    episodeButtons = episodes.map((episode, index) => {
      const button = document.createElement("button");
      button.className = "episode";
      button.type = "button";
      button.innerHTML = `
        <span class="episode-number">${episode.number.toString().padStart(2, "0")}</span>
        <span>
          <span class="episode-title">${episode.title}</span>
          <span class="episode-summary">${episode.summary}</span>
        </span>
        <span class="duration">${episode.duration}</span>
      `;
      button.addEventListener("click", () => loadEpisode(index, true));
      episodeList.appendChild(button);
      return button;
    });
    updatePlaylist();
  }

  function renderTranscript() {
    transcriptList.replaceChildren();
    cueButtons = cues.map((cue, index) => {
      const button = document.createElement("button");
      button.className = "transcript-cue";
      button.type = "button";

      const time = document.createElement("time");
      time.textContent = formatTime(cue.start);
      const body = document.createElement("span");
      const speaker = document.createElement("strong");
      speaker.textContent = cue.speaker;
      const text = document.createElement("span");
      text.textContent = cue.text;
      body.append(speaker, text);
      button.append(time, body);
      button.addEventListener("click", () => {
        audio.currentTime = cue.start + 0.01;
        updateTranscript();
        if (audio.paused) void playAudio();
      });
      transcriptList.appendChild(button);
      return button;
    });
  }

  function scrollTranscriptTo(button) {
    // Move this scroll container only; never scroll the surrounding page.
    const listRect = transcriptList.getBoundingClientRect();
    const cueRect = button.getBoundingClientRect();
    const top = listRect.top + transcriptList.clientTop;
    const bottom = top + transcriptList.clientHeight;
    if (cueRect.top < top) transcriptList.scrollTop += cueRect.top - top;
    else if (cueRect.bottom > bottom) transcriptList.scrollTop += cueRect.bottom - bottom;
  }

  function setActiveCue(index, shouldScroll = false) {
    if (index === activeCueIndex) return;
    const previous = cueButtons[activeCueIndex];
    previous?.classList.remove("active");
    previous?.removeAttribute("aria-current");
    activeCueIndex = index;
    const cue = cues[index];
    if (!cue) {
      activeSpeaker.textContent = "Transcripción";
      activeLine.textContent = cues.length
        ? "Reproduce el episodio para seguir la conversación."
        : "Transcripción no disponible.";
      return;
    }

    activeSpeaker.textContent = cue.speaker;
    activeLine.textContent = cue.text;
    const current = cueButtons[index];
    current.classList.add("active");
    current.setAttribute("aria-current", "true");
    if (shouldScroll && !audio.paused) scrollTranscriptTo(current);
  }

  function updateTranscript(shouldScroll = false) {
    const time = audio.currentTime;
    const index = cues.findIndex((cue) => time >= cue.start && time < cue.end);
    setActiveCue(index, shouldScroll);
  }

  async function loadTranscript(path, version) {
    transcriptController?.abort();
    const controller = new AbortController();
    transcriptController = controller;
    transcriptStatus.textContent = "Cargando";
    activeSpeaker.textContent = "Transcripción";
    activeLine.textContent = "Cargando transcripción sincronizada.";
    transcriptList.replaceChildren();
    transcriptList.scrollTop = 0;
    cues = [];
    cueButtons = [];
    activeCueIndex = -1;

    try {
      const response = await fetch(path, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      // A superseded request may finish even when its transport ignores abort.
      if (controller.signal.aborted || version !== episodeVersion) return;
      cues = parseVtt(text);
      if (!cues.length) throw new Error("Empty transcript");
      transcriptStatus.textContent = `${cues.length} líneas`;
      renderTranscript();
      updateTranscript();
    } catch (error) {
      if (controller.signal.aborted || version !== episodeVersion) return;
      transcriptStatus.textContent = "No disponible";
      activeSpeaker.textContent = "Transcripción";
      activeLine.textContent = "No se pudo cargar la transcripción de este episodio.";
    } finally {
      if (transcriptController === controller) transcriptController = null;
    }
  }

  function loadEpisode(index, shouldPlay = false) {
    episodeVersion += 1;
    activeIndex = (index + episodes.length) % episodes.length;
    const episode = episodes[activeIndex];
    setPlayerStatus("");
    audio.src = episode.src;
    episodeKicker.textContent = `Parte ${episode.number}`;
    episodeTitle.textContent = episode.title;
    episodeDescription.textContent = episode.summary;
    downloadLink.href = episode.src;
    updatePlaylist();
    void loadTranscript(episode.transcript, episodeVersion);
    if (shouldPlay) void playAudio();
  }

  audio.addEventListener("ended", () => loadEpisode(activeIndex + 1, true));
  audio.addEventListener("timeupdate", () => updateTranscript(true));
  audio.addEventListener("play", () => setPlayerStatus(""));
  audio.addEventListener("error", () => {
    if (audio.error) setPlayerStatus("No se pudo cargar el audio. Selecciona otro episodio o vuelve a intentarlo.");
  });

  renderPlaylist();
  loadEpisode(0);
})();
