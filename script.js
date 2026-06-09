const assetPath = "assets/img/";
const itemPath = "assets/img/";
const soundPath = "assets/audio/";
const backgroundMusicFile = "music.mp3";
const backgroundMusicVolume = 0.4;

const soundFiles = {
  start: "start.mp3",
  advance: "select.mp3",
  unlock: "level-up.mp3",
  item: "item-found.mp3",
  error: "glitch.mp3",
  win: "win.mp3",
};

const sharePayload = {
  title: "Familia Yagas - Partida 2026",
  text: "Logro desbloqueado: familia de 5. Son mellizos. Nueva expansi\u00f3n en diciembre 2026.",
};

const party = {
  simon: { name: "Sim\u00f3n", image: "simon.png", color: "#42e8ff" },
  agus: { name: "Agus", image: "agus.png", color: "#ffd166" },
  alma: { name: "Alma", image: "alma.png", color: "#ff8ad8" },
  baby1: { name: "Jugador 4", image: "baby1.png", color: "#9dff5b", placeholder: "spark" },
  baby2: { name: "Jugador 5", image: "baby2.png", color: "#b7a4ff", placeholder: "pulse" },
};

const items = {
  ultrasound: {
    name: "Ecograf\u00eda",
    caption: "Primera eco",
    image: "ultrasound.png",
    color: "#ffd166",
  },
};

const scenes = [
  {
    status: "NUEVA PARTIDA",
    label: "FAMILIA YAGAS",
    title: "PARTIDA 2026",
    text: "NUEVA PARTIDA DISPONIBLE",
    button: "START",
    stageAction: "title",
    characters: [],
  },
  {
    status: "ESTADO DEL GRUPO",
    label: "GRUPO ACTUAL",
    title: "Sim\u00f3n, Agus, Alma",
    text: "Tama\u00f1o del grupo: 3",
    button: "CONTINUAR",
    stageAction: "enter",
    characters: ["simon", "agus", "alma"],
  },
  {
    status: "REGISTRO DE MISI\u00d3N",
    label: "MISI\u00d3N COMPLETADA",
    title: "Criar a Alma",
    text: "Recompensa disponible",
    button: "CONTINUAR",
    stageAction: "quest",
    characters: ["simon", "agus", "alma"],
  },
  {
    status: "OBJETO ENCONTRADO",
    label: "OBJETO LEGENDARIO",
    title: "Objeto legendario adquirido",
    text: "Se detect\u00f3 una nueva se\u00f1al...",
    button: "CONTINUAR",
    modifier: "is-save-detected",
    items: ["ultrasound"],
    stageAction: "item",
    characters: ["simon", "agus", "alma"],
    tone: "item",
  },
  {
    status: "NUEVO PERSONAJE",
    label: "DESBLOQUEADO",
    title: "Jugador 4 se uni\u00f3",
    text: "Tama\u00f1o del grupo: 4",
    button: "CONTINUAR",
    buttonDelay: 2500,
    modifier: "is-emotional",
    stageAction: "new-player",
    characters: ["simon", "agus", "alma", "baby1"],
    tone: "unlock",
  },
  {
    status: "ERROR DE SE\u00d1AL",
    label: "SISTEMA",
    title: "Esper\u00e1...",
    text: "Interferencia detectada",
    button: "CONTINUAR",
    buttonDelay: 2000,
    modifier: "is-blackout is-wait-glitch is-error",
    timedUpdates: [
      { delay: 520, status: "ERROR DE SE\u00d1AL", label: "ERROR", title: "CARGANDO JUGADOR 5...", text: "No cierres la partida", tone: "error" },
      { delay: 1250, status: "SE\u00d1AL INESTABLE", label: "ERROR", title: "SE\u00d1AL INESTABLE", text: "Nueva frecuencia encontrada", tone: "error" },
    ],
    stageAction: "glitch",
    characters: [],
  },
  {
    status: "ALERTA DEL SISTEMA",
    label: "ERROR",
    title: "Jugador 4 se uni\u00f3\nJugador 4 se uni\u00f3\nJugador 5 se uni\u00f3",
    text: "Tama\u00f1o del grupo: 4",
    button: "CONTINUAR",
    buttonDelay: 2400,
    modifier: "is-error is-glitch-strong is-duplicate-glitch",
    timedUpdates: [
      { delay: 760, status: "ALERTA DEL SISTEMA", label: "ERROR", title: "RECALCULANDO...", text: "Tama\u00f1o del grupo: 4", tone: "error" },
      { delay: 1400, status: "AJUSTE DEL SISTEMA", label: "ERROR", title: "SEGUNDA SE\u00d1AL DETECTADA", text: "Tama\u00f1o del grupo: 5", tone: "unlock" },
      { delay: 2050, status: "SISTEMA CORREGIDO", label: "NO ERA ERROR", title: "NO ERA ERROR", text: "La partida ven\u00eda con bonus", tone: "unlock" },
    ],
    items: ["ultrasound"],
    stageAction: "recalculate",
    characters: [],
    tone: "error",
  },
  {
    status: "NUEVO PERSONAJE",
    label: "DESBLOQUEADO",
    title: "Jugador 5 se uni\u00f3",
    text: "Recompensa doble confirmada.",
    button: "CONTINUAR",
    stageAction: "new-player",
    characters: ["simon", "agus", "alma", "baby1", "baby2"],
    tone: "unlock",
  },
  {
    status: "LOGRO DESBLOQUEADO",
    label: "FAMILIA YAGAS",
    title: "SON MELLIZOS",
    text: "Familia de 5 confirmada",
    release: "NUEVA EXPANSI\u00d3N: DICIEMBRE 2026",
    button: "JUGAR DE NUEVO",
    modifier: "is-achievement",
    stageAction: "final",
    characters: ["simon", "agus", "alma", "baby1", "baby2"],
    isFinal: true,
    tone: "unlock",
  },
];

