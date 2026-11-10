(() => {
 'use strict';
 const H=ShinHub;
 let invitation=null;
 const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();invitation=e;update();});
 window.addEventListener('appinstalled',()=>{invitation=null;update();const text=document.getElementById('install-steps');if(text)text.textContent='Máy đã nhận yêu cầu cài. Hãy chờ hoàn tất, sau đó tìm biểu tượng con tàu Shin du ký.';});
 function update(){
  const text=document.getElementById('install-steps'),button=document.getElementById('install-now');if(!text)return;
  text.textContent=installed()?'Bạn đang mở Shin du ký từ ứng dụng.':ios?'Trên iPhone/iPad: mở link bằng Safari → Chia sẻ → Thêm vào Màn hình chính → bật “Mở dưới dạng ứng dụng web” nếu có → Thêm.':invitation?'Chạm “Cài ứng dụng”, xác nhận rồi chờ máy cài xong.':'Mở link bằng Chrome → menu ⋮ → Cài đặt ứng dụng / Thêm vào màn hình chính. Tên menu tùy trình duyệt. Nếu đã cài, tìm Shin du ký trong danh sách ứng dụng.';
  button.hidden=!invitation||installed()||ios;
 }
 function help(){const d=document.getElementById('install-dialog');if(!d){location.href=H.base+'?install=1';return;}update();if(!d.open)d.showModal();try{localStorage.setItem(H.key('install-guide'),'1');}catch{}}
 window.ShinInstallHelp=help;
 document.addEventListener('click',e=>{if(e.target.closest('[data-pwa="install"]')){e.preventDefault();help();}});
 const launch=document.getElementById('install-help');if(launch){
  launch.onclick=help;document.getElementById('install-close').onclick=()=>document.getElementById('install-dialog').close();
  document.getElementById('install-now').onclick=async()=>{if(!invitation)return;const e=invitation;invitation=null;try{await e.prompt();const choice=await e.userChoice;if(choice.outcome==='accepted')document.getElementById('install-steps').textContent='Đã gửi yêu cầu cài. Hãy chờ máy hoàn tất rồi mở từ biểu tượng con tàu.';else update();}catch{update();}document.getElementById('install-now').hidden=true;};
  if(new URLSearchParams(location.search).has('install'))help();
  else setTimeout(()=>{try{if(!installed()&&!localStorage.getItem(H.key('install-guide'))&&!document.querySelector('dialog[open]'))help();}catch{}},7000);
  document.addEventListener('sdk-profile-saved',()=>setTimeout(()=>{try{if(!installed()&&!localStorage.getItem(H.key('install-guide'))&&!document.querySelector('dialog[open]'))help();}catch{}},1800));
 }
 // A single root worker replaces only legacy workers inside this app's three module paths.
 if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))window.addEventListener('load',async()=>{
  try{
   const registrations=await navigator.serviceWorker.getRegistrations();
   const oldPaths=['modules/career/','modules/japan/','modules/routine/'].map(p=>new URL(p,H.base).href);
   await Promise.all(registrations.filter(r=>oldPaths.includes(r.scope)).map(r=>r.unregister()));
   const reg=await navigator.serviceWorker.register(new URL('sw.js',H.base).href,{scope:H.base,updateViaCache:'none'});
   const showUpdate=()=>{const n=document.getElementById('notice');if(n){n.hidden=false;n.textContent='Có bản cập nhật mới. Lưu bài, đóng tất cả cửa sổ Shin du ký rồi mở lại để sử dụng.';}};
   if(reg.waiting)showUpdate();reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showUpdate();});});
  }catch(e){console.warn('Shin du ký: chưa bật được lưu ngoại tuyến',e);}
 });
})();
