/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { openSidebar, closeSidebar } = require('../help.js');

const helpHtml = fs.readFileSync(path.join(__dirname, '..', 'help.html'), 'utf8');

function loadHelpDocument() {
  return new DOMParser().parseFromString(helpHtml, 'text/html');
}

describe('help page', () => {
  test('shows the quick guide sections users need', () => {
    const document = loadHelpDocument();
    const headings = [...document.querySelectorAll('#using-biztrack .main-title')].map(
      (heading) => heading.textContent.trim(),
    );

    expect(document.title).toBe('Help - BizTrack');
    expect(document.querySelector('h1').textContent).toBe('Using BizTrack: A Quick Guide');
    expect(headings).toEqual([
      'What is BizTrack?',
      'Navigating the Dashboard',
      'Expenses Page',
      'Orders Page',
      'Adding a New Expense, Order or Product',
      'Sorting and Searching Entries/Tables',
      'Export to CSV',
    ]);
  });

  test('marks Help as the active sidebar destination', () => {
    const document = loadHelpDocument();
    const activeLink = document.querySelector('.menu li.active a');

    expect(activeLink).not.toBeNull();
    expect(activeLink.getAttribute('href')).toBe('./help.html');
    expect(activeLink.textContent).toContain('Help');
  });

  test('includes accessible contact links', () => {
    const document = loadHelpDocument();
    const contactLinks = [...document.querySelectorAll('#contact a')];

    expect(contactLinks).toHaveLength(3);
    expect(contactLinks.map((link) => link.getAttribute('href'))).toEqual([
      'https://www.linkedin.com/in/sumayyahmusa/',
      'https://github.com/sumusa/',
      'mailto:info@summeesarts.com',
    ]);
    expect(contactLinks.map((link) => link.getAttribute('aria-label'))).toEqual([
      'LinkedIn profile',
      'GitHub profile',
      'Email BizTrack',
    ]);
  });

  test('opens and closes the sidebar', () => {
    document.body.innerHTML = '<div id="sidebar" style="display: none;"></div>';

    openSidebar();
    expect(document.getElementById('sidebar').style.display).toBe('block');

    openSidebar();
    expect(document.getElementById('sidebar').style.display).toBe('none');

    closeSidebar();
    expect(document.getElementById('sidebar').style.display).toBe('none');
  });

});
