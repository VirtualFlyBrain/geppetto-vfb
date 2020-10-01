const { TimeoutError } = require('puppeteer/Errors');


export const wait4selector = async (page, selector, settings = {}) => {
  let success = undefined;
  let options = settings;
  if (!("timeout" in settings)) {
    options = { timeout: 5000, ...settings };
  }
  try {
    await page.waitForSelector(selector, options);
    success = true
  } catch (error){
    let behaviour = "to exists."
    if (options.visible || options.hidden) {
      behaviour = options.visible ? "to be visible." : "to disappear."
    }
    console.log(`ERROR: timeout waiting for selector   --->   ${selector}    ${behaviour}`)
  }
  expect(success).toBeDefined()
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

export const closeModalWindow = async (page) => {
	await page.evaluate(async () => {
		var evt = new KeyboardEvent('keydown', {'keyCode':27, 'which':27});
		document.dispatchEvent (evt);
	});
}

export const flexWindowClick = async (title, selector) => {
  await page.evaluate((title, selector) => {
    var i = -1;
    if (document.getElementsByClassName(selector)  != undefined && document.getElementsByClassName(selector).length != undefined && document.getElementsByClassName(selector).length > 0) {
      if (document.getElementsByClassName(selector)[0].innerText == title) {
        i = 0;
      }else if (document.getElementsByClassName(selector).length > 1 && document.getElementsByClassName(selector)[1].innerText == title) {
        i = 1;
      }else if (document.getElementsByClassName(selector).length > 2 && document.getElementsByClassName(selector)[2].innerText == title) {
        i = 2;
      }else if (document.getElementsByClassName(selector).length > 3 && document.getElementsByClassName(selector)[3].innerText == title) {
        i = 3;
      }else if (document.getElementsByClassName(selector).length > 4 && document.getElementsByClassName(selector)[4].innerText == title) {
        i = 4;
      }else if (document.getElementsByClassName(selector).length > 5 && document.getElementsByClassName(selector)[5].innerText == title) {
        i = 5;
      }else if (document.getElementsByClassName(selector).length > 6 && document.getElementsByClassName(selector)[6].innerText == title) {
        i = 6;
      }else{
        console.log(`ERROR Finding FlexLayout Tab matching "${title}" to click "${selector}" `);
      }
      if (i > -1) {
        let unselectedTab = document.getElementsByClassName('flexlayout__tab_button--unselected')[i];
        let clickEvent = new MouseEvent('mousedown', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        unselectedTab.dispatchEvent(clickEvent);

        clickEvent = new MouseEvent('mouseup', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        unselectedTab.dispatchEvent(clickEvent);
      }
    }
  }
  , title, selector);
}

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