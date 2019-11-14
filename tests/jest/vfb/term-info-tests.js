const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from './cmdline.js';
import { wait4selector, click } from './utils';
import * as ST from './selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?i=VFB_00017894";

/**
 * Tests term info component. Loads ID VFB_00017894 , and tests term info component to be correctly loaded with metadata for VFB_00017894. 
 */
describe('VFB Term Info Component Tests', () => {
	beforeAll(async () => {
		//increases timeout to 2 minutes
		jest.setTimeout(120000);
		await page.goto(projectURL, {timeout : 120000 });

	});

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
		})

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toBe("Virtual Fly Brain");
		})
	})

	//Tests metadata in term info component and clicking on links
	describe('Test Term Info Component', () => {
		//Tests deselect button for VFB_00017894 is present in term info component
		it('Deselect button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00017894_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		})

		//Tests zoom button for VFB_00017894 is present in term info component
		it('Zoom button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00017894_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		})

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#VFBTermInfo_el_1_component', { visible: true})
		})

		it('Term info component correctly populated at startup', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("adult brain template JFRC2 (VFB_00017894)")');
		})

		//Tests clicking on term info component link loads expected metadata.
		it('Term info correctly populated after term info interaction', async () => {
			await page.evaluate(async variableName => $(variableName).find("a").click(), "#VFBTermInfo_el_1_component");
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("FlyLight - GMR GAL4 collection (Jenett2012) (Jenett2012)")');
		})
		
		it('Term info minimized', async () => {
			await page.evaluate(async () => document.getElementsByClassName("fa-window-minimize")[2].click());
			await wait4selector(page, 'div#VFBTermInfo_el_1_component', { hidden: true})
		})
		
		it('Term info maximized', async () => {
			await page.evaluate(async () => {
				let dv = document.getElementsByClassName('flexlayout__border_button')[0]
				let clickEvent = new MouseEvent('mousedown', {
					view: window,
					bubbles: true,
					cancelable: true
				});
				dv.dispatchEvent(clickEvent);
	
				dv = document.getElementsByClassName('flexlayout__border_button')[0]
				clickEvent = new MouseEvent('mouseup', {
					view: window,
					bubbles: true,
					cancelable: true
				});
				dv.dispatchEvent(clickEvent);
			});
			
			await wait4selector(page, 'div#VFBTermInfo_el_1_component', { visible: true})
		})
	})
})