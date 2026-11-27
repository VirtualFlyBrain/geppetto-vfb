import { wait4selector, closeModalWindow } from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';
const projectURL = baseURL + "/geppetto?i=VFB_00017894";

// Windows parked in the bottom bar each show as one of these buttons.
const PARKED = ".flexlayout__border_button";

const parkedCount = async page => page.evaluate(selector => document.querySelectorAll(selector).length, PARKED);

// How many windows Term Info only parked: every window but Term Info, however many the default layout has.
let parkedByTermInfoOnly = 0;
// How many windows V2 default parks: none on a build without windows newer than the original layout.
let parkedByV2Default = 0;

const openViewMenu = async page => {
  await page.evaluate(async () => document.getElementById("View").click());
  await wait4selector(page, "ul.MuiList-root", { visible: true, timeout : 120000 });
};

const chooseView = async (page, label) => {
  await openViewMenu(page);
  await page.evaluate(async item => document.getElementById(item).click(), label);
  // The menu fades out before it unmounts; wait until its items are gone.
  await page.waitForFunction(() => document.getElementsByClassName("MuiListItem-root").length === 0, { timeout : 120000 });
};

/**
 * Tests the View menu: switching between layouts, the ?view= URL parameter
 * and the saved "My view".
 */
describe('VFB View Menu Tests', () => {
  beforeAll(async () => {
    jest.setTimeout(900000);
    await page.goto(projectURL);
  });

  it('Page loads in the V2 default view', async () => {
    await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 });
    closeModalWindow(page);
    await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true, timeout : 120000 });
    // V2 default parks only the windows the original layout did not have (such as Neuroglass).
    parkedByV2Default = await parkedCount(page);
    expect(await page.evaluate(() => new URLSearchParams(window.location.search).get("view"))).toBeNull();
  }, 240000);

  it('View menu lists the views', async () => {
    await openViewMenu(page);
    const labels = await page.evaluate(async () => Array.from(document.getElementsByClassName("menu-item-label")).map(e => e.innerText));
    ["V2 default", "Term Info only", "Viewers", "Circuit", "Save current as My view"].forEach(label => expect(labels).toContain(label));
    // Nothing is saved yet, so there is no My view to open.
    expect(labels).not.toContain("My view");
    await page.evaluate(async () => document.getElementById("View").click());
    await page.waitForFunction(() => document.getElementsByClassName("MuiListItem-root").length === 0, { timeout : 120000 });
  });

  it('Term Info only parks the other windows and names the view in the URL', async () => {
    await chooseView(page, "Term Info only");
    await page.waitForFunction(selector => document.querySelectorAll(selector).length >= 6, { timeout : 120000 }, PARKED);
    parkedByTermInfoOnly = await parkedCount(page);
    await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true, timeout : 120000 });
    expect(await page.evaluate(() => new URLSearchParams(window.location.search).get("view"))).toEqual("term");
  });

  it('Saving the current arrangement adds My view', async () => {
    await chooseView(page, "Save current as My view");
    await openViewMenu(page);
    const labels = await page.evaluate(async () => Array.from(document.getElementsByClassName("menu-item-label")).map(e => e.innerText));
    expect(labels).toContain("My view");
    await page.evaluate(async () => document.getElementById("View").click());
    await page.waitForFunction(() => document.getElementsByClassName("MuiListItem-root").length === 0, { timeout : 120000 });
  });

  it('V3 default brings every window back and names the view in the URL', async () => {
    await chooseView(page, "V3 default");
    await page.waitForFunction(selector => document.querySelectorAll(selector).length === 0, { timeout : 120000 }, PARKED);
    expect(await page.evaluate(() => new URLSearchParams(window.location.search).get("view"))).toEqual("v3");
  });

  it('V2 default goes back to the start view and clears the URL parameter', async () => {
    await chooseView(page, "V2 default");
    await page.waitForFunction((selector, count) => document.querySelectorAll(selector).length === count, { timeout : 120000 }, PARKED, parkedByV2Default);
    expect(await page.evaluate(() => new URLSearchParams(window.location.search).get("view"))).toBeNull();
  });

  it('My view restores the saved arrangement', async () => {
    await chooseView(page, "My view");
    await page.waitForFunction((selector, count) => document.querySelectorAll(selector).length === count, { timeout : 120000 }, PARKED, parkedByTermInfoOnly);
    // Leave the browser as the other test files expect to find it.
    await chooseView(page, "V2 default");
    await page.evaluate(() => window.localStorage.removeItem("vfb_view_saved"));
  });
});
