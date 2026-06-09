const assetPath = "assets/img/";
const soundPath = "assets/audio/";
const soundFiles = {
  start: "start.mp3",
  advance: "select.mp3",
  unlock: "level-up.mp3",
  error: "glitch.mp3",
};

// Character definitions are shared by every scene and support image fallbacks.
const party = {
  simon: { name: "Simón", image: "simon.png", color: "#42e8ff" },
  agus: { name: "Agus", image: "agus.png", color: "#ffd166" },
  alma: { name: "Alma", image: "alma.png", color: "#ff8ad8" },
  baby1: { name: "Baby 1", image: "baby1.png", color: "#9dff5b" },
  baby2: { name: "Baby 2", image: "baby2.png", color: "#b7a4ff" },
  ultrasound: { name: "Scan", image: "ultrasound.png", color: "#91a3c7" },
};

// Each click advances through this scene list in order.
const scenes = [
  {
    status: "SAVE FILE 2026",
    label: "FAMILIA YAGAS",
    title: "SAVE FILE 2026",
    text: "PRESS START",
    button: "PRESS START",
    characters: [],
  },
  {
    status: "PARTY STATUS",
    label: "CURRENT PARTY",
    title: "Simón, Agus, Alma",
    text: "Party Size: 3",
    button: "CONTINUE",
    characters: ["simon", "agus", "alma"],
  },
  {
    status: "QUEST LOG",
    label: "QUEST COMPLETED",
    title: "Raise Alma",
    text: "Reward available",
    button: "CONTINUE",
    characters: ["simon", "agus", "alma"],
  },
  {
    status: "SAVE DATA",
    label: "SYSTEM",
    title: "New save data detected...",
    text: "Reading new family slot",
    button: "CONTINUE",
    modifier: "is-save-detected",
    characters: ["ultrasound"],
  },
  {
    status: "NEW CHARACTER",
    label: "UNLOCKED",
    title: "Player 4 joined",
    text: "Ultrasound item unlocked\nParty Size: 4",
    button: "CONTINUE",
    buttonDelay: 2500,
    modifier: "is-emotional",
    characters: ["simon", "agus", "alma", "ultrasound", "baby1"],
    tone: "unlock",
  },
  {
    status: "",
    label: "",
    title: "Wait...",
    text: "",
    button: "CONTINUE",
    buttonDelay: 2000,
    modifier: "is-blackout",
    characters: [],
  },
  {
    status: "SYSTEM ALERT",
    label: "ERROR",
    title: "Player 4 joined\nPlayer 4 joined\nPlayer 5 joined",
    text: "Party Size: 4",
    button: "CONTINUE",
    buttonDelay: 2400,
    modifier: "is-error is-glitch-strong is-duplicate-glitch",
    timedUpdates: [
      { delay: 1000, status: "SYSTEM ALERT", label: "ERROR", title: "RECALCULATING...", text: "Party Size: 4" },
      { delay: 1650, status: "SYSTEM OVERRIDE", label: "ERROR", title: "SECOND SIGNAL FOUND", text: "Party Size: 5" },
    ],
    characters: ["ultrasound"],
    tone: "error",
  },
  {
    status: "NEW CHARACTER",
    label: "UNLOCKED",
    title: "Player 5 joined",
    text: "Double reward confirmed.",
    button: "CONTINUE",
    characters: ["simon", "agus", "alma", "baby1", "baby2"],
    tone: "unlock",
  },
  {
    status: "EXPANSION READY",
    label: "INSTALL COMPLETE",
    title: "SON MELLIZOS",
    text: "Player 4 & Player 5 joining soon\nFamily Party Size: 5",
    button: "PLAY AGAIN",
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

function renderScene() {
  const scene = scenes[sceneIndex];

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

  sceneVisual.replaceChildren(...scene.characters.map(createAvatar));

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
        playTone(update.text === "Party Size: 5" ? "unlock" : "error");
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
  return audio.play();
}

function playGeneratedTone(type = "advance") {
  try {
    // Audio starts only after a user gesture, so browsers can allow it safely.
    audioContext ||= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    const frequencies = {
      advance: [520, 780],
      unlock: [660, 990],
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
    // Audio is decorative; blocked or unsupported audio should not interrupt the reveal.
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
