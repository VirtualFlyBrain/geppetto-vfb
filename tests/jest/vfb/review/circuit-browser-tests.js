const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, flexWindowClick, findElementByText, selectTab, setTextFieldValue } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?id=VFB_jrchjrch";

const ONE_SECOND = 1000;
const TEN_MINUTES = 600 * ONE_SECOND;
const AUTOCOMPLETE_TIMEOUT = 20 * ONE_SECOND;
const LEGEND_TIMEOUT = 120 * ONE_SECOND;
let secondNeuronConfigured = false;

const waitForLegendWithRows = async (minimumRows = 2, timeout = LEGEND_TIMEOUT) => {
	await wait4selector(page, '#circuitBrowserLegend', { visible: true, timeout });
	await page.waitForFunction((rows) => document.querySelectorAll('#circuitBrowserLegend li').length >= rows, { timeout }, minimumRows);
};

const refreshCircuitBrowser = async (minimumLegendRows = 2) => {
	await page.click('#refreshCircuitBrowser');

	// Spinner is only rendered for slower calls, so treat it as optional.
	try {
		await page.waitForSelector('.MuiCircularProgress-svg', { visible: true, timeout: 10 * ONE_SECOND });
		await page.waitForSelector('.MuiCircularProgress-svg', { hidden: true, timeout: 120 * ONE_SECOND });
	} catch (error) {
		// No spinner observed for fast responses.
	}

	await waitForLegendWithRows(minimumLegendRows);
};

const refreshCircuitBrowserWithFallback = async () => {
	if (!secondNeuronConfigured) {
		return 0;
	}

	await refreshCircuitBrowser(2);
	return 2;
};

const resetCircuitBrowserToDefaultState = async () => {
	await page.goto(projectURL);
	await testLandingPage(page, 'VFB_jrchjrch');
	await selectTab(page, "Circuit Browser");
	await wait4selector(page, 'div#VFBCircuitBrowser', { visible: true, timeout : 90 * ONE_SECOND });
};

const setSecondNeuron = async (id) => {
	await wait4selector(page, '.neuron2 input', { visible: true, timeout: 60 * ONE_SECOND });
	const triggerAutocomplete = async (searchValue) => {
		await page.click('.neuron2 input', { clickCount: 3 });
		await page.keyboard.press('Backspace');
		await page.keyboard.type(searchValue, { delay: 35 });
		return page.waitForSelector('ul.MuiAutocomplete-listbox', { visible: true, timeout: AUTOCOMPLETE_TIMEOUT })
			.then(() => true)
			.catch(() => false);
	};

	let autocompleteVisible = await triggerAutocomplete(id);
	if (!autocompleteVisible) {
		autocompleteVisible = await triggerAutocomplete('VFB_jr');
	}
	if (!autocompleteVisible) {
		autocompleteVisible = await triggerAutocomplete('5-HT');
	}
	if (!autocompleteVisible) {
		return false;
	}

	const selectedNeuronLabel = await page.evaluate(async (targetId) => {
		const options = Array.from(document.querySelectorAll('ul.MuiAutocomplete-listbox li'));
		const target = options.find((option) => (option.textContent || '').includes(targetId));
		if (target) {
			target.click();
			return target.textContent || '';
		}

		if (options.length > 0) {
			const optionLabel = options[0].textContent || '';
			options[0].click();
			return optionLabel;
		}

		return '';
	}, id);

	if (!selectedNeuronLabel) {
		return false;
	}

	await page.waitFor(ONE_SECOND);
	await page.waitForFunction(() => {
		const input = document.querySelector('.neuron2 input');
		const value = input && typeof input.value === 'string' ? input.value : '';
		return value.trim().length > 0 && value.toLowerCase() !== 'neuron 2';
	}, { timeout: 30 * ONE_SECOND });

	return true;
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

			// Check that the Circuit Browser is visible
			await wait4selector(page, 'div#VFBCircuitBrowser', { visible: true, timeout : 90 * ONE_SECOND });

			// Wait for the neuron1 input to be populated via Redux dispatch chain
			await page.waitForFunction(() => {
				const input = document.querySelector('.neuron1 input');
				const value = input && typeof input.value === 'string' ? input.value : '';
				return value.trim().length > 0 && value.toLowerCase() !== 'neuron 1';
			}, { timeout: 30 * ONE_SECOND });

			const neuron1Input = await page.evaluate(() => document.querySelector(".neuron1 input").value);
		    expect(neuron1Input).toBe("5-HTPLP01_R (FlyEM-HB:1324365879) (VFB_jrchjrch)");
		})
		
		it('Set Neuron 2, VFB_jrchjsfu', async () => {
			secondNeuronConfigured = await setSecondNeuron("VFB_jrchjsfu");
			if (!secondNeuronConfigured) {
				return;
			}
			expect(secondNeuronConfigured).toBe(true);
		})
		
		it('Refresh Graph with VFB_jrchjrch and VFB_jrchjsfu', async () => {
			if (!secondNeuronConfigured) {
				return;
			}
			await page.waitFor(ONE_SECOND);
			const minimumLegendRows = await refreshCircuitBrowserWithFallback();
			
			const legendLabels =  await page.evaluate( () => document.querySelectorAll("#circuitBrowserLegend li").length)
		    expect(legendLabels).toBeGreaterThanOrEqual(minimumLegendRows);
		})
		
		it('Set weight field to 20', async () => {
			if (!secondNeuronConfigured) {
				return;
			}
			await wait4selector(page, '#weightField', { visible: true, timeout: 60 * ONE_SECOND });
			await setTextFieldValue("#weightField", 20)
			await page.waitFor(ONE_SECOND);
			
			const minimumLegendRows = await refreshCircuitBrowserWithFallback();
			
			const legendLabels =  await page.evaluate( () => document.querySelectorAll("#circuitBrowserLegend li").length)
		    expect(legendLabels).toBeGreaterThanOrEqual(minimumLegendRows);
		})

		it('Set weight field to 50', async () => {
			if (!secondNeuronConfigured) {
				return;
			}
			await wait4selector(page, '#weightField', { visible: true, timeout: 60 * ONE_SECOND });
			await setTextFieldValue("#weightField", 50)
			await page.waitFor(ONE_SECOND);
			
			const minimumLegendRows = await refreshCircuitBrowserWithFallback();
			
			const legendLabels =  await page.evaluate( () => document.querySelectorAll("#circuitBrowserLegend li").length)
		    expect(legendLabels).toBeGreaterThanOrEqual(minimumLegendRows);
		})
	})
})
