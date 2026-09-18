/* PADANG · newsletter.js — captura de e-mail (form.nl-form)
 * Tier 1: send-newsletter.php (PHP na HostGator) · Tier 2: FormSubmit (mesmo inbox).
 * Idioma capturado de <html lang> (URL do idioma). Dispara gtag newsletter_signup {lang, page}.
 */
(function () {
  'use strict';
  var MSG = {
    pt: { sending: '// enviando…', ok: '✓ pronto. você vai saber dos próximos lançamentos antes de todo mundo.', bad: '✗ confira o e-mail.', err: '✗ não deu para enviar agora. tente de novo em instantes.' },
    en: { sending: '// sending…', ok: '✓ done. you will hear about new releases first.', bad: '✗ check your email address.', err: '✗ could not send right now. please try again in a moment.' },
    es: { sending: '// enviando…', ok: '✓ listo. te enterarás de los nuevos lanzamientos antes que nadie.', bad: '✗ revisa tu e-mail.', err: '✗ no se pudo enviar ahora. inténtalo de nuevo en un momento.' },
    de: { sending: '// wird gesendet…', ok: '✓ fertig. von neuen Releases erfährst du zuerst.', bad: '✗ bitte E-Mail-Adresse prüfen.', err: '✗ senden gerade nicht möglich. bitte gleich noch einmal versuchen.' },
    fr: { sending: '// envoi…', ok: '✓ c\'est fait. vous saurez tout des nouvelles sorties en premier.', bad: '✗ vérifiez votre e-mail.', err: '✗ envoi impossible pour le moment. réessayez dans un instant.' },
    ja: { sending: '// 送信中…', ok: '✓ 登録しました。新作情報をいち早くお届けします。', bad: '✗ メールアドレスを確認してください。', err: '✗ ただいま送信できません。しばらくしてから再度お試しください。' }
  };
  function lang() { return (document.documentElement.getAttribute('lang') || 'pt').slice(0, 2).toLowerCase(); }
  function msg(k) { return (MSG[lang()] || MSG.en)[k]; }

  function bind(form) {
    var box = form.closest('.nl-box') || form.parentNode;
    var status = box.querySelector('.nl-status');
    var btn = form.querySelector('button[type="submit"]');
    function set(kind, text) { if (status) { status.className = 'nl-status ' + kind; status.textContent = text; } }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var p = {
        email: (form.elements.email.value || '').trim(),
        name: (form.elements.name.value || '').trim(),
        website: form.elements.website ? form.elements.website.value : '',
        lang: lang(),
        page: location.pathname
      };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) { set('err', msg('bad')); form.elements.email.focus(); return; }
      btn.disabled = true;
      set('loading', msg('sending'));

      function success() {
        if (typeof window.gtag === 'function') window.gtag('event', 'newsletter_signup', { lang: p.lang, page: p.page });
        set('ok', msg('ok'));
        form.reset();
        btn.disabled = false;
      }
      function fail() { set('err', msg('err')); btn.disabled = false; }

      // Tier 2 — FormSubmit (hospedagem sem PHP ou PHP fora do ar)
      async function viaFormSubmit() {
        if (p.website) { success(); return; } // honeypot: sucesso falso para bots
        var res = await fetch('https://formsubmit.co/ajax/contact@padangrecords.net', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: '[newsletter] ' + p.lang + ' ' + p.email,
            _template: 'table',
            _captcha: 'false',
            email: p.email, name: p.name || '—', lang: p.lang, page: p.page
          })
        });
        var d = await res.json().catch(function () { return {}; });
        if (res.ok && (d.success === true || d.success === 'true')) success(); else fail();
      }

      try {
        // Tier 1 — send-newsletter.php
        var res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(p)
        });
        var d = await res.json().catch(function () { return {}; });
        if (res.ok && d.ok) success();
        else if (res.status === 422) { set('err', msg('bad')); btn.disabled = false; form.elements.email.focus(); }
        else await viaFormSubmit().catch(fail);
      } catch (err) {
        try { await viaFormSubmit(); } catch (e2) { fail(); }
      }
    });
  }

  function init() { document.querySelectorAll('form.nl-form').forEach(bind); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
