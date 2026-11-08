// Arena 1v1 sunucusu: oda kodu, hızlı eşleşme, mesaj aktarma ve temel hile koruması.
const http = require("http");
const { WebSocketServer } = require("ws");
const srv = http.createServer((q, r) => { r.writeHead(200, { "Content-Type": "text/plain" }); r.end("ok " + wss.clients.size); });
const wss = new WebSocketServer({ server: srv, maxPayload: 2048 });
const rooms = new Map();
let queue = null;
const send = (w, d) => { if (w && w.readyState === 1) w.send(JSON.stringify(d)); };
const code = () => Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.random() * 32 | 0]).join("");
function pair(a, b, c) { a.peer = b; b.peer = a; a.lx = b.lx = undefined; send(a, { t: "paired", host: true, c }); send(b, { t: "paired", host: false, c }); }

function relay(ws, d) {
  const now = Date.now();
  if (d.t === "s") {
    const x = +d.x, z = +d.z; if (!isFinite(x) || !isFinite(z)) return;
    d.x = Math.max(-19.6, Math.min(19.6, x)); d.z = Math.max(-19.6, Math.min(19.6, z));
    d.hp = Math.max(0, Math.min(150, +d.hp || 0)); d.y = Math.max(0, Math.min(20, +d.y || 0));
    if (d.hp <= 0) ws.lx = undefined;
    else if (ws.lx !== undefined && Math.hypot(d.x - ws.lx, d.z - ws.lz) > 25 * Math.max((now - ws.lt) / 1000, .05) + 1) return; // ışınlanma engeli
    if (d.hp > 0) { ws.lx = d.x; ws.lz = d.z; ws.lt = now; }
  } else if (d.t === "h") {
    if (now - (ws.hitT || 0) < 60) return; ws.hitT = now; d.d = Math.max(1, Math.min(400, +d.d || 0)); // hasar ve atış hızı sınırı
  } else if (d.t === "g") {
    if (now - (ws.gT || 0) < 500) return; ws.gT = now;
  } else if (d.t === "start" || d.t === "again") { ws.lx = undefined; if (ws.peer) ws.peer.lx = undefined; }
  else if (!["f", "k", "ch"].includes(d.t)) return;
  send(ws.peer, d);
}

wss.on("connection", ws => {
  ws.alive = true; ws.bucket = 200;
  ws.on("pong", () => { ws.alive = true; });
  const refill = setInterval(() => { ws.bucket = 200; }, 1000);
  ws.on("message", raw => {
    if (--ws.bucket < 0) return; // saniyede en fazla 200 mesaj
    let d; try { d = JSON.parse(raw); } catch (e) { return; }
    if (!d || typeof d.t !== "string") return;
    if (ws.peer) return relay(ws, d);
    if (d.t === "host" && !ws.hostRoom) { let c; do c = code(); while (rooms.has(c)); rooms.set(c, ws); ws.hostRoom = c; send(ws, { t: "room", c }); }
    else if (d.t === "join") {
      const h = rooms.get(String(d.c || "").toUpperCase());
      if (!h || h.peer || h === ws) return send(ws, { t: "err", m: "Oda bulunamadı ya da dolu." });
      rooms.delete(h.hostRoom); pair(h, ws, h.hostRoom);
    } else if (d.t === "quick") {
      if (queue && queue !== ws && queue.readyState === 1) { const q = queue; queue = null; pair(q, ws, "hizli"); }
      else { queue = ws; send(ws, { t: "wait" }); }
    }
  });
  ws.on("close", () => {
    clearInterval(refill);
    if (queue === ws) queue = null;
    if (ws.hostRoom) rooms.delete(ws.hostRoom);
    if (ws.peer) { send(ws.peer, { t: "left" }); ws.peer.peer = null; }
  });
});
setInterval(() => wss.clients.forEach(w => { if (!w.alive) return w.terminate(); w.alive = false; w.ping(); }), 15000);
srv.listen(process.env.PORT || 8080, () => console.log("Arena sunucusu çalışıyor"));
