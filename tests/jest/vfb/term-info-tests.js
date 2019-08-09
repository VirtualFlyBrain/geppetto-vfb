const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from './cmdline.js';
import { wait4selector, click } from './utils';
import * as ST from './selectors';

const baseURL = getCommandLineArg('--url', 'http://localhost:8080/org.geppetto.frontend');
const PROJECT_URL = baseURL + "/geppetto?i=VFB_00017894";

describe('VFB Term Info Component Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(120000); 
		await page.goto(PROJECT_URL);

	});

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000})
		})
		
		it('VFB Title shows up', async () => {
			const title = await page.title();
		    expect(title).toBe("Virtual Fly Brain");
		})

		it('Deselect button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00017894_deselect_buttonBar_btn', { visible: true , timeout : 120000})
		})

		it('Zoom button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00017894_zoom_buttonBar_btn]', { visible: true , timeout : 120000})
		})
		
		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#VFBTermInfo_el_1_component', { visible: true , timeout : 120000})
		})

		it('Term info component correctly populated at startup', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("adult brain template JFRC2 (VFB_00017894)")');
		})
	})

	describe('Test Term Info Component', () => {
		it('Term info correctly populated after term info interaction', async () => {
			await page.evaluate(async (variableName) => $(variableName).find("a").click(), "#VFBTermInfo_el_1_component");
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("FlyLight - GMR GAL4 collection (Jenett2012) (Jenett2012)")');
		})
	})
})
