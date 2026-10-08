const $=s=>document.querySelector(s),m=$("#m"),T=$("#toast");
const G=["#d9dedb,#9aa7a1","#8a5a55,#3d2b2b","#8a7a5a,#3a3a30","#7d9aa8,#2f4654","#c9c2b0,#6b6a5c","#a9b4c4,#4d5a70","#3a3f45,#101214","#9aa88a,#44503a"];
rebuildCatalog();
const vnd=n=>Math.round(n).toLocaleString("vi-VN")+"đ";
const p2=n=>String(n).padStart(2,"0");
const fmt=d=>`${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;
const st={f:"",all:false,fav:new Set(),user:null};
const a=new Date(Date.now()+864e5);a.setHours(9,0);const b=new Date(a.getTime()+2*864e5);b.setHours(18,0);
$("#d1").value=fmt(a);$("#d2").value=fmt(b);
const days=()=>{const x=new Date($("#d1").value),y=new Date($("#d2").value);return Math.max(1,Math.ceil((y-x)/864e5))};
const toast=t=>{T.textContent=t;T.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>T.classList.remove("on"),2600)};
function render(){
  {const hd=$("#hdest");if(hd)hd.innerHTML=(places.some(p=>p.home)?places.filter(p=>p.home).sort((a,b)=>(a.hord??a.ord??0)-(b.hord??b.ord??0)):places).slice(0,6).map(p=>`<a class="ph dest" href="#/diem-den/${encodeURIComponent(p.name)}">${placeSVG(p.id)}<h3>${esc(p.name)}</h3><small>Từ ${vnd(p.from)} / ngày</small><span class="go">↗</span></a>`).join("")}
  const ck=(places.find(p=>p.name===$("#city").value)||{}).id;
  let l=cars.filter(c=>c[8].includes(ck)&&!hid(cars.indexOf(c))&&(!st.f||c[4].split(" ").includes(st.f)));
  const n=l.length;if(!st.all&&!st.f&&l.length>3)l=l.slice(0,3);
  $("#cars").innerHTML=l.map(c=>{const i=cars.indexOf(c);return `<article class="car"><div class="ph" data-d="${c[9]}" style="background:linear-gradient(135deg,${G[i%G.length]})">${carSVG(i)}<span class="badge">${c[3]}</span><button class="fav" data-f="${c[9]}" aria-pressed="${st.fav.has(c[9])}" aria-label="Yêu thích">♥</button></div><div class="bd"><div class="r"><div><b>${c[0]}</b><br><small>${c[1]}</small></div>${rt("car",c[9])}</div><div class="sp"><span>👤 ${c[5]} chỗ</span><span>⛽ ${c[6]}</span><span>⚙ ${c[7]}</span></div><div class="r"><div class="price"><small>Từ</small><br>${vnd(c[2])} <small>/ ngày</small></div><button class="go" data-i="${i}" aria-label="Đặt ${c[0]}">↗</button></div></div></article>`}).join("")||'<p class="mut">Chưa có xe phù hợp tại khu vực này. Hãy thử nhóm hoặc thành phố khác.</p>';
  $("#cnt").textContent=`Hiển thị ${l.length}/${n} xe tại ${$("#city").value}`;
  $("#all").style.display=st.all||st.f||n<=3?"none":"";
}
function book(i){
  const c=cars[i],d=days();
  m.innerHTML=`<div class="mb"><button class="x" onclick="m.close()" aria-label="Đóng">✕</button><h3>${c[0]}</h3><p class="mut" style="font-size:13px;margin-bottom:14px">${c[1]} · ${c[5]} chỗ · ${c[7]}</p>
  <div class="row"><span>Nhận: ${$("#d1").value.replace("T"," ")}</span><span>${d} ngày</span></div><div class="row" style="padding-top:0"><span>Trả: ${$("#d2").value.replace("T"," ")}</span><span>${$("#city").value}</span></div>
  <label class="ext"><input type="checkbox" data-p="100000"> Bảo hiểm mở rộng (+100.000đ/ngày)</label>
  <label class="ext"><input type="checkbox" data-p="50000"> Ghế trẻ em (+50.000đ/ngày)</label>
  <label class="ext"><input type="checkbox" data-p="150000" data-once> Giao xe tận nơi (+150.000đ)</label>
  <input class="in" id="pc" placeholder="Mã giảm giá (thử LUOT20)"><div class="msg" id="pm"></div>
  <div class="row"><span>Giá thuê (${vnd(c[2])} × ${d})</span><span id="r1"></span></div><div class="row"><span>Phụ phí</span><span id="r2"></span></div><div class="row"><span>Giảm giá</span><span id="r3"></span></div><div class="row t"><span>Tổng cộng</span><span id="r4"></span></div>
  <input class="in" id="nm" placeholder="Họ và tên" autocomplete="name" value="${esc(st.user||"")}"><input class="in" id="ph" placeholder="Số điện thoại" inputmode="tel" autocomplete="tel">
  <button class="btn lime" style="width:100%;justify-content:center;margin-top:8px" id="ok">Xác nhận đặt nhanh</button><a class="btn" style="width:100%;justify-content:center;margin-top:8px" href="#/thue-xe/${c[9]}" onclick="m.close()">Đăng ký thuê đầy đủ (CCCD, GPLX)</a></div>`;
  m.showModal();
  const calc=()=>{let x=0;m.querySelectorAll("[data-p]:checked").forEach(e=>x+=+e.dataset.p*(e.hasAttribute("data-once")?1:d));
    const base=c[2]*d,pr=promo($("#pc").value,c,d,base),ds=pr.ds;
    $("#pm").textContent=pr.msg;
    $("#r1").textContent=vnd(base);$("#r2").textContent=vnd(x);$("#r3").textContent=ds?"-"+vnd(ds):"0đ";$("#r4").textContent=vnd(base+x-ds)};
  m.querySelectorAll("input").forEach(e=>e.oninput=calc);calc();
  $("#ok").onclick=()=>{const nm=$("#nm").value.trim(),ph=$("#ph").value.trim();
    if(!nm||!/^0\d{9}$/.test(ph))return toast("Vui lòng nhập họ tên và SĐT 10 số");
    const code="LUOT-"+Math.random().toString(36).slice(2,8).toUpperCase();saveTrip({code,car:c[0],city:$("#city").value,from:$("#d1").value,to:$("#d2").value,days:d,total:$("#r4").textContent,pay:"Đặt nhanh"});
    m.innerHTML=`<div class="mb ok"><div style="font-size:44px">🎉</div><h3>Đặt xe thành công!</h3><p class="mut" style="font-size:14px">Cảm ơn ${esc(nm)}. Lướt sẽ gọi xác nhận qua ${esc(ph)} trong ít phút.</p><b>${code}</b><p class="mut" style="font-size:12px">${c[0]} · ${d} ngày · ${$("#r4")?"":""}Đây là bản demo, chưa có giao dịch thật.</p><button class="btn dark" onclick="m.close()">Đóng</button></div>`}
}
$("#cars").onclick=e=>{const f=e.target.closest("[data-f]");if(f){const i=f.dataset.f;st.fav.has(i)?st.fav.delete(i):st.fav.add(i);f.setAttribute("aria-pressed",st.fav.has(i));toast(st.fav.has(i)?"Đã thêm vào yêu thích":"Đã bỏ yêu thích");return}
  const dd=e.target.closest("[data-d]");if(dd){location.hash="#/xe/"+dd.dataset.d;return}const t=e.target.closest("[data-i]");if(t)book(+t.dataset.i)};
document.querySelector(".search").onsubmit=e=>{e.preventDefault();if(new Date($("#d2").value)<=new Date($("#d1").value))return toast("Ngày trả phải sau ngày nhận");st.all=true;render();$("#xe").scrollIntoView();toast(`Tìm thấy xe tại ${$("#city").value} · ${days()} ngày`)};
$("#city").onchange=render;$("#all").onclick=()=>{location.hash="#/dong-xe"};
$("#f").onclick=e=>{if(e.target.tagName!=="BUTTON")return;document.querySelectorAll("#f button").forEach(x=>x.classList.remove("on"));e.target.classList.add("on");st.f={"Tất cả":"","Xe điện":"ev","SUV":"suv","Sedan":"sedan","7 chỗ":"7","Xe sang":"lux"}[e.target.textContent];render()};
$("#promo").onclick=()=>{navigator.clipboard?.writeText("LUOT20").catch(()=>{});toast("Đã sao chép mã LUOT20 (giảm 20% cho chuyến từ 3 ngày)")};
m.addEventListener("click",e=>{if(e.target===m)m.close()});
document.querySelectorAll(".tabs button").forEach(x=>x.onclick=()=>{document.querySelectorAll(".tabs button").forEach(y=>y.classList.remove("on"));x.classList.add("on");if(x.textContent==="Có tài xế")toast("Dịch vụ có tài xế sắp ra mắt")});
document.querySelectorAll(".app .btn,.cta .btn").forEach(x=>x.addEventListener("click",()=>toast("Bản demo: liên kết chưa khả dụng")));
render();
