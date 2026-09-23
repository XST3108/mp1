const nav = document.querySelector(".nav");
const navLinks = Array.from(document.querySelectorAll(".nav__link"));
const sections = Array.from(
  document.querySelectorAll("main section[id], header[id]")
);
const menuButton = document.querySelector(".nav__toggle");
const menu = document.querySelector(".nav__links");
const track = document.querySelector(".carousel__track");
const modal = document.querySelector("[data-modal]");
const modalOpen = document.querySelector("[data-modal-open]");
const modalCloseButtons = document.querySelectorAll("[data-modal-close]");
let lastFocused = null;
let pendingSectionId = null;
let navigationFallback = null;

function setActiveSection(sectionId) {
  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === "#" + sectionId;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function finishNavigation() {
  if (!pendingSectionId) return;
  pendingSectionId = null;
  window.clearTimeout(navigationFallback);
  navigationFallback = null;
  updateScrollState();
}

function updateScrollState() {
  nav.classList.toggle("is-compact", window.scrollY > 40);
  const atBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 4;
  const marker = nav.getBoundingClientRect().bottom + 48;

  if (pendingSectionId) {
    const pendingSection = document.getElementById(pendingSectionId);
    if (pendingSection && pendingSection.getBoundingClientRect().top > marker) {
      setActiveSection(pendingSectionId);
      return;
    }
    pendingSectionId = null;
    window.clearTimeout(navigationFallback);
    navigationFallback = null;
  }

  let current = sections[0];
  if (atBottom) current = sections[sections.length - 1];
  else {
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) current = section;
    });
  }
  setActiveSection(current.id);
}

function closeMenu() {
  menu.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
}

function handleScroll() {
  updateScrollState();
  if (!pendingSectionId) return;
  window.clearTimeout(navigationFallback);
  navigationFallback = window.setTimeout(finishNavigation, 250);
}

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("scrollend", finishNavigation);
window.addEventListener("resize", updateScrollState);
updateScrollState();

menuButton.addEventListener("click", () => {
  const open = menu.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation"
  );
});

navLinks.forEach((link) =>
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();

    pendingSectionId = target.id;
    setActiveSection(target.id);
    window.history.replaceState(null, "", link.getAttribute("href"));
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.clearTimeout(navigationFallback);
    navigationFallback = window.setTimeout(finishNavigation, 350);
    closeMenu();
  })
);

// Carousel: show one slide at a time, arrows move to prev/next (wraps around)
const slides = Array.from(track.querySelectorAll(".project-card"));
let slideIndex = 0;

function showSlide(nextIndex, direction) {
  slides[slideIndex].classList.remove("is-active", "from-left", "from-right");
  slideIndex = (nextIndex + slides.length) % slides.length;
  const next = slides[slideIndex];
  next.classList.remove("from-left", "from-right");
  next.classList.add(
    "is-active",
    direction === "prev" ? "from-left" : "from-right"
  );
  slides.forEach((slide, i) =>
    slide.setAttribute("aria-hidden", String(i !== slideIndex))
  );
}

slides.forEach((slide, i) =>
  slide.setAttribute("aria-hidden", String(i !== slideIndex))
);
document
  .querySelector("[data-carousel-prev]")
  .addEventListener("click", () => showSlide(slideIndex - 1, "prev"));
document
  .querySelector("[data-carousel-next]")
  .addEventListener("click", () => showSlide(slideIndex + 1, "next"));

function openDialog() {
  lastFocused = document.activeElement;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modal.querySelector(".modal__close").focus();
}

function closeDialog() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocused) lastFocused.focus();
}

modalOpen.addEventListener("click", openDialog);
modalCloseButtons.forEach((button) =>
  button.addEventListener("click", closeDialog)
);
document
  .querySelector("[data-modal-contact]")
  .addEventListener("click", closeDialog);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open"))
    closeDialog();
});
document.querySelector("#year").textContent = new Date().getFullYear();
