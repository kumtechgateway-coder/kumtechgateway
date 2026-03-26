const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');
const pricingDataPath = path.join(repoRoot, 'assets', 'data', 'pricing-data.js');
const outputDir = path.join(repoRoot, 'output', 'pdf');
const outputPath = path.join(outputDir, 'pricing-plans-explained.pdf');

function loadPricingData() {
  const source = fs.readFileSync(pricingDataPath, 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.window.pricingData;
}

function escapePdfText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function estimateTextWidth(text, fontSize) {
  return text.length * fontSize * 0.52;
}

function wrapText(text, fontSize, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (estimateTextWidth(candidate, fontSize) <= maxWidth) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function addWrappedParagraph(blocks, text, options = {}) {
  const {
    font = 'F1',
    size = 11,
    leading = 15,
    indent = 0,
    bullet = '',
    gapAfter = 5,
    width = 504
  } = options;

  const lines = wrapText(text, size, width - indent);
  lines.forEach((line, index) => {
    const prefix = bullet && index === 0 ? `${bullet} ` : bullet ? '  ' : '';
    blocks.push({ type: 'text', font, size, leading, indent, text: `${prefix}${line}` });
  });
  blocks.push({ type: 'gap', value: gapAfter });
}

function buildBlocks(pricingData) {
  const brandingService = pricingData.services.find((service) => service.id === 'branding');
  const today = new Date().toISOString().slice(0, 10);
  const blocks = [];

  blocks.push({ type: 'text', font: 'F2', size: 22, leading: 28, text: 'How Kumtech Gateway Pricing Plans Are Made' });
  blocks.push({ type: 'gap', value: 4 });
  blocks.push({ type: 'text', font: 'F1', size: 10, leading: 14, text: `Generated from live project data on ${today}` });
  blocks.push({ type: 'gap', value: 12 });

  blocks.push({ type: 'text', font: 'F2', size: 15, leading: 20, text: '1. Overview' });
  addWrappedParagraph(
    blocks,
    'Pricing is data-driven. The plans are defined in assets/data/pricing-data.js, then rendered into the pricing page and selected service pages by shared JavaScript in assets/js/app.js.',
    { width: 500 }
  );

  blocks.push({ type: 'text', font: 'F2', size: 15, leading: 20, text: '2. Main Source Of Truth' });
  addWrappedParagraph(
    blocks,
    'Each service lives inside window.pricingData.services. That means prices, labels, package notes, CTA text, and plan details can be edited in one file without manually rewriting every page.',
    { width: 500 }
  );
  addWrappedParagraph(blocks, 'Important file: assets/data/pricing-data.js', { font: 'F3', size: 10, leading: 14, width: 500 });

  blocks.push({ type: 'text', font: 'F2', size: 15, leading: 20, text: '3. Service Structure' });
  [
    'id: used to match a service block on a page, for example branding.',
    'startingPrice and pricingNote: used for high-level service summaries.',
    'plans: each package under the service, such as Logo Starter or Brand Identity Kit.',
    'highlights: short value tags used in pricing summaries and previews.'
  ].forEach((item) => addWrappedParagraph(blocks, item, { bullet: '-', width: 496 }));

  blocks.push({ type: 'text', font: 'F2', size: 15, leading: 20, text: '4. Plan Structure' });
  [
    'name and price: the visible package label and amount.',
    'period: one-time, monthly, starting from, or tailored.',
    'description: used in the full pricing cards on pricing.html.',
    'servicePageNote: a shorter explanation used on the branding service page starting-points card.',
    'badge, tone, featured, ctaLabel, ctaHref, and features: shape the appearance and call to action.'
  ].forEach((item) => addWrappedParagraph(blocks, item, { bullet: '-', width: 496 }));

  blocks.push({ type: 'text', font: 'F2', size: 15, leading: 20, text: '5. How The Pages Are Built' });
  addWrappedParagraph(
    blocks,
    'The shared renderer in assets/js/app.js uses initPricingSections(), renderPricingServiceSection(), and renderPricingPlan() to build the main pricing page from the data object.',
    { width: 500 }
  );
  addWrappedParagraph(
    blocks,
    'For branding-services.html, the page now uses data-service-starting-points=\"branding\". The helper initServiceStartingPointCards() finds the branding service, reads its plans, and injects the package rows dynamically.',
    { width: 500 }
  );
  addWrappedParagraph(blocks, 'Important file: assets/js/app.js', { font: 'F3', size: 10, leading: 14, width: 500 });

  blocks.push({ type: 'text', font: 'F2', size: 15, leading: 20, text: '6. Current Branding Plans' });
  if (brandingService) {
    brandingService.plans.forEach((plan) => {
      const note = plan.servicePageNote || plan.description || '';
      addWrappedParagraph(blocks, `${plan.name} - ${plan.price}${plan.period === 'monthly' ? ' / month' : ''}`, { bullet: '-', width: 496 });
      addWrappedParagraph(blocks, note, { indent: 16, width: 480, size: 10, leading: 14, gapAfter: 4 });
    });
  }

  blocks.push({ type: 'text', font: 'F2', size: 15, leading: 20, text: '7. Editing Workflow' });
  [
    'Open assets/data/pricing-data.js.',
    'Edit the branding service plans, especially price, period, and servicePageNote.',
    'Save the file and reload the page.',
    'The branding page and the main pricing page will reflect the same source data.'
  ].forEach((item, index) => addWrappedParagraph(blocks, `${index + 1}. ${item}`, { width: 496 }));

  blocks.push({ type: 'text', font: 'F2', size: 15, leading: 20, text: '8. Practical Rule' });
  addWrappedParagraph(
    blocks,
    'If you want easier edits, change the data first and let the page renderer do the rest. Avoid hardcoding prices directly into service-page HTML unless the value is intentionally unique to that page.',
    { width: 500 }
  );

  return blocks;
}

function paginateBlocks(blocks) {
  const pages = [];
  const pageHeight = 792;
  const top = 738;
  const bottom = 66;
  let page = [];
  let y = top;

  blocks.forEach((block) => {
    if (block.type === 'gap') {
      y -= block.value;
      return;
    }

    if (y - block.leading < bottom) {
      pages.push(page);
      page = [];
      y = top;
    }

    page.push({ ...block, y });
    y -= block.leading;
  });

  if (page.length) {
    pages.push(page);
  }

  return pages;
}

function buildPdf(pages) {
  const objects = [];

  function addObject(body) {
    objects.push(body);
    return objects.length;
  }

  const catalogId = addObject('<< /Type /Catalog /Pages 2 0 R >>');
  const pagesPlaceholderId = addObject('');
  const font1Id = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const font2Id = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const font3Id = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');

  const pageIds = [];

  pages.forEach((entries, pageIndex) => {
    const streamLines = [
      '0.18 0.23 0.34 rg',
      '54 760 504 1 re f',
      '0.95 0.97 0.99 rg',
      '54 54 504 684 re S',
      '0 0 0 rg'
    ];

    entries.forEach((entry) => {
      const x = 54 + (entry.indent || 0);
      streamLines.push(`BT /${entry.font} ${entry.size} Tf 1 0 0 1 ${x} ${entry.y} Tm (${escapePdfText(entry.text)}) Tj ET`);
    });

    streamLines.push(`BT /F1 9 Tf 1 0 0 1 54 34 Tm (Page ${pageIndex + 1} of ${pages.length}) Tj ET`);

    const stream = streamLines.join('\n');
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${font1Id} 0 R /F2 ${font2Id} 0 R /F3 ${font3Id} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  });

  objects[pagesPlaceholderId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  objects[catalogId - 1] = '<< /Type /Catalog /Pages 2 0 R >>';

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function main() {
  const pricingData = loadPricingData();
  const blocks = buildBlocks(pricingData);
  const pages = paginateBlocks(blocks);
  const pdf = buildPdf(pages);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, pdf, 'binary');

  console.log(`Created ${outputPath}`);
}

main();
