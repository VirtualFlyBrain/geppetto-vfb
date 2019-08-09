const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from './cmdline.js';
import { wait4selector, click } from './utils';
import * as ST from './selectors';

const baseURL = getCommandLineArg('--url', 'http://localhost:8081/org.geppetto.frontend');
const PROJECT_URL = baseURL + "/geppetto?i=VFB_00017894,VFB_00030849,VFB_00030838,VFB_00030856,VFB_00030880";

describe('VFB batch requests tests', () => {
	beforeAll(async () => {
		jest.setTimeout(1800000); 
		await page.goto(PROJECT_URL);

	});
	
	const batch_requests = ['VFB_00017894','VFB_00030849','VFB_00030838','VFB_00030856','VFB_00030880'];

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 100000})
		})
		
		it('VFB Title shows up', async () => {
			const title = await page.title();
		    expect(title).toBe("Virtual Fly Brain");
		})

		it('Deselect button for VFB_00030880 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00030880_deselect_buttonBar_btn', { visible: true , timeout : 1800000})
		})

		it('Zoom button for VFB_00030880 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00030880_zoom_buttonBar_btn]', { visible: true , timeout : 1800000})
		})
		
		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#VFBTermInfo_el_1_component', { visible: true })
		})

		it('Element ventral complex on adult brain template JFRC2 appeared in popup', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("ventral complex on adult brain template JFRC2 (VFB_00030880)")');
		})
		
		it('Canvas container component has 5 meshes rendered', async () =>{
			expect(
					await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(5)
		})
	})

	describe('Tests Batch Requests in Stack Viewer Component', () => {
		it('Slice viewer present', async () => {
			await wait4selector(page, 'div#NewStackViewerdisplayArea', { visible: true })
		})
		
		it('Slice viewer component has 5 meshes rendered', async () =>{
			expect(
					await page.evaluate(async () => Object.keys(StackViewer1.state.canvasRef.engine.meshes).length)
			).toBe(5)
		})

		it.each(batch_requests)('Mesh from batch request id : %id present in stack viewer component', async id => {
			expect(
					await page.evaluate(async selector => StackViewer1.state.canvasRef.engine.meshes[selector + "." + selector + "_obj"].visible, id)
			).toBeTruthy()
		})
	})

	describe('Tests Batch Requests in Control Panel', () => {
		it('The control panel opened with right amount of rows.', async () => {
			await click(page, "button#controlPanelVisible");
			await wait4selector(page, ST.CONTROL_PANEL_SELECTOR, { visible: true })
			const rows = await page.evaluate(async selector => $(selector).length, ST.STANDARD_ROW_SELECTOR);
			expect(rows).toEqual(5);
		})

		it.each(batch_requests)('Row created for batch request with id : %id in control panel', async id => {
			await wait4selector(page, 'button[id='+id+'_info_ctrlPanel_btn]', { visible: true })
		})
	})
})
