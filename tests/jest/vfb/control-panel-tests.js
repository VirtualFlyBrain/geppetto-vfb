const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from './cmdline.js';
import { wait4selector, click } from './utils';
import * as ST from './selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?i=VFB_00017894,VFB_00000001";

/**
 * Tests control panel works in VFB
 */
describe('VFB Control Panel Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(120000); 
		await page.goto(PROJECT_URL);

	});

	//Tests components in landing page are present
	describe('Test Landing Page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
		})

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toBe("Virtual Fly Brain");
		})

		it('Deselect button for VFB_00000001 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00000001_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		})

		it('Zoom button for VFB_00000001 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00000001_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		})

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#VFBTermInfo_el_2_component', { visible: true })
		})		

		it('Term info component correctly populated at startup', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("fru-M-200266 (VFB_00000001)")');
		})
	})

	//Tests opening control panel and clicking on row buttons
	describe('Test Control Panel', () => {
		//Tests control panel opens up and that is populated with expected 2 rows
		it('The control panel opened with right amount of rows.', async () => {
			await click(page, "i.fa-list");
			await wait4selector(page, ST.CONTROL_PANEL_SELECTOR, { visible: true })
			const rows = await page.evaluate(async selector => $(selector).length, ST.STANDARD_ROW_SELECTOR);
			expect(rows).toEqual(2);
		})

		//Tests clicking in select button for VFB_00017894 from control panel works, term info should show deselect button for VFB_00017894
		it('Term info correctly populated  for JFRC2_template after control panel selection click', async () => {
			await click(page, 'button[id=VFB_00017894_select_ctrlPanel_btn]');
			await wait4selector(page, '#VFB_00017894_deselect_buttonBar_btn', { visible: true })
		})

		//Tests term info metadata changed in response to previous test selection of VFB_00017894. 
		it('Term info correctly populated  for JFRC2_template after control panel selection click', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("adult brain template JFRC2 (VFB_00017894)")');
		})
	})
})
