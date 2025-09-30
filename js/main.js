/* VIRTUAL ORGANS HUB – Main JS (nav, search, glow clicks, floating icons positions) */

// Sidebar "active" highlight + glow on click
(function(){
  const path = location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(".nav a");
  links.forEach(a=>{
    const href = a.getAttribute("href");
    if(href === path){ a.classList.add("active"); }
    a.addEventListener("click", (e)=>{
      // ripple glow
      a.classList.add("active");
      a.style.boxShadow = "0 0 20px rgba(0,229,255,.7), 0 0 36px rgba(106,92,255,.35)";
      setTimeout(()=> a.style.boxShadow="", 450);
    });
  });
})();

// Floating icons random positions
(function(){
  const icons = document.querySelectorAll(".icon");
  icons.forEach((el,i)=>{
    el.style.left = Math.round(Math.random()*90+2)+"vw";
    el.style.animationDelay = (Math.random()*-28).toFixed(2)+"s";
    el.style.animationDuration = (24 + Math.random()*14).toFixed(2)+"s";
    el.style.opacity = (0.14 + Math.random()*0.24).toFixed(2);
    el.style.transform = `translateY(${Math.round(Math.random()*100)}vh)`;
  });
})();

// Simple search across our site (client-side index)
const SEARCH_INDEX = [
  {title: "Home", url:"index.html", excerpt:"Virtual Organs Hub overview, videos, hero"},
  {title: "Introduction", url:"introduction.html", excerpt:"What are virtual organs, definitions, ethics"},
  {title: "Types of Virtual Organs", url:"types.html", excerpt:"Heart, liver, kidney, lung, brain models"},
  {title: "Computational Modeling", url:"modeling.html", excerpt:"PDEs, FEA, ABM, multi-scale, digital twins"},
  {title: "Applications", url:"applications.html", excerpt:"Drug testing, diagnostics, AI/ML"},
  {title: "Drug Testing & Development", url:"drug-testing.html", excerpt:"in-silico trials, toxicity prediction"},
  {title: "Diagnostics & Personalized Medicine", url:"diagnostics.html", excerpt:"patient-specific simulation, stratification"},
  {title: "AI / Machine Learning", url:"ai-ml.html", excerpt:"surrogate models, GANs, GNNs"},
  {title: "Future Scope", url:"future-scope.html", excerpt:"roadmap timeline, standards, open science"},
  {title: "References", url:"references.html", excerpt:"papers, datasets, links"},
  {title: "About / Contact", url:"about-contact.html", excerpt:"Batul Ratlamwala contact, formspree"}
];

function setupSearch(){
  const box = document.getElementById("globalSearch");
  const results = document.createElement("div");
  results.style.position="absolute";
  results.style.top="42px";
  results.style.left="0";
  results.style.right="0";
  results.style.background="#0b1424";
  results.style.border="1px solid #1b2740";
  results.style.borderRadius="12px";
  results.style.padding="6px";
  results.style.display="none";
  results.style.zIndex="1000";
  results.className="search-results";
  box?.parentElement?.appendChild(results);

  function doSearch(q){
    const s = q.trim().toLowerCase();
    if(!s){ results.style.display="none"; results.innerHTML=""; return; }
    const out = SEARCH_INDEX
      .map(item=>{
        const score = (item.title.toLowerCase().includes(s)?2:0) +
                      (item.excerpt.toLowerCase().includes(s)?1:0);
        return {...item, score};
      })
      .filter(i=>i.score>0)
      .sort((a,b)=>b.score-a.score)
      .slice(0,7)
      .map(i=>`<a href="${i.url}" style="display:block;padding:8px 10px;border-radius:8px;color:#cfeaff;text-decoration:none;background:linear-gradient(90deg,rgba(0,229,255,.08),transparent)"><strong>${i.title}</strong><br><span style="color:#8fb4d3;font-size:.9rem">${i.excerpt}</span></a>`)
      .join("");
    results.innerHTML = out || `<div style="padding:8px 10px;color:#9db8cf">No matches.</div>`;
    results.style.display="block";
  }

  box?.addEventListener("input", e=> doSearch(e.target.value));
  document.addEventListener("click", (e)=>{
    if(!results.contains(e.target) && e.target!==box) results.style.display="none";
  });
}
document.addEventListener("DOMContentLoaded", setupSearch);