let sceneIndex = 0;
let audioContext;
let replayClicks = 0;
const audioCache = new Map();
let backgroundMusic;
let sceneTimers = [];

const sceneElement = document.querySelector("#scene");
const sceneStatus = document.querySelector("#sceneStatus");
const sceneVisual = document.querySelector("#sceneVisual");
const sceneLabel = document.querySelector("#sceneLabel");
const sceneTitle = document.querySelector("#sceneTitle");
const sceneText = document.querySelector("#sceneText");
const sceneRelease = document.querySelector("#sceneRelease");
const continueButton = document.querySelector("#continueButton");
const shareButton = document.querySelector("#shareButton");

function clearSceneTimers() {
  sceneTimers.forEach((timer) => window.clearTimeout(timer));
  sceneTimers = [];
}

function createBabySilhouette(character) {
  const silhouette = document.createElement("span");
  const core = document.createElement("span");
  const sparkle = document.createElement("span");

  silhouette.className = `baby-silhouette baby-silhouette--${character.placeholder}`;
  core.className = "baby-silhouette__core";
  sparkle.className = "baby-silhouette__sparkle";
  silhouette.setAttribute("aria-hidden", "true");
  silhouette.append(core, sparkle);
  return silhouette;
}

function createAvatar(characterKey) {
  const character = party[characterKey];
  const card = document.createElement("figure");
  const avatar = document.createElement("div");
  const image = document.createElement("img");
  const fallback = character.placeholder
    ? createBabySilhouette(character)
    : document.createElement("span");
  const caption = document.createElement("figcaption");

  card.className = "character-card";
  if (character.placeholder) {
    card.classList.add("character-card--new");
  }

  avatar.className = "avatar";
  avatar.style.setProperty("--avatar-color", character.color);
  fallback.classList.add("avatar__fallback");
  if (!character.placeholder) {
    fallback.textContent = character.name.slice(0, 1);
  }

  image.src = `${assetPath}${character.image}`;
  image.alt = character.name;
  image.addEventListener("load", () => {
    avatar.classList.add("avatar--loaded");
  });
  image.addEventListener("error", () => {
    avatar.classList.add("avatar--missing");
  });

  caption.className = "character-name";
  caption.textContent = character.name;

  avatar.append(image, fallback);
  card.append(avatar, caption);
  return card;
}

function createItemCard(itemKey) {
  const item = items[itemKey];
  const card = document.createElement("figure");
  const frame = document.createElement("div");
  const image = document.createElement("img");
  const fallback = document.createElement("span");
  const caption = document.createElement("figcaption");

  card.className = "legendary-item";
  frame.className = "legendary-item__frame";
  frame.style.setProperty("--item-color", item.color);
  fallback.className = "legendary-item__fallback";
  fallback.textContent = "OBJETO";

  image.src = `${itemPath}${item.image}`;
  image.alt = item.name;
  image.addEventListener("load", () => {
    frame.classList.add("legendary-item__frame--loaded");
  });
  image.addEventListener("error", () => {
    frame.classList.add("legendary-item__frame--missing");
  });

  caption.className = "legendary-item__caption";
  caption.textContent = item.caption || item.name;

  frame.append(image, fallback);
  card.append(frame, caption);
  return card;
}

