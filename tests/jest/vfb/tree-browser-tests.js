const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from './cmdline.js';
import { wait4selector, click } from './utils';
import * as ST from './selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?i=VFB_00017894";

/**
 * Tests Menu Components
 */
describe('VFB Tree Browser Component Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(240000); 
		await page.goto(projectURL);

	});

	//Tests components in landing page are present
	describe('Test Landing Page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
		})

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toBe("Virtual Fly Brain");
		})
		
		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#VFBTermInfo_el_1_component', { visible: true , timeout : 120000})
		})

		it('Term info component correctly populated at startup', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("adult brain template JFRC2 (VFB_00017894)")', {timeout : 120000});
		})
	})

	//Tests opening control panel and clicking on row buttons
	describe('Test Tree Browser Component', () => {
		it('Open Tree Browser', async () => {
			await page.evaluate(async () => document.getElementById("Tools").click());
			// Check HTML 'UL' with class 'MuiList-root' is visible, this is the drop down menu
			await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 });
			await page.evaluate(async () => document.getElementById("Tree Browser").click());
			await wait4selector(page, '#VFBTree_component', { visible: true, timeout : 60000 })
		})

		it('First node in Tree Browser is correctly named', async () => {
			let firstNode = await page.evaluate(async () => {
				return document.querySelectorAll(".rst__rowContents.rst__rowContentsDragDisabled span")[0].innerText;
			});
			expect(firstNode).toEqual("adult brain");
		})

		it('First node (adult brain) correctly expanded', async () => {
			await page.evaluate(async () => document.getElementsByClassName("rst__rowContents rst__rowContentsDragDisabled")[0].click());
			await wait4selector(page, 'i.fa-eye', {visible: true, timeout : 5000});
			let adultCerebralGanglionNode = await page.evaluate(async () => {
				return document.querySelectorAll(".rst__rowContents.rst__rowContentsDragDisabled span")[4].innerText;
			});
			expect(adultCerebralGanglionNode).toEqual("adult cerebral ganglion");
		})

		it('Click on Node "adult cerebral ganglion"', async () => {
			await page.evaluate(async () => document.getElementsByClassName("nodeSelected")[2].click());
			// Check Term Info is now populated with adult cerebral ganglion name
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("adult cerebral ganglion (FBbt_00110636)")', {timeout : 60000});
		})

		it('Click on "eye" icon to render "adult cerebral ganglion" mesh', async () => {
			await click(page, 'i.fa-eye');
			await wait4selector(page, 'i.fa-tint', { visible: true, timeout : 240000 })
		})
		
		it('Mesh for "adult cerebral ganglion" rendered in canvas after clicking on eye icon next to node', async () => {
			expect(
					await page.evaluate(async () => CanvasContainer.engine.meshes["VFB_00030849.VFB_00030849_obj"].visible)
			).toBeTruthy();
		})
		
		it('Color Picker Appears for "adult cerebral ganglion"', async () => {
			await click(page, 'i.fa-tint');
			await wait4selector(page, '#tree-color-picker', { visible: true, timeout : 5000 })
		})
		
		it('Use color picker to change color of "adult cerebral ganglion"', async () => {
			// Retrieve old color in mesh
			let adultCerebralGanglionColor = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_00030849.VFB_00030849_obj"].children[0].material.color;
			});
			// Select color in color picker box, index 17 belongs to last available color in picker
			await page.evaluate(async () => document.querySelectorAll("#tree-color-picker div")[17].click());
			// Wait couple of seconds for mesh to reflect new color
			await page.waitFor(2000);
			// Retrieve new color in mesh
			let adultCerebralGanglionNewColor = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_00030849.VFB_00030849_obj"].children[0].material.color;
			});
			
			// Compare RGB's of original color and new color
			expect(adultCerebralGanglionColor.r).not.toEqual(adultCerebralGanglionNewColor.r);
			expect(adultCerebralGanglionColor.g).not.toEqual(adultCerebralGanglionNewColor.g);
			expect(adultCerebralGanglionColor.b).not.toEqual(adultCerebralGanglionNewColor.b);
		})
	})
})
