const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getCommandLineArg, getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, closeModalWindow, findElementByText } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?i=VFB_00017894";

const clickQueryResult = async (page, text) => {
  await page.evaluate(async (text) => {
    let elems = Array.from(document.querySelectorAll('.query-results-name-column'));
    
    for (var i = 0; i < elems.length; i++) {
      if (elems[i]?.innerText === text) {
        elems[i].getElementsByTagName("a")[0].click();
        return true; // Indicate we found and clicked the element
      }
    }
    return false; // Indicate we didn't find the element
  }, text);
  
  // Add a wait to ensure navigation completes
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {
    // Sometimes navigation doesn't trigger, which is fine
    console.log('Navigation completed or timeout reached');
  });
}

/**
 * Tests Menu Components
 */
describe('VFB Menu Component Tests', () => {
  beforeAll(async () => {
    //increases timeout to ~8 minutes
		jest.setTimeout(500000);
    await page.goto(projectURL);

  });

  // Tests components in landing page are present
  describe('Test Landing Page', () => {
    it('Loading spinner goes away', async () => {
      await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
    })

    it('VFB Title shows up', async () => {
      const title = await page.title();
      expect(title).toMatch("Virtual Fly Brain");
      // Close tutorial window
      closeModalWindow(page);
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

  // Tests Menu Components for Help Work
  describe('Test Menu Components About and Help', () => {
    it('Open Virtual Fly Brain Menu', async () => {
      await page.evaluate(async () => document.getElementById("Virtual Fly Brain").click());
      // Wait for the Drop Down Menu Option to show for 'Virtual Fly Brain'
      await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 })
      const dropDownMenuItems = await page.evaluate(async () => document.getElementsByClassName("MuiListItem-root").length);
      // Test there's 4 elements as part of the drop down menu for 'Virtual Fly Brain'
      expect(dropDownMenuItems).toEqual(4);
    })

    it('Close the Virtual Fly Brain Menu', async () => {
      // close the menu
      await page.evaluate(async () => document.getElementById("Virtual Fly Brain").click());
      await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 })
    })

    it('Help Menu Appears', async () => {
      await page.evaluate(async () => document.getElementById("Help").click());
      // Wait for drop down menu of 'Help' to show
      await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 })
      // Check there's four elements in the drop down menu of 'Help'
      const dropDownMenuItems = await page.evaluate(async () => document.getElementsByClassName("MuiListItem-root").length);
      expect(dropDownMenuItems).toEqual(6);
    })

    it('Help Modal Support Forum Tab Opened', async () => {
      // Checks a new page was opened as a result of clicking on the F.A.Q. menu option
      let pagesOpened = await browser.pages();
      await page.evaluate(async () => document.getElementById("Support Forum").click());
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
      await wait4selector(page, '#Xu2020NeuronsV1point2point1----VFBlicense_CC_BY_4_0----doi_10_1101_2020_01_21_911859-image-container', { visible: true , timeout : 500000 });
    })

    it('Term info correctly populated with dataset after query results clicked', async () => {
      await await clickQueryResult(page, "JRC_FlyEM_Hemibrain neurons Version 1.2.1")
      await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true })
      await page.waitFor(3000);
      await wait4selector(page, '#slider_image_0', { visible: true , timeout : 500000 });
      let element = await findElementByText(page, "JRC_FlyEM_Hemibrain neurons Version 1.2.1");
      expect(element).toBe("JRC_FlyEM_Hemibrain neurons Version 1.2.1");
    })
  })


})
