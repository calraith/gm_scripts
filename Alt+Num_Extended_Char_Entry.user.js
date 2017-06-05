// ==UserScript==
// @name        Alt+Num Extended Char Entry
// @namespace   https://stackapps.org/
// @description hold Alt while pressing numbers to make extended characters
// @match       *://*/*
// @version     1.2
// @grant       none
// @downloadURL https://github.com/calraith/gm_scripts/raw/master/Alt+Num_Extended_Char_Entry.user.js
// @run-at      document-end
// ==/UserScript==

// In Windows, you can view your native codepage by opening a cmd or PowerShell console and entering chcp
var codepage=437; // 437 is the en-US codepage

if (self != top) return;

// holds a list of number keys pressed while alt is held down
var combo = [],
	clicked; // Chrome failsafe

addEventListener('keyup', safeSimulateNumPad);
addEventListener('load', iFramesToo);

function iFramesToo() {
	var iframes = document.getElementsByTagName('iframe');
	for (var i=iframes.length; i--;) {
		// try-catch block to avoid cross domain errors halting execution
		try {
			if (iframes[i].contentWindow) {
				iframes[i].contentWindow.addEventListener('keyup', safeSimulateNumPad);
				// Chrome failsafe
				iframes[i].contentWindow.addEventListener('click', function(e) { clicked = e.target; });
			}
		}
		catch (err) {}
	}
}

// import codepage abstractions
// Credit: https://github.com/SheetJS/js-codepage
function init(obj) {
	if (obj.idx >= obj.src.length) return;
	try {
		var src = obj.src[obj.idx++],
			script = document.createElement('script');

		script.contentType = 'application/javascript;charset=utf-8';
		script.onload = function(){ init(obj); };
		script.src = 'https://cdn.rawgit.com/SheetJS/js-codepage/master/' + src;

		document.getElementsByTagName('HEAD')[0].appendChild(script);
		console.log('Alt+Num_Extended_Char_Entry: ' + src + ' ready');
	}
	catch(err) {
		console.log(err.message);
		console.log('Codepage translations unavailable.  Only Unicode key combos will work.');
	}
}
init({src: ["cptable.js","cputils.js"], idx: 0});

function safeSimulateNumPad(e) {
	try { simulateNumPad(e); }
	catch(err) { console.log(err.message); }
}

function simulateNumPad(e) {

	var el = getActiveElement() || clicked,
		start = el.selectionStart,
		end = el.selectionEnd,
		symbol;

	if (!el) console.log('unable to determine focus');

	// Chrome doesn't reliably bubble up the .isContentEditable property
	if (!/chrome/i.test(navigator.userAgent) && !/textarea|input/i.test(el.nodeName) &&
		!el.isContentEditable) return;

	if (e.altKey) {

		// if alt key is pressed, prevent browser menubar from appearing
		e.preventDefault();

		// keyCode 48 = 0, 49 = 1, 50 = 2, etc.
		if (e.keyCode >= 48 && e.keyCode <= 57) combo.push(e.keyCode - 48);

	} else if (combo.length) {

		// if key combo doesn't start with a zero, retrieve codepage table glyph
		// alt+0176 = °, whereas alt+234 = Ω (for codepage 437)
		symbol = (combo[0] && (combo.join('') * 1 <= 255)) ?
			cptable[codepage].dec[combo.join('')] : String.fromCharCode(combo.join(''));

		console.log('symbol: ' + symbol);

		// purge key sequence
		combo = [];

		// insert symbol at current caret pos and advance caret
		if (el.setSelectionRange) {

			// textarea or input
			el.value = el.value.substring(0, start) + symbol + el.value.substring(end);
			el.setSelectionRange(++start, start);

		} else {

			// contentEditable node
			var sel = el.ownerDocument.defaultView.getSelection(),
				range;

			// hack for Chrome
			if (!sel.rangeCount)
				sel = clicked.ownerDocument.defaultView.getSelection();

			range = sel.getRangeAt(0);
			range.deleteContents();
			range.insertNode(document.createTextNode(symbol));
			sel.collapseToEnd();
		}
	}
}

// credit: https://stackoverflow.com/a/25420726/1683264
function getActiveElement(document) {

	document = document || window.document;
	var el = document.activeElement;

	// if target is an iframe or is the document body with no slection
	// (defaultView seems to be required for Chrome.)
	if (el.tagName == 'IFRAME' ||
		(el === document.body && !el.ownerDocument.defaultView.getSelection())) {

		// enumerate all iframes and test recursively
		var iframes = document.getElementsByTagName('iframe');
		for (var i = iframes.length; i--;) {

			// try-catch to avoid cross domain errors halting execution
			try {
				if (iframes[i].contentDocument)
					var focused = getActiveElement(iframes[i].contentDocument);

				if (focused) return focused;
			}
			catch (err) {}
		}
	}
	else return el;

	return false;
};
