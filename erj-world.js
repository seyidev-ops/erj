/* ERJ World: one dotted Earth behind the page that the scroll flies.
   Scrolling down zooms from orbit into Nigeria, back out to the hiring
   world, and home again. Decorative only (aria-hidden): no page depends
   on it, and every word it sits behind is real text. Draws on scroll and
   while a camera move is settling; sleeps otherwise. Reduced motion gets
   one still globe. Land is a 1-degree bitmask; no network, no library. */
(function () {
  'use strict';
  var root = document.documentElement, body = document.body;
  if (!body || !window.requestAnimationFrame) return;
  var probe = document.createElement('canvas'); if (!probe.getContext) return;
  var CFG = window.ERJ_WORLD || null;
  var LAND = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAfwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P8/AGD//z8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8//+F/////3/5AAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAH8H/+//////8HAAAAAAAAADSAAQAAAB8AAAAAAAAAAAAAAAAAAAAAAAAAAPD//wf4//////8BAACAdT8AAAAAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAB4+Jzn//D//////38AAACAewMAAAAAAAAAAAAfAAAAAAAAAAAAAAAAAAAAAIA4BHAyO0D8/////38AAAAAPAoAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAFhAmPPVH4D//////z8AAAAAAAAAAAAA4AEAAAD8HwAAAAAAAAAAAAAAAAAAAAD/Az/fDwAA/P////8BAAAAAAAAAADABwAAwP//PwAA4FsAAAAAAAAAAAAAAAQMAAQQAAAA8P////8BAAAAAAAAAABwAAAA+P//FwAAAAAAAAAAAAAAAAAAAP8BxvMxfwAA8P///3cAAAAAAAAAAAAcAIDh//9/3IcLAAcAAAAAAAAAAAAAgN9/xy+8xwEA4P///zcAAAAAAAAAAAAGAJ7i//////8fAD4AAAAAAwAAAAAAAMf+D2L8/wsAoP///x0AAAAAAAAAAAAOAG9+//////8fef8HAAAAAADwTwAAAADwH/D4//8AwP7/fxEAAAAAANgHAAAAgN9/////////////DwAAAAD+//+Bvob/H9SBof8AwP7//w8AAAAAoP8PAAAAD9///////////////48/A8D///////8LD8jNA/wBgP///wAAAAAA6P//AwN6//79////////////////HwD///////9//+/vh/EPwP//BwAAAAAA8P//H/H//8///////////////////4Hw//////////+fAfw/wP//AQAAAAAA/v+fH/////P/////////////////8fD///////////9XAPwZgP8PANA/AAAA/+N/8P//////////////////////wAD4///////////Pw/gHAP4PAMA/AACA//F//v////////////////////8fAAP4///////////BAGAHAP4HAAADAACw//z///////////////////////9/AID//////////38AQ4AJAPwDAAAAAAD8P/7/////////////////////f/5fAMD//////////z8AwA8AAPgDAAAAAAD+H/z/////////////////////Mf8BAID/7/z//////x8AwD8AAMAAAAAAAAT+P7z+//////////////////9/wG8AAAD8AwD//////x8AwD8IAAAAAAAAAAC+P2D///////////////////91cAAAAACACwD4/////38AwP8eAAAAAAAAgAGcH/T//////////////////wEAOAAAAACADgDw/////38AgP8/AAAAAAAA4AMAX/T//////////////////wAAfgAAAAAwAABA//////8PgP8/AAAAAAAAgAFwHv7/////////////////PwAAfwAAAAAAAABA//////8/gP//AAAAAAAAgAPwAv7/////////////////DwAAPwAAAIAAAAAA/P//////8///AwAAAAAAcAcgcv//////////////////HwAAHwAAAAAAAACA/P//////4///DwAAAAAAPA7o/////////////////////wEADwAAAAAAAAAA8f//////4///DwAAAAAAPD/+/////////////////////wUAAwAAAAAAAAAA8P//////////FwAAAAAAAB///////////////////////wUAAwAAAAAAAAAAkP//////////CAAAAAAAgMD//////////////////////wwAAAAAAAAAAAAAYP////////8xLAAAAAAAAPT//////////////////////wwAAAAAAAAAAAAAAP///////38PfAAAAAAAgP///////////////////////wQAAAAAAAAAAAAAAP3///////8HUAAAAAAAAPz/////////////////////fwQAAAAAAAAAAAAAAP////////+XAAAAAAAAAPz////3/B/+////////////PwgAAAAAAAAAAAAAAP////////9/AAAAAAAAAPj//f9j/A/+////////////HwAAAAAAAAAAAAAAAP////////8MAAAAAAAAAPj/+P8B/Mf/////////////DwQAAAAAAAAAAAAAAP///////z8AAAAAAAAAcPzH4/8B8I//////////////Bx4AAAAAAAAAAAAAAP///////x8AAAAAAAAA+H+gw/8AwA/+//////////9/AAQAAAAAAAAAAAAAAP///////x8AAAAAAAAA+D8Ajv/w4B/8//////////8/AAAAAAAAAAAAAAAAAP///////wMAAAAAAAAA+B8wuA/+/z/+/////////98fAAMAAAAAAAAAAAAAAP///////wMAAAAAAAAA+E8wEIf//x/+/////////2cOAAMAAAAAAAAAAAAAAP7//////wEAAAAAgAAA+A8AEM7//x/8/////////wMOAAMAAAAAAAAAAAAAAPz//////wAAAAAAAAAA+AcABoT//x/8/////////zcYgAEAAAAAAAAAAAAAAPz//////wAAAAAAAAAAQOB/AAA2/////////////x8Y8AEAAAAAAAAAAAAAAPj//////wAAAAAAAAAAQPh/AAAA/////////////w8c/AAAAAAAAAAAAAAAAPj/////fwAAAAAAAAAA4P8/AAAA/////////////w+EGwAAAAAAAAAAAAAAAMD/////HwAAAAAAAAAA8P9/AACA/////////////x/EAwAAAAAAAAAAAAAAAID/////BwAAAAAAAAAA+P//BweA/////////////x+AAAAAAAAAAAAAAAAAAID9////BwAAAAAAAAAA/P//D3/A/////////////x9AAAAAAAAAAAAAAAAAAAD5////BwAAAAAAAAAA/P//f////////////////x8AAAAAAAAAAAAAAAAAAAD2/x8CBgAAAAAAAAAA/P/////v/4///////////z8AAAAAAAAAAAAAAAAAAAD0/wcABgAAAAAAAAAA/v///////4///////////z8AAAAAAAAAAAAAAAAAAADu/wcADgAAAAAAAACA//////8//x/+/////////x8AAAAAAAAAAAAAAAAAAACY/wcADAAAAAAAAADA//////8//z/g/////////w8AAAAAAAAAAAAAAAAAAACQ/wcACAAAAAAAAADg//////9//j+Av////////w8AAAAAAAAAAAAAAAAAAAAQ/wMAAAAAAAAAAADg//////9//n8YgP///////yMAAAAAAAAAAAAAAAAAAABA/gMAAAAAAAAAAADw////////+P9/AP///////xEAAAAAAAAAAAAAAAAAAAAA/AMAPQAAAAAAAADw////////+P//APz/////PxAAAAAAAAAAAAAAAAAAAAAA+AMIYAAAAAAAAAD4////////+f9/AOz/B///BAAAAAAAAAAAAAAAAAAAAAAA/AccgAEAAAAAAADw////////8f9/AOD/B/5/BAAAAAAAAAAAAAAAAQAAAAAA+A8eADgAAAAAAADw////////4f8/AOD/Afw/BgAAAAAAAAAAAAAAAAAAAAAA8J8OAPwAAAAAAADw////////4/8fAOD/APw/AgAAAAAAAAAAAAAAAAAAAAAAgP8PAAAAAAAAAADw////////x/8HAOB/APh/ADAAAAAAAAAAAAAAAAAAAAAAAP4PAAAAAAAAAADw////////h/8BAOA/AMz/ADAAAAAAAAAAAAAAAAAAAAAAAID/AAAAAAAAAAD4////////j/8AAMAPAMD/ARAAAAAAAAAAAAAAAAAAAAAAAAD/AQAAAAAAAAD4////////nx8AAMAPAMD/ATAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAD4////////vwcAAIAPAMD+AdAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAD4////////fwACAIAPAID8AQABAAAAAAAAAAAAAAAAAAAAAADAAEgAAAAAAADg////////f0AAAAAPAID4AUADAAAAAAAAAAAAAAAAAAAAAADAAe8TAAAAAADg/////////34AAAAPAEBwAAgAAAAAAAAAAAAAAAAAAAAAAAAAE+9/AAAAAADA/////////38AAAAXAEAgAAQCAAAAAAAAAAAAAAAAAAAAAAAAz///AAAAAACA/////////z8AAAASAMAAAIADAAAAAAAAAAAAAAAAAAAAAAAAyP//AQAAAAAA/////////z8AAAAwAIAAAAAHAAAAAAAAAAAAAAAAAAAAAAAAgP//AwAAAAAA/n///////x8AAAAwAAADAAMDAAAAAAAAAAAAAAAAAAAAAAAAgP//fwAAAAAA/A/+/////x8AAAAAAAgHgAcAAAAAAAAAAAAAAAAAAAAAAAAAgP///wAAAAAAEADk/////w8AAAAAADAGwAcAAAAAAAAAAAAAAAAAAAAAAAAAgP///wEAAAAAAADA/////wcAAAAAAGAG4AEAAAAAAAAAAAAAAAAAAAAAAAAAwP///wEAAAAAAADA/////wMAAAAAAMAM+AMQAAAAAAAAAAAAAAAAAAAAAAAA4P///wMAAAAAAADA/////wAAAAAAAIAL/gMQAAAAAAAAAAAAAAAAAAAAAAAA8P///wEAAAAAAADg////fwAAAAAAAIAH/uMQAAAAAAAAAAAAAAAAAAAAAAAA8P///w8AAAAAAADg////PwAAAAAAAAAX/gNIAQAAAAAAAAAAAAAAAAAAAAAA+P//f3cAAAAAAADg////PwAAAAAAAAAO/DkIAwAAAAAAAAAAAAAAAAAAAAAA+P///3sAAAAAAADA////HwAAAAAAAAB+/DkA8AEAAAAAAAAAAAAAAAAAAAAA+P////8fAAAAAACA////DwAAAAAAAAA8gChE/g8AAAAAAAAAAAAAAAAAAAAA+P////8/AAAAAAAA////BwAAAAAAAAA4AAAA8B8AAAAAAAAAAAAAAAAAAAAA+P//////AQAAAAAA////BwAAAAAAAAAwAAgAxD8NAAAAAAAAAAAAAAAAAAAA8P//////AQAAAAAA////BwAAAAAAAADAAQAAhP+AAAAAAAAAAAAAAAAAAAAA8P//////AQAAAAAA/v//BwAAAAAAAACAHwCAwH8AAAAAAAAAAAAAAAAAAAAA4P//////AQAAAAAA/v//BwAAAAAAAAAAgN8EAMcAAAAAAAAAAAAAAAAAAAAAwP//////AAAAAAAA/v//DwAAAAAAAAAAAAgBAIAFAAAAAAAAAAAAAAAAAAAAwP//////AAAAAAAA/P//DwAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAgP////9/AAAAAAAA/P//DwAAAAAAAAAAAABAAQQgAAAAAAAAAAAAAAAAAAAAgP////8/AAAAAAAA/v//HyAAAAAAAAAAAACAHwQAAAAAgAAAAAAAAAAAAAAAAP////8fAAAAAAAA/v//HzAAAAAAAAAAAADADwwAAAAAAAAAAAAAAAAAAAAAAP////8fAAAAAAAA////HzAAAAAAAAAAAADMDxwAAAAAAAAAAAAAAAAAAAAAAP7///8fAAAAAAAA////HzwAAAAAAAAAAAD/Dx4AAAAAAAAAAAAAAAAAAAAAAPj///8fAAAAAAAA////Dz8AAAAAAAAAAID/vx4AAAiAAAAAQAAAAAAAAAAAAOD///8fAAAAAAAA////Ax8AAAAAAAAAAMD//z4AAAAAAAAAAAAAAAAAAAAAAMD///8PAAAAAAAA////AR8AAAAAAAAAAMD//z8AAAAAAAAAAAAAAAAAAAAAAMD///8PAAAAAAAA/v9/AB8AAAAAAAAAAOD///8AAAAAAAAAAAAAAAAAAAAAAMD///8PAAAAAAAA/v9/AB8gAAAAAAAAAPz///8BAAEAAAAAAAAAAAAAAAAAAMD///8HAAAAAAAA/P9/gA8AAAAAAAAAgP////8BAAIAAAAAAAAAAAAAAAAAAMD///8DAAAAAAAA/P//gA8AAAAAAAAAwP////8DAAAAAAAAAAAAAAAAAAAAAMD//38AAAAAAAAA/P9/AA8AAAAAAAAAwP////8HAAAAAAAAAAAAAAAAAAAAAOD//x8AAAAAAAAA+P9/AAcAAAAAAAAA4P////8PAAAAAAAAAAAAAAAAAAAAAOD//wcAAAAAAAAA+P8fAAIAAAAAAAAAwP////8fAAAAAAAAAAAAAAAAAAAAAOD//wcAAAAAAAAA+P8fAAAAAAAAAAAA4P////8fAAAAAAAAAAAAAAAAAAAAAOD//w8AAAAAAAAA+P8fAAAAAAAAAAAAwP////8/AAAAAAAAAAAAAAAAAAAAAOD//wcAAAAAAAAA8P8PAAAAAAAAAAAAgP////8/AAAAAAAAAAAAAAAAAAAAAOD//wMAAAAAAAAA4P8HAAAAAAAAAAAAgP////8fAAAAAAAAAAAAAAAAAAAAAPD//wMAAAAAAAAA4P8HAAAAAAAAAAAAgP////8fAAAAAAAAAAAAAAAAAAAAAPD//wAAAAAAAAAAwP8DAAAAAAAAAAAAAP////8fAAAAAAAAAAAAAAAAAAAAAOD//wAAAAAAAAAAwP8BAAAAAAAAAAAAAP8D/P8PAAAAAAAAAAAAAAAAAAAAAPD/fQAAAAAAAAAAwH8AAAAAAAAAAAAAAP8A2P8HAAAAAAAAAAAAAAAAAAAAAPD/OwAAAAAAAAAAgAAAAAAAAAAAAAAAAAcA6P8HAAAAAAAAAAAAAAAAAAAAAPj/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP8DAAACAAAAAAAAAAAAAAAAAPj/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8DAAAEAAAAAAAAAAAAAAAAAPz/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8DAAAIAAAAAAAAAAAAAAAAAPz/AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgAAAA4AAAAAAAAAAAAAAAAAPg/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAPw/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAPwHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAALAAAAAAAAAAAAAAAAAPgPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAIADAAAAAAAAAAAAAAAAAPgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAMABAAAAAAAAAAAAAAAAAPgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAAAP4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAAAAAAAAAP4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAPwDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANADAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  var NG = [[13.61,13.7],[13.93,13.26],[14.16,12.61],[14.18,12.48],[14.2,12.38],[14.42,12.34],[14.58,12.22],[14.62,12.15],[14.62,11.99],[14.56,11.73],[14.57,11.53],[14.5,11.45],[14.2,11.27],[14.06,11.24],[13.89,11.14],[13.53,10.61],[13.42,10.17],[13.25,9.96],[13.24,9.81],[13.2,9.56],[13.02,9.49],[12.88,9.3],[12.83,9.02],[12.78,8.82],[12.65,8.67],[12.4,8.6],[12.23,8.28],[12.16,7.94],[12.02,7.65],[11.85,7.4],[11.77,7.27],[11.85,7.14],[11.79,7.06],[11.58,6.89],[11.55,6.7],[11.48,6.6],[11.32,6.48],[11.15,6.44],[11.08,6.51],[11.01,6.74],[10.85,6.88],[10.61,7.06],[10.56,7.04],[10.48,6.89],[10.29,6.88],[10.19,6.91],[10.14,7],[9.87,6.8],[9.78,6.76],[9.66,6.53],[9.49,6.42],[9.37,6.32],[9.06,6.01],[8.93,5.78],[8.86,5.46],[8.71,5.05],[8.58,4.83],[8.54,4.76],[8.43,4.75],[8.34,4.82],[8.24,4.91],[8.29,4.56],[7.8,4.52],[7.57,4.56],[7.52,4.65],[7.46,4.56],[7.21,4.61],[7.08,4.72],[7.17,4.61],[7.01,4.4],[6.87,4.44],[6.82,4.64],[6.77,4.72],[6.79,4.59],[6.86,4.37],[6.72,4.34],[6.62,4.38],[6.58,4.48],[6.5,4.33],[6.3,4.3],[6.26,4.33],[6.27,4.43],[6.2,4.29],[6.08,4.29],[5.91,4.39],[5.59,4.65],[5.49,4.84],[5.38,5.13],[5.45,5.13],[5.39,5.17],[5.37,5.26],[5.44,5.36],[5.53,5.43],[5.39,5.4],[5.2,5.53],[5.29,5.58],[5.46,5.61],[5.35,5.62],[5.33,5.71],[5.28,5.64],[5.11,5.64],[5.09,5.77],[4.86,6.03],[4.43,6.35],[3.49,6.41],[3.49,6.46],[3.75,6.58],[3.5,6.53],[3.34,6.4],[2.71,6.37],[2.73,6.6],[2.77,6.71],[2.73,6.85],[2.75,7.02],[2.75,7.14],[2.77,7.42],[2.78,7.48],[2.72,7.62],[2.71,7.83],[2.7,8.05],[2.7,8.37],[2.73,8.61],[2.77,9.05],[3.04,9.08],[3.15,9.32],[3.17,9.49],[3.33,9.67],[3.35,9.81],[3.48,9.85],[3.6,10.01],[3.58,10.27],[3.61,10.35],[3.68,10.43],[3.77,10.42],[3.84,10.61],[3.76,10.77],[3.74,10.97],[3.7,11.12],[3.64,11.18],[3.49,11.5],[3.59,11.7],[3.66,11.76],[3.62,11.83],[3.62,11.93],[3.63,12.06],[3.65,12.41],[3.77,12.62],[4.04,12.93],[4.15,13.46],[4.24,13.5],[4.56,13.7],[4.82,13.76],[5.1,13.74],[5.36,13.84],[5.49,13.87],[6.18,13.66],[6.3,13.66],[6.51,13.49],[6.63,13.36],[6.87,13.04],[7,13],[7.1,13.03],[7.27,13.11],[7.79,13.34],[7.95,13.32],[8.45,13.06],[8.96,12.86],[9.62,12.81],[10.05,13.21],[10.23,13.28],[10.96,13.37],[11.5,13.34],[11.99,13.19],[12.32,13.07],[12.51,13.19],[12.76,13.38],[13.05,13.53],[13.33,13.67],[13.61,13.7]];
  var RAD = Math.PI / 180;
  function vec(lat, lon) { var p = lat * RAD, l = lon * RAD; return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)]; }
  var raw = atob(LAND), W = 360, H = 180, dots = [];
  for (var r = 0; r < H; r++) {
    var lat = 89.5 - r, step = Math.max(1, Math.round(1 / Math.max(Math.cos(lat * RAD), .12)));
    for (var c = 0; c < W; c += step) { var i = r * W + c; if ((raw.charCodeAt(i >> 3) >> (i & 7)) & 1) dots.push(vec(lat, -179.5 + c)); }
  }
  raw = null;
  var ngv = NG.map(function (p) { return vec(p[1], p[0]); });
  var HOME = vec(6.5, 3.4);
  var CITIES = [
    { n: 'London', v: vec(51.5, -0.1), at: .4 }, { n: 'Berlin', v: vec(52.5, 13.4), at: 1.2 },
    { n: 'Dubai', v: vec(25.2, 55.3), at: 2 }, { n: 'Johannesburg', v: vec(-26.2, 28), at: 2.8 },
    { n: 'New York', v: vec(40.7, -74), at: 3.6 }, { n: 'Toronto', v: vec(43.7, -79.4), at: 4.3 },
    { n: 'San Francisco', v: vec(37.8, -122.4), at: 5 }
  ];
  var TOWNS = [['Lagos', 6.5, 3.4], ['Abuja', 9.06, 7.49], ['Kano', 12, 8.52], ['Port Harcourt', 4.82, 7.03], ['Enugu', 6.44, 7.5], ['Ibadan', 7.38, 3.9], ['Kaduna', 10.52, 7.44], ['Benin City', 6.34, 5.62]]
    .map(function (t) { return { n: t[0], v: vec(t[1], t[2]) }; });

  var cv = document.createElement('canvas'); cv.id = 'erjWorld'; cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
  body.insertBefore(cv, body.firstChild);
  var ctx = cv.getContext('2d'), S = 1, VW = 0, VH = 0, BASE = 0, narrow = false;
  function size() {
    narrow = window.innerWidth < 760;
    S = Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 2);
    VW = window.innerWidth; VH = window.innerHeight;
    cv.width = Math.round(VW * S); cv.height = Math.round(VH * S);
    BASE = Math.min(VW, VH) * .44;
  }
  function isDay() { return root.getAttribute('data-theme') === 'day'; }
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* stations: where the camera sits for each part of the page */
  var LITE = [{ lat: 14, lon: 10, zoom: 1.05, x: .8, y: .34, a: .5, mx: .5, my: .2, ma: .26, spin: 1 }, { at: 1.1, lat: 10, lon: 8, zoom: 1.9, x: .86, y: .5, a: .16, mx: .5, my: .4, ma: .1 }];
  var stations = (CFG && CFG.stations) || null, els = [];
  function measure() {
    if (!stations) return;
    els = stations.map(function (s) { return s.sel ? document.querySelector(s.sel) : null; });
  }
  function docY(el) { var r = el.getBoundingClientRect(); return r.top + window.pageYOffset; }
  function smooth(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }
  function pick(s) { // a station's camera, for this screen
    var o = { lat: s.lat, lon: s.lon, zoom: narrow && s.mzoom != null ? s.mzoom : s.zoom, x: narrow && s.mx != null ? s.mx : s.x, y: narrow && s.my != null ? s.my : s.y, a: narrow && s.ma != null ? s.ma : s.a, arcs: s.arcs || 0, ng: s.ng || 0, spin: s.spin || 0, towns: s.towns || 0 };
    if (s.anchor) { var el = document.querySelector(s.anchor); if (el) { var r = el.getBoundingClientRect(); if (r.width > 40) { o.x = (r.left + r.width / 2) / VW; o.y = (r.top + r.height / 2) / VH; o.zoom = Math.min(r.width, r.height) * .45 / BASE; } } }
    return o;
  }
  var KEYS = ['lat', 'lon', 'zoom', 'x', 'y', 'a', 'arcs', 'ng', 'spin', 'towns'];
  var stIndex = 0;
  function target() {
    var y = window.pageYOffset, a, b, k;
    if (!stations) { // lite: one gentle move over the first screen
      a = pick(LITE[0]); b = pick(LITE[1]); k = smooth(y / (VH * 1.1));
    } else {
      var mid = y + VH * .5, pts = [];
      for (var i = 0; i < stations.length; i++) { var el = els[i]; if (!el) continue; var an = stations[i].anchor && document.querySelector(stations[i].anchor); if (an && an.offsetHeight > 40) { pts.push({ s: stations[i], y: docY(an) + an.offsetHeight / 2, i: i }); continue; } var top = docY(el), h = el.offsetHeight; pts.push({ s: stations[i], y: top + Math.min(h * .5, VH * .9), i: i }); }
      if (!pts.length) return pick(LITE[0]);
      var j = 0; while (j < pts.length - 1 && mid > pts[j + 1].y) j++;
      var p0 = pts[j], p1 = pts[Math.min(j + 1, pts.length - 1)];
      var f = p1 === p0 ? 0 : (mid - p0.y) / (p1.y - p0.y);
      k = smooth((f - .22) / .56);
      a = pick(p0.s); b = pick(p1.s); stIndex = k > .5 ? p1.i : p0.i;
    }
    var o = {}; KEYS.forEach(function (n) { o[n] = a[n] + (b[n] - a[n]) * k; });
    return o;
  }
  function sway() { return 26 * Math.sin(swayT * .16); }
  var cam = null, tgt = null, swayT = 0, worldT = 0, lastNow = 0, raf = 0, running = false;
  var R, CX, CY, fx, fy, fz, rx, ry, ux, uy, uz;
  function setCam(c) {
    var p = c.lat * RAD, l = (c.lon + sway() * c.spin) * RAD;
    fx = Math.cos(p) * Math.cos(l); fy = Math.cos(p) * Math.sin(l); fz = Math.sin(p);
    rx = -Math.sin(l); ry = Math.cos(l);
    ux = -Math.sin(p) * Math.cos(l); uy = -Math.sin(p) * Math.sin(l); uz = Math.cos(p);
    R = BASE * c.zoom * S; CX = c.x * VW * S; CY = c.y * VH * S;
  }
  function proj(v, lift) {
    var k = R * (lift || 1);
    return { x: CX + k * (v[0] * rx + v[1] * ry), y: CY - k * (v[0] * ux + v[1] * uy + v[2] * uz), z: v[0] * fx + v[1] * fy + v[2] * fz };
  }
  function slerp(a, b, t) {
    var d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), w = Math.acos(d);
    if (w < 1e-4) return a; var s1 = Math.sin((1 - t) * w) / Math.sin(w), s2 = Math.sin(t * w) / Math.sin(w);
    return [a[0] * s1 + b[0] * s2, a[1] * s1 + b[1] * s2, a[2] * s1 + b[2] * s2];
  }
  function chip(p, label, col, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.font = '700 ' + (11.5 * S) + 'px Inter, system-ui, sans-serif';
    var tw = ctx.measureText(label).width, pw = tw + 16 * S, ph = 22 * S, x = p.x + 10 * S, y = p.y - 28 * S;
    if (x + pw > cv.width - 6 * S) x = p.x - 10 * S - pw; if (y < 6 * S) y = p.y + 8 * S;
    ctx.fillStyle = col; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, pw, ph, 11 * S); else ctx.rect(x, y, pw, ph); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + 8 * S, y + ph / 2 + .5 * S); ctx.restore();
  }
  function pin(p, col, t, a, big) {
    var pulse = (t % 1.8) / 1.8, k = big ? 1.5 : 1;
    ctx.save(); ctx.globalAlpha = a * (1 - pulse); ctx.strokeStyle = col; ctx.lineWidth = 2 * S;
    ctx.beginPath(); ctx.arc(p.x, p.y, (4 + pulse * 18) * S * k, 0, 7); ctx.stroke();
    ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, p.y, 4.4 * S * k, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.7 * S * k, 0, 7); ctx.fill(); ctx.restore();
  }
  function arc(from, to, prog, col, t, a) {
    var N = 44, upto = Math.floor(prog * N), prev = null, lit = null, sparkAt = Math.floor(((t * .55) % 1) * N);
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = 1.7 * S; ctx.globalAlpha = a * .85; ctx.beginPath();
    for (var i = 0; i <= upto; i++) {
      var k = i / N, p = proj(slerp(from, to, k), 1 + .2 * Math.sin(Math.PI * k));
      var vis = p.z > 0 || Math.hypot(p.x - CX, p.y - CY) > R;
      if (vis && prev) { ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); }
      prev = vis ? p : null; if (vis && i === sparkAt) lit = p;
    }
    ctx.stroke();
    if (prog >= 1 && lit) { ctx.globalAlpha = a; ctx.fillStyle = '#FFD7A8'; ctx.beginPath(); ctx.arc(lit.x, lit.y, 2.5 * S, 0, 7); ctx.fill(); }
    else if (prog < 1 && prev) { ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(prev.x, prev.y, 2.6 * S, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  function draw(now) {
    var c = cam, D = isDay(), ORANGE = D ? '#E8470F' : '#FF5722', GREEN = D ? '#0B7A47' : '#19C27A', t = now / 1000;
    setCam(c);
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (c.a < .01) return;
    var cw = cv.width, ch = cv.height, far = Math.hypot(Math.max(CX, cw - CX), Math.max(CY, ch - CY));
    ctx.globalAlpha = c.a;
    // the sphere and its lit edge
    if (R > far) { ctx.fillStyle = D ? '#F3EEE8' : '#090B11'; ctx.fillRect(0, 0, cw, ch); }
    else {
      var g = ctx.createRadialGradient(CX - R * .35, CY - R * .4, R * .1, CX, CY, R);
      if (D) { g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#F0EAE3'); } else { g.addColorStop(0, '#171A26'); g.addColorStop(1, '#06070B'); }
      var halo = ctx.createRadialGradient(CX, CY, R * .96, CX, CY, R * 1.16);
      halo.addColorStop(0, D ? 'rgba(232,71,15,.30)' : 'rgba(255,87,34,.42)'); halo.addColorStop(1, 'rgba(255,87,34,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(CX, CY, R * 1.16, 0, 7); ctx.fill();
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.fill();
      ctx.strokeStyle = D ? 'rgba(232,71,15,.5)' : 'rgba(255,138,61,.6)'; ctx.lineWidth = 1.2 * S; ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.stroke();
    }
    // land as dots, brighter where it faces you
    var dr = Math.max(.9, Math.min(R / S * .0046, 5.5)) * S, round = dr > 2.4 * S, pad = dr * 2;
    ctx.fillStyle = D ? '#3A3833' : '#E9E6F2';
    for (var i = 0, n = dots.length; i < n; i++) {
      var v = dots[i], z = v[0] * fx + v[1] * fy + v[2] * fz; if (z <= .02) continue;
      var x = CX + R * (v[0] * rx + v[1] * ry); if (x < -pad || x > cw + pad) continue;
      var y = CY - R * (v[0] * ux + v[1] * uy + v[2] * uz); if (y < -pad || y > ch + pad) continue;
      ctx.globalAlpha = c.a * (.16 + .6 * z);
      if (round) { ctx.beginPath(); ctx.arc(x, y, dr, 0, 7); ctx.fill(); } else ctx.fillRect(x - dr, y - dr, dr * 2, dr * 2);
    }
    // Nigeria, lit, once you are close enough to see it
    if (c.ng > .02) {
      ctx.save(); ctx.beginPath();
      for (var j = 0; j < ngv.length; j++) { var q = proj(ngv[j]); j ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }
      ctx.closePath(); ctx.globalAlpha = c.a * c.ng * .22; ctx.fillStyle = ORANGE; ctx.fill();
      ctx.globalAlpha = Math.min(1, c.a * 2.2) * c.ng; ctx.strokeStyle = ORANGE; ctx.lineWidth = 1.6 * S; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
    }
    if (c.towns > .05) {
      ctx.save(); ctx.font = '600 ' + (11 * S) + 'px Inter, system-ui, sans-serif'; ctx.textBaseline = 'middle';
      TOWNS.forEach(function (tn, k) {
        if (!k) return; var p = proj(tn.v); if (p.z <= 0) return;
        ctx.globalAlpha = Math.min(1, c.a * 2.4) * c.towns * .8; ctx.fillStyle = D ? '#3A3833' : '#fff';
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.6 * S, 0, 7); ctx.fill(); ctx.fillText(tn.n, p.x + 8 * S, p.y);
      }); ctx.restore();
    }
    // jobs: each one drawn from its city back to you
    var la = Math.min(1, c.a * 1.6), home = proj(HOME);
    if (c.arcs > .02) CITIES.forEach(function (ct) {
      var k = still ? 1 : Math.min(1, Math.max(0, (worldT - ct.at) / .9)); if (k <= 0) return;
      arc(ct.v, HOME, k, ORANGE, t + ct.at, la * c.arcs);
      var p = proj(ct.v); if (p.z > 0) { pin(p, ORANGE, t + ct.at, la * c.arcs); if (c.arcs > .7 && c.zoom < 2) chip(p, ct.n, ORANGE, la * c.arcs); }
    });
    if (home.z > 0 && (c.arcs > .02 || c.ng > .3)) { var ha = la * Math.max(c.arcs, c.ng); pin(home, GREEN, t, ha, c.zoom > 3); if (c.arcs > .7 || c.towns > .5) chip(home, c.towns > .5 ? 'Lagos' : 'You · Lagos', GREEN, ha); }
    ctx.globalAlpha = 1;
  }
  function near(a, b) { return Math.abs(a.zoom - b.zoom) < .004 * b.zoom && Math.abs(a.x - b.x) < .0015 && Math.abs(a.y - b.y) < .0015 && Math.abs(a.lat - b.lat) < .05 && Math.abs(a.lon - b.lon) < .05 && Math.abs(a.a - b.a) < .004; }
  function tick(now) {
    raf = 0; var dt = Math.min(.05, (now - (lastNow || now)) / 1000); lastNow = now;
    tgt = target();
    if (!cam || still) cam = tgt; else { var e = 1 - Math.pow(.0009, dt); KEYS.forEach(function (n) { cam[n] += (tgt[n] - cam[n]) * e; }); }
    var live = false;
    if (!still) {
      if (cam.arcs > .25) { worldT += dt; live = true; } else if (cam.arcs < .02) worldT = 0;
      if (cam.spin > .05 && (!narrow || cam.arcs > .25)) { swayT += dt; live = true; }
      if (cam.ng > .3 || cam.arcs > .02) live = cam.a > .03 || live; // pins pulse
    }
    draw(now);
    hud();
    if (!document.hidden && onScreen && (live || !near(cam, tgt))) raf = requestAnimationFrame(tick); else { running = false; lastNow = 0; }
  }
  function kick() { if (!raf) { running = true; raf = requestAnimationFrame(tick); } }

  /* the tour rail: where you are on the trip, and one tap to anywhere */
  var rail = null, readout = null, toast = null, lastIdx = -1, toastT = 0, onScreen = true;
  function buildHud() {
    if (!stations || !CFG.rail) return;
    rail = document.createElement('nav'); rail.className = 'wt-rail'; rail.setAttribute('aria-hidden', 'true');
    stations.forEach(function (s, i) {
      if (!s.name) return; var b = document.createElement('a'); b.href = s.sel; b.tabIndex = -1; b.setAttribute('data-i', i);
      b.innerHTML = '<span>' + s.name + '</span><i></i>'; rail.appendChild(b);
    });
    readout = document.createElement('div'); readout.className = 'wt-read'; readout.setAttribute('aria-hidden', 'true');
    toast = document.createElement('div'); toast.className = 'wt-toast'; toast.setAttribute('aria-hidden', 'true');
    body.appendChild(rail); body.appendChild(readout); body.appendChild(toast);
  }
  function hud() {
    if (!rail) return;
    if (stIndex !== lastIdx) {
      lastIdx = stIndex; var s = stations[stIndex];
      [].forEach.call(rail.children, function (a) { a.classList.toggle('on', +a.getAttribute('data-i') === stIndex); });
      if (s && s.say) { toast.textContent = s.say; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('on'); }, 1900); }
    }
    var km = Math.round(13000 / Math.pow(cam.zoom, 1.25) / 10) * 10;
    readout.textContent = km.toLocaleString('en-GB') + ' km up · ' + Math.abs(cam.lat).toFixed(1) + '°' + (cam.lat >= 0 ? 'N' : 'S') + ' ' + Math.abs(((cam.lon + sway() * cam.spin + 540) % 360) - 180).toFixed(1) + '°' + ((((cam.lon + sway() * cam.spin + 540) % 360) - 180) >= 0 ? 'E' : 'W');
  }
  size(); measure(); buildHud(); kick();
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { size(); measure(); cam = null; kick(); });
  window.addEventListener('load', function () { measure(); kick(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
  if (window.MutationObserver) new MutationObserver(kick).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})();
