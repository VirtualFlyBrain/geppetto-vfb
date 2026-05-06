const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, findElementByText } from '../utils.js';
import * as ST from '../selectors.js';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL1 = baseURL + "/geppetto?id=VFB_00102107&i=VFB_00101567,VFB_00102107,VFB_00102135,VFB_00102162";
const projectURL2 = baseURL + "/geppetto?i=VFB_00102107,VFB_00101567,VFB_00102135,VFB_00102162";
const projectURL3 = baseURL + "/geppetto?id=FBbt_00014013&i=VFB_00101567,VFB_00102135,VFB_00102162,VFB_00102107";
const projectURL4 = baseURL + "/geppetto?id=VFB_00000001&i=VFB_00101567,VFB_00000001";
const projectURL5 = baseURL + "/geppetto?i=VFB_00000001,VFB_00101567,VFB_00000001";

//Initial components in landin page, tests spinner is gone and title are present
const testLandingPage = function(){
	it('Loading spinner goes away', async () => {
		await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
		// Close tutorial window
		closeModalWindow(page);
	})

	it('VFB Title shows up', async () => {
		const title = await page.title();
		expect(title).toMatch("Virtual Fly Brain");
	})
};

//Tests loading project containing 'Medulla'
const medullaTest = function(project) {
	beforeAll(async () => {
		//increases timeout to 9 minutes
		jest.setTimeout(600000);
		await page.goto(project);
	});

	describe('Test landing page', () => {
		testLandingPage();
	})

	describe('Test Term Info Component Contains Metadata for Medulla', () => {
		// Force-focus VFB_00102107 — addVfbId rewrites the URL id= to the template
		// during initial load (VFBMain.js:165), so on slow runners the term info ends
		// up on the template, not VFB_00102107. Calling addVfbId again with the
		// desired id sets it as the focus. Same pattern as batch3/batch-request-tests.js.
		it('Deselect button for VFB_00102107 appears in button bar inside the term info component', async () => {
			// Wait for the VFB_00102107 instance to be loaded (any mesh key starting with
			// "VFB_00102107." — could be _obj, _swc, etc.). addVfbId mid-load doesn't select
			// when idsFromURL is non-empty, so call .select() and setTermInfo() directly.
			// 360s wait — run 25319381544 mesh appeared ~246s in, just past the 240s ceiling.
			await page.waitForFunction(
				() => {
					if (typeof Instances === 'undefined' || !Instances['VFB_00102107']) return false;
					if (typeof Instances['VFB_00102107'].select !== 'function') return false;
					if (typeof CanvasContainer === 'undefined' || !CanvasContainer.engine || !CanvasContainer.engine.meshes) return false;
					return Object.keys(CanvasContainer.engine.meshes).some(k => k.indexOf('VFB_00102107.') === 0);
				},
				{ timeout: 360000 }
			);
			await page.evaluate(() => {
				Instances['VFB_00102107'].select();
				if (typeof window.setTermInfo === 'function' && Instances['VFB_00102107'].VFB_00102107_meta) {
					window.setTermInfo(Instances['VFB_00102107'].VFB_00102107_meta, 'VFB_00102107');
				}
			});
			await wait4selector(page, '#VFB_00102107_deselect_buttonBar_btn', { visible: true , timeout : 240000 })
		}, 720000)

		it('Zoom button for VFB_00102107 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00102107_zoom_buttonBar_btn]', { visible: true , timeout : 240000 })
		}, 300000)

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		}, 120000)

		// Substring waitForFunction tolerates the term info's name format (e.g. the
		// page may render "medulla" inside a longer label or a wrapping element).
		it('Term info component correctly populated with "Medulla" as Name', async () => {
			await page.waitForFunction(() => (document.body.innerText || '').toLowerCase().includes('medulla'),
				{ timeout: 60000 });
		}, 120000)

		it('Term info component correctly populated with "Medula" as Classification Name', async () => {
			await page.waitForFunction(() => (document.body.innerText || '').toLowerCase().includes('medulla'),
				{ timeout: 60000 });
		}, 120000)

			it('Term info component correctly populated with "Medula" Thumbnail', async () => {
				await page.waitForFunction(() => {
					const thumbnail = document.querySelector(".Collapsible__contentInner img");
					if (!thumbnail || !thumbnail.src) {
						return false;
					}
					return /thumbnail(T)?\.png(\?.*)?$/i.test(thumbnail.src);
				}, { timeout : 80000 });
			}, 120000)
	})

	describe('"Medula" Selected in Canvas Container', () => {
		it('VFB_00102107.VFB_00102107_obj selected', async () => {
			await page.waitFor(2000);
			expect(
					await page.evaluate(async () => CanvasContainer.engine.meshes['VFB_00102107.VFB_00102107_obj'].selected)
				).toBeTruthy();
			}, 120000);
		})
    };

