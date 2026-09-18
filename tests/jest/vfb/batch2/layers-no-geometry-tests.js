const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { wait4selector, closeModalWindow } from '../utils.js';
import * as ST from '../selectors.js';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';

/*
 * VFB_jrmc3f65's volume_man.obj is ~406MB, over the mesh limit, so it loads as
 * a skeleton and its OBJ import never resolves. FBbt_00040041 is a class with
 * no image at all. Both kinds of row used to take the whole app down through
 * the error boundary as soon as the Layers row menu rendered, because the menu
 * asked every term whether it was visible in 3D and a term only has
 * isVisible() once it has geometry.
 */
const OVERSIZED_MESH_ID = 'VFB_jrmc3f65';
const CLASS_ID = 'FBbt_00040041';
const TEMPLATE_ID = 'VFB_00101567';
const PROJECT_URL = `${baseURL}/geppetto?id=${CLASS_ID}&i=${TEMPLATE_ID},${OVERSIZED_MESH_ID}`;

const ERROR_DIALOG_TEXT = 'VFB Error report';

const openRowControls = async (page, instanceId) => page.evaluate((id) => {
	const rows = Array.from(document.querySelectorAll('.vfbListViewer .griddle-row'));
	for (let i = 0; i < rows.length; i++) {
		if (rows[i].innerText.indexOf(id) > -1 || rows[i].innerHTML.indexOf(id) > -1) {
			const controls = rows[i].querySelector('.fa-angle-down, .fa-angle-up');
			if (controls) {
				controls.click();
				return true;
			}
		}
	}
	return false;
}, instanceId);

const errorDialogShown = async (page) => page.evaluate(
	(text) => (document.body.innerText || '').indexOf(text) > -1,
	ERROR_DIALOG_TEXT
);

describe('VFB Layers Rows Without Geometry Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(900000);
		await page.goto(PROJECT_URL, { timeout: 220000 });
	}, 300000);

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout: 120000 });
			closeModalWindow(page);
		}, 180000);

		it('Layers component is shown', async () => {
			await wait4selector(page, 'div.listviewer-container', { visible: true, timeout: 240000 });
		}, 300000);
	});

	describe('A term whose mesh never arrives', () => {
		it('Its row appears in Layers', async () => {
			await page.waitForFunction(
				(id) => Array.from(document.querySelectorAll('.vfbListViewer .griddle-row'))
					.some((row) => row.innerText.indexOf(id) > -1 || row.innerHTML.indexOf(id) > -1),
				{ timeout: 360000 },
				OVERSIZED_MESH_ID
			);
		}, 420000);

		it('Its row menu opens instead of crashing the app', async () => {
			const opened = await openRowControls(page, OVERSIZED_MESH_ID);
			expect(opened).toEqual(true);
			await wait4selector(page, '#simple-popper', { visible: true, timeout: 30000 });
			const labels = await page.evaluate(() => Array.from(document.querySelectorAll('.menu-item-label'))
				.map((label) => label.innerText.trim()));
			expect(labels.length).toBeGreaterThan(0);
			expect(await errorDialogShown(page)).toEqual(false);
		}, 180000);

		it('The app is still running afterwards', async () => {
			await page.keyboard.press('Escape');
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true, timeout: 120000 });
			expect(await errorDialogShown(page)).toEqual(false);
		}, 180000);
	});
});
