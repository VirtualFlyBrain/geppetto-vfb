const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, flexWindowClick, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto";

const firstTest = "?i=VFB_00017894";
const secondTest = "?id=VFB_00017894&i=VFB_00000001";
const thirdTest = "?id=FBbt_00003678&i=VFB_00017894,VFB_00030624";

/**
 * Tests Term Context Component
 */
describe('VFB Term Context Component Tests', () => {
	beforeAll(async () => {
		//increases timeout to ~8 minutes
		jest.setTimeout(300000);
		page.on('dialog', async dialog => {
			await dialog.accept("OK");
		});
	});

	describe('Test 1 : Test Progress Bar for Loading 1 Instance', () => {
		it('Launch VFB', async () => {
			await page.goto(projectURL + firstTest);
		})

		it('Test Landing Page', async () => {
			const title = await page.title();
			expect(title).toBe("Virtual Fly Brain");
		})

		it('Waited for Loading Progress Bar to Appear', async () => {
			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.progress-bar', { visible: true, timeout : 300000 });
		})

		it('Progress Bar Loading 1 Instance(s)', async () => {
			expect(
				await page.evaluate(async () => document.getElementsByClassName("progress-bar")[0].getAttribute("datalabel"))
			).toBe("Loading 1/1 ...");
		})
	})

	describe('Loader Finished, Test 1 Instance was Loaded', () => {				
		it('Progress Bar Hidden After Loading of Instances', async () => {
			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.progress-bar', { hidden: true, timeout : 800000 });
		})

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true , timeout : 60000 })
			await wait4selector(page, '#VFB_00017894_deselect_buttonBar_btn', { visible: true , timeout : 60000 })
		})

		it('SliceViewer present', async () => {
			await wait4selector(page, 'div#NewStackViewerdisplayArea', { visible: true , timeout : 60000})
		})

		it('Mesh from batch request id : VFB_00017894.VFB_00017894_obj present in stack viewer component', async () => {
			expect(
					await page.evaluate(async selector => StackViewer1.state.canvasRef.engine.meshes["VFB_00017894.VFB_00017894_obj"].visible)
			).toBeTruthy()
		})

		it("Canvas container component has 1 mesh rendered", async () => {
			expect(
				await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(1)
		})
	})
	
	describe('Test 2 : Test Progress Bar for Loading 2 Instances', () => {
		it('Launch VFB', async () => {
			await page.goto(projectURL + secondTest);
		})

		it('Test Landing Page', async () => {
			const title = await page.title();
			expect(title).toBe("Virtual Fly Brain");
		})

		it('Waited for Loading Progress Bar to Appear', async () => {
			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.progress-bar', { visible: true, timeout : 60000 });
		})

		it('Progress Bar Loading 1 Instance(s)', async () => {
			expect(
				await page.evaluate(async () => document.getElementsByClassName("progress-bar")[0].getAttribute("datalabel"))
			).toBe("Loading 1/2 ...");
		})
	})

	describe('Loader Finished, Test 2 Instances were Loaded', () => {				
		it('Progress Bar Hidden After Loading of Instances', async () => {
			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.progress-bar', { hidden: true, timeout : 800000 });
		})

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true , timeout : 60000 })
			await wait4selector(page, '#VFB_00000001_deselect_buttonBar_btn', { visible: true , timeout : 60000 })
		})

		it('SliceViewer present', async () => {
			await wait4selector(page, 'div#NewStackViewerdisplayArea', { visible: true , timeout : 60000})
		})

		it("Mesh from batch request id : VFB_00000001 present in stack viewer component", async () => {
			expect(
				await page.evaluate(async () => StackViewer1.state.canvasRef.engine.meshes['VFB_00000001.VFB_00000001_swc'].visible)
			).toBeTruthy()
		})

		it("Canvas container component has 2 mesh(es) rendered", async () => {
			expect(
				await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(2)
		})
	})
	
	describe('Test 3 : Test Progress Bar for Loading 3 Instances', () => {
		it('Launch VFB', async () => {
			await page.goto(projectURL + thirdTest);
		})

		it('Test Landing Page', async () => {
			const title = await page.title();
			expect(title).toBe("Virtual Fly Brain");
		})

		it('Waited for Loading Progress Bar to Appear', async () => {
			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.progress-bar', { visible: true, timeout : 60000 });
		})

		it('Progress Bar Loading 3 Instance(s)', async () => {
			expect(
				await page.evaluate(async () => document.getElementsByClassName("progress-bar")[0].getAttribute("datalabel"))
			).toBe("Loading 1/3 ...");
		})
	})

	describe('Loader Finished, Test 3 Instances Were Loaded', () => {				
		it('Progress Bar Hidden After Loading of Instances', async () => {
			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.progress-bar', { hidden: true, timeout : 300000 });
		})

		it('Term info component created after load with FBbt_00003678', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true , timeout : 60000 })
			let element = await findElementByText(page, "ellipsoid body");
			expect(element).toBe("ellipsoid body");
		})

		it('SliceViewer present', async () => {
			await wait4selector(page, 'div#NewStackViewerdisplayArea', { visible: true , timeout : 60000})
		})

		it("Mesh from batch request id : VFB_00017894 present in stack viewer component", async () => {
			expect(
				await page.evaluate(async () => StackViewer1.state.canvasRef.engine.meshes['VFB_00017894.VFB_00017894_obj'].visible)
			).toBeTruthy()
		})
		
		it("Mesh from batch request id : VFB_00030624 present in stack viewer component", async () => {
			expect(
				await page.evaluate(async () => StackViewer1.state.canvasRef.engine.meshes['VFB_00030624.VFB_00030624_obj'].visible)
			).toBeTruthy()
		})

		it("Canvas container component has 2 mesh(es) rendered", async () => {
			expect(
				await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(2)
		})
	})
})
