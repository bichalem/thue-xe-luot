const ls={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
const rnd=()=>hex(crypto.getRandomValues(new Uint8Array(12)));
const hs=async s=>hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));
async function hp(p,s){const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(p),"PBKDF2",false,["deriveBits"]);return hex(await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(s),iterations:100000,hash:"SHA-256"},k,256))}
const chk=async(u,p)=>u.pw===(u.salt?await hp(p,u.salt):await hs(p));
const BUILTIN=[{id:"luot_admin",username:"luot_admin",salt:"5676186d5f411893358cd91e",pw:"a5d36864996e9035c77b57977a5625b2f7188b77616f8259e7552e1e5a489339",main:true,ts:0}];
async function api(method,path,body,tk){const h={"Content-Type":"application/json"},t=tk&&ls.get(tk);if(t)h.Authorization="Bearer "+t;
  const r=await fetch((window.LUOT_API||"")+path,{method,headers:h,body:body?JSON.stringify(body):undefined}),j=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error(j.error||("Lỗi "+r.status));e.code=r.status;throw e}return j}
const COLS=["users","trips","msgs","partners","admins","media","cars","places","reviews","meta","listings"];
const DB={mode:"local",ready:false,canEdit:false,d:null,cache:{},subs:[],
list(c){const l=this.cache[c]||[];return c==="admins"&&this.mode!=="api"?BUILTIN.filter(b=>!l.some(x=>x.id===b.id)).concat(l):l},
onChange(f){this.subs.push(f)},
_n(c){this.subs.forEach(f=>{try{f(c)}catch(e){console.warn(e)}})},
async _w(c,fn,local){const prev=this.cache[c];local();this._n(c);try{if(this.d)await fn(this.d);else localStorage.setItem("luot_db_"+c,JSON.stringify(this.cache[c]))}catch(e){this.cache[c]=prev;this._n(c);throw e}},
put(c,id,o){if(this.mode==="api")return this._api("put",c,id,o);o={...o,id};return this._w(c,d=>d.doc(c+"/"+id).set(o),()=>{this.cache[c]=(this.cache[c]||[]).filter(x=>x.id!==id).concat([o])})},
del(c,id){if(this.mode==="api")return this._api("del",c,id);return this._w(c,d=>d.doc(c+"/"+id).delete(),()=>{this.cache[c]=(this.cache[c]||[]).filter(x=>x.id!==id)})},
async _api(op,c,id,o){const adm=location.hash.startsWith("#/quan-tri-luot")&&ls.get("luot_atok");let r;
  if(c==="trips"){if(op==="del")r=["DELETE","/api/admin/trips/"+id];else if(this.list("trips").some(t=>t.id===id))r=adm?["PUT","/api/admin/trips/"+id,{status:o.st}]:["POST","/api/trips/"+id+"/cancel"];else r=["POST","/api/trips",o]}
  else if(c==="cars"||c==="places")r=op==="del"?["DELETE",`/api/admin/${c}/${encodeURIComponent(id)}`]:["PUT",`/api/admin/${c}/${encodeURIComponent(id)}`,o];
  else if(c==="reviews")r=op==="del"?(adm?["DELETE","/api/admin/reviews/"+encodeURIComponent(id)]:["DELETE","/api/reviews/"+encodeURIComponent(id)]):["POST","/api/reviews",{type:o.type,target:o.target,rating:o.rating,body:o.body}];
  else if(c==="meta")return;
  else if(c==="msgs"||c==="partners")r=op==="del"?["DELETE",`/api/admin/${c}/${id}`]:["POST","/api/"+c,o];
  else if(c==="users")r=op==="del"?(adm?["DELETE","/api/admin/users/"+encodeURIComponent(id)]:["DELETE","/api/me"]):["PUT","/api/me",o];
  else if(c==="admins")r=["DELETE","/api/admin/admins/"+id];
  else if(c==="media")r=["DELETE","/api/admin/media/"+id];
  else throw new Error("Không hỗ trợ: "+c);
  await api(r[0],r[1],r[2],adm?"luot_atok":"luot_tok");await this.refresh()},
async refresh(){const B=window.LUOT_API||"",old={};COLS.forEach(c=>old[c]=JSON.stringify(this.cache[c]));
  try{const p=await api("GET","/api/public",null,"luot_tok");this.cache.cars=p.cars;this.cache.places=p.places;this.cache.reviews=p.reviews;this.cache.media=p.media.map(m=>({id:m.id,url:B+m.url}))}catch(e){}
  this.cache.users=[];this.cache.trips=[];this.cache.msgs=[];this.cache.partners=[];this.cache.admins=[];
  if(ls.get("luot_tok")){try{const m=await api("GET","/api/me",null,"luot_tok");this.cache.users=[{...m.user,id:m.user.email}];this.cache.trips=m.trips}catch(e){ls.set("luot_tok",null)}}
  if(ls.get("luot_atok")){try{const a=await api("GET","/api/admin/all",null,"luot_atok");Object.assign(this.cache,a)}catch(e){ls.set("luot_atok",null);ls.set("luot_adm",null)}}
  COLS.forEach(c=>{if(JSON.stringify(this.cache[c])!==old[c])this._n(c)})},
async init(){
  if(typeof window!=="undefined"&&window.LUOT_API!=null){this.mode="api";await this.refresh();this.ready=true;this._n("init");return}
  const to=ms=>new Promise(r=>setTimeout(()=>r(null),ms));
  this._n("local");
  if(typeof claude!=="undefined"){try{
    const d=await Promise.race([claude.use("db"),to(6000)]);
    if(d){this.d=d;this.mode="cloud";COLS.forEach(c=>{this.cache[c]=[];d.collection(c).onSnapshot(s=>{this.cache[c]=s.docs.map(x=>({...x.data(),id:x.id}));this._n(c)},e=>console.warn(c,e&&e.code))})}
    const u=await Promise.race([claude.use("user"),to(3000)]);this.canEdit=!!(u&&typeof u.canEdit==="function"&&u.canEdit());
  }catch(e){console.warn(e)}}
  this.ready=true;this._n("init")}};
COLS.forEach(c=>DB.cache[c]=ls.get("luot_db_"+c)||[]);
if(!DB.cache.users.length)DB.cache.users=(ls.get("luot_users")||[]).map(u=>({...u,id:u.email}));
