const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?id=VFB_00017894&q=VFB_00000001,SimilarMorphologyTo; VFBexp_FBal0276838,epFrag";

/**
 * Query Builder component tests
 */
describe('VFB Query Builder Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(1800000); 
		await page.goto(PROJECT_URL);
	});

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
			// Close tutorial window
			closeModalWindow(page);
		})

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toMatch("Virtual Fly Brain");
		}, 120000)

		it('Zoom button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00017894_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		}, 120000)

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		}, 120000)
	})

	describe('Tests Compound Queries from URL', () => {
		it('Wait for First Query', async () => {
			await wait4selector(page, '#querybuilder', { visible: true, timeout : 150000 });
			await wait4selector(page, '#queryitem-fru-M-200266_0', { visible: true, timeout : 150000 });
		}, 220000)
		
		it('Query Builder Shows Result Count for Compound Queries', async () => {
			await wait4selector(page, '#querybuilder', { visible: true, timeout : 150000 });
			await wait4selector(page, '#query-results-label', { visible: true, timeout : 150000 });
			const resultSummary = await page.evaluate(async () => {
				const label = document.querySelector('#query-results-label');
				return label ? label.textContent.trim() : "";
			});
			expect(resultSummary).toMatch(/^\d+\s+results?$/i);
			expect(parseInt(resultSummary, 10)).toBeGreaterThan(0);
		}, 220000)
	})
})
