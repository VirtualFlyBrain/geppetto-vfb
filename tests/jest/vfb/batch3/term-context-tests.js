const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, selectTab, takeScreenshot } from '../utils.js';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto";

//Snapshot settings
const SNAPSHOT_OPTIONS = { 
		customSnapshotsDir : "./tests/jest/vfb/snapshots", 
		comparisonMethod: 'ssim', 
		failureThresholdType: 'percent',
		failureThreshold: 0.20 // This means a 20% difference is allowed between compared snapshots during tests
};

//Import snapshot module
const { toMatchImageSnapshot } = require('jest-image-snapshot');
expect.extend({ toMatchImageSnapshot });

/**
 * Tests Term Context Component
 */
describe('VFB Term Context Component Tests', () => {
	beforeAll(async () => {
		//increases timeout to ~8 minutes
		jest.setTimeout(500000);
		await page.goto(projectURL);
	});

	describe('Test Term Context Component', () => {
		//Tests components in landing page are present
		it('Test Landing Page', async () => {
			await testLandingPage(page, 'VFB_00101567');
		}, 120000)

		// Open Term Context Component
		it('Open Term Context', async () => {
			await selectTab(page, "Term Context");

			// Check that the Term Context is Visible
			await wait4selector(page, 'div#VFBGraph', { visible: true, timeout : 800000 });
		}, 120000)

		it('Snapshot Comparison of Term Context', async () => {
			await page.waitFor(10000);
			const image = await page.screenshot();
			takeScreenshot(page, "term-context-tests-js-vfb-term-context-component-tests-add-medulla-snapshot-comparison-of-term-context-after-sync-trigger-graph-displays-medulla-1-snap.png");
			expect(image).toMatchImageSnapshot( { ...SNAPSHOT_OPTIONS, customSnapshotsDir : "./tests/jest/vfb/snapshots/term-context/adult-brain"  });
		}, 120000)
	})

	// Add Medulla to scene, needed to test sync mechanism in Term Context
	describe('Add "Medulla"', () => {
		// Load medulla using Search component
		it('Search and Load "Medulla"', async () => {
			// Open up Search Component
			await wait4selector(page, 'i.fa-search', { visible: true, timeout : 10000 })
			await page.waitFor(10000);
			await click(page, 'i.fa-search');
			await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { visible: true , timeout : 10000});

			// Enter input in Search Component text field
			await page.focus(ST.SPOT_LIGHT_SEARCH_INPUT_SELECTOR);
			await page.keyboard.type('FBbt_00003748');
			await page.waitFor(10000);
			await page.keyboard.type(' ');
			await page.waitFor(5000);
			await wait4selector(page, '#paperResults', { visible: true , timeout : 50000 })

			// Click medulla in results shown in Search Component
			await page.evaluate(async () => {
				let tabs = document.getElementsByClassName('MuiListItem-root ');
				for ( var i = 0; i < tabs.length ; i ++ ) {
					if ( tabs[i].innerText.split('\n')[0] === "medulla (FBbt_00003748)" ) {
						tabs[i].click();
					}
				}				
			});

			// Wait for results in search component to go away
			await page.waitFor(5000);
			await wait4selector(page, ST.SPOT_LIGHT_SELECTOR, { hidden: true, timeout : 50000 });
		}, 120000)

		// Wait for Medulla to be loaded by checking term info and Focus Term
		it('Medulla Loaded', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true, timeout : 120000 });
			expect(
					await page.evaluate(async selector => document.querySelector(".focusTermDivR").innerText)
			).toBe("Queries for medulla")
		}, 120000)

		// Re open Term Context
		it('Open Term Context', async () => {
			await selectTab(page, "Term Context");

			// Check that the Tree Browser is visible
			await wait4selector(page, 'div#VFBGraph', { visible: true, timeout : 800000 });
		})

		// Take snapshot of Page and compare to image of what it should look like
		it("Snapshot Comparison of Term Context After Medulla Loaded, Graph Remains the Same", async () => {
			// Wait 5 seconds so nodes in Term Context stop moving
			await page.waitFor(5000);
			await click(page, 'i.fa-home');
			await page.waitFor(3000);
			const image = await page.screenshot();
			takeScreenshot(page, "term-context-tests-js-vfb-term-context-component-tests-add-medulla-snapshot-comparison-of-term-context-after-medulla-loaded-graph-remains-the-same-1-snap.png");
			await page.waitFor(2000)
			// This will fail if Adult Brain is not still loaded.
			expect(image).toMatchImageSnapshot( { ...SNAPSHOT_OPTIONS, customSnapshotsDir : "./tests/jest/vfb/snapshots/term-context/adult-brain"  });
		}, 120000)

		it('Snapshot Comparison of Term Context After Sync Trigger, Graph Displays Medulla', async () => {
			// Click on sync button
			await click(page, 'i.fa-refresh');
			await page.waitFor(2000);
			// Wait 10 seconds so nodes in Term Context stop moving
			await page.waitFor(10000);
			// reset camera to center, to make snapshots for tests be taken when camera is centered
			await click(page, 'i.fa-home');
			await page.waitFor(2000);
			// Take screenshot, and compared to stored image of page.
			const image = await page.screenshot();
			takeScreenshot(page, "term-context-tests-js-vfb-term-context-component-tests-test-term-context-component-snapshot-comparison-of-term-context-1-snap.png");
			await page.waitFor(2000)
			// This will fail if Medulla didn't load in Term Context, since snapshot comparison will show differences
			SNAPSHOT_OPTIONS.failureThreshold = 0.20 // allowing for minor graph layout changes
			expect(image).toMatchImageSnapshot( { ...SNAPSHOT_OPTIONS, customSnapshotsDir : "./tests/jest/vfb/snapshots/term-context/medulla"  });
		}, 120000)
	})
})
