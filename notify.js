/* =============================================================
   ABHUSHAN — Notification relay · Web3Forms (email delivery)
   Key is live. If Web3Forms is unreachable, everything falls
   back to localStorage + WhatsApp — the user is never blocked.
   ============================================================= */
(function () {
  'use strict';
  var CONFIG = {
    KEY: '10c7b958-4d2a-411b-ab73-fb254ad36c34',
    WHATSAPP_NUMBER: '919979787087', // digits only, no +
    ENDPOINT: 'https://api.web3forms.com/submit'
  };
  function send(subject, fields, replyTo) {
    var payload = Object.assign({
      access_key: CONFIG.KEY,
      subject: subject,
      from_name: 'Abhushan Website',
      botcheck: ''
    }, fields);
    if (replyTo) payload.replyto = replyTo;
    return fetch(CONFIG.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); }).catch(function () { return { ok: false }; });
  }
  function whatsappLink(text) {
    return 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  }
  window.AbhushanNotify = { send: send, whatsappLink: whatsappLink, CONFIG: CONFIG };
})();
