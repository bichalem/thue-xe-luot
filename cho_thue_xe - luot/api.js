/* Chế độ SQL Server: chỉ chạy khi window.LUOT_API khác null (xem config.js). Mọi kiểm tra quyền nằm ở máy chủ. */
if(window.LUOT_API!=null){
const _su=setUser;setUser=(u,ns)=>{_su(u,ns);if(!u&&!ns){ls.set("luot_tok",null);DB.refresh()}};
async function afterAuth(r){ls.set("luot_tok",r.token);ls.set("luot_me",r.user.email);await DB.refresh();setUser(U().find(u=>u.email===r.user.email)||r.user);const b=ls.get("luot_back")||"#top";ls.set("luot_back",null);location.hash=b}
$("#fl").onsubmit=async e=>{e.preventDefault();const f=e.target;err(f,"");try{const r=await api("POST","/api/login",{email:f.email.value.trim().toLowerCase(),password:f.pw.value});f.reset();toast("Đăng nhập thành công");await afterAuth(r)}catch(x){err(f,x.message)}};
$("#fg").onsubmit=async e=>{e.preventDefault();const f=e.target,v=n=>f[n].value.trim();err(f,"");
  if(f.pw.value!==f.pw2.value)return err(f,"Mật khẩu nhập lại không khớp.");if(!f.tc.checked)return err(f,"Bạn cần đồng ý điều khoản sử dụng.");
  try{const r=await api("POST","/api/register",{name:v("nm"),email:v("email"),phone:v("ph"),password:f.pw.value});f.reset();toast("Tạo tài khoản thành công");await afterAuth(r)}catch(x){err(f,x.message)}};
H.profile=async f=>{err(f,"");try{await api("PUT","/api/me",{name:f.nm.value,phone:f.ph.value},"luot_tok");await DB.refresh();setUser(U().find(x=>x.email===me.email));toast("Đã cập nhật hồ sơ")}catch(x){err(f,x.message)}};
H.pass=async f=>{err(f,"");try{await api("POST","/api/me/password",{old:f.o.value,new:f.n.value},"luot_tok");f.reset();toast("Đã đổi mật khẩu")}catch(x){err(f,x.message)}};
H.forgot=f=>err(f,"Việc đặt lại mật khẩu cần xác minh email. Hãy liên hệ hỗ trợ để được cấp mật khẩu tạm.");
H.admlogin=async f=>{err(f,"");try{const r=await api("POST","/api/admin/login",{username:f.u.value,password:f.p.value});ls.set("luot_atok",r.token);ls.set("luot_adm",r.admin.id);await DB.refresh();toast("Chào admin "+r.admin.id);route()}catch(x){err(f,x.message)}};
H.admadd=async f=>{err(f,"");if(f.p.value!==f.p2.value)return err(f,"Mật khẩu nhập lại không khớp.");try{await api("POST","/api/admin/admins",{username:f.u.value,password:f.p.value},"luot_atok");f.reset();await DB.refresh();toast("Đã tạo tài khoản admin")}catch(x){err(f,x.message)}};
H.admpass=async f=>{err(f,"");try{await api("POST","/api/admin/password",{old:f.o.value,new:f.n.value},"luot_atok");f.reset();toast("Đã đổi mật khẩu admin")}catch(x){err(f,x.message)}};
SP.addEventListener("click",e=>{const t=e.target.closest("button[data-ad=resetpw]");if(!t)return;e.stopImmediatePropagation();
  api("POST","/api/admin/users/"+encodeURIComponent(t.dataset.id)+"/reset",null,"luot_atok").then(r=>prompt("Mật khẩu tạm, hãy gửi cho khách:",r.tempPassword)).catch(wf)},true);
SP.addEventListener("click",e=>{if(e.target.closest("button[data-ad=out]")){ls.set("luot_atok",null);DB.refresh()}});
upImg=async t=>{const f=t.files[0],k=t.dataset.key;if(!f)return;try{const bl=await shrink(f),du=await new Promise((ok,no)=>{const fr=new FileReader();fr.onload=()=>ok(fr.result);fr.onerror=no;fr.readAsDataURL(bl)});
  await api("PUT","/api/admin/media/"+k,{dataUrl:du},"luot_atok");await DB.refresh();toast("Đã lưu ảnh")}catch(e){toast("Không lưu được ảnh: "+e.message)}};
}
