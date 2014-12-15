// ==UserScript==
// @name        Stack Exchange like I like it
// @namespace   http://stackapps.org/
// @description Double-click a code block to select all + edit box auto indent / tab key behavior enhancements
// @match		*://stackexchange.com/*
// @match		*://*.stackexchange.com/*/*
// @match		*://stackoverflow.com/*/*
// @match		*://*.stackoverflow.com/*/*
// @match		*://stackapps.com/*/*
// @match		*://serverfault.com/*/*
// @match		*://superuser.com/*/*
// @match		*://askubuntu.com/*/*
// @match		*://mathoverflow.net/*/*
// @exclude     /^https?:\/\/(chat|blog|careers)\..*/
// @version     1.5.1
// @downloadURL	https://github.com/calraith/gm_scripts/raw/master/se_like_I_like_it.user.js
// @grant       GM_info
// ==/UserScript==

// \/.+/
var key = {
	tab: 9,
	enter: 13,
	end: 35,
	home: 36,
	code: 0,
	history: [0,0],
	contains: function(what) {
		// fastest loop method for this application
		// see http://jsperf.com/object-iteration-like-a-boss
		for (var i in this) {
			if (i === 'code') return false;
			if (this[i] === what) return true;
		}
	}
};

function fixTabs(e) {
	e = e || event;
	key.code = e.keyCode || e.charCode;

	// capture this + previous key code to detect double home or end
	key.history.push(key.code);
	key.history.shift();

	if (!key.contains(key.code)) return;	// not a character this script handles

	var el = document.activeElement;
	if (el.nodeName.toLowerCase() !== 'textarea') return;	// not in a textarea
	if (el.name == 'comment') return;	// not an edit entry box

	// All systems go!
	var start = el.selectionStart,
		end = el.selectionEnd,
		shiftStart = shiftEnd = 0,
		// indent regexp replacement function
		tabFill = function(match, $1, offset) {
			for (var i=0, ret='', len=match.length, m=len / 4; i<m; i++) ret += '\t';
			// compensate for cursor drift
			if (offset < start) {
				shiftStart -= (len - i);
				if (offset + len > start) shiftStart += offset + len - start;
			}
			if (offset < end) {
				shiftEnd -= (len - i);
				if (offset + len > end) shiftEnd += offset + len - end;
			}
			return ret;
		};

	// Replace space indents with tabs.
	el.value = el.value.replace(/(?:^\t*)( {4})+/mg, tabFill);
	if (shiftStart) {
		start += shiftStart; end += shiftEnd;
		el.setSelectionRange(start, end);
	}

	selected = el.value.substring(start, end);
	var inputArr = el.value.split('\n');

	// inputArr[row] contains start, and pos contains the idx of the last char of the previous line
	for (var row=pos=0;pos+inputArr[row].length<start;row++){pos+=inputArr[row].length+1}

	switch (key.code) {

		case key.tab:

			e.preventDefault();

			// if selection spans more than one line
			if (selected.indexOf('\n') > -1) {
				// count number of rows included in selection
				var rowsSelected = selected.split('\n').length;

				// expand selection to cover beginning of start row until end of end row
				// replace all 4-space sequences with a tab and update position indexes
				// if shift key, remove one level of indent per selected row; otherwise, add a level of indent.
				for (start = pos, stop = row + rowsSelected; row < stop; row++) {
					inputArr[row] = (e.shiftKey) ? inputArr[row].replace(/^( {4}|\t)/,'') : '\t' + inputArr[row];
					pos+=inputArr[row].length + 1;
				}
				end = --pos;
				el.value = inputArr.join('\n');
				el.setSelectionRange(start, end);

			// else selection does not span multiple lines.
			// If not shift key, simply insert a tab (overwriting any leading spaces) and advance the cursor.
			} else if (!e.shiftKey) {

				el.value = el.value.substring(0, start).replace(/( +)$/, function($1) { start -= $1.length; return ''; })
					+ '\t'
					+ el.value.substring(end).replace(/^ +/, '');
				el.setSelectionRange(++start, start);

			// otherwise, handle shift+tab
			} else {

				/* =======================================================
				The following code block mimics the behavior of Notepad++.
				If a user does shift-tab, NPP does not change the
				indentation of the line unless the cursor is at the
				beginning of all non-whitespace on the line.  Instead,
				NPP moves the cursor back one tab stop.
				======================================================= */
				var cursorInPos = start - pos, cursorMoved, tabStop;

				// While the cursor is not at the beginning of the line and there's
				// non-whitespace between the beginning of the line and the cursor,
				// and start is not at the previous tab stop
				while (cursorInPos && /\S/.test(inputArr[row].substring(0,cursorInPos)) && !tabStop) {
					cursorMoved = start--;
					cursorInPos--;
					var indentLevel = (inputArr[row].match(/^\s+/) || [''])[0].length,
						tempCursor = cursorInPos - indentLevel,
						tabStop = !(tempCursor % 4);
				}

				// If cursor was not moved, outdent.
				if (!cursorMoved) {
					if (/\s/.test(inputArr[row].charAt(cursorInPos))) start++;
					inputArr[row] = inputArr[row].replace(/^( +|\t)/,
						function($1) { if (start > pos) start -= $1.length; return ''; }
					);
					el.value = inputArr.join('\n');
				}
				el.setSelectionRange(start, start);
			}

		break;

		case key.enter:

			e.preventDefault();

			// ctrl+Enter to submit
			if (e.ctrlKey) {
				do { el = el.parentNode || null; } while (el && el.nodeName.toLowerCase() !== 'form');
				return el ? el.submit() : false;
			}

			// unify indentation of previous line as tabs
			var indent = (inputArr[row].match(/^\s+/) || [''])[0];

			// insert newline + indent, discarding contents of user selection if any
			el.value = el.value.substring(0, pos)
				+ inputArr[row].substring(0, start - pos)
				+ '\n' + indent
				+ el.value.substring(end);
			start+=indent.length+1;
			el.setSelectionRange(start, start);

		break;

		case key.home:

			var cursorInPos = start - pos, newStart = start, cursorMoved;

			// If not double-pressed and line is wrapped, allow default behavior
			if (cursorInPos > el.cols && key.history[0] !== key.home) return;
			if (key.history[0] == key.history[1]) key.history[1] = 0;

			e.preventDefault();

			// If cursor is in the whitespace at the beginning of the line, advance to text
			while (cursorInPos < inputArr[row].length && /\s/.test(inputArr[row].charAt(cursorInPos))) {
				cursorMoved = newStart++;
				cursorInPos++;
			}

			// If cursor is after non-whitespace, regress to beginning of text
			while (cursorInPos && /\S/.test(inputArr[row].substring(0,cursorInPos))) {
				cursorMoved = newStart--;
				cursorInPos--;
			}

			// If the cursor wasn't moved, move it to the beginning of the line.
			if (!cursorMoved) newStart -= cursorInPos;

			if (e.shiftKey) {
				if (start > newStart) el.setSelectionRange(newStart, end, 'backward');
				else el.setSelectionRange(start, newStart);
			}
			else el.setSelectionRange(newStart, newStart);

		break;

		case key.end:

			// if not double-pressed, allow default behavior.
			if (inputArr[row].length <= el.cols || key.history[0] !== key.end) return;
			if (key.history[0] == key.history[1]) key.history[1] = 0;

			e.preventDefault();

			var newEnd = pos + inputArr[row].length;

			// select to next \n
			if (e.shiftKey) el.setSelectionRange(start, newEnd);
			else el.setSelectionRange(newEnd, newEnd);

		break;

	}	// end switch(key.code)
}	// end fixTabs()

