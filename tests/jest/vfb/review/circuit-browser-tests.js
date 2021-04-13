const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, flexWindowClick, findElementByText, selectTab, setTextFieldValue } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto";

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
			await testLandingPage(page, 'VFB_00101567');
		})
		
		it('Open Circuit Browser', async () => {
			await selectTab(page, "Circuit Browser");

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div#VFBCircuitBrowser', { visible: true, timeout : 30 * ONE_SECOND });
		})
		
		it('Set Neuron 1 , VFB_jrchjrch', async () => {
			await page.waitFor(ONE_SECOND);
			await setTextFieldValue("neuron1", "VFB_jrchjrch")
			
			await wait4selector(page, 'ul.MuiAutocomplete-listbox', { visible: true, timeout : 30 * ONE_SECOND });

   		    await page.click('ul.MuiAutocomplete-listbox li');
		})
		
		it('Set Neuron 2, VFB_jrchjsfu', async () => {
			await page.waitFor(ONE_SECOND);
			await setTextFieldValue("neuron2", "VFB_jrchjsfu")

			await wait4selector(page, 'ul.MuiAutocomplete-listbox', { visible: true, timeout : 30 * ONE_SECOND });
			
  		    await page.click('ul.MuiAutocomplete-listbox li');
		})
		
		it('Refresh Graph with VFB_jrchjrch and VFB_jrchjsfu', async () => {
  		    await page.waitFor(ONE_SECOND);
   		    await page.click('#refreshCircuitBrowser');
			await wait4selector(page, '#circuitBrowserLegend', { visible: true, timeout : 30 * ONE_SECOND });
			
			const legendLabels =  await page.evaluate( () => document.querySelectorAll("#circuitBrowserLegend li").length)
		    expect(legendLabels).toBe(2);
		})
		
		it('Add Neuron ', async () => {
  		    await page.waitFor(ONE_SECOND);
   		    await page.click('#addNeuron');
			await wait4selector(page, '#neuron3', { visible: true, timeout : 2 * ONE_SECOND });
		})
		
		it('Set Neuron 3, VFB_jrchjs1t', async () => {
			await page.waitFor(ONE_SECOND);
			await setTextFieldValue("neuron3", "VFB_jrchjs1t")

			await wait4selector(page, 'ul.MuiAutocomplete-listbox', { visible: true, timeout : 30 * ONE_SECOND });
			
  		    await page.click('ul.MuiAutocomplete-listbox li');
		})
		
		it('Refresh Graph with VFB_jrchjrch, VFB_jrchjsfu and VFB_jrchjs1t', async () => {
  		    await page.waitFor(ONE_SECOND);
   		    await page.click('#refreshCircuitBrowser');
			await wait4selector(page, '#circuitBrowserLegend', { visible: true, timeout : 30 * ONE_SECOND });
			
			const legendLabels =  await page.evaluate( () => document.querySelectorAll("#circuitBrowserLegend li").length)
		    expect(legendLabels).toBe(2);
		})
		
		it('Set weight field to 20', async () => {
			await page.waitFor(ONE_SECOND);
			await setTextFieldValue("weightField", 20)
			await page.waitFor(ONE_SECOND);
			
   		    await page.click('#refreshCircuitBrowser');
			await page.waitFor(10 * ONE_SECOND);
			await wait4selector(page, '#circuitBrowserLegend', { visible: true, timeout : 30 * ONE_SECOND });
			
			const legendLabels =  await page.evaluate( () => document.querySelectorAll("#circuitBrowserLegend li").length)
		    expect(legendLabels).toBe(3);
		})
		
		it('Delete Neuron ', async () => {
  		    await page.waitFor(ONE_SECOND);
   		    await page.click('#deleteNeuron2');
  		    await page.waitFor(ONE_SECOND);
			const neuronFields =  await page.evaluate( () => document.querySelectorAll("#neuronFieldsGrid input").length)
		    expect(neuronFields).toBe(2);
		})
		
		it('Set weight field to 50', async () => {
			await page.waitFor(ONE_SECOND);
			await setTextFieldValue("weightField", 50)
			await page.waitFor(ONE_SECOND);
			
   		    await page.click('#refreshCircuitBrowser');
			await page.waitFor(10 * ONE_SECOND);
			await wait4selector(page, '#circuitBrowserLegend', { visible: true, timeout : 30 * ONE_SECOND });
			
			const legendLabels =  await page.evaluate( () => document.querySelectorAll("#circuitBrowserLegend li").length)
		    expect(legendLabels).toBe(2);
		})
	})
})
