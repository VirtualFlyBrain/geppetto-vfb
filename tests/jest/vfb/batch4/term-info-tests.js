const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click , closeModalWindow, flexWindowClick, findElementByText} from '../utils.js';
import * as ST from '../selectors.js';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?id=VFB_00102107&i=VFB_00101567,VFB_00102135,VFB_00102162,VFB_00102107";

const clickMenuButtonByText = async (text) => {
  const clicked = await page.evaluate((text) => {
    const candidates = Array.from(document.querySelectorAll('[role="button"], button, a, span, div'))
      .filter(el => (el.innerText || '').trim() === text && el.offsetParent !== null);
    if (candidates.length > 0) {
      candidates[0].click();
      return true;
    }
    return false;
  }, text);
  if (!clicked) {
    throw new Error(`Could not find a visible menu button with text "${text}"`);
  }
};

const clickMenuItemByText = async (text) => {
  const clicked = await page.evaluate((text) => {
    let candidates = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"], .MuiMenuItem-root, .MuiListItem-root'))
      .filter(el => (el.innerText || '').trim() === text && el.offsetParent !== null);
    if (candidates.length === 0) {
      candidates = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"], .MuiMenuItem-root, .MuiListItem-root'))
        .filter(el => (el.innerText || '').trim() === text);
    }
    if (candidates.length > 0) {
      candidates[0].click();
      return true;
    }
    return false;
  }, text);
  if (!clicked) {
    throw new Error(`Could not find a menu item with text "${text}"`);
  }
};

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
 * Tests term info component. Loads ID VFB_00101567 , and tests term info component to be correctly loaded with metadata for VFB_00101567. 
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
		// Force-focus VFB_00102107 — the URL `id=` parameter is rewritten by addVfbId
		// during initial load (VFBMain.js:165 replaces id= with idsList[0] = the template),
		// so on slow runners the term info ends up on the template, not VFB_00102107.
		// Calling window.addVfbId again with the desired id sets it as the focus.
		// Same pattern as batch3/batch-request-tests.js.
		it('Deselect button for VFB_00102107 appears in button bar inside the term info component', async () => {
			// Wait for the VFB_00102107 instance to be loaded (any mesh key starting with
			// "VFB_00102107." — could be _obj, _swc, etc.). addVfbId mid-load doesn't select
			// when idsFromURL is non-empty, so call .select() and setTermInfo() directly.
			// 360s wait — run 25319381544 mesh appeared ~246s in, just past the 240s ceiling.
			await page.waitForFunction(
				() => {
					if (typeof Instances === 'undefined' || !Instances['VFB_00102107']) return false;
					if (typeof Instances['VFB_00102107'].select !== 'function') return false;
					if (typeof CanvasContainer === 'undefined' || !CanvasContainer.engine || !CanvasContainer.engine.meshes) return false;
					return Object.keys(CanvasContainer.engine.meshes).some(k => k.indexOf('VFB_00102107.') === 0);
				},
				{ timeout: 360000 }
			);
			await page.evaluate(() => {
				Instances['VFB_00102107'].select();
				if (typeof window.setTermInfo === 'function' && Instances['VFB_00102107'].VFB_00102107_meta) {
					window.setTermInfo(Instances['VFB_00102107'].VFB_00102107_meta, 'VFB_00102107');
				}
			});
			await wait4selector(page, '#VFB_00102107_deselect_buttonBar_btn', { visible: true , timeout : 240000 })
		}, 720000)

		it('Zoom button for VFB_00102107 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00102107_zoom_buttonBar_btn]', { visible: true , timeout : 240000 })
		}, 300000)

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		}, 120000)
	})

	describe('Test Term Info Component Minimizes/Maximizes/Opens/Closes', () => {
		it('Term info minimized', async () => {
			const clicked = await page.evaluate(() => {
				const outer = Array.from(document.querySelectorAll('.flexlayout__tab_header_outer')).find(outer => {
					const content = outer.querySelector('.flexlayout__tab_button_content');
					return content && content.innerText.trim() === 'Term Info';
				});
				if (!outer) return false;
				const minButton = outer.querySelector('.flexlayout__tab_toolbar_button-min');
				if (!minButton) return false;
				minButton.click();
				return true;
			});
			if (!clicked) {
				throw new Error('Could not minimize the Term Info tab');
			}
			await page.waitForFunction(() => {
				const outer = Array.from(document.querySelectorAll('.flexlayout__tab_header_outer')).find(outer => {
					const content = outer.querySelector('.flexlayout__tab_button_content');
					return content && content.innerText.trim() === 'Term Info';
				});
				return outer && outer.className.includes('flexlayout__tabset-maximized') && !!outer.querySelector('.flexlayout__tab_toolbar_button-max');
			}, { timeout: 240000 });
		}, 240000)

		it('Term info restored', async () => {
			const clicked = await page.evaluate(() => {
				const outer = Array.from(document.querySelectorAll('.flexlayout__tab_header_outer')).find(outer => {
					const content = outer.querySelector('.flexlayout__tab_button_content');
					return content && content.innerText.trim() === 'Term Info';
				});
				if (!outer) return false;
				const maxButton = outer.querySelector('.flexlayout__tab_toolbar_button-max');
				if (!maxButton) return false;
				maxButton.click();
				return true;
			});
			if (!clicked) {
				throw new Error('Could not restore the Term Info tab');
			}
			await page.waitForFunction(() => {
				const outer = Array.from(document.querySelectorAll('.flexlayout__tab_header_outer')).find(outer => {
					const content = outer.querySelector('.flexlayout__tab_button_content');
					return content && content.innerText.trim() === 'Term Info';
				});
				return outer && !outer.className.includes('flexlayout__tabset-maximized') && !!outer.querySelector('.flexlayout__tab_toolbar_button-min');
			}, { timeout: 240000 });
		}, 240000)

		it('Term info closed', async () => {
			// There's 4 div elements with same class (slice viewer, 3d viewer, term info and tree browser), the forth one belongs to the term info
			await flexWindowClick("Term Info","flexlayout__tab_button_trailing");
			await wait4selector(page, 'div#vfbterminfowidget', { hidden: true, timeout : 500000});
		}, 500000)

		it('Term info opened', async () => {
			await wait4selector(page, 'button#Tools', { visible: true, timeout: 240000 });
			await click(page, 'button#Tools');
			await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 });
			await clickMenuItemByText('Term Info');
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
			await wait4selector(page, 'button#Tools', { visible: true, timeout: 240000 });
			await click(page, 'button#Tools');
			await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 });
			await clickMenuItemByText('Term Info');
			// Check term info component is visible again'
			await wait4selector(page, 'div#vfbterminfowidget', { visible: true, timeout : 500000});

			// Looks for zoom button for id 'VFB_00102107', which is present if it's visible
			await wait4selector(page, 'button[id=VFB_00102107_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
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
			await wait4selector(page, '.terminfo-source a', { visible: true, timeout: 120000 });
			await Promise.all([
				page.waitForNavigation({ timeout: 120000 }),
				page.evaluate(() => document.querySelector('.terminfo-source a').click())
			]);
			const currentUrl = page.url();
			expect(currentUrl).toMatch(/id=JRC2018/);
			await page.waitForFunction(() => (document.body.innerText || '').toLowerCase().includes('jrc 2018 templates & rois'), { timeout: 120000 });
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
			await wait4selector(page, 'i.fa-eraser', { visible: true, timeout: 120000 });
			await page.evaluate(() => document.querySelector('i.fa-eraser').click());
			await wait4selector(page, '#vfbterminfowidget', { visible: true, timeout: 120000 });
			const pageText = await page.evaluate(() => (document.body.innerText || '').toLowerCase());
			expect(pageText).toMatch(/virtual fly brain/);
		}, 120000);
	})
})
