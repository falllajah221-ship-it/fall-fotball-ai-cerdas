const games=[
{name:"Free Fire",cat:"Battle Royale",icon:"FF",needsZone:false,products:[["5 Diamonds",1500],["12 Diamonds",3000],["50 Diamonds",7000],["70 Diamonds",10000],["100 Diamonds",14000],["140 Diamonds",19000],["355 Diamonds",48000],["720 Diamonds",95000]]},
{name:"Mobile Legends",cat:"MOBA",icon:"ML",needsZone:true,products:[["86 Diamonds",20000],["172 Diamonds",39000],["257 Diamonds",58000],["344 Diamonds",77000],["429 Diamonds",96000],["514 Diamonds",115000],["706 Diamonds",155000],["878 Diamonds",190000]]},
{name:"PUBG Mobile",cat:"Battle Royale",icon:"PUBG",needsZone:false,products:[["60 UC",16000],["325 UC",76000],["660 UC",150000],["1800 UC",390000],["3850 UC",760000]]},
{name:"Valorant",cat:"FPS",icon:"VAL",needsZone:false,products:[["125 VP",18000],["420 VP",55000],["700 VP",88000],["1375 VP",165000],["2400 VP",275000]]},
{name:"Honor of Kings",cat:"MOBA",icon:"HOK",needsZone:false,products:[["80 Tokens",15000],["240 Tokens",42000],["400 Tokens",69000],["800 Tokens",135000]]},
{name:"Genshin Impact",cat:"RPG",icon:"GI",needsZone:false,products:[["60 Genesis",16000],["300 Genesis",74000],["980 Genesis",225000],["1980 Genesis",455000]]},
{name:"Roblox",cat:"Sandbox",icon:"RBX",needsZone:false,products:[["80 Robux",16000],["400 Robux",72000],["800 Robux",140000],["1700 Robux",280000]]},
{name:"Call of Duty Mobile",cat:"FPS",icon:"COD",needsZone:false,products:[["80 CP",17000],["420 CP",76000],["880 CP",150000],["2400 CP",390000]]}
];

let selectedGame=null, selectedProduct=null, orderId=null, verifyTimer=null;
const $=id=>document.getElementById(id);
const money=n=>"Rp "+new Intl.NumberFormat("id-ID").format(n);

