var TextLink = {
	clickedText: null,
	
	menuItems : ["textlink-sep", "textlink-open-link"],
	
	init : function() {
		getBrowser().addEventListener("click", TextLink.handleClick, false);
		
		window.removeEventListener("load", TextLink.init, false);
		window.addEventListener("unload", TextLink.unload, false);		
		
		if ("@mozilla.org/extensions/manager;1" in Components.classes) {
			var version =  Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager).getItemForID("{ec268e28-22c6-4a6c-ac22-635cabee283c}").version;
			var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.plain-text-links.");
		
			if (prefs.getCharPref("version") != version) {
				prefs.setCharPref("version", version);
			
				var browser = getBrowser();
			
				setTimeout(function (browser) {
					browser.selectedTab = browser.addTab("http://www.chrisfinke.com/firstrun/plain-text-links.php");
				}, 3000, browser);
			}
		}
	},
	
	unload : function () {
		getBrowser().removeEventListener("click", TextLink.handleClick, true);
		
		window.removeEventListener("unload", TextLink.unload, false);
	},
	
	handleClick : function (event) {
		// First see if there's a selection
		var sel = TextLink.fixURL(getBrowser().contentWindow.getSelection().toString());
		
		if (event.button == 2 && sel != '') {
			TextLink.clickedText = sel;
		}
		else if (event.button == 2 && event.target.localName != 'A' && event.rangeParent.nodeType == document.TEXT_NODE) {
			// grab text at click point
			var range = document.createRange();
			var rangeStart = event.rangeOffset;
			var rangeEnd = event.rangeOffset;
			var ws = /\s/;
			
			range.setStart(event.rangeParent, event.rangeOffset);
			range.setEnd(event.rangeParent, event.rangeOffset);
			
			// now find beginning and end of word
			while(!ws.test(range.toString()[0]) && rangeStart >= 0) {
				rangeStart--;
				if (rangeStart >= 0) {
					range.setStart(event.rangeParent, rangeStart);
				}
			}
			
			// move forward one char again
			rangeStart++;
			range.setStart(event.rangeParent, rangeStart);
			
			while (!ws.test(range.toString().substr(-1,1))) {
				rangeEnd++;
			
				try {
					range.setEnd(event.rangeParent, rangeEnd);
				} catch(ex) {
					// dunno how to figure out if rangeEnd is too big?
					break;
				}
			}
			
			// move back one char again
			rangeEnd--;
			range.setEnd(event.rangeParent, rangeEnd);
			
			sel = TextLink.fixURL(range.toString());
			
			if (sel) {
				TextLink.clickedText = sel;
			}
			else {
				TextLink.clickedText = null;
			}
		}
		else {
			TextLink.clickedText = null;
		}
		
		var hide = !TextLink.clickedText;
		
		for (var i = 0; i < TextLink.menuItems.length; i++) {
			document.getElementById(TextLink.menuItems[i]).hidden = hide;
		}
	},

	openLinkHere: function(event) {
		if (TextLink.clickedText != null) {
			openUILink(TextLink.clickedText, event);
		}
	},

	// strip bad leading and trailing characters
	unmangleURL: function(url) {
		// strip all whitespace
		url = url.replace(/[\n\t ]+/, "");
		
		// strip bad leading characters
		url = url.replace(/^[^a-zA-Z0-9]+/, "");
		
		// strip bad ending characters
		url = url.replace(/[\.,\'\"\)\?!>\]]+$/, "");
		
		return url;
	},
	
	fixURL: function (url) {
		url = TextLink.unmangleURL(url);
		
		if (url == '') {
			return '';
		}
		
		if (url.indexOf(".") == -1) {
			return "";
		}
		
		// make sure it has some sort of protocol
		if (url.search(/^\w+:\/\//) == -1 && url.search(/mailto:/) != 0) {
			url = "http://" + url;
		}
		
		// these get used a lot.  guess this makes it more useful.
		// h*p -> http
		// f*p -> ftp
		if (url.search(/^h.+p:\/\//) != -1) {
			url = url.replace(/^h.+p:\/\//, "http://");
		}
		
		if (url.search(/^f.+p:\/\//) != -1) {
			url = url.replace(/^f.+p:\/\//, "ftp://");
		}

		return url;
	},
	
	log : function (message) {
		var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage("Plain Text Links: " + message);
	}
};

window.addEventListener("load", TextLink.init, false);