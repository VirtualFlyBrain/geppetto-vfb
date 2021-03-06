var urlBase = casper.cli.get('host');
if (urlBase == null || urlBase == undefined) {
    urlBase = "http://127.0.0.1:8080/";
}

var DASHBOARD_URL = urlBase + "org.geppetto.frontend/";
var PROJECT_URL = urlBase + "org.geppetto.frontend/geppetto?i=VFB_00017894";

casper.test.begin('VFB Term Info tests', 8, function suite(test) {
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
            this.echo("I waited for the dashboard logo to load.");
            test.assertTitle("geppetto's home", "geppetto's dashboard homepage title is the one expected");
            test.assertExists('div#logo', "Dashboard logo is found");
        }, null, 10000);
    });

    
    // open project, check for items in term info popup
    casper.thenOpen(PROJECT_URL, function () {
        this.echo("Loading project at URL: " + PROJECT_URL);
    	this.waitForSelector('#VFB_00017894_select_ctrlPanel_btn', function () {
            this.echo("I waited for the VFB logo to load.");
            test.assertTitle("VirtualFlyBrain", "VFB's homepage title is the one expected");
            test.assertExists('#geppettologo', "logo is found");
        }, null, 120000);
    });
    
    casper.then(function () {
        this.waitForText('VFB_00017894', function () {
            casper.wait(2000, function () {
            	this.echo("Element JFRC2_template appeared in popup");
            	test.assertVisible('div#VFBTermInfo_el_1_component', 'Term info correctly populated  for JFRC2_template after load');
                test.assertTextExists('adult brain template JFRC2 (VFB_00017894)', 'Term info correctly populated  for JFRC2_template after load');
            	test.assertExists('button[id=VFB_00017894_zoom_buttonBar_btn]', 'Term info button bar button created');
            });
        }, null, 30000);

    });

    // check items in term info popup
    casper.then(function () {
        testTermInfoWidget(test, "medulla", "#type", "#Popup1_FBbt_00003748_metadata_el_");
    });

    function testTermInfoWidget(test) {
        //click on Term Info popup item
        casper.then(function () {
            casper.evaluate(function (variableName) {
                $(variableName).find("a").click()
            }, "#VFBTermInfo_el_1_component");
        });

        // wait for text to appear in the term info widget
        casper.waitForText('GMR_60B11_AE_01_00-fA01b', function () {
            test.assertTextExists('adult brain (FBbt_00003624)', 'Term info correctly populated after term info interaction');
        }, null, 20000);
    }

    casper.run(function () {
        test.done();
    });
});
