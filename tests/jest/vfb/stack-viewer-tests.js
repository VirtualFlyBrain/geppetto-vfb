const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from './cmdline.js';
import { wait4selector, click } from './utils';
import * as ST from './selectors';

const baseURL = getCommandLineArg('--url', 'http://localhost:8080/org.geppetto.frontend');
const PROJECT_URL = baseURL + "/geppetto?i=VFB_00017894";

describe('Stack Viewer Component Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(1800000); 
		await page.goto(PROJECT_URL);

	});

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

		it('Canvas container component has 1 mesh rendered', async () => {
			expect(
					await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(1)
		})
	})

	describe('Test Query Panel', () => {
		it('Query builder button appeared', async () => {
			await wait4selector(page, 'button[id=queryBuilderVisible]', { visible: true })
		})

		it('Query builder is visible', async () => {
			await click(page, 'button[id=queryBuilderVisible]');
			await wait4selector(page, 'button[id=queryBuilderVisible]', { visible: true })
		})

		it('Typing medu in the query builder search bar', async () => {
			await page.focus('input#query-typeahead');
			await page.keyboard.type('medu');
			await page.keyboard.press(String.fromCharCode(13))

			await wait4selector(page, 'div.tt-suggestion', { visible: true , timeout : 10000})
		})

		it('Selecting first query for medulla', async () => {
			await page.evaluate(async selector =>  $('div.tt-suggestion').first().click())
			await wait4selector(page, 'select.query-item-option', { visible: true , timeout : 60000})
		})

		it('Running query. Results rows appeared - click on results info for JFRC2 example of medulla', async () => {
			await click(page, 'button[id=run-query-btn]');
			await wait4selector(page, 'div[id=VFB_00030624-image-container]', { visible: true })
		})

		it('Term info correctly populated for example of Medulla after query results info button click', async () => {
			await page.evaluate(async selector =>   $("#VFB_00030624-image-container").find("img").click())
			await wait4selector(page, '#VFB_00030624_deselect_buttonBar_btn', { visible: true })
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("medulla on adult brain template JFRC2 (VFB_00030624)');
		})
	})


	describe('Test Stack Viewer Component', () => {
		it('Slice viewer present', async () => {
			await wait4selector(page, 'div#NewStackViewerdisplayArea', { visible: true })
		})

		it('Slice viewer component has 1 mesh rendered', async () => {
			expect(
					await page.evaluate(async () => Object.keys(StackViewer1.state.canvasRef.engine.meshes).length)
			).toBe(1)
		})

		it('Mesh from batch request id : %id present in stack viewer component', async () => {
			expect(
					await page.evaluate(async selector => StackViewer1.state.canvasRef.engine.meshes[selector + "." + selector + "_obj"].visible, 'VFB_00017894')
			).toBeTruthy()
		})
	})

	describe('Test Stack Viewer Component', () => {
		it('VFB_00017894.VFB_00017894_obj visibility correct', async () => {
			await page.waitFor(10000);
			expect(
					await page.evaluate(async () => StackViewer1.state.canvasRef.engine.meshes['VFB_00017894.VFB_00017894_obj'].visible)
			).toBeTruthy();
		});

		it('3D Plane not visible', async () => {
			expect(
					await page.evaluate(async () => CanvasContainer.engine.scene.children[4].visible)
			).toBeFalsy();
		});

		it('3D Plane not visible', async () => {
			await page.evaluate(async selector => {
				var stackViewerButtons = $("#NewStackViewerdisplayArea").find("button");
				stackViewerButtons[stackViewerButtons.length - 1].click();
			})

			await page.waitFor(3000);

			expect(
					await page.evaluate(async () => CanvasContainer.engine.scene.children[4].visible)
			).toBeTruthy();
		});

		it('Canvas container has 2 meshes rendered', async () => {
			expect(
					await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(1)
		})

		it('Slice viewer component has 2 meshes rendered', async () => {
			expect(
					await page.evaluate(async () => Object.keys(StackViewer1.state.canvasRef.engine.meshes).length)
			).toBe(1)
		})
	})
})
