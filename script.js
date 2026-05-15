const root = document.documentElement;
const printButton = document.querySelector("#printButton");
const copyEmail = document.querySelector("#copyEmail");
const toast = document.querySelector("#toast");
const progress = document.querySelector("#scrollProgress");
const navLinks = [...document.querySelectorAll(".nav a")];
const sections = [...document.querySelectorAll(".section[id]")];
const lightbox = document.querySelector("#photoLightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxTitle = lightbox?.querySelector("strong");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
const memoryPlay = document.querySelector("#memoryPlay");
const reelImage = document.querySelector("#reelImage");
const reelTitle = document.querySelector("#reelTitle");
const reelIndex = document.querySelector("#reelIndex");
const reelDots = document.querySelector("#reelDots");
const reelTotal = document.querySelector("#reelTotal");
const cameraShutter = document.querySelector("#cameraShutter");
const cameraPlayer = document.querySelector(".camera-player");
const exploreMeter = document.querySelector("#exploreMeter");
const exploreRing = document.querySelector("#exploreRing");
const exploreRate = document.querySelector("#exploreRate");

localStorage.removeItem("personal-theme");

const memories = [
  { src: "assets/memory-camera-01.webp", title: "南方日出", alt: "回忆照片：南方日出" },
  { src: "assets/memory-camera-02.webp", title: "晴光路口", alt: "回忆照片：晴光路口" },
  { src: "assets/memory-camera-03.webp", title: "雾里花树", alt: "回忆照片：雾里花树" },
  { src: "assets/memory-camera-04.webp", title: "雨后街道", alt: "回忆照片：雨后街道" },
  { src: "assets/memory-camera-05.webp", title: "院中绿影", alt: "回忆照片：院中绿影" },
  { src: "assets/memory-camera-06.webp", title: "水面划行", alt: "回忆照片：水面划行" },
  { src: "assets/memory-camera-07.webp", title: "绿叶果实", alt: "回忆照片：绿叶果实" },
  { src: "assets/memory-camera-08.webp", title: "校园路口", alt: "回忆照片：校园路口" },
  { src: "assets/memory-camera-09.webp", title: "雨水倒影", alt: "回忆照片：雨水倒影" },
  { src: "assets/memory-camera-10.webp", title: "雨林台阶", alt: "回忆照片：雨林台阶" },
  { src: "assets/memory-camera-11.webp", title: "水中树影", alt: "回忆照片：水中树影" },
];

let memoryIndex = 0;
let memoryTimer = null;
let exploreValue = Number(exploreMeter?.dataset.exploreValue || 87);

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1900);
}

function updateProgress() {
  if (!progress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
}

function setMemory(index) {
  memoryIndex = (index + memories.length) % memories.length;
  const memory = memories[memoryIndex];
  if (reelImage) {
    reelImage.src = memory.src;
    reelImage.alt = memory.alt;
  }
  if (reelTitle) reelTitle.textContent = memory.title;
  if (reelIndex) reelIndex.textContent = String(memoryIndex + 1).padStart(2, "0");
  if (reelTotal) reelTotal.textContent = String(memories.length).padStart(2, "0");
  reelDots?.querySelectorAll("button").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === memoryIndex);
  });
}

function playShutterSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const now = context.currentTime;
  const master = context.createGain();
  master.connect(context.destination);
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.28, now + 0.008);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

  [760, 320].forEach((frequency, offset) => {
    const oscillator = context.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, now + offset * 0.045);
    oscillator.connect(master);
    oscillator.start(now + offset * 0.045);
    oscillator.stop(now + offset * 0.045 + 0.055);
  });

  window.setTimeout(() => context.close(), 260);
}

function takePhoto({ sound = true } = {}) {
  cameraPlayer?.classList.remove("is-shooting");
  void cameraPlayer?.offsetWidth;
  cameraPlayer?.classList.add("is-shooting");
  if (sound) playShutterSound();
  window.setTimeout(() => setMemory(memoryIndex + 1), 120);
}

function playMemories() {
  document.body.classList.add("is-playing-memory");
  memoryPlay?.setAttribute("aria-pressed", "true");
  if (memoryPlay) memoryPlay.textContent = "暂停回忆";
  takePhoto({ sound: false });
  memoryTimer = window.setInterval(() => takePhoto({ sound: false }), 2800);
}

function pauseMemories() {
  document.body.classList.remove("is-playing-memory");
  memoryPlay?.setAttribute("aria-pressed", "false");
  if (memoryPlay) memoryPlay.textContent = "播放回忆";
  window.clearInterval(memoryTimer);
  memoryTimer = null;
}

function setExploreValue(value) {
  exploreValue = Math.min(100, Math.max(0, value));
  const label = `${exploreValue}%`;
  exploreRing?.style.setProperty("--explore-value", label);
  if (exploreRate) exploreRate.textContent = label;
  exploreRing?.setAttribute("aria-label", `今日探索仪表 ${label}`);
}

function increaseExploreValue() {
  setExploreValue(exploreValue + 3);
}

printButton?.addEventListener("click", () => window.print());

copyEmail?.addEventListener("click", async () => {
  const email = copyEmail.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    showToast("邮箱已复制");
  } catch {
    showToast(email);
  }
});

memoryPlay?.addEventListener("click", () => {
  if (memoryTimer) {
    pauseMemories();
  } else {
    playMemories();
  }
});

cameraShutter?.addEventListener("click", takePhoto);

memories.forEach((memory, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `查看${memory.title}`);
  dot.addEventListener("click", () => {
    setMemory(index);
  });
  reelDots?.append(dot);
});
setMemory(0);

document.querySelectorAll("[data-photo]").forEach((tile) => {
  tile.addEventListener("click", () => {
    if (tile.classList.contains("cloud-card")) increaseExploreValue();
    if (!lightbox || !lightboxImage || !lightboxTitle) return;
    lightboxImage.src = tile.dataset.photo;
    lightboxImage.alt = tile.dataset.title || "照片";
    lightboxTitle.textContent = tile.dataset.title || "照片";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  });
});
setExploreValue(exploreValue);

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
}

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });

    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  {
    rootMargin: "-24% 0px -52% 0px",
    threshold: [0.12, 0.35, 0.62],
  }
);

sections.forEach((section) => sectionObserver.observe(section));

document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateX(${y * -3}deg) rotateY(${x * 3}deg) translateY(-2px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();
