(function(root){
 'use strict';
 const script=document.currentScript;
 const base=new URL('../',script.src);
 const prefix='shin-du-ky:'+base.pathname+':';
 const teachers=[['Cô Long Ngân','longngan@proskills.ac.vn'],['Cô Kim Dung','dungndlk@jpc.edu.vn'],['Cô Lê Uyên','uyenlt@proskills.ac.vn'],['Cô Trần Thi','tranthi@proskills.ac.vn'],['Thầy Đăng Khoa','Dangkhoa@proskills.ac.vn'],['Cô Quỳnh Anh','quynhanh@proskills.ac.vn'],['Cô Nguyệt Quỳnh','quynhntn@proskills.ac.vn']];
 const fields=['name','cls','sid','by','teacherEmail'];
 let connection=null, baseline=null;
 function key(s){return prefix+s;}
 function read(k){try{return JSON.parse(localStorage.getItem(key(k))||'null');}catch{return null;}}
 function write(k,v){localStorage.setItem(key(k),JSON.stringify(v));}
 function profile(){return read('profile')||{};}
 function setProfile(p){
  const clean={}; fields.forEach(f=>{clean[f]=String(p[f]||'').trim();});
  clean.updatedAt=Date.now();write('profile',clean);return clean;
 }
 function extract(id,s,list){
  const p={name:s.name||'',cls:s.cls||''};
  if(id!=='routine')p.by=s.by||'';
  if(id==='career')p.sid=s.sid||'';
  let i=id==='career'?(s.d||{}).teacher24:id==='routine'?s.teacher:(s.teacher||{}).i;
  p.teacherEmail=i!=null&&list&&list[i]?list[i][1]:'';
  return p;
 }
 function apply(id,s,p,list){
  ['name','cls'].forEach(f=>{if(p[f]!=null)s[f]=p[f];});
  if(id!=='routine'&&p.by!=null)s.by=p.by;
  if(id==='career'&&p.sid!=null)s.sid=p.sid;
  if(p.teacherEmail!=null&&list){
   const i=list.findIndex(t=>t[1].toLowerCase()===p.teacherEmail.toLowerCase());
   if(id==='career'){s.d=s.d||{};if(i>=0)s.d.teacher24=i;else delete s.d.teacher24;s.temail=i>=0?list[i][1]:'';}
   else if(id==='routine')s.teacher=i>=0?i:null;
   else s.teacher=i>=0?{i}:{};
  }
  return s;
 }
 function early(id,s,demo){if(!demo)apply(id,s,profile());return s;}
 function sync(){
  if(!connection||connection.demo())return;
  apply(connection.id,connection.get(),profile(),connection.teachers);
  baseline=extract(connection.id,connection.get(),connection.teachers);
 }
 function persist(id,s,demo){
  if(!connection||demo||connection.id!==id)return;
  const now=extract(id,s,connection.teachers),p=profile();let changed=false;
  // Merge only fields edited in this module. A stale tab cannot overwrite unrelated edits.
  Object.keys(now).forEach(f=>{if(baseline&&now[f]!==baseline[f]){p[f]=now[f];changed=true;}});
  if(changed)setProfile(p);
  apply(id,s,profile(),connection.teachers);
  baseline=extract(id,s,connection.teachers);
 }
 function mount(config){
  connection=config;sync();
  if(!profile().name){location.replace(base.href+'?profile=1');return;}
  if(!config.demo())config.save();
  document.addEventListener('DOMContentLoaded',()=>{
   const bar=document.createElement('nav');bar.className='sdk-nav';bar.setAttribute('aria-label','Shin du ký');
   bar.innerHTML='<a class="sdk-home" href="'+base.href+'">← Trang chủ</a><span>Shin du ký</span><a href="'+base.href+'?profile=1">Hồ sơ</a>';
   document.body.dataset.sdkModule=config.id;
   document.body.appendChild(bar);
   bar.addEventListener('click',e=>{if(e.target.closest('a'))config.save();});
  });
  window.addEventListener('pageshow',e=>{if(e.persisted){sync();config.render();}});
  window.addEventListener('storage',e=>{
   if(e.key!==key('profile'))return;
   sync();if(document.hidden)return;
   if(!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))config.render();
  });
 }
 function snapshot(){
  const keys=['profile','jpc-hp3-career-design-v19','nbdk-hp05','kzmn-data'];const data={};
  keys.forEach(k=>{const v=read(k);if(v)data[k]=v;});return {format:'shin-du-ky',version:1,exportedAt:new Date().toISOString(),data};
 }
 root.ShinHub={base:base.href,prefix,key,read,write,profile,setProfile,teachers,apply,extract,early,persist,mount,snapshot,sync};
})(window);
