/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const pages = fs
  .readdirSync(rootDir)
  .filter((fileName) => fileName.endsWith('.html'))
  .sort();

function loadPage(fileName) {
  const html = fs.readFileSync(path.join(rootDir, fileName), 'utf8');
  return new DOMParser().parseFromString(html, 'text/html');
}

function accessibleName(element) {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('title') ||
    element.textContent ||
    ''
  ).trim();
}

describe('accessibility basics', () => {
  test.each(pages)('%s has required document metadata', (fileName) => {
    const document = loadPage(fileName);
    const viewport = document.querySelector('meta[name="viewport"]');

    expect(document.documentElement.lang).toBe('en');
    expect(document.querySelector('meta[charset]')).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(viewport.getAttribute('content')).toContain('width=device-width');
    expect(viewport.getAttribute('content')).toContain('initial-scale=1.0');
    expect(document.title).toMatch(/BizTrack/i);
  });

  test.each(pages)('%s tests navigation links', (fileName) => {
    const document = loadPage(fileName);
    const navLinks = [...document.querySelectorAll('.menu a')];
    const allLinks = [...document.querySelectorAll('a[href]')];

    expect(navLinks.length).toBeGreaterThan(0);
    navLinks.forEach((link) => {
      expect(accessibleName(link)).not.toBe('');
      expect(link.getAttribute('href')).toMatch(/\S/);
    });

    allLinks.forEach((link) => {
      expect(accessibleName(link)).not.toBe('');
    });
  });

  test.each(pages)('%s tests buttons', (fileName) => {
    const document = loadPage(fileName);
    const buttons = [...document.querySelectorAll('button')];

    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((button) => {
      expect(accessibleName(button)).not.toBe('');
    });
  });

  test.each(pages)('%s tests label and input relationships', (fileName) => {
    const document = loadPage(fileName);
    const fields = [...document.querySelectorAll('input, select, textarea')].filter(
      (field) => field.type !== 'hidden',
    );

    fields.forEach((field) => {
      expect(field.id).not.toBe('');
      expect(document.querySelector(`label[for="${field.id}"]`)).not.toBeNull();
    });
  });

  test.each(pages)('%s tests aria-label values', (fileName) => {
    const document = loadPage(fileName);
    const labelledElements = [...document.querySelectorAll('[aria-label]')];

    labelledElements.forEach((element) => {
      expect(element.getAttribute('aria-label').trim()).not.toBe('');
    });
  });

  test.each(pages)('%s uses keyboard-accessible buttons for clickable actions', (fileName) => {
    const document = loadPage(fileName);
    const clickableElements = [...document.querySelectorAll('[onclick]')];

    clickableElements.forEach((element) => {
      expect(element.tagName).toBe('BUTTON');
      expect(accessibleName(element)).not.toBe('');
    });
  });

  test.each(pages)('%s gives tables scoped column headers', (fileName) => {
    const document = loadPage(fileName);
    const tables = [...document.querySelectorAll('table')];

    tables.forEach((table) => {
      const headers = [...table.querySelectorAll('thead th')];
      expect(headers.length).toBeGreaterThan(0);
      headers.forEach((header) => {
        expect(header.getAttribute('scope')).toBe('col');
      });
    });
  });
});
