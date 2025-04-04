const { TimeoutError } = require('puppeteer/Errors');
import * as ST from './selectors';

export const wait4selector = async (page, selector, settings = {}) => {
  let success = undefined;
  let options = settings;
  if (!("timeout" in settings)) {
    options = { timeout: 30000, ...settings }; // Increase default timeout to 30 seconds
  }
  
  try {
    await page.waitForSelector(selector, options);
    success = true;
  } catch (error) {
    let behaviour = "to exist";
    if (options.visible || options.hidden) {
      behaviour = options.visible ? "to be visible" : "to disappear";
    }
    console.log(`ERROR: timeout waiting for selector   --->   ${selector}    ${behaviour}.`);
    
    // Take a screenshot to capture the failure state
    const safeSelector = selector.replace(/[^a-zA-Z0-9]/g, '_');
    const screenshotName = `error-wait4selector-${safeSelector}-${behaviour.replace(/\s+/g, '-')}`;
    const screenshotPath = await takeScreenshot(page, screenshotName);
    if (screenshotPath) {
      console.log(`Screenshot of failure state saved to: ${screenshotPath}`);
    }
    
    // Additional debugging info
    console.log(`Current page URL: ${page.url()}`);
    try {
      const html = await page.evaluate(() => document.body.innerHTML);
      console.log(`Page HTML snippet: ${html.substring(0, 500)}...`);
    } catch (e) {
      console.log(`Could not get page HTML: ${e}`);
    }
  }
  expect(success).toBeDefined();
}

/**
 * Tests certain components are present when the page first loads
 * @ID : The ID of the instance loaded, only works with instances with visual capabilities
 */
export const testLandingPage = async (page, ID) => {
	// Checks the loading spinner goes away
	await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout : 120000 })
	// Close tutorial window
	closeModalWindow(page);

	// Check page title
	const title = await page.title();
	expect(title).toMatch("Virtual Fly Brain");

	// Check that the Term Info has a button for deselecting instance, this means it's done loading
	await wait4selector(page, '#' + ID + '_deselect_buttonBar_btn', { visible: true , timeout : 120000 })
}

/**
 * Open component by clicking on tab.
 * @tabName : Name of the tab to select/click
 */
export const selectTab = async (page, tabName) => {
	await page.evaluate(async (tabName) => {
		let termContextTab = null;

		// Find the tab we want to click
		let tabs = document.getElementsByClassName('flexlayout__tab_button');
		for ( var i = 0 ; i < tabs.length; i++ ) {
			if ( tabs[i].innerText === tabName) {
				termContextTab = tabs[i];
			}
		}

		// If the tab was found, click on it
		if ( termContextTab !== null && termContextTab !== undefined ) {
			let clickEvent = new MouseEvent('mousedown', {
				view: window,
				bubbles: true,
				cancelable: true
			});
			termContextTab.dispatchEvent(clickEvent);

			clickEvent = new MouseEvent('mouseup', {
				view: window,
				bubbles: true,
				cancelable: true
			});
			termContextTab.dispatchEvent(clickEvent);
		}
		// If the tab was not found, click on the overflow button to display the rest of tabs and look for it there
		else {
			let unselectedTab = document.getElementsByClassName('flexlayout__tab_button_overflow')[0].click();
			let tabs = document.getElementsByClassName('flexlayout__popup_menu_item');
			for ( var i = 0; i < tabs.length ; i ++ ) {
				if ( tabs[i].innerText === tabName ) {
					tabs[i].click();
				}
			} 
		}
	}, tabName);
}

export const click = async (page, selector) => {
	await wait4selector(page, selector, { visible: true, timeout: 500000});
	let success = undefined;
	try {
		await page.evaluate((selector) => document.querySelector(selector).click(), selector);
		success = true
	} catch (error){
		console.log(`ERROR clicking on selector   --->   ${selector} failed.`)
	}
	expect(success).toBeDefined()
}

/**
 * Closes modal windows by pressing escape
 */
export const closeModalWindow = async (page) => {
	await page.evaluate(async () => {
		var evt = new KeyboardEvent('keydown', {'keyCode':27, 'which':27});
		document.dispatchEvent (evt);
	});
}

export const setTextFieldValue = async(selector, value) => {
  await page.evaluate( (selector, value) =>
    {
      var element = document.querySelector(selector);
      let lastValue = element.value;
      element.value = value;
      let event = new Event('input', { bubbles: true });
      event.simulated = true;
      let tracker = element._valueTracker;
      if (tracker) {
        tracker.setValue(lastValue);
      }
      element.dispatchEvent(event);
    }, selector, value)
}

export const flexWindowClick = async (title, selector) => {
	await page.evaluate((title, selector) => {
		if (document.getElementsByClassName("flexlayout__tab_button_content")  != undefined && document.getElementsByClassName("flexlayout__tab_button_content").length != undefined && document.getElementsByClassName("flexlayout__tab_button_content").length > 0) {
			if (document.getElementsByClassName("flexlayout__tab_button_content")[0].innerText == title) {
				document.getElementsByClassName(selector)[0].click();
			}else if (document.getElementsByClassName("flexlayout__tab_button_content").length > 1 && document.getElementsByClassName("flexlayout__tab_button_content")[1].innerText == title) {
				document.getElementsByClassName(selector)[1].click();
			}else if (document.getElementsByClassName("flexlayout__tab_button_content").length > 2 && document.getElementsByClassName("flexlayout__tab_button_content")[2].innerText == title) {
				document.getElementsByClassName(selector)[2].click();
			}else if (document.getElementsByClassName("flexlayout__tab_button_content").length > 3 && document.getElementsByClassName("flexlayout__tab_button_content")[3].innerText == title) {
				document.getElementsByClassName(selector)[3].click();
			}else if (document.getElementsByClassName("flexlayout__tab_button_content").length > 4 && document.getElementsByClassName("flexlayout__tab_button_content")[4].innerText == title) {
				document.getElementsByClassName(selector)[4].click();
			}else if (document.getElementsByClassName("flexlayout__tab_button_content").length > 5 && document.getElementsByClassName("flexlayout__tab_button_content")[5].innerText == title) {
				document.getElementsByClassName(selector)[5].click();
			}else if (document.getElementsByClassName("flexlayout__tab_button_content").length > 6 && document.getElementsByClassName("flexlayout__tab_button_content")[6].innerText == title) {
				document.getElementsByClassName(selector)[6].click();
			}else{
				console.log(`ERROR Finding FlexLayout Tab matching "${title}" to click "${selector}" `);
			}
		}
	}
	, title, selector);
}

/**
 * Find an element by using text as search pattern
 */
export const findElementByText = async (page, text) => page.evaluate(async (text ) => {
	let elems = Array.from(document.querySelectorAll('*'));
	let found = "";

	for (var i = 0; i < elems.length; i++) {
		if (elems[i] !== undefined ) {
			if (elems[i].innerText !== undefined ) {
				if (elems[i].innerText === text) {
					found = elems[i].innerText;
					break;
				}
			}
		}
	}

	return found;
}, text);

export const takeScreenshot = async (page, name) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `./test-screenshots/${name}-${timestamp}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`Screenshot saved to ${path}`);
    return path;
  } catch (error) {
    console.log(`Failed to take screenshot: ${error}`);
    return null;
  }
};
