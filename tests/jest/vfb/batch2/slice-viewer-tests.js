const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import {  getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, flexWindowClick, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?i=VFB_00017894";

/**
 * Tests slice viewer component. Tests the slice viewer loads, has meshes loaded, and that new meshes get rendered when added from query panel.
 */
describe('VFB Slice Viewer Component Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(60000);
		await page.goto(PROJECT_URL);

	});

	//Tests expected components are present when VFB page loads
	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
			// Close tutorial window
			closeModalWindow(page);
		})

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toMatch("Virtual Fly Brain");
		}, 120000)

		it('Deselect button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00017894_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		}, 120000)

		it('Zoom button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00017894_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		})

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		})

		it('Term info component correctly populated at startup', async () => {
			await page.waitFor(3000);
			let element = await findElementByText(page, "List all painted anatomy available for adult brain template JFRC2");
			expect(element).toBe("List all painted anatomy available for adult brain template JFRC2");
		})

		it('Canvas container component has 1 mesh rendered', async () => {
			expect(
					await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(1)
		})
	})

	//Opens query panel and runs query for 'medu'. This will be used later to test stack viewer got a new mesh as a result of this query run
	describe('Test Query Panel', () => {
		it('Query builder button appeared', async () => {
			await wait4selector(page, 'div.focusTermDivR i.fa-quora', { visible: true, timeout : 120000 })
		})

		it('Query builder is visible', async () => {
			await click(page, 'div.focusTermDivR i.fa-quora');
			await wait4selector(page, '#querybuilder', { visible: true, timeout : 120000 })
		})

		it('Typing medu in the query builder search bar', async () => {
			await page.focus('input#query-typeahead');
			await page.keyboard.type('med');
			await page.keyboard.type('ulla');
			await page.keyboard.press(String.fromCharCode(13))

			await wait4selector(page, 'div.tt-suggestion', { visible: true , timeout : 10000})
		})

		it('Selecting medulla, first suggestion from suggestion box', async () => {
			await page.evaluate(async selector =>  $('div.tt-suggestion').first().click())
			await wait4selector(page, '#queryitem-medulla_0', { visible: true , timeout : 60000})
		})

		it('Selecting first query for medulla', async () => {
			await page.evaluate(async selector =>  {
				var selectElement = $('select.query-item-option');
				selectElement.val('0').change();
				var event = new Event('change', { bubbles: true });
				selectElement[0].dispatchEvent(event);
			})
			//Test there are 2+ results before running query
			await wait4selector(page, '.fa-cogs', { visible: true , timeout : 90000})
			await page.waitFor(1000);
			await page.waitForFunction('Number(document.getElementById("query-results-label").innerText.split(" ")[0]) > 1', {visible : true, timeout : 60000});
		})

		it('Running query. Results rows appeared - click on results info for JFRC2 example of medulla', async () => {
			await click(page, 'button[id=run-query-btn]');
			await wait4selector(page, '#VFB_00030624----FBbt_00003748-image-container', { visible: true, timeout : 180000 })
		})

		it('Term info correctly populated for example of Medulla after query results info button click', async () => {
			await page.evaluate(async selector =>   $("#VFB_00030624----FBbt_00003748-image-container").find("img").click());
			closeModalWindow(page);
			await wait4selector(page, '#VFB_00030624_deselect_buttonBar_btn', { visible: true, timeout : 180000 })
			let element = await findElementByText(page, "medulla on adult brain template JFRC2");
			expect(element).toBe("medulla on adult brain template JFRC2");
		}, 120000)
	})

	//Tests slice viewer component, tests there's 2 visible meshes rendered
	describe('Test Slice Viewer Component', () => {
		it('SliceViewer present', async () => {
			await wait4selector(page, 'div#NewStackViewerdisplayArea', { visible: true , timeout : 500000})
		})

		it('SliceViewer component has 2 meshes rendered', async () => {
			expect(
					await page.evaluate(async () => Object.keys(StackViewer1.state.canvasRef.engine.meshes).length)
			).toBe(2)
		}, 120000)

		it('Mesh from batch request id : VFB_00017894.VFB_00017894_obj present in stack viewer component', async () => {
			expect(
					await page.evaluate(async selector => StackViewer1.state.canvasRef.engine.meshes["VFB_00017894.VFB_00017894_obj"].visible)
			).toBeTruthy()
		})

		it('VFB_00017894.VFB_00017894_obj visibility correct', async () => {
			await page.waitFor(10000);
			expect(
					await page.evaluate(async () => StackViewer1.state.canvasRef.engine.meshes['VFB_00017894.VFB_00017894_obj'].visible)
			).toBeTruthy();
		}, 120000);

		it('3D Plane not visible', async () => {
			expect(
					await page.evaluate(async () => CanvasContainer.engine.scene.children[4].visible)
			).toBeFalsy();
		});

		it('3D Plane visible', async () => {
			//add 3d plane to stack viewer by clicking on stack viewer button
			await page.evaluate(async selector => {
				var stackViewerButtons = $("#NewStackViewerdisplayArea").find("button");
				stackViewerButtons[stackViewerButtons.length - 1].click();
			})

			//give it some time before continue testing stack viewer
			await page.waitFor(3000);

			expect(
					await page.evaluate(async () => CanvasContainer.engine.scene.children[4].visible)
			).toBeTruthy();
		});

		it('Canvas container has 2 meshes rendered', async () => {
			expect(
					await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(2)
		})

		it('SliceViewer component has 2 meshes rendered', async () => {
			expect(
					await page.evaluate(async () => Object.keys(StackViewer1.state.canvasRef.engine.meshes).length)
			).toBe(2)
		})
	})

	describe('Test Stack Viewer Component Maximizes/Minimizes/Opens/Closes', () => {
		it('SliceViewer minimized', async () => {
			await page.evaluate(async () => document.getElementsByClassName("fa-window-minimize")[0].click());
			await page.waitFor(1000);
			// Check slice viewer is visible again by checking css property 'display : none'
			let minimized = await page.evaluate(async () => {
				return document.getElementById("NewStackViewerdisplayArea").parentElement.parentElement.style.getPropertyValue("display")
			})
			expect(minimized).toBe("none");
		})

		it('SliceViewer maximized', async () => {
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

			// Check slice viewer is visible again by checking css property 'display : block'
			let maximized = await page.evaluate(async () => {
				return document.getElementById("NewStackViewerdisplayArea").parentElement.parentElement.style.getPropertyValue("display")
			})
			expect(maximized).toBe("block");

			// Check slice viewer opened up with correct amount of meshes
			expect(
					await page.evaluate(async () => Object.keys(StackViewer1.state.canvasRef.engine.meshes).length)
			).toBe(2)
		})

		it('SliceViewer closed', async () => {
			// There's 3 div elements with same class (slice viewer, 3d viewer and term info), since the Slice Viewer
			// was previously minimized and maximized it should now occupy the third position
			await flexWindowClick("Stack Viewer","flexlayout__tab_button_trailing");
			//await page.evaluate(async () =>{
			//	flexWindowClick("Slice Viewer", "flexlayout__tab_button_trailing");
			//	//let flexComponents = document.getElementsByClassName("flexlayout__tab_button_trailing").length;
			//	//document.getElementsByClassName("flexlayout__tab_button_trailing")[flexComponents-1].click();
			//});
			expect(
					await page.evaluate(async () => {
						document.getElementById("NewStackViewerdisplayArea")
					})
			).toBe(undefined);
		})

		it('SliceViewer opened', async () => {
			await page.evaluate(async () => document.getElementById("Tools").click());
			// Check HTML 'UL' with class 'MuiList-root' is visible, this is the drop down menu
			await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 });
			await page.evaluate(async () => document.getElementById("Slice Viewer").click());
			await wait4selector(page, 'div#NewStackViewerdisplayArea', { visible: true, timeout : 50000});
			await wait4selector(page, 'div.stack-canvas-container', { visible: true, timeout : 50000});
		})
	})
})