const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?i=VFB_00017894";

const clickQueryResult = async (page, text) => page.evaluate(async (text ) => {
	let elems = Array.from(document.querySelectorAll('.query-results-name-column'));
	let found = "";

	for (var i = 0; i < elems.length; i++) {
		if (elems[i] !== undefined ) {
			if (elems[i].innerText!== undefined ) {
				if (elems[i].innerText === text) {
					elems[i].getElementsByTagName("a")[0].click();
					break;
				}
			}
		}
	}
}, text);

/**
 * Tests Menu Components
 */
describe('VFB Menu Component Tests', () => {
  beforeAll(async () => {
    jest.setTimeout(120000); 
    await page.goto(projectURL);

  });

  // Tests components in landing page are present
  describe('Test Landing Page', () => {
    it('Loading spinner goes away', async () => {
      await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
      // Close tutorial window
      closeModalWindow(page);
    })

    it('VFB Title shows up', async () => {
      const title = await page.title();
      expect(title).toBe("Virtual Fly Brain");
    })

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
      await page.waitFor(3000);
      let element = await findElementByText(page, "List all painted anatomy available for adult brain template JFRC2");
      expect(element).toBe("List all painted anatomy available for adult brain template JFRC2");
    })
  })

  // Tests Menu Components for About and Help Work
  describe('Test Menu Components About and Help', () => {
    it('Open Virtual Fly Brain Menu', async () => {
      await page.evaluate(async () => document.getElementById("Virtual Fly Brain").click());
      // Wait for the Drop Down Menu Option to show for 'Virtual Fly Brain'
      await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 })
      const dropDownMenuItems = await page.evaluate(async () => document.getElementsByClassName("MuiListItem-root").length);
      // Test there's 4 elements as part of the drop down menu for 'Virtual Fly Brain'
      expect(dropDownMenuItems).toEqual(4);
    })

    // Tests modal title bar is populated with expected title for About modal
    it('About Modal Title Correct', async () => {
      await page.evaluate(async () => document.getElementById("About").click());
      await page.waitForFunction('document.getElementById("vfb-content-titlebar").innerText.startsWith("About Virtual Fly Brain")');
    })

    it('About Modal Title Correct', async () => {
      // Check for the first line of the About modal to be present
      await page.waitForFunction('document.getElementById("vfb-content-text").innerText.startsWith("Who we are")');
    })

    it('About Modal Contains Contents', async () => {
      // Here we check the contents inside a DIV to match the expected text
      await page.waitForFunction('document.getElementsByClassName("vfb-content-container")[0].innerText.startsWith("3D Viewer, online tools, server and the website:")');
    })

    it('About Modal Closed', async () => {
      // Click on the X on the right corner to close the modal
      await page.evaluate(async () => document.getElementsByClassName("close-slider")[0].click());
      await wait4selector(page, '#vfb-content-block', { hidden: true, timeout : 5000 });
    })

    it('Help Menu Appears', async () => {
      await page.evaluate(async () => document.getElementById("Help").click());
      // Wait for drop down menu of 'Help' to show 
      await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 })
      // Check there's four elements in the drop down menu of 'Help'
      const dropDownMenuItems = await page.evaluate(async () => document.getElementsByClassName("MuiListItem-root").length);
      expect(dropDownMenuItems).toEqual(4);
    })

    it('Help Modal FAQ Tab Opened', async () => {
      // Checks a new page was opened as a result of clicking on the F.A.Q. menu option
      let pagesOpened = await browser.pages();
      await page.evaluate(async () => document.getElementById("F.A.Q.").click());
      await page.waitFor(2000); // wait for a while
      // New amount of opened pages should be one more than 'pagesOpened'
      let newPagesOpened = await browser.pages();
      expect(newPagesOpened.length).toEqual(pagesOpened.length + 1);
    })
  })

  // Tests Menu Components for Dataset Queries
  describe('Test Menu Dataset Queries', () => {
    it('Open Datasets Menu', async () => {
      await page.evaluate(async () => document.getElementById("Datasets").click());
      // Wait for the Drop Down Menu Option to show for 'Datasets'
      await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 })
      const dropDownMenuItems = await page.evaluate(async () => document.getElementsByClassName("MuiListItem-root").length);
      // Test there's 4 elements as part of the drop down menu for 'Datasets'
      expect(dropDownMenuItems).toEqual(3);
    })

    it('All Available Datasets Opens', async () => {
      await page.evaluate(async () => document.getElementById("All Available Datasets").click());
      // Wait for results to appear, this means datasets were returned
      await wait4selector(page, '#querybuilder', { visible: true , timeout : 500000 });
      await wait4selector(page, '#VFB_00028208-checkbox', { visible: true , timeout : 500000 });
    })

    it('Term info correctly populated with dataset after query results clicked', async () => {
      await await clickQueryResult(page, "Dickson lab VT line collection - VDRC images")
      await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
      await page.waitFor(3000);
      await wait4selector(page, '#slider_image_0', { visible: true , timeout : 500000 });
      let element = await findElementByText(page, "Dickson lab VT line collection - VDRC images");
      expect(element).toBe("Dickson lab VT line collection - VDRC images");
    })
  })


})
