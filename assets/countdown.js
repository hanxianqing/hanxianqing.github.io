
// Live countdown to Christmas Day (local midnight, 25 December 2026).
const TARGET = new Date(2026, 11, 25, 0, 0, 0);
function pad(n){ return String(n).padStart(2, "0"); }
function tick(){
  const now = new Date();
  let diff = TARGET - now;
  const done = document.getElementById("cd-done");
  if(diff <= 0){
    document.getElementById("cd-days").textContent = "0";
    document.getElementById("cd-hours").textContent = "00";
    document.getElementById("cd-mins").textContent = "00";
    document.getElementById("cd-secs").textContent = "00";
    if(done) done.textContent = "Merry Christmas! Christmas Day is here.";
    return;
  }
  const days = Math.floor(diff / 86400000); diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
  const mins = Math.floor(diff / 60000); diff -= mins * 60000;
  const secs = Math.floor(diff / 1000);
  document.getElementById("cd-days").textContent = days;
  document.getElementById("cd-hours").textContent = pad(hours);
  document.getElementById("cd-mins").textContent = pad(mins);
  document.getElementById("cd-secs").textContent = pad(secs);
}
tick();
setInterval(tick, 1000);
