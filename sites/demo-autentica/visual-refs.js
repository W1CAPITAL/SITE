"use strict";
const VISUAL_REFERENCE_ASSETS = {"inicio":"https://d2jqrm6oza8nb6.cloudfront.net/datasets/338da565-a349-4add-a71c-e52603bc7955.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNTI2ZjhhNGEyZmIyY2RmYyIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDEzMjgxMH0.0K3dUyUlJ2gB6ecJ3DrAq2JYCNP9B2LQWP55pudu-l0","solucoes":"https://d2jqrm6oza8nb6.cloudfront.net/datasets/e0637776-cc03-4c5d-9db0-550693c5128e.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZDk2NDMxZGM1NzdjYzE0ZiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDExNTAzNn0.IVbGXUYaoj8dT9_C2b9g52IBodSVomKkCRnwyb2RNUw","sobre":"https://d2jqrm6oza8nb6.cloudfront.net/datasets/579457c5-1dda-44d3-82d6-a0f34e67d273.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYTkwNDRiNjQ4ZTcwZTFiZCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDA3ODk0OH0.6jLVcnHyUDzoWl8X-OZR_xflUT617PTJmox5lQUqnFA","atuacao":"https://d2jqrm6oza8nb6.cloudfront.net/datasets/2a74e857-943d-468c-a1a1-f9a4a10f6400.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNTMzZTcyY2VjNDQ5ZDc1YyIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDEyNzk1MH0.OmBag-MnIn7t9ZajbhPe-_3FGVBuWFnHLoiI9iCV3Y0","como-funciona":"https://d2jqrm6oza8nb6.cloudfront.net/datasets/cd3a61e7-7d65-40cf-9777-a9efe13f8a4a.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNTkzYjk1NzM1MTJhOThmZSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDEyMDMwN30.ML-fgdzeGIr2EDzYsrZ3jFvf25r_risEzH6w5qPW3Vw","contato":"https://d2jqrm6oza8nb6.cloudfront.net/datasets/9d0afeb5-49f2-4e6f-a97c-2a5eeb17e8e9.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZTU5YjM2NzMwYzk5NzgzMCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDEwNjQ4M30.hjEbBjRfstuGjj9V3ZTItDiowiYAAcFHnzIAFN49qfI"};
document.addEventListener("DOMContentLoaded", function () {
  const current = document.documentElement.dataset.page || "inicio";
  const url = VISUAL_REFERENCE_ASSETS[current];
  if (!url) return;
  const hero = document.querySelector(".hero-art");
  if (hero) {
    hero.style.setProperty("--ref-hero", 'url("'+url+'")');
    hero.classList.add("hero-reference");
    hero.setAttribute("aria-label", "Fotografia arquitetônica do conceito visual original da página "+current);
  }
  const band = document.querySelector(".feature-photo");
  if (band) {
    const source = current === "sobre" ? VISUAL_REFERENCE_ASSETS.inicio : url;
    const goodFallback = current === "como-funciona"
      ? "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=78"
      : "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=78";
    band.style.backgroundImage = 'url("'+source+'"),url("'+goodFallback+'")';
    band.classList.add(current === "como-funciona" ? "photo-hourglass" : current === "sobre" ? "photo-justice-about" : "photo-justice");
    band.setAttribute("role","img");
    band.setAttribute("aria-label",current==="como-funciona"?"Ampulheta dourada e livros, fotografia do conceito visual":"Estátua dourada da Justiça, fotografia do conceito visual");
    const img = band.querySelector("img");
    if (img) img.remove();
  }
  const portrait = document.querySelector(".split-photo");
  if (portrait) {
    portrait.style.backgroundImage = 'url("'+VISUAL_REFERENCE_ASSETS.sobre+'"),url("https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=78")';
    portrait.classList.add("photo-portrait");
    portrait.setAttribute("role","img");
    portrait.setAttribute("aria-label","Retrato editorial fictício presente na referência visual; não representa a advogada.");
    const img = portrait.querySelector("img");
    if (img) img.remove();
  }
  const map = document.querySelector(".map-art");
  if (map && current === "atuacao") {
    map.style.backgroundImage = 'url("'+VISUAL_REFERENCE_ASSETS.atuacao+'")';
    map.classList.add("map-reference");
    map.setAttribute("role","img");
    map.setAttribute("aria-label","Mapa ilustrativo das localidades da proposta visual, sem promessa de cobertura.");
    const img = map.querySelector("svg");
    if (img) img.remove();
  }
  document.documentElement.classList.add("visual-reference-loaded");
});
