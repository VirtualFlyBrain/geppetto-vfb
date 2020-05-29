const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from './cmdline.js';
import { wait4selector, click, closeModalWindow } from './utils';
import * as ST from './selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?i=VFB_00017894";

const QUERY_TRIGGER_URL = baseURL + "/geppetto?id=VFB_00000001&i=VFB_00017894,VFB_00000001&q=FBbt_00003678,neuronspostsynaptic"

/**
 * Tests query panel component by searching for 'medu' and running query on it
 */
describe('VFB Query Component Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(120000); 
		await page.goto(PROJECT_URL);

	});

	//Tests components are present in landing page
	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
			// Close tutorial window
			closeModalWindow(page);
		})

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toBe("Virtual Fly Brain");
		})

		it('Deselect button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00017894_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		})

		it('Zoom button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00017894_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		})

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#VFBTermInfo_el_0_component', { visible: true, timeout : 120000 })
		})
		
//		it('Hide Quick Help Modal Window', async () => {
//			closeModalWindow(page);
//			await wait4selector(page, 'div#quick_help_modal', { hidden : true })
//		})

		it('Term info component correctly populated at startup', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("adult brain template JFRC2 (VFB_00017894)")');
		})
	})

	//Tests running query 'medu' in the query panel
	describe('Test Query Panel', () => {
		it('Query builder button appeared', async () => {
			await wait4selector(page, 'i.fa-quora', { visible: true, timeout : 120000 })
		})

		it('Query builder is visible', async () => {
			await click(page, 'i.fa-quora');
			await wait4selector(page, '#querybuilder', { visible: true, timeout : 120000 })
		})

		it('Typing medu in the query builder search bar', async () => {
			await page.focus('input#query-typeahead');
			await page.keyboard.type('medulla');
			await page.keyboard.press(String.fromCharCode(13))

			await wait4selector(page, 'div.tt-suggestion', { visible: true , timeout : 10000})
		})

		it('Selecting medulla, first suggestion from suggestion box', async () => {
			await page.evaluate(async selector =>  $('div.tt-suggestion').first().click())
			await wait4selector(page, '#queryitem-medulla_0', { visible: true , timeout : 60000})
		})

		it('Selecting Transgene query for medulla', async () => {
			await page.evaluate(async selector =>  {
				var selectElement = $('select.query-item-option');
				selectElement.val('1').change();
				var event = new Event('change', { bubbles: true });
				selectElement[0].dispatchEvent(event);
			})
			await wait4selector(page, '.fa-cogs', { visible: true , timeout : 90000})
			await page.waitForFunction('Number(document.getElementById("query-results-label").innerText.split(" ")[0]) > 1', {visible : true, timeout : 60000});
		})
		
 		it('Running query. Results rows appeared - click on results info for JFRC2 example of medulla', async () => {
 			await click(page, 'button[id=run-query-btn]');
 			await wait4selector(page, 'div[id=VFBexp_FBtp0122071FBtp0118958----FBbt_00047588----FBrf0239335-image-container]', { visible: true , timeout : 900000})
 		})

 		it('Typing medulla in the query filter', async () => {
		 	await click(page, '#querybuilder input.form-control');
 			await page.keyboard.type('medulla');
			await wait4selector(page, 'div[id=VFBexp_FBtp0104942----FBbt_00003748----FBrf0232433-image-container]', { visible: true , timeout : 10000});
 		})

		it('Query results image selected and query results closed', async () => {
			await wait4selector(page, 'div[id=VFBexp_FBtp0104942----FBbt_00003748----FBrf0232433-image-container]', { visible: true , timeout : 10000});
			await page.evaluate(async selector => $("#VFBexp_FBtp0104942----FBbt_00003748----FBrf0232433-image-container img").click());
			closeModalWindow(page);
			await wait4selector(page, 'div[id=VFBexp_FBtp0122071FBtp0118958----FBbt_00047588----FBrf0239335-image-container]', { visible: false , timeout : 900000})
		})

		it('Term info correctly populated for transgene expressed in medulla after image of VDRC_VT945397_GAL4_attP2_2 opened', async () => {	
			await wait4selector(page, '#VFB_00048552_deselect_buttonBar_btn', { visible: true, timeout : 900000 });
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("VDRC_VT945397_GAL4_attP2_2")', {visible : true, timeout : 600000});
		})
	})
})

//Tests components are present in landing page
describe('Test URL Trigger Query Builder', () => {
	beforeAll(async () => {
		//increases default timeout to 2 minutes
		jest.setTimeout(120000);
		await page.goto(QUERY_TRIGGER_URL);
	});

	describe('Test landing page', () => {
//		it('Quick Help Tutorial Present', async () => {
//			await wait4selector(page, 'i.close-quickHelp', { visible: true , timeout : 120000 })
//		})

//		it('Close Quick Help Tutorial', async () => {
//			await page.evaluate(async () => document.getElementsByClassName("close-quickHelp")[0].click());
//			await wait4selector(page, 'i.close-quickHelp', { hidden: true , timeout : 120000 })
//		})
		
		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#VFBTermInfo_el_1_component', { visible: true , timeout : 120000 })
		})
	})

	//Tests metadata in term info component and clicking on links
	describe('Test Term Info Component', () => {
		it('Term info component correctly populated with "fru-M-200266 (VFB_00000001)" as Name', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("fru-M-200266 (VFB_00000001)")');
		})

		it('Term info component correctly populated with "fru-M-200266 (VFB_00000001)" Thumbnail', async () => {
			await page.waitForFunction('document.querySelector(".Collapsible__contentInner img").src === "https://www.virtualflybrain.org/data/VFB/i/0000/0001/thumbnailT.png"');
		})
	})

	describe('Query Results Component Trigger by URL', () => {
		it('Query builder is visible', async () => {
			await click(page, 'i.fa-quora');
			await wait4selector(page, '#querybuilder', { visible: true, timeout : 120000 })
		})
		
		it('Result "EB-IDFP VSB-PB slice 4 glomerulus neuron" present in the query builder', async () => {
			await wait4selector(page, '#FBbt_00111420-image-container', { visible: true , timeout : 10000})
		})
		
		it('Result "EB-IDFP DSB-PB 2 glomeruli neuron" present in the query builder', async () => {
			await wait4selector(page, '#FBbt_00111413-image-container', { visible: true , timeout : 10000})
		})
		
		it('Result "EB-IDFP DSB-PB slice 7 neuron" present in the query builder', async () => {
			await wait4selector(page, '#FBbt_00111417-image-container', { visible: true , timeout : 10000})
		})
	})
})
