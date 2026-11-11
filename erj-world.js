/* ERJ World: one soft grey Earth behind the page that the scroll flies.
   Scrolling down zooms from orbit into Nigeria, back out to the hiring
   world, and home again. Decorative only (aria-hidden): no page depends
   on it, and every word it sits behind is real text. Land is drawn as
   smooth grey shapes with a brand-orange edge (no dot pattern) so text and pictures above it
   stay clear. Draws on scroll and while a camera move is settling; sleeps
   otherwise. Reduced motion gets one still globe. No network, no library. */
(function () {
  'use strict';
  var root = document.documentElement, body = document.body;
  if (!body || !window.requestAnimationFrame) return;
  var probe = document.createElement('canvas'); if (!probe.getContext) return;
  var CFG = window.ERJ_WORLD || null;
  var LAND = 'DQBd9F7wT/RF8ED0LvDX8zXwaPMy8CnzQ/Ap80XwDvNT8H7zUfDq80zwD/Rh8Cr0c/Bd9F7wCwDo4HnwiOBy8EbghPAp4JbwJ+CZ8AbgpvAl4LnwguCx8LTgofDa4JDw6OB58BUALvfC8Gz3rPCB947wh/d48In3X/A890/w6/ZC8I32N/Ak9i3wrfUw8Gz1QPB19VXw3/Vj8Ar2c/Aq9onwQPab8F/2rfB/9sLwmPbC8OP2zPAu98LwCQBT6KXxlOid8dDopvGz6JTxhOiI8T/ojPEN6J3xGOiu8VPopfEHAHrnpvHG55LxqeeU8WjnmfEk56fxSOey8XrnpvENAKvs8/Hi7OzxGe3y8Tbt1vEP7drx0uzY8ZTs2vFR7NfxHuzh8QTs9fEj7P7xYuz38avs8/EZAKHyJPKn8g7ynvL68ZHy5/FW8uHxHvLX8d3x2PH18evxuvHl8YLx3vFc8ezxWfEB8pDxFfKy8Rry7PEY8vvxMvL+8UTy/fFt8hnyhPJH8ozyYvJ58m7yZ/KD8lDylPI78qHyJPIsAtjcdO/b3HTvB92R72Hdge9n3YPvdd2H74bdjO+U3ZHvnN2T76Pdk++o3ZLv8d197zDeku883pXvzt6e7/7eku8V34zvYd987+/fb+9f4F/vIOFT77DhYe+F4lfv/eJI74LjVu8N5GTvF+R871Pjfe+x4onvh+Kd7wHiqO8J4r7vHOLT7y/i5e8l4vrv0uEI8KzhGfBe4Snw2OEm8EviLvCU4h3w7eIs8D/jPvBn40/wVeNk8BXjcfDL4oDwZeKD8AviivCq4Y/wieGh8EnhsfAh4cPwEuH88Crh9/BX4efwquHs8Pnh8/Ai4t3wceLi8LTi7fDz4vvwK+ML8XfjEPF14yPxY+M18XLjR/Gy41Dx0OM/8RzkSfFW5FbxnuRX8eHkXPEl5WfxW+Vy8ZflffG+5Xrx4eV28SvmffFu5nTxsuZ18fTmfPE353fxgudy8cfndPEQ6HPxWuhy8Z/odPHS6IPxDumL8U3pgPGJ6Ynxv+ma8d/pi/Hx6XnxEepo8UXqd/GB6mTxxOpe8f7qUfFF61TxhOtd8dDrW/ET7FTxWOxL8XLsYPFS7HHxOeyD8fnrh/Hc65nx0eus8cDr0fHm68rxKOzH8WjsyvGj7MLx1uy08ezsovEv7Z/xcO2m8bTtsPHy7bbx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dASxEWAEohFEBIwRTgSFEUUEdxFKBGQRTwRdET0EOhE9BP0QMwQAEQ0E5RDwA50QzgNlEJMDPxB0Aw4QUwMOEDwD9Q8wA8gPHgOwDxsDoQ/1AqwPtAKuD4oCmQ9bApkPBgJ/DwMCaA/dAXcPzQFKD78BOQ+dASUPjgH2Dr0B3w4DAssONQK6Dk0Cnw59ApMOvAKKDtsCXQ4gA0gOgAM5DsADOQ79Ay8OLATnDQ4Eww0UBIINUASaDWMEiw12BFENoQQsDa0EHQ3RBPcM9wSaDO4ESQztBAMM5gSlC/UEbgsBBTYLBwUhC0QFCQtNBeIKRAWwCiwFcwo9BUAKYwUQCnEF7wmhBcoJ4wWvCdsFjwnsBXwJ2AVfCdsFaQnFBWUJuQV1CZQFiAloBaEJXQWpCUwFzAk3Bc8JIgXKCREF0AkABd4J8gTlCeIE7AnWBOkJ+gT3CRQFBAoaBRQKCgUUCu0ECQrPBBMKvAQcCr8EHgqxBEUKuQRuCrgEjAq2BK8K2ATUCvgE9AoXBQILKAUICyMFBAsPBf0KBgUEC94EGgu8BDYLqgRbC6MEeAuaBI8LfgScC20ErgtnBK4LXAScCz4ElAswBH8LIARsC/0DVgsABEsL9ANDC9sDSQu5A0ULswMuC7MDDguhAwoLiAP+Cn4D3wp+A8sKcgPMCl0DtApPA5gKVAN3CkMDXwpBAzsKMwMyCh0DMAoMA/8J9wKvCd8Cggm8AmwJuQJdCbwCQAmoAiAJngL2CJsC6QiZAt4IiwLRCIgCygh7ArEIfAKhCHUCfgh4AnEIlQJzCLACagi/AmEI5AJSCPkCXAj7AlcIEgNdCBwDWwgxA1UIRwNFCFYDQQhqAygIfAMNCKYD/wfOA9wH8QPGB/kDpQcpBJ8HSwShB2kEhQegBG0HtARSB74EQgfbBEQH5gQ3BwAFKAcLBRUHMQX2BlkF3QZ7BcQGewXLBpYFzgaoBdQGvAXSBsMFxAavBbkGiQWsBm8FoAZmBY8GdwV5Bo0FVQbVBVAG0AVlBpsFgwZpBakGGwW8BgAFzAbkBPkGrATvBqQE8AaDBCoHVgQzB0wERAcbBDkHEgRAB94DUgejA2UHlgOBB4QDngdKA6sHHAPHBwQDCwjVAicIuAJCCJsCUgiKAmoIewJ2CGwCdAhXAlgISwJtCD0Cfgg0AocIHwKeCAoCtwgKAuYIFwIcCR0CSAksAmEJMAJzCTkCjwk7Ap8JPAK2CUMC0QlIAukJWQL8CVkC/QlLAvgJLgL4CRQC7gkCAuAJzAHICZQBqQlUAX4JCwFTCdMAGAmPAOYIZgCbCDUAbQgPADYI0v8rCLj/Hwis//wHmP/wB4P/3Qd//9YHXP/GB0j/vAcn/6gHFv+RB9n+lAe8/rQHqv61B53+qAd//qsHcP6nB1j+uQc4/s4HB/7gB/z96Afm/eYHtP3sB4j97gc6/fcHIf3oB/781Afb/LUHvPyHB6n8TgeR/BYHW/wDB1L84AYu/MsGI/zHBv/73wbZ++kGvPvpBq378gav+/EGfvvpBmf79AZf++0GSvvYBjj7rwYn+3MGDPtdBvr6YQbl+m4G4fpqBsf6XQaj+lcGefpKBmL6KAZJ+h4GQvoJBij6+wUP+t8F6/mmBbf5gwWZ+V0Fg/kpBW/5EAVt+QkFX/nrBGb50gRd+ZwEZvl9BGD5aQRj+TUET/kKBEf57AM0+dUDM/nAA0X5rwNG+ZkDXPmXA1X5kANj+ZEDgPmAA6H5kAOr+Y8D0fluAwD6VQMq+lUDKvoxA2v6DAOR+vkCtfrtAub64QIK+9ACV/vPApP7yQKu+7UCw/ucAuz7gQIo/HYCSPxOAnn8SwKf/EYCvvxNAur8XgIY/WECLv1xAlv9fQJv/ZoCkP2qAqb9rwLL/awC5/2dAvn9kAIY/oQCNv6GAkD+lgJU/ocChP58Aqb+YwLF/mgCz/5hAt/+VAIE/ysCOf/3AWz/1gGV/7gByP+5Adn/xAHp/9ABDQDbATIA0QE6AOIBcgDqAZoA1gG7AL8BwwC1AdoAqQHhAKkB7wB1Ad0AYgHfAE8B1AAnAdUADAH0APwAGQHYADoBswA5AYcAOQFdADMBNQAoAef/CwHL//oAnv/sAHH/+gBa//kAOP8DARj/AgHc/voAuv7rAIj+2QB+/toAcf7aAD7+8gAQ/hgB5v0zAcT9UwG3/VcBk/1rAXn9hgFw/ZgBav29AVT92wFA/e4BNP31ASf9/wEh/RUCGv0gAgz9KALx/D0C3PxAAtD8TgLR/FYCwfxhAr78awK2/JICvPyoAqj8zwKP/OACpfzqAr38DQPJ/CcDxPxCA9L8WgPZ/IkD0/y7A8381APS/O0DxfwEBKv8GgSt/C8Er/xGBML8VATT/G4E0Px/BOH8ogT9/MIEDv3KBBv95wQc/QIFLv0hBU/9MwVv/WYFif16Bbj9fwXf/aIF+P2vBSL+2QUV/hcGKP5CBi/+XAZP/n4Ggf6VBqb+qgbI/t0G1/78Bvz+/AYa/+cGSv/qBn7/3waU/94GxP/6Bvr/AgcZABcHSQAmB54ALwfxADMHCgEsBzkBPwdvAUAHgwE0B6UBNwfbAUwH/wFGB/0BLAcnAj8HKwI1BxICHQcSAgUHIwL5BhwCzgb8AbUGBQKZBh8CmAYrAoEGPgJ5BnkCaAaOAmwGuAJkBvoCTQYSAyEGPwMXBoUDAga6A+kF0wP2BesDDQbfAzQG7wNMBhMEYwY1BGoGeQRgBooESgadBEkGrARBBt4EOwbqBCoGLQUrBl0FHgaOBQ8GpgUHBswFFwbhBSYGDQYqBjAGIwY+BgsGSgYbBnIGDwaZBgwGsQYZBsAGKQa8BiwGygZEBtQGaQbbBnYG3AZ3Bu4GnwYHB8MGCAfEBgMH6wYPB/8G/QYWBxAHKQfyBiQHyAYwB6UGEwdaBg0HMQYoB/sFKgfvBRUHzQUPB50FKgdmBSkHSAVbByQFdgc8BZ0HHQW1B1QF5QehBecHtgUNCBUGBghRBicIjAY1CN4GNgg2BxMIfQf/B7gHBwjjBwMIHggdCCUIMggZCFQI/AdnCOAHbAjOB3wIjgemCFUHuQgqB9YITgfeCHgHCAlcBxwJpQcwCaQHOwl3BzMJTwcvCS4HHwn/BhwJ1AYKCdcG6wjvBt8IIwfhCBkH0AjiBscIngaqCIIGtAiNBswIVwbaCGAG5AiPBvUIgQYACTMGDQkwBh8JAQYZCe8F/gjIBdkIyQXMCLEFwQiiBcYIlAWJCHoFdQhoBVEIeAU0CH4FIQipBREIoAUFCGUFAghQBfMHJgXYBxYF7wcXBfkH+AT7B94E/weiBPIHxATWB6sEzgePBM4HdQToB2sE3Qd3BL8HkASoB30EnQeZBIUHsQR3B7IEWweEBGgHkgROB3MESQeGBB0HZQQdBzwEMgcpBFoHIAR7Bw0EkwfzA68H8AO9B+cDwQfmA8wHygPdB8YD9AfKAxYI0QMmCMkDLgi+AzIIsANCCJoDTAhrA14ITgNwCCEDfwj3AqQIAQOoCOoCvQjpAs4IyQLWCLoCwAirAtEIrALiCK4C4wi5AugIkQLvCGgC3QhrAsQIZQK2CHUCnQikAoMIvgJaCPUCMggcAzIIKAMnCBoDHQhHAwsIbAP8B5cD4gecA9gHkwPHB3cD3gdLA+YHNwPGB1sDswdVA5kHQAOWByUDawcQA2cHEAN3BxsDkgclA5wHEgO5BwMD0gfuAtkH3wLuB78C9wepAgsIhAIPCF0CJQgwAkYIDgJjCP4BlAjlAZoIvQGqCKUBpAiIAYwIdAGJCEYBbAjkAHoImwBqCJUATAiYAC8IaQANCCkAAwgkAPIHBQDWB/L/rgcFAJEH6f97B97/Wge4/1AHlf8qB1X/KQcm/yoHBv8YB/P+BQfb/goHyP4aB7r+NweL/j8Hd/4yB13+OQdD/jMHS/5bB0b+eQcw/n4HJP6RByj+sgc8/sQHP/7YB0r+9gdJ/gsIPv4dCDz+Lgg//lIIKv5nCHH+iwiu/oII8f6DCCf/eghQ/30Iof97CLv/mQjE//0Ikf8xCWz/Sgkf/14JGv+CCVv/jQmv/4AJn/+5Cc//owlDAMoJUgDzCX4A/QmmAAcKvwAVCusAXwowAXQKWQFyCmMBfQqNAX8KlgF0CrgBjQqtAaAKqgG8CpYB2AqVAQsLnQEYC6sBKAvXASsL6QE4CxECRwsPAi0LAQIdCwYCDgsiAgcLFQL0CgYC+griAdYK8AG9CvEBqgojAp4KIwKMClYClgpyAqQKqgKQCsICgArkAo8KMgOmCnEDtwqjA64KpwOiCtcDoQriA7cKJwTHCh0E8gofBBcLNwQ3C2YESAuOBCILtgQjC8AESgvFBGcLswRhC5MEcwuPBI8LzgSdCw0FpQtDBZwLdwWeC7AFuQt8BdELIQXNC8kEuwt3BLALWgTMCyoE3As1BA0MHQQ6DDUEWAxiBHcM1QStDPYEuAzxBM0MqwTkDFUE1gwlBLMMLASVDN0DbQx8A0EMWAP7C3wD2AurA7wLfQOEC0kDeAs2AyQLGgP1Ct0C+grBAtIKhwLQCncC/wpNAjgLJwJ/CwYCngujAWQLYQFYCxsBcQsJAacL+gAbDCgBOwysAWUMDgKYDGoC3gziAj8NNgNkDb8Dow0tBLkNfwS2DcsE4A0mBd0NgAXnDR0Gww3cBbUNEwaWDUcGpw2ZBokNIgd9Dd8HRQ0FCC0NCAgMDdEH8Qx/B+QMoAYKDXsGBA3NBt8M0waVDBQHhQw7B3kMQQeRDCIHpwxDB7kMvAeaDOYH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';
  var NG = [[13.61,13.7],[13.93,13.26],[14.16,12.61],[14.18,12.48],[14.2,12.38],[14.42,12.34],[14.58,12.22],[14.62,12.15],[14.62,11.99],[14.56,11.73],[14.57,11.53],[14.5,11.45],[14.2,11.27],[14.06,11.24],[13.89,11.14],[13.53,10.61],[13.42,10.17],[13.25,9.96],[13.24,9.81],[13.2,9.56],[13.02,9.49],[12.88,9.3],[12.83,9.02],[12.78,8.82],[12.65,8.67],[12.4,8.6],[12.23,8.28],[12.16,7.94],[12.02,7.65],[11.85,7.4],[11.77,7.27],[11.85,7.14],[11.79,7.06],[11.58,6.89],[11.55,6.7],[11.48,6.6],[11.32,6.48],[11.15,6.44],[11.08,6.51],[11.01,6.74],[10.85,6.88],[10.61,7.06],[10.56,7.04],[10.48,6.89],[10.29,6.88],[10.19,6.91],[10.14,7],[9.87,6.8],[9.78,6.76],[9.66,6.53],[9.49,6.42],[9.37,6.32],[9.06,6.01],[8.93,5.78],[8.86,5.46],[8.71,5.05],[8.58,4.83],[8.54,4.76],[8.43,4.75],[8.34,4.82],[8.24,4.91],[8.29,4.56],[7.8,4.52],[7.57,4.56],[7.52,4.65],[7.46,4.56],[7.21,4.61],[7.08,4.72],[7.17,4.61],[7.01,4.4],[6.87,4.44],[6.82,4.64],[6.77,4.72],[6.79,4.59],[6.86,4.37],[6.72,4.34],[6.62,4.38],[6.58,4.48],[6.5,4.33],[6.3,4.3],[6.26,4.33],[6.27,4.43],[6.2,4.29],[6.08,4.29],[5.91,4.39],[5.59,4.65],[5.49,4.84],[5.38,5.13],[5.45,5.13],[5.39,5.17],[5.37,5.26],[5.44,5.36],[5.53,5.43],[5.39,5.4],[5.2,5.53],[5.29,5.58],[5.46,5.61],[5.35,5.62],[5.33,5.71],[5.28,5.64],[5.11,5.64],[5.09,5.77],[4.86,6.03],[4.43,6.35],[3.49,6.41],[3.49,6.46],[3.75,6.58],[3.5,6.53],[3.34,6.4],[2.71,6.37],[2.73,6.6],[2.77,6.71],[2.73,6.85],[2.75,7.02],[2.75,7.14],[2.77,7.42],[2.78,7.48],[2.72,7.62],[2.71,7.83],[2.7,8.05],[2.7,8.37],[2.73,8.61],[2.77,9.05],[3.04,9.08],[3.15,9.32],[3.17,9.49],[3.33,9.67],[3.35,9.81],[3.48,9.85],[3.6,10.01],[3.58,10.27],[3.61,10.35],[3.68,10.43],[3.77,10.42],[3.84,10.61],[3.76,10.77],[3.74,10.97],[3.7,11.12],[3.64,11.18],[3.49,11.5],[3.59,11.7],[3.66,11.76],[3.62,11.83],[3.62,11.93],[3.63,12.06],[3.65,12.41],[3.77,12.62],[4.04,12.93],[4.15,13.46],[4.24,13.5],[4.56,13.7],[4.82,13.76],[5.1,13.74],[5.36,13.84],[5.49,13.87],[6.18,13.66],[6.3,13.66],[6.51,13.49],[6.63,13.36],[6.87,13.04],[7,13],[7.1,13.03],[7.27,13.11],[7.79,13.34],[7.95,13.32],[8.45,13.06],[8.96,12.86],[9.62,12.81],[10.05,13.21],[10.23,13.28],[10.96,13.37],[11.5,13.34],[11.99,13.19],[12.32,13.07],[12.51,13.19],[12.76,13.38],[13.05,13.53],[13.33,13.67],[13.61,13.7]];
  var RAD = Math.PI / 180;
  function vec(lat, lon) { var p = lat * RAD, l = lon * RAD; return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)]; }
  var raw = atob(LAND), rings = [], ri = 0;
  function i16(k) { var v = raw.charCodeAt(k * 2) | (raw.charCodeAt(k * 2 + 1) << 8); return v > 32767 ? v - 65536 : v; }
  while (ri * 2 < raw.length) { var cnt = i16(ri++), ring = []; for (var q = 0; q < cnt; q++) { ring.push(vec(i16(ri + 1) / 50, i16(ri) / 50)); ri += 2; } rings.push(ring); }
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
  /* cities whose companies hire remote professionals worldwide: each lights up as the turning globe brings it round */
  var SPOTS = [['You · Nigeria', 6.5, 3.4, 1], ['London', 51.5, -0.1], ['Dublin', 53.3, -6.3], ['Lisbon', 38.7, -9.1], ['Paris', 48.9, 2.4], ['Amsterdam', 52.4, 4.9],
    ['Berlin', 52.5, 13.4], ['Stockholm', 59.3, 18.1], ['Tallinn', 59.4, 24.8], ['Cape Town', -33.9, 18.4], ['Johannesburg', -26.2, 28], ['Nairobi', -1.3, 36.8],
    ['Tel Aviv', 32.1, 34.8], ['Dubai', 25.2, 55.3], ['Bengaluru', 12.97, 77.6], ['Singapore', 1.35, 103.8], ['Tokyo', 35.7, 139.7], ['Sydney', -33.9, 151.2],
    ['Auckland', -36.8, 174.8], ['San Francisco', 37.8, -122.4], ['Seattle', 47.6, -122.3], ['Austin', 30.3, -97.7], ['Toronto', 43.7, -79.4], ['New York', 40.7, -74],
    ['Mexico City', 19.4, -99.1], ['Bogotá', 4.7, -74.1], ['São Paulo', -23.5, -46.6], ['Buenos Aires', -34.6, -58.4]]
    .map(function (t) { return { n: t[0], v: vec(t[1], t[2]), home: !!t[3], on: false, t0: 0 }; });

  var cv = document.createElement('canvas'); cv.id = 'erjWorld'; cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
  body.insertBefore(cv, body.firstChild);
  /* the globe is the page's light now: the old hero glow would lay a pale band across it */
  var st = document.createElement('style'); st.textContent = '.erj-aurora{display:none!important}'; document.head.appendChild(st);
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
    var o = { lat: s.lat, lon: s.lon, zoom: narrow && s.mzoom != null ? s.mzoom : s.zoom, x: narrow && s.mx != null ? s.mx : s.x, y: narrow && s.my != null ? s.my : s.y, a: narrow && s.ma != null ? s.ma : s.a, arcs: s.arcs || 0, ng: s.ng || 0, spin: s.spin || 0, towns: s.towns || 0, turn: s.turn || 0, spots: s.spots || 0 };
    if (s.anchor) { var el = document.querySelector(s.anchor); if (el) { var r = el.getBoundingClientRect(); if (r.width > 40) { o.x = (r.left + r.width / 2) / VW; o.y = (r.top + r.height / 2) / VH; o.zoom = Math.min(r.width, r.height) * .45 / BASE; } } }
    return o;
  }
  var KEYS = ['lat', 'lon', 'zoom', 'x', 'y', 'a', 'arcs', 'ng', 'spin', 'towns', 'turn', 'spots'];
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
  var cam = null, tgt = null, swayT = 0, worldT = 0, turnLon = 0, spotT = 0, lastDraw = 0, lastNow = 0, raf = 0, running = false;
  var R, CX, CY, fx, fy, fz, rx, ry, ux, uy, uz;
  function setCam(c) {
    var p = c.lat * RAD, l = (c.lon + sway() * c.spin + turnLon) * RAD;
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
    // ocean, with a soft glow round the edge
    var whole = R > far;
    var sea = ctx.createRadialGradient(CX - R * .3, CY - R * .35, R * .05, CX, CY, R);
    if (D) { sea.addColorStop(0, '#FBFAF8'); sea.addColorStop(1, '#ECE9E4'); } else { sea.addColorStop(0, '#17181D'); sea.addColorStop(1, '#07080A'); }
    if (!whole) {
      var halo = ctx.createRadialGradient(CX, CY, R * .97, CX, CY, R * 1.14);
      halo.addColorStop(0, D ? 'rgba(232,71,15,.26)' : 'rgba(255,87,34,.40)'); halo.addColorStop(1, 'rgba(255,87,34,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(CX, CY, R * 1.14, 0, 7); ctx.fill();
    }
    ctx.save();
    if (!whole) { ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.clip(); }
    ctx.fillStyle = sea; ctx.fillRect(0, 0, cw, ch);
    // land: smooth grey shapes; anything over the horizon is tucked onto the edge
    var lg = ctx.createRadialGradient(CX - R * .3, CY - R * .35, R * .05, CX, CY, R);
    if (D) { lg.addColorStop(0, '#DAD6D0'); lg.addColorStop(1, '#C4BFB8'); } else { lg.addColorStop(0, '#4A4C57'); lg.addColorStop(1, '#2A2C34'); }
    ctx.fillStyle = lg; ctx.beginPath();
    for (var i = 0, n = rings.length; i < n; i++) {
      var rg = rings[i], seen = false, pts = [];
      for (var j = 0, m = rg.length; j < m; j++) {
        var v = rg[j], z = v[0] * fx + v[1] * fy + v[2] * fz, x = v[0] * rx + v[1] * ry, y = v[0] * ux + v[1] * uy + v[2] * uz;
        if (z > 0) seen = true; else { var h = Math.sqrt(x * x + y * y) || 1; x /= h; y /= h; }
        pts.push(CX + R * x, CY - R * y);
      }
      if (!seen) continue;
      ctx.moveTo(pts[0], pts[1]); for (var k = 2; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]); ctx.closePath();
    }
    ctx.fill();
    ctx.strokeStyle = D ? 'rgba(120,112,102,.35)' : 'rgba(255,255,255,.16)'; ctx.lineWidth = 1 * S; ctx.lineJoin = 'round'; ctx.stroke();
    if (!whole) { // roundness: a little shade toward the far edge
      var sh = ctx.createRadialGradient(CX - R * .25, CY - R * .3, R * .45, CX, CY, R);
      sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, D ? 'rgba(60,50,40,.14)' : 'rgba(0,0,0,.55)');
      ctx.fillStyle = sh; ctx.fillRect(CX - R, CY - R, R * 2, R * 2);
    }
    ctx.restore();
    if (!whole) { ctx.strokeStyle = D ? 'rgba(232,71,15,.45)' : 'rgba(255,138,61,.6)'; ctx.lineWidth = 1.2 * S; ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.stroke(); }
    // Nigeria, lit, once you are close enough to see it
    if (c.ng > .02) {
      ctx.save(); ctx.beginPath();
      for (var j = 0; j < ngv.length; j++) { var q = proj(ngv[j]); j ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }
      ctx.closePath(); ctx.globalAlpha = c.a * c.ng * .28; ctx.fillStyle = ORANGE; ctx.fill();
      ctx.globalAlpha = Math.min(1, c.a * 1.5) * c.ng; ctx.strokeStyle = ORANGE; ctx.lineWidth = 1.6 * S; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
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
    if (c.spots > .02) {
      var sa = Math.min(1, c.a * 1.4) * c.spots;
      SPOTS.forEach(function (sp) {
        var p = proj(sp.v);
        if (still) { sp.on = p.z > .12; sp.t0 = -9; }
        else if (!sp.on && p.z > .4) { sp.on = true; sp.t0 = spotT; }
        else if (sp.on && p.z < -.45) sp.on = false;
        if (!sp.on || p.z <= .02) return;
        var age = spotT - sp.t0, edge = smooth(p.z / .3), col = sp.home ? GREEN : ORANGE, a = sa * edge;
        ctx.save();
        if (age < 1.6) { // the spotlight: a soft pool of light and one ring, as it comes on
          var k = age / 1.6, pool = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 34 * S);
          pool.addColorStop(0, sp.home ? 'rgba(25,194,122,.5)' : 'rgba(255,138,61,.55)'); pool.addColorStop(1, 'rgba(255,138,61,0)');
          ctx.globalAlpha = a * (1 - k); ctx.fillStyle = pool; ctx.beginPath(); ctx.arc(p.x, p.y, 34 * S, 0, 7); ctx.fill();
          ctx.strokeStyle = col; ctx.lineWidth = 1.6 * S; ctx.beginPath(); ctx.arc(p.x, p.y, (4 + k * 20) * S, 0, 7); ctx.stroke();
        }
        var breathe = still ? 1 : .82 + .18 * Math.sin(t * 1.7 + sp.v[1] * 9);
        ctx.globalAlpha = a * .3 * breathe; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, p.y, 7.5 * S, 0, 7); ctx.fill();
        ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, (sp.home ? 4.2 : 3.2) * S, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.2 * S, 0, 7); ctx.fill();
        ctx.restore();
        if (age >= 0 && age < 2.6 && c.spots > .6) chip(p, sp.n, col, a * (age < 2 ? 1 : 1 - (age - 2) / .6));
      });
    }
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
      if (cam.turn > .05) { turnLon += dt * cam.turn; spotT += dt; live = true; } // a slow, steady turn
      else if (turnLon) { var home360 = Math.round(turnLon / 360) * 360; turnLon += (home360 - turnLon) * (1 - Math.pow(.0009, dt)); if (Math.abs(home360 - turnLon) < .05) turnLon = 0; else live = true; }
    }
    /* phones: while the only motion is the slow turn, draw about 24 times a second */
    if (!(narrow && live && cam.turn > .05 && near(cam, tgt) && now - lastDraw < 40)) { lastDraw = now; draw(now); hud(); }
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
    readout.textContent = km.toLocaleString('en-GB') + ' km up · ' + Math.abs(cam.lat).toFixed(1) + '°' + (cam.lat >= 0 ? 'N' : 'S') + ' ' + Math.abs(((cam.lon + sway() * cam.spin + turnLon + 540) % 360) - 180).toFixed(1) + '°' + ((((cam.lon + sway() * cam.spin + turnLon + 540) % 360) - 180) >= 0 ? 'E' : 'W');
  }
  size(); measure(); buildHud(); kick();
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { size(); measure(); cam = null; kick(); });
  window.addEventListener('load', function () { measure(); kick(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
  if (window.MutationObserver) new MutationObserver(kick).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})();
