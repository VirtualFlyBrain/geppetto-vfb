const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, findElementByText, selectTab } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?id=VFB_00030880&i=VFB_00017894,VFB_00030849,VFB_00030838,VFB_00030856,VFB_00030880";

/**
 * Requests 5 different VFB IDs and tests they all load by testing canvas, stack viewer and term info components
 */
describe('VFB Batch Requests Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(3600000);
		await page.goto(PROJECT_URL);

	});

	//5 VFB IDs requested
	const batch_requests = ['VFB_00017894','VFB_00030849','VFB_00030838','VFB_00030856','VFB_00030880'];

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 600000 })
			// Close tutorial window
			await closeModalWindow(page);
		}, 600000)

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toMatch("Virtual Fly Brain");
		}, 120000)

		it('Deselect button for VFB_00030880 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00030880_deselect_buttonBar_btn', { visible: true , timeout : 600000 })
		}, 600000)

		it('Zoom button for VFB_00030880 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00030880_zoom_buttonBar_btn]', { visible: true , timeout : 600000 })
		}, 600000)

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true , timeout : 600000 })
		}, 600000)

		//Function used for testing existance of text inside term info component
		it('Element ventral complex on adult brain template JFRC2 appeared in popup', async () => {
			let element = await findElementByText(page, "ventral complex on adult brain template JFRC2 (VFB_00030880)");
			expect(element).toBe("ventral complex on adult brain template JFRC2 (VFB_00030880)");
		}, 120000)

		//Tests canvas has 5 meshes rendered
		it('Canvas container component has 5 meshes rendered', async () => {
			await page.waitForFunction(
				() => typeof CanvasContainer !== 'undefined' && Object.keys(CanvasContainer.engine.meshes).length === 5,
				{ timeout: 600000 }
			);
		}, 600000)
	})

	//Expects stack viewer component to have 5 meshes rendered and visible.
	describe('Tests Batch Requests in Stack Viewer Component', () => {
		it('Slice viewer present', async () => {
			await wait4selector(page, 'div#NewStackViewerdisplayArea', { visible: true, timeout: 600000 })
		}, 600000)

		it('Slice viewer component has 5 meshes rendered', async () => {
			await page.waitForFunction(
				() => typeof StackViewer1 !== 'undefined' && Object.keys(StackViewer1.state.canvasRef.engine.meshes).length === 5,
				{ timeout: 600000 }
			);
		}, 600000)

		it.each(batch_requests)('Mesh from batch request id %s present in stack viewer component', async id => {
			const visible = await page.evaluate(async selector => {
				const engine = (typeof StackViewer1 !== 'undefined' && StackViewer1.state && StackViewer1.state.canvasRef && StackViewer1.state.canvasRef.engine) ? StackViewer1.state.canvasRef.engine : null;
				const meshes = engine ? engine.meshes : {};
				const meshKey = Object.keys(meshes).find(key => key.startsWith(`${selector}.`));
				return meshKey ? meshes[meshKey].visible : false;
			}, id);
			expect(visible).toBeTruthy();
		}, 120000)
	})

	//Expects control panel have 5 rows rendered and 'info' buttons in control panel for each of the 5 requested VFB IDs
	describe('Tests Batch Requests in Control Panel', () => {
		it('Open Layers Component', async () => {
			await selectTab(page, "Layers");
			await page.waitFor(1000); // Give the DOM time to update after opening the tab

			await wait4selector(page, 'div.listviewer-container', { visible: true, timeout : 60000 });
		})

		it('The layers component opened with right amount of rows.', async () => {
			const rows = await page.evaluate(async selector => document.querySelectorAll(selector).length, ST.STANDARD_ROW_SELECTOR);
			expect(rows).toEqual(5);
		}, 120000)
//
//		it.each(batch_requests)('Row created for batch request with id %s in control panel', async id => {
//			await wait4selector(page, 'button[id=' + id + '_info_ctrlPanel_btn]', { visible: true, timeout: 1800000})
//		})
	})
})
