// ==UserScript==
// @name        Alt+Num Extended Char Entry
// @namespace   https://stackapps.org/
// @description hold Alt while pressing numbers to make extended characters
// @match       *://*/*
// @version     1.2.2
// @grant       none
// @downloadURL https://github.com/calraith/gm_scripts/raw/master/Alt+Num_Extended_Char_Entry.user.js
// @run-at      document-end
// ==/UserScript==

if (self != top) return; // only run in parent window

var codepage = 0; // Leave 0 to attempt autodetect, or specify with "var codepage = 437" or similar.

// If you're curious about the source of this list, I used a PowerShell command similar
// to the following: (new-object System.Globalization.CultureInfo($locale)).TextInfo.OEMCodePage
// with language tags from the MS-LCID reference at https://msdn.microsoft.com/en-us/library/cc233965.aspx
if (!codepage) codepage = {'ar':720,'bg':866,'ca':850,'zh-hans':936,'cs':852,'da':850,'de':850,'el':737,'en':437,
	'es':850,'fi':850,'fr':850,'he':862,'hu':852,'is':850,'it':850,'ja':932,'ko':949,'nl':850,'no':850,'pl':852,
	'pt':850,'ro':852,'ru':866,'sk':852,'sq':852,'sv':850,'th':874,'tr':857,'ur':720,'id':850,'uk':866,'be':866,
	'sl':852,'et':775,'lv':775,'lt':775,'fa':720,'vi':1258,'hy':1,'az':857,'eu':850,'mk':866,'af':850,'ka':1,
	'fo':850,'hi':1,'ms':850,'kk':866,'ky':866,'sw':437,'uz':857,'tt':866,'pa':1,'gu':1,'ta':1,'te':1,'kn':1,
	'mr':1,'sa':1,'mn':866,'gl':850,'kok':1,'syr':1,'dv':1,'ar-sa':720,'bg-bg':866,'ca-es':850,'zh-tw':950,
	'cs-cz':852,'da-dk':850,'de-de':850,'el-gr':737,'en-us':437,'es-es_tradnl':850,'fi-fi':850,'fr-fr':850,
	'he-il':862,'hu-hu':852,'is-is':850,'it-it':850,'ja-jp':932,'ko-kr':949,'nl-nl':850,'nb-no':850,'pl-pl':852,
	'pt-br':850,'rm-ch':850,'ro-ro':852,'ru-ru':866,'hr-hr':852,'sk-sk':852,'sq-al':852,'sv-se':850,'th-th':874,
	'tr-tr':857,'ur-pk':720,'id-id':850,'uk-ua':866,'be-by':866,'sl-si':852,'et-ee':775,'lv-lv':775,'lt-lt':775,
	'tg-cyrl-tj':866,'fa-ir':720,'vi-vn':1258,'hy-am':1,'az-latn-az':857,'eu-es':850,'hsb-de':850,'mk-mk':866,
	'tn-za':850,'xh-za':850,'zu-za':850,'af-za':850,'ka-ge':1,'fo-fo':850,'hi-in':1,'mt-mt':1,'se-no':850,
	'ms-my':850,'kk-kz':866,'ky-kg':866,'sw-ke':437,'tk-tm':852,'uz-latn-uz':857,'tt-ru':866,'bn-in':1,'pa-in':1,
	'gu-in':1,'or-in':1,'ta-in':1,'te-in':1,'kn-in':1,'ml-in':1,'as-in':1,'mr-in':1,'sa-in':1,'mn-mn':866,
	'bo-cn':1,'cy-gb':850,'km-kh':1,'lo-la':1,'gl-es':850,'kok-in':1,'syr-sy':1,'si-lk':1,'iu-cans-ca':1,
	'am-et':1,'ne-np':1,'fy-nl':850,'ps-af':1,'fil-ph':437,'dv-mv':1,'ha-latn-ng':437,'yo-ng':437,'quz-bo':850,
	'nso-za':850,'ba-ru':866,'lb-lu':850,'kl-gl':850,'ig-ng':437,'ii-cn':1,'arn-cl':850,'moh-ca':850,'br-fr':850,
	'ug-cn':720,'mi-nz':1,'oc-fr':850,'co-fr':850,'gsw-fr':850,'sah-ru':866,'qut-gt':850,'rw-rw':437,'wo-sn':850,
	'prs-af':720,'gd-gb':850,'ar-iq':720,'zh-cn':936,'de-ch':850,'en-gb':850,'es-mx':850,'fr-be':850,'it-ch':850,
	'nl-be':850,'nn-no':850,'pt-pt':850,'sr-latn-cs':852,'sv-fi':850,'az-cyrl-az':866,'dsb-de':850,'se-se':850,
	'ga-ie':850,'ms-bn':850,'uz-cyrl-uz':866,'bn-bd':1,'mn-mong-cn':1,'iu-latn-ca':437,'tzm-latn-dz':850,
	'quz-ec':850,'ar-eg':720,'zh-hk':950,'de-at':850,'en-au':850,'es-es':850,'fr-ca':850,'sr-cyrl-cs':855,
	'se-fi':850,'quz-pe':850,'ar-ly':720,'zh-sg':936,'de-lu':850,'en-ca':850,'es-gt':850,'fr-ch':850,'hr-ba':852,
	'smj-no':850,'ar-dz':720,'zh-mo':950,'de-li':850,'en-nz':850,'es-cr':850,'fr-lu':850,'bs-latn-ba':852,
	'smj-se':850,'ar-ma':720,'en-ie':850,'es-pa':850,'fr-mc':850,'sr-latn-ba':852,'sma-no':850,'ar-tn':720,
	'en-za':437,'es-do':850,'sr-cyrl-ba':855,'sma-se':850,'ar-om':720,'en-jm':850,'es-ve':850,'bs-cyrl-ba':855,
	'sms-fi':850,'ar-ye':720,'en-029':850,'es-co':850,'sr-latn-rs':852,'smn-fi':850,'ar-sy':720,'en-bz':850,
	'es-pe':850,'sr-cyrl-rs':855,'ar-jo':720,'en-tt':850,'es-ar':850,'sr-latn-me':852,'ar-lb':720,'en-zw':437,
	'es-ec':850,'sr-cyrl-me':855,'ar-kw':720,'en-ph':437,'es-cl':850,'ar-ae':720,'es-uy':850,'ar-bh':720,
	'es-py':850,'ar-qa':720,'en-in':437,'es-bo':850,'en-my':437,'es-sv':850,'en-sg':437,'es-hn':850,'es-ni':850,
	'es-pr':850,'es-us':850,'zh-hant':950,'sr':855}[navigator.language.toLowerCase()] || 437; // (default en-US)

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
		script.src = 'https://cdn.rawgit.com/SheetJS/js-codepage/14644b57/' + src;

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
