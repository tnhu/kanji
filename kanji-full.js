/* Copyright (c) Tan Nhu, http://lnkd.in/tnhu */
(function(q,w,x,y,B,C,D,z,r){function A(a){return a&&typeof a===w&&!(typeof a.length===x&&!a.propertyIsEnumerable(y))&&a||null}function s(a){return a&&typeof a===w&&typeof a.length===x&&!a.propertyIsEnumerable(y)&&a||null}function t(a){return a&&"function"===typeof a&&a||null}function u(a){return t(a)&&a.prototype&&a===a.prototype.constructor&&a||null}function v(a,c,d){if(s(c))for(var g=c.length;0<=--g;)v(a,c[g],d);else{d=d||{constructor:1,$super:1,prototype:1,$superp:1};var g=u(a),p=u(c),b=a.prototype,
f,h;if(A(c))for(f in c){h=f;var k=c[f],e=a,l=g,m=b;d&&d.hasOwnProperty(h)||(e[h]=k,l&&(m[h]=k))}if(p)for(f in h=c.prototype,h){var k=f,e=h[f],l=a,m=g,n=b;d&&d.hasOwnProperty(k)||(l[k]=e,m&&(n[k]=e))}g&&p&&v(b,c.prototype,d)}}function n(a,c){c||(a=(c=a,0));var d,g,p,b,f,h,k=0,e,l={constructor:1,$singleton:1,$statics:1,prototype:1,$super:1,$superp:1,main:1,toString:0};f=n.overload;var m=n.plugins;c=("function"===typeof c?c():c)||{};d=c.hasOwnProperty("constructor")?c.constructor:0;g=c.$singleton;p=
c.$statics;for(b in m)l[b]=1;d=g?{}:d?f?f("constructor",d):d:function(){};f=g?d:d.prototype;for(h=(a=!a||s(a)?a:[a])&&a.length;k<h;){e=a[k++];for(b in e)l[b]||(f[b]=e[b],g||(d[b]=e[b]));for(b in e.prototype)l[b]||(f[b]=e.prototype[b])}for(b in c)l[b]||(f[b]=c[b]);for(b in p)d[b]=f[b]=p[b];g||(e=a&&a[0]||a,d.$super=e,d.$superp=e&&e.prototype?e.prototype:e);for(b in m)m[b](d,a,c);t(c.main)&&c.main.call(d,d);return d}n.plugins={};r={version:C,Class:n,extend:v,mapOrNil:A,arrayOrNil:s,functionOrNil:t,
stringOrNil:function(a){return"[object String]"===B.apply(a)&&a||null},classOrNil:u};"undefined"!==typeof module&&module.exports?module.exports=r:(z=q.Class,q.Class=n,q.jsface=r,r.noConflict=function(){q.Class=z})})(this,"object","number","length",Object.prototype.toString,"2.1.2");

(function(a){a=a.jsface||require("./jsface");var p=a.functionOrNil,k=[],l=0;a.Class.plugins.$ready=function q(c,b,a,r){for(var f=a.$ready,d=b?b.length:0,m=d,n=d&&b[0].$super,g,e,h;d--;)for(e=0;e<l&&(h=k[e],g=b[d],g===h[0]&&(h[1].call(g,c,b,a),m--),m);e++);n&&q(c,[n],a,!0);!r&&p(f)&&(f.call(c,c,b,a),k.push([c,f]),l++)}})(this);

