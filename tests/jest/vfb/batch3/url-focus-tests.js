const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { wait4selector, click, closeModalWindow } from '../utils.js';
import * as ST from '../selectors.js';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';

/*
 * The focus term (id=) is deliberately NOT last in i=, and the list mixes a
 * painted domain, a neuron aligned to two templates (VFB_jrmc3f45 is on
 * JRC2018U and JRCVNC2018U) and the template itself. That combination is what
 * broke: terms load several at a time, so an image resolved before the
 * template, retried itself 5s later through a path that selected it with no
 * focus check, and whichever retried last took over Term Info and the URL.
 */
const FOCUS_ID = 'VFB_00102107';
const TEMPLATE_ID = 'VFB_00101567';
const REQUESTED_IDS = [TEMPLATE_ID, 'VFB_jrmc3f45', FOCUS_ID, 'VFB_00102135', 'VFB_00102162'];
const PROJECT_URL = `${baseURL}/geppetto?id=${FOCUS_ID}&i=${REQUESTED_IDS.join(',')}`;

// Long enough for every id in the list to settle, so a late completion that
// steals focus has happened by the time we assert.
const SETTLE_MS = 60000;

const urlParam = async (page, name) => page.evaluate(
	(param) => new URLSearchParams(window.location.search).get(param) || '',
	name
);

describe('VFB URL Focus and Template Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(900000);
		await page.evaluateOnNewDocument(() => {
			/*
			 * Any "aligned to another template" prompt is a failure here: every
			 * image in this list has an alignment to the loaded template.
			 */
			window.__vfbConfirms = [];
			window.confirm = function (message) {
				window.__vfbConfirms.push(String(message));
				return false;
			};
		});
		await page.goto(PROJECT_URL, { timeout: 220000 });
	}, 300000);

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout: 120000 });
			closeModalWindow(page);
		}, 180000);

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toMatch('Virtual Fly Brain');
		}, 120000);
	});

	describe('Scene template', () => {
		/*
		 * The template used to be whatever the first term to resolve said it was,
		 * which on a slow load is not the template itself. It is now taken from
		 * the URL before anything loads.
		 */
		it('Template is claimed from the URL, not from whichever term resolves first', async () => {
			await page.waitForFunction(
				(template) => window.templateID === template,
				{ timeout: 120000 },
				TEMPLATE_ID
			);
			expect(await page.evaluate(() => window.templateID)).toEqual(TEMPLATE_ID);
		}, 180000);
	});

	describe('The id= term keeps focus', () => {
		/*
		 * No force-focus here on purpose: batch4/term-info-tests.js and
		 * url-params-tests.js call select()/setTermInfo() themselves to work
		 * around this race. This test asserts the app gets it right unaided.
		 */
		it('Term info opens on the id= term without being told to', async () => {
			await wait4selector(page, `button[id=${FOCUS_ID}_zoom_buttonBar_btn]`, { visible: true, timeout: 360000 });
		}, 420000);

		it('Term info still shows the id= term once every requested id has settled', async () => {
			await page.waitFor(SETTLE_MS);
			await wait4selector(page, `button[id=${FOCUS_ID}_zoom_buttonBar_btn]`, { visible: true, timeout: 120000 });
			expect(await urlParam(page, 'id')).toEqual(FOCUS_ID);
		}, 300000);

		it('No image is wrongly reported as aligned to another template', async () => {
			const prompts = await page.evaluate(() => window.__vfbConfirms || []);
			expect(prompts.filter((message) => message.indexOf('aligned to another template') > -1)).toEqual([]);
		}, 120000);
	});

	describe('The URL keeps what it was asked to load', () => {
		/*
		 * The URL is rebuilt from the terms already in the scene, so a focus
		 * change mid-load used to drop everything still loading from i= -- a
		 * reload or a copied link then came back without them.
		 */
		it('Every requested id is still listed in i=', async () => {
			const listed = (await urlParam(page, 'i')).split(',').filter(Boolean);
			REQUESTED_IDS.forEach((id) => expect(listed).toContain(id));
		}, 120000);
	});
});
