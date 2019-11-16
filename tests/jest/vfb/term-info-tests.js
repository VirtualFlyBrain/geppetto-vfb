const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from './cmdline.js';
import { wait4selector, click } from './utils';
import * as ST from './selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?id=VFB_00030624&i=VFB_00017894,VFB_00030624,VFB_00030611,VFB_00030623";

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
	describe('Test Term Info Component Opens on Load with Components', () => {
		//Tests deselect button for VFB_00030624 is present in term info component
		it('Deselect button for VFB_00030624 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00030624_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		})

		//Tests zoom button for VFB_00030624 is present in term info component
		it('Zoom button for VFB_00030624 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00030624_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		})

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#VFBTermInfo_el_1_component', { visible: true})
		})

		it('Term info component name correctly populated at startup', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("medulla on adult brain template JFRC2 (VFB_00030624)")');
		})
	})

	describe('Test Term Info Component Minimizes/Maximizes/Opens/Closes', () => {
		it('Term info minimized', async () => {
			// There are three flexlayout_tab components open with the same minimize icon, the third one belongs to the term info
			await page.evaluate(async () => document.getElementsByClassName("fa-window-minimize")[2].click());
			// Check 3d viewer is visible again by checking css property 'display : none'
			expect(
					await page.evaluate(async () => document.getElementsByClassName("flexlayout__tab")[2].style.getPropertyValue("display"))
			).toBe("none");
		})

		it('Term info maximized', async () => {
			await page.evaluate(async () => {
				let mouseUp = document.getElementsByClassName('flexlayout__border_button')[0]
				let clickEvent = new MouseEvent('mousedown', {
					view: window,
					bubbles: true,
					cancelable: true
				});
				mouseUp.dispatchEvent(clickEvent);

				let mouseDown = document.getElementsByClassName('flexlayout__border_button')[0]
				clickEvent = new MouseEvent('mouseup', {
					view: window,
					bubbles: true,
					cancelable: true
				});
				mouseDown.dispatchEvent(clickEvent);
			});

			// Check term info component is visible again by checking css property 'display : block'
			expect(
					// There are 3 div elements with class 'flexlayout_tab', the term info component is the third one
					await page.evaluate(async () =>	document.getElementsByClassName("flexlayout__tab")[2].style.getPropertyValue("display"))
			).toBe("block");

			// Looks for zoom button for id 'VFB_00030624', which is present if it's visible
			await wait4selector(page, 'button[id=VFB_00030624_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		})	
		it('Term info closed', async () => {
			// There's 3 div elements with same class (slice viewer, 3d viewer and term info), the third one belongs to the term info
			await page.evaluate(async () => document.getElementsByClassName("flexlayout__tab_button_trailing")[2].click());
			await wait4selector(page, 'div#vfbterminfowidget', { hidden: true, timeout : 5000})
		})

		it('Term info opened', async () => {
			await page.evaluate(async () => document.getElementById("Tools").click());
			// Check HTML 'UL' with class 'MuiList-root' is visible, this is the drop down menu
			await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 });
			await page.evaluate(async () => document.getElementById("Term Info").click());
			await wait4selector(page, 'div#vfbterminfowidget', { visible: true, timeout : 5000});
			await wait4selector(page, 'div#VFBTermInfo_el_1_component', { visible: true, timeout : 5000});
		})
	})

	describe('Test Term Info Component Links and Buttons Work', () => {
		//Tests clicking on term info component link loads expected metadata.
		it('Term info correctly populated after term info interaction', async () => {
			await page.evaluate(async variableName => $(variableName).find("a").click(), "#VFBTermInfo_el_1_component");
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("BrainName neuropils on adult brain JFRC2 (Jenett, Shinomya) (JenettShinomya_BrainName)")');
		})
	})
})