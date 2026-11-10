(() => {
 'use strict';
 const H=ShinHub,$=s=>document.querySelector(s),form=$('#profile-form'),dialog=$('#profile-dialog');
 const select=form.elements.teacherEmail;
 H.teachers.forEach(t=>select.add(new Option(t[0],t[1])));
 form.elements.by.min=1950;form.elements.by.max=new Date().getFullYear()-12;
 function notice(text){$('#notice').textContent=text;$('#notice').hidden=false;setTimeout(()=>$('#notice').hidden=true,8000);}
 function refresh(){
  const p=H.profile();
  if(p.name){$('#greeting').textContent='Chào '+p.name+', hôm nay mình đi đâu?';$('#identity').hidden=false;const t=H.teachers.find(t=>t[1].toLowerCase()===String(p.teacherEmail).toLowerCase());$('#identity').textContent=[p.cls&&'Lớp '+p.cls,p.sid&&'MSHV '+p.sid,t&&t[0]].filter(Boolean).join(' · ');}
  const c=H.read('jpc-hp3-career-design-v19'),j=H.read('nbdk-hp05'),r=H.read('kzmn-data');
  if(c)$('#career-status').textContent=Object.values(c.done||{}).filter(Boolean).length+' hoạt động đã hoàn thành';
  if(j)$('#japan-status').textContent=Object.values(j.done||{}).filter(Boolean).length+' hoạt động đã hoàn thành';
  if(r)$('#routine-status').textContent=(r.slots||[]).filter(Boolean).length+' thẻ trong hành trình rèn luyện';
 }
 function openProfile(){const p=H.profile();['name','cls','by','sid','teacherEmail'].forEach(k=>form.elements[k].value=p[k]||'');$('#profile-close').hidden=!p.name;if(!dialog.open)dialog.showModal();}
 function valid(p){const y=Number(p.by);return p.name&&p.name.trim().length<=40&&p.cls&&p.cls.trim().length<=20&&Number.isInteger(y)&&y>=1950&&y<=new Date().getFullYear()-12;}
 $('#profile-button').onclick=openProfile;
 $('#profile-close').onclick=()=>dialog.close();
 dialog.addEventListener('cancel',e=>{if(!H.profile().name)e.preventDefault();});
 form.onsubmit=e=>{
  e.preventDefault();const p=Object.fromEntries(new FormData(form));
  if(!valid(p)){$('#profile-error').textContent='Kiểm tra lại họ tên, lớp và năm sinh nhé.';$('#profile-error').hidden=false;return;}
  try{H.setProfile(p);dialog.close();refresh();notice('Đã lưu hồ sơ chung cho cả ba hành trình.');history.replaceState(null,'',location.pathname);document.dispatchEvent(new Event('sdk-profile-saved'));}catch{$('#profile-error').textContent='Trình duyệt chưa lưu được hồ sơ. Hãy mở bằng Chrome hoặc Safari và cho phép lưu dữ liệu.';$('#profile-error').hidden=false;}
 };
 document.querySelectorAll('[data-module]').forEach(a=>a.addEventListener('click',e=>{if(!valid(H.profile())){e.preventDefault();openProfile();}}));
 $('#backup').onclick=()=>{
  const blob=new Blob([JSON.stringify(H.snapshot(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Shin-du-ky_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('Đã tạo bản sao lưu. Giữ file trong thư mục Tải về của bạn.');
 };
 $('#restore').onclick=()=>$('#restore-file').click();
 $('#restore-file').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
   if(file.size>30*1024*1024)throw Error('size');const backup=JSON.parse(await file.text());
   if(backup.format!=='shin-du-ky'||backup.version!==1||!backup.data||!valid(backup.data.profile||{}))throw Error('format');
   const allowed=['profile','jpc-hp3-career-design-v19','nbdk-hp05','kzmn-data'];
   for(const k of Object.keys(backup.data)){if(!allowed.includes(k)||!backup.data[k]||typeof backup.data[k]!=='object'||Array.isArray(backup.data[k]))throw Error('format');}
   if(backup.data['jpc-hp3-career-design-v19']&&!backup.data['jpc-hp3-career-design-v19'].d)throw Error('career');
   if(backup.data['nbdk-hp05']&&!backup.data['nbdk-hp05'].d)throw Error('japan');
   if(backup.data['kzmn-data']&&(!backup.data['kzmn-data'].habits||!Array.isArray(backup.data['kzmn-data'].slots)))throw Error('routine');
   if(!confirm('Khôi phục sẽ thay hồ sơ và dữ liệu cả ba module bằng bản sao này. Hãy đóng các tab khóa học khác trước khi tiếp tục. Bạn đã lưu bản sao dữ liệu hiện tại chưa?'))return;
   const previous=allowed.map(k=>[k,localStorage.getItem(H.key(k))]);
   try{allowed.forEach(k=>{if(backup.data[k])H.write(k,backup.data[k]);else localStorage.removeItem(H.key(k));});}
   catch(err){previous.forEach(([k,v])=>{if(v===null)localStorage.removeItem(H.key(k));else localStorage.setItem(H.key(k),v);});throw err;}
   refresh();notice('Đã khôi phục hồ sơ và dữ liệu trong bản sao.');
  }catch{notice('Không khôi phục được. Kiểm tra file sao lưu Shin du ký và dung lượng lưu trữ trên máy.');}
  finally{e.target.value='';}
 };
 window.addEventListener('pageshow',refresh);window.addEventListener('storage',refresh);refresh();
 if(!valid(H.profile())||new URLSearchParams(location.search).has('profile'))openProfile();
})();
