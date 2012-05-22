if (typeof window.external.Notify !== "undefined") {

	if (typeof window.console == "undefined") {
		window.console = { log: function (str) { window.external.Notify(str); } };
	}

	// output any errors to console log, created above.
	window.onerror = function (e) {
		console.log("window.onerror ::" + JSON.stringify(e));
	};
}

console.log("Console log installed");