addEventListener('keydown', fixTabs, true);

/* end keyboard behavior mods */

function selectAll() {
	var range = document.createRange();
	// select parent if parent === <pre>; else select self
	range.selectNodeContents(this.nodeName.toLowerCase() === 'pre' ? this.childNodes[0] : this);
	var selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

function addDblClick() {
	var code = document.getElementsByTagName('code');
	for (var i=0; i<code.length; i++) {
		/* ====================================================================
		If parent node is <pre>, add listener to parent.  This allows double-
		clicking anywhere within a code block to select all, as well as double-
		clicking inline code snippets the poster enclosed in backticks.
		==================================================================== */
		var node = (code[i].parentNode.nodeName.toLowerCase() === 'pre' ? code[i].parentNode : code[i]);
		node.removeEventListener('dblclick', selectAll, true);
		node.addEventListener('dblclick', selectAll, true);
		node.title = 'double-click to select all';
	}
}
addDblClick();

// listen for stuff like "show 1 more comment"
var creep = new MutationObserver(addDblClick);
creep.observe(document, {subtree: true, childList: true});

/* end double-click mods */

// If on http://stackexchange.com/, check for sites not included in metadata @match directives
if (/https?:\/\/stackexchange\.com/i.test(location.href) && GM_info) {
	var XHR = new XMLHttpRequest();
	with (XHR) {
		open("GET", "http://stackexchange.com/sites?view=list", true);
		onerror = function() { return false; };
		onload = function() { return true; };
		onreadystatechange = function() {
			if (XHR.readyState == 4) {
				var dom = document.implementation.createHTMLDocument();
				dom.documentElement.innerHTML = XHR.responseText;
				var list = dom.getElementsByClassName('list-view-container')[0].getElementsByTagName('a');
				var matches = GM_info.script.matches;
				for (var i=found=0; i<list.length; i++) {
					if (/(twitter|blog)/i.test(list[i].href)) continue;
					for (var j=0; j<matches.length; j++) {
						var rxp = new RegExp('^' + matches[j].replace(/\/\*$/,'').replace(/[\.\/\*]/g, function(m) {
							return (m == '*') ? '.*' : '\\' + m;
						}) + '$', 'i');
						if (rxp.test(list[i].href)) { found=1; break; }
					}
					if (!found) console.log('New stackexchange domain: ' + list[i].href);
					else found=0;
				}
			}
		};
		send('');
	}
}
