const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?id=VFB_00017894";

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
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		})

		it('Term info component correctly populated at startup', async () => {
			let element = await findElementByText(page, "List all painted anatomy available for adult brain template JFRC2");
			expect(element).toBe("List all painted anatomy available for adult brain template JFRC2");
		})
	})

	//Tests opening control panel and clicking on row buttons
	describe('Test Layers Component', () => {
		it('Open Tabs Overflow Menu', async () => {
			await page.evaluate(async () => {
				let unselectedTab = document.getElementsByClassName('flexlayout__tab_button_overflow')[0].click();
			});

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.flexlayout__popup_menu_container', { visible: true, timeout : 5000 });
		})
		
		it('Open Layers Component', async () => {
			await page.evaluate(async () => {
				let tabs = document.getElementsByClassName('flexlayout__popup_menu_item');
				for ( var i = 0; i < tabs.length ; i ++ ) {
					if ( tabs[i].innerText === "Layers" ) {
						tabs[i].click();
					}
				}				
			});

			await wait4selector(page, 'div.listviewer-container', { visible: true, timeout : 5000 });
		})
		
		//Tests control panel opens up and that is populated with expected 2 rows
		it('The control panel opened with right amount of rows.', async () => {
			const rows = await page.evaluate(async selector => $(selector).length, ST.STANDARD_ROW_SELECTOR);
			expect(rows).toEqual(1);
		})
		
		it('Open Controls Menu', async () => {
			await click(page, 'i.fa-eye');
			await wait4selector(page, '#simple-popper', { visible: true, timeout : 5000 });
		})
		
		it('Unselect instance', async () => {
			await page.evaluate(async () => {
				let tabs = document.getElementsByClassName('menu-item-label');
				for ( var i = 0; i < tabs.length ; i ++ ) {
					if ( tabs[i].innerText === "Unselect" ) {
						tabs[i].click();
					}
				}
			});
		})
	})
})
