/* 
 * Qt+WebKit powered (mostly) headless test runner using Phantomjs
 * 
 * Phantomjs installation: http://code.google.com/p/phantomjs/wiki/BuildInstructions
 * 
 * Then run with:
 *  phantomjs test.js
 */

function addLogging(suite, done) {
	var module;
	QUnit.moduleStart = function(context) {
		module = context.name;
	}
	var current_test_assertions = [];
	QUnit.testDone = function(result) {
		var name = module + ": " + result.name;
		if (result.failed) {
			console.log("\u001B[31m✖ " + name);
			for (var i = 0; i < current_test_assertions.length; i++) {
				console.log("    " + current_test_assertions[i]);
			}
			console.log("\u001B[39m");
		}
		current_test_assertions = [];
	};
	
	QUnit.log = function(details) {
		if (details.result) 
			return;
		var response = details.message || "";
		if (typeof details.expected !== "undefined") {
			if (response) {
				response += ", ";
			}
			response = "expected: " + details.expected + ", but was: " + details.actual;
		}
		current_test_assertions.push("Failed assertion: " + response);
	};
	
	QUnit.done = function(result){
		console.log(suite + ": Took " + result.runtime +  "ms to run " + result.total + " tests. \u001B[32m✔ " + result.passed + "\u001B[39m \u001B[31m✖ " + result.failed + "\u001B[39m ");
		done(result.failed > 0 ? 1 : 0);
	};
}

// TODO add dialog, draggable, droppable, position, resizable, selectable, sortable and tabs once their suites are stable
var phantom_tests = ["accordion", "autocomplete", "button", "core", "datepicker", "menu", "progressbar", "spinner", "tooltip", "widget"],
	//phantom_tests = ["accordion", "autocomplete", "button", "core", "datepicker", "dialog", "draggable", "droppable", "menu", "position", "progressbar", "resizable", "selectable", "slider", "sortable", "spinner", "tabs", "tooltip", "widget"],
	phantom_state;

function run() {
	var test = phantom_tests[phantom_state];
	phantom.state = phantom_state + 1;
	// TODO make base URL configurable via args?
	phantom.open("http://localhost/jquery-ui/tests/unit/" + test +  "/" + test + ".html");
}

if (phantom.state.length == 0) {
	phantom_state = phantom.state = 0;
	run();
} else {
	phantom_state = +phantom.state;
	addLogging(phantom_tests[phantom_state - 1], function(returnCode) {
		if (phantom_tests[phantom_state]) {
			run();
		} else {
			// TODO sum all the return codes and pass them to .exit()
			phantom.exit();
		}
	});
}
