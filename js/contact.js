/* Contact form: sends the message through FormSubmit (free service, no account needed)
   without leaving the page. The address it sends to is the form's own "action" in contact.html. */
(function () {
  'use strict';
  var form = document.getElementById('contact-form');
  if (!form) return;
  var statusEl = document.getElementById('form-status');
  var btn = form.querySelector('.send-btn');
  var mail = form.action.split('formsubmit.co/')[1] || '';

  function say(text, cls) { statusEl.textContent = text; statusEl.className = 'form-status ' + (cls || ''); }
  function fail() {
    btn.disabled = false;
    say('Sorry, the message could not be sent. Please email ' + decodeURIComponent(mail) + ' directly.', 'is-error');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (form.elements._honey && form.elements._honey.value) return;   // spam trap
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    btn.disabled = true;
    say('Sending…');
    fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }, function () { return { ok: r.ok, d: {} }; }); })
      .then(function (res) {
        if (res.ok && (res.d.success === true || res.d.success === 'true')) {
          form.reset();
          btn.disabled = false;
          say('Your details were sent successfully!', 'is-ok');
        } else { fail(); }
      })
      .catch(fail);
  });
})();
