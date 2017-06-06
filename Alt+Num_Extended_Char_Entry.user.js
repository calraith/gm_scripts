// ==UserScript==
// @name        Alt+Num Extended Char Entry
// @namespace   https://stackapps.org/
// @description Alt+numbers for extended characters; Alt+x convert hex value preceding caret to Unicode
// @match       *://*/*
// @version     1.3.4
// @grant       none
// @downloadURL https://github.com/calraith/gm_scripts/raw/master/Alt+Num_Extended_Char_Entry.user.js
// @run-at      document-end
// ==/UserScript==

/* =================================================================================
 * For a full explanation of this script, see https://superuser.com/a/1216294/204705
 * ================================================================================= */

if (self != top) return; // only run in parent window

var codepage = 0; // Leave 0 to attempt autodetect, or specify with "var codepage = 437" or similar.

// If you're curious about the source of these lists, I used a PowerShell command similar
// to the following: (new-object System.Globalization.CultureInfo($locale)).TextInfo.OEMCodePage (or MacCodePage)
// with language tags from the MS-LCID reference at https://msdn.microsoft.com/en-us/library/cc233965.aspx
var OEMCodePages = {'437':['ha-latn-gh','ha-latn-ne','ngo','ngo-gn','swc','swc-cd','sw-tz','sw-ug','yo-bj','yue',
	'yue-hk','en','sw','iu','fil','ha','yo','ig','haw','rw','en-us','sw-ke','fil-ph','ha-latn-ng','yo-ng','ig-ng',
	'haw-us','rw-rw','iu-latn-ca','en-za','en-zw','en-ph','en-in','en-my','en-sg','iu-latn','ha-latn'],'720':[
	'ar-001','ar-dj','ar-er','ar-il','ar-km','ar-mr','ar-ps','ar-sd','ar-so','ar-ss','ar-td','fa-af','ar','ur',
	'fa','sd','ug','prs','ku','ar-sa','ur-pk','fa-ir','ug-cn','prs-af','ku-arab-iq','ar-iq','ur-in','pa-arab-pk',
	'sd-arab-pk','qps-plocm','ar-eg','ar-ly','ar-dz','ar-ma','ar-tn','ar-om','ar-ye','ar-sy','ar-jo','ar-lb',
	'ar-kw','ar-ae','ar-bh','ar-qa','pa-arab','sd-arab','ku-arab'],'737':['el-cy','el','el-gr'],'775':['et','lv',
	'lt','et-ee','lv-lv','lt-lt'],'852':['sq-mk','cs','hu','pl','ro','sk','sq','sl','tk','cs-cz','hu-hu','pl-pl',
	'ro-ro','hr-hr','sk-sk','sq-al','sl-si','tk-tm','qps-ploc','ro-md','sr-latn-cs','hr-ba','bs-latn-ba',
	'sr-latn-ba','sr-latn-rs','sr-latn-me','bs-latn','sr-latn','bs','sr'],'855':['sr-cyrl-cs','sr-cyrl-ba',
	'bs-cyrl-ba','sr-cyrl-rs','sr-cyrl-me','bs-cyrl','sr-cyrl'],'857':['tr-cy','tr','az','uz','tr-tr',
	'az-latn-az','uz-latn-uz','az-latn','uz-latn'],'862':['he','he-il'],'866':['ru-by','ru-kg','ru-kz','ru-ua',
	'bg','ru','uk','be','tg','mk','ky','tt','mn','ba','sah','bg-bg','ru-ru','uk-ua','be-by','tg-cyrl-tj','mk-mk',
	'ky-kg','tt-ru','mn-mn','ba-ru','sah-ru','ru-md','az-cyrl-az','uz-cyrl-uz','az-cyrl','uz-cyrl','mn-cyrl',
	'tg-cyrl'],'874':['th','th-th'],'932':['ja','ja-jp','qps-ploca'],'936':['zh-hans','zh-cn','zh-sg','zh'],
	'949':['ko','ko-kr'],'950':['zh-tw','zh-hk','zh-mo','zh-hant'],'1258':['vi','vi-vn']};

var MacCodePages = {'10001':['ja','ja-jp','qps-ploca'],'10081':['tr','az','tr-tr','az-latn-az','az-latn','tr-cy'],
	'10008':['zh-hans','zh-cn','zh-sg','zh'],'10006':['el','el-gr','el-cy'],'10079':['is','fo','is-is','fo-fo'],
	'10007':['bg','ru','be','tg','mk','ky','tt','mn','ba','sah','bg-bg','ru-ru','be-by','tg-cyrl-tj','mk-mk',
	'ky-kg','tt-ru','mn-mn','ba-ru','sah-ru','az-cyrl-az','uz-cyrl-uz','sr-cyrl-cs','sr-cyrl-ba','sr-cyrl-rs',
	'sr-cyrl-me','sr-cyrl','az-cyrl','uz-cyrl','mn-cyrl','tg-cyrl'],'10004':['ar','ur','fa','sd','ug','prs','ku',
	'ar-sa','ur-pk','fa-ir','ug-cn','prs-af','ku-arab-iq','ar-iq','pa-arab-pk','sd-arab-pk','qps-plocm','ar-eg',
	'ar-ly','ar-dz','ar-ma','ar-tn','ar-om','ar-ye','ar-sy','ar-jo','ar-lb','ar-kw','ar-ae','ar-bh','ar-qa',
	'pa-arab','sd-arab','ku-arab','ar-001','ar-dj','ar-er','ar-il','ar-km','ar-mr','ar-ps','ar-sd','ar-so',
	'ar-ss','ar-td','fa-af'],'10003':['ko','ko-kr'],'10005':['he','he-il'],'10029':['cs','hu','pl','ro','sk','sq',
	'sl','et','lv','lt','tk','uz','cs-cz','hu-hu','pl-pl','ro-ro','sk-sk','sq-al','sl-si','et-ee','lv-lv','lt-lt',
	'tk-tm','uz-latn-uz','qps-ploc','sr-latn-cs','sr-latn-rs','sr-latn-me','sr-latn','sr','uz-latn','sq-mk'],
	'10002':['zh-tw','zh-hk','zh-mo','zh-hant'],'10021':['th','th-th'],'10082':['hr-hr','hr-ba','bs-latn-ba',
	'sr-latn-ba','bs-cyrl-ba','bs-cyrl','bs-latn','bs'],'10017':['uk','uk-ua']};

