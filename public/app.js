// 家常菜谱手册 — 数据来自 data/recipes.json（build.py 生成）
let DATA = [];
const $ = s => document.querySelector(s);

init();
async function init() {
  const res = await fetch("./data/recipes.json");
  DATA = await res.json();
  $("#meta").textContent =
    `做饭小白的 AI Studio 对话存档 · ${DATA.length} 篇 · ${DATA[DATA.length - 1].date} ~ ${DATA[0].date}`;
  $("#foot").textContent =
    `共 ${DATA.length} 篇对话 · 步骤勾选进度保存在本机浏览器`;
  $("#grid").innerHTML = DATA.map((r, i) => `
    <div class="card" data-i="${i}">
      <div class="card-top"><span class="tag">食谱</span><span class="date">${r.date}</span></div>
      <h3>${esc(r.title)}</h3>
      <p class="excerpt">${esc(r.q.slice(0, 60))}${r.q.length > 60 ? "…" : ""}</p>
      <button class="open" onclick="openRecipe('${esc(r.id)}')">查看做法 →</button>
    </div>`).join("");
  $("#search").addEventListener("input", e => apply(e.target.value.trim().toLowerCase()));
  window.addEventListener("hashchange", onHash);
  onHash(); // 支持 #菜名 直达
}

function esc(s) {
  return s.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function apply(q) {
  document.querySelectorAll(".card").forEach(el => {
    const ok = !q || DATA[+el.dataset.i].raw.includes(q);
    el.classList.toggle("hidden", !ok);
  });
  $("#empty").classList.toggle("hidden", DATA.some(r => !q || r.raw.includes(q)));
}

function openRecipe(id) { location.hash = "#" + encodeURIComponent(id); }

function renderDetail(id) {
  const i = DATA.findIndex(r => r.id === id);
  if (i < 0) return;
  const r = DATA[i];
  $("#detailBox").innerHTML = `
    <div class="detail-head">
      <span class="tag">食谱</span><h2>${esc(r.title)}</h2>
      <div class="meta">${r.date} · ${r.turns} 轮回复 · 原始对话：${esc(r.id)}</div>
      <div class="q">当时的提问：${esc(r.q)}</div>
    </div>
    <div class="content" data-rid="${esc(r.id)}">${r.html}</div>
    <button id="close" onclick="closeRecipe()">✕</button>`;
  $("#overlay").classList.add("show");
  $("#overlay").scrollTop = 0;
  enhance();
}

function closeRecipe() {
  if (location.hash) history.pushState("", document.title, location.pathname);
  $("#overlay").classList.remove("show");
  $("#detailBox").innerHTML = "";
}

function onHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (id) renderDetail(id);
  else { $("#overlay").classList.remove("show"); $("#detailBox").innerHTML = ""; }
}

// 有序列表每步变成可勾选，进度按菜名存 localStorage
function enhance() {
  document.querySelectorAll("#detailBox .content ol > li").forEach((li, idx) => {
    const rid = $("#detailBox .content").dataset.rid;
    const key = "recipe:" + rid + ":" + idx;
    const wrap = document.createElement("div");
    wrap.className = "step";
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = localStorage.getItem(key) === "1";
    const body = document.createElement("label");
    while (li.firstChild) body.appendChild(li.firstChild);
    wrap.append(cb, body); li.appendChild(wrap);
    const sync = () => { wrap.classList.toggle("done", cb.checked); localStorage.setItem(key, cb.checked ? "1" : "0"); };
    cb.onchange = sync; sync();
  });
}

document.addEventListener("keydown", e => { if (e.key === "Escape") closeRecipe(); });
$("#overlay").addEventListener("click", e => { if (e.target.id === "overlay") closeRecipe(); });
