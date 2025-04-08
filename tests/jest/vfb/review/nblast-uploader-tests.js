const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?id=VFB_00017894";

/**
 * Query Builder component tests
 */
describe('VFB Uploader Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(1800000); 
		await page.goto(PROJECT_URL);
	});

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

		it('Zoom button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00017894_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		}, 120000)

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		}, 120000)
	})

	describe('Tests NBLAST Uploader', () => {
		it('Open Uploader', async () => {
			await page.click('#fa-upload');			  
			
			await page.waitForSelector('div.MuiDialog-root');
		})
		
		it('Templates Populated', async () => {
			await page.evaluate(async () => {
				var dropdown = document.getElementById('mui-component-select-template');
			    var event = document.createEvent('MouseEvents');
			    event.initMouseEvent('mousedown', true, true, window);
			    dropdown.dispatchEvent(event);
			}, 120000);
			
			await page.waitForSelector('li.MuiListItem-root');
			
			const list = await page.evaluate(async () => {
				document.querySelectorAll('.MuiListItem-root')[1].click();
				return document.querySelectorAll('.MuiListItem-root').length;
			});
			
			expect(list).toBe(4);
		}, 120000)
		
		it('Template Selected', async () => {
			const selection = await page.evaluate(async () => {
				return document.getElementById("template-selection").value;
			});
			
			expect(selection).toBe("JRC2018Unisex");
		})
		
	})
})
