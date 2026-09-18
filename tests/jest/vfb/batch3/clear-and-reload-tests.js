const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { wait4selector, closeModalWindow } from '../utils.js';
import * as ST from '../selectors.js';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';

/*
 * Clear deletes every instance, which takes the meshes out of the scene, but
 * the types it resolved stay in the model. A term asked for again then looked
 * loaded -- instance present, nothing outstanding -- so it was only re-focused
 * and its geometry never came back, for the rest of the session.
 *
 * Reported against "Reports of transgene expression in adult mushroom body
 * alpha'-lobe": add images, clear, reopen the query, select one again, and
 * nothing renders.
 */
const TEMPLATE_ID = 'VFB_00101567';
const QUERY = 'FBbt_00013691,TransgeneExpressionHere';
const PROJECT_URL = `${baseURL}/geppetto?id=${TEMPLATE_ID}&q=${QUERY}`;

const ONE_SECOND = 1000;

const meshesInScene = async (page) => page.evaluate(() => {
	if (typeof CanvasContainer === 'undefined' || !CanvasContainer.engine || !CanvasContainer.engine.meshes) {
		return [];
	}
	return Object.keys(CanvasContainer.engine.meshes);
});

const firstImageIds = async (page, count) => page.evaluate((howMany) => Array.from(
	document.querySelectorAll('.query-results-checkbox')
).slice(0, howMany).map((box) => box.id.replace('-checkbox', '')), count);

const clickImage = async (page, reference) => page.evaluate((ref) => {
	const box = document.querySelector('[id="' + ref + '-checkbox"]');
	if (!box) {
		return false;
	}
	box.click();
	return true;
}, reference);

describe('VFB Clear And Reload Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(900000);
		await page.goto(PROJECT_URL, { timeout: 220000 });
	}, 300000);

	let picked = [];

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout: 120 * ONE_SECOND });
			closeModalWindow(page);
		}, 180000);

		it('The query returns images to select', async () => {
			await wait4selector(page, '#querybuilder', { visible: true, timeout: 240 * ONE_SECOND });
			await page.waitForFunction(
				() => document.querySelectorAll('.query-results-checkbox').length > 1,
				{ timeout: 300 * ONE_SECOND }
			);
			picked = await firstImageIds(page, 2);
			expect(picked.length).toEqual(2);
		}, 420000);
	});

	describe('Selecting, clearing and selecting again', () => {
		it('The selected images load into the scene', async () => {
			for (const reference of picked) {
				expect(await clickImage(page, reference)).toEqual(true);
			}
			const ids = picked.map((reference) => reference.split(',').pop());
			await page.waitForFunction(
				(wanted) => wanted.every((id) => Object.keys(CanvasContainer.engine.meshes).some((key) => key.indexOf(id) > -1)),
				{ timeout: 300 * ONE_SECOND },
				ids
			);
		}, 420000);

		it('Clear empties the scene down to the template', async () => {
			await page.evaluate(() => {
				const eraser = document.querySelector('i.fa-eraser');
				if (eraser) {
					eraser.click();
				}
			});
			await page.waitForFunction(
				(template) => {
					const keys = Object.keys(CanvasContainer.engine.meshes);
					return keys.length === 1 && keys[0].indexOf(template) > -1;
				},
				{ timeout: 120 * ONE_SECOND },
				TEMPLATE_ID
			);
		}, 180000);

		it('Selecting the same image again brings its mesh back', async () => {
			const reference = picked[0];
			const id = reference.split(',').pop();
			expect(await clickImage(page, reference)).toEqual(true);
			await page.waitForFunction(
				(wanted) => Object.keys(CanvasContainer.engine.meshes).some((key) => key.indexOf(wanted) > -1),
				{ timeout: 240 * ONE_SECOND },
				id
			);
			const keys = await meshesInScene(page);
			expect(keys.filter((key) => key.indexOf(id) > -1).length).toBeGreaterThan(0);
		}, 300000);
	});
});
