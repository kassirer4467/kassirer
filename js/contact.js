/* Contact form: sends the message through FormSubmit (free service, no account needed)
   without leaving the page. The address it sends to is the form's own "action" in contact.html. */
(function () {
  'use strict';
  var form = document.getElementById('contact-form');
  if (!form) return;
  var statusEl = document.getElementById('form-status');
  var btn = form.querySelector('.send-btn');
  var btnText = btn.textContent;
  var mail = decodeURIComponent(form.action.split('formsubmit.co/')[1] || '');

  function say(text, cls) { statusEl.textContent = text; statusEl.className = 'form-status ' + (cls || ''); }
  function done() { btn.disabled = false; btn.textContent = btnText; }
  function fail(extra) {
    done();
    say('Sorry, the message could not be sent' + (extra ? ' (' + extra + ')' : '') + '. Please email ' + mail + ' directly.', 'is-error');
  }
  function invalidLabels() {
    return Array.prototype.filter.call(form.elements, function (el) { return el.willValidate && !el.validity.valid; })
      .map(function (el) { var l = el.closest('label'); return l ? l.querySelector('span').textContent.replace('*', '') : el.name; });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (location.protocol === 'file:') { say('The form only works on the live website, not when this page is opened from a file.', 'is-error'); return; }
    if (!form.checkValidity()) {
      say('Please check: ' + invalidLabels().join(', ') + '. (Phone: digits, +, - and spaces only.)', 'is-error');
      form.reportValidity();
      return;
    }
    if (form.elements._honey && form.elements._honey.value) { fail(); return; }   // spam trap (never sent)

    var body = new URLSearchParams(new FormData(form));
    body.delete('_honey');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    say('Sending…');

    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
    fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: body,
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) { return r.json().then(function (d) { return d || {}; }, function () { return {}; }); })
      .then(function (d) {
        clearTimeout(timer);
        if (d.success === true || d.success === 'true') {
          form.reset();
          done();
          say('Your details were sent successfully!', 'is-ok');
        } else {
          fail(d.message ? String(d.message).slice(0, 160) : '');
        }
      })
      .catch(function () { clearTimeout(timer); fail(); });
  });
})();
