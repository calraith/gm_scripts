// ==UserScript==
// @name        Stack Exchange like I like it
// @namespace   http://stackapps.org/
// @description Double-click a code block to select all + edit box auto indent / tab key behavior enhancements
// @include     /^https?:\/\/(\w+\.)?(stack(overflow|exchange|apps)|serverfault|superuser|askubuntu|onstartups|mathoverflow|mso)\.com\/.+/
// @exclude     /^https?:\/\/(chat|blog|careers)\..*/
// @version     1.1
// @grant       none
// ==/UserScript==

function selectAll() {
    var range = document.createRange();
    range.selectNodeContents(this.childNodes[0]);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function fixTabs(e) {
	e = e || event;
	var key = {
		tab: 9,
		enter: 13,
		end: 35,
		home: 36,
		code: e.keyCode || e.charCode,
		contains: function(what) {
			for (var i in this) {
				if (i === 'code') return false;
				if (this[i] === what) return true;
			}
		}
	};

	// capture this + previous key code to detect double home or end
	history.push(key.code);
	history.shift();

	if (!key.contains(key.code)) return;	// not a character this script handles

	var el = document.activeElement;
	if (el.nodeName.toLowerCase() !== 'textarea') return;	// not in a textarea
	if (el.name == 'comment') return;	// not an edit entry box

	// All systems go!
	var start = el.selectionStart,
		end = el.selectionEnd,
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
					inputArr[row] = inputArr[row].replace(/ {4}/g,'\t');
					inputArr[row] = (e.shiftKey) ? inputArr[row].replace(/^\t/,'') : '\t' + inputArr[row];
					pos+=inputArr[row].length + 1;
				}
				end = --pos;
				el.value = inputArr.join('\n');
				el.setSelectionRange(start, end);

			// else selection does not span multiple line.
			// If not shift key, simply insert a tab and advance the cursor.
			} else if (!e.shiftKey) {
				el.value = el.value.substring(0, start)
					+ '\t'
					+ el.value.substring(end);
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
					var indentLevel = inputArr[row].match(/^\s+/) || [''],
						indentLevel = indentLevel[0].length,
						tempCursor = cursorInPos - indentLevel,
						tabStop = !(tempCursor % 4);
				}

				// If cursor was not moved, outdent.
				if (!cursorMoved) {
					if (/\s/.test(inputArr[row].substr(cursorInPos, 1))) start++;
					inputArr[row] = inputArr[row].replace(/ {4}/g,function(){start-=3;return '\t'});
					inputArr[row] = inputArr[row].replace(/^\t/,function(){if (start > pos) start--;return ''});
					el.value = inputArr.join('\n');
				}
				el.setSelectionRange(start, start);
			}

		break;

		case key.enter:

			e.preventDefault();

			// ctrl+Enter to submit
			if (e.ctrlKey) {
				do { var parent = el.parentNode; } while (parent && parent.nodeName.toLowerCase() !== 'form');
				return parent.submit();
			}

			// unify indentation of previous line as tabs
			inputArr[row] = inputArr[row].replace(/ {4}/g,function(){start-=3;return '\t'});
			var indent = inputArr[row].match(/^\t+/) || [''], indent = indent[0];
			el.value = el.value.substring(0, start)
				+ '\n' + indent
				+ el.value.substring(end);
			start+=indent.length+1;
			el.setSelectionRange(start, start);

		break;

		case key.home:

			var cursorInPos = start - pos, newStart = start, cursorMoved;

			// If not double-pressed and line is wrapped, allow default behavior
			if (start > el.cols && history[0] !== key.home) return;
			if (history[0] == history[1]) history[1] = 0;

			e.preventDefault();

			// If cursor is in the whitespace at the beginning of the line, advance to text
			while (cursorInPos < inputArr[row].length && /\s/.test(inputArr[row].substr(cursorInPos, 1))) {
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
			if (inputArr[row].length <= el.cols || history[0] !== key.end) return;
			if (history[0] == history[1]) history[1] = 0;

			e.preventDefault();

			var newEnd = pos + inputArr[row].length;

			// select to next \n
			if (e.shiftKey) el.setSelectionRange(start, newEnd);
			else el.setSelectionRange(newEnd, newEnd);

		break;

	}	// end switch(key.code)
}	// end fixTabs()

var pre = document.getElementsByTagName('pre'),
	history = [0,0];
for (var i=0; i<pre.length; i++) {
    pre[i].addEventListener('dblclick', selectAll, true);
    pre[i].title = 'double-click to select all';
}

addEventListener('keydown', fixTabs, true);
