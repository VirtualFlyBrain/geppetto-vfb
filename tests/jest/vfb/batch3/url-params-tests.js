const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL1 = baseURL + "/geppetto?id=VFB_00030624&i=VFB_00017894,VFB_00030624,VFB_00030611,VFB_00030623";
const projectURL2 = baseURL + "/geppetto?i=VFB_00030624,VFB_00017894,VFB_00030611,VFB_00030623";
const projectURL3 = baseURL + "/geppetto?id=FBbt_00014013&i=VFB_00030611,VFB_00030623,VFB_00030624";
const projectURL4 = baseURL + "/geppetto?id=VFB_00000001&i=VFB_00017894,VFB_00000001";
const projectURL5 = baseURL + "/geppetto?i=VFB_00000001,VFB_00017894,VFB_00000001";

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
		it('Deselect button for VFB_00030624 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00030624_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		}, 120000)

		it('Zoom button for VFB_00030624 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00030624_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		}, 120000)

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		}, 120000)

		it('Term info component correctly populated with "Medulla" as Name', async () => {
			let element = await findElementByText(page, "medulla");
			expect(element).toBe("medulla");
		}, 120000)

		it('Term info component correctly populated with "Medula" as Classification Name', async () => {
			let element = await findElementByText(page, "medulla");
			expect(element).toBe("medulla");
		}, 120000)

		it('Term info component correctly populated with "Medula" Thumbnail', async () => {
			await page.waitForFunction('document.querySelector(".Collapsible__contentInner img").src === "https://www.virtualflybrain.org/data/VFB/i/0003/0624/VFB_00017894/thumbnail.png"', {visible : true, timeout : 80000});
		}, 120000)
	})

	describe('"Medula" Selected in Canvas Container', () => {
		it('VFB_00030624.VFB_00030624_obj selected', async () => {
			await page.waitFor(2000);
			expect(
					await page.evaluate(async () => CanvasContainer.engine.meshes['VFB_00030624.VFB_00030624_obj'].selected)
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
		it('Deselect button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00017894_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		})

		it('Zoom button for VFB_00017894 appears in button bar inside the term info component', async () => {
			await wait4selector(page, 'button[id=VFB_00017894_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
		})

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
		})
		
		it('Term info component correctly populated at startup', async () => {
			await page.waitFor(1000);
			let element = await findElementByText(page, "List all painted anatomy available for adult brain template JFRC2");
			expect(element).toBe("List all painted anatomy available for adult brain template JFRC2");
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
	// Load project ?id=VFB_00030624&i=VFB_00017894,VFB_00030624,VFB_00030611,VFB_00030623"
	// Test the item passed in id= takes the focus in the term info and it's selected
	describe('Test Loading "Medulla" as "id" in URL', () => {
		medullaTest(projectURL1);
	}, 120000);

	// Load project ?i=VFB_00030624,VFB_00017894,VFB_00030611,VFB_00030623"
	// Test that the first id in the i= list takes the focus and it's selected
	describe('Test Loading "Medulla" using parameter "i" in URL', () => {
		medullaTest(projectURL2);
	}, 120000);

	// Load project ?id=FBbt_00014013&i=VFB_00017894,VFB_00030611,VFB_00030623,VFB_00030624"
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
			it('Deselect button for VFB_00017894 appears in button bar inside the term info component', async () => {
				await wait4selector(page, '#VFB_00017894_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
			}, 120000)

			it('Zoom button for VFB_00017894 appears in button bar inside the term info component', async () => {
				await wait4selector(page, 'button[id=VFB_00017894_zoom_buttonBar_btn]', { visible: true , timeout : 120000 })
			}, 120000)

			
			it('Term info component created after load', async () => {
				await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
			}, 120000)

			it('Term info component correctly populated with "adult brain template JFRC2 (VFB_00017894)" as Name', async () => {
				await page.waitFor(1000);
				let element = await findElementByText(page, "adult brain template JFRC2");
				expect(element).toBe("adult brain template JFRC2");
			}, 120000)

			it('Term info component correctly populated with "adult brain" as Classification Name', async () => {
				let element = await findElementByText(page, "adult brain");
				expect(element).toBe("adult brain");
			}, 120000)

			it('Term info component correctly populated with "adult gnathal ganglion" Thumbnail', async () => {
				await page.waitForFunction('document.querySelector(".Collapsible__contentInner img").src === "https://www.virtualflybrain.org/data/VFB/i/0001/7894/VFB_00017894/thumbnailT.png"');
			}, 120000)
		})
	});

	// ?id=VFB_00000001&i=VFB_00017894,VFB_00000001";
	// Test that the id takes the focus and it's selected for neuron "fru-M-200266 (VFB_00000001)"
	describe('Test Loading Neuron "fru-M-200266 (VFB_00000001)" using parameter "id" in URL', () => {
		// neuronTest(projectURL4);
	});

	// Loads project with ?i=VFB_00000001,VFB_00017894,VFB_00000001"
	// Test that the first id in the i= list takes the focus and it's selected for neuron "fru-M-200266 (VFB_00000001)"
	describe('Test Loading Neuron "fru-M-200266 (VFB_00000001)" using parameter "i" in URL', () => {
		// neuronTest(projectURL5);
	});
})
