const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?i=VFB_00017894";

/**
 * Test Focus Term component
 */
describe('VFB Focus Term Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(500000);
		await page.goto(PROJECT_URL);
	});

	describe('Test Landing Page and Initial Focus Term', () => {
		//Tests components in landing page are present
		it('Test Landing Page', async () => {
			await testLandingPage(page, 'VFB_00017894');
		})

		//Tests components in landing page are present
		it('Test VFB_00017894 is Displayed in Focus Term', async () => {
			expect(
				await page.evaluate(async selector => document.querySelector(".focusTermDivR").innerText)
			).toBe("Queries for adult brain template JFRC2")
		})
	});

	// Tests 'Add Scene' button in spotlight for VFB_00017894
	describe('Add "Medulla"', () => {
		it('Search and Load "Medulla"', async () => {
			await wait4selector(page, 'i.fa-search', { visible: true, timeout : 10000 })
			await page.waitFor(10000);
			await click(page, 'i.fa-search');
			await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { visible: true });

			await page.focus(ST.SPOT_LIGHT_SEARCH_INPUT_SELECTOR);
			await page.keyboard.type('VFB_00102107');
			await page.waitFor(10000);
			await page.keyboard.type(' ');
			await page.waitFor(5000);
			await wait4selector(page, '#paperResults', { visible: true , timeout : 50000 })

			await page.evaluate(async () => {
				let tabs = document.getElementsByClassName('MuiListItem-root ');
				for ( var i = 0; i < tabs.length ; i ++ ) {
					if ( tabs[i].innerText === "VFB_00102107 (ME on JRC2018Unisex adult brain)" ) {
						tabs[i].click();
					}
				}				
			});
			await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { hidden: true, timeout : 50000 });
		})

		it('Test VFB_00102107 is Displayed in Focus Term', async () => {
			expect(
				await page.evaluate(async selector => document.querySelector(".focusTermDivR").innerText)
			).toBe("Queries for ME on JRC2018Unisex adult brain")
		})
	})
})
