var urlBase = casper.cli.get('host');
if (urlBase == null || urlBase == undefined) {
    urlBase = "http://127.0.0.1:8080/";
}

var DASHBOARD_URL = urlBase + "org.geppetto.frontend/";
var PROJECT_URL = urlBase + "org.geppetto.frontend/geppetto?i=VFB_00017894";

casper.test.begin('VFB Spotlight tests', function suite(test) {
    casper.options.viewportSize = {
        width: 1340,
        height: 768
    };

    // add for debug info
    // casper.options.verbose = true;
    // casper.options.logLevel = "debug";

    // show unhandled js errors
    casper.on("page.error", function (msg, trace) {
        this.echo("Error: " + msg, "ERROR");
    });

    // show page level errors
    casper.on('resource.received', function (resource) {
        var status = resource.status;
        if (status >= 400) {
            this.echo('URL: ' + resource.url + ' Status: ' + resource.status);
        }
    });

    // open dashboard
    casper.start(DASHBOARD_URL, function () {
        this.waitForSelector('div#logo', function () {
            this.echo("I waited for the logo to load.");
            test.assertTitle("geppetto's home", "geppetto's homepage title is the one expected");
            test.assertExists('div#logo', "logo is found");
        }, null, 10000);
    });

    // open project, check for items in term info popup
    casper.thenOpen(PROJECT_URL, function () {
        this.echo("Loading project at URL: " + PROJECT_URL);
    	this.waitForSelector('#VFB_00017894_select_ctrlPanel_btn', function () {
            this.echo("I waited for the logo to load.");
            test.assertTitle("VirtualFlyBrain", "VFB's homepage title is the one expected");
            test.assertExists('#geppettologo', "logo is found");
        }, null, 120000);
    });
    
    casper.then(function () {
        casper.then(function () {
            this.waitForText('VFB_00017894', function () {
                casper.wait(2000, function () {
                    this.echo("Element JFRC2_template appeared in popup");
                    test.assertVisible('div[id=Popup1_VFB_00017894_metadata_el_1]', 'Term info correctly populated  for JFRC2_template after load');
                    test.assertExists('button[id=VFB_00017894_zoom_buttonBar_btn]', 'Term info button bar button created');
                });
            }, null, 30000);


        });
    });

    // open spotlight and check functionality
    casper.then(function () {
        casper.then(function () {
            this.waitForSelector('button[id=spotlightVisible]', function () {
                test.assertExists('button[id=spotlightVisible]', "Spotlight button exists");
            }, null, 20000);
        });

        casper.then(function () {
            spotlightTest(test, "VFB_00000001", "#buttonOne", "#Popup1_VFB_00000001_metadata_el_");
        });
        
        casper.then(function () {
        	casper.evaluate(function() {
                $("#spotlight").hide();
            });
            casper.echo("Clicking to close spotlight");
            this.waitWhileVisible('div#spotlight', function () {
                test.assertNotVisible('div#spotlight', "Spotlight closed");
            }, null, 20000);
        });

        casper.then(function () {
            testMeshVisibility(test, true, "VFB_00017894.VFB_00017894_obj");
        });

        casper.then(function () {
            spotlightTest(test, "VFB_00000001", "#query", "#queryitem-fru-M-200266_0");
        });
    });

    function testMeshVisibility(test, visible, variableName) {
        var visibility = casper.evaluate(function (variableName) {
            var visibility = CanvasContainer.engine.getRealMeshesForInstancePath(variableName)[0].visible;
            return visibility;
        }, variableName);

        test.assertEquals(visibility, visible, variableName + " visibility correct");
    }

    function spotlightTest(test, searchQuery, buttonClick, termInfoData) {
    	casper.mouseEvent('click', 'button[id=spotlightVisible]', "attempting to open spotlight");

    	casper.waitUntilVisible('div#spotlight', function () {
    		test.assertVisible('div#spotlight', "Spotlight opened");

    		//type in the spotlight
    		this.sendKeys('input#typeahead', searchQuery, { keepFocus: true, reset: true });
    		//press enter
    		this.sendKeys('input#typeahead', this.page.event.key.Return, { keepFocus: true });

    		casper.then(function () {
    			this.waitForSelector('div.tt-suggestion', function () {
    				this.echo("Selecting first suggestion from suggestion box");
    				this.evaluate(function () {
    					$('div.tt-suggestion').first().click();
    				});
    			});
    		});

    		casper.then(function () {
    			casper.waitUntilVisible('button'+buttonClick, function () {
    				this.echo("Waited for button to be visible");
    				this.evaluate(function (button) {
    					$(button).first().click();
    				},buttonClick);
    			}, 25000);
    		});

    		if(buttonClick=="#buttonOne"){
    			casper.then(function () {
    				casper.waitUntilVisible('div'+termInfoData+"1", function () {
    					casper.then(function () {
    						this.echo("Testing info widget becomes properly populated");
    						this.waitUntilVisible(termInfoData + "5", function () {
    							this.echo("Added to scene correctly");
    							test.assertVisible(termInfoData + "1", "Term info property correctly visible");
    							test.assertVisible(termInfoData + "3", "Term info property correctly visible");
    							test.assertVisible(termInfoData + "5", "Term info property correctly visible");
    						}, 25000);
    					});
    				}, 25000);
    			});
    		}else if(buttonClick=="#query"){
    			casper.then(function () {
    				casper.waitUntilVisible('div'+termInfoData, function () {
    					casper.then(function () {
    						test.assertVisible(termInfoData, "Query Builder Panel Came Up and visible");
    					});
    				}, 25000);
    			});
    		}
    	}, 25000);
    }

    casper.run(function () {
        test.done();
    });
});
