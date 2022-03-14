const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?i=VFB_00017894";

/**
 * Test spotlight component works with VFB_00017894 and show correct buttons
 */
describe('VFB Spotlight Tests', () => {
  beforeAll(async () => {
    jest.setTimeout(1800000);
    await page.goto(PROJECT_URL);

  });

  // Test components on landing page are present
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
		})

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

  // Tests 'Add Scene' button in spotlight for VFB_00017894
  describe('Spotlight, add scene button test', () => {
    it('Search builder button appeared', async () => {
      await wait4selector(page, 'i.fa-search', { visible: true, timeout : 10000 })
    })

    it('Opens and shows correct input.', async () => {
      await page.waitFor(10000);
      await click(page, 'i.fa-search');
      await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { visible: true });
    });

    it('Search Returned Results', async () => {
      await page.focus(ST.SPOT_LIGHT_SEARCH_INPUT_SELECTOR);
      await page.keyboard.type('fru-M-200266');
      await page.waitFor(10000);
      await page.keyboard.type(' ');
      await page.waitFor(5000);
      await wait4selector(page, '#paperResults', { visible: true , timeout : 50000 })
    })

    it('fru-M-200266 (VFB_00000001) selected and spotlight has closed', async () => {
    	await page.evaluate(async () => {
			let tabs = document.getElementsByClassName('MuiListItem-root ');
			for ( var i = 0; i < tabs.length ; i ++ ) {
				if ( tabs[i].innerText.split('\n')[0] === "fru-M-200266 (VFB_00000001)" ) {
					tabs[i].click();
				}
			}
		});
    	await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { hidden: true, timeout : 50000 });
    })

    it('VFB_00000001.VFB_00000001 loaded after adding it through spotlight', async () => {
      await wait4selector(page, '#VFB_00000001_visibility_buttonBar_btn', { visible: true , timeout : 500000 });
    })
  })
})
