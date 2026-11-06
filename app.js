const $=id=>document.getElementById(id);
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>{t=clamp(t);return t*t*(3-2*t)},range=(t,a,b)=>ease((t-a)/(b-a));
let scene=0,time=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,last=0,manual=false;
const lengths=[31000,16000];
function limb(a,b,c,color,width){return `<path d="M${a} Q${b} ${b} L${c}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`}
function interpPose(a,b,t){return a.map((p,i)=>p.map((v,j)=>mix(v,b[i][j],t)))}
// crown at -445px: a 1780mm adult beside a 1700mm cabinet.
const stand=[[0,-218],[0,-355],[0,-410],[-19,-212],[-22,-108],[-23,-10],[20,-212],[24,-105],[27,-10],[-27,-343],[-43,-272],[-37,-215],[28,-343],[45,-274],[40,-214]];
const seated=[[0,-116],[-12,-254],[-16,-309],[-16,-115],[-89,-107],[-87,-10],[17,-115],[-48,-99],[-42,-10],[-37,-242],[-73,-188],[-89,-116],[15,-242],[-20,-177],[-48,-105]];
const bent=[[0,-116],[-51,-203],[-76,-250],[-16,-115],[-89,-107],[-87,-10],[17,-115],[-48,-99],[-42,-10],[-73,-193],[-101,-111],[-91,-25],[-26,-193],[-53,-106],[-48,-24]];
function drawPerson(x,pose,jacket,shoes,walking=0,facing=1){const p=pose.map(v=>[...v]);p[4][0]+=walking*8;p[5][0]+=walking*15;p[7][0]-=walking*8;p[8][0]-=walking*15;const [hip,shoulder,head,lh,lk,lf,rh,rk,rf,ls,le,lw,rs,re,rw]=p;const shirt='url(#shirt)',skin='#c6a58a';let h='';
h+=limb(rh,rk,rf,'#57594f',25)+limb(rs,re,rw,jacket>.5?'#515d50':'#c1c2b5',20);
h+=limb(lh,lk,lf,'#66675b',27);h+=`<path d="M${lf[0]-10} ${lf[1]+1}q-13 4 -13 12h40q5-7-2-13Z" fill="${shoes?'#49483f':'#bbb7a5'}"/><path d="M${rf[0]-8} ${rf[1]+1}q-10 5-10 12h38q5-7-3-13Z" fill="${shoes?'#44443c':'#c9c2b0'}"/>`;
h+=`<path d="M${shoulder[0]-27} ${shoulder[1]-6}Q${shoulder[0]} ${shoulder[1]-17} ${shoulder[0]+28} ${shoulder[1]-6}L${hip[0]+29} ${hip[1]+7}Q${hip[0]} ${hip[1]+14} ${hip[0]-28} ${hip[1]+7}Z" fill="${shirt}"/>`;
h+=`<g opacity="${jacket}"><path d="M${shoulder[0]-29} ${shoulder[1]-5}L${shoulder[0]-10} ${shoulder[1]-12}L${hip[0]} ${hip[1]+22}L${hip[0]-32} ${hip[1]+18}Z M${shoulder[0]+10} ${shoulder[1]-12}L${shoulder[0]+30} ${shoulder[1]-5}L${hip[0]+32} ${hip[1]+18}L${hip[0]+3} ${hip[1]+22}Z" fill="url(#coat)"/><path d="M${shoulder[0]-10} ${shoulder[1]-12}l-9 31 15 9M${shoulder[0]+10} ${shoulder[1]-12}l9 31 -15 9" stroke="#86907c" fill="none"/></g>`;
h+=`<path d="M${shoulder[0]-8} ${shoulder[1]-3}L${head[0]-7} ${head[1]+20}H${head[0]+8}L${shoulder[0]+9} ${shoulder[1]-3}Q${shoulder[0]} ${shoulder[1]+11} ${shoulder[0]-8} ${shoulder[1]-3}" fill="${skin}"/>`;
h+=limb(ls,le,lw,jacket>.5?'#5a6758':shirt,22);h+=`<ellipse cx="${lw[0]}" cy="${lw[1]+7}" rx="8" ry="12" fill="${skin}"/><ellipse cx="${rw[0]}" cy="${rw[1]+5}" rx="8" ry="11" fill="${skin}"/>`;
h+=`<g transform="translate(${head}) scale(${facing} 1)"><path d="M-20 -15Q-21 -32 0 -32Q23 -32 24 -11L25 0L29 6L24 10Q25 27 12 30L-7 26L-17 10Z" fill="${skin}"/><path d="M-19 8Q-29-8-23-23Q-19-38 3-35Q24-34 25-19L21-11Q9-9-1-20L-12-16L-13 9Z" fill="#49483e"/><ellipse cx="-14" cy="6" rx="5" ry="8" fill="#bd987f"/><path d="M21 19L14 20M17-1H21" stroke="#746150" stroke-width="1.5"/><path d="M24 13Q24 29 12 30L0 26L-1 18Q12 24 24 13" fill="#655e4e" opacity=".28"/></g>`;
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
 if(t>=21){
 x=mix(515,866,range(t,21.3,24));p=stand.map(v=>[...v]);uv=t>=25.5;step=5;walk=t>21.3&&t<24?Math.sin(t*7):0;
 if(t>=24&&t<27.2){const press=stand.map(v=>[...v]);press[1]=[-25,-290];press[2]=[-35,-345];press[9]=[-50,-278];press[10]=[-68,-212];press[11]=[-61,-147];press[12]=[2,-278];press[13]=[15,-244];press[14]=[6,-212];p=interpPose(stand,press,range(t,24,25.5)*(1-range(t,26.4,27.2)));}
 if(t>=27.2){x=mix(866,415,range(t,27.2,30));walk=t<30?Math.sin(t*7):0;}
 }
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
 drawPerson(x,p,jacket,shoes,walk,x>800?-1:1);
 $("rocker").setAttribute("y",uv?19:23);$("switchHalo").setAttribute("opacity",scene===0&&t>=24&&t<26.8?1:0);$("scene").dataset.switchPressed=scene===0&&t>=25.5||scene===1?"true":"false";
 $('scrub').value=time;$('play').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'Pause animation':'Play animation');
}
function setScene(n,play=true){scene=n;time=0;playing=play;$('scrub').max=lengths[n];render()}
$('play').onclick=()=>{if(time>=lengths[scene])time=0;playing=!playing;render()};
$('replay').onclick=()=>setScene(0);
$('next').onclick=()=>setScene(1);
$('scrub').oninput=e=>{playing=false;time=Number(e.target.value);render()};
function pressSwitch(){setScene(0,true);time=24000;render()}
$('powerSwitch').onclick=pressSwitch;
$('powerSwitch').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pressSwitch()}};
$('switchDemo').onclick=pressSwitch;
function tick(ts){const delta=last?Math.min(ts-last,80):0;last=ts;if(playing){time+=delta;if(time>=lengths[scene]){if(scene===0)setScene(1,true);else{time=lengths[scene];playing=false}}render()}requestAnimationFrame(tick)}
setScene(0,playing);requestAnimationFrame(tick);