function createStagePortrait(characterKey) {
  const character = party[characterKey];
  const portrait = document.createElement("figure");
  const frame = document.createElement("span");
  const image = document.createElement("img");
  const fallback = document.createElement("span");
  const caption = document.createElement("figcaption");

  portrait.className = `stage-portrait stage-portrait--${characterKey}`;
  frame.className = "stage-portrait__frame";
  frame.style.setProperty("--player-color", character.color);
  fallback.className = "stage-portrait__fallback";
  fallback.textContent = character.name.slice(0, 1);

  image.src = `${assetPath}${character.image}`;
  image.alt = character.name;
  image.addEventListener("load", () => {
    frame.classList.add("stage-portrait__frame--loaded");
  });
  image.addEventListener("error", () => {
    frame.classList.add("stage-portrait__frame--missing");
  });

  caption.className = "stage-portrait__name";
  caption.textContent = character.name;

  frame.append(image, fallback);
  portrait.append(frame, caption);
  return portrait;
}

function createPlayerSprite(characterKey, index) {
  const character = party[characterKey];
  const player = document.createElement("span");
  const shadow = document.createElement("span");
  const body = document.createElement("span");
  const head = document.createElement("span");
  const name = document.createElement("span");

  player.className = `player-sprite player-sprite--${characterKey}`;
  if (character.placeholder) {
    player.classList.add("player-sprite--mystery");
  }

  player.style.setProperty("--player-color", character.color);
  player.style.setProperty("--player-index", index);
  player.style.setProperty("--player-offset", `${index * 56}px`);
  player.style.setProperty("--player-offset-mobile", `${index * 37}px`);
  player.style.setProperty("--player-enter-delay", `${index * 110}ms`);
  player.style.setProperty("--player-hop-delay", `${950 + index * 120}ms`);
  player.style.setProperty("--player-run-delay", `${index * 90}ms`);
  player.style.setProperty("--player-run-hop-delay", `${1350 + index * 100}ms`);
  player.style.setProperty("--player-unlock-delay", `${index * 120}ms`);
  player.style.setProperty("--player-unlock-hop-delay", `${1000 + index * 100}ms`);
  player.style.setProperty("--player-final-delay", `${index * 80}ms`);
  player.style.setProperty("--player-final-hop-delay", `${1600 + index * 90}ms`);
  shadow.className = "player-sprite__shadow";
  body.className = "player-sprite__body";
  head.className = "player-sprite__head";
  name.className = "player-sprite__name";
  name.textContent = character.name;

  player.append(shadow, body, head, name);
  return player;
}

function createStageItem(itemKey) {
  const item = items[itemKey];
  const itemNode = document.createElement("figure");
  const frame = document.createElement("span");
  const image = document.createElement("img");
  const fallback = document.createElement("span");

  itemNode.className = "stage-item";
  frame.className = "stage-item__frame";
  frame.style.setProperty("--item-color", item.color);
  fallback.className = "stage-item__fallback";
  fallback.textContent = "ECO";

  image.src = `${itemPath}${item.image}`;
  image.alt = item.name;
  image.addEventListener("load", () => {
    frame.classList.add("stage-item__frame--loaded");
  });
  image.addEventListener("error", () => {
    frame.classList.add("stage-item__frame--missing");
  });

  frame.append(image, fallback);
  itemNode.append(frame);
  return itemNode;
}

function createPlatformStage(scene, sceneCharacters, sceneItems) {
  const stage = document.createElement("div");
  const sky = document.createElement("div");
  const hud = document.createElement("div");
  const track = document.createElement("div");
  const ground = document.createElement("div");
  const prompt = document.createElement("span");

  stage.className = `platform-stage platform-stage--${scene.stageAction || "idle"}`;
  sky.className = "platform-stage__sky";
  hud.className = "platform-stage__hud";
  track.className = "platform-stage__track";
  ground.className = "platform-stage__ground";
  prompt.className = "platform-stage__prompt";
  prompt.textContent = scene.stageAction === "title" ? "PRESS START" : "AUTO PLAY";

  ["simon", "agus", "alma"]
    .filter((characterKey) => sceneCharacters.includes(characterKey) || scene.isFinal)
    .forEach((characterKey) => {
      hud.append(createStagePortrait(characterKey));
    });

  sceneItems.forEach((itemKey) => {
    track.append(createStageItem(itemKey));
  });

  sceneCharacters.forEach((characterKey, index) => {
    track.append(createPlayerSprite(characterKey, index));
  });

  if (scene.stageAction === "title") {
    track.append(prompt);
  }

  stage.append(sky, hud, track, ground);
  return stage;
}

function setShareButtonState(scene) {
  shareButton.hidden = !scene.isFinal;
  shareButton.classList.toggle("is-hidden", !scene.isFinal);
  shareButton.disabled = false;
  shareButton.textContent = "COMPARTIR";
}

