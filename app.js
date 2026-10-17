const data = [
  {year:2000,x:15,y:1.35},{year:2001,x:18,y:1.63},{year:2002,x:24,y:2.33},{year:2003,x:22,y:2.41},{year:2004,x:25,y:2.63},
  {year:2005,x:29,y:2.93},{year:2006,x:30,y:3.41},{year:2007,x:32,y:3.26},{year:2008,x:35,y:3.63},{year:2009,x:38,y:4.15}
];
const meanX=data.reduce((s,d)=>s+d.x,0)/data.length, meanY=data.reduce((s,d)=>s+d.y,0)/data.length;
const bestSlope=data.reduce((s,d)=>s+(d.x-meanX)*(d.y-meanY),0)/data.reduce((s,d)=>s+(d.x-meanX)**2,0);
const bestIntercept=meanY-bestSlope*meanX;
const minimumSse=data.reduce((s,d)=>s+(d.y-(bestIntercept+bestSlope*d.x))**2,0);
const initialSlope=0.105;
let slope=initialSlope;

const svg=document.querySelector('#chart'), NS='http://www.w3.org/2000/svg';
const W=1000,H=620,m={top:32,right:40,bottom:78,left:82}, iw=W-m.left-m.right,ih=H-m.top-m.bottom;
const domain={x0:12,x1:41,y0:0.8,y1:4.6};
const sx=x=>m.left+(x-domain.x0)/(domain.x1-domain.x0)*iw;
const sy=y=>m.top+ih-(y-domain.y0)/(domain.y1-domain.y0)*ih;
const invY=p=>domain.y0+(m.top+ih-p)/ih*(domain.y1-domain.y0);
const mk=(tag,attrs={},parent=svg)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));parent.append(e);return e};
const text=(value,attrs,parent)=>{const e=mk('text',attrs,parent);e.textContent=value;return e};
const setText=(selector,value)=>{const element=document.querySelector(selector);if(element)element.textContent=value};

function build(){
  const grid=mk('g',{class:'grid'}), axis=mk('g',{class:'axis'});
  for(let y=1;y<=4.5;y+=.5){mk('line',{x1:m.left,x2:m.left+iw,y1:sy(y),y2:sy(y)},grid);text(y.toFixed(1),{x:m.left-14,y:sy(y)+5,'text-anchor':'end'},axis)}
  for(let x=15;x<=40;x+=5){mk('line',{x1:sx(x),x2:sx(x),y1:m.top,y2:m.top+ih},grid);text(x,{x:sx(x),y:m.top+ih+28,'text-anchor':'middle'},axis)}
  mk('line',{x1:m.left,x2:m.left+iw,y1:m.top+ih,y2:m.top+ih},axis);mk('line',{x1:m.left,x2:m.left,y1:m.top,y2:m.top+ih},axis);
  text('Casino employees, x (thousands)',{x:m.left+iw/2,y:H-18,'text-anchor':'middle',class:'axis-label'});
  const yl=text('Crime rate, y (per 1,000 population)',{x:20,y:m.top+ih/2,'text-anchor':'middle',class:'axis-label'});yl.setAttribute('transform',`rotate(-90 20 ${m.top+ih/2})`);
  mk('g',{id:'residuals'});mk('line',{id:'line',class:'regression-line'});mk('circle',{cx:sx(meanX),cy:sy(meanY),r:7,class:'mean-point'});text('Mean',{x:sx(meanX)-12,y:sy(meanY)-14,'text-anchor':'end',class:'mean-label'});
  const pts=mk('g',{id:'points'});data.forEach(d=>{mk('circle',{cx:sx(d.x),cy:sy(d.y),r:7,class:'point'},pts);text(String(d.year).slice(2),{x:sx(d.x)+9,y:sy(d.y)-9,class:'year-label'},pts)});
  mk('line',{id:'handleStem',class:'handle-stem'});mk('circle',{id:'handle',class:'handle',r:13,tabindex:0,role:'slider','aria-label':'Regression line slope','aria-valuemin':'-0.05','aria-valuemax':'0.2'});text('S',{id:'handleLabel',class:'handle-label','text-anchor':'middle'});
  bind();render();
}

