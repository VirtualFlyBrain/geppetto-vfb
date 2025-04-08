const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import {  getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, flexWindowClick, findElementByText} from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?i=VFB_00017894";

/**
 * Tests 3D Viewer component
 */
describe('VFB 3D Viewer Component Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(1800000); 
		await page.goto(PROJECT_URL);
	});

	// Tests that expected components are present when VFB page loads
	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
			// Close tutorial window
			closeModalWindow(page);
		})

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toMatch("Virtual Fly Brain");
		})

		it('Deselect button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00017894_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		}, 120000)

		it('Zoom button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00017894_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		}, 120000)

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		}, 120000)
		
		it('Term info component correctly populated at startup', async () => {
			await page.waitFor(3000);
			let element = await findElementByText(page, "List all painted anatomy available for adult brain template JFRC2");
			expect(element).toBe("List all painted anatomy available for adult brain template JFRC2");
		}, 120000)
	})

	//Tests 3D viewer component, tests there's 2 visible meshes rendered
	describe('Test 3D Viewer Component', () => {
		it('Canvas container component has 1 mesh rendered', async () => {
			// Checks there's one mesh rendered in the canvas
			expect(
					await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(1)
		})

		it('3DViewer minimized', async () => {
			// There are three flexlayout_tab components open with the same minimize icon, the second one belongs to the 3d viewer
			await page.evaluate(async () => document.getElementsByClassName("fa-window-minimize")[1].click());
			// Check 3d viewer is visible again by checking css property 'display : none'
			let minimized = await page.evaluate(async () => {
				return document.getElementById("CanvasContainer_component").parentElement.style.getPropertyValue("display")
			})
			expect(minimized).toBe("none");
		})

		it('3DViewer maximized', async () => {
			// Using 'click()' function on minimized element doesn't work, needs to dispatch 'mouseup' and 'mousedown' events instead
			await page.evaluate(async () => {
				let mouseUp = document.getElementsByClassName('flexlayout__border_button')[0]
				let clickEvent = new MouseEvent('mousedown', {
					view: window,
					bubbles: true,
					cancelable: true
				});
				mouseUp.dispatchEvent(clickEvent);

				let mouseDown = document.getElementsByClassName('flexlayout__border_button')[0]
				clickEvent = new MouseEvent('mouseup', {
					view: window,
					bubbles: true,
					cancelable: true
				});
				mouseDown.dispatchEvent(clickEvent);
			});

			// Check 3d viewer is visible again by checking css property 'display : block'
			let maximized = await page.evaluate(async () => {
				return document.getElementById("CanvasContainer_component").parentElement.style.getPropertyValue("display")
			})
			expect(maximized).toBe("block");

			// Check 3d viewer opened up with correct amount of meshes
			expect(
					await page.evaluate(async () => Object.keys(StackViewer1.state.canvasRef.engine.meshes).length)
			).toBe(1)
		})

		it('3DViewer closed', async () => {
			// There's 4 div elements with same class (slice viewer, 3d viewer, term info and tree browser), since the 3D Viewer
			// was previously minimized and maximized it should now occupy the third position
			await flexWindowClick("3D Viewer","flexlayout__tab_button_trailing");
			//await page.evaluate(async () => {	
				//let flexComponents = document.getElementsByClassName("flexlayout__tab_button_trailing").length;
				//document.getElementsByClassName("flexlayout__tab_button_trailing")[flexComponents-1].click();
			//});
			expect(
					await page.evaluate(async () => document.getElementById("CanvasContainer_component"))
			).toBe(null);
		})

		it('3DViewer opened', async () => {
			await page.evaluate(async () => document.getElementById("Tools").click());
			// Check HTML 'UL' with class 'MuiList-root' is visible, this is the drop down menu
			await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 });
			await page.evaluate(async () => {
				let tabs = document.getElementsByClassName('MuiMenuItem-root');
				for ( var i = 0; i < tabs.length ; i ++ ) {
					if ( tabs[i].innerText === "3D Viewer" ) {
						tabs[i].click();
					}
				}				
			});
			await wait4selector(page, 'div#CanvasContainer_component', { visible: true, timeout : 50000});
		})
	})
})