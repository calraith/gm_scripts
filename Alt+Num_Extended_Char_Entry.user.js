// ==UserScript==
// @name        Alt+Num Extended Char Entry
// @namespace   https://stackapps.org/
// @description hold Alt while pressing numbers to make extended characters
// @match     *://*/*
// @version     1
// @grant       none
// @run-at		document-idle
// @downloadURL	https://github.com/calraith/gm_scripts/raw/master/Alt+Num_Extended_Char_Entry.user.js
// ==/UserScript==

if (self != top) return;

// holds a list of number keys pressed while alt is held down
var combo = [];

addEventListener('keyup', simulateNumPad);
addEventListener('load', iFramesToo);

function iFramesToo() {
	var iframes = document.getElementsByTagName('iframe');
	for (var i=iframes.length; i--;) {
		if (iframes[i].contentDocument)
			iframes[i].contentDocument.addEventListener('keyup', simulateNumPad);
	}
}

function simulateNumPad(e) {

	var el = getActiveElement(),
		start = el.selectionStart,
		end = el.selectionEnd,
		symbol;
	
	if (!el) console.log('unable to determine focus');

	if (!/textarea|input/i.test(el.nodeName) && !el.isContentEditable) return;

	if (e.altKey) {

		// if alt key is pressed, prevent browser menubar from appearing
		e.preventDefault();	
		
		// keyCode 48 = 0, 49 = 1, 50 = 2, etc.
		if (e.keyCode >= 48 && e.keyCode <= 57) combo.push(e.keyCode - 48);
		
	} else if (combo.length) {

		// if key combo doesn't start with a zero, retrieve higher Unicode glyphs
		// alt+0176 = °, whereas alt+234 = Ω
		symbol = String.fromCharCode(
			(combo[0]) ? combo.join('') * 1 + 703 : combo.join('')
		);

		// purge key sequence
		combo = [];

		// insert symbol at current caret pos and advance caret
		if (el.setSelectionRange) {
			
			el.value = el.value.substring(0, start) + symbol + el.value.substring(end);
			el.setSelectionRange(++start, start);
			
		} else {

			var sel = el.ownerDocument.getSelection(),
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
	if (el.tagName == 'IFRAME' ||
		(el === document.body && !el.ownerDocument.getSelection())) {
		
		// enumerate all iframes and test recursively
		var iframes = document.getElementsByTagName('iframe');
		for (var i = iframes.length; i--;) {

			if (iframes[i].contentDocument)
				var focused = getActiveElement(iframes[i].contentDocument);

			if (focused) return focused;
		}
	}
	else return el;

	return false;
};