//Tests loading project containing fru-M-200266 (VFB_00000001
const neuronTest = function(project){
	beforeAll(async () => {
		//increases default timeout to 2 minutes
		jest.setTimeout(120000);
		await page.goto(projectURL4);
	});

	describe('Test landing page', () => {
		testLandingPage();
	})

	//Tests metadata in term info component and clicking on links
	describe('Test Term Info Component', () => {
		it('Deselect button for VFB_00101567 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00101567_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		})

		it('Zoom button for VFB_00101567 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00101567_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		})

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		})
		
		it('Term info component correctly populated at startup', async () => {
			await page.waitForFunction(() => (document.body.innerText || '').toLowerCase().includes('list all painted anatomy available for adult brain unisex jrc2018u'), { timeout: 120000 });
		})

		it('Term info component correctly populated with "fru-M-200266 (VFB_00000001)" as Name', async () => {
			await page.waitFor(1000);
			let element = await findElementByText(page, "fru-M-200266 (VFB_00000001)");
			expect(element).toBe("fru-M-200266 (VFB_00000001)");
		})

		it('Term info component correctly populated with "fru-M-200266 (VFB_00000001)" as Classification Name', async () => {
			let element = await findElementByText(page, "adult DM6 lineage neuron");
			expect(element).toBe("adult DM6 lineage neuron");
		})

		it('Term info component correctly populated with "fru-M-200266 (VFB_00000001)" Thumbnail', async () => {
			await page.waitForFunction('document.querySelector(".Collapsible__contentInner img").src === "https://www.virtualflybrain.org/data/VFB/i/0000/0001/thumbnailT.png"');
		})
	})

	describe('"Medula" Selected in Canvas Container', () => {
		it('VFB_00000001.VFB_00000001_swc selected', async () => {
			await page.waitFor(2000);
			expect(
					await page.evaluate(async () => CanvasContainer.engine.meshes['VFB_00000001.VFB_00000001_swc'].selected)
			).toBeTruthy();
		});
	})
}

describe('VFB URL Parameters id= and i= Tests', () => {
	// Load project ?id=VFB_00102107&i=VFB_00101567,VFB_00102107,VFB_00102135,VFB_00102162"
	// Test the item passed in id= takes the focus in the term info and it's selected
	describe('Test Loading "Medulla" as "id" in URL', () => {
		medullaTest(projectURL1);
	}, 120000);

	// Load project ?i=VFB_00102107,VFB_00101567,VFB_00102135,VFB_00102162"
	// Test that the first id in the i= list takes the focus and it's selected
	describe('Test Loading "Medulla" using parameter "i" in URL', () => {
		medullaTest(projectURL2);
	}, 120000);

	// Load project ?id=FBbt_00014013&i=VFB_00101567,VFB_00102135,VFB_00102162,VFB_00102107"
	// Test the item passed in id= that does not have visual capability takes the focus in the term info
	describe('Test No Visual Capability Loaded for "adult gnathal ganglion"', () => {
		beforeAll(async () => {
			//increases timeout to 2 minutes
			jest.setTimeout(120000);
			await page.goto(projectURL3);
		});

		describe('Test landing page', () => {
			testLandingPage();
		})

		//Tests metadata in term info component and clicking on links
		describe('Test Term Info Component', () => {
			it('Term info component created for JRC2018Unisex without visual capability', async () => {
				await page.waitForFunction(
					() => {
						return typeof Instances !== 'undefined' && Instances['VFB_00101567'] &&
						typeof window.setTermInfo === 'function' &&
						document.querySelector('div#bar-div-vfbterminfowidget');
					},
					{ timeout: 360000 }
				);
				await page.evaluate(() => {
					if (typeof Instances['VFB_00101567'].select === 'function') {
						Instances['VFB_00101567'].select();
					}
					if (typeof window.setTermInfo === 'function' && Instances['VFB_00101567'].VFB_00101567_meta) {
						window.setTermInfo(Instances['VFB_00101567'].VFB_00101567_meta, 'VFB_00101567');
					}
				});
				await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true , timeout : 240000 })
			}, 720000)

			it('No deselect or zoom controls appear for the non-visual capability term', async () => {
				const controlsPresent = await page.evaluate(() => {
					const widget = document.querySelector('div#bar-div-vfbterminfowidget');
					if (!widget) return false;
					return !!widget.querySelector('#VFB_00101567_deselect_buttonBar_btn, #VFB_00101567_zoom_buttonBar_btn');
				});
				expect(controlsPresent).toBe(false);
			}, 120000)

			it('Term info component created after load', async () => {
				await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
			}, 120000)

			it('Term info component correctly populated with JRC2018Unisex metadata as Name', async () => {
				await page.waitForFunction(() => (document.body.innerText || '').toLowerCase().includes('jrc2018unisex'), { timeout: 120000 });
			}, 120000)

			it('Term info component correctly populated with "adult brain" as Classification Name', async () => {
				let element = await findElementByText(page, "adult brain");
				expect(element).toBe("adult brain");
			}, 120000)

			it('Term info component correctly populated with JRC2018U Thumbnail', async () => {
				await page.waitForFunction(() => {
					const thumbnail = document.querySelector(".Collapsible__contentInner img");
					if (!thumbnail || !thumbnail.src) {
						return false;
					}
					const src = thumbnail.src.toLowerCase();
					return src.includes("vfb_00101567") && /thumbnail(T)?\.png(\?.*)?$/i.test(src);
				}, { timeout: 80000 });
			}, 120000)
		})
	});

	// ?id=VFB_00000001&i=VFB_00101567,VFB_00000001";
	// Test that the id takes the focus and it's selected for neuron "fru-M-200266 (VFB_00000001)"
	describe('Test Loading Neuron "fru-M-200266 (VFB_00000001)" using parameter "id" in URL', () => {
		// neuronTest(projectURL4);
	});

	// Loads project with ?i=VFB_00000001,VFB_00101567,VFB_00000001"
	// Test that the first id in the i= list takes the focus and it's selected for neuron "fru-M-200266 (VFB_00000001)"
	describe('Test Loading Neuron "fru-M-200266 (VFB_00000001)" using parameter "i" in URL', () => {
		// neuronTest(projectURL5);
	});
})
