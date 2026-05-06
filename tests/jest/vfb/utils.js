const { TimeoutError } = require('puppeteer/Errors');
const fs = require('fs');
const path = require('path');
import * as ST from './selectors';

export const wait4selector = async (page, selector, settings = {}) => {
  if (!selector) {
    throw new Error(`wait4selector called with invalid selector: ${selector}`);
  }

  let options = settings;
  if (!("timeout" in settings)) {
    options = { timeout: 30000, ...settings }; // Increase default timeout to 30 seconds
  }
  
  try {
    await page.waitForSelector(selector, options);
    return true;
  } catch (error) {
    let behaviour = "to exist";
    if (options.visible || options.hidden) {
      behaviour = options.visible ? "to be visible" : "to disappear";
    }

    const pageClosed = !page || (typeof page.isClosed === 'function' && page.isClosed());
    if (pageClosed) {
      throw new Error(`Timeout waiting for selector "${selector}" ${behaviour}.`);
    }

    console.log(`ERROR: timeout waiting for selector   --->   ${selector}    ${behaviour}.`);
    
    // Check if page is still accessible before attempting screenshots/debugging
    try {
      // Take a screenshot to capture the failure state
      const safeSelector = selector.replace(/[^a-zA-Z0-9]/g, '_');
      const screenshotName = `error-wait4selector-${safeSelector}-${behaviour.replace(/\s+/g, '-')}`;
      const screenshotPath = await takeScreenshot(page, screenshotName);
      if (screenshotPath) {
        console.log(`Screenshot of failure state saved to: ${screenshotPath}`);
      }
      
      // Additional debugging info
      console.log(`Current page URL: ${await page.url()}`);
      try {
        const html = await page.evaluate(() => document.body.innerHTML);
        console.log(`Page HTML snippet: ${html.substring(0, 500)}...`);
      } catch (e) {
        console.log(`Could not get page HTML: ${e}`);
      }
    } catch (debugError) {
      console.log(`Could not capture debug information (page may be closed): ${debugError.message}`);
    }
    throw new Error(`Timeout waiting for selector "${selector}" ${behaviour}.`);
  }
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
	try {
		await page.evaluate((selector) => document.querySelector(selector).click(), selector);
	} catch (error){
		console.log(`ERROR clicking on selector   --->   ${selector} failed.`);
    throw new Error(`Failed to click selector "${selector}".`);
	}
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
		const titles = Array.from(document.getElementsByClassName('flexlayout__tab_button_content'));
		const controls = Array.from(document.getElementsByClassName(selector));
		for (let index = 0; index < titles.length; index++) {
			const tabText = titles[index].innerText && titles[index].innerText.trim();
			if (tabText === title) {
				if (controls[index]) {
					controls[index].click();
					return;
				}
				const tabElement = titles[index].closest('.flexlayout__tab_button');
				if (tabElement) {
					const controlElement = tabElement.querySelector('.' + selector.split(' ').join('.'));
					if (controlElement) {
						controlElement.click();
						return;
					}
				}
			}
		}
		const tabElement = Array.from(document.getElementsByClassName('flexlayout__tab_button')).find(el => {
			const label = el.querySelector('.flexlayout__tab_button_content');
			return label && label.innerText && label.innerText.trim() === title;
		});
		if (tabElement) {
			const control = tabElement.querySelector('.' + selector.split(' ').join('.'));
			if (control) {
				control.click();
				return;
			}
		}
		console.log(`ERROR Finding FlexLayout Tab matching "${title}" to click "${selector}" `);
	}, title, selector);
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

export const clickElementByText = async (page, text, exact = false) => {
	const clicked = await page.evaluate((text, exact) => {
		const candidates = Array.from(document.querySelectorAll('*')).filter(el => {
			const t = (el.innerText || '').trim();
			if (!t) return false;
			return exact ? t === text : t.includes(text);
		});

		for (const el of candidates) {
			if (el.offsetParent === null) continue;
			const button = el.closest('button, [role="button"], a');
			if (button) {
				button.click();
				return true;
			}
			try {
				el.click();
				return true;
			} catch (e) {
				continue;
			}
		}
		return false;
	}, text, exact);
	if (!clicked) {
		throw new Error(`Could not find visible clickable element with text "${text}" to click.`);
	}
};

export const takeScreenshot = async (page, name) => {
  try {
    // Check if the page is still available
    if (!page || page.isClosed()) {
      console.log(`Cannot take screenshot: page is closed`);
      return null;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // Change to use the same base snapshots directory, but in a failures subfolder
    const screenshotPath = `./tests/jest/vfb/snapshots/failures/${name}-${timestamp}.png`;
    
    // Ensure the directory exists from Node context (not browser page context).
    await fs.promises.mkdir(path.dirname(screenshotPath), { recursive: true });
    
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);
    return screenshotPath;
  } catch (error) {
    console.log(`Failed to take screenshot: ${error}`);
    return null;
  }
};
