const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, selectTab, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?i=VFB_00017894";

const expandTreeNode = async (page, text) => page.evaluate(async (text ) => {
	let elems = Array.from(document.querySelectorAll('.rst__nodeContent'));
	let found = "";

	for (var i = 0; i < elems.length; i++) {
		if (elems[i] !== undefined ) {
			if (elems[i].innerText!== undefined ) {
				if (elems[i].innerText.split("\n")[0]  === text) {
					elems[i].getElementsByClassName("rst__rowContents rst__rowContentsDragDisabled")[0].click();
					break;
				}
			}
		}
	}
}, text);

const clickTreeNode = async (page, text) => page.evaluate(async (text ) => {
	let elems = Array.from(document.querySelectorAll('.rst__nodeContent'));
	let found = "";

	for (var i = 0; i < elems.length; i++) {
		if (elems[i] !== undefined ) {
			if (elems[i].innerText!== undefined ) {
				if (elems[i].innerText.split("\n")[0]  === text) {
					elems[i].getElementsByClassName("nodeSelected")[0].click();
					break;
				}
			}
		}
	}
}, text);

const clickNodeIcon = async (page, text, icon) => page.evaluate(async (text, icon ) => {
	let elems = Array.from(document.querySelectorAll('.rst__nodeContent'));
	let found = "";

	for (var i = 0; i < elems.length; i++) {
		if (elems[i] !== undefined ) {
			if (elems[i].innerText!== undefined ) {
				if (elems[i].innerText.split("\n")[0]  === text) {
					elems[i].getElementsByClassName(icon)[0].click();
					break;
				}
			}
		}
	}
}, text, icon);

/**
 * Tests Tree Browser Component
 */
describe('VFB Tree Browser Component Tests', () => {
	beforeAll(async () => {
		//increases timeout to ~8 minutes
		jest.setTimeout(800000);
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
			await expandTreeNode(page, "adult brain");
			// Wait for 'fa-eye-slashh' icon, means Tree Browser nodes were expanded
			await wait4selector(page, 'i.fa-eye-slash', {visible: true, timeout : 5000});
			// Test node for 'adult central brain' exists
			let element = await findElementByText(page, "adult cerebral ganglion");
			expect(element).toBe("adult cerebral ganglion");
		})

		it('Expand node "adult cerebral ganglion"', async () => {
			// Click on third node of tree browser, 'adult cerebrum'
			await expandTreeNode(page, "adult cerebral ganglion");
			await page.waitFor(5000);
			// Check tree now expanded with adult cerebral ganglion name
			let element = await findElementByText(page, "adult cerebrum");
			expect(element).toEqual("adult cerebrum");
		})

		it('Expand node "adult cerebrum"', async () => {
			// Click on third node of tree browser, 'adult cerebral ganglion'
			await expandTreeNode(page, "adult cerebrum");
			await page.waitFor(5000);
			// Test node for 'adult central brain' exists
			let element = await findElementByText(page, "adult deutocerebrum");
			expect(element).toEqual("adult deutocerebrum");
		})

		it('Click on Node "adult deutocerebrum"', async () => {
			await clickTreeNode(page, "adult deutocerebrum");
			await page.waitFor(5000);
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
			await clickNodeIcon(page, "adult mushroom body", 'fa-eye-slash');
			// Wait for 'color picker' selector to show, this is the sign that the click on the eye button worked and the mesh was rendered
			await wait4selector(page, 'i.fa-tint', { visible: true, timeout : 500000 });
		})

		it('Mesh for "adult mushroom body" rendered in canvas after clicking on eye icon next to node', async () => {
			expect(
				await page.evaluate(async () => CanvasContainer.engine.getRealMeshesForInstancePath('VFB_00030867.VFB_00030867_obj').length)
			).toEqual(1);
		})

		it('Color Picker Appears for "adult mushroom body"', async () => {
			await clickNodeIcon(page, "adult mushroom body", 'fa-tint');
			// Wait for color picker to show
			await wait4selector(page, '#tree-color-picker', { visible: true, timeout : 500000 })
		})

		it('Use color picker to change color of "adult mushroom body"', async () => {
			// Retrieve old color in mesh
			let adultCerebralGanglionColor = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_00030867.VFB_00030867_obj"].children[0].material.color.getHexString();
			});
			expect(adultCerebralGanglionColor).toEqual("ffcc00");
			await expect(page).toFill('input[value="#00FF00"]', '#f542e6');
		})

		it('Click on Node "adult mushroom body"', async () => {
			await clickTreeNode(page, "adult mushroom body");
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
			await click(page, 'i.fa-search');
		    await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { visible: true });
		    await page.focus(ST.SPOT_LIGHT_SEARCH_INPUT_SELECTOR);
		    await page.keyboard.type('FBbt_00003748');
		    await page.waitFor(10000);
		    await page.keyboard.type(' ');
		    await page.waitFor(5000);
		    await wait4selector(page, '#paperResults', { visible: true , timeout : 50000 })

		    await page.evaluate(async () => {
			  let tabs = document.getElementsByClassName('MuiListItem-root ');
			  for ( var i = 0; i < tabs.length ; i ++ ) {
			    if ( tabs[i].innerText.split('\n')[0] === "medulla (FBbt_00003748)" ) {
		  		  tabs[i].click();
				}
			   }
			});
		    await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { hidden: true, timeout : 50000 });
		})

		// Check Medulla is focus term
		it('Medulla loaded as the focus term', async () => {
			await page.waitFor(5000);
			// Check Medulla actually loaded
			let element = await findElementByText(page, "medulla");
			expect(element).toBe("medulla");
		})

		it('Open Tree Browser', async () => {
			await selectTab(page, "Template ROI Browser");

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div.rst__tree', { visible: true, timeout : 800000 });
		})

		it('Adult Brain remains root node after Medulla selection', async () => {
			await page.waitFor(2000);
			// Retrieve text from first node in Tree Browser
			let firstNode = await page.evaluate(async () => {
				return document.querySelector(".nodeFound").innerText;
			});
			expect(firstNode).toEqual("medulla");
		})
	})
})
