const $=id=>document.getElementById(id);
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>{t=clamp(t);return t*t*(3-2*t)},range=(t,a,b)=>ease((t-a)/(b-a));
let scene=0,time=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,last=0,manual=false;
const lengths=[26000,16000];
const arrival=[['Arrive home. Take a breath.','A place for everything, right at the door.'],['Sit down. Settle in.','Take a seat and lean forward to remove your shoes.'],['Tuck your shoes away.','Slide your shoes into the cubby beneath the seat.'],['Take off your coat.','Open the wardrobe and get your coat ready to hang.'],['Hang it up. Close the door.','Your coat hangs neatly, leaving the entryway clear.'],['Closed and ready for care.','Violet light signals the simulated UV-C care cycle.']];
const departure=[['A new day. A fresh start.','With the doors closed, the violet care lights stay on.'],['Reach for your coat.','Opening the door activates the automatic interlock.'],['The door opens. UV-C stops.','The lights switch off instantly. No extra step needed.'],['Take your coat. Head out.','Retrieve your coat with the UV-C lights switched off.']];
function limb(a,b,c,color,width){return `<path d="M${a} Q${b} ${b} L${c}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`}
function interpPose(a,b,t){return a.map((p,i)=>p.map((v,j)=>mix(v,b[i][j],t)))}
// crown at -445px: a 1780mm adult beside a 1700mm cabinet.
const stand=[[0,-218],[0,-355],[0,-410],[-19,-212],[-22,-108],[-23,-10],[20,-212],[24,-105],[27,-10],[-27,-343],[-43,-272],[-37,-215],[28,-343],[45,-274],[40,-214]];
const seated=[[0,-116],[-12,-254],[-16,-309],[-16,-115],[-89,-107],[-87,-10],[17,-115],[-48,-99],[-42,-10],[-37,-242],[-73,-188],[-89,-116],[15,-242],[-20,-177],[-48,-105]];
const bent=[[0,-116],[-51,-203],[-76,-250],[-16,-115],[-89,-107],[-87,-10],[17,-115],[-48,-99],[-42,-10],[-73,-193],[-101,-111],[-91,-25],[-26,-193],[-53,-106],[-48,-24]];
function drawPerson(x,pose,jacket,shoes,walking=0){const p=pose.map(v=>[...v]);p[4][0]+=walking*8;p[5][0]+=walking*15;p[7][0]-=walking*8;p[8][0]-=walking*15;const [hip,shoulder,head,lh,lk,lf,rh,rk,rf,ls,le,lw,rs,re,rw]=p;const shirt='url(#shirt)',skin='#c6a58a';let h='';
h+=limb(rh,rk,rf,'#57594f',25)+limb(rs,re,rw,jacket>.5?'#515d50':'#c1c2b5',20);
h+=limb(lh,lk,lf,'#66675b',27);h+=`<path d="M${lf[0]-10} ${lf[1]+1}q-13 4 -13 12h40q5-7-2-13Z" fill="${shoes?'#49483f':'#bbb7a5'}"/><path d="M${rf[0]-8} ${rf[1]+1}q-10 5-10 12h38q5-7-3-13Z" fill="${shoes?'#44443c':'#c9c2b0'}"/>`;
h+=`<path d="M${shoulder[0]-27} ${shoulder[1]-6}Q${shoulder[0]} ${shoulder[1]-17} ${shoulder[0]+28} ${shoulder[1]-6}L${hip[0]+29} ${hip[1]+7}Q${hip[0]} ${hip[1]+14} ${hip[0]-28} ${hip[1]+7}Z" fill="${shirt}"/>`;
h+=`<g opacity="${jacket}"><path d="M${shoulder[0]-29} ${shoulder[1]-5}L${shoulder[0]-10} ${shoulder[1]-12}L${hip[0]} ${hip[1]+22}L${hip[0]-32} ${hip[1]+18}Z M${shoulder[0]+10} ${shoulder[1]-12}L${shoulder[0]+30} ${shoulder[1]-5}L${hip[0]+32} ${hip[1]+18}L${hip[0]+3} ${hip[1]+22}Z" fill="url(#coat)"/><path d="M${shoulder[0]-10} ${shoulder[1]-12}l-9 31 15 9M${shoulder[0]+10} ${shoulder[1]-12}l9 31 -15 9" stroke="#86907c" fill="none"/></g>`;
h+=`<path d="M${shoulder[0]-8} ${shoulder[1]-3}L${head[0]-7} ${head[1]+20}H${head[0]+8}L${shoulder[0]+9} ${shoulder[1]-3}Q${shoulder[0]} ${shoulder[1]+11} ${shoulder[0]-8} ${shoulder[1]-3}" fill="${skin}"/>`;
h+=limb(ls,le,lw,jacket>.5?'#5a6758':shirt,22);h+=`<ellipse cx="${lw[0]}" cy="${lw[1]+7}" rx="8" ry="12" fill="${skin}"/><ellipse cx="${rw[0]}" cy="${rw[1]+5}" rx="8" ry="11" fill="${skin}"/>`;
h+=`<g transform="translate(${head})"><path d="M-20 -15Q-21 -32 0 -32Q23 -32 24 -11L25 0L29 6L24 10Q25 27 12 30L-7 26L-17 10Z" fill="${skin}"/><path d="M-19 8Q-29-8-23-23Q-19-38 3-35Q24-34 25-19L21-11Q9-9-1-20L-12-16L-13 9Z" fill="#49483e"/><ellipse cx="-14" cy="6" rx="5" ry="8" fill="#bd987f"/><path d="M21 19L14 20M17-1H21" stroke="#746150" stroke-width="1.5"/><path d="M24 13Q24 29 12 30L0 26L-1 18Q12 24 24 13" fill="#655e4e" opacity=".28"/></g>`;
$('person').innerHTML=h;$('person').setAttribute('transform',`translate(${x} 555)`);$('personShadow').setAttribute('transform',`translate(${x-387} 0)`);
}
function coat(x,y,scale=1){return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-15 0L-32 8L-47 60L-30 66L-20 37L-24 144Q0 150 28 144L24 37L34 66L51 60L36 8L18 0L1 10Z" fill="url(#coat)"/><path d="M-15 0L1 24L-8 37M18 0L1 24L10 37M1 24V143" fill="none" stroke="#8d9784" stroke-width="1.5"/></g>`}
function render(){const t=time/1000;let x=395,p=stand.map(v=>[...v]),jacket=1,shoes=true,door=0,uv=false,hanging=false,coatMarkup='',step=0,walk=0;
if(scene===0){
 x=mix(365,430,range(t,0,2.5));walk=t<2.5?Math.sin(t*7):0;
 if(t>=2.5&&t<4.7){const q=range(t,2.5,4.7);x=mix(430,592,q);p=interpPose(stand,seated,q)}
 if(t>=4.7&&t<10){x=592;p=interpPose(seated,bent,range(t,5,6.7)*(1-range(t,8.5,10)));step=t<7.5?1:2;shoes=t<7.3;
 if(t>=7.3&&t<8.8){let q=range(t,7.3,8.8);coatMarkup=`<g transform="translate(${mix(505,554,q)} ${mix(540,531,q)})" fill="#49483f"><path d="M-9-11Q0-19 8-6L27 0V8H-9Z"/></g>`}}
 if(t>=10){shoes=false;const q=range(t,10,11.6);x=mix(592,489,q);p=interpPose(seated,stand,q);step=3;}
 if(t>=11.6&&t<14.4){const q=range(t,11.6,14.4);jacket=1-q;p[10]=[-65,-303];p[11]=[mix(-30,56,q),mix(-323,-250,q)];p[13]=[65,-310];p[14]=[mix(15,70,q),-270];if(q>.4)coatMarkup=coat(x+62,285,.8*range(q,.4,.7));}
 if(t>=14.4){jacket=0;door=range(t,14.4,15.5)*(1-range(t,20,21));step=4;x=mix(489,515,range(t,14.4,16));const q=range(t,15.5,17.8);p[13]=[70,-320];p[14]=[mix(75,145,q),mix(-270,-344,q)];if(t<17.8)coatMarkup=coat(mix(x+70,660,q),mix(285,207,q),mix(.8,1,q));else hanging=true;
 if(t>18.5)p=interpPose(p,stand,range(t,18.5,20));}
 if(t>=21){x=mix(515,415,range(t,21.3,24));p=stand.map(v=>[...v]);uv=t>=21.3;step=5;walk=t<24?Math.sin(t*7):0;}
}else{
 hanging=t<8.8;jacket=0;shoes=false;x=mix(410,509,range(t,1.3,4.4));walk=t>1.3&&t<4.4?Math.sin(t*7):0;
 door=range(t,5,6.2)*(1-range(t,12.8,14));uv=t<5;step=t<2.2?0:t<5?1:t<8?2:3;
 if(t>=3.4&&t<10.5){const reach=range(t,3.4,4.7);p[13]=[mix(45,78,reach),mix(-274,-288,reach)];p[14]=[mix(40,145,reach),mix(-214,-280,reach)];if(t>7){p[14][1]=mix(-280,-342,range(t,7,8.5));}}
 if(t>=8.8&&t<11.8){const q=range(t,8.8,10.5);coatMarkup=coat(mix(660,x+60,q),mix(207,276,q),mix(1,.8,q));if(t>=10.5){jacket=range(t,10.5,11.8);coatMarkup=coat(x+60,276,.8*(1-jacket));}}
 if(t>=11.8){jacket=1;x=mix(509,388,range(t,13,15.5));walk=t>13&&t<15.5?Math.sin(t*7):0;}
}
 $('scene').dataset.door=door>0?'open':'closed';$('scene').dataset.uv=uv?'on':'off';
 $('leftDoor').setAttribute('transform',`translate(${522*(1-(1-door*.83))} 0) scale(${1-door*.83} 1)`);
 $('rightDoor').setAttribute('transform',`translate(${773*(1-(1-door*.83))} 0) scale(${1-door*.83} 1)`);
 $('uvGlow').style.opacity=uv?'1':'0';$('uvBars').setAttribute('stroke',uv?'#d7b0ff':'#aaa5af');$('controlLed').setAttribute('fill',uv?'#c094fb':'#bcc7a9');$('hangingCoat').style.opacity=hanging?'1':'0';$('storedShoes').style.opacity=scene===1||t>=8.8?'1':'0';$('movingCoat').innerHTML=coatMarkup;
 drawPerson(x,p,jacket,shoes,walk);
 const labels=(scene===0?arrival:departure)[step];$('step-number').textContent=String(step+1).padStart(2,'0')+' / '+(scene===0?'06':'04');$('step-title').textContent=labels[0];$('step-desc').textContent=labels[1];
 const isCut=scene===1&&t>=5&&t<12.8;$('status').className='status'+(uv?' on':isCut?' off':'');$('status-text').textContent=uv?'UV-C care active':isCut?'Door open · UV-C off':'UV-C standby';
 $('scrub').value=time;$('elapsed').textContent='00:'+String(Math.floor(t)).padStart(2,'0');$('play').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'Pause animation':'Play animation');
 $('doorDemo').innerHTML=manual&&time>=5000?'Close door & reset <span>↗</span>':'Try the door interlock <span>↗</span>';
}
function setScene(n,play=true){cancelAnimationFrame(demoAnimation);scene=n;time=0;manual=false;playing=play;$('tab0').classList.toggle('active',n===0);$('tab1').classList.toggle('active',n===1);$('tab0').setAttribute('aria-pressed',n===0);$('tab1').setAttribute('aria-pressed',n===1);$('scrub').max=lengths[n];$('duration').textContent=n===0?'00:26':'00:16';$('scene-time').textContent=n===0?'18:30 / ARRIVING HOME':'08:30 / READY TO GO';$('scene-title').textContent=n===0?'Leave the day at the door.':'Open the door. The light stops.';render()}
$('tab0').onclick=()=>setScene(0);$('tab1').onclick=()=>setScene(1);$('play').onclick=()=>{cancelAnimationFrame(demoAnimation);manual=false;if(time>=lengths[scene])time=0;playing=!playing;render()};$('replay').onclick=()=>setScene(scene);$('scrub').oninput=e=>{cancelAnimationFrame(demoAnimation);manual=false;playing=false;time=Number(e.target.value);render()};$('dimensions').onclick=()=>{const show=$('dimensions').getAttribute('aria-pressed')!=='true';$('dimensions').setAttribute('aria-pressed',show);$('measurements').style.opacity=show?1:0;if(show){setScene(0,false);time=2300;render()}};
let demoAnimation=0;
$('doorDemo').onclick=()=>{cancelAnimationFrame(demoAnimation);const close=manual&&time>=5000;if(scene!==1)setScene(1,false);manual=true;playing=false;const from=close?6200:4999,to=close?4999:6200;time=from;render();let start;function demo(ts){start??=ts;const q=clamp((ts-start)/850);time=mix(from,to,q);render();if(q<1)demoAnimation=requestAnimationFrame(demo)}demoAnimation=requestAnimationFrame(demo)};
function tick(ts){const delta=last?Math.min(ts-last,80):0;last=ts;if(playing){time+=delta;if(time>=lengths[scene]){if(scene===0)setScene(1,true);else{time=lengths[scene];playing=false}}render()}requestAnimationFrame(tick)}
setScene(0,playing);requestAnimationFrame(tick);
