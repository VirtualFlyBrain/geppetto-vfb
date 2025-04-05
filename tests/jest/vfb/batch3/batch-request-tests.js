const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?id=VFB_00030880&i=VFB_00017894,VFB_00030849,VFB_00030838,VFB_00030856,VFB_00030880";

/**
 * Requests 5 different VFB IDs and tests they all load by testing canvas, stack viewer and term info components
 */
describe('VFB Batch Requests Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(1800000); 
		await page.goto(PROJECT_URL);

	});

	//5 VFB IDs requested
	const batch_requests = ['VFB_00017894','VFB_00030849','VFB_00030838','VFB_00030856','VFB_00030880'];

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
			// Close tutorial window
			closeModalWindow(page);
		})

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toMatch("Virtual Fly Brain");
		})

		it('Deselect button for VFB_00030880 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00030880_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		}, 120000)

		it('Zoom button for VFB_00030880 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00030880_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		}, 120000)

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		}, 120000)
		
		//Function used for testing existance of text inside term info component
		it('Element ventral complex on adult brain template JFRC2 appeared in popup', async () => {
			let element = await findElementByText(page, "ventral complex on adult brain template JFRC2");
			expect(element).toBe("ventral complex on adult brain template JFRC2");
		}, 120000)

		//Tests canvas has 5 meshes rendered
		it('Canvas container component has 5 meshes rendered', async () => {
			expect(
					await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(5)
		}, 120000)
	})

	//Expects stack viewer component to have 5 meshes rendered and visible.
	describe('Tests Batch Requests in Stack Viewer Component', () => {
		it('Slice viewer present', async () => {
			await wait4selector(page, 'div#NewStackViewerdisplayArea', { visible: true, timeout: 1800000 })
		})

		it('Slice viewer component has 5 meshes rendered', async () => {
			expect(
					await page.evaluate(async () => Object.keys(StackViewer1.state.canvasRef.engine.meshes).length)
			).toBe(5)
		}, 120000)

		it.each(batch_requests)('Mesh from batch request id %s present in stack viewer component', async id => {
			expect(
					await page.evaluate(async selector => StackViewer1.state.canvasRef.engine.meshes[selector + "." + selector + "_obj"].visible, id)
			).toBeTruthy()
		})
	})

	//Expects control panel have 5 rows rendered and 'info' buttons in control panel for each of the 5 requested VFB IDs
	describe('Tests Batch Requests in Control Panel', () => {
		it('Open Tabs Overflow Menu', async () => {
			await page.evaluate(async () => {
				let unselectedTab = document.getElementsByClassName('flexlayout__tab_button_overflow')[0].click();
			});

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.flexlayout__popup_menu_container', { visible: true, timeout : 5000 });
		}, 120000)
		
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
		
		it('The layers component opened with right amount of rows.', async () => {
			const rows = await page.evaluate(async selector => $(selector).length, ST.STANDARD_ROW_SELECTOR);
			expect(rows).toEqual(5);
		}, 120000)
//
//		it.each(batch_requests)('Row created for batch request with id %s in control panel', async id => {
//			await wait4selector(page, 'button[id=' + id + '_info_ctrlPanel_btn]', { visible: true, timeout: 1800000})
//		})
	})
})
