const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, flexWindowClick, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?i=VFB_00017894";

/**
 * Tests Tree Browser Component
 */
describe('VFB Tree Browser Component Tests', () => {
	beforeAll(async () => {
		//increases timeout to ~8 minutes
		jest.setTimeout(500000);
		await page.goto(projectURL);

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
	})

	//Tests opening control panel and clicking on row buttons
	describe('Test Tree Browser Component', () => {
		it('Open Tree Browser', async () => {
			page.on('console', msg => console.log('PAGE LOG:', msg.text()));
			//await page.evaluate(async () => document.getElementById("Tools").click());
			//// Check HTML 'UL' with class 'MuiList-root' is visible, this is the drop down menu
			//await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 });
			//await page.evaluate(async () => document.getElementById("Tree Browser").click());
			//await flexWindowClick("Tree Browser","flexlayout__tab_button_content");
			await page.evaluate(async () => {
				let unselectedTab = document.getElementsByClassName('flexlayout__tab_button--unselected')[0]
				let clickEvent = new MouseEvent('mousedown', {
					view: window,
					bubbles: true,
					cancelable: true
				});
				unselectedTab.dispatchEvent(clickEvent);

				clickEvent = new MouseEvent('mouseup', {
					view: window,
					bubbles: true,
					cancelable: true
				});
				unselectedTab.dispatchEvent(clickEvent);
			});

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.rst__tree', { visible: true, timeout : 800000 });
		})

		it('First node in Tree Browser is correctly named', async () => {
			// Retrieve text from first node in Tree Browser
			let firstNode = await page.evaluate(async () => {
				return document.querySelectorAll(".rst__rowContents.rst__rowContentsDragDisabled span")[0].innerText;
			});
			expect(firstNode).toEqual("adult brain");
		})

		it('First node (adult brain) correctly expanded', async () => {
			// Click on first node of tree browser, 'adult brain'
			await page.evaluate(async () => document.getElementsByClassName("rst__rowContents rst__rowContentsDragDisabled")[0].click());
			// Wait for 'fa-eye-slashh' icon, means Tree Browser nodes were expanded
			await wait4selector(page, 'i.fa-eye-slash', {visible: true, timeout : 5000});
			// Retrieve text of expanded node for 'adult cerebral
			let adultCerebralGanglionNode = await page.evaluate(async () => {
				return document.querySelectorAll(".rst__rowContents.rst__rowContentsDragDisabled span")[4].innerText;
			});
			expect(adultCerebralGanglionNode).toEqual("adult cerebral ganglion");
		})

		it('Expand node "adult cerebral ganglion"', async () => {
			// Click on third node of tree browser, 'adult cerebral ganglion'
			await page.evaluate(async () => document.getElementsByClassName("rst__rowContents rst__rowContentsDragDisabled")[2].click());
			// Check tree now expanded with adult cerebral ganglion name
			let firstNode = await page.evaluate(async () => {
				return document.getElementsByClassName("nodeSelected")[3].innerText;
			});
			expect(firstNode).toEqual("adult protocerebrum");
		})

		it('Expand node "adult protocerebrum"', async () => {
			// Click on third node of tree browser, 'adult cerebral ganglion'
			await page.evaluate(async () => document.getElementsByClassName("rst__rowContents rst__rowContentsDragDisabled")[3].click());
			// Check tree now expanded with adult cerebral ganglion name
			let sixthNode = await page.evaluate(async () => {
				return document.getElementsByClassName("nodeSelected")[6].innerText;
			});
			expect(sixthNode).toEqual("adult optic lobe");
		})

		it('Click on Node "adult optic lobe"', async () => {
			await page.evaluate(async () => document.getElementsByClassName("nodeSelected")[6].click());
			// Check Term Info is now populated with adult cerebral ganglion name
			let element = await findElementByText(page, "adult optic lobe");
	        expect(element).toBe("adult optic lobe");
		})
		
		it('Open Tree Browser', async () => {
			page.on('console', msg => console.log('PAGE LOG:', msg.text()));
			//await page.evaluate(async () => document.getElementById("Tools").click());
			//// Check HTML 'UL' with class 'MuiList-root' is visible, this is the drop down menu
			//await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 });
			//await page.evaluate(async () => document.getElementById("Tree Browser").click());
			//await flexWindowClick("Tree Browser","flexlayout__tab_button_content");
			await page.evaluate(async () => {
				let unselectedTab = document.getElementsByClassName('flexlayout__tab_button--unselected')[0]
				let clickEvent = new MouseEvent('mousedown', {
					view: window,
					bubbles: true,
					cancelable: true
				});
				unselectedTab.dispatchEvent(clickEvent);

				clickEvent = new MouseEvent('mouseup', {
					view: window,
					bubbles: true,
					cancelable: true
				});
				unselectedTab.dispatchEvent(clickEvent);
			});

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.rst__tree', { visible: true, timeout : 500000 });
		})

		it('Click on "eye" icon to render "adult optic lobe" mesh', async () => {
			await page.evaluate(() => document.querySelectorAll('.rst__tree i.fa-eye-slash')[3].click());
			// Wait for 'color picker' selector to show, this is the sign that the click on the eye button worked and the mesh was rendered
			await wait4selector(page, 'i.fa-tint', { visible: true, timeout : 500000 });
		})

		it('Mesh for "adult optic lobe" rendered in canvas after clicking on eye icon next to node', async () => {
			expect(
				await page.evaluate(async () => CanvasContainer.engine.getRealMeshesForInstancePath('VFB_00030870.VFB_00030870_obj').length)
			).toEqual(1);
		})

		it('Color Picker Appears for "adult optic lobe"', async () => {
			await page.evaluate(async () => document.querySelectorAll('.rst__tree i.fa-tint')[0].click());
			// Wait for color picker to show
			await wait4selector(page, '#tree-color-picker', { visible: true, timeout : 500000 })
		})

		it('Use color picker to change color of "adult optic lobe"', async () => {
			// Retrieve old color in mesh
			let adultCerebralGanglionColor = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_00030870.VFB_00030870_obj"].children[0].material.color.getHexString();
			});
			// Select color in color picker box, index 17 belongs to last available color in picker
			await page.evaluate(async () => document.querySelectorAll("#tree-color-picker div")[17].click());
			// Wait couple of seconds for mesh to reflect new color
			await page.waitFor(20000);
			// Retrieve new color in mesh
			let adultCerebralGanglionNewColor = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_00030870.VFB_00030870_obj"].children[0].material.color.getHexString();
			});

			// Compare RGB's of original color and new color
			expect(adultCerebralGanglionColor).not.toEqual(adultCerebralGanglionNewColor);
		})
	})
})
