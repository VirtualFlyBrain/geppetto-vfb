const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, findElementByText, selectTab} from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?id=VFB_jrchk4wj&i=VFB_00101567";

/**
 * Opens Controls Menu inside Layers Component
 */
const openControls = async (page, text) => {
	await page.evaluate(async (text) => {
		let elems = Array.from(document.querySelectorAll('.vfbListViewer .griddle-row'));
		for (var i = 0; i < elems.length; i++) {
			if (elems[i].innerText.includes(text)) {
				elems[1].querySelector(".fa-angle-down").click()
				break;
			}
		}
	}, text);
	await wait4selector(page, '#simple-popper', { visible: true, timeout : 5000 });
}

/**
 * Clicks on Controls Menu menu items
 */
const clickLayerControlsElement = async (page, text) => page.evaluate(async (text ) => {
	let controls = document.getElementsByClassName('menu-item-label');
	for ( var i = 0; i < controls.length ; i ++ ) {
		if ( controls[i].innerText === text ) {
			controls[i].click();
		}
	}
}, text);

/**
 * Tests Layers Component
 */
describe('VFB Layer Component Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(120000);
		await page.goto(PROJECT_URL);
	});

	//Tests components in landing page are present
	it('Test Landing Page', async () => {
		await testLandingPage(page, 'VFB_jrchk4wj');
	}, 120000)

	// Tests opening control panel and clicking on row buttons
	describe('Test Layers Component', () => {
		it('Open Layers Component', async () => {
			await selectTab(page, "Layers");

			// Check that the Layers component is visible
			await wait4selector(page, 'div.listviewer-container', { visible: true, timeout : 800000 });
		}, 800000) 

		// Tests Layer component opens up and that is populated with expected 2 rows
		it('The control panel opened with right amount of rows.', async () => {
			const rows = await page.evaluate(async selector => $(selector).length, ST.STANDARD_ROW_SELECTOR);
			expect(rows).toEqual(2);
		}, 30000) // Increased timeout to 30 seconds
	});

	// Tests opening Layer component and clicking on row buttons
	describe('Test Layers Component Controls', () => {
		// Open controls menu
		it('Open Controls Menu', async () => {
			await page.waitFor(3000);
			await openControls(page, "PVLP142_R (FlyEM-HB:5812987602)");
		})

		// Check VFB_jrchk4wj neuron is selected by default, should be the case since it was last one to load
		it('Instance VFB_jrchk4wj Selected', async () => {
			const color = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].material.color.getHexString()
			});
			expect(color).toEqual("ffcc00");
		})

		// Click on control's option to deselect VFB_jrchk4wj instance and check is now deselected
		it('Unselect VFB_jrchk4wj Instance', async () => {
			await clickLayerControlsElement(page, 'Unselect');
			await page.waitFor(3000);
			const color = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].material.color.getHexString()
			});
			expect(color).toEqual("00ff00");
		})

		// Click on control's option to hide VFB_jrchk4wj instance and check is now hidden
		it('Hide VFB_jrchk4wj Instance', async () => {
			await openControls(page, "PVLP142_R (FlyEM-HB:5812987602)");
			await clickLayerControlsElement(page, 'Hide');
			await page.waitFor(2000);
			const visible = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].visible
			});
			expect(visible).toEqual(false);
		})

		// Click on control's option to show VFB_jrchk4wj instance and check is now visible
		it('Show VFB_jrchk4wj Instance', async () => {
			await openControls(page, "PVLP142_R (FlyEM-HB:5812987602)");
			await clickLayerControlsElement(page, 'Show');
			await page.waitFor(2000);
			const visible = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].visible
			});
			expect(visible).toEqual(true);
		})

		// Click on control's option to zoom to VFB_jrchk4wj instance and check is now zoom in
		it('Zoom To VFB_jrchk4wj Instance', async () => {
			await openControls(page, "PVLP142_R (FlyEM-HB:5812987602)");
			await clickLayerControlsElement(page, 'Zoom To');
			await page.waitFor(2000);
			const zoomTo = await page.evaluate(async () => {
				var position = CanvasContainer.engine.camera.position;
				return [position.x, position.y, position.z]
			});
			expect(zoomTo).toEqual([291.508, 142.322, -85.403]);
		})

		// Click on control's option to disable VFB_jrchk4wj skeleton and check is now hidden
		it('Disable Skeleton For VFB_jrchk4wj Instance', async () => {
			await openControls(page, "PVLP142_R (FlyEM-HB:5812987602)");
			await clickLayerControlsElement(page, 'Disable 3D Skeleton');
			await page.waitFor(2000);
			const disableVolume = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].visible
			});
			expect(disableVolume).toEqual(false);
		})

		// Click on control's option to enable VFB_jrchk4wj skeleton and check is now visible
		it('Enable Skeleton For VFB_jrchk4wj Instance', async () => {
			await openControls(page, "PVLP142_R (FlyEM-HB:5812987602)");
			await clickLayerControlsElement(page, 'Enable 3D Skeleton');
			await page.waitFor(2000);
			const enableVolume = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].visible
			});
			expect(enableVolume).toEqual(true);
		})

		// Click on control's option to enable VFB_jrchk4wj 3d Volume and check is now visible
		it('Enable 3D Volume For VFB_jrchk4wj Instance', async () => {
			await openControls(page, "PVLP142_R (FlyEM-HB:5812987602)");
			await clickLayerControlsElement(page, 'Enable 3D Volume');
			await page.waitFor(15000);
			const enableVolume = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_obj"].visible
			});
			expect(enableVolume).toEqual(true);
		}, 30000) // Increased timeout to 20 seconds

		// Click on control's option to disable VFB_jrchk4wj 3d Volume and check is now hidden
		it('Disable 3D Volume For VFB_jrchk4wj Instance', async () => {
			await openControls(page, "PVLP142_R (FlyEM-HB:5812987602)");
			await clickLayerControlsElement(page, 'Disable 3D Volume');
			await page.waitFor(15000);
			const disableVolume = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_obj"].visible
			});
			expect(disableVolume).toEqual(false);
		}, 30000)

		// Click on control's option to show info for VFB_jrchk4wj instance and check term info opens up with instance
		it('Show Info For VFB_jrchk4wj Instance', async () => {
			await openControls(page, "PVLP142_R (FlyEM-HB:5812987602)");
			await clickLayerControlsElement(page, 'Show Info');
			await page.waitFor(2000);
			await wait4selector(page, 'div#vfbterminfowidget', { visible: true, timeout : 500000});
			await wait4selector(page, '#VFB_jrchk4wj_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		})

		// Re open layers component
		it('Open Layers Component', async () => {
			await selectTab(page, "Layers");

			// Check that the Layers component is visible
			await wait4selector(page, 'div.listviewer-container', { visible: true, timeout : 800000 });
		})

		// Open color picker to change color of VFB_jrchk4wj
		it('Color Picker Appears for VFB_jrchk4wj', async () => {
			await openControls(page, "PVLP142_R (FlyEM-HB:5812987602)");
			await clickLayerControlsElement(page, 'Color');
			await wait4selector(page, 'div.chrome-picker', { visible: true, timeout : 500000 })
		})

		// Chance color of VFB_jrchk4wj instance using controls
		it('Use color picker to change color of VFB_jrchk4wj', async () => {
			// Retrieve old color in mesh
			await page.waitFor(2000);
			let meshColor = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].material.color.getHexString();
			});
			
			expect(meshColor).toEqual("ffcc00");
			
			await expect(page).toFill('input[value="#00FF00"]', '#f542e6')
			await page.waitFor(15000);
			// Retrieve new color in mesh
			let newColor = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].material.color.getHexString();
			});

			expect(newColor).toEqual('f542e6');
		}, 30000)

		// Click on control's option to delete VFB_jrchk4wj instance and check is now gone
		it('Delete VFB_jrchk4wj Instance', async () => {
			await openControls(page, "PVLP142_R (FlyEM-HB:5812987602)");
			await clickLayerControlsElement(page, 'Delete');
			await page.waitFor(2000);

			let instance = await page.evaluate(async () => {
				return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"];
			});

			expect(instance).toEqual(undefined);
		}, 30000)
	})
})
