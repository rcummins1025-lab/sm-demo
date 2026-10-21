/* Service Momentum demo: client-side personalization from URL params.
   ?biz=&owner=&town=&state=&trade=  — all text is inserted with textContent (never innerHTML).
   Optional: &services=A,B,C (max 4, 40 chars each) &towns=X,Y,Z (max 6, 32 chars each) &color=1a73e8 (hex, no #). */
(function(){
  var KEY='smPreview',root=document.documentElement;
  function done(){root.classList.remove('sm-pending');}
  try{
  function clean(v,max){if(v==null)return'';v=String(v).replace(/[\u0000-\u001f\u007f<>{}\[\]\\`]/g,'').replace(/\s+/g,' ').trim();return v.length>max?v.slice(0,max).trim():v;}
  function list(v,max,n){var out=[],seen={};String(v==null?'':v).split(',').forEach(function(x){x=clean(x,max);var k=x.toLowerCase();if(x&&!seen[k]&&out.length<n){seen[k]=1;out.push(x);}});return out;}
  function hex(v){v=String(v==null?'':v).trim().replace(/^#/,'');if(/^[0-9a-f]{3}$/i.test(v))v=v.replace(/./g,'$&$&');return /^[0-9a-f]{6}$/i.test(v)?v.toLowerCase():'';}
  function extra(o,src){o.services=list(src.services,40,4);o.towns=list(src.towns,32,6);o.color=hex(src.color);return o;}
  var q=new URLSearchParams(location.search),p=null;
  if(q.has('biz')||q.has('owner')||q.has('town')){
    p={biz:clean(q.get('biz'),48),owner:clean(q.get('owner'),24),town:clean(q.get('town'),32),
       state:(clean(q.get('state'),2).match(/^[A-Za-z]{2}$/)||[''])[0].toUpperCase(),
       trade:({'mini-split':'mini-split','minisplit':'mini-split','hvac':'hvac','plumbing':'plumbing'})[clean(q.get('trade'),16).toLowerCase()]||''};
    p.owner=p.owner.split(' ')[0];
    extra(p,{services:q.get('services'),towns:q.get('towns'),color:q.get('color')});
    if(!p.biz&&!p.owner&&!p.town)p=null;
    try{if(p)sessionStorage.setItem(KEY,JSON.stringify(p));}catch(e){}
  }else{try{var s=JSON.parse(sessionStorage.getItem(KEY)||'null');if(s&&typeof s==='object')p={biz:clean(s.biz,48),owner:clean(s.owner,24),town:clean(s.town,32),state:/^[A-Z]{2}$/.test(s.state||'')?s.state:'',trade:/^(mini-split|hvac|plumbing)$/.test(s.trade||'')?s.trade:''};if(p)extra(p,{services:Array.isArray(s.services)?s.services.join(','):'',towns:Array.isArray(s.towns)?s.towns.join(','):'',color:s.color});}catch(e){}}
  if(!p){done();return;}
  window.SM_PREVIEW=p;
  var biz=p.biz||'Your Company',owner=p.owner,town=p.town;
  root.classList.add('sm-personal');

  // ---- link carry-over ----
  var carry=new URLSearchParams();['biz','owner','town','state','trade'].forEach(function(k){if(p[k])carry.set(k,p[k]);});
  if(p.services.length)carry.set('services',p.services.join(','));if(p.towns.length)carry.set('towns',p.towns.join(','));if(p.color)carry.set('color',p.color);
  document.querySelectorAll('a[href]').forEach(function(a){
    var h=a.getAttribute('href');if(!h||/^(#|[a-z]+:|\/\/)/i.test(h)||!/\.html(\?|#|$)/.test(h))return;
    var hash='',i=h.indexOf('#');if(i>=0){hash=h.slice(i);h=h.slice(0,i);}
    var base=h,qs='';i=h.indexOf('?');if(i>=0){base=h.slice(0,i);qs=h.slice(i+1);}
    var u=new URLSearchParams(qs);carry.forEach(function(v,k){u.set(k,v);});
    a.setAttribute('href',base+'?'+u.toString()+hash);
  });

  // ---- identity ----
  var slug=(biz.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'')||'yourcompany').slice(0,32);
  var email=(owner?owner.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,''):'')||'owner';
  email=email.slice(0,16)+'@'+slug+'.com';
  var STOP=/^(llc|l\.l\.c\.|inc\.?|co\.?|corp\.?|company|the|and|&|of|services?)$/i;
  var words=biz.replace(/[^\p{L}\p{N}&\s'-]/gu,' ').split(/\s+/).filter(function(w){return w&&!STOP.test(w);});
  if(words.length<2){var all=biz.replace(/[^\p{L}\p{N}&\s'-]/gu,' ').split(/\s+/).filter(Boolean);if(all.length>1)words=all.filter(function(w){return !/^(llc|inc\.?|the|and|&|of)$/i.test(w);});if(!words.length)words=all;}
  var initials=(words.length>1?words[0][0]+words[1][0]:(words[0]||'S')[0]).toUpperCase();
  var hsh=0;for(var k=0;k<biz.length;k++)hsh=(hsh*31+biz.charCodeAt(k))>>>0;
  var hue=[198,212,168,226,186,250,152,204][hsh%8];
  root.style.setProperty('--sm-h',hue);
  // ---- brand color (optional): darkened until white text on it passes WCAG AA (4.5:1) ----
  if(p.color){
    var rgb=[0,2,4].map(function(i){return parseInt(p.color.substr(i,2),16);});
    var lum=function(c){var a=c.map(function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];};
    for(var g=0;g<40&&(1.05/(lum(rgb)+0.05))<4.5;g++)rgb=rgb.map(function(v){return Math.floor(v*0.92);});
    root.style.setProperty('--sm-accent','rgb('+rgb.join(',')+')');
    root.classList.add('sm-brand');
  }
  function mono(cls){var m=document.createElement('span');m.className='sm-mono '+(cls||'');m.setAttribute('aria-hidden','true');m.textContent=initials;return m;}
  document.querySelectorAll('.workspace-name,.workspace-topline strong').forEach(function(el){el.textContent=biz;el.title=biz;});
  var top=document.querySelector('.workspace-topline>div:first-child');
  if(top){top.classList.add('sm-id');var wrap=document.createElement('div');wrap.className='sm-id__text';while(top.firstChild)wrap.appendChild(top.firstChild);top.appendChild(mono());top.appendChild(wrap);}
  var card=document.querySelector('.workspace-card');if(card){card.classList.add('sm-card');card.insertBefore(mono('sm-mono--lg'),card.firstChild);}
  document.querySelectorAll('.mobile-signed-in').forEach(function(el){el.textContent=email;});
  document.querySelectorAll('.identity-label').forEach(function(el){if(el.firstChild&&el.firstChild.nodeType===3)el.firstChild.nodeValue=email;});
  document.querySelectorAll('.profile-avatar').forEach(function(el){el.textContent=(owner||biz)[0].toUpperCase();});
  document.title=document.title.replace(/\s+—\s+Service Momentum Command Center$/,'')+' — '+biz+' · Command Center';
  var badge=document.querySelector('.demo-badge');if(badge){badge.textContent='Demo preview for '+biz;badge.setAttribute('aria-label','Demo preview for '+biz);}

  // ---- greeting (home) ----
  var dateH=document.querySelector('.today-date');
  if(dateH&&owner){var hr=new Date().getHours(),g=document.createElement('p');g.className='sm-greet';g.textContent=(hr<12?'Good morning, ':hr<17?'Good afternoon, ':'Good evening, ')+owner;dateH.parentNode.insertBefore(g,dateH);}

  // ---- towns: ~40% of the fake book (Portsmouth 14 + Exeter 10 + Stratham 7 + Rye 7 = 38 of 100 town weight) go to the
  //      prospect's town; with &towns= the other 8 sample towns rotate through the given nearby towns ----
  var MAIN=['Portsmouth','Exeter','Stratham','Rye'],REST=['Amesbury','Newburyport','Salisbury','North Hampton','Hampton','Newbury','Dover','Ipswich'];
  var near=p.towns.filter(function(t){return !town||t.toLowerCase()!==town.toLowerCase();});
  var tmap={};
  if(town)MAIN.forEach(function(t){tmap[t]=town;});
  if(near.length){REST.forEach(function(t,i){tmap[t]=near[i%near.length];});if(!town)MAIN.forEach(function(t,i){tmap[t]=near[(i+REST.length)%near.length];});}
  var keys=Object.keys(tmap).sort(function(a,b){return b.length-a.length;});
  if(keys.length){
    var st=p.state;
    var re=new RegExp('\\b('+keys.map(function(k){return k==='Portsmouth'?'Portsmouth(?! Ave)':k;}).join('|')+')(, (?:NH|MA)(?: \\d{5})?)?\\b','g');
    var rep=function(m,t,tail){return tmap[t]+(tail?(st?', '+st:''):'');};
    var tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return n.parentNode.closest('script,style,.sm-banner')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}}),n,list2=[];
    while((n=tw.nextNode()))list2.push(n);
    list2.forEach(function(n){var v=n.nodeValue;re.lastIndex=0;if(re.test(v)){re.lastIndex=0;n.nodeValue=v.replace(re,rep);}});
    document.querySelectorAll('[data-town]').forEach(function(el){if(Object.prototype.hasOwnProperty.call(tmap,el.dataset.town))el.dataset.town=tmap[el.dataset.town];});
    var sel=document.querySelector('select[name=town]');
    if(sel){var seen={},targets={};keys.forEach(function(k){targets[tmap[k]]=1;});[].slice.call(sel.options).forEach(function(o){var nv=Object.prototype.hasOwnProperty.call(tmap,o.value)?tmap[o.value]:o.value;if(!o.value)return;if(seen[nv]){o.remove();return;}seen[nv]=1;if(targets[nv]){o.value=nv;o.textContent=nv;}});
      if(near.length)[].slice.call(sel.options).filter(function(o){return o.value;}).sort(function(a,b){return a.value.localeCompare(b.value);}).forEach(function(o){sel.appendChild(o);});}
  }

  // ---- services (optional): each sample customer gets one of the prospect's own services, same on every page ----
  if(p.services.length){
    var sv=p.services,W=sv.length===1?[0]:sv.length===2?[0,0,1]:sv.length===3?[0,0,0,1,1,2]:[0,0,0,1,1,2,3];
    var svcFor=function(id){var x=parseInt(id,10);if(isNaN(x))x=0;return sv[W[(x*7+3)%W.length]];};
    var cid=function(h){var m=/c(\d+)\.html/.exec(h||'');return m?m[1]:null;};
    var here=cid(location.pathname);
    if(here){document.querySelectorAll('td.cell-title[data-label="Record"]').forEach(function(el){var t=el.firstChild;if(!t||t.nodeType!==3)return;
      if(t.nodeValue==='Mini-split cleaning')t.nodeValue=svcFor(here);else if(t.nodeValue==='Booked cleaning')t.nodeValue='Booked: '+svcFor(here);});}
    document.querySelectorAll('td.cell-title[data-label="Customer"]').forEach(function(el){var a=el.querySelector('a'),sub=el.querySelector('.cell-sub'),id=a&&cid(a.getAttribute('href'));if(id&&sub)sub.textContent=sub.textContent+' · '+svcFor(id);});
    document.querySelectorAll('a.row__who').forEach(function(a){var id=cid(a.getAttribute('href')),f=a.querySelector('.row__facts');if(id&&f)f.textContent=svcFor(id)+' · '+f.textContent;});
  }

  // ---- trade wording ----
  if(!p.services.length&&(p.trade==='hvac'||p.trade==='plumbing')){
    var lbl=p.trade==='hvac'?'HVAC maintenance':'Plumbing service';
    document.querySelectorAll('.cell-title').forEach(function(el){var t=el.firstChild;if(t&&t.nodeType===3&&t.nodeValue==='Mini-split cleaning')t.nodeValue=lbl;});
  }

  // ---- welcome banner (first page of the session) ----
  var main=document.querySelector('main');
  var seenKey='smPreviewWelcomed:'+biz;
  var shown=false;try{shown=sessionStorage.getItem(seenKey)==='1';}catch(e){}
  if(main&&!shown){
    var poss=/s$/i.test(biz)?biz+'’':biz+'’s';
    var b=document.createElement('section');b.className='sm-banner';b.setAttribute('aria-label','Welcome');
    var kick=document.createElement('p');kick.className='sm-banner__kick';kick.appendChild(mono('sm-mono--sm'));var kt=document.createElement('span');kt.textContent='Preview built for '+(owner||biz);kick.appendChild(kt);
    var h=document.createElement('h2');h.className='sm-banner__title';h.textContent='Here’s what '+poss+' Command Center could look like';
    var what=p.trade==='plumbing'?'who’s due for service':p.trade==='hvac'?'who’s due for a tune-up':'who’s due for a cleaning';
    var d=document.createElement('p');d.className='sm-banner__body';d.textContent='One screen every morning: '+what+', new leads, and where the month stands.'+(town?' Sample customers around '+town+(near.length?' and nearby towns':'')+'.':near.length?' Sample customers around '+near.slice(0,2).join(' and ')+'.':'')+(p.services.length?' Sample jobs use your services.':'')+' Tap around, nothing here is real.';
    var btn=document.createElement('button');btn.type='button';btn.className='sm-banner__btn';btn.textContent='Take a look';
    var x=document.createElement('button');x.type='button';x.className='sm-banner__x';x.setAttribute('aria-label','Dismiss');x.textContent='×';
    function close(){b.classList.add('is-leaving');setTimeout(function(){b.remove();},220);try{sessionStorage.setItem(seenKey,'1');}catch(e){}}
    btn.addEventListener('click',close);x.addEventListener('click',close);
    b.appendChild(x);b.appendChild(kick);b.appendChild(h);b.appendChild(d);b.appendChild(btn);
    var anchor=main.querySelector('#page-progress');main.insertBefore(b,anchor?anchor.nextSibling:main.firstChild);
    try{sessionStorage.setItem(seenKey,'1');}catch(e){}
  }
  }catch(err){if(window.console)console.warn('preview personalization skipped',err);}
  done();
})();