function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>t.classList.remove("show"),2300)}
function createOrder(){return "FALL-"+Math.floor(100000+Math.random()*900000)}
function renderGames(){
  $("gameGrid").innerHTML=games.map((g,i)=>`<article class="game-card" data-index="${i}"><div class="game-icon">${g.icon}</div><h3>${g.name}</h3><p>${g.cat}</p><span class="arrow">↗</span></article>`).join("");
  document.querySelectorAll(".game-card").forEach(c=>c.onclick=()=>selectGame(+c.dataset.index));
}
function selectGame(i){
  selectedGame=games[i];selectedProduct=null;
  document.querySelectorAll(".game-card").forEach(x=>x.classList.remove("selected"));
  document.querySelector(`[data-index="${i}"]`).classList.add("selected");
  $("selectedGameLabel").textContent=selectedGame.name;
  $("zoneLabel").innerHTML=`SERVER / ZONE ${selectedGame.needsZone?"":"<span>(opsional)</span>"}`;
  $("productGrid").innerHTML=selectedGame.products.map((p,i)=>`<button class="product" data-p="${i}"><b>${p[0]}</b><small>${money(p[1])}</small></button>`).join("");
  document.querySelectorAll(".product").forEach(p=>p.onclick=()=>selectProduct(+p.dataset.p));
  updateSummary();document.getElementById("purchase").scrollIntoView({behavior:"smooth",block:"start"});
  toast(`${selectedGame.name} dipilih.`);
}
function selectProduct(i){
  selectedProduct=selectedGame.products[i];
  document.querySelectorAll(".product").forEach(x=>x.classList.remove("selected"));
  document.querySelector(`[data-p="${i}"]`).classList.add("selected");
  updateSummary();toast("Produk berhasil dipilih.");
}
function updateSummary(){
  const player=$("playerId").value.trim();
  $("sumGame").textContent=selectedGame?.name||"—";$("sumPlayer").textContent=player||"—";
  $("sumProduct").textContent=selectedProduct?.[0]||"—";
  const price=selectedProduct?.[1]||0,fee=price?1000:0;
  $("sumPrice").textContent=money(price);$("sumFee").textContent=money(fee);$("sumTotal").textContent=money(price+fee);
}
function startCheckout(){
  if(!selectedGame)return toast("Pilih game terlebih dahulu.");
  if(!$("playerId").value.trim())return toast("Masukkan Player ID.");
  if(!selectedProduct)return toast("Pilih nominal top up.");
  orderId=createOrder();
  $("orderId").textContent=orderId;
  $("paymentTotal").textContent=$("sumTotal").textContent;
  $("modalTotal").textContent=$("sumTotal").textContent;
  $("paymentStatus").textContent="● MENUNGGU PEMBAYARAN";
  $("paymentStatus").className="status-pill pending";
  ["step1","step2","step3","step4"].forEach((x,i)=>$(x).classList.toggle("active",i<2));
  $("payment").classList.add("show");$("payment").scrollIntoView({behavior:"smooth"});
  toast("Pesanan dibuat. Silakan scan QRIS.");
}
function openQr(){ $("qrModal").classList.remove("hidden") }
function closeQr(){ $("qrModal").classList.add("hidden") }
function startVerification(){
  if(!orderId)return toast("Buat pesanan terlebih dahulu.");
  $("paymentStatus").textContent="● MENUNGGU VERIFIKASI";
  $("paymentStatus").className="status-pill verifying";
  ["step1","step2","step3","step4"].forEach((x,i)=>$(x).classList.toggle("active",i<3));
  $("verifyModal").classList.remove("hidden");
  let seconds=300;
  $("countdown").textContent="05:00";
  clearInterval(verifyTimer);
  verifyTimer=setInterval(()=>{
    seconds--;const m=String(Math.floor(seconds/60)).padStart(2,"0"),s=String(seconds%60).padStart(2,"0");
    $("countdown").textContent=`${m}:${s}`;
    if(seconds<=0){clearInterval(verifyTimer);finishVerification()}
  },1000);
}
function finishVerification(){
  $("verifyModal").classList.add("hidden");
  $("paymentStatus").textContent="● TERVERIFIKASI — PESANAN DIPROSES";
  $("paymentStatus").className="status-pill verifying";
  ["step1","step2","step3","step4"].forEach(x=>$(x).classList.add("active"));
  toast("Demo verifikasi selesai. Pesanan sedang diproses.");
}
function trackOrder(){
  const q=$("orderSearch").value.trim().toUpperCase();
  if(!q)return toast("Masukkan nomor pesanan.");
  const valid=orderId&&q===orderId;
  $("trackResult").classList.remove("hidden");
  $("trackResult").innerHTML=valid
    ? `<b>${orderId}</b><p class="muted">Game: ${selectedGame?.name||"—"} • Produk: ${selectedProduct?.[0]||"—"}</p><div class="steps"><div class="step active"><span>✓</span><div><b>Pesanan dibuat</b><small>Order aktif</small></div></div><div class="step ${$("paymentStatus").textContent.includes("TERVERIFIKASI")?"active":""}"><span>2</span><div><b>Verifikasi pembayaran</b><small>${$("paymentStatus").textContent}</small></div></div><div class="step"><span>3</span><div><b>Pesanan diproses</b><small>Menunggu proses game</small></div></div></div>`
    : `<b>Pesanan tidak ditemukan</b><p class="muted">Untuk demo ini, gunakan nomor pesanan yang dibuat pada sesi checkout.</p>`;
}
$("gameGrid").innerHTML="";
renderGames();
$("playerId").addEventListener("input",updateSummary);
$("checkoutBtn").onclick=startCheckout;
$("qrImageBtn").onclick=openQr;$("zoomQr").onclick=openQr;$("modalClose").onclick=closeQr;$("modalBackdrop").onclick=closeQr;
$("copyTotal").onclick=async()=>{try{await navigator.clipboard.writeText($("sumTotal").textContent);toast("Total berhasil disalin.")}catch{toast("Total: "+$("sumTotal").textContent)}};
$("paidBtn").onclick=startVerification;
$("cancelBtn").onclick=()=>{clearInterval(verifyTimer);$("payment").classList.remove("show");toast("Pembayaran dibatalkan.")};
$("trackBtn").onclick=trackOrder;
$("menuBtn").onclick=()=>$("navMenu").classList.toggle("open");

const music=$("music"),musicBtn=$("musicBtn");
musicBtn.onclick=()=>{
  if(!music.src){toast("Tambahkan file audio legal/royalty-free ke atribut src di index.html.");return}
  if(music.paused){music.play();musicBtn.innerHTML="♫ <span>Music</span><b>ON</b>"}else{music.pause();musicBtn.innerHTML="♫ <span>Music</span><b>OFF</b>"}
};
