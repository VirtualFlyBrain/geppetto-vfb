const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from './cmdline.js';
import { wait4selector, click } from './utils';
import * as ST from './selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?i=VFB_00017894";

/**
 * Tests Menu Components
 */
describe('VFB Menu Component Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(120000); 
		await page.goto(projectURL);

	});

	//Tests components in landing page are present
	describe('Test Landing Page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
		})

		it('VFB Title shows up', async () => {
			const title = await page.title();
			expect(title).toBe("Virtual Fly Brain");
		})
	})

	//Tests opening control panel and clicking on row buttons
	describe('Test Menu Components About and Help', () => {
		//Tests control panel opens up and that is populated with expected 2 rows
		it('Open Virtual Fly Brain Menu', async () => {
			await page.evaluate(async () => document.getElementById("Virtual Fly Brain").click());
			await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 })
			const dropDownMenuItems = await page.evaluate(async () => document.getElementsByClassName("MuiListItem-root").length);
			expect(dropDownMenuItems).toEqual(4);
		})

		//Tests clicking in select button for VFB_00017894 from control panel works, term info should show deselect button for VFB_00017894
		it('About Modal Appears', async () => {
			await page.evaluate(async () => document.getElementById("About").click());
			await wait4selector(page, '#vfb-content-block', { visible: true })
		})

		//Tests term info metadata changed in response to previous test selection of VFB_00017894. 
		it('About Modal Title Correct', async () => {
			await page.waitForFunction('document.getElementById("vfb-content-titlebar").innerText.startsWith("About Virtual Fly Brain")');
		})
		
		it('About Modal Title Correct', async () => {
			await page.waitForFunction('document.getElementById("vfb-content-text").innerText.startsWith("Who we are")');
		})
		
		it('About Modal Contains Contents', async () => {
			await page.waitForFunction('document.getElementsByClassName("vfb-content-container")[0].innerText.startsWith("3D Viewer, online tools, server and the website:")');
		})
		
		it('About Modal Closed', async () => {
			await click(page, 'i.close-slider')
			await wait4selector(page, '#vfb-content-block', {hidden: true, timeout : 5000});
		})
		
		it('Help Menu Appears', async () => {
			await page.evaluate(async () => document.getElementById("Help").click());
			await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 })
			const dropDownMenuItems = await page.evaluate(async () => document.getElementsByClassName("MuiListItem-root").length);
			expect(dropDownMenuItems).toEqual(3);
		})
		
		it('Help Modal FAQ Tab Opened', async () => {
			let pagesOpened = await browser.pages();
			await page.evaluate(async () => document.getElementById("F.A.Q.").click());
			await page.waitFor(2000); // await for a while
			let newPagesOpened = await browser.pages();
			expect(newPagesOpened.length).toEqual(pagesOpened.length+1);
		})
	})
})
