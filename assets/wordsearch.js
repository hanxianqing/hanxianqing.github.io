
const DEFAULTS = ["SANTA","REINDEER","SNOWMAN","CANDYCANE","WREATH","GINGERBREAD","STOCKING","MISTLETOE","ORNAMENT","SLEIGH","ELF","COCOA"];
const DIRS = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
const SIZE = 12;
let placed = [];
function randLetter(){ return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random()*26)]; }
function build(words){
  const grid = Array.from({length: SIZE}, ()=>Array(SIZE).fill(""));
  const cells = Array.from({length: SIZE}, ()=>Array(SIZE).fill(false));
  placed = [];
  const unplaced = [];
  const sorted = [...words].sort((a,b)=>b.length-a.length);  // longest first: fits better
  for(const raw of sorted){
    const w = raw.toUpperCase().replace(/[^A-Z]/g, "");
    if(!w || w.length > SIZE){ if(w) unplaced.push(raw); continue; }
    let ok = false;
    for(let t=0; t<1000 && !ok; t++){
      const [dr, dc] = DIRS[Math.floor(Math.random()*DIRS.length)];
      const r0 = Math.floor(Math.random()*SIZE), c0 = Math.floor(Math.random()*SIZE);
      const r1 = r0 + dr*(w.length-1), c1 = c0 + dc*(w.length-1);
      if(r1 < 0 || r1 >= SIZE || c1 < 0 || c1 >= SIZE) continue;
      let fits = true;
      for(let i=0;i<w.length;i++){
        const ch = grid[r0+dr*i][c0+dc*i];
        if(ch && ch !== w[i]){ fits = false; break; }
      }
      if(!fits) continue;
      const pos = [];
      for(let i=0;i<w.length;i++){
        grid[r0+dr*i][c0+dc*i] = w[i];
        cells[r0+dr*i][c0+dc*i] = true;
        pos.push([r0+dr*i, c0+dc*i]);
      }
      placed.push({word: w, pos}); ok = true;
    }
    if(!ok) unplaced.push(raw);
  }
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(!grid[r][c]) grid[r][c] = randLetter();
  const wrap = document.getElementById("puzzle");
  wrap.innerHTML = "";
  wrap.style.gridTemplateColumns = "repeat(" + SIZE + ", 1fr)";
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    const s = document.createElement("span");
    s.textContent = grid[r][c];
    s.dataset.r = r; s.dataset.c = c;
    wrap.appendChild(s);
  }
  wrap.dataset.cells = JSON.stringify(cells);
  document.getElementById("unplaced").textContent =
    unplaced.length ? "Could not fit (too long or crowded): " + unplaced.join(", ") + ". Try fewer or shorter words." : "";
  document.getElementById("wordList").innerHTML = placed.map(p=>"<li>"+p.word+"</li>").join("");
  showAnswers(false);
}
function showAnswers(on){
  const cells = JSON.parse(document.getElementById("puzzle").dataset.cells || "[]");
  document.querySelectorAll("#puzzle span").forEach(s=>{
    const r = +s.dataset.r, c = +s.dataset.c;
    s.classList.toggle("hit", !!on && !!(cells[r] && cells[r][c]));
  });
  document.getElementById("toggleBtn").textContent = on ? "Hide answers" : "Show answers";
}
let answersOn = false;
document.getElementById("makeBtn").addEventListener("click", ()=>{
  const raw = document.getElementById("words").value.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean).slice(0,12);
  if(!raw.length){ alert("Type at least one word."); return; }
  answersOn = false; build(raw);
});
document.getElementById("toggleBtn").addEventListener("click", ()=>{
  answersOn = !answersOn; showAnswers(answersOn);
});
document.getElementById("themeBtn").addEventListener("click", ()=>{
  document.getElementById("words").value = DEFAULTS.join("\n");
  answersOn = false; build(DEFAULTS);
});
build(DEFAULTS);
