const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click , closeModalWindow, flexWindowClick, findElementByText} from '../utils.js';
import * as ST from '../selectors.js';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?id=VFB_00030624&i=VFB_00017894,VFB_00030611,VFB_00030623,VFB_00030624";

const openQueryBuilderFromTermInfo = async () => {
	const clickedFocusQueryButton = await page.evaluate(async () => {
		const queryButton = Array.from(document.querySelectorAll('.focusTermDivR button')).find((button) => {
			return typeof button.id === 'string' && button.id.startsWith('Queries for ');
		});
		if (queryButton) {
			queryButton.click();
			return true;
		}
		return false;
	});

	let opened = false;
	if (clickedFocusQueryButton) {
		opened = await page.waitForSelector('#querybuilder', { visible: true, timeout: 10000 })
			.then(() => true)
			.catch(() => false);
	}

	if (!opened) {
		await click(page, 'i.fa.fa-quora');
	}

	await wait4selector(page, '#querybuilder', { visible: true, timeout : 120000});
	await wait4selector(page, '#query-results-label', { visible: true, timeout : 120000});
};

const closeQueryBuilder = async () => {
	await page.evaluate(async () => {
		const closeButton = document.getElementById('closeQuery2');
		if (closeButton) {
			closeButton.click();
		}
	});

	const closed = await page.waitForSelector('#querybuilder', { hidden: true, timeout: 10000 })
		.then(() => true)
		.catch(() => false);

	if (!closed) {
		closeModalWindow(page);
		await wait4selector(page, '#querybuilder', { hidden: true, timeout : 50000});
	}
};

/**
 * Tests term info component. Loads ID VFB_00017894 , and tests term info component to be correctly loaded with metadata for VFB_00017894. 
 */
describe('VFB Term Info Component Tests', () => {
	beforeAll(async () => {
		//increases timeout to ~8 minutes
		jest.setTimeout(500000);
		await page.goto(projectURL, {timeout : 220000 });
	}, 220000);

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
		})

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toMatch("Virtual Fly Brain");
		})
	}, 120000)

	//Tests metadata in term info component and clicking on links
	describe('Test Term Info Component Opens on Load with Components', () => {
		// Force-focus VFB_00030624 — the URL `id=` parameter is rewritten by addVfbId
		// during initial load (VFBMain.js:165 replaces id= with idsList[0] = the template),
		// so on slow runners the term info ends up on the template, not VFB_00030624.
		// Calling window.addVfbId again with the desired id sets it as the focus.
		// Same pattern as batch3/batch-request-tests.js.
		it('Deselect button for VFB_00030624 appears in button bar inside the term info component', async () => {
			// addVfbId('VFB_00030624') only auto-selects when idsFromURL is empty (see
			// VFBMain.js handleSceneAndTermInfoCallback) — fired mid-load, it just refreshes
			// term info without selecting. Wait for the mesh to be in CanvasContainer (load
			// finished), then call instance.select() directly so the deselect button appears.
			await page.waitForFunction(
				() => typeof CanvasContainer !== 'undefined'
					&& CanvasContainer.engine
					&& CanvasContainer.engine.meshes
					&& CanvasContainer.engine.meshes['VFB_00030624.VFB_00030624_obj'] !== undefined
					&& typeof Instances !== 'undefined'
					&& Instances['VFB_00030624']
					&& typeof Instances['VFB_00030624'].select === 'function',
				{ timeout: 240000 }
			);
			await page.evaluate(() => {
				Instances['VFB_00030624'].select();
				if (typeof window.setTermInfo === 'function') {
					window.setTermInfo(Instances['VFB_00030624'].VFB_00030624_meta, 'VFB_00030624');
				}
			});
			await wait4selector(page, '#VFB_00030624_deselect_buttonBar_btn', { visible: true , timeout : 240000 })
		}, 300000)

		it('Zoom button for VFB_00030624 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00030624_zoom_buttonBar_btn]', { visible: true , timeout : 240000 })
		}, 300000)

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
		}, 120000)

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
			});

			// Check term info component is visible again'
			await wait4selector(page, 'div#vfbterminfowidget', { visible: true, timeout : 500000});

			// Looks for zoom button for id 'VFB_00030624', which is present if it's visible
			await wait4selector(page, 'button[id=VFB_00030624_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		}, 240000)

		it('Term info closed', async () => {
			// There's 4 div elements with same class (slice viewer, 3d viewer, term info and tree browser), the forth one belongs to the term info
			await flexWindowClick("Term Info","flexlayout__tab_button_trailing");
			await wait4selector(page, 'div#vfbterminfowidget', { hidden: true, timeout : 500000});
		}, 500000)

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
		}, 240000)
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
		}, 120000);

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
			// Check term info component is visible again'
			await wait4selector(page, 'div#vfbterminfowidget', { visible: true, timeout : 500000});

			// Looks for zoom button for id 'VFB_00030624', which is present if it's visible
			await wait4selector(page, 'button[id=VFB_00030624_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		}, 240000);

		it('Term info , run "Query For" from menu option', async () => {
			await openQueryBuilderFromTermInfo();
			const resultSummary = await page.evaluate(async () => {
				const label = document.querySelector('#query-results-label');
				return label ? label.textContent.trim() : "";
			});
			expect(resultSummary).toMatch(/^\d+\s+results?$/i);
		}, 220000);

		// Close Query Results window by pressing Escape on Window
		it('Close Query Results Window', async () => {
			await closeQueryBuilder();
		}, 120000);

		it('Term info correctly populated after clicking on Source Link', async () => {
			let element = await findElementByText(page, "BrainName neuropils on adult brain JFRC2 (Jenett, Shinomya)");
			expect(element).toBe("BrainName neuropils on adult brain JFRC2 (Jenett, Shinomya)");
			await page.evaluate(async () => document.querySelector(".terminfo-source a").click());
			await page.waitFor(15000);
			element = await findElementByText(page, "BrainName neuropils on adult brain JFRC2 (Jenett, Shinomya)");
			expect(element).toBe("BrainName neuropils on adult brain JFRC2 (Jenett, Shinomya)");
		}, 120000);
	})

	describe('Test Term Info Icon Buttons Work', () => {
		it('Term info, "Spotlight" Button Works', async () => {
			await click(page, 'i.fa-search');
			await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, {visible: true, timeout : 50000});
			// Close Spotlight
			await page.evaluate(async () => document.querySelector("#closeIcon").click());
			await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { hidden: true, timeout : 50000});
		}, 120000);

		it('Term info, "Query Button" Works', async () => {
			await click(page, 'i.fa.fa-quora');
			await wait4selector(page, '#querybuilder', { visible: true ,timeout : 120000 });
			await wait4selector(page, '#query-results-label', { visible: true, timeout : 120000});
			const resultSummary = await page.evaluate(async () => {
				const label = document.querySelector('#query-results-label');
				return label ? label.textContent.trim() : "";
			});
			expect(resultSummary).toMatch(/^\d+\s+results?$/i);
			// Close Query Panel
			await closeQueryBuilder();
		}, 120000);

		it('Term info, "Clear All" Button Works', async () => {
			await page.evaluate(async selector => document.querySelector(selector).click(), "i.fa-eraser");
			let element = await findElementByText(page, "List all painted anatomy available for adult brain template JFRC2");
			expect(element).toBe("List all painted anatomy available for adult brain template JFRC2");
		}, 120000);
	})
})
