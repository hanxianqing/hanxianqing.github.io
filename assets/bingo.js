
const WORDS = ["Santa","Reindeer","Snowman","Christmas Tree","Candy Cane","Snowflake","Wreath","Gingerbread","Stocking","Mistletoe","Ornament","Presents","Sleigh","Elf","North Pole","Hot Cocoa","Fireplace","Carols","Star","Angel","Bells","Cookies","Frosty","Holly","Icicle","Nutcracker","Rudolph","Tinsel","Poinsettia","Chimney"];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeCard(){
  const words = shuffle([...WORDS]).slice(0,24);
  const cells = [];
  for(let i=0;i<25;i++){ if(i===12){cells.push("FREE");} else {cells.push(words.pop());} }
  return cells;
}
function renderCards(n){
  const seen = new Set(); const wrap = document.getElementById("cards"); wrap.innerHTML = "";
  let made = 0, guard = 0;
  while(made < n && guard < 200){
    guard++;
    const cells = makeCard();
    const key = cells.join("|");
    if(seen.has(key)) continue;
    seen.add(key); made++;
    const card = document.createElement("div"); card.className = "bingo-card";
    card.innerHTML = "<h4>BINGO &middot; Card " + made + "</h4>";
    const grid = document.createElement("div"); grid.className = "bingo-grid";
    cells.forEach((w,i)=>{
      const d = document.createElement("div");
      d.textContent = w;
      if(i===12) d.className = "free";
      grid.appendChild(d);
    });
    card.appendChild(grid); wrap.appendChild(card);
  }
  document.getElementById("count").textContent = made + " card" + (made>1?"s":"") + " ready — print or save as PDF.";
}
let callerDeck = [], called = [];
function newCaller(){
  callerDeck = shuffle([...WORDS]); called = [];
  document.getElementById("called").innerHTML = "";
  document.getElementById("current").textContent = "Press “Draw a word” to start.";
  document.getElementById("drawBtn").disabled = false;
}
function drawWord(){
  if(!callerDeck.length){ document.getElementById("current").textContent = "All words called!"; document.getElementById("drawBtn").disabled = true; return; }
  const w = callerDeck.pop(); called.push(w);
  document.getElementById("current").textContent = w;
  const li = document.createElement("li"); li.textContent = w;
  document.getElementById("called").appendChild(li);
}
document.getElementById("genBtn").addEventListener("click", ()=>{
  const n = Math.max(1, Math.min(8, parseInt(document.getElementById("numCards").value, 10) || 4));
  renderCards(n);
});
document.getElementById("drawBtn").addEventListener("click", drawWord);
document.getElementById("newCallerBtn").addEventListener("click", newCaller);
renderCards(4); newCaller();
