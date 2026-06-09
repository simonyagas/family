const assetPath = "assets/";

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
    status: "NEW CHARACTER",
    label: "UNLOCKED",
    title: "Player 4 joined",
    text: "A new adventure slot has appeared.",
    button: "CONTINUE",
    characters: ["simon", "agus", "alma", "baby1"],
  },
  {
    status: "SYSTEM PAUSED",
    label: "WAIT",
    title: "...",
    text: "Something else is loading",
    button: "CONTINUE",
    modifier: "is-pause",
    characters: ["ultrasound"],
  },
  {
    status: "SYSTEM ALERT",
    label: "ERROR",
    title: "ERROR",
    text: "Recalculating...",
    button: "CONTINUE",
    modifier: "is-error",
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
  },
  {
    status: "EXPANSION READY",
    label: "INSTALL COMPLETE",
    title: "TWINS EXPANSION PACK INSTALLED",
    text: "Party Size: 5 - Game continues...",
    button: "REPLAY",
    characters: ["simon", "agus", "alma", "baby1", "baby2"],
  },
];

let sceneIndex = 0;
let audioContext;

const sceneElement = document.querySelector("#scene");
const sceneStatus = document.querySelector("#sceneStatus");
const sceneVisual = document.querySelector("#sceneVisual");
const sceneLabel = document.querySelector("#sceneLabel");
const sceneTitle = document.querySelector("#sceneTitle");
const sceneText = document.querySelector("#sceneText");
const continueButton = document.querySelector("#continueButton");

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

  sceneElement.className = "scene is-entering";
  if (scene.modifier) {
    sceneElement.classList.add(scene.modifier);
  }

  sceneStatus.textContent = scene.status;
  sceneLabel.textContent = scene.label;
  sceneTitle.textContent = scene.title;
  sceneText.textContent = scene.text;
  continueButton.textContent = scene.button;

  sceneVisual.replaceChildren(...scene.characters.map(createAvatar));

  window.setTimeout(() => {
    sceneElement.classList.remove("is-entering");
  }, 420);
}

function playTone(type = "advance") {
  try {
    // Audio starts only after a user gesture, so browsers can allow it safely.
    audioContext ||= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = type === "error" ? "sawtooth" : "square";
    oscillator.frequency.setValueAtTime(type === "error" ? 110 : 520, now);
    oscillator.frequency.exponentialRampToValueAtTime(type === "error" ? 70 : 780, now + 0.12);

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

continueButton.addEventListener("click", () => {
  const isLastScene = sceneIndex === scenes.length - 1;
  sceneIndex = isLastScene ? 0 : sceneIndex + 1;
  renderScene();
  playTone(scenes[sceneIndex].tone);
});

renderScene();
