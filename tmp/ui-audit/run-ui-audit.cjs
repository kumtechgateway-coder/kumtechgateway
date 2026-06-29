const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const ROOT_URL = process.env.UI_AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const EDGE_PATH = process.env.UI_AUDIT_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUTPUT_DIR = path.resolve(__dirname, 'artifacts');
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, 'screenshots');
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const pages = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about.html' },
  { name: 'services', path: '/services.html' },
  { name: 'pricing', path: '/pricing.html' },
  { name: 'portfolio', path: '/portfolio.html' },
  { name: 'blog', path: '/blog.html' },
  { name: 'branding-services', path: '/branding-services.html' },
  { name: 'web-design-services', path: '/web-design-services.html' },
  { name: 'seo-services', path: '/seo-services.html' },
  { name: 'ads-management-services', path: '/ads-management-services.html' },
  { name: 'google-business-services', path: '/google-business-services.html' },
  { name: 'gallery', path: '/gallery.html' }
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }
];

const screenshotTargets = new Set([
  'home:desktop',
  'home:mobile',
  'services:desktop',
  'services:mobile',
  'pricing:desktop',
  'pricing:mobile'
]);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function shortText(value, limit = 220) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

async function runAccessibilityAudit(page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const result = await axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });

    return {
      violations: result.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        nodes: violation.nodes.slice(0, 5).map((node) => ({
          target: node.target,
          failureSummary: node.failureSummary
        }))
      }))
    };
  });
}

async function collectPageState(page) {
  return page.evaluate(() => {
    const images = Array.from(document.images);
    const brokenImages = images
      .filter((img) => img.currentSrc && img.naturalWidth === 0)
      .map((img) => ({
        src: img.currentSrc,
        alt: img.alt || ''
      }));

    const unlabeledButtons = Array.from(document.querySelectorAll('button'))
      .filter((button) => {
        const label = (button.getAttribute('aria-label') || button.textContent || '').trim();
        return !label;
      })
      .slice(0, 10)
      .map((button) => shortText(button.outerHTML || button.textContent || '', 160));

    return {
      title: document.title,
      h1Count: document.querySelectorAll('h1').length,
      h1Text: document.querySelector('h1')?.textContent?.trim() || '',
      navLoaded: Boolean(document.querySelector('#navbar')),
      footerLoaded: Boolean(document.querySelector('footer')),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      brokenImages,
      unlabeledButtons
    };

    function shortText(value, limit) {
      return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
    }
  });
}

async function runInteractions(page, pageName, viewportName) {
  const results = {};

  if (viewportName === 'mobile') {
    const menuToggle = page.locator('#menuToggle');
    if (await menuToggle.count()) {
      await menuToggle.click();
      await page.waitForTimeout(300);
      results.mobileMenuExpanded = await menuToggle.getAttribute('aria-expanded');
      await menuToggle.click();
      await page.waitForTimeout(300);
      results.mobileMenuCollapsed = await menuToggle.getAttribute('aria-expanded');
    }
  }

  const backToTop = page.locator('#backToTop');
  if (await backToTop.count()) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(700);
    results.backToTopVisible = await backToTop.evaluate((node) => {
      const style = window.getComputedStyle(node);
      return !node.classList.contains('invisible') && style.opacity !== '0';
    });
  }

  if (pageName === 'pricing') {
    const summary = page.locator('details summary').first();
    if (await summary.count()) {
      await summary.click();
      await page.waitForTimeout(300);
      results.pricingFaqOpened = await page.locator('details').first().evaluate((node) => node.hasAttribute('open'));
    }
  }

  if (viewportName === 'mobile') {
    const whatsapp = page.locator('#whatsapp-container');
    if (await whatsapp.count()) {
      await page.evaluate(() => window.scrollTo(0, 900));
      await page.waitForTimeout(1200);
      results.whatsAppVisible = await whatsapp.evaluate((node) => {
        const style = window.getComputedStyle(node);
        return !node.classList.contains('invisible') && style.opacity !== '0';
      });
    }
  }

  return results;
}

async function auditSinglePage(browser, pageConfig, viewport) {
  const context = await browser.newContext({
    viewport: {
      width: viewport.width,
      height: viewport.height
    },
    isMobile: Boolean(viewport.isMobile),
    deviceScaleFactor: viewport.deviceScaleFactor || 1
  });

  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(shortText(msg.text(), 600));
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(shortText(error.message || String(error), 600));
  });

  page.on('requestfailed', (request) => {
    requestFailures.push({
      url: request.url(),
      failure: request.failure()?.errorText || 'request failed'
    });
  });

  const result = {
    page: pageConfig.name,
    path: pageConfig.path,
    viewport: viewport.name,
    url: `${ROOT_URL}${pageConfig.path}`,
    ok: false
  };

  try {
    const response = await page.goto(result.url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    result.status = response?.status() ?? null;

    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1200);

    if (await page.locator('#navbar').count()) {
      await page.waitForTimeout(300);
    }

    Object.assign(result, await collectPageState(page));
    result.interactions = await runInteractions(page, pageConfig.name, viewport.name);

    if (viewport.name === 'desktop') {
      result.accessibility = await runAccessibilityAudit(page);
    }

    if (screenshotTargets.has(`${pageConfig.name}:${viewport.name}`)) {
      ensureDir(SCREENSHOT_DIR);
      const screenshotPath = path.join(SCREENSHOT_DIR, `${pageConfig.name}-${viewport.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshot = screenshotPath;
    }

    result.consoleErrors = consoleErrors;
    result.pageErrors = pageErrors;
    result.requestFailures = requestFailures;
    result.ok = true;
  } catch (error) {
    result.error = shortText(error.message || String(error), 1000);
    result.consoleErrors = consoleErrors;
    result.pageErrors = pageErrors;
    result.requestFailures = requestFailures;
  } finally {
    await context.close();
  }

  return result;
}

async function main() {
  ensureDir(OUTPUT_DIR);

  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--disable-gpu', '--no-first-run', '--no-default-browser-check']
  });

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: ROOT_URL,
    browser: EDGE_PATH,
    results: []
  };

  try {
    for (const viewport of viewports) {
      for (const pageConfig of pages) {
        const result = await auditSinglePage(browser, pageConfig, viewport);
        report.results.push(result);
        console.log(`${viewport.name.padEnd(7)} ${pageConfig.name.padEnd(24)} ${result.ok ? 'ok' : 'fail'}`);
      }
    }
  } finally {
    await browser.close();
  }

  const summary = {
    totalRuns: report.results.length,
    failedRuns: report.results.filter((entry) => !entry.ok).length,
    pagesWithConsoleErrors: report.results.filter((entry) => (entry.consoleErrors || []).length > 0).length,
    pagesWithPageErrors: report.results.filter((entry) => (entry.pageErrors || []).length > 0).length,
    pagesWithRequestFailures: report.results.filter((entry) => (entry.requestFailures || []).length > 0).length,
    pagesWithBrokenImages: report.results.filter((entry) => (entry.brokenImages || []).length > 0).length,
    pagesWithOverflow: report.results.filter((entry) => entry.horizontalOverflow).length,
    accessibilityViolations: report.results.reduce((sum, entry) => {
      return sum + (entry.accessibility?.violations?.length || 0);
    }, 0)
  };

  report.summary = summary;

  const reportPath = path.join(OUTPUT_DIR, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\nReport written to ${reportPath}`);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
