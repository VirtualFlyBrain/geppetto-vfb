var urlBase = casper.cli.get('host');
if(urlBase==null || urlBase==undefined){
    urlBase = "http://127.0.0.1:8080/";
}

var DASHBOARD_URL = urlBase + "org.geppetto.frontend/";
var PROJECT_URL = urlBase + "org.geppetto.frontend/geppetto?load_project_from_url=http://v2.virtualflybrain.org/conf/vfb.json&i=VFB_00017894,VFB_00030849,VFB_00030838,VFB_00030856,VFB_00030880";

casper.test.begin('VFB Batch request tests', function suite(test) {
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

    // open project, check for items in control panel + instances
    casper.thenOpen(PROJECT_URL, function () {
        this.echo("Loading project at URL: " + PROJECT_URL);

        casper.then(function(){
            casper.then(function(){
                this.wait(25000);
                this.waitForText('VFB_00030880', function () {
                    this.echo("Element ventral complex on adult brain template JFRC2 appeared in popup");
            	    test.assertVisible('div[id=Popup1_VFB_00030880_metadata_el_1]', 'Term info correctly populated  for JFRC2_template after load VFB_00030880 as last in the list');
                    test.assertExists('button[id=VFB_00030880_zoom_buttonBar_btn]', 'Term info button bar button created 1');
	                }, null, 30000);
                });
            });
        });
        
        casper.then(function(){
        	var canvasMeshes = this.evaluate(function() {
    			return Object.keys(Canvas1.engine.meshes).length;
    		});
    		
    		test.assertEquals(canvasMeshes,5, "Canvas1 has 5 mesh");
    		
    		var stackViewerMeshes = this.evaluate(function() {
    			return Object.keys(StackViewer1.canvasRef.engine.meshes).length;
    		});
    		
    		test.assertEquals(stackViewerMeshes,5, "StackViewer has 5 mesh");
    	});
        
        casper.then(function(){
    		stackViewerTests();
        });
        
        casper.then(function () {
            casper.echo("Opening controls panel");
            buttonClick("#controlPanelBtn");
        });

        casper.then(function(){
    		testControlPanel();
        });
    
    function stackViewerTests(){
    	//wait few seconds for stack viewer to finish loading
    	casper.wait(5000, function () {
    		casper.then(function(){
    			//test amount of control buttons in the stack viewer
        		var buttons = this.evaluate(function() {
        			var stackViewerButtons = $("#StackViewer1").find("button");
        		});
        	});

    		//test that VFB obj exists inside the Stack Viewer
        	casper.then(function(){
        		var visibility = casper.evaluate(function() {
        			var visibility = StackViewer1.canvasRef.engine.meshes["VFB_00017894.VFB_00017894_obj"].visible;
        			return visibility;
        		});
        		
                test.assertEquals(visibility,true, "VFB_00017894 visibility correct");
                
                visibility = casper.evaluate(function() {
        			var visibility = StackViewer1.canvasRef.engine.meshes["VFB_00030849.VFB_00030849_obj"].visible;
        			return visibility;
        		});
        		
                test.assertEquals(visibility,true, "VFB_00030849 visibility correct");
                
                visibility = casper.evaluate(function() {
        			var visibility = StackViewer1.canvasRef.engine.meshes["VFB_00030838.VFB_00030838_obj"].visible;
        			return visibility;
        		});
        		
                test.assertEquals(visibility,true, "VFB_00030838 visibility correct");
                
                visibility = casper.evaluate(function() {
        			var visibility = StackViewer1.canvasRef.engine.meshes["VFB_00030856.VFB_00030856_obj"].visible;
        			return visibility;
        		});
        		
                test.assertEquals(visibility,true, "VFB_00030856 visibility correct");
                
                visibility = casper.evaluate(function() {
        			var visibility = StackViewer1.canvasRef.engine.meshes["VFB_00030880.VFB_00030880_obj"].visible;
        			return visibility;
        		});
        		
        		test.assertEquals(visibility,true, "VFB_00030880 visibility correct");
        	});
    	});
    }

    function testControlPanel(){
        casper.waitUntilVisible('div#controlpanel', function () {
            test.assertVisible('div#controlpanel', "The control panel is correctly open.");
            var rows = casper.evaluate(function() {
                var rows = $(".standard-row").length;
                return rows;
            });
            test.assertEquals(rows, 5, "The control panel opened with right amount of rows");
        });

        casper.then(function(){
            test.assertVisible('button[id=VFB_00017894_info_ctrlPanel_btn]', 'Control panel ID VFB_00017894 visible');
            test.assertExists('button[id=VFB_00017894_info_ctrlPanel_btn]', 'Control panel ID VFB_00017894 exists');

            test.assertVisible('button[id=VFB_00030849_info_ctrlPanel_btn]', 'Control panel ID VFB_00030849 visible');
            test.assertExists('button[id=VFB_00030849_info_ctrlPanel_btn]', 'Control panel ID VFB_00030849 exists');

            test.assertVisible('button[id=VFB_00030838_info_ctrlPanel_btn]', 'Control panel ID VFB_00030838 visible');
            test.assertExists('button[id=VFB_00030838_info_ctrlPanel_btn]', 'Control panel ID VFB_00030838 exists');

            test.assertVisible('button[id=VFB_00030856_info_ctrlPanel_btn]', 'Control panel ID VFB_00030856 visible');
            test.assertExists('button[id=VFB_00030856_info_ctrlPanel_btn]', 'Control panel ID VFB_00030856 exists');

            test.assertVisible('button[id=VFB_00030880_info_ctrlPanel_btn]', 'Control panel ID VFB_00030880 visible');
            test.assertExists('button[id=VFB_00030880_info_ctrlPanel_btn]', 'Control panel ID VFB_00030880 exists');
	        }, null, 30000);
        }

        function buttonClick(buttonName){
            casper.evaluate(function(buttonName) {
                $(buttonName).click();
            },buttonName);
        }

    casper.run(function () {
        test.done();
    });
});
