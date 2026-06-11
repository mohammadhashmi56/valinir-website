const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

const cursor = document.querySelector(".cursor");
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let renderedX = cursorX;
let renderedY = cursorY;

if (cursor && finePointer && !prefersReduced) {
  window.addEventListener("pointermove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    document.body.classList.add("cursor-ready");
  });

  document.querySelectorAll("a, button, .magnetic").forEach((item) => {
    item.addEventListener("pointerenter", () => document.body.classList.add("cursor-active"));
    item.addEventListener("pointerleave", () => document.body.classList.remove("cursor-active"));
  });

  const animateCursor = () => {
    renderedX += (cursorX - renderedX) * 0.2;
    renderedY += (cursorY - renderedY) * 0.2;
    cursor.style.transform = `translate(${renderedX - cursor.offsetWidth / 2}px, ${renderedY - cursor.offsetHeight / 2}px)`;
    requestAnimationFrame(animateCursor);
  };

  animateCursor();
}

document.querySelectorAll(".magnetic").forEach((item) => {
  if (!finePointer || prefersReduced) return;

  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
  });

  item.addEventListener("pointerleave", () => {
    item.style.transform = "";
  });
});

const serviceRows = [...document.querySelectorAll(".service-row")];

serviceRows.forEach((row) => {
  row.addEventListener("pointerenter", () => {
    serviceRows.forEach((item) => item.classList.toggle("active", item === row));
  });

  row.addEventListener("focusin", () => {
    serviceRows.forEach((item) => item.classList.toggle("active", item === row));
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  nav?.classList.toggle("open", !isOpen);
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

const scrollText = document.querySelector("[data-scroll-words]");
let words = [];

if (scrollText) {
  const text = scrollText.textContent.replace(/\s+/g, " ").trim();
  scrollText.setAttribute("aria-label", text);
  scrollText.innerHTML = text
    .split(" ")
    .map((word) => `<span class="word" aria-hidden="true">${word}</span>`)
    .join(" ");
  words = [...scrollText.querySelectorAll(".word")];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateWords() {
  if (!words.length) return;
  const section = scrollText.closest("section");
  const rect = section.getBoundingClientRect();
  const progress = clamp((window.innerHeight * 0.72 - rect.top) / (rect.height * 0.72), 0, 1);
  const active = Math.floor(progress * (words.length + 4));
  words.forEach((word, index) => word.classList.toggle("lit", index < active));
}

const delaySection = document.querySelector(".delay");
const costRows = [...document.querySelectorAll(".cost-rows div")];

costRows.forEach((row) => revealObserver.observe(row));

function updateDelaySection() {
  if (!delaySection || prefersReduced) return;

  const rect = delaySection.getBoundingClientRect();
  const progress = clamp((window.innerHeight - rect.top) / (rect.height + window.innerHeight * 0.35), 0, 1);
  delaySection.style.setProperty("--delay-progress", progress.toFixed(3));

  costRows.forEach((row, index) => {
    const rowRect = row.getBoundingClientRect();
    const rowProgress = clamp((window.innerHeight * 0.82 - rowRect.top) / (rowRect.height + 220), 0, 1);
    row.style.setProperty("--row-progress", rowProgress.toFixed(3));
    row.style.setProperty("--row-drift", `${(rowProgress - 0.5) * (index % 2 ? -8 : 8)}px`);
  });
}

costRows.forEach((row) => {
  if (!finePointer || prefersReduced) return;

  row.addEventListener("pointermove", (event) => {
    const rect = row.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    row.style.setProperty("--tilt-y", `${px * 2.2}deg`);
    row.style.setProperty("--tilt-x", `${py * -2.2}deg`);
  });

  row.addEventListener("pointerleave", () => {
    row.style.setProperty("--tilt-y", "0deg");
    row.style.setProperty("--tilt-x", "0deg");
  });
});

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    updateWords();
    updateParallax();
    updateDelaySection();
  });
}

if (words.length) {
  if (prefersReduced) {
    words.forEach((word) => word.classList.add("lit"));
  } else {
    updateWords();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }
}

const projectData = {
  "FinEdge Advisors": {
    text: "FinEdge needed a controlled AI research layer for advisors handling client reporting and portfolio follow-up.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=750&q=85"
  },
  "BrightPath International Logistics": {
    text: "BrightPath replaced manual shipment triage with an intelligent workflow that routed exceptions before delays spread.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=750&q=85"
  },
  "Norse Star": {
    text: "Norse Star came to us before peak season with a simple request: remove the busywork that slows support and frustrates customers.",
    image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=750&q=85"
  },
  "EduCore Learning": {
    text: "EduCore automated enrollment follow-up, internal reporting, and learner support routing across its operations team.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=750&q=85"
  },
  "CraftWorks Manufacturing": {
    text: "CraftWorks connected intake, inventory, and production updates so managers stopped chasing status manually.",
    image: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=750&q=85"
  },
  "HealthFirst Clinics": {
    text: "HealthFirst used Valinir to reduce scheduling backlogs, automate admin follow-up, and protect patient response times.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=750&q=85"
  }
};

const projectButtons = document.querySelectorAll(".project-list button");
const projectText = document.querySelector(".project-list p");
const projectImage = document.querySelector(".project-preview img");
const projectCaption = document.querySelector(".project-preview figcaption");

projectButtons.forEach((button) => {
  button.addEventListener("mouseenter", () => setProject(button));
  button.addEventListener("focus", () => setProject(button));
  button.addEventListener("click", () => setProject(button));
});

function setProject(button) {
  const key = button.dataset.project;
  const data = projectData[key];
  if (!data) return;

  projectButtons.forEach((item) => item.classList.toggle("active", item === button));
  if (projectText) projectText.textContent = data.text;
  if (projectCaption) projectCaption.textContent = key;
  if (projectImage && projectImage.src !== data.image) {
    projectImage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: "ease" });
    projectImage.src = data.image;
  }
}

const parallaxImages = [...document.querySelectorAll(".hero-image img, .case-quote img")];
const hero = document.querySelector(".hero");
const heroImage = document.querySelector(".hero-image img");
const heroImageFrame = document.querySelector(".hero-image");

function updateParallax() {
  if (prefersReduced) return;
  parallaxImages.forEach((image) => {
    if (image === heroImage && hero) {
      const rect = hero.getBoundingClientRect();
      const progress = clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
      const scale = 1.04 + progress * 0.1;
      const x = progress * -14;
      const y = progress * 34;
      const saturation = 0.78 + progress * 0.18;
      const brightness = 0.46 - progress * 0.08;
      const contrast = 1.15 + progress * 0.16;

      image.style.transform = `scale(${scale}) translate3d(${x}px, ${y}px, 0)`;
      image.style.filter = `saturate(${saturation}) contrast(${contrast}) brightness(${brightness})`;
      heroImageFrame?.style.setProperty("--hero-image-glow", String(0.28 + progress * 0.34));
      return;
    }

    const rect = image.getBoundingClientRect();
    const amount = clamp((window.innerHeight / 2 - rect.top - rect.height / 2) / window.innerHeight, -1, 1);
    image.style.transform = `scale(1.06) translateY(${amount * 18}px)`;
  });
}

updateParallax();
updateDelaySection();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    if (!button) return;
    const original = button.innerHTML;
    button.innerHTML = "Received <span>+</span>";
    window.setTimeout(() => {
      button.innerHTML = original;
    }, 1800);
  });
});
