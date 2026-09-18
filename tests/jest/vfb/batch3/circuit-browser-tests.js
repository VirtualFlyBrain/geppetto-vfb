const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { wait4selector, testLandingPage, selectTab } from '../utils.js';
import * as ST from '../selectors.js';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';
const NEURON_ID = 'VFB_jrchjrch';
const NEURON_LABEL = '5-HTPLP01_R';
const PROJECT_URL = `${baseURL}/geppetto?id=${NEURON_ID}`;

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

	describe('The tab opens', () => {
		it('Circuit Browser shows its connectivity query controls', async () => {
			await selectTab(page, 'Circuit Browser');
			await wait4selector(page, '#refreshCircuitBrowser', { visible: true, timeout: 120 * ONE_SECOND });
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
			await wait4selector(page, '#refreshCircuitBrowser', { visible: true, timeout: 120 * ONE_SECOND });
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
});
