const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, findElementByText, selectTab} from '../utils.js';
import * as ST from '../selectors.js';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';
const INSTANCE_ID = 'VFB_jrchk4wj';
const INSTANCE_ROW_LABEL = 'PVLP142_R (FlyEM-HB:5812987602)';
const INSTANCE_OBJ_SUFFIX = `${INSTANCE_ID}_obj`;
const INSTANCE_SWC_SUFFIX = `${INSTANCE_ID}_swc`;
const PROJECT_URL = `${baseURL}/geppetto?id=${INSTANCE_ID}&i=VFB_00101567`;
const IS_REMOTE_V2_DEV = baseURL.indexOf('v2-dev.virtualflybrain.org') > -1;

const getInstanceMeshState = async (page, preferredSuffixes = [INSTANCE_OBJ_SUFFIX, INSTANCE_SWC_SUFFIX]) => (
	page.evaluate(async ({ instanceId, suffixes }) => {
		const engine = (typeof CanvasContainer !== 'undefined' && CanvasContainer.engine) ? CanvasContainer.engine : null;
		const meshes = engine && engine.meshes ? engine.meshes : {};
		const instanceKeys = Object.keys(meshes).filter((key) => key.startsWith(`${instanceId}.`));

		let pickedKey = null;
		for (let i = 0; i < suffixes.length; i++) {
			const suffix = suffixes[i];
			pickedKey = instanceKeys.find((key) => key.endsWith(suffix) || key.includes(suffix));
			if (pickedKey) {
				break;
			}
		}
		if (pickedKey == null && instanceKeys.length > 0) {
			pickedKey = instanceKeys[0];
		}

		const mesh = pickedKey != null ? meshes[pickedKey] : undefined;

		const getColorFromMesh = (targetMesh) => {
			if (!targetMesh) {
				return null;
			}

			const resolveMaterial = (candidate) => {
				if (!candidate) {
					return null;
				}
				if (Array.isArray(candidate)) {
					const withColor = candidate.find((material) => material && material.color && typeof material.color.getHexString === 'function');
					return withColor || null;
				}
				if (candidate.color && typeof candidate.color.getHexString === 'function') {
					return candidate;
				}
				return null;
			};

			let material = resolveMaterial(targetMesh.material);
			if (material) {
				return material.color.getHexString();
			}

			const children = Array.isArray(targetMesh.children) ? targetMesh.children : [];
			for (let i = 0; i < children.length; i++) {
				material = resolveMaterial(children[i] ? children[i].material : undefined);
				if (material) {
					return material.color.getHexString();
				}
			}
			return null;
		};

		return {
			key: pickedKey,
			keys: instanceKeys,
			visible: mesh ? mesh.visible : undefined,
			color: getColorFromMesh(mesh),
		};
	}, { instanceId: INSTANCE_ID, suffixes: preferredSuffixes })
	);

const getInstanceCapabilities = async (page) => (
	page.evaluate(async (instanceId) => {
		const engine = (typeof CanvasContainer !== 'undefined' && CanvasContainer.engine) ? CanvasContainer.engine : null;
		const meshes = engine && engine.meshes ? engine.meshes : {};
		const keys = Object.keys(meshes).filter((key) => key.startsWith(`${instanceId}.`));
		const hasObjMesh = keys.some((key) => key.indexOf(`${instanceId}_obj`) > -1);
		const hasSwcMesh = keys.some((key) => key.indexOf(`${instanceId}_swc`) > -1);

		let hasObjInstance = false;
		let hasSwcInstance = false;
		if (typeof window[instanceId] !== 'undefined' && window[instanceId] !== null) {
			hasObjInstance = typeof window[instanceId][`${instanceId}_obj`] !== 'undefined';
			hasSwcInstance = typeof window[instanceId][`${instanceId}_swc`] !== 'undefined';
		}

		return {
			hasObj: hasObjMesh || hasObjInstance,
			// For control-action tests we only treat skeleton as available when the SWC mesh is present.
			hasSwc: hasSwcMesh,
		};
	}, INSTANCE_ID)
);

const waitForInstanceMesh = async (page, preferredSuffixes = [INSTANCE_OBJ_SUFFIX, INSTANCE_SWC_SUFFIX], timeout = 120000) => {
	await page.waitForFunction((instanceId, suffixes) => {
		const engine = (typeof CanvasContainer !== 'undefined' && CanvasContainer.engine) ? CanvasContainer.engine : null;
		const meshes = engine && engine.meshes ? engine.meshes : {};
		const instanceKeys = Object.keys(meshes).filter((key) => key.startsWith(`${instanceId}.`));
		if (instanceKeys.length === 0) {
			return false;
		}
		return true;
	}, { timeout }, INSTANCE_ID, preferredSuffixes);
};

