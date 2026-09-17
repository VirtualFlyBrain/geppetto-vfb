const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?id=VFB_00101567&q=VFB_00000001,SimilarMorphologyTo; VFBexp_FBal0276838,epFrag";

/**
 * Query Builder component tests
 */
describe('VFB Query Builder Tests', () => {
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

		it('Zoom button for VFB_00101567 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00101567_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		}, 120000)

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		}, 120000)
	})

	describe('Tests Compound Queries from URL', () => {
		it('Wait for First Query', async () => {
			await wait4selector(page, '#querybuilder', { visible: true, timeout : 150000 });
			await wait4selector(page, '#queryitem-fru-M-200266_0', { visible: true, timeout : 150000 });
		}, 220000)
		
		/*
		 * This used to wait for #query-results-label, the footer of the BUILD
		 * view. It only passed because the compound run failed and left the
		 * builder sitting on that view: a compound of two query types returns
		 * parts with different headers, which the client refused to combine and
		 * the server could not run either. Now the run succeeds and the builder
		 * switches to the results view, where the count lives in
		 * .result-verbose-label and the footer is gone -- so the old assertion
		 * timed out on working behaviour. Assert the results instead.
		 */
		it('Query Builder Shows Results for Compound Queries', async () => {
			await wait4selector(page, '#querybuilder', { visible: true, timeout : 150000 });
			await wait4selector(page, '#query-results-container', { visible: true, timeout : 150000 });
			await wait4selector(page, '.result-verbose-label', { visible: true, timeout : 150000 });
			await page.waitForFunction(
				() => {
					const label = document.querySelector('.result-verbose-label');
					return label && /^\s*\d/.test(label.innerText || '');
				},
				{ timeout : 150000 }
			);
			const resultSummary = await page.evaluate(async () => {
				const label = document.querySelector('.result-verbose-label');
				return label ? label.innerText.replace(/\s+/g, ' ').trim() : "";
			});
			// e.g. "25 Neurons with similar morphology to ... AND Images of ..."
			expect(resultSummary).toMatch(/^\d[\d,]*\s+\S/);
			expect(parseInt(resultSummary.replace(/,/g, ''), 10)).toBeGreaterThan(0);
			// Both parts ran: a compound result names each query it combined.
			expect(resultSummary.toLowerCase()).toContain(' and ');
		}, 220000)
	})

	/*
	 * A query row's images are referenced by the plain image id, and the same id
	 * serves every template the image is aligned to -- so every slide of a
	 * multi-alignment carousel carried the same reference and clicking the VNC
	 * slide loaded the brain one. The reference now carries its template.
	 */
	describe('Tests Alignments in Query Result Images', () => {
		it('Results with images arrive', async () => {
			await page.goto(baseURL + "/geppetto?q=FBbt_00003748,ImagesNeurons", { timeout : 220000 });
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 });
			closeModalWindow(page);
			await wait4selector(page, '#querybuilder', { visible: true, timeout : 240000 });
			await page.waitForFunction(
				() => document.querySelectorAll('.query-results-images-column img').length > 0,
				{ timeout : 300000 }
			);
		}, 500000)

		it('An image aligned to a second template is referenced by that template', async () => {
			/*
			 * The reference is what the click acts on, and the component puts it in
			 * the checkbox/loader element id. A row aligned to one template only is
			 * still "<template>,<image>" -- what matters is that two alignments of
			 * one image are no longer the same reference.
			 */
			const references = await page.evaluate(() => Array.from(
				document.querySelectorAll('[id$="-checkbox"], [id$="-loader"]')
			).map((element) => element.id.replace(/-(checkbox|loader)$/, '')));

			const aligned = references.filter((reference) => /^VFB_\d+,VFB_\w+/.test(reference));
			expect(aligned.length).toBeGreaterThan(0);

			// The same image under two templates must not produce one reference.
			const byImage = {};
			aligned.forEach((reference) => {
				const parts = reference.split(',');
				const image = parts[parts.length - 1];
				byImage[image] = byImage[image] || [];
				if (byImage[image].indexOf(reference) < 0) {
					byImage[image].push(reference);
				}
			});
			Object.keys(byImage).forEach((image) => {
				const templates = byImage[image].map((reference) => reference.split(',')[0]);
				expect(templates.length).toEqual(new Set(templates).size);
			});
		}, 240000)
	})
})
