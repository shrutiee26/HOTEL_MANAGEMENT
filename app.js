const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const PRICE={Standard:4500,Deluxe:7500,Suite:14000},INR=n=>'₹'+n.toLocaleString('en-IN');
const day=o=>{const d=new Date();d.setDate(d.getDate()+o);return d.toISOString().slice(0,10)};
const KEY='harbor-court-v1';let S,view='dashboard',filter='all';

function seed(){
  const rooms=[];
  for(let f=1;f<=3;f++)for(let n=1;n<=8;n++)rooms.push({no:f*100+n,type:n<=4?'Standard':n<=7?'Deluxe':'Suite',floor:f,status:'available'});
  const b=[['Aarav Mehta','98220 11122',101,-1,3,'Checked-in'],['Priya Nair','98900 22331',203,-2,4,'Checked-in'],['Rohan Desai','99211 40012',108,0,2,'Reserved'],['Sneha Kulkarni','97650 88123',205,0,1,'Reserved'],['Imran Shaikh','98340 55672',302,1,2,'Reserved'],['Neha Joshi','98811 90021',306,-3,3,'Checked-in'],['Vikram Patil','99701 31442',104,-5,2,'Checked-out']];
  const bookings=b.map((x,i)=>({id:'B'+(1001+i),guest:x[0],phone:x[1],room:x[2],date:day(x[3]),nights:x[4],status:x[5]}));
  bookings.forEach(k=>{if(k.status=='Checked-in')rooms.find(r=>r.no==k.room).status='occupied'});
  rooms.find(r=>r.no==104).status='cleaning';rooms.find(r=>r.no==207).status='maintenance';
  return{rooms,bookings};
}
const load=()=>{try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}S=S||seed()};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const room=n=>S.rooms.find(r=>r.no==n),total=b=>PRICE[room(b.room).type]*b.nights;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t.t);t.t=setTimeout(()=>t.classList.remove('show'),2400)}
const q=()=>$('#search').value.trim().toLowerCase();

function count(el,to,fmt){const t0=performance.now();(function f(t){const p=Math.min((t-t0)/900,1),e=1-Math.pow(1-p,3);el.textContent=fmt(Math.round(to*e));if(p<1)requestAnimationFrame(f)})(t0)}

function dashboard(){
  const occ=S.rooms.filter(r=>r.status=='occupied').length,avail=S.rooms.filter(r=>r.status=='available').length;
  const pct=Math.round(occ/S.rooms.length*100),arr=S.bookings.filter(b=>b.status=='Reserved'&&b.date<=day(0));
  const rev=S.bookings.filter(b=>b.status=='Checked-in'||b.status=='Checked-out').reduce((s,b)=>s+total(b),0);
  const hist=[58,64,71,66,79,84],days=['Thu','Fri','Sat','Sun','Mon','Tue'];
  $('#dashboard').innerHTML=`<h1>Good day, front desk</h1><p class="sub">${new Date().toDateString()} · Harbor Court, Nashik</p>
  <div class="stats"><div class="stat hero"><span>Occupancy today</span><b data-n="${pct}" data-f="%">0%</b></div>
  <div class="stat"><span>Rooms available</span><b data-n="${avail}">0</b></div>
  <div class="stat"><span>Arrivals waiting</span><b data-n="${arr.length}">0</b></div>
  <div class="stat"><span>Revenue booked</span><b data-n="${rev}" data-f="₹">0</b></div></div>
  <div class="grid2"><div class="panel"><h3>Occupancy this week</h3><div class="bars">
  ${hist.map((h,i)=>`<div class="bar"><i data-h="${h}"></i>${h}%<span>${days[i]}</span></div>`).join('')}
  <div class="bar today"><i data-h="${pct}"></i>${pct}%<span>Today</span></div></div></div>
  <div class="panel"><h3>Arrivals to check in</h3>${arr.length?arr.map(b=>`<div class="li"><div><b>${b.guest}</b><small>Room ${b.room} · ${b.nights} night${b.nights>1?'s':''}</small></div><button class="btn sm" data-act="in" data-id="${b.id}">Check in</button></div>`).join(''):'<p class="empty">No arrivals waiting.</p>'}</div></div>`;
  $$('#dashboard [data-n]').forEach(e=>{const f=e.dataset.f;count(e,+e.dataset.n,v=>f=='₹'?INR(v):v+(f||''))});
  requestAnimationFrame(()=>setTimeout(()=>$$('#dashboard [data-h]').forEach(e=>e.style.height=e.dataset.h+'%'),60));
}
function rooms(){
  const st=['all','available','occupied','cleaning','maintenance'],s=q();
  const list=S.rooms.filter(r=>(filter=='all'||r.status==filter)&&(!s||String(r.no).includes(s)||r.type.toLowerCase().includes(s)));
  const btn=r=>({available:`<button class="btn sm" data-act="book" data-no="${r.no}">Book room</button>`,occupied:`<button class="btn sm" data-act="out" data-no="${r.no}">Check out</button>`,cleaning:`<button class="btn sm" data-act="ready" data-no="${r.no}">Mark ready</button>`,maintenance:`<button class="btn sm ghost" data-act="ready" data-no="${r.no}">Reopen</button>`})[r.status];
  $('#rooms').innerHTML=`<h1>Rooms</h1><p class="sub">${S.rooms.length} rooms across 3 floors</p>
  <div class="chips">${st.map(x=>`<button class="chip ${x==filter?'on':''}" data-f="${x}">${x[0].toUpperCase()+x.slice(1)}</button>`).join('')}</div>
  <div class="rooms">${list.map((r,i)=>`<div class="room s-${r.status}" style="animation-delay:${i*25}ms"><h3>${r.no}</h3><p>${r.type} · Floor ${r.floor} · ${INR(PRICE[r.type])}/night</p><span class="tag t-${r.status}">${r.status}</span><div style="height:10px"></div>${btn(r)}</div>`).join('')||'<p class="empty">No rooms match.</p>'}</div>`;
}
function bookings(){
  const s=q(),list=S.bookings.filter(b=>!s||(b.guest+b.id+b.room).toLowerCase().includes(s)).slice().reverse();
  const act=b=>b.status=='Reserved'?`<button class="btn sm" data-act="in" data-id="${b.id}">Check in</button> <button class="btn sm ghost" data-act="cancel" data-id="${b.id}">Cancel</button>`:b.status=='Checked-in'?`<button class="btn sm" data-act="out" data-no="${b.room}">Check out</button>`:'';
  $('#bookings').innerHTML=`<h1>Bookings</h1><p class="sub">${S.bookings.length} bookings</p><div class="wrap"><table class="tbl"><thead><tr><th>ID</th><th>Guest</th><th>Room</th><th>Check-in</th><th>Nights</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>
  ${list.map((b,i)=>`<tr style="animation-delay:${i*30}ms"><td>${b.id}</td><td><b>${b.guest}</b></td><td>${b.room}</td><td>${b.date}</td><td>${b.nights}</td><td>${INR(total(b))}</td><td><span class="tag t-${b.status}">${b.status}</span></td><td>${act(b)}</td></tr>`).join('')}</tbody></table></div>${list.length?'':'<p class="empty">No bookings found.</p>'}`;
}
function guests(){
  const s=q(),m={};S.bookings.forEach(b=>{(m[b.guest]=m[b.guest]||{n:b.guest,p:b.phone,stays:0,spent:0});m[b.guest].stays++;m[b.guest].spent+=total(b)});
  const list=Object.values(m).filter(g=>!s||g.n.toLowerCase().includes(s));
  $('#guests').innerHTML=`<h1>Guests</h1><p class="sub">${list.length} guests on record</p><div class="panel">${list.map(g=>`<div class="li"><div><b>${g.n}</b><small>${g.p}</small></div><div style="flex:none;text-align:right"><b>${INR(g.spent)}</b><small>${g.stays} stay${g.stays>1?'s':''}</small></div></div>`).join('')||'<p class="empty">No guests found.</p>'}</div>`;
}
const R={dashboard,rooms,bookings,guests};
function show(v){view=v;$$('.view').forEach(e=>e.classList.toggle('on',e.id==v));$$('.nav').forEach(e=>e.classList.toggle('on',e.dataset.view==v));R[v]();$('#side').classList.remove('open')}

function openModal(no){
  const free=S.rooms.filter(r=>r.status=='available');
  if(!free.length)return toast('No rooms are available right now.');
  $('#roomSel').innerHTML=free.map(r=>`<option value="${r.no}" ${r.no==no?'selected':''}>${r.no} · ${r.type} · ${INR(PRICE[r.type])}</option>`).join('');
  $('#form').date.value=day(0);$('#form').nights.value=1;calc();$('#modal').hidden=false;$('#form').guest.focus();
}
function calc(){const f=$('#form');$('#total').textContent=INR(PRICE[room(f.room.value).type]*(+f.nights.value||1))}
const closeModal=()=>{$('#modal').hidden=true;$('#form').reset()};

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act],[data-view],[data-f]');if(!t)return;
  if(t.dataset.view)return show(t.dataset.view);
  if(t.dataset.f){filter=t.dataset.f;return rooms()}
  const a=t.dataset.act,no=t.dataset.no,b=S.bookings.find(x=>x.id==t.dataset.id);
  if(a=='book')return openModal(no);
  if(a=='in'){b.status='Checked-in';room(b.room).status='occupied';toast(`${b.guest} checked in to room ${b.room}`)}
  if(a=='cancel'){b.status='Cancelled';toast('Booking cancelled')}
  if(a=='out'){const k=S.bookings.find(x=>x.room==no&&x.status=='Checked-in');if(k)k.status='Checked-out';room(no).status='cleaning';toast(`Room ${no} checked out and sent to housekeeping`)}
  if(a=='ready'){room(no).status='available';toast(`Room ${no} is ready for guests`)}
  save();R[view]();
});
$('#form').addEventListener('input',calc);
$('#form').addEventListener('submit',e=>{e.preventDefault();const f=e.target,id='B'+(1001+S.bookings.length);
  S.bookings.push({id,guest:f.guest.value.trim(),phone:f.phone.value,room:+f.room.value,date:f.date.value,nights:+f.nights.value,status:'Reserved'});
  save();closeModal();toast(`Booking ${id} confirmed`);show(view=='dashboard'?'bookings':view)});
$('#cancel').onclick=closeModal;$('#modal').onclick=e=>{if(e.target.id=='modal')closeModal()};
document.addEventListener('keydown',e=>{if(e.key=='Escape')closeModal()});
$('#newBtn').onclick=()=>openModal();$('#menu').onclick=()=>$('#side').classList.toggle('open');
$('#search').oninput=()=>{if(view=='dashboard')show('bookings');else R[view]()};
$('#theme').onclick=()=>{const d=document.documentElement,n=d.dataset.theme=='dark'?'light':'dark';d.dataset.theme=n;try{localStorage.setItem('hc-theme',n)}catch(e){}};
$('#reset').onclick=()=>{S=seed();save();show(view);toast('Demo data restored')};
try{document.documentElement.dataset.theme=localStorage.getItem('hc-theme')||'light'}catch(e){}
load();show('dashboard');
