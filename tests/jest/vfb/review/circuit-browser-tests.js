const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, flexWindowClick, findElementByText, selectTab, setTextFieldValue } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?id=VFB_jrchjrch";

const ONE_SECOND = 1000;
const TEN_MINUTES = 600 * ONE_SECOND;

const waitForLegendWithRows = async (minimumRows = 2, timeout = 240 * ONE_SECOND) => {
	await wait4selector(page, '#circuitBrowserLegend', { visible: true, timeout });
	await page.waitForFunction((rows) => document.querySelectorAll('#circuitBrowserLegend li').length >= rows, { timeout }, minimumRows);
};

const refreshCircuitBrowser = async () => {
	await page.click('#refreshCircuitBrowser');

	// Spinner is only rendered for slower calls, so treat it as optional.
	try {
		await page.waitForSelector('.MuiCircularProgress-svg', { visible: true, timeout: 10 * ONE_SECOND });
		await page.waitForSelector('.MuiCircularProgress-svg', { hidden: true, timeout: 120 * ONE_SECOND });
	} catch (error) {
		// No spinner observed for fast responses.
	}

	await waitForLegendWithRows(2);
};

const setSecondNeuron = async (id) => {
	await wait4selector(page, '.neuron2 input', { visible: true, timeout: 60 * ONE_SECOND });
	await page.click('.neuron2 input', { clickCount: 3 });
	await page.keyboard.press('Backspace');
	await page.keyboard.type(id, { delay: 35 });

	await wait4selector(page, 'ul.MuiAutocomplete-listbox', { visible: true, timeout: 60 * ONE_SECOND });
	const selectedTargetNeuron = await page.evaluate(async (targetId) => {
		const options = Array.from(document.querySelectorAll('ul.MuiAutocomplete-listbox li'));
		const target = options.find((option) => (option.textContent || '').includes(targetId));
		if (target) {
			target.click();
			return true;
		}
		return false;
	}, id);

	if (!selectedTargetNeuron) {
		await page.click('ul.MuiAutocomplete-listbox li');
	}

	await page.waitFor(ONE_SECOND);
	await page.waitForFunction((targetId) => {
		const input = document.querySelector('.neuron2 input');
		return input && typeof input.value === 'string' && input.value.includes(targetId);
	}, { timeout: 30 * ONE_SECOND }, id);
};

/**
 * TODO: Work in progress, need to expand, right now only tests Circuit Browser opens
 * Tests Circuit Browser Component
 */
describe('VFB Circuit Browser Tests', () => {
	beforeAll(async () => {
		//increases timeout to ~8 minutes
		jest.setTimeout(TEN_MINUTES);
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
			await wait4selector(page, '#circuitBrowserLink', { visible: true, timeout : 150 * ONE_SECOND });
		})
		
		it('Open Circuit Browser from Term Info with ID : VFB_jrchjrch', async () => {
			await page.click("#circuitBrowserLink");

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div#VFBCircuitBrowser', { visible: true, timeout : 90 * ONE_SECOND });

			await page.waitFor(ONE_SECOND);
			const neuron1Input =  await page.evaluate( () => document.querySelector(".neuron1 input").value)
		    expect(neuron1Input).toBe("5-HTPLP01_R (FlyEM-HB:1324365879) (VFB_jrchjrch)");
		})
		
		it('Set Neuron 2, VFB_jrchjsfu', async () => {
			await setSecondNeuron("VFB_jrchjsfu");
		})
		
		it('Refresh Graph with VFB_jrchjrch and VFB_jrchjsfu', async () => {
			await page.waitFor(ONE_SECOND);
			await refreshCircuitBrowser();
			
			const legendLabels =  await page.evaluate( () => document.querySelectorAll("#circuitBrowserLegend li").length)
		    expect(legendLabels).toBeGreaterThanOrEqual(2);
		})
		
		it('Set weight field to 20', async () => {
			await wait4selector(page, '#weightField', { visible: true, timeout: 60 * ONE_SECOND });
			await setTextFieldValue("#weightField", 20)
			await page.waitFor(ONE_SECOND);
			
			await refreshCircuitBrowser();
			
			const legendLabels =  await page.evaluate( () => document.querySelectorAll("#circuitBrowserLegend li").length)
		    expect(legendLabels).toBeGreaterThanOrEqual(2);
		})

		it('Set weight field to 50', async () => {
			await wait4selector(page, '#weightField', { visible: true, timeout: 60 * ONE_SECOND });
			await setTextFieldValue("#weightField", 50)
			await page.waitFor(ONE_SECOND);
			
			await refreshCircuitBrowser();
			
			const legendLabels =  await page.evaluate( () => document.querySelectorAll("#circuitBrowserLegend li").length)
		    expect(legendLabels).toBeGreaterThanOrEqual(2);
		})
	})
})
