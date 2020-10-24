const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, selectTab, findElementByText } from '../utils';
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
	it('Test Landing Page', async () => {
		await testLandingPage(page, 'VFB_00017894');
	})

	describe('Test Tree Browser Component', () => {
		it('Open Tree Browser', async () => {
			await selectTab(page, "Template ROI Browser");

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.rst__tree', { visible: true, timeout : 800000 });
		})

		it('First node in Tree Browser is correctly named', async () => {
			// Retrieve text from first node in Tree Browser
			let firstNode = await page.evaluate(async () => {
				return document.querySelectorAll(".rst__rowContents.rst__rowContentsDragDisabled span")[0].innerText;
			});
			// Check first node is Adult Brain
			expect(firstNode).toEqual("adult brain");
		})

		it('First node (adult brain) correctly expanded', async () => {
			// Click on first node of tree browser, 'adult brain'
			await page.evaluate(async () => document.getElementsByClassName("rst__rowContents rst__rowContentsDragDisabled")[0].click());
			// Wait for 'fa-eye-slashh' icon, means Tree Browser nodes were expanded
			await wait4selector(page, 'i.fa-eye-slash', {visible: true, timeout : 5000});
			// Retrieve text of expanded node for 'adult cerebral ganglion'
			let adultCerebralGanglionNode = await page.evaluate(async () => {
				return document.querySelectorAll(".rst__rowContents.rst__rowContentsDragDisabled span")[4].innerText;
			});
			// Test node for 'adult cerebral ganglion' exists
			expect(adultCerebralGanglionNode).toEqual("adult cerebral ganglion");
		})

		it('Expand node "adult cerebral ganglion"', async () => {
			// Click on third node of tree browser, 'adult cerebral ganglion'
			await page.evaluate(async () => document.getElementsByClassName("rst__rowContents rst__rowContentsDragDisabled")[2].click());
			// Check tree now expanded with adult cerebral ganglion name
			let firstNode = await page.evaluate(async () => {
				return document.getElementsByClassName("nodeSelected")[3].innerText;
			});
			expect(firstNode).toEqual("adult cerebrum");
		})

		it('Expand node "adult cerebrum"', async () => {
			// Click on third node of tree browser, 'adult cerebral ganglion'
			await page.evaluate(async () => document.getElementsByClassName("rst__rowContents rst__rowContentsDragDisabled")[3].click());
			// Check tree now expanded with 'adult deutocerebrum'
			let sixthNode = await page.evaluate(async () => {
				return document.getElementsByClassName("nodeSelected")[6].innerText;
			});
			expect(sixthNode).toEqual("adult deutocerebrum");
		})

		it('Click on Node "adult deutocerebrum"', async () => {
			await page.evaluate(async () => document.getElementsByClassName("nodeSelected")[6].click());
			// Check Term Info is now populated with adult cerebral ganglion name
			let element = await findElementByText(page, "adult deutocerebrum");
			expect(element).toBe("adult deutocerebrum");
			await page.waitFor(5000);
		})

		it('Open Tree Browser', async () => {
			await selectTab(page, "Template ROI Browser");

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.rst__tree', { visible: true, timeout : 800000 });
		})

		it('Click on "eye" icon to render "adult mushroom body" mesh', async () => {
			await page.evaluate(() => document.querySelectorAll('.rst__tree i.fa-eye-slash')[2].click());
			// Wait for 'color picker' selector to show, this is the sign that the click on the eye button worked and the mesh was rendered
			await wait4selector(page, 'i.fa-tint', { visible: true, timeout : 500000 });
		})

		it('Mesh for "adult mushroom body" rendered in canvas after clicking on eye icon next to node', async () => {
			expect(
					await page.evaluate(async () => CanvasContainer.engine.getRealMeshesForInstancePath('VFB_00030867.VFB_00030867_obj').length)
			).toEqual(1);
		})

		it('Color Picker Appears for "adult mushroom body"', async () => {
			await page.evaluate(async () => document.querySelectorAll('.rst__tree i.fa-tint')[0].click());
			// Wait for color picker to show
			await wait4selector(page, '#tree-color-picker', { visible: true, timeout : 500000 })
		})

		it('Use color picker to change color of "adult mushroom body"', async () => {
			// Retrieve old color in mesh
			let adultCerebralGanglionColor = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_00030867.VFB_00030867_obj"].children[0].material.color.getHexString();
			});
			// Select color in color picker box, index 17 belongs to last available color in picker
			await page.evaluate(async () => document.querySelectorAll("#tree-color-picker div")[17].click());
			// Wait couple of seconds for mesh to reflect new color
			await page.waitFor(20000);
			// Retrieve new color in mesh
			let adultCerebralGanglionNewColor = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_00030867.VFB_00030867_obj"].children[0].material.color.getHexString();
			});

			// Compare RGB's of original color and new color
			expect(adultCerebralGanglionColor).not.toEqual(adultCerebralGanglionNewColor);
		})

		it('Click on Node "adult mushroom body"', async () => {
			await page.evaluate(async () => document.getElementsByClassName("nodeSelected")[6].click());
			// Check Term Info is now populated with adult cerebral ganglion name
			let element = await findElementByText(page, "adult mushroom body");
			expect(element).toBe("adult mushroom body");
			await wait4selector(page, '#VFB_00030867_deselect_buttonBar_btn', { visible: true , timeout : 120000 });
			await page.waitFor(5000);
		})
	})

	describe('Add "Medulla"', () => {
		// Load Medulla using search component
		it('Search and Load "Medulla"', async () => {
			// Open search component and search for Medulla
			await wait4selector(page, 'i.fa-search', { visible: true, timeout : 10000 })
			await page.waitFor(10000);
			await click(page, 'i.fa-search');
			await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { visible: true , timeout : 10000});
			await page.focus(ST.SPOT_LIGHT_SEARCH_INPUT_SELECTOR);
			await page.keyboard.type('FBbt_00003748');
			await page.waitFor(10000);
			await page.keyboard.type(' ');
			await page.waitFor(5000);
			await wait4selector(page, '#paperResults', { visible: true , timeout : 50000 })

			// Click on Medulla from results page
			await page.evaluate(async () => {
				let tabs = document.getElementsByClassName('MuiListItem-root ');
				for ( var i = 0; i < tabs.length ; i ++ ) {
					if ( tabs[i].innerText === "medulla (FBbt_00003748)" ) {
						tabs[i].click();
					}
				}				
			});

			// Wait for drop down menu in searchs component to go away
			await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { hidden: true, timeout : 50000 });
		})

		it('Adult Brain remains root node after Medulla selection', async () => {
			await page.waitFor(10000);
			// Retrieve text from first node in Tree Browser
			let firstNode = await page.evaluate(async () => {
				return document.querySelectorAll(".rst__rowContents.rst__rowContentsDragDisabled span")[0].innerText;
			});
			expect(firstNode).toEqual("adult brain");
		})
	})
})
