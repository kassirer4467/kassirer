/* Contact form: checks the fields, then the browser posts the form to FormSubmit (free service),
   which emails it to the address in the form's "action" and sends the visitor back to this page
   with ?sent=1 so a success message can be shown. */
(function () {
  'use strict';
  var form = document.getElementById('contact-form');
  if (!form) return;
  var statusEl = document.getElementById('form-status');
  var btn = form.querySelector('.send-btn');
  var btnText = btn.textContent;
  var mail = decodeURIComponent(form.action.split('formsubmit.co/')[1] || '');

  function say(text, cls) { statusEl.textContent = text; statusEl.className = 'form-status ' + (cls || ''); }
  function reset() { btn.disabled = false; btn.textContent = btnText; }
  function invalidLabels() {
    return Array.prototype.filter.call(form.elements, function (el) { return el.willValidate && !el.validity.valid; })
      .map(function (el) { var l = el.closest('label'); return l ? l.querySelector('span').textContent.replace('*', '') : el.name; });
  }

  // Back from FormSubmit after a send
  if (/[?&]sent=1/.test(location.search)) {
    say('Your details were sent successfully!', 'is-ok');
    if (window.history && history.replaceState) history.replaceState(null, '', location.pathname);
  }
  // If the visitor comes back with the browser's Back button, don't leave the button stuck on "Sending…"
  window.addEventListener('pageshow', reset);

  form.addEventListener('submit', function (e) {
    if (location.protocol === 'file:') {
      e.preventDefault();
      say('The form only works on the live website, not when this page is opened from a file.', 'is-error');
      return;
    }
    if (!form.checkValidity()) {
      e.preventDefault();
      say('Please check: ' + invalidLabels().join(', ') + '. (Phone: digits, +, - and spaces only.)', 'is-error');
      form.reportValidity();
      return;
    }
    if (form.elements._honey && form.elements._honey.value) {          // spam trap (never sent)
      e.preventDefault();
      form.elements._honey.value = '';
      say('The spam check stopped this message. Please press Send again, or email ' + mail + ' directly.', 'is-error');
      return;
    }
    form.elements._next.value = location.origin + location.pathname + '?sent=1';   // where FormSubmit sends the visitor back
    say('Sending…');
    setTimeout(function () { btn.disabled = true; btn.textContent = 'Sending…'; }, 0);
    // no preventDefault: the browser now posts the form to FormSubmit
  });
})();