function renderScene() {
  const scene = scenes[sceneIndex];
  const sceneItems = scene.items ?? [];
  const sceneCharacters = scene.characters ?? [];

  clearSceneTimers();
  sceneElement.className = "scene is-entering";
  if (scene.modifier) {
    sceneElement.classList.add(...scene.modifier.split(" "));
  }

  sceneStatus.textContent = scene.status;
  sceneLabel.textContent = scene.label;
  sceneTitle.textContent = scene.title;
  sceneText.textContent = scene.text;
  sceneRelease.textContent = scene.release || "";
  sceneRelease.hidden = !scene.release;
  continueButton.textContent = scene.button;
  continueButton.disabled = Boolean(scene.buttonDelay);
  continueButton.classList.toggle("is-hidden", Boolean(scene.buttonDelay));
  setShareButtonState(scene);

  sceneVisual.setAttribute(
    "aria-label",
    scene.isFinal ? "Familia completa con cinco jugadores" : "Personajes y objetos de la partida"
  );
  if (scene.stageAction) {
    sceneVisual.replaceChildren(createPlatformStage(scene, sceneCharacters, sceneItems));
  } else {
    sceneVisual.replaceChildren(
      ...sceneItems.map(createItemCard),
      ...sceneCharacters.map(createAvatar)
    );
  }

  if (scene.buttonDelay) {
    sceneTimers.push(window.setTimeout(() => {
      continueButton.disabled = false;
      continueButton.classList.remove("is-hidden");
      continueButton.focus({ preventScroll: true });
    }, scene.buttonDelay));
  }

  if (scene.timedUpdates) {
    scene.timedUpdates.forEach((update) => {
      sceneTimers.push(window.setTimeout(() => {
        sceneStatus.textContent = update.status;
        sceneLabel.textContent = update.label;
        sceneTitle.textContent = update.title;
        sceneText.textContent = update.text;
        sceneRelease.textContent = "";
        sceneRelease.hidden = true;
        playTone(update.tone || "error");
      }, update.delay));
    });
  }

  window.setTimeout(() => {
    sceneElement.classList.remove("is-entering");
  }, 420);
}

function playSoundFile(type) {
  const file = soundFiles[type] || soundFiles.advance;

  if (!audioCache.has(file)) {
    const audio = new Audio(`${soundPath}${file}`);
    audio.preload = "auto";
    audioCache.set(file, audio);
  }

  const audio = audioCache.get(file);
  audio.currentTime = 0;
  return audio.play().catch((error) => {
    if ((type === "start" || type === "item") && file !== soundFiles.advance) {
      return playSoundFile(type === "item" ? "unlock" : "advance");
    }

    throw error;
  });
}

function playBackgroundMusic() {
  if (!backgroundMusic) {
    backgroundMusic = new Audio(`${soundPath}${backgroundMusicFile}`);
    backgroundMusic.loop = true;
    backgroundMusic.preload = "auto";
    backgroundMusic.volume = backgroundMusicVolume;
  }

  if (backgroundMusic.paused) {
    backgroundMusic.play().catch(() => {
      // Background music is optional; effects and reveal must keep working.
    });
  }
}

function playGeneratedTone(type = "advance") {
  try {
    audioContext ||= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    const frequencies = {
      start: [392, 784],
      advance: [520, 780],
      unlock: [660, 990],
      item: [740, 1180],
      error: [110, 70],
    };
    const [startFrequency, endFrequency] = frequencies[type] || frequencies.advance;

    oscillator.type = type === "error" ? "sawtooth" : "square";
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + 0.12);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.18);
  } catch {
    // Decorative audio must never interrupt the reveal.
  }
}

function playTone(type = "advance") {
  playBackgroundMusic();

  try {
    playSoundFile(type).catch(() => {
      playGeneratedTone(type);
    });
  } catch {
    playGeneratedTone(type);
  }
}

async function shareReveal() {
  const url = window.location.href;
  const textToCopy = `${sharePayload.text} ${url}`;

  try {
    if (navigator.share) {
      await navigator.share({ ...sharePayload, url });
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(textToCopy);
      shareButton.textContent = "COPIADO";
    } else {
      shareButton.textContent = "LISTO";
    }
  } catch {
    shareButton.textContent = "LISTO";
  }

  shareButton.disabled = true;
  window.setTimeout(() => {
    shareButton.disabled = false;
    shareButton.textContent = "COMPARTIR";
  }, 1800);
}

continueButton.addEventListener("click", () => {
  const wasStartScreen = sceneIndex === 0;
  const isLastScene = sceneIndex === scenes.length - 1;

  if (isLastScene) {
    replayClicks += 1;
    if (replayClicks > 1) {
      sceneStatus.textContent = "NUEVA RUN DISPONIBLE";
    }
  }

  sceneIndex = isLastScene ? 0 : sceneIndex + 1;
  renderScene();
  playTone(scenes[sceneIndex].isFinal ? "win" : wasStartScreen ? "start" : scenes[sceneIndex].tone);
});

shareButton.addEventListener("click", shareReveal);

renderScene();