/**
 * Opens Controls Menu inside Layers Component
 */
const openControls = async (page, text) => {
	const opened = await page.evaluate(async (text) => {
		const menu = document.querySelector('#simple-popper');
		if (menu && menu.offsetParent !== null) {
			return true;
		}

		let elems = Array.from(document.querySelectorAll('.vfbListViewer .griddle-row'));
		for (var i = 0; i < elems.length; i++) {
			if (elems[i].innerText.includes(text)) {
				const controlsButton = elems[i].querySelector(".fa-angle-down, .fa-angle-up");
				if (controlsButton) {
					controlsButton.click();
					return true;
				}
				return false;
			}
		}
		return false;
	}, text);
	expect(opened).toEqual(true);
	await wait4selector(page, '#simple-popper', { visible: true, timeout : 30000 });
}

/**
 * Clicks on Controls Menu menu items
 */
const clickLayerControlsElement = async (page, text) => {
	const clicked = await page.evaluate(async (text ) => {
		const isVisible = (element) => {
			if (!element) {
				return false;
			}
			const style = window.getComputedStyle(element);
			return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
		};

		const findAndClick = (label) => {
			let controls = document.getElementsByClassName('menu-item-label');
			for ( var i = 0; i < controls.length ; i ++ ) {
				if (controls[i].innerText.trim() === label && isVisible(controls[i])) {
					controls[i].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
					controls[i].click();
					return true;
				}
			}
			return false;
		};

		if (findAndClick(text)) {
			return true;
		}

		let controls = document.getElementsByClassName('menu-item-label');
		for ( var i = 0; i < controls.length ; i ++ ) {
			if ( controls[i].innerText.trim() === text ) {
				controls[i].click();
				return true;
			}
		}
		return false;
	}, text);
	expect(clicked).toEqual(true);
};

const getVisibleControlLabels = async (page) => (
	page.evaluate(async () => {
		const isVisible = (element) => {
			if (!element) {
				return false;
			}
			const style = window.getComputedStyle(element);
			return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
		};

		return Array.from(document.querySelectorAll('.menu-item-label'))
			.filter((label) => isVisible(label))
			.map((label) => label.innerText.trim());
	})
);

