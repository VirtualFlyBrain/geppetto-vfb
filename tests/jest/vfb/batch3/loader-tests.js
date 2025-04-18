const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, flexWindowClick, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto";

const firstTest = "?i=VFB_00017894";
const secondTest = "?id=VFB_00000001&i=VFB_00017894";
const thirdTest = "?id=FBbt_00003678&i=VFB_00017894,VFB_00030624";

/**
 * Tests Loader Component
 */
describe('VFB Loader Component Tests', () => {
	beforeAll(async () => {
		//increases timeout to ~8 minutes
		jest.setTimeout(300000);
		// Press OK once alert window opens up asking if it's okay to load instance of different template
		page.on('dialog', async dialog => {
			await dialog.accept("OK");
		});
	});

	// First Test cases, loading only 1 instance
	describe('Test 1 : Test Progress Bar for Loading 1 Instance', () => {
		it('Launch VFB', async () => {
			await page.goto(projectURL + firstTest);
		})

		// Check Page was loaded by checking on the page title
		it('Test Landing Page', async () => {
			const title = await page.title();
			expect(title).toMatch("Virtual Fly Brain");
		})

		// Check for appearance of Loading component on top right corner
		it('Waited for Loading Progress Bar to Appear', async () => {
			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.progress-bar', { visible: true, timeout : 300000 });
		})

		// Check Loading component is loading '1/1' instance
		it('Progress Bar Loading 1 Instance(s)', async () => {
			expect(
					await page.evaluate(async () => document.getElementsByClassName("progress-bar")[0].getAttribute("datalabel"))
			).toBe("Loading 1/1 ...");
		})
	})

	// Once Loader is done, check all is correctly loaded
	describe('Loader Finished, Test 1 Instance was Loaded', () => {
		// Check that progress bar has disappeared
		it('Progress Bar Hidden After Loading of Instances', async () => {
			await wait4selector(page, 'div.progress-bar', { hidden: true, timeout : 800000 });
		}, 120000)

		// Check that the Term Info component has the instance loaded
		it('Term info component created and populated after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true , timeout : 60000 })
			await wait4selector(page, '#VFB_00017894_deselect_buttonBar_btn', { visible: true , timeout : 60000 })
		})

		// Check that the Slice Viewer exists and the instance is loaded
		it('Mesh from batch request id : VFB_00017894.VFB_00017894_obj present in stack viewer component', async () => {
			// Check slice viewer is visible
			await wait4selector(page, 'div#NewStackViewerdisplayArea', { visible: true , timeout : 60000})
			// Check Slice Viewer has instance loaded
			expect(
				await page.evaluate(async selector => StackViewer1.state.canvasRef.engine.meshes["VFB_00017894.VFB_00017894_obj"].visible)
			).toBeTruthy()
		})

		// Check that the Canvas in 3D Viewer component is loaded
		it("Canvas container component has 1 mesh rendered", async () => {
			expect(
				await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(1)
		})
	})

	// Second test cases, loading 2 instances
	describe('Test 2 : Test Progress Bar for Loading 2 Instances', () => {
		it('Launch VFB', async () => {
			await page.goto(projectURL + secondTest);
		}, 120000)

		it('Test Landing Page', async () => {
			const title = await page.title();
			expect(title).toMatch("Virtual Fly Brain");
		})

		// Check that the Loading component appears in top right corner
		it('Waited for Loading Progress Bar to Appear', async () => {
			await wait4selector(page, 'div.progress-bar', { visible: true, timeout : 60000 });
		})

		// Check that the Loading component bar has correct text displayed, 'Loading 1/2/'
		it('Progress Bar Loading 1 Instance(s)', async () => {
			expect(
				await page.evaluate(async () => document.getElementsByClassName("progress-bar")[0].getAttribute("datalabel"))
			).toBe("Loading 1/2 ...");
		})
	})

	// 2 instances are finished loading, check they were loaded in other components too
	describe('Loader Finished, Test 2 Instances were Loaded', () => {
		// Check that the progress bar is gone after 2 instances are done loading
		it('Progress Bar Hidden After Loading of Instances', async () => {
			await wait4selector(page, 'div.progress-bar', { hidden: true, timeout : 800000 });
		}, 800000)

		// Check that the Term Info was contains the second instance loaded
		it('Term info component created and populated after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true , timeout : 60000 })
			await wait4selector(page, '#VFB_00000001_deselect_buttonBar_btn', { visible: true , timeout : 60000 })
		}, 120000)

		// Check that the Slice Viewer exists and has the 2 instances loaded
		it("Slice Viewer created with 2 instances, VFB_00000001 and VFB_00017894", async () => {
			// Check Slice Viewer is visible
			await wait4selector(page, 'div#NewStackViewerdisplayArea', { visible: true , timeout : 60000})
			// Check Slice Viewer has 2 instances loaded
			expect(
				await page.evaluate(async () => StackViewer1.state.canvasRef.engine.meshes['VFB_00017894.VFB_00017894_obj'].visible)
			).toBeTruthy()
			expect(
				await page.evaluate(async () => StackViewer1.state.canvasRef.engine.meshes['VFB_00000001.VFB_00000001_swc'].visible)
			).toBeTruthy()
		}, 120000)

		// Check that the canvas inside 3D Viewer has two meshes for the two instances
		it("Canvas container component has 2 mesh(es) rendered", async () => {
			expect(
				await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(2)
		}, 120000)
	})

	// Third set of test cases, tests loading 3 instances
	describe('Test 3 : Test Progress Bar for Loading 3 Instances', () => {
		it('Launch VFB', async () => {
			await page.goto(projectURL + thirdTest);
		}, 120000)

		// Test landing page was reached by checking title
		it('Test Landing Page', async () => {
			const title = await page.title();
			expect(title).toMatch("Virtual Fly Brain");
		})

		// Check the existence of a loading bar in top right corner
		it('Waited for Loading Progress Bar to Appear', async () => {
			await wait4selector(page, 'div.progress-bar', { visible: true, timeout : 60000 });
		})

		// Check that the progress bar text shows is loading 3 instances
		it('Progress Bar Loading 3 Instance(s)', async () => {
			const datalabel = await page.evaluate(async () => 
				document.getElementsByClassName("progress-bar")[0].getAttribute("datalabel")
			);
			expect(datalabel).toMatch(/Loading \d+\/3 \.\.\./);
		})
	})

	// Once 3 instances are done loading, check all components are loaded with them
	describe('Loader Finished, Test 3 Instances Were Loaded', () => {
		// Check that the progress bar is gone, which means instances have loaded
		it('Progress Bar Hidden After Loading of Instances', async () => {
			await wait4selector(page, 'div.progress-bar', { hidden: true, timeout : 300000 });
		}, 120000)

		// Check Term Info has loaded the last instance added
		it('Term info component created and populated after load with FBbt_00003678', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true , timeout : 60000 })
			let element = await findElementByText(page, "ellipsoid body");
			expect(element).toBe("ellipsoid body");
		})

		// Check that the Slice Viewer has 2 instances loaded, FBbt_00003678 isn't a visual capability so we don't search for it here
		it("Slice Viewer created with 2 instances, VFB_00030624 and VFB_00017894", async () => {
			// Check Slice Viewer exists
			await wait4selector(page, 'div#NewStackViewerdisplayArea', { visible: true , timeout : 60000});
			// Checks instances are loaded inside Slice Viewer
			expect(
				await page.evaluate(async () => StackViewer1.state.canvasRef.engine.meshes['VFB_00017894.VFB_00017894_obj'].visible)
			).toBeTruthy()
			expect(
				await page.evaluate(async () => StackViewer1.state.canvasRef.engine.meshes['VFB_00030624.VFB_00030624_obj'].visible)
			).toBeTruthy()
		}, 120000)

		// Check that the 3D Viewer has 2 instances loaded, FBbt_00003678 isn't a visual capability so we don't search for it here
		it("Canvas container component has 2 mesh(es) rendered", async () => {
			expect(
				await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(2)
		}, 120000)
	})
})
