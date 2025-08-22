// Year in sidebar footer
document.getElementById('year').textContent = new Date().getFullYear();

// Expand/collapse Applications submenu
const parentBtn = document.querySelector('.nav-parent');
const submenu = document.getElementById('apps-submenu');
if (parentBtn && submenu) {
  parentBtn.addEventListener('click', () => {
    const expanded = parentBtn.getAttribute('aria-expanded') === 'true';
    parentBtn.setAttribute('aria-expanded', String(!expanded));
    submenu.hidden = expanded;
  });
}

// Smooth scroll and active link highlighting
const links = document.querySelectorAll('.nav-link');
const panels = [...document.querySelectorAll('.panel')];
links.forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', id);
  });
});
const setActive = () => {
  let currentId = '';
  const y = window.scrollY + 120;
  for (const sec of panels) {
    if (sec.offsetTop <= y) currentId = '#' + sec.id;
  }
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === currentId));
};
window.addEventListener('scroll', setActive);
setActive();

// Mobile: auto-open sidebar on load if room; else keep collapsed via CSS (handled)

/* ===========================
   Client-side Q&A Assistant
   ===========================
   Strategy: Build a lightweight index from all `.content-slot` sections.
   On a question:
     1) tokenize & score each section by keyword overlap + fuzzy includes
     2) return the top 2 snippets with section titles + anchors
   This uses ONLY on-page text. As you add content, answers get better.
*/
const chatToggle = document.querySelector('.chat-toggle');
const chat = document.querySelector('.chatbot');
const chatClose = document.querySelector('.chat-close');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-question');
const chatLog = document.getElementById('chat-log');

function openChat(){ chat.hidden = false; chatInput.focus(); }
function closeChat(){ chat.hidden = true; }
chatToggle.addEventListener('click', openChat);
chatClose.addEventListener('click', closeChat);

function addMsg(text, who='bot'){
  const div = document.createElement('div');
  div.className = `msg ${who}`;
  div.innerHTML = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Build index
function buildIndex(){
  const sections = [...document.querySelectorAll('.panel')].map(sec => {
    const title = sec.dataset.title || sec.querySelector('h3')?.textContent?.trim() || sec.id;
    const text = (sec.querySelector('.content-slot')?.innerText || sec.innerText || '').replace(/\s+/g, ' ').trim();
    return { id: sec.id, title, text };
  });
  // Filter out very short/noisy
  return sections.filter(s => s.text && s.text.length > 40);
}
let INDEX = buildIndex();

// Rebuild index if user edits content dynamically (optional)
window.addEventListener('load', () => { INDEX = buildIndex(); });

// Simple tokenizer
function tokens(str){
  return str.toLowerCase()
    .replace(/[^a-z0-9\s\/&-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// Score by keyword overlap + partial matching
function score(query, text){
  const q = tokens(query);
  const t = tokens(text);
  const tset = new Set(t);
  let overlap = 0;
  for (const w of q){
    if (tset.has(w)) overlap += 2;
    else if (t.some(x => x.includes(w) && w.length >= 4)) overlap += 1;
  }
  // length normalization (prefer concise matches)
  const lenPenalty = Math.min(2, Math.max(0, (t.length - 400) / 400));
  return overlap - lenPenalty;
}

// Generate short snippet around top hits
function snippet(text, query, maxLen=280){
  const q = tokens(query).filter(w=>w.length>2);
  const lower = text.toLowerCase();
  let pos = -1;
  for (const w of q){
    const p = lower.indexOf(w);
    if (p !== -1){ pos = p; break; }
  }
  if (pos === -1) pos = Math.min(120, Math.floor(text.length/3));
  const start = Math.max(0, pos - Math.floor(maxLen/2));
  const end = Math.min(text.length, start + maxLen);
  let s = text.slice(start, end).trim();
  if (start > 0) s = '… ' + s;
  if (end < text.length) s = s + ' …';
  return s;
}

// Answer builder
function answer(query){
  if (!INDEX.length){
    return "I can’t find content yet. Add text to the sections and ask again.";
  }
  const ranked = INDEX
    .map(sec => ({ ...sec, score: score(query, sec.text) }))
    .sort((a,b) => b.score - a.score)
    .slice(0, 3)
    .filter(x => x.score > 0);

  if (!ranked.length){
    return "No strong matches. Try rephrasing or add more content to the site.";
  }

  const parts = ranked.slice(0,2).map(s => {
    const snip = snippet(s.text, query);
    return `<div class="hit">
      <div><strong>${s.title}</strong> — <a href="#${s.id}">jump</a></div>
      <div>${snip}</div>
    </div>`;
  }).join('<hr style="border:0;border-top:1px solid rgba(255,255,255,0.08);margin:8px 0">');

  return `${parts}<div style="margin-top:8px;opacity:.75;font-size:12px">Answer generated from on-page content.</div>`;
}

// Chat submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = chatInput.value.trim();
  if (!q) return;
  addMsg(q, 'user');
  const ahtml = answer(q);
  addMsg(ahtml, 'bot');
  chatInput.value = '';
});

// Contact form friendly UX (if using Formspree)
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    // If you add a real Formspree endpoint, you can keep default behavior.
    // This intercepts to show a friendly message even without backend.
    e.preventDefault();
    const fd = new FormData(form);
    const email = fd.get('email');
    const message = fd.get('message');
    if (!email || !message) return;
    // Try posting; if it fails, still show a success message for UX during demo
    try {
      const res = await fetch(form.action, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        alert('Thanks! Your message was sent.');
        form.reset();
      } else {
        alert('Form submitted (demo). Configure Formspree to receive emails.');
        form.reset();
      }
    } catch {
      alert('Form submitted (demo). Configure Formspree to receive emails.');
      form.reset();
    }
  });
}

// Accessibility: keyboard Esc closes chat
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !chat.hidden) closeChat();
});
