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
		}, 120000)

		//Tests initial focus term label matches that of Adult Brain
		it('Test VFB_00017894 is Displayed in Focus Term', async () => {
			expect(
				await page.evaluate(async selector => document.querySelector(".focusTermDivR").innerText)
			).toBe("Queries for adult brain template JFRC2")
		}, 120000)
	});

	describe('Add "Medulla" and Test Focus Term', () => {
		// Load Medulla instance
		it('Search and Load "Medulla"', async () => {
			// Open search component and search for 'Medulla'
			await wait4selector(page, 'i.fa-search', { visible: true, timeout : 10000 })
			await page.waitFor(10000);
			await click(page, 'i.fa-search');
			await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { visible: true , timeout : 10000});
			await page.focus(ST.SPOT_LIGHT_SEARCH_INPUT_SELECTOR);
			await page.keyboard.type('FBbt_00003748');
			await page.waitFor(5000);
			await page.keyboard.type(' ');
			await page.waitFor(10000);
			await wait4selector(page, '#paperResults', { visible: true , timeout : 50000 })

			// Click on Medulla when results appear
			await page.evaluate(async () => {
				let tabs = document.getElementsByClassName('MuiListItem-root ');
				for ( var i = 0; i < tabs.length ; i ++ ) {
					if ( tabs[i].innerText.split('\n')[0] === "medulla (FBbt_00003748)" ) {
						tabs[i].click();
					}
				}				
			});

			// Wait until results drop down disappear
			await page.waitFor(5000);
			await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { hidden: true, timeout : 50000 });
		}, 120000)

		// Test Focus Term was updated with Medulla
		it('Text for FBbt_00003748 is Displayed in Focus Term', async () => {
			await page.waitFor(10000);
			expect(
				await page.evaluate(async selector => document.querySelector(".focusTermDivR").innerText)
			).toBe("Queries for medulla")
		}, 120000)

		// Open Focus Term drop down menu
		it('Open Focus Term Menu for FBbt_00003748 (Medulla) ', async () => {
			await page.evaluate(async selector => document.getElementById("Queries for medulla").click())
			await wait4selector(page, '#simple-popper', { visible: true , timeout : 50000 })
		}, 120000)

		// Cick on option from drop down menu, and wait for Query Panel to appear
		it('Queries Component Opens Up After Launching it from Focus Term', async () => {
			await page.evaluate(async selector => document.getElementById("Subclasses of medulla").click())
			await wait4selector(page, '#query-builder-container', { visible: true , timeout : 50000 })
		}, 120000)
	})
})
