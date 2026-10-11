const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { wait4selector, closeModalWindow } from '../utils.js';
import * as ST from '../selectors.js';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';
const TEMPLATE_ID = 'VFB_00101567';
const NEURON_ID = 'VFB_jrmc3f46';
const PROJECT_URL = `${baseURL}/geppetto?id=${NEURON_ID}&i=${TEMPLATE_ID},${NEURON_ID}`;

/*
 * The canvas frames the scene once, the first time every visual instance it
 * knows about has a mesh -- true early in a URL load with only a neuron in the
 * scene, which left the opening view zoomed onto that neuron and never
 * corrected. Pressing Home afterwards looked right, because by then the
 * template had arrived. So: the view you are given on load should be the view
 * Home gives.
 */
const cameraPosition = async (page) => page.evaluate(() => {
	const engine = (typeof CanvasContainer !== 'undefined' && CanvasContainer.engine) ? CanvasContainer.engine : null;
	if (!engine || !engine.camera) {
		return null;
	}
	const p = engine.camera.position;
	return { x: p.x, y: p.y, z: p.z };
});

const distance = (a, b) => Math.sqrt(
	Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
);

const magnitude = (a) => Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);

describe('VFB Opening View Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(900000);
		await page.goto(PROJECT_URL, { timeout: 220000 });
	}, 300000);

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout: 120000 });
			closeModalWindow(page);
		}, 180000);

		it('The template mesh is in the scene', async () => {
			await page.waitForFunction(
				(template) => {
					if (typeof CanvasContainer === 'undefined' || !CanvasContainer.engine || !CanvasContainer.engine.meshes) {
						return false;
					}
					return Object.keys(CanvasContainer.engine.meshes).some((key) => key.indexOf(template + '.') === 0);
				},
				{ timeout: 420000 },
				TEMPLATE_ID
			);
		}, 480000);
	});

	describe('The view on load', () => {
		it('Frames the scene the way Home does', async () => {
			// Let any later mesh settle, so this is the view the user is left with.
			await page.waitFor(20000);
			const onLoad = await cameraPosition(page);
			expect(onLoad).not.toBeNull();

			const home = await page.evaluate(() => {
				CanvasContainer.engine.resetCamera();
				const p = CanvasContainer.engine.camera.position;
				return { x: p.x, y: p.y, z: p.z };
			});

			/*
			 * Not an exact match: resetCamera re-runs against whatever is visible
			 * now. A tenth of the viewing distance is far tighter than the failure
			 * being guarded against, where the camera sat on a single neuron.
			 */
			expect(distance(onLoad, home)).toBeLessThan(magnitude(home) * 0.1);
		}, 300000);
	});
});
