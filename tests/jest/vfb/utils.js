const { TimeoutError } = require('puppeteer/Errors');


export const wait4selector = async (page, selector, settings = {}) => {
  let success = undefined;
  const options = { timeout: 5000, ...settings }
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
  await wait4selector(page, selector, { visible: true, timeout: 5000});
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