function render(){
  const b=meanY-slope*meanX, residualGroup=document.querySelector('#residuals');residualGroup.replaceChildren();
  let sse=0;data.forEach(d=>{const predicted=b+slope*d.x,r=d.y-predicted;sse+=r*r;mk('line',{x1:sx(d.x),x2:sx(d.x),y1:sy(d.y),y2:sy(predicted),class:'residual',stroke:r>=0?'#1f78a8':'#e36b4f'},residualGroup)});
  const line=document.querySelector('#line');line.setAttribute('x1',sx(domain.x0));line.setAttribute('y1',sy(b+slope*domain.x0));line.setAttribute('x2',sx(domain.x1));line.setAttribute('y2',sy(b+slope*domain.x1));
  const hx=37,hy=b+slope*hx,handle=document.querySelector('#handle');handle.setAttribute('cx',sx(hx));handle.setAttribute('cy',sy(hy));handle.setAttribute('aria-valuenow',slope.toFixed(3));
  const stem=document.querySelector('#handleStem');stem.setAttribute('x1',sx(meanX));stem.setAttribute('y1',sy(meanY));stem.setAttribute('x2',sx(hx));stem.setAttribute('y2',sy(hy));
  const label=document.querySelector('#handleLabel');label.setAttribute('x',sx(hx));label.setAttribute('y',sy(hy)-20);
  const atMinimum=Math.abs(slope-bestSlope)<.0005;
  setText('#sse',sse.toFixed(4));setText('#slope',slope.toFixed(4));setText('#intercept',b.toFixed(4));setText('#equation',`ŷ = ${b.toFixed(3)} + ${slope.toFixed(3)}x`);setText('#minSse',minimumSse.toFixed(4));
  setText('#fitStatus',atMinimum?'Minimum SSE — least-squares line!':'Try to make this number smaller');
  setText('#comparisonTitle',atMinimum?'You found the least-squares line.':'Can you lower the SSE?');
  setText('#comparisonText',atMinimum?`No other line through the mean has an SSE below ${minimumSse.toFixed(4)}.`:`Current SSE is ${(sse-minimumSse).toFixed(4)} above the minimum.`);
  const sseBar=document.querySelector('#sseBar');if(sseBar)sseBar.style.width=`${Math.max(4,Math.min(100,minimumSse/sse*100))}%`;
}

function setFromClientY(clientY){const p=svg.createSVGPoint();p.x=0;p.y=clientY;const local=p.matrixTransform(svg.getScreenCTM().inverse());const y=invY(local.y);slope=Math.max(-.05,Math.min(.2,(y-meanY)/(37-meanX)));render()}
function bind(){
  const handle=document.querySelector('#handle');let dragging=false;
  handle.addEventListener('pointerdown',e=>{dragging=true;handle.setPointerCapture(e.pointerId)});handle.addEventListener('pointermove',e=>{if(dragging)setFromClientY(e.clientY)});handle.addEventListener('pointerup',()=>dragging=false);
  handle.addEventListener('keydown',e=>{if(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].includes(e.key)){e.preventDefault();slope+=['ArrowUp','ArrowRight'].includes(e.key)?.002:-.002;slope=Math.max(-.05,Math.min(.2,slope));render()}});
  document.querySelector('#bestFit').addEventListener('click',()=>{slope=bestSlope;render()});document.querySelector('#reset').addEventListener('click',()=>{slope=initialSlope;render()});
  document.querySelector('#toggleTable').addEventListener('click',e=>{const t=document.querySelector('#dataTable'),show=t.hidden;t.hidden=!show;e.currentTarget.setAttribute('aria-expanded',show);e.currentTarget.textContent=show?'Hide table':'Show table'});
}
build();
