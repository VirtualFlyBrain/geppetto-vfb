const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from './cmdline.js';
import { wait4selector, click, closeModalWindow } from './utils';
import * as ST from './selectors';

const baseURL = process.env.url ||  'http://localhost:8080/org.geppetto.frontend';
const projectURL1 = baseURL + "/geppetto?id=VFB_00030624&i=VFB_00017894,VFB_00030624,VFB_00030611,VFB_00030623";
const projectURL2 = baseURL + "/geppetto?i=VFB_00030624,VFB_00017894,VFB_00030611,VFB_00030623";
const projectURL3 = baseURL + "/geppetto?id=FBbt_00014013&i=VFB_00017894,VFB_00030611,VFB_00030623,VFB_00030624";
const projectURL4 = baseURL + "/geppetto?id=VFB_00000001&i=VFB_00017894,VFB_00000001";
const projectURL5 = baseURL + "/geppetto?i=VFB_00000001,VFB_00017894,VFB_00000001";

//Initial components in landin page, tests spinner is gone and title are present
const testLandingPage = function(){
	it('Loading spinner goes away', async () => {
		await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
	})

	it('VFB Title shows up', async () => {
		const title = await page.title();
		expect(title).toBe("Virtual Fly Brain");
	})
};

//Tests loading project containing 'Medulla'
const medullaTest = function(project) {
	beforeAll(async () => {
		//increases timeout to 2 minutes
		jest.setTimeout(120000);
		await page.goto(project);
	});

	describe('Test landing page', () => {
		testLandingPage();
	})

	describe('Test Term Info Component Contains Metadata for Medulla', () => {
		//Tests deselect button for VFB_00017894 is present in term info component, means is selected
		it('Deselect button for VFB_00030624 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00030624_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		})

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#VFBTermInfo_el_1_component', { visible: true})
		})
		
		it('Hide Quick Help Modal Window', async () => {
			closeModalWindow(page);
			await wait4selector(page, 'div#quick_help_modal', { hidden : true })
		})

		it('Term info component correctly populated with "Medula" as Name', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("medulla on adult brain template JFRC2")');
		})

		it('Term info component correctly populated with "Medula" as Classification Name', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_3_component").innerText.startsWith("medulla")');
		})

		it('Term info component correctly populated with "Medula" Thumbnail', async () => {
			await page.waitForFunction('document.querySelector(".Collapsible__contentInner img").src === "https://www.virtualflybrain.org/data/VFB/i/0003/0624/thumbnailT.png"');
		})
	})

	describe('"Medula" Selected in Canvas Container', () => {
		it('VFB_00030624.VFB_00030624_obj selected', async () => {
			await page.waitFor(2000);
			expect(
					await page.evaluate(async () => CanvasContainer.engine.meshes['VFB_00030624.VFB_00030624_obj'].selected)
			).toBeTruthy();
		});
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
		//Tests deselect button for VFB_00017894 is present in term info component, means is selected
		it('Deselect button for VFB_00000001 appears in button bar inside the term info component', async () => {
			await wait4selector(page, '#VFB_00000001_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
		})

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#VFBTermInfo_el_0_component', { visible: true})
		})

		it('Term info component correctly populated with "fru-M-200266 (VFB_00000001)" as Name', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("fru-M-200266 (VFB_00000001)")');
		})

		it('Term info component correctly populated with "fru-M-200266 (VFB_00000001)" as Classification Name', async () => {
			await page.waitForFunction('document.getElementById("VFBTermInfo_el_4_component").innerText.startsWith("adult DM6 lineage neuron")');
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
	});

	// Load project ?i=VFB_00030624,VFB_00017894,VFB_00030611,VFB_00030623"
	// Test that the first id in the i= list takes the focus and it's selected
	describe('Test Loading "Medulla" using parameter "i" in URL', () => {
		medullaTest(projectURL2);
	});

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
			it('Term info component created after load', async () => {
				await wait4selector(page, 'div#VFBTermInfo_el_0_component', { visible: true , timeout : 120000 })
			})

			it('Term info component correctly populated with "adult gnathal ganglion" as Name', async () => {
				await page.waitForFunction('document.getElementById("VFBTermInfo_el_0_component").innerText.startsWith("adult gnathal ganglion (FBbt_00014013)")');
			})

			it('Term info component correctly populated with "adult gnathal ganglion" as Classification Name', async () => {
				await page.waitForFunction('document.getElementById("VFBTermInfo_el_3_component").innerText.startsWith("subesophageal ganglion")');
			})

			it('Term info component correctly populated with "adult gnathal ganglion" Thumbnail', async () => {
				await page.waitForFunction('document.querySelector(".Collapsible__contentInner img").src === "https://www.virtualflybrain.org/data/VFB/i/0003/0840/thumbnailT.png"');
			})
		})
	});

	// ?id=VFB_00000001&i=VFB_00017894,VFB_00000001";
	// Test that the id takes the focus and it's selected for neuron "fru-M-200266 (VFB_00000001)"
	describe('Test Loading Neuron "fru-M-200266 (VFB_00000001)" using parameter "id" in URL', () => {
		neuronTest(projectURL4);
	});

	// Loads project with ?i=VFB_00000001,VFB_00017894,VFB_00000001"
	// Test that the first id in the i= list takes the focus and it's selected for neuron "fru-M-200266 (VFB_00000001)"
	describe('Test Loading Neuron "fru-M-200266 (VFB_00000001)" using parameter "i" in URL', () => {
		neuronTest(projectURL5);
	});
})