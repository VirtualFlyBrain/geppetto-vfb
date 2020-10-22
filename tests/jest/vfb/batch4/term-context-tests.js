const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, flexWindowClick, findElementByText, selectTab } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto";

/**
 * Tests Term Context Component
 */
describe('VFB Term Context Component Tests', () => {
	beforeAll(async () => {
		//increases timeout to ~8 minutes
		jest.setTimeout(500000);
		await page.goto(projectURL);
	});

	//Tests opening term context and clicking on row buttons
	describe('Test Term Context Component', () => {
		//Tests components in landing page are present
		it('Test Landing Page', async () => {
			await testLandingPage(page, 'VFB_00101567');
		})
		
		it('Open Term Context', async () => {
			await selectTab(page, "Term Context");

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div#VFBGraph', { visible: true, timeout : 800000 });
		})
	})
})
