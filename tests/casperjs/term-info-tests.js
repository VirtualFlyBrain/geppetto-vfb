var DASHBOARD_URL = "http://127.0.0.1:8080/org.geppetto.frontend/";
var PROJECT_URL = "http://127.0.0.1:8080/org.geppetto.frontend/geppetto?load_project_from_url=http://v2.virtualflybrain.org/conf/vfb.json";

casper.test.begin('VFB Term Info tests', 5, function suite(test) {
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

    // open project, check for items in Term Info Popup
    casper.thenOpen(PROJECT_URL, function () {
        this.echo("Loading project at URL: " + PROJECT_URL);

        casper.then(function(){
            this.waitForText('VFB_00017894', function () {
                this.echo("Element JFRC2_template appeared in popup");
            	test.assertVisible('div[id=Popup1_VFB_00017894_metadata_el_1]', 'Term info correctly populated  for JFRC2_template after load');
		  		test.assertExists('button[id=VFB_00017894_zoom_buttonBar_btn]', 'Term info button bar button created');
	    	}, null, 30000);

        });
    });

    // check items in term info popup
    casper.then(function(){
		testTermInfoWidget(test, "medulla", "#type","#Popup1_FBbt_00003748_metadata_el_");
	});
    
    function testTermInfoWidget(test){
    	casper.then(function(){
    		//check that term info is populated
    		casper.waitUntilVisible('div#Popup1_VFB_00017894_metadata_el_1', function () {
    			casper.then(function () {
    				test.assertVisible("div#Popup1_VFB_00017894_metadata_el_1", "Term info property correctly visible");
    			});
    		});
    	});
    	
    	//click on Term Info popup item
    	casper.then(function(){
    		casper.evaluate(function(variableName) {
    			$(variableName).find("a").click()
    		},"#Popup1_VFB_00017894_metadata_el_1");
    	});
    	
    	//wait for term info to reload with new info
    	casper.then(function(){
    		this.waitForText('adult head', function () {
                this.echo("Element adult head appeared in appeared in popup");
            }, null, 295000);
    	});
    }

    casper.run(function () {
        test.done();
    });
});
