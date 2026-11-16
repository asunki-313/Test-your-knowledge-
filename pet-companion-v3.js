/* IQ Pet prototype: optional local cosmetics, no coins/XP/Firebase writes. */
(()=>{'use strict';
if(window.__iqPetLoaded)return;window.__iqPetLoaded=true;
const STORAGE='iq_pet_companion_v3';
const COLORS=[['أحمر','#ee665b','#ffbe91'],['أزرق','#4c97ee','#bde8ff'],['أخضر','#51b88a','#bbefaa'],['بنفسجي','#a879ed','#efd1ff'],['ذهبي','#eab44f','#ffe5a0']];
const EGGS=[['ناري','🔥'],['مائي','💧'],['طبيعي','🌿'],['نجمي','⭐'],['ذهبي','✨'],['زهري','🌸'],['جليدي','❄️']];
const SPECIES=[['dragon','🐉','تنين'],['phoenix','🐦','طائر أسطوري'],['dino','🦕','ديناصور']];
const ACCESS=[['none','بدون'],['scarf','🧣 وشاح'],['crown','👑 تاج'],['armor','🛡️ درع']];
const START={active:false,egg:0,species:'dragon',color:0,accessory:'none',stage:0,care:75,silent:false};
let state={...START},view='home',lastFocus=null;
try{const parsed=JSON.parse(localStorage.getItem(STORAGE)||'null');if(parsed&&typeof parsed==='object'){state={...START,...parsed};state.egg=Math.max(0,Math.min(EGGS.length-1,Number(state.egg)||0));state.color=Math.max(0,Math.min(COLORS.length-1,Number(state.color)||0));state.stage=Math.max(0,Math.min(3,Number(state.stage)||0));state.care=Math.max(0,Math.min(100,Number(state.care)||75));if(!SPECIES.some(s=>s[0]===state.species))state.species='dragon';if(!ACCESS.some(s=>s[0]===state.accessory))state.accessory='none';state.active=state.active===true;state.silent=false;}}
catch(_){state={...START};}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch(_){}}
const root=document.createElement('div');root.id='iqPetRoot';root.innerHTML='<button type="button" class="iq-pet-chip" aria-label="افتح رفيقي الافتراضي" title="رفيقي الافتراضي"><span class="iq-pet-mini"></span></button><div class="iq-pet-dialog" hidden><section class="iq-pet-box" role="dialog" aria-modal="true" aria-labelledby="iqPetTitle"><header class="iq-pet-top"><strong id="iqPetTitle">🐾 رفيقي الافتراضي</strong><button type="button" class="iq-pet-x" aria-label="إغلاق">✕</button></header><div id="iqPetContent"></div></section></div>';
document.body.appendChild(root);
const chip=root.querySelector('.iq-pet-chip'),mini=root.querySelector('.iq-pet-mini'),overlay=root.querySelector('.iq-pet-dialog'),content=root.querySelector('#iqPetContent');
function colorVars(){const c=COLORS[state.color];root.style.setProperty('--pet-main',c[1]);root.style.setProperty('--pet-light',c[2]);}
function artwork(){
 const type=SPECIES.find(x=>x[0]===state.species)||SPECIES[0];
 const hue=state.color===0?0:[0,155,95,260,35][state.color];
 const parts={scarf:'🧣',crown:'👑',armor:'🛡️'};
 return `<span class="iq-pet-body iq-pet-visual" role="img" aria-label="${type[2]}، مرحلة ${state.stage+1}"><img draggable="false" class="iq-pet-sprite" src="./pet-assets/${type[0]}-${state.stage}.png" alt="" style="--pet-hue:${hue}deg" />${state.accessory!=='none'?`<span class="iq-pet-item" aria-hidden="true">${parts[state.accessory]||''}</span>`:''}</span>`;
}
function btn(label,action,pressed,extra=''){return `<button type="button" data-iq-action="${action}" ${pressed===undefined?'':`aria-pressed="${pressed}"`} ${extra}>${label}</button>`;}
function choices(items,selected,action){return `<div class="iq-pet-choice">${items.map((x,i)=>btn(x[1],action+':'+i,selected===i)).join('')}</div>`;}
function stage(){return `<div class="iq-pet-stage">${artwork()}</div>`;}
function render(){colorVars();chip.hidden=state.silent;mini.innerHTML=state.active?artwork():'<span class="iq-pet-bubble-egg">🥚</span>';
let html='';
if(view==='home'&&!state.active){html='<p class="iq-pet-copy">صاحبك الافتراضي اختياري تمامًا. اختر بيضتك وابدأ رحلة التخصيص، ولا يتدخل في النقاط أو الأسئلة.</p>'+`<div class="iq-pet-stage"><span class="iq-pet-egg">${EGGS[state.egg][1]}🥚</span></div>`+choices(EGGS.map(x=>[x[0],x[1]+' '+x[0]]),state.egg,'egg')+btn('فقّس البيضة واختر المخلوق','hatch',undefined,'class="iq-pet-primary"');}
else if(view==='choose'){html='<p class="iq-pet-copy">فقست البيضة! اختر نوع رفيقك. تقدر تغير ألوانه وإكسسواراته لاحقًا. كل فصيلة لها أربعة أشكال من دليل المخلوقات.</p>'+stage()+choices(SPECIES.map(x=>[x[0],x[1]+' '+x[2]]),SPECIES.findIndex(x=>x[0]===state.species),'species')+btn('اعتماد رفيقي','adopt',undefined,'class="iq-pet-primary"');}
else if(view==='evolve'){html='<p class="iq-pet-copy">معاينة مراحل النمو. اختر الشكل الذي تحبه من مراحل النمو الأربع. المعاينة اختيارية وتجريبية؛ ربط النمو بمستوى اللاعب قيد التطوير.</p>'+stage()+`<p>المرحلة المختارة: ${['صغير','ناشئ','متطور','أسطوري'][state.stage]}</p>`+`<div class="iq-pet-evolution-grid">${['صغير','ناشئ','متطور','أسطوري'].map((x,i)=>`<button type="button" data-iq-action="stage:${i}" aria-pressed="${state.stage===i}"><img src="./pet-assets/${state.species}-${i}.png" alt=""><span>${x}</span></button>`).join('')}</div>`+btn('العودة إلى رفيقي','back',undefined,'class="iq-pet-primary"');}
else{html=stage()+`<div class="iq-pet-row"><strong>${SPECIES.find(x=>x[0]===state.species)[2]} · ${['صغير','ناشئ','متطور','أسطوري'][state.stage]}</strong><span>💛 سعادة ${state.care}/100</span></div><div class="iq-pet-prog"><i style="width:${state.care}%"></i></div>`+`<p class="iq-pet-copy">رفيقك يتحرك بهدوء أثناء اللعب، ويمكن إيقاف ظهوره في أي وقت.</p><strong>الألوان</strong><div class="iq-pet-swatches">${COLORS.map((x,i)=>`<button type="button" class="iq-pet-swatch" data-iq-action="color:${i}" style="--swatch:${x[1]}" aria-label="لون ${x[0]}" aria-pressed="${state.color===i}">${state.color===i?'✓':''}</button>`).join('')}</div><strong>الإكسسوارات</strong>`+choices(ACCESS.map(x=>x),ACCESS.findIndex(x=>x[0]===state.accessory),'accessory')+`<div class="iq-pet-choice">${btn('💗 تفاعل','happy')}${btn('✨ مراحل التطور','evolution')}</div>`+`<p class="iq-pet-status" aria-live="polite" id="iqPetStatus">يُحفظ اختيارك على هذا الجهاز فقط.</p>`;}
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
case 'hide':close();return;default:return;}
save();render();if(action==='happy'){const pet=content.querySelector('.iq-pet-body');if(pet){pet.classList.remove('iq-pet-happy');void pet.getBoundingClientRect();pet.classList.add('iq-pet-happy');}}});
render();
})();
