const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, findElementByText } from '../utils.js';
import * as ST from '../selectors.js';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?id=VFB_00102107&i=VFB_00101567,VFB_00102271,VFB_00102107";

/**
 * Query Builder component tests
 */
describe('VFB Downloader Tests', () => {
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

		it('Zoom button for VFB_00102107 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00102107_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		}, 120000)

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		}, 120000)
		
				//Tests canvas has 5 meshes rendered
		it('Canvas container component has 3 meshes rendered', async () => {
			expect(
					await page.evaluate(async () => Object.keys(CanvasContainer.engine.meshes).length)
			).toBe(3)
		}, 120000)
	})

	describe('Tests Download Contents', () => {
		it('Open Download Component Files', async () => {
			await page.click('i.fa-download');			  
			
			await page.waitForSelector('#downloadContents');
		})
		
		it('Download disabled by default', async () => {
			expect(
					await page.evaluate(async () => document.querySelector('#downloadContentsButton').disabled )
			).toBe(true)
		})
		
		it('Download all files for all instances', async () => {
			await page.evaluate(async selector => { 
				let inputs = document.querySelectorAll(".MuiDialogContent-root input");
				inputs = Array.prototype.slice.call(inputs).filter(input => input.id != "ALL_INSTANCES");
				inputs.forEach( input => {
				  input.click();
				});
			});
			
			expect(
					await page.evaluate(async () => document.querySelector('#downloadContentsButton').disabled )
			).toBe(false)
		}, 120000)
		
		
		it('Download Contents Dialog goes away', async () => {
			await page.click('#downloadContentsButton');

			/*
			 * The dialog only closes when the POST to the zip service
			 * (configuration.json postURL) resolves; on any error or hang it
			 * stays open and switches to the error footer (the "Try Again"
			 * button carries i.fa-refresh). Race both outcomes so a backend
			 * failure reports as a clean assertion rather than timing out and
			 * rejecting after teardown (which crashes the jest worker). Keep
			 * the waits below the it() timeout for the same reason.
			 */
			const outcome = await Promise.race([
				page.waitForSelector('#downloadContents', { hidden: true, timeout: 90000 })
					.then(() => 'closed').catch(() => null),
				page.waitForSelector('#downloadContents .fa-refresh', { visible: true, timeout: 90000 })
					.then(() => 'error').catch(() => null)
			]);

			if (outcome === 'error') {
				throw new Error('Zip download failed: the download dialog showed the error '
					+ 'footer instead of closing. Check the zip service (configuration.json postURL).');
			}
			expect(outcome).toBe('closed');
		}, 120000)
		
	})
})
