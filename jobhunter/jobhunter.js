/* The Job Hunter: each plan button opens WhatsApp with the intake message
   from ERJ_CONFIG.messages (jobHunter / jobHunterAsk). Without the config the
   buttons still open WhatsApp on the official line. */
(function () {
  'use strict';
  function wire() {
    var cfg = window.ERJ_CONFIG || {}, msgs = cfg.messages || {};
    var line = (cfg.canon && cfg.canon.lines && cfg.canon.lines.official) || '2348032925957';
    line = String(line).replace(/\D/g, '');
    var wa = function (t) { return 'https://wa.me/' + line + '?text=' + encodeURIComponent(t); };
    [].forEach.call(document.querySelectorAll('[data-jh-plan]'), function (a) {
      if (msgs.jobHunter) a.href = wa(msgs.jobHunter.replace('{plan}', a.getAttribute('data-jh-plan')));
    });
    [].forEach.call(document.querySelectorAll('[data-jh-ask]'), function (a) {
      if (msgs.jobHunterAsk) a.href = wa(msgs.jobHunterAsk);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();
  window.addEventListener('load', wire);
})();
