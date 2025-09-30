/* VIRTUAL ORGANS HUB – Lightweight onsite AI (keyword RAG + fuzzy)
   No external services; knowledge limited to site text below. */

const KNOWLEDGE = [
  {
    topic:"overview",
    text:`Virtual organs are computational models of human organs used to study function, disease,
    and therapies. They power in-silico experiments, reduce wet-lab cost, and support patient-specific decisions.`,
    links:["introduction.html","applications.html"]
  },
    {
    topic:"heart",
    text:`The virtual heart is one of the earliest and most advanced organ models. It simulates both the electrical activity 
    that drives heart rhythms and the mechanical forces that pump blood. These models are used to study arrhythmias, to test
     pacemakers and defibrillators, and to plan catheter ablation surgeries. By creating patient-specific heart models, doctors 
     can predict how an individual will respond to treatment before entering the operating room. Virtual hearts are also central
      to precision cardiology, where digital twins are being developed to improve diagnosis and treatment planning.`,
    links:["types.html"]
  },
  {
    topic:"types",
    text:`Common virtual organs: heart (electro-mechanics & hemodynamics), liver (metabolism and toxicity),
    kidney (filtration & nephron models), lung (ventilation & perfusion), brain (connectomics & neurodynamics).`,
    links:["types.html"]
  },
  {
    topic:"modeling",
    text:`Computational modeling stacks: PDE/FEA/CFD for physics; multi-scale coupling from cell to organ;
    agent-based models; digital twins that assimilate patient data (imaging, labs) to personalize parameters.`,
    links:["modeling.html"]
  },
  {
    topic:"drug",
    text:`Drug testing uses virtual organs for ADME/Tox screening, dosing optimization, and in-silico trials.
    Models predict cardiotoxicity (QT prolongation), hepatotoxicity, and drug–drug interactions.`,
    links:["drug-testing.html"]
  },
  {
    topic:"diagnostics",
    text:`Diagnostics & personalized medicine: simulate likely outcomes, stratify patients, and plan interventions.
    Examples: virtual stenting, rhythm ablation planning, and ventilator tuning in silico.`,
    links:["diagnostics.html"]
  },
  {
    topic:"brain",
    text:`The virtual brain offers tools to model neural networks and conditions such as epilepsy. Projects
     like the Virtual Epileptic Patient use brain scans and network modeling to simulate seizure propagation,
      helping surgeons decide where to operate. Similar methods are being applied to neurodegenerative diseases 
      and brain stimulation therapies.`,
    links:["types.html"]
  },
  {
    topic:"future",
    text:`Future scope: standards, transparency, regulatory acceptance, real-time clinical digital twins,
    open datasets, privacy-preserving learning, and AR/VR visualization of organs at bedside.`,
    links:["future-scope.html"]
  },
  {
    topic:"contact",
    text:`Contact Batul Ratlamwala at batul.ratlamwala14@gmail.com`,

  }
];

// Tiny fuzzy search
function answerQuestion(q){
  const s = q.toLowerCase();
  let best = null; let scoreBest = 0;
  for(const k of KNOWLEDGE){
    let score = 0;
    const t = (k.topic + " " + k.text).toLowerCase();
    ["virtual","organ","drug","ai","model","heart","liver","kidney","lung","brain","diagnostic","future","contact","personalized"]
      .forEach(w=>{ if(s.includes(w) && t.includes(w)) score += 2; });
    // substring overlap
    if(t.includes(s)) score += Math.min(8, Math.floor(q.length/10));
    if(score > scoreBest){ scoreBest = score; best = k; }
  }
  if(!best) return {text:"I’m not sure yet. Try asking about 'types', 'modeling', 'AI', 'drug testing', or 'future'."};
  return {
    text: best.text + (best.links?.length? `\n\nRead more: ${best.links.map(u=>u.replace('.html','').replace('-', ' ')).join(", ")}.` : "")
  };
}

function mountChatbot(){
  const toggle = document.querySelector(".chatbot-toggle");
  const box = document.querySelector(".chatbot");
  const input = document.getElementById("chatInput");
  const send = document.getElementById("chatSend");
  const body = document.querySelector(".chat-body");

  function push(type, text){
    const div = document.createElement("div");
    div.className = "msg " + type;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  } 

  toggle?.addEventListener("click", ()=> box.classList.toggle("open"));
  send?.addEventListener("click", ()=>{
    const q = input.value.trim(); if(!q) return;
    push("user", q);
    const a = answerQuestion(q);
    setTimeout(()=> push("bot", a.text), 200);
    input.value="";
  });
  input?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") send.click(); });

  // Greeting
  setTimeout(()=> push("bot","Hello! I’m the VOH assistant. Ask me about types of virtual organs, modeling, AI/ML, or applications."), 400);
}
document.addEventListener("DOMContentLoaded", mountChatbot);
