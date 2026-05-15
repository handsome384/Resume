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
const exploreMeter = document.querySelector("#exploreMeter");
const exploreRing = document.querySelector("#exploreRing");
const exploreRate = document.querySelector("#exploreRate");

localStorage.removeItem("personal-theme");

const memories = [
  { src: "assets/photo-sunset-sea.webp", title: "海面日落", alt: "回忆照片：海面日落" },
  { src: "assets/photo-branches-sunset.webp", title: "枝影落日", alt: "回忆照片：枝影落日" },
  { src: "assets/photo-snow-mountain.webp", title: "雪山云影", alt: "回忆照片：雪山云影" },
  { src: "assets/photo-green-sky.webp", title: "蓝天绿叶", alt: "回忆照片：蓝天绿叶" },
  { src: "assets/photo-city-view.webp", title: "城市远眺", alt: "回忆照片：城市远眺" },
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
  reelDots?.querySelectorAll("button").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === memoryIndex);
  });
}

function playMemories() {
  document.body.classList.add("is-playing-memory");
  memoryPlay?.setAttribute("aria-pressed", "true");
  if (memoryPlay) memoryPlay.textContent = "暂停回忆";
  memoryTimer = window.setInterval(() => setMemory(memoryIndex + 1), 2800);
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
  exploreRing?.setAttribute("aria-label", `对她的探索率 ${label}`);
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

memories.forEach((memory, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `查看${memory.title}`);
  dot.addEventListener("click", () => {
    setMemory(index);
    if (memoryTimer) {
      pauseMemories();
      playMemories();
    }
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
