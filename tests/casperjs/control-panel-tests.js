var urlBase = casper.cli.get('host');
if (urlBase == null || urlBase == undefined) {
    urlBase = "http://127.0.0.1:8080/";
}

var DASHBOARD_URL = urlBase + "org.geppetto.frontend/";
var PROJECT_URL = urlBase + "org.geppetto.frontend/geppetto?i=VFB_00017894,VFB_00000001";

casper.test.begin('VFB control panel tests', 7, function suite(test) {
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
    casper.start(PROJECT_URL, function () {
        this.echo("Loading project at URL: " + PROJECT_URL);
        this.waitForSelector('#VFB_00017894_deselect_buttonBar_btn', function () {
            this.echo("I waited for the logo and VFB_00017894 deselect button on button bar to load.");
            test.assertTitle("VirtualFlyBrain", "VFB's homepage title is the one expected");
            test.assertExists('#geppettologo', "logo is found");
        }, null, 120000);
    });

    // check for items in control panel + instances
    casper.then(function () {
        test.assertExists('div#Popup1_VFB_00017894_metadata_el_1', 'Term info correctly populated  for neuron after load');
        test.assertExists('button[id=VFB_00017894_zoom_buttonBar_btn]', 'Term info button bar button created');
    });

    // open control panel, check it's visible
    casper.then(function () {
        this.mouseEvent('click', 'button[id=termInfoVisible]', 'Opening term info popup');

        // check that control panel is invisible
        test.assertNotVisible('#controlpanel', "Control panel is invisible");

        this.echo("Clicking on control panel button to open query builder");
        this.mouseEvent('click', 'button[id=controlPanelVisible]', 'Opening control panel');

        test.assertVisible('#controlpanel', "Control panel is visible");
    });

    // click on selection control, check term info is populated
    casper.then(function () {
        // click on select control
        this.echo("Clicking on selection control button for JFRC2_template");
        casper.wait(1000, function () {
            casper.mouseEvent('click', 'button[id=VFB_00000001_select_ctrlPanel_btn]', 'Clicking selection button on JFRC2_template');
            // wait for neuron to be deselected in response
            casper.waitForSelector('#VFB_00000001_deselect_buttonBar_btn', function () {
                casper.wait(1000, function () {
                    test.assertExists('div#Popup1_VFB_00000001_metadata_el_0', 'Term info correctly populated  for JFRC2_template after control panel selection click');
                });
            }, null, 10000);
        });
    });

    casper.run(function () {
        test.done();
    });
});
