/* Galeria demonstrativa W1 Capital: só imagens locais com dados fictícios. */
const galleries=document.querySelectorAll("[data-lexis-gallery]");
galleries.forEach(gallery=>{
 const preview=gallery.querySelector("[data-preview-main]");
 const title=gallery.querySelector("[data-preview-title]");
 const options=[...gallery.querySelectorAll("[data-gallery-choice]")];
 const dialog=gallery.querySelector("dialog.lp-preview-dialog");
 const enlarged=dialog?.querySelector("img");
 const open=gallery.querySelector("[data-preview-open]");
 const close=gallery.querySelector("[data-preview-close]");
 if(!preview || options.length===0)return;
 const choose=option=>{
   const src=option.dataset.previewSrc;
   const label=option.dataset.previewLabel;
   if(!src||!label)return;
   options.forEach(b=>b.setAttribute("aria-pressed",String(b===option)));
   preview.src=src;
   preview.alt=label+" — interface ilustrativa do LexisPredict com dados fictícios";
   if(title) title.textContent=label;
   if(enlarged){enlarged.src=src;enlarged.alt=preview.alt}
 };
 options.forEach(option=>option.addEventListener("click",()=>choose(option)));
 open?.addEventListener("click",()=>{if(typeof dialog?.showModal==="function"){if(enlarged){enlarged.src=preview.src;enlarged.alt=preview.alt;}dialog.showModal();}});
 close?.addEventListener("click",()=>dialog?.close());
 dialog?.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
});
