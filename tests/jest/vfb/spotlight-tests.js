const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from './cmdline.js';
import { wait4selector, click, closeModalWindow } from './utils';
import * as ST from './selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?i=VFB_00017894";

/**
 * Test spotlight component works with VFB_00017894 and show correct buttons
 */
describe('VFB Spotlight Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(1800000); 
		await page.goto(PROJECT_URL);

	});

	//Test components on landing page are present
	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
			// Close tutorial window
			closeModalWindow(page);
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
		
		it('Hide Quick Help Modal Window', async () => {
			closeModalWindow(page);
			await wait4selector(page, 'div#quick_help_modal', { hidden : true })
		})

		it('Term info component correctly populated at startup', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("adult brain template JFRC2 (VFB_00017894)")');
		})

		it('Canvas container component has 1 mesh rendered', async () => {
			expect(
					await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(1)
		})
	})

	//Tests 'Add Scene' button in spotlight for VFB_00017894
	describe('Spotlight, add scene button test', () => { 
		it('Query builder button appeared', async () => {
			await wait4selector(page, 'i.fa-search', { visible: true, timeout : 1000 })
		})

		it('Opens and shows correct butttons.', async () => {
			await page.waitFor(10000);
			await click(page, 'i.fa-search');
			await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, {visible: true});
		});

		it('Spotlight visible, perform Instance search', async () => {
			await page.keyboard.type('fru-M-200266');
			await page.waitFor(15000);
			await page.evaluate(async () => document.querySelector("#paperResults").querySelectorAll(".MuiListItem-button")[0].click());
		});

		it('New Instance Added to Scene, Term Info Updated', async () => {
			await wait4selector(page, '#VFB_00000001_deselect_buttonBar_btn', { visible: true , timeout : 180000});
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("fru-M-200266")');
		});

		it('VFB_00017894.VFB_00017894_obj visibility correct after adding it through spotlight', async () => {
			expect(
					await page.evaluate(async () => CanvasContainer.engine.getRealMeshesForInstancePath('VFB_00017894.VFB_00017894_obj')[0].visible)
			).toBeTruthy()
		})
	});
})
