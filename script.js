const assetPath = "assets/img/";
const itemPath = "assets/img/";
const soundPath = "assets/audio/";
const soundFiles = {
  start: "start.mp3",
  advance: "select.mp3",
  unlock: "level-up.mp3",
  item: "item-found.mp3",
  error: "glitch.mp3",
};

// Definiciones compartidas por las escenas, con reemplazos visuales si faltan imágenes.
const party = {
  simon: { name: "Simón", image: "simon.png", color: "#42e8ff" },
  agus: { name: "Agus", image: "agus.png", color: "#ffd166" },
  alma: { name: "Alma", image: "alma.png", color: "#ff8ad8" },
  baby1: { name: "Jugador 4", image: "baby1.png", color: "#9dff5b" },
  baby2: { name: "Jugador 5", image: "baby2.png", color: "#b7a4ff" },
};

const items = {
  ultrasound: { name: "Ecografía", caption: "Primera eco", image: "ultrasound.png", color: "#ffd166" },
};

// Cada clic avanza por esta lista de escenas en orden.
const scenes = [
  {
    status: "PARTIDA 2026",
    label: "FAMILIA YAGAS",
    title: "PARTIDA 2026",
    text: "PRESIONÁ INICIAR",
    button: "PRESIONÁ INICIAR",
    characters: [],
  },
  {
    status: "ESTADO DEL GRUPO",
    label: "GRUPO ACTUAL",
    title: "Simón, Agus, Alma",
    text: "Tamaño del grupo: 3",
    button: "CONTINUAR",
    characters: ["simon", "agus", "alma"],
  },
  {
    status: "REGISTRO DE MISIÓN",
    label: "MISIÓN COMPLETADA",
    title: "Criar a Alma",
    text: "Recompensa disponible",
    button: "CONTINUAR",
    characters: ["simon", "agus", "alma"],
  },
  {
    status: "OBJETO ENCONTRADO",
    label: "OBJETO LEGENDARIO",
    title: "Ecografía adquirida",
    text: "Se detectó una nueva señal...",
    button: "CONTINUAR",
    modifier: "is-save-detected",
    items: ["ultrasound"],
    characters: [],
    tone: "item",
  },
  {
    status: "NUEVO PERSONAJE",
    label: "DESBLOQUEADO",
    title: "Jugador 4 se unió",
    text: "Tamaño del grupo: 4",
    button: "CONTINUAR",
    buttonDelay: 2500,
    modifier: "is-emotional",
    characters: ["simon", "agus", "alma", "baby1"],
    tone: "unlock",
  },
  {
    status: "",
    label: "",
    title: "Esperá...",
    text: "",
    button: "CONTINUAR",
    buttonDelay: 2000,
    modifier: "is-blackout",
    characters: [],
  },
  {
    status: "ALERTA DEL SISTEMA",
    label: "ERROR",
    title: "Jugador 4 se unió\nJugador 4 se unió\nJugador 5 se unió",
    text: "Tamaño del grupo: 4",
    button: "CONTINUAR",
    buttonDelay: 2400,
    modifier: "is-error is-glitch-strong is-duplicate-glitch",
    timedUpdates: [
      { delay: 1000, status: "ALERTA DEL SISTEMA", label: "ERROR", title: "RECALCULANDO...", text: "Tamaño del grupo: 4", tone: "error" },
      { delay: 1650, status: "AJUSTE DEL SISTEMA", label: "ERROR", title: "SEGUNDA SEÑAL DETECTADA", text: "Tamaño del grupo: 5", tone: "unlock" },
    ],
    items: ["ultrasound"],
    characters: [],
    tone: "error",
  },
  {
    status: "NUEVO PERSONAJE",
    label: "DESBLOQUEADO",
    title: "Jugador 5 se unió",
    text: "Recompensa doble confirmada.",
    button: "CONTINUAR",
    characters: ["simon", "agus", "alma", "baby1", "baby2"],
    tone: "unlock",
  },
  {
    status: "EXPANSIÓN LISTA",
    label: "INSTALACIÓN COMPLETA",
    title: "SON MELLIZOS",
    text: "Jugador 4 y Jugador 5 se suman pronto\nTamaño del grupo familiar: 5",
    button: "JUGAR DE NUEVO",
    characters: ["simon", "agus", "alma", "baby1", "baby2"],
  },
];

let sceneIndex = 0;
let audioContext;
const audioCache = new Map();
let sceneTimers = [];

const sceneElement = document.querySelector("#scene");
const sceneStatus = document.querySelector("#sceneStatus");
const sceneVisual = document.querySelector("#sceneVisual");
const sceneLabel = document.querySelector("#sceneLabel");
const sceneTitle = document.querySelector("#sceneTitle");
const sceneText = document.querySelector("#sceneText");
const continueButton = document.querySelector("#continueButton");

function clearSceneTimers() {
  sceneTimers.forEach((timer) => window.clearTimeout(timer));
  sceneTimers = [];
}

function createAvatar(characterKey) {
  const character = party[characterKey];
  const card = document.createElement("figure");
  const avatar = document.createElement("div");
  const image = document.createElement("img");
  const fallback = document.createElement("span");
  const caption = document.createElement("figcaption");

  card.className = "character-card";
  avatar.className = "avatar";
  avatar.style.setProperty("--avatar-color", character.color);
  fallback.className = "avatar__fallback";
  fallback.textContent = character.name.slice(0, 1);

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

function renderScene() {
  const scene = scenes[sceneIndex];
  const sceneItems = scene.items ?? [];
  const sceneCharacters = scene.characters ?? [];

  clearSceneTimers();
  sceneElement.className = "scene is-entering";
  if (scene.modifier) {
    sceneElement.classList.add(scene.modifier);
  }

  sceneStatus.textContent = scene.status;
  sceneLabel.textContent = scene.label;
  sceneTitle.textContent = scene.title;
  sceneText.textContent = scene.text;
  continueButton.textContent = scene.button;
  continueButton.disabled = Boolean(scene.buttonDelay);
  continueButton.classList.toggle("is-hidden", Boolean(scene.buttonDelay));

  sceneVisual.replaceChildren(
    ...sceneItems.map(createItemCard),
    ...sceneCharacters.map(createAvatar)
  );

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
    if (type === "item" && file !== soundFiles.unlock) {
      return playSoundFile("unlock");
    }

    throw error;
  });
}

function playGeneratedTone(type = "advance") {
  try {
    // El audio arranca después de una acción del usuario para que el navegador lo permita.
    audioContext ||= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    const frequencies = {
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
    // El audio es decorativo; si falla, no debe interrumpir la revelación.
  }
}

function playTone(type = "advance") {
  try {
    playSoundFile(type).catch(() => {
      playGeneratedTone(type);
    });
  } catch {
    playGeneratedTone(type);
  }
}

continueButton.addEventListener("click", () => {
  const wasStartScreen = sceneIndex === 0;
  const isLastScene = sceneIndex === scenes.length - 1;
  sceneIndex = isLastScene ? 0 : sceneIndex + 1;
  renderScene();
  playTone(wasStartScreen ? "start" : scenes[sceneIndex].tone);
});

renderScene();
