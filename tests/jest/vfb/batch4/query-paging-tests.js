const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { wait4selector, closeModalWindow } from '../utils.js';
import * as ST from '../selectors.js';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';

/*
 * A result bigger than one page is loaded page by page. Two things went wrong
 * there, and both showed up in a download of "Images of neurons with some part
 * in medulla": 824 rows were exact duplicates, and the load stopped at 46,269
 * rows of the backend's 226,524.
 *
 * That query is far too big to run here, so the paging is exercised instead by
 * shrinking the page: a few hundred rows over a 50-row page is the same code
 * path, many times over.
 */
const QUERY_TERM = 'FBbt_00047573';
const QUERY_TYPE = 'DownstreamClassConnectivity';
const PAGE_SIZE = 50;
const PROJECT_URL = `${baseURL}/geppetto?id=VFB_00101567&q=${QUERY_TERM},${QUERY_TYPE}`;

const resultsLabelCount = async (page) => page.evaluate(() => {
	const label = document.querySelector('#query-results-label');
	if (!label) {
		return null;
	}
	const match = (label.textContent || '').match(/([\d,]+)/);
	return match ? parseInt(match[1].replace(/,/g, ''), 10) : null;
});

describe('VFB Query Paging Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(900000);
		await page.evaluateOnNewDocument((size) => {
			window.VFB_QUERY_PAGE_SIZE = size;
		}, PAGE_SIZE);
		await page.goto(PROJECT_URL, { timeout: 220000 });
	}, 300000);

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout: 120000 });
			closeModalWindow(page);
		}, 180000);

		it('The query from the URL returns results', async () => {
			await wait4selector(page, '#querybuilder', { visible: true, timeout: 240000 });
			await wait4selector(page, '#query-results-label', { visible: true, timeout: 300000 });
			await page.waitForFunction(() => {
				const label = document.querySelector('#query-results-label');
				return label && /^\d[\d,]*\s+results?/i.test((label.textContent || '').trim());
			}, { timeout: 300000 });
		}, 420000);
	});

	describe('Paging a result', () => {
		it('Loads every row the backend has, not just up to the first short page', async () => {
			// Let the remaining pages stream in.
			await page.waitFor(30000);

			const backendCount = await page.evaluate(async (term, queryType) => {
				const response = await fetch(
					'https://v3-cached.virtualflybrain.org/run_query?id=' + term
					+ '&query_type=' + queryType + '&limit=1'
				);
				const body = await response.json();
				return body && typeof body.count === 'number' ? body.count : null;
			}, QUERY_TERM, QUERY_TYPE);

			const loaded = await resultsLabelCount(page);
			expect(loaded).not.toBeNull();
			if (backendCount === null) {
				// Backend did not report a count: at least assert more than one page loaded.
				expect(loaded).toBeGreaterThan(PAGE_SIZE);
				return;
			}
			expect(loaded).toEqual(backendCount);
		}, 420000);

		it('Does not show the same row twice', async () => {
			/*
			 * The duplicates were exact repeats of a whole row, so compare rows as
			 * rendered. Griddle virtualises, so this covers what is on screen --
			 * enough to catch a page that came back repeated, which is how the 824
			 * duplicates in the download appeared.
			 */
			const duplicates = await page.evaluate(() => {
				const rows = Array.from(document.querySelectorAll('.griddle-row'))
					.map((row) => (row.innerText || '').replace(/\s+/g, ' ').trim())
					.filter((text) => text.length > 0);
				const seen = {};
				const repeated = [];
				rows.forEach((text) => {
					if (seen[text] === true && repeated.indexOf(text) < 0) {
						repeated.push(text);
					}
					seen[text] = true;
				});
				return repeated;
			});
			expect(duplicates).toEqual([]);
		}, 240000);
	});
});
