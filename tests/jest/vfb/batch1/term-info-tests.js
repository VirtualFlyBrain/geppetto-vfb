const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click , closeModalWindow, flexWindowClick, findElementByText} from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?id=VFB_00030624&i=VFB_00017894,VFB_00030611,VFB_00030623,VFB_00030624";

/**
 * Tests term info component. Loads ID VFB_00017894 , and tests term info component to be correctly loaded with metadata for VFB_00017894. 
 */
describe('VFB Term Info Component Tests', () => {
	beforeAll(async () => {
		//increases timeout to ~8 minutes
		jest.setTimeout(500000);
		await page.goto(projectURL, {timeout : 120000 });
	});

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
		})

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toMatch("Virtual Fly Brain");
		})
	})

	//Tests metadata in term info component and clicking on links
	describe('Test Term Info Component Opens on Load with Components', () => {
		it('Deselect button for VFB_00030624 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00030624_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		}, 120000)

		it('Zoom button for VFB_00030624 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00030624_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		}, 120000)

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		}, 120000)
	})

	describe('Test Term Info Component Minimizes/Maximizes/Opens/Closes', () => {
		it('Term info minimized', async () => {
			// There are three flexlayout_tab components open with the same minimize icon, the third one belongs to the term info
			await flexWindowClick("Term Info","fa-window-minimize");
			//await page.evaluate(async () => document.getElementsByClassName("fa-window-minimize")[2].click());
			// Check 3d viewer is visible again by checking css property 'display : none'
			//await wait4selector(page, 'div#VFBTermInfo_el_0_component', { visible: false , timeout : 400000})
			expect(
					await page.evaluate(async () => document.getElementsByClassName("flexlayout__tab")[6].style.getPropertyValue("display"))
			).toBe("none");
		})

		it('Term info restored', async () => {
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
			}, 120000);

			// Check term info component is visible again'
			await wait4selector(page, 'div#vfbterminfowidget', { visible: true, timeout : 500000});

			// Looks for zoom button for id 'VFB_00030624', which is present if it's visible
			await wait4selector(page, 'button[id=VFB_00030624_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		})

		it('Term info closed', async () => {
			// There's 4 div elements with same class (slice viewer, 3d viewer, term info and tree browser), the forth one belongs to the term info
			await flexWindowClick("Term Info","flexlayout__tab_button_trailing");
			await wait4selector(page, 'div#vfbterminfowidget', { hidden: true, timeout : 500000});
		})

		it('Term info opened', async () => {
			await page.evaluate(async () => document.getElementById("Tools").click());
			// Check HTML 'UL' with class 'MuiList-root' is visible, this is the drop down menu
			await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 });
			await page.evaluate(async () => {
				let tabs = document.getElementsByClassName('MuiMenuItem-root');
				for ( var i = 0; i < tabs.length ; i ++ ) {
					if ( tabs[i].innerText === "Term Info" ) {
						tabs[i].click();
					}
				}
			});
			await wait4selector(page, 'div#vfbterminfowidget', { visible: true, timeout : 500000});
		})
	})

	describe('Test Term Info Component Links and Buttons Work', () => {
		it('Term info closed', async () => {
			// There's 4 div elements with same class (slice viewer, 3d viewer, term info and tree browser), the third one belongs to the term info
			await flexWindowClick("Term Info","flexlayout__tab_button_trailing");
			//await page.evaluate(async () =>{
			//	let flexComponents = document.getElementsByClassName("flexlayout__tab_button_trailing").length;
			//	document.getElementsByClassName("flexlayout__tab_button_trailing")[flexComponents-1].click();
			//});
			await wait4selector(page, '#vfbterminfowidget', { hidden: true, timeout : 50000})
		})

		it('Term info opened', async () => {
			await page.evaluate(async () => document.getElementById("Tools").click());
			// Check HTML 'UL' with class 'MuiList-root' is visible, this is the drop down menu
			await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 });
			await page.evaluate(async () => {
				let tabs = document.getElementsByClassName('MuiMenuItem-root');
				for ( var i = 0; i < tabs.length ; i ++ ) {
					if ( tabs[i].innerText === "Term Info" ) {
						tabs[i].click();
					}
				}
			}, 120000);
			// Check term info component is visible again'
			await wait4selector(page, 'div#vfbterminfowidget', { visible: true, timeout : 500000});

			// Looks for zoom button for id 'VFB_00030624', which is present if it's visible
			await wait4selector(page, 'button[id=VFB_00030624_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		})

		it('Term info , run "Query For" from menu option', async () => {
			// Takes a while for 'Query For' option to show, wait for it 20 seconds
			await page.waitFor(20000);
			// Click on Term Info Drop Down Menu
			// await page.evaluate(async variableName => document.querySelectorAll(".focusTermRight button")[0].click());
			// await wait4selector(page, 'div#simple-popper', { visible: true, timeout : 50000});
			// Mouse over 'Query For' menu item to expand drop down menu
			await page.evaluate(async () => {
				const element = document.getElementById("Queries for medulla on adult brain template JFRC2");
				if (element) {
					element.click();
				} else {
					console.error("Element not found: 'Queries for medulla on adult brain template JFRC2'");
					// Try to find similar elements to see what's available
					const possibleElements = Array.from(document.querySelectorAll('[id*="Queries"]'));
					console.log("Found possible query elements:", possibleElements.map(e => e.id || e.textContent));
				}
			});
			await page.waitFor(1000);
			// Click on item from query drop down menu and expect the query modal window to open
			await page.evaluate(async () => document.getElementById("List all available images of medulla").click());
			await wait4selector(page, '#query-results-container', { visible: true, timeout : 50000});
		}, 120000)

		// Close Query Results window by pressing Escape on Window
		it('Close Query Results Window', async () => {
			closeModalWindow(page);
			await wait4selector(page, '#query-results-container', { hidden: true, timeout : 50000});
		})

		it('Term info correctly populated after clicking on Source Link', async () => {
			let element = await findElementByText(page, "BrainName neuropils on adult brain JFRC2 (Jenett, Shinomya)");
			expect(element).toBe("BrainName neuropils on adult brain JFRC2 (Jenett, Shinomya)");
			await page.evaluate(async () => document.querySelector(".terminfo-source a").click());
			await page.waitFor(15000);
			element = await findElementByText(page, "BrainName neuropils on adult brain JFRC2 (Jenett, Shinomya)");
			expect(element).toBe("BrainName neuropils on adult brain JFRC2 (Jenett, Shinomya)");
		}, 120000)
	})

	describe('Test Term Info Icon Buttons Work', () => {
		it('Term info, "Spotlight" Button Works', async () => {
			await click(page, 'i.fa-search');
			await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, {visible: true, timeout : 50000});
			// Close Spotlight
			await page.evaluate(async () => document.querySelector("#closeIcon").click());
			await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { hidden: true, timeout : 50000});
		})

		it('Term info, "Query Button" Works', async () => {
			await click(page, 'i.fa.fa-quora.arrowStyle');
			await wait4selector(page, '#query-results-container', { visible: true ,timeout : 50000 });
			// Close Query Panel
			closeModalWindow(page);
			await wait4selector(page, '#query-results-container', { hidden: true, timeout : 50000});
		}, 120000)

		it('Term info, "Clear All" Button Works', async () => {
			await page.evaluate(async variableName => $(variableName).click(), "i.fa-eraser");
			let element = await findElementByText(page, "List all painted anatomy available for adult brain template JFRC2");
			expect(element).toBe("List all painted anatomy available for adult brain template JFRC2");
		})
	})
})
