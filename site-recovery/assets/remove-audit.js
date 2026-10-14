(function () {
  const auditPaths = new Set(['/audit', '/audit/', '/audit.html']);
  if (auditPaths.has(location.pathname)) {
    location.replace('/contact');
    return;
  }

  const style = document.createElement('style');
  style.textContent = 'section.audit{display:none!important}.contact-grid.kg-audit-removed{grid-template-columns:repeat(2,minmax(0,1fr))}@media(max-width:1000px){.contact-grid.kg-audit-removed{grid-template-columns:1fr}}';
  document.head.appendChild(style);

  function cleanAuditLinks() {
    document.querySelectorAll('section.audit, #business-presence-audit').forEach((section) => section.remove());

    document.querySelectorAll('a[href="/audit"], a[href="/audit/"], a[href="/audit.html"]').forEach((link) => {
      if (link.closest('nav, footer')) {
        link.remove();
        return;
      }

      const card = link.closest('.contact-grid > a');
      if (card) {
        const grid = card.parentElement;
        card.remove();
        grid.classList.add('kg-audit-removed');
        return;
      }

      link.href = '/contact';
      if (/audit|assessment/i.test(link.textContent || '')) link.textContent = 'Discuss your project →';
    });
  }

  let attempts = 0;
  const timer = setInterval(() => {
    cleanAuditLinks();
    if (++attempts > 30) clearInterval(timer);
  }, 150);
})();