// default codepage to that which contains the greatest number of locales per platform to reduce table sizes
var cp = /mac/i.test(navigator.platform) ? { t: MacCodePages, d: 10000 } : { t: OEMCodePages, d: 850 };

if (!codepage) codepage = Object.keys(cp.t).filter(function(key) {
	return cp.t[key].indexOf(navigator.language.toLowerCase()) > -1;
}) * 1 || cp.d;

// holds a list of number keys pressed while alt is held down
var combo = [],
	clicked; // Chrome failsafe

addEventListener('keyup', safeSimulateNumPad);
addEventListener('keydown', safeSimulateWordAltX);
addEventListener('load', iFramesToo);

function iFramesToo() {
	var iframes = document.getElementsByTagName('iframe');
	for (var i=iframes.length; i--;) {
		// try-catch block to avoid cross domain errors halting execution
		try {
			if (iframes[i].contentWindow) {
				iframes[i].contentWindow.addEventListener('keyup', safeSimulateNumPad);
				iframes[i].contentWindow.addEventListener('keydown', safeSimulateWordAltX);
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
		script.src = 'https://cdn.rawgit.com/SheetJS/js-codepage/14644b57/' + src;

		document.getElementsByTagName('HEAD')[0].appendChild(script);
		console.log('Alt+Num_Extended_Char_Entry: ' + src + ' ready');
	}
	catch(err) {
		console.log(err.message);
		if (codepage == cp.d)
			console.log('OEM codepage ' + codepage + ' translations unavailable.  Well, crap.');
		else {
			console.log('OEM codepage ' + codepage + ' translations unavailable.  Defaulting to ' + cp.d + '.');
			init({src: ["bits/" + cp.d + ".js"], idx: 0});
		}
	}
}
init({src: ["bits/" + codepage + ".js"], idx: 0});

function safeSimulateNumPad(e) {
	try { simulateNumPad(e); }
	catch(err) { console.log(err.message); }
}

function safeSimulateWordAltX(e) {
	try { simulateWordAltX(e); }
	catch(err) { console.log(err.message); }
}

function simulateWordAltX(e) {
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

		// 88 = x
		if (e.keyCode == 88) {
			doThatUnicodeThing({el: el, start: start, end: end});
		}

	}
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
		symbol = (combo[0] && (combo.join('') * 1 <= 31) && cptable[codepage].dec[1] == "\u0001") ?
			"0☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼".substr(combo.join('') * 1, 1) : (
			(combo[0] && (combo.join('') * 1 <= 255)) ?
			cptable[codepage].dec[combo.join('')] : String.fromCharCode(combo.join('')));

		console.log('Alt+' + combo.join('') + ' symbol: ' + symbol);

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
			if (!sel.rangeCount) sel = clicked.ownerDocument.defaultView.getSelection();

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
}

function doThatUnicodeThing(args) {
	// args == {el: focused element, start: selection start, end: selection end}
	var rxp = /((0x|\\?[xuU]\+?)?([0-9a-fA-F]{2,5}))$/;

	if (args.el.setSelectionRange) {

		// input, textarea
		if (rxp.test(args.el.value.substring(0,args.start))) {

			var symbol = String.fromCharCode('0x' + RegExp.$3),
				val = args.el.value.substring(0, args.start),
				newval = val.replace(rxp, symbol),
				start = args.start - (val.length - newval.length);

			console.log(RegExp.$1 + ' symbol: ' + symbol);
			args.el.value = newval + args.el.value.substring(args.end);
			args.el.setSelectionRange(start, start);
			combo = [];
		}
	} else {

		// contentEditable node
		var sel = args.el.ownerDocument.defaultView.getSelection(),
			range;

		// hack for Chrome
		if (!sel.rangeCount) sel = clicked.ownerDocument.defaultView.getSelection();

		// extend selection backward until selection is 7 chars long, unless at BOF
		var i=0; while (i++ < 7 && sel.toString().length <= 7) sel.modify("extend", "backward", "character");

		// limit regex test to 7 characters behind the text caret
		var contents = sel.toString();

		if (rxp.test(contents)) {

			var symbol = String.fromCharCode('0x' + RegExp.$3);
			console.log(RegExp.$1 + ' symbol: ' + symbol);

			// replace regex match with symbol
			sel.collapseToEnd();
			for (var i = RegExp.$1.length; i--;) sel.modify("extend", "backward", "character");

			range = sel.getRangeAt(0);
			range.deleteContents();
			range.insertNode(document.createTextNode(symbol));
			combo = [];
		}

		sel.collapseToEnd();
	}
}