Class(function(){function y(e,a,f){a=a?a:m(e.target);f=f?f:e.type;var c=n.instanceRefs,d,b;if(b=a.attr(C)){b=b.split("/");d=b[0];b=b[1];c=c[d];if(!c)return u(e,f,!1,d);d=c.instance;f=c[b][f];b=K(d[f]);if(f){if(b)return b.call(d,e,a);console.log(w,f,"not implemented")}}}function L(e,a){var f=e.$superp,c=e.prototype,d,b,h,g;if(b=M(a.actions)){for(h in b){d=b;for(var k=h,l=b[h],q={},m=l&&l.split("|"),p=m&&m.length||0,r=void 0,s=void 0,n=s=void 0,v=void 0;p--;)if(r=m[p].split(":"),s=r.length,0<s&&3>s)for(1===
r.length&&r.unshift(t),s=r[0].split(","),n=s.length;n--;)v=s[n],q[v]=r[1],D[v]||(q.nondelegable=!0);else console.log(w,"unrecognized action",l);d[k]=q;b[h].nondelegable&&(e.hasNondelegableEvents=!0,delete b[h].nondelegable)}c.actions=b}if(f){d=f.listeners;b=f.actions;f=c.actions;for(g in d)a.listeners[g]||(a.listeners[g]=d[g]);for(h in b)if(c=f[h])for(g in b[h])c[g]||(c[g]=b[h][g]);else f[h]=b[h]}}function u(e,a,f,c){var d=a?m(e.target):m(this),b=a||e.type;a=n.instanceRefs;var h,g,k,l,q;g=d.attr(C);
if(!c&&g)return y(e,d,b);d=d.closest(N);if(d.length&&(g=d.attr(x),!g||c))if(k=d.attr(E),l=k.split("/")[0],g=n[l]){q=g.prototype.type;b=(b=d.attr(O))&&b.replace(/'/g,'"');try{b=b&&P(b)}catch(u){Kanji.notify("com:config-not-wellformed",b)}switch(q){case "shared":a:{var p=n.instanceRefs;for(h in p)if(c=p[h],c=c.instance,c instanceof g){c=p[h];break a}c=new g;h=F++;c={instance:c,instanceId:h};p[h]=c}h=c.instance;g=c.instanceId;break;default:h=new g;g=c||F++;c={instance:h,instanceId:g};q=h;k=k.substring(l.length+
1);var r;if(k){q.namespace=k;r=q.listeners;l={};for(p in r)l[p+"/"+k]=l[p]=r[p];q.listeners=l}}p=c;k=p.instanceId;l=p.instance.actions;var s,t,v;for(s in l)if(v="self"===s?d:d.children(":not([data-com])"+s),v.length){r=Q++;v.attr("data-act",k+"/"+r);q={};for(t in l[s])if(q[t]=l[s][t],!D[t])v.on(t,y);p[r]=q}a[g]=c;d.attr(x,g);delete c.instanceId;h.init(d,b);h.render(d);if(!f)return y(e)}else console.log(w,"Component not found",l),Kanji.notify("com:not-found",l,d)}function G(){var e=n.instanceRefs,
a=+new Date,f,c;for(f in e)if("0"!==f&&(c=m(["[",x,"=",f,"]"].join(z)),c.length||delete e[f],+new Date-a>R))break;H(G,I)}var t="click",E="data-com",O="data-cfg",x="data-instance",C="data-act",N="[data-com]",D={mousedown:1,touchstart:1,keydown:1,click:1,touchend:1},z="",w="[ERROR] Kanji:",I=1500,R=250,K=jsface.functionOrNil,M=jsface.mapOrNil,m=jQuery,H=setTimeout,S=[].slice,P="object"===typeof JSON&&JSON.parse||m.parseJSON,J=0,A=[],F=1,Q=1,n={instanceRefs:{}},B;return{$statics:{notify:function(){var e=
S.call(arguments),a=e.shift(),f=n.instanceRefs,c,d,b,a="shared"===this.type?a:this.namespace?[a,"/",this.namespace].join(z):a;for(c in f)if(d=f[c].instance||f[c])b=d.listeners,b[a]&&b[a].apply(d,e);Kanji.debug&&console.log("Kanji:",a)}},actions:{},listeners:{},init:function(e,a){},render:function(e){},$ready:function(e,a,f){this!==e&&((a=f.id)?n[a]||(n[a]=e,a=['[data-com="',a,'"],[data-com^="',a,'/"]'].join(z),L(e,f),J?m(a).each(function(){var a=m(this);(!1===e.prototype.lazy||e.hasNondelegableEvents)&&
u({target:a[0]},t,!0)}):A.push(a)):console.log(w,"id not found on",f))},main:function(e){Kanji=e;n={instanceRefs:{0:{listeners:{"com:init":function(a){u({target:a[0]},t,!0,a.attr(x))},"com:dump":function(a){a(n)}}}}};m.fn.ready(function(){var a=m(document),f=A.length,c=0,d,b,e,g,k;for(J=1;c<f;)if(d=m(A[c++]),b=d.length,e=0,b)for(;e<b;)g=m(d[e++]),k=g.attr(E).split("/")[0],k=n[k],(!1===k.prototype.lazy||k.hasNondelegableEvents)&&u({target:g[0]},t,!0);a.on("touchend",function(a){B=!0;return u(a,t)}).on(t,
function(a){if(!B)return u(a,t);B=!1});a.on("mousedown touchstart keydown",function(a){return u(a,a.type)});H(G,I)})}}});