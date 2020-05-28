const { TimeoutError } = require('puppeteer/Errors');


export const wait4selector = async (page, selector, settings = {}) => {
  let success = undefined;
  const options = { timeout: 1000, ...settings }
  try {
    await page.waitForSelector(selector, options);
    success = true
  } catch (error){
    let behaviour = "to exists."
    if (options.visible || options.hidden) {
      behaviour = options.visible ? "to be visible." : "to disappear."
    }
    // console.log(`ERROR: timeout waiting for selector   --->   ${selector}    ${behaviour}`)
  }
  expect(success).toBeDefined()
}


export const click = async (page, selector) => {
  await wait4selector(page, selector, { visible: true, timeout: 100000});
  let success = undefined;
  try {
    await page.evaluate((selector) => document.querySelector(selector).click(), selector);
    success = true
  } catch (error){
    // console.log(`ERROR clicking on selector   --->   ${selector} failed.`)
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
  var i;
  for (i = 0; i < document.getElementsByClassName("flexlayout__tab_button_content").length; i++) {
    if (document.getElementsByClassName("flexlayout__tab_button_content")[i].innerText == title) {
      document.getElementsByClassName(selector)[i].click();
      break;
    }
  }
}