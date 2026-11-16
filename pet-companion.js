/* IQ Pet prototype: optional local cosmetics, no coins/XP/Firebase writes. */
(()=>{'use strict';
if(window.__iqPetLoaded)return;window.__iqPetLoaded=true;
const STORAGE='iq_pet_companion_v1';
const COLORS=[['أحمر','#ee665b','#ffbe91'],['أزرق','#4c97ee','#bde8ff'],['أخضر','#51b88a','#bbefaa'],['بنفسجي','#a879ed','#efd1ff'],['ذهبي','#eab44f','#ffe5a0']];
const EGGS=[['ناري','🔥'],['مائي','💧'],['طبيعي','🌿'],['نجمي','⭐'],['ذهبي','✨'],['زهري','🌸']];
const SPECIES=[['dragon','🐉','تنين'],['phoenix','🐦','طائر أسطوري'],['dino','🦕','ديناصور']];
const ACCESS=[['none','بدون'],['scarf','وشاح'],['crown','تاج'],['armor','درع']];
const START={active:false,egg:0,species:'dragon',color:0,accessory:'none',stage:0,care:75,silent:false};
let state={...START},view='home',lastFocus=null;
try{const parsed=JSON.parse(localStorage.getItem(STORAGE)||'null');if(parsed&&typeof parsed==='object'){state={...START,...parsed};state.egg=Math.max(0,Math.min(EGGS.length-1,Number(state.egg)||0));state.color=Math.max(0,Math.min(COLORS.length-1,Number(state.color)||0));state.stage=Math.max(0,Math.min(3,Number(state.stage)||0));state.care=Math.max(0,Math.min(100,Number(state.care)||75));if(!SPECIES.some(s=>s[0]===state.species))state.species='dragon';if(!ACCESS.some(s=>s[0]===state.accessory))state.accessory='none';state.active=state.active===true;}}
catch(_){state={...START};}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch(_){}}
const root=document.createElement('div');root.id='iqPetRoot';root.innerHTML='<button type="button" class="iq-pet-chip" aria-label="افتح رفيقي الافتراضي"><span class="iq-pet-mini"></span><small>رفيقي</small></button><div class="iq-pet-dialog" hidden><section class="iq-pet-box" role="dialog" aria-modal="true" aria-labelledby="iqPetTitle"><header class="iq-pet-top"><strong id="iqPetTitle">🐾 رفيقي الافتراضي</strong><button type="button" class="iq-pet-x" aria-label="إغلاق">✕</button></header><div id="iqPetContent"></div></section></div>';
document.body.appendChild(root);
const chip=root.querySelector('.iq-pet-chip'),mini=root.querySelector('.iq-pet-mini'),overlay=root.querySelector('.iq-pet-dialog'),content=root.querySelector('#iqPetContent');
function colorVars(){const c=COLORS[state.color];root.style.setProperty('--pet-main',c[1]);root.style.setProperty('--pet-light',c[2]);}
function artwork(){const animal=state.species;const head=animal==='dino'?'M42 57 Q40 31 70 26 Q100 22 107 51 Q123 49 126 65 Q125 81 108 85 L71 83 Q43 83 42 57Z':'M44 51 Q46 25 75 23 Q107 21 113 53 Q117 78 88 84 L66 84 Q43 77 44 51Z';
 const ear=animal==='dragon'?'<path d="M54 33L46 12 67 28M91 29L105 10 102 41" fill="var(--pet-accent)" stroke="#64324a" stroke-width="3"/>':animal==='phoenix'?'<path d="M58 30Q55 4 74 15Q80 -1 91 10L92 29" fill="var(--pet-accent)" stroke="#a75437" stroke-width="3"/>':'<path d="M60 31L60 10 76 27 85 8 96 31" fill="var(--pet-light)" stroke="#47755f" stroke-width="3"/>';
 const wing=animal==='dino'?'<path d="M55 93L40 60 31 72 27 57 17 73 34 116" fill="var(--pet-accent)" stroke="#74556a" stroke-width="3"/>':'<g class="iq-pet-wing"><path d="M104 92Q145 34 149 86L142 82 137 104 124 98 115 117Z" fill="var(--pet-light)" stroke="#69375c" stroke-width="3"/></g>';
 const tail='<g class="iq-pet-tail"><path d="M102 110Q146 110 149 127Q135 128 131 137Q127 126 109 130Z" fill="var(--pet-main)" stroke="#69375c" stroke-width="3"/></g>';
 const bill=animal==='phoenix'?'<path d="M98 60L121 64 101 74Z" fill="#f8b84b" stroke="#b8783d" stroke-width="2"/>':'';
 const accessory=state.accessory==='scarf'?'<path d="M55 81Q77 95 105 81L100 94Q78 102 59 94Z" fill="#dd396d" stroke="#fff2" stroke-width="2"/>':state.accessory==='crown'?'<path d="M59 28L56 9 70 17 78 3 90 18 101 10 99 29Z" fill="#f3c95d" stroke="#965d24" stroke-width="3"/>':state.accessory==='armor'?'<path d="M61 105Q82 93 104 105L98 126 80 134 65 125Z" fill="#eac56b" stroke="#a07342" stroke-width="3"/>':'';
 return `<svg viewBox="0 0 170 160" role="img" aria-label="${SPECIES.find(x=>x[0]===animal)[2]} متحرك"><g class="iq-pet-body">${tail}${wing}<ellipse cx="83" cy="111" rx="47" ry="42" fill="var(--pet-main)" stroke="#69375c" stroke-width="3"/><ellipse cx="81" cy="122" rx="26" ry="27" fill="var(--pet-light)"/>${ear}<path d="${head}" fill="var(--pet-main)" stroke="#69375c" stroke-width="3"/>${bill}<g class="iq-pet-eyes"><ellipse cx="70" cy="55" rx="8" ry="12" fill="#171331"/><ellipse cx="97" cy="56" rx="8" ry="12" fill="#171331"/><circle cx="73" cy="51" r="3" fill="white"/><circle cx="100" cy="52" r="3" fill="white"/></g><path d="M78 74Q87 81 94 73" stroke="#633451" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="53" cy="67" r="6" fill="var(--pet-light)" opacity=".6"/><circle cx="110" cy="71" r="5" fill="var(--pet-light)" opacity=".6"/>${accessory}<ellipse cx="54" cy="145" rx="16" ry="7" fill="var(--pet-main)"/><ellipse cx="108" cy="145" rx="16" ry="7" fill="var(--pet-main)"/></g></svg>`;}
function btn(label,action,pressed,extra=''){return `<button type="button" data-iq-action="${action}" ${pressed===undefined?'':`aria-pressed="${pressed}"`} ${extra}>${label}</button>`;}
function choices(items,selected,action){return `<div class="iq-pet-choice">${items.map((x,i)=>btn(x[1],action+':'+i,selected===i)).join('')}</div>`;}
function stage(){return `<div class="iq-pet-stage">${artwork()}</div>`;}
function render(){colorVars();chip.hidden=state.silent;mini.innerHTML=state.active?artwork():'<span style="font-size:32px">🥚</span>';
let html='';
if(view==='home'&&!state.active){html='<p class="iq-pet-copy">صاحبك الافتراضي اختياري تمامًا. اختر بيضتك وابدأ رحلة التخصيص، ولا يتدخل في النقاط أو الأسئلة.</p>'+`<div class="iq-pet-stage"><span class="iq-pet-egg">${EGGS[state.egg][1]}🥚</span></div>`+choices(EGGS.map(x=>[x[0],x[1]+' '+x[0]]),state.egg,'egg')+btn('فقّس البيضة واختر المخلوق','hatch',undefined,'class="iq-pet-primary"')+btn('إخفاء الأيقونة','hide',undefined,'class="iq-pet-muted"');}
else if(view==='choose'){html='<p class="iq-pet-copy">فقست البيضة! اختر نوع رفيقك. تقدر تغير ألوانه وإكسسواراته لاحقًا.</p>'+stage()+choices(SPECIES.map(x=>[x[0],x[1]+' '+x[2]]),SPECIES.findIndex(x=>x[0]===state.species),'species')+btn('اعتماد رفيقي','adopt',undefined,'class="iq-pet-primary"');}
else if(view==='evolve'){html='<p class="iq-pet-copy">معاينة مراحل النمو. في هذه النسخة التجريبية التطور تجميلي واختياري ولا يعتمد على نقاط أو عملات.</p>'+stage()+`<p>المرحلة المختارة: ${['صغير','ناشئ','متطور','أسطوري'][state.stage]}</p>`+choices(['صغير','ناشئ','متطور','أسطوري'].map((x,i)=>[String(i),x]),state.stage,'stage')+btn('العودة إلى رفيقي','back',undefined,'class="iq-pet-primary"');}
else{html=stage()+`<div class="iq-pet-row"><strong>${SPECIES.find(x=>x[0]===state.species)[2]} · ${['صغير','ناشئ','متطور','أسطوري'][state.stage]}</strong><span>💛 سعادة ${state.care}/100</span></div><div class="iq-pet-prog"><i style="width:${state.care}%"></i></div>`+`<p class="iq-pet-copy">رفيقك يتحرك بهدوء أثناء اللعب، ويمكن إيقاف ظهوره في أي وقت.</p><strong>الألوان</strong><div class="iq-pet-swatches">${COLORS.map((x,i)=>`<button type="button" class="iq-pet-swatch" data-iq-action="color:${i}" style="--swatch:${x[1]}" aria-label="لون ${x[0]}" aria-pressed="${state.color===i}">${state.color===i?'✓':''}</button>`).join('')}</div><strong>الإكسسوارات</strong>`+choices(ACCESS.map(x=>x),ACCESS.findIndex(x=>x[0]===state.accessory),'accessory')+`<div class="iq-pet-choice">${btn('💗 تفاعل','happy')}${btn('✨ مراحل التطور','evolution')}</div>`+btn('إخفاء الأيقونة من الشاشة','hide',undefined,'class="iq-pet-muted"')+`<p class="iq-pet-status" aria-live="polite" id="iqPetStatus">يُحفظ اختيارك على هذا الجهاز فقط.</p>`;}
content.innerHTML=html;}
function open(){lastFocus=document.activeElement;view=state.active?'pet':'home';render();overlay.hidden=false;root.querySelector('.iq-pet-x').focus();}
function close(){overlay.hidden=true;chip.focus();}
chip.addEventListener('click',open);root.querySelector('.iq-pet-x').addEventListener('click',close);
overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden){close();return;}if(e.key==='Tab'&&!overlay.hidden){const f=[...overlay.querySelectorAll('button:not([disabled])')];if(!f.length)return;let first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}}});
content.addEventListener('click',e=>{const b=e.target.closest('[data-iq-action]');if(!b)return;const [action,arg]=b.dataset.iqAction.split(':');const idx=Number(arg);
switch(action){case 'egg':if(idx>=0&&idx<EGGS.length)state.egg=idx;break;
case 'hatch':view='choose';break;
case 'species':if(idx>=0&&idx<SPECIES.length)state.species=SPECIES[idx][0];break;
case 'adopt':state.active=true;view='pet';break;
case 'color':if(idx>=0&&idx<COLORS.length)state.color=idx;break;
case 'accessory':if(idx>=0&&idx<ACCESS.length)state.accessory=ACCESS[idx][0];break;
case 'evolution':view='evolve';break;
case 'stage':if(idx>=0&&idx<=3)state.stage=idx;break;
case 'back':view='pet';break;
case 'happy':state.care=Math.min(100,state.care+5);break;
case 'hide':state.silent=true;save();close();render();return;default:return;}
save();render();if(action==='happy'){const pet=content.querySelector('.iq-pet-body');if(pet){pet.classList.remove('iq-pet-happy');void pet.getBoundingClientRect();pet.classList.add('iq-pet-happy');}}});
// When hidden, users can reopen through a small control under the home screen.
const toggle=document.createElement('button');toggle.type='button';toggle.textContent='🐾 '+(state.silent?'إظهار رفيقي':'رفيقي الافتراضي');toggle.className='iq-pet-muted';toggle.style.cssText='display:block;margin:10px auto;min-height:42px;border:1px solid #b9a2d8;border-radius:12px;padding:8px 14px;background:#36285b;color:white;font:inherit;cursor:pointer';toggle.addEventListener('click',()=>{state.silent=false;save();render();toggle.textContent='🐾 رفيقي الافتراضي';open();});
const home=document.getElementById('home');if(home)home.appendChild(toggle);else document.body.appendChild(toggle);
render();
})();
