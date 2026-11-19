const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { wait4selector, testLandingPage, selectTab } from '../utils.js';
import * as ST from '../selectors.js';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';
// A male CNS neuron: hemibrain is left out of class-level searches by default
const NEURON_ID = 'VFB_jrmc26km';
const NEURON_LABEL = 'LC12_L';
const PROJECT_URL = `${baseURL}/geppetto?id=${NEURON_ID}`;
// A neuron type, which the Circuit Browser searches at class level
const CLASS_ID = 'FBbt_00100484';
const CLASS_URL = `${baseURL}/geppetto?id=${CLASS_ID}`;

const ONE_SECOND = 1000;

/*
 * The Circuit Browser tab itself: that it opens, that opening it from a term
 * carries that term into the query, and that its controls work. The graph a
 * connectivity query draws is data-dependent and slow, so it stays in
 * tests/jest/vfb/review/circuit-browser-tests.js -- this is the part that
 * should hold on every run.
 *
 * Selectors are the panel's current ones: the old div#VFBCircuitBrowser
 * wrapper no longer exists.
 */
describe('VFB Circuit Browser Tab Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(900000);
		await page.goto(PROJECT_URL, { timeout: 220000 });
	}, 300000);

	describe('Test landing page', () => {
		it('Test Landing Page', async () => {
			await testLandingPage(page, NEURON_ID);
		}, 300000);
	});

	/*
	 * The two waits for the panel are 150s rather than 120s. The file passed in
	 * 73s the run before it first failed, then the first wait timed out at
	 * 121s, with the same fixture and the panel verified working on v2-dev --
	 * so it was the runner being slow, not the panel. This fixture is a heavy
	 * neuron and its meshes can block the renderer long enough that the tab
	 * click does not take effect within the old budget.
	 */
	describe('The tab opens', () => {
		it('Circuit Browser shows its connectivity query controls', async () => {
			await selectTab(page, 'Circuit Browser');
			await wait4selector(page, '#refreshCircuitBrowser', { visible: true, timeout: 150 * ONE_SECOND });
			await wait4selector(page, '#clearCircuitBrowser', { visible: true, timeout: 30 * ONE_SECOND });
			await wait4selector(page, '#weightField', { visible: true, timeout: 30 * ONE_SECOND });
			expect(await page.evaluate(() => !!document.querySelector('.neuron1 input'))).toEqual(true);
			expect(await page.evaluate(() => !!document.querySelector('.neuron2 input'))).toEqual(true);
		}, 240000);

		it('The minimum weight has a usable default', async () => {
			const weight = await page.evaluate(() => {
				const field = document.querySelector('#weightField');
				return field ? Number(field.value) : NaN;
			});
			expect(weight).toBeGreaterThan(0);
		}, 120000);
	});

	describe('Opening it from a term', () => {
		it('Term info offers the term to the Circuit Browser', async () => {
			await selectTab(page, 'Term Info');
			await wait4selector(page, '#circuitBrowserLink', { visible: true, timeout: 240 * ONE_SECOND });
		}, 300000);

		it('The term becomes the first neuron of the query', async () => {
			await page.click('#circuitBrowserLink');
			await wait4selector(page, '#refreshCircuitBrowser', { visible: true, timeout: 150 * ONE_SECOND });
			// Filled through a Redux dispatch chain, so wait for the value.
			await page.waitForFunction(() => {
				const input = document.querySelector('.neuron1 input');
				const value = input && typeof input.value === 'string' ? input.value : '';
				return value.trim().length > 0 && value.toLowerCase() !== 'neuron 1';
			}, { timeout: 60 * ONE_SECOND });

			const neuron1 = await page.evaluate(() => document.querySelector('.neuron1 input').value);
			expect(neuron1).toContain(NEURON_ID);
			expect(neuron1).toContain(NEURON_LABEL);
		}, 300000);

		it('The term is tagged as an Individual', async () => {
			await page.waitForFunction(() => {
				const tag = document.querySelector('.neuron1 .circuitTermKind');
				return tag && tag.textContent === 'Individual';
			}, { timeout: 30 * ONE_SECOND });
		}, 60000);
	});

	describe('Clearing the query', () => {
		it('Clear empties both neuron fields and leaves the panel usable', async () => {
			await page.click('#clearCircuitBrowser');
			await page.waitForFunction(() => {
				const first = document.querySelector('.neuron1 input');
				const second = document.querySelector('.neuron2 input');
				return first && second && first.value.trim() === '' && second.value.trim() === '';
			}, { timeout: 60 * ONE_SECOND });
			await wait4selector(page, '#refreshCircuitBrowser', { visible: true, timeout: 30 * ONE_SECOND });
		}, 180000);
	});

	describe('Opening it from a neuron type', () => {
		it('Term info for a neuron type offers it to the Circuit Browser', async () => {
			await page.goto(CLASS_URL, { timeout: 220000 });
			await testLandingPage(page, CLASS_ID);
			await selectTab(page, 'Term Info');
			await wait4selector(page, '#circuitBrowserLink', { visible: true, timeout: 240 * ONE_SECOND });
		}, 400000);

		it('The type becomes the first term of the query, tagged as a Class', async () => {
			await page.click('#circuitBrowserLink');
			await wait4selector(page, '#refreshCircuitBrowser', { visible: true, timeout: 150 * ONE_SECOND });
			await page.waitForFunction((id) => {
				const input = document.querySelector('.neuron1 input');
				return input && input.value.includes(id);
			}, { timeout: 60 * ONE_SECOND }, CLASS_ID);
			await page.waitForFunction(() => {
				const tag = document.querySelector('.neuron1 .circuitTermKind');
				return tag && tag.textContent === 'Class';
			}, { timeout: 30 * ONE_SECOND });
		}, 300000);
	});
});
