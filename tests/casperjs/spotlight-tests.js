var DASHBOARD_URL = "http://127.0.0.1:8080/org.geppetto.frontend/";
var PROJECT_URL = "http://127.0.0.1:8080/org.geppetto.frontend/geppetto?load_project_from_url=http://v2.virtualflybrain.org/conf/vfb.json";

casper.test.begin('VFB Spotlight tests', function suite(test) {
    casper.options.viewportSize = {
        width: 1340,
        height: 768
    };

    // add for debug info
    // casper.options.verbose = true;
    // casper.options.logLevel = "debug";

    // show unhandled js errors
    casper.on("page.error", function(msg, trace) {
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

        casper.then(function(){
            this.waitForText('JFRC2_template', function () {
                this.echo("Element JFRC2_template appeared in popup");
            }, null, 30000);

            this.waitForText('VFB_00017894.nrrd', function () {
                this.echo("Element SAD appeared in appeared in popup");
            }, null, 30000);
            
            this.waitForSelector('div[id=Popup1_VFB_00017894_metadata_el_1]', function () {
                test.assertExists('div[id=Popup1_VFB_00017894_metadata_el_1]', 'Term info correctly populated  for JFRC2_template after load');
            }, null, 30000);
            
            this.waitForSelector('button[id=VFB_00017894_zoom_buttonBar_btn]', function () {
                test.assertExists('button[id=VFB_00017894_zoom_buttonBar_btn]', 'Term info button bar button created');
            }, null, 30000);
            
            
        });
    });

    // open spotlight and check functionality
    casper.then(function () {
    	casper.then(function(){
    		this.waitForSelector('button[id=searchBtn]', function () {
                test.assertExists('button[id=searchBtn]', "Spotlight button exists");
            }, null, 20000);
    	});
    	
    	casper.then(function(){
    		spotlightTest(test, "VFB_00000001", "#buttonTwo","#Popup1_VFB_00000001_metadata_el_");
    	});
    	
    	casper.then(function(){
    		testMeshVisibility(test,true,"VFB_00017894.VFB_00017894_obj");
    	});
    	
    	casper.then(function(){
    		spotlightTest(test, "medulla", "#buttonOne","#Popup1_FBbt_00003748_metadata_el_");
    	});
    });
    
    function testMeshVisibility(test,visible,variableName){
    	var visibility = casper.evaluate(function(variableName) {
    		var visibility = Canvas1.engine.getRealMeshesForInstancePath(variableName)[0].visible;
    		return visibility;
    	},variableName);
    	
    	test.assertEquals(visibility,visible, variableName +" visibility correct");
    }
    
    function spotlightTest(test, searchQuery, buttonClick, termInfoData){
    	casper.mouseEvent('click', 'button[id=searchBtn]', "attempting to open spotlight");

    	casper.waitUntilVisible('div#spotlight', function () {
    		test.assertVisible('div#spotlight', "Spotlight opened");

    		//type in the spotlight
    		this.sendKeys('input#typeahead', searchQuery, {keepFocus: true});
    		//press enter
    		this.sendKeys('input#typeahead', this.page.event.key.Return, {keepFocus: true});
    		
    		this.waitForSelector('div.tt-suggestion', function () {
                this.echo("Selecting first suggestion from suggestion box");
                this.evaluate(function() {
                    $('div.tt-suggestion').first().click();
                });
    		});
    		casper.waitUntilVisible('div#spotlight', function () {
    			casper.then(function () {
    				this.echo("Waiting to see if the button becomes visible");
    				casper.waitUntilVisible(buttonClick, function () {
    					test.assertVisible(buttonClick, "Show Info correctly visible");
    					this.echo("Show Info button became visible correctly");
    					this.evaluate(function(buttonClick) {
    	                    $(buttonClick).click();
    	                },buttonClick);
    					this.waitUntilVisible(termInfoData+"0", function () {
    						this.echo("Added to scene correctly");
    						test.assertVisible(termInfoData+"1", "Term info property correctly visible");
    						test.assertVisible(termInfoData+"3", "Term info property correctly visible");
    						test.assertVisible(termInfoData+"5", "Term info property correctly visible");  
    					}, 25000);
    				}, null, 295000);
    			});
    		}, 25000);
    	}, 25000);
    }

    casper.run(function () {
        test.done();
    });
});
