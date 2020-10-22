const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { getUrlFromProjectId } from '../cmdline.js';
import { wait4selector, click, testLandingPage, findElementByText, selectTab} from '../utils';
import * as ST from '../selectors';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';
const PROJECT_URL = baseURL + "/geppetto?id=VFB_jrchk4wj&i=VFB_00101567";

const openControls = async (page, text) => {
	await page.evaluate(async (text) => {
		let elems = Array.from(document.querySelectorAll('.vfbListViewer .griddle-row'));
		for (var i = 0; i < elems.length; i++) {
			if (elems[i].innerText.includes(text)) {
				elems[1].querySelector(".fa-eye").click()
				break;
			}
		}
	}, text);
	await wait4selector(page, '#simple-popper', { visible: true, timeout : 5000 });
}

const clickLayerControlsElement = async (page, text) => page.evaluate(async (text ) => {
    let controls = document.getElementsByClassName('menu-item-label');
    for ( var i = 0; i < controls.length ; i ++ ) {
      if ( controls[i].innerText === text ) {
        controls[i].click();
      }
    }
}, text);

/**
 * Tests control panel works in VFB
 */
describe('VFB Layer Component Tests', () => {
  beforeAll(async () => {
    jest.setTimeout(120000); 
    await page.on('dialog', async dialog => {
		await dialog.accept("OK");
	});
    await page.goto(PROJECT_URL);
  });

  //Tests components in landing page are present
  it('Test Landing Page', async () => {
    await testLandingPage(page, 'VFB_jrchk4wj');
  })

  // Tests opening control panel and clicking on row buttons
  describe('Test Layers Component', () => {
    it('Open Tabs Overflow Menu', async () => {
      await page.evaluate(async () => {
        document.getElementsByClassName('flexlayout__tab_button_overflow')[0].click();
      });

      // Check that the Tree Browser is visible
      await wait4selector(page, 'div.flexlayout__popup_menu_container', { visible: true, timeout : 5000 });
    })
    
    it('Open Layers Component', async () => {
      await selectTab(page, "Layers");

      // Check that the Layers component is visible
      await wait4selector(page, 'div.listviewer-container', { visible: true, timeout : 800000 });
    })

    // Tests control panel opens up and that is populated with expected 2 rows
    it('The control panel opened with right amount of rows.', async () => {
      const rows = await page.evaluate(async selector => $(selector).length, ST.STANDARD_ROW_SELECTOR);
      expect(rows).toEqual(2);
    })
  });
  
  // Tests opening control panel and clicking on row buttons
  describe('Test Layers Component Controls', () => {
    it('Open Controls Menu', async () => {
      await page.waitFor(3000);
      await openControls(page, "PVLP142_R - 5812987602");
    })
    
    it('Instance VFB_jrchk4wj Selected', async () => {
      const color = await page.evaluate(async () => {
        return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].material.color.getHexString()
      });
      expect(color).toEqual("ffcc00");
    })

    it('Unselect VFB_jrchk4wj Instance', async () => {
      await clickLayerControlsElement(page, 'Unselect');
      await page.waitFor(2000);
      const color = await page.evaluate(async () => {
        return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].material.color.getHexString()
      });
      expect(color).toEqual("00ff00");
    })
    
    it('Hide VFB_jrchk4wj Instance', async () => {
      await openControls(page, "PVLP142_R - 5812987602");
      await clickLayerControlsElement(page, 'Hide');
      await page.waitFor(2000);
      const visible = await page.evaluate(async () => {
       return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].visible
      });
      expect(visible).toEqual(false);
    })
    
    it('Show VFB_jrchk4wj Instance', async () => {
      await openControls(page, "PVLP142_R - 5812987602");
      await clickLayerControlsElement(page, 'Show');
      await page.waitFor(2000);
      const visible = await page.evaluate(async () => {
        return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].visible
      });
      expect(visible).toEqual(true);
    })
    
    it('Zoom To VFB_jrchk4wj Instance', async () => {
      await openControls(page, "PVLP142_R - 5812987602");
      await clickLayerControlsElement(page, 'Zoom To');
      await page.waitFor(2000);
      const zoomTo = await page.evaluate(async () => {
        var position = CanvasContainer.engine.camera.position;
        return [position.x, position.y, position.z]
      });
      expect(zoomTo).toEqual([291.508, 142.322, -85.403]);
    })
    
    it('Disable Skeleton For VFB_jrchk4wj Instance', async () => {
      await openControls(page, "PVLP142_R - 5812987602");
      await clickLayerControlsElement(page, 'Disable 3D Skeleton');
      await page.waitFor(2000);
      const disableVolume = await page.evaluate(async () => {
        return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].visible
      });
      expect(disableVolume).toEqual(false);
    })
    
    it('Enable Skeleton For VFB_jrchk4wj Instance', async () => {
      await openControls(page, "PVLP142_R - 5812987602");
      await clickLayerControlsElement(page, 'Enable 3D Skeleton');
      await page.waitFor(2000);
      const enableVolume = await page.evaluate(async () => {
        return CanvasContainer.engine.meshes["VFB_jrchk4wj.VFB_jrchk4wj_swc"].visible
      });
      expect(enableVolume).toEqual(true);
    })
    
    it('Show Info For VFB_jrchk4wj Instance', async () => {
      await openControls(page, "PVLP142_R - 5812987602");
      await clickLayerControlsElement(page, 'Show Info');
      await page.waitFor(2000);
      await wait4selector(page, 'div#vfbterminfowidget', { visible: true, timeout : 500000});
      await wait4selector(page, '#VFB_jrchk4wj_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
    })
  })
})