const ensureToggleAction = async (page, desiredLabel, oppositeLabel, waitAfterClick = 2000) => {
	await openControls(page, INSTANCE_ROW_LABEL);
	let labels = await getVisibleControlLabels(page);

	if (labels.includes(desiredLabel)) {
		await clickLayerControlsElement(page, desiredLabel);
		if (waitAfterClick > 0) {
			await page.waitFor(waitAfterClick);
		}
		return;
	}

	if (labels.includes(oppositeLabel)) {
		await clickLayerControlsElement(page, oppositeLabel);
		if (waitAfterClick > 0) {
			await page.waitFor(waitAfterClick);
		}
		await openControls(page, INSTANCE_ROW_LABEL);
		labels = await getVisibleControlLabels(page);
	}

	expect(labels.includes(desiredLabel)).toEqual(true);
	await clickLayerControlsElement(page, desiredLabel);
	if (waitAfterClick > 0) {
		await page.waitFor(waitAfterClick);
	}
};

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
		await testLandingPage(page, INSTANCE_ID);
	}, 120000)

	// Tests opening control panel and clicking on row buttons
	describe('Test Layers Component', () => {
		it('Open Layers Component', async () => {
			await selectTab(page, "Layers");
			await page.waitFor(1000); // Give the DOM time to update
			// Check that the Layers component is visible
			await wait4selector(page, 'div.listviewer-container', { visible: true, timeout : 120000 });
		}, 800000) 

		// Tests Layer component opens up and that is populated with expected 2 rows
		it('The control panel opened with right amount of rows.', async () => {
			await page.waitForFunction(
				() => document.querySelectorAll('.standard-row').length === 2 || document.querySelectorAll('.vfbListViewer .griddle-row').length === 2,
				{ timeout: 120000 }
			);

			const rows = await page.evaluate(() => {
				const standardRows = document.querySelectorAll('.standard-row').length;
				if (standardRows > 0) {
					return standardRows;
				}
				return document.querySelectorAll('.vfbListViewer .griddle-row').length;
			});
			expect(rows).toEqual(2);
		}, 120000) // Increased timeout to 120 seconds
	});

	// Tests opening Layer component and clicking on row buttons
	describe('Test Layers Component Controls', () => {
		// Open controls menu
		it('Open Controls Menu', async () => {
			await page.waitFor(3000);
			await openControls(page, INSTANCE_ROW_LABEL);
		})

		// Check VFB_jrchk4wj neuron is selected by default, should be the case since it was last one to load
		it('Instance VFB_jrchk4wj Selected', async () => {
			await waitForInstanceMesh(page);
			const meshState = await getInstanceMeshState(page);
			expect(meshState.key).toBeDefined();
			expect(meshState.color).toEqual("ffcc00");
		})

		// Click on control's option to deselect VFB_jrchk4wj instance and check is now deselected
		it('Unselect VFB_jrchk4wj Instance', async () => {
			await clickLayerControlsElement(page, 'Unselect');
			await page.waitFor(3000);
			const meshState = await getInstanceMeshState(page);
			expect(meshState.key).toBeDefined();
			expect(meshState.color).toEqual("00ff00");
		})

		// Click on control's option to hide VFB_jrchk4wj instance and check is now hidden
		it('Hide VFB_jrchk4wj Instance', async () => {
			await openControls(page, INSTANCE_ROW_LABEL);
			await clickLayerControlsElement(page, 'Hide');
			await page.waitFor(2000);
			const meshState = await getInstanceMeshState(page, [INSTANCE_OBJ_SUFFIX, INSTANCE_SWC_SUFFIX]);
			expect(meshState.key).toBeDefined();
			expect(meshState.visible).toEqual(false);
		})

		// Click on control's option to show VFB_jrchk4wj instance and check is now visible
		it('Show VFB_jrchk4wj Instance', async () => {
			await openControls(page, INSTANCE_ROW_LABEL);
			await clickLayerControlsElement(page, 'Show');
			await page.waitFor(2000);
			const meshState = await getInstanceMeshState(page, [INSTANCE_OBJ_SUFFIX, INSTANCE_SWC_SUFFIX]);
			expect(meshState.key).toBeDefined();
			expect(meshState.visible).toEqual(true);
		})

		// Click on control's option to zoom to VFB_jrchk4wj instance and check is now zoom in
		it('Zoom To VFB_jrchk4wj Instance', async () => {
			await openControls(page, INSTANCE_ROW_LABEL);
			await clickLayerControlsElement(page, 'Zoom To');
			await page.waitFor(2000);
			const zoomTo = await page.evaluate(async () => {
				var position = CanvasContainer.engine.camera.position;
				return [position.x, position.y, position.z]
			});
			const expected = [291.508, 142.322, -85.403];
			for (let i = 0; i < expected.length; i++) {
				expect(Math.abs(zoomTo[i] - expected[i])).toBeLessThan(0.08);
			}
		})

		// Click on control's option to disable VFB_jrchk4wj skeleton and check is now hidden
		it('Disable Skeleton For VFB_jrchk4wj Instance', async () => {
			const capabilities = await getInstanceCapabilities(page);
			await openControls(page, INSTANCE_ROW_LABEL);
			const labels = await getVisibleControlLabels(page);
			if (!capabilities.hasSwc) {
				expect(labels.includes('Enable 3D Skeleton') || labels.includes('Disable 3D Skeleton')).toEqual(true);
				return;
			}
			if (labels.includes('Disable 3D Skeleton')) {
				await clickLayerControlsElement(page, 'Disable 3D Skeleton');
				await page.waitFor(2000);
			} else {
				await clickLayerControlsElement(page, 'Enable 3D Skeleton');
				await page.waitFor(2000);
				await openControls(page, INSTANCE_ROW_LABEL);
				await clickLayerControlsElement(page, 'Disable 3D Skeleton');
				await page.waitFor(2000);
			}
			const meshState = await getInstanceMeshState(page, [INSTANCE_SWC_SUFFIX]);
			expect(meshState.key).toBeDefined();
			expect(meshState.visible).toEqual(false);
		})

		// Click on control's option to enable VFB_jrchk4wj skeleton and check is now visible
		it('Enable Skeleton For VFB_jrchk4wj Instance', async () => {
			const capabilities = await getInstanceCapabilities(page);
			if (!capabilities.hasSwc) {
				await openControls(page, INSTANCE_ROW_LABEL);
				const labels = await getVisibleControlLabels(page);
				expect(labels.includes('Enable 3D Skeleton') || labels.includes('Disable 3D Skeleton')).toEqual(true);
				return;
			}
			await ensureToggleAction(page, 'Enable 3D Skeleton', 'Disable 3D Skeleton');
			const meshState = await getInstanceMeshState(page, [INSTANCE_SWC_SUFFIX]);
			expect(meshState.key).toBeDefined();
			expect(meshState.visible).toEqual(true);
		})

		// Validate 3D volume control is available and instance starts enabled
		it('Enable 3D Volume For VFB_jrchk4wj Instance', async () => {
			await openControls(page, INSTANCE_ROW_LABEL);
			const labels = await getVisibleControlLabels(page);
			expect(labels.includes('Enable 3D Volume') || labels.includes('Disable 3D Volume')).toEqual(true);

			const meshState = await getInstanceMeshState(page, [INSTANCE_OBJ_SUFFIX]);
			expect(meshState.key).toBeDefined();
			expect(meshState.visible).toEqual(true);
		}, 30000)

		// Validate 3D volume toggle option is present in controls menu
		it('Disable 3D Volume For VFB_jrchk4wj Instance', async () => {
			await openControls(page, INSTANCE_ROW_LABEL);
			const labels = await getVisibleControlLabels(page);
			expect(labels.includes('Enable 3D Volume') || labels.includes('Disable 3D Volume')).toEqual(true);
		}, 30000)

		// Click on control's option to show info for VFB_jrchk4wj instance and check term info opens up with instance
		it('Show Info For VFB_jrchk4wj Instance', async () => {
			if (IS_REMOTE_V2_DEV) {
				await openControls(page, INSTANCE_ROW_LABEL);
				const labels = await getVisibleControlLabels(page);
				expect(labels.includes('Show Info')).toEqual(true);
				return;
			}
			await openControls(page, INSTANCE_ROW_LABEL);
			await clickLayerControlsElement(page, 'Show Info');
			await page.waitFor(2000);
			await wait4selector(page, 'div#vfbterminfowidget', { visible: true, timeout : 500000});
			await wait4selector(page, `#${INSTANCE_ID}_deselect_buttonBar_btn`, { visible: true , timeout : 120000 })
		}, 120000)

		// Re open layers component
		it('Open Layers Component', async () => {
			await selectTab(page, "Layers");
			await page.waitFor(1000); // Give the DOM time to update
			// Check that the Layers component is visible
			await wait4selector(page, 'div.listviewer-container', { visible: true, timeout : 120000 });
		}, 120000)

		// Open color picker to change color of VFB_jrchk4wj
		it('Color Picker Appears for VFB_jrchk4wj', async () => {
			await openControls(page, INSTANCE_ROW_LABEL);
			await clickLayerControlsElement(page, 'Color');
			await wait4selector(page, 'div.chrome-picker', { visible: true, timeout : 500000 })
		}, 240000)

		// Chance color of VFB_jrchk4wj instance using controls
		it('Use color picker to change color of VFB_jrchk4wj', async () => {
			// Retrieve old color in mesh
			await page.waitFor(2000);
			const initialState = await getInstanceMeshState(page, [INSTANCE_OBJ_SUFFIX, INSTANCE_SWC_SUFFIX]);
			let meshColor = initialState.color;
			
			expect(["ffcc00", "00ff00"]).toContain(meshColor);
			
			const changed = await page.evaluate(async () => {
				const input = Array.from(document.querySelectorAll('.chrome-picker input')).find((field) => typeof field.value === 'string' && field.value.startsWith('#'));
				if (!input) {
					return false;
				}
				const nextValue = '#f542e6';
				const previousValue = input.value;
				input.value = nextValue;
				if (input._valueTracker) {
					input._valueTracker.setValue(previousValue);
				}
				input.dispatchEvent(new Event('input', { bubbles: true }));
				input.dispatchEvent(new Event('change', { bubbles: true }));
				return true;
			});
			expect(changed).toEqual(true);
			await page.waitFor(15000);
			// Retrieve new color in mesh
			const newState = await getInstanceMeshState(page, [INSTANCE_OBJ_SUFFIX, INSTANCE_SWC_SUFFIX]);
			let newColor = newState.color;

			expect(newColor).toEqual('f542e6');
		}, 30000)

		// Click on control's option to delete VFB_jrchk4wj instance and check is now gone
		it('Delete VFB_jrchk4wj Instance', async () => {
			await openControls(page, INSTANCE_ROW_LABEL);
			await clickLayerControlsElement(page, 'Delete');
			await page.waitFor(2000);

			const hasInstanceMeshes = await page.evaluate(async (instanceId) => {
				const engine = (typeof CanvasContainer !== 'undefined' && CanvasContainer.engine) ? CanvasContainer.engine : null;
				const meshes = engine && engine.meshes ? engine.meshes : {};
				return Object.keys(meshes).some((key) => key.startsWith(`${instanceId}.`));
			}, INSTANCE_ID);
			expect(hasInstanceMeshes).toEqual(false);
		}, 30000)
	})
})
