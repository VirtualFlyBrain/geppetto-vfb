const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, flexWindowClick, findElementByText, selectTab, setTextFieldValue } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?id=VFB_jrchjrch";

const ONE_SECOND = 1000;

/**
 * TODO: Work in progress, need to expand, right now only tests Circuit Browser opens
 * Tests Circuit Browser Component
 */
describe('VFB Circuit Browser Tests', () => {
	beforeAll(async () => {
		//increases timeout to ~8 minutes
		jest.setTimeout(60 * ONE_SECOND);
		await page.goto(projectURL);
	});

	//Tests opening term context and clicking on row buttons
	describe('Test Circuit Browser Component', () => {
		//Tests components in landing page are present
		it('Test Landing Page', async () => {
			await testLandingPage(page, 'VFB_jrchjrch');
		})
		
		it('Open Circuit Browser', async () => {
			await selectTab(page, "Circuit Browser");

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div#VFBCircuitBrowser', { visible: true, timeout : 90 * ONE_SECOND });
		})
		
		it('Open Term Info', async () => {
			await selectTab(page, "Term Info");

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div#vfbterminfowidget', { visible: true, timeout : 90 * ONE_SECOND });
		})
		
		it('Open Circuit Browser from Term Info with ID : VFB_jrchjrch', async () => {
			await page.click("#circuitBrowserLink");

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div#VFBCircuitBrowser', { visible: true, timeout : 90 * ONE_SECOND });

			await page.waitFor(ONE_SECOND);
			const neuron1Input =  await page.evaluate( () => document.querySelector(".neuron1 input").value)
		    expect(neuron1Input).toBe("5-HTPLP01_R (FlyEM-HB:1324365879)(VFB_jrchjrch)");
		})
		
		it('Set Neuron 2, VFB_jrchjsfu', async () => {
			await page.waitFor(ONE_SECOND);
			await setTextFieldValue(".neuron2 input", "VFB_jrchjsfu")

			await wait4selector(page, 'ul.MuiAutocomplete-listbox', { visible: true, timeout : 90 * ONE_SECOND });
			
  		    await page.click('ul.MuiAutocomplete-listbox li');
		})
		
		it('Refresh Graph with VFB_jrchjrch and VFB_jrchjsfu', async () => {
  		    await page.waitFor(ONE_SECOND);
   		    await page.click('#refreshCircuitBrowser');
			await wait4selector(page, '#circuitBrowserLegend', { visible: true, timeout : 240 * ONE_SECOND });
			
			const legendLabels =  await page.evaluate( () => document.querySelectorAll("#circuitBrowserLegend li").length)
		    expect(legendLabels).toBe(2);
		})
		
		it('Set weight field to 20', async () => {
			await page.waitFor(5 * ONE_SECOND);
			await setTextFieldValue("#weightField", 20)
			await page.waitFor(ONE_SECOND);
			
   		    await page.click('#refreshCircuitBrowser');
			await wait4selector(page, '.MuiCircularProgress-svg', { visible: true, timeout : 10 * ONE_SECOND });
			await page.waitFor(10 * ONE_SECOND);
			await wait4selector(page, '#circuitBrowserLegend', { visible: true, timeout : 240 * ONE_SECOND });
			
			const legendLabels =  await page.evaluate( () => document.querySelectorAll("#circuitBrowserLegend li").length)
		    expect(legendLabels).toBe(2);
		})

		it('Set weight field to 50', async () => {
			await page.waitFor(ONE_SECOND);
			await setTextFieldValue("#weightField", 50)
			await page.waitFor(ONE_SECOND);
			
   		    await page.click('#refreshCircuitBrowser');
			await wait4selector(page, '.MuiCircularProgress-svg', { visible: true, timeout : 10 * ONE_SECOND });
			await page.waitFor(10 * ONE_SECOND);
			await wait4selector(page, '#circuitBrowserLegend', { visible: true, timeout : 240 * ONE_SECOND });
			
			const legendLabels =  await page.evaluate( () => document.querySelectorAll("#circuitBrowserLegend li").length)
		    expect(legendLabels).toBe(2);
		})
	})
})
