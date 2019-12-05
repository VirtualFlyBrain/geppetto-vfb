const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from './cmdline.js';
import { wait4selector, click } from './utils';
import * as ST from './selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?i=VFB_00017894";

/**
 * Tests query panel component by searching for 'medu' and running query on it
 */
describe('VFB Query Component Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(120000); 
		await page.goto(PROJECT_URL);

	});

	//Tests components are present in landing page
	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
		})

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toBe("Virtual Fly Brain");
		})

		it('Deselect button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00017894_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		})

		it('Zoom button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00017894_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		})

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#VFBTermInfo_el_1_component', { visible: true })
		})

		it('Term info component correctly populated at startup', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("adult brain template JFRC2 (VFB_00017894)")');
		})
	})

	//Tests running query 'medu' in the query panel
	describe('Test Query Panel', () => {
		it('Query builder button appeared', async () => {
			await wait4selector(page, 'i.fa-quora', { visible: true })
		})

		it('Query builder is visible', async () => {
			await click(page, 'i.fa-quora');
			await wait4selector(page, '#querybuilder', { visible: true })
		})

		it('Typing medu in the query builder search bar', async () => {
			await page.focus('input#query-typeahead');
			await page.keyboard.type('medu');
			await page.keyboard.press(String.fromCharCode(13))

			await wait4selector(page, 'div.tt-suggestion', { visible: true , timeout : 10000})
		})

		it('Selecting medulla, first suggestion from suggestion box', async () => {
			await page.evaluate(async selector =>  $('div.tt-suggestion').first().click())
			await wait4selector(page, '#queryitem-medulla_0', { visible: true , timeout : 60000})
		})

		it('Selecting first query for medulla', async () => {
			await page.evaluate(async selector =>  {
				var selectElement = $('select.query-item-option');
				selectElement.val('0').change();
				var event = new Event('change', { bubbles: true });
				selectElement[0].dispatchEvent(event);
			})
			await page.waitForFunction('document.getElementById("query-results-label").innerText.startsWith("2 results")', {visible : true, timeout : 60000});
		})

		it('Running query. Results rows appeared - click on results info for JFRC2 example of medulla', async () => {
			await click(page, 'button[id=run-query-btn]');
			await wait4selector(page, 'div[id=VFB_00030624-image-container]', { visible: true , timeout : 10000})
		})

		it('Term info correctly populated for example of Medulla after query results info button click', async () => {
			await page.evaluate(async selector =>   $("#VFB_00030624-image-container").find("img").click())
			await wait4selector(page, '#VFB_00030624_deselect_buttonBar_btn', { visible: true, timeout : 10000 })
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("medulla on adult brain template JFRC2 (VFB_00030624)")');
		})
	})
})
