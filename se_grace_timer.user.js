// ==UserScript==
// @name        SE realtime dates
// @namespace   http://stackapps.com/
// @description show Stack Exchange timestamps as realtime counters
// @include     /^https?:\/\/(\w+\.)?(stack(overflow|exchange|apps)|serverfault|superuser|askubuntu|onstartups|mathoverflow|mso)\.com\/.+/
// @version     1
// @downloadURL	https://github.com/calraith/gm_scripts/raw/master/se_grace_timer.user.js
// @grant       none
// ==/UserScript==

function setIntervalWithContext(code, delay, context) {
    return setInterval(function() {
        code.call(context);
    }, delay);
}

function startTimer(el) {
    if (!el.title) return;
    this.el = el;
    this.interval = setIntervalWithContext(function() {
        if (!this.el) return clearInterval(this.interval);
        var x = (new Date() - new Date(this.el.title.replace(' ','T'))) / 1000;
        if (x>299&&x<360) this.el.innerHTML = '5 mins ago';
        if (isNaN(x) || x > 299) return clearInterval(this.interval);
        var m = Math.floor(x / 60) % 60,
            s = Math.floor(x % 60),
            s = (s < 10) ? '0' + s : s;
        this.el.innerHTML = m+':'+s+' ago';
    }, 250, this);
    timers.push(this.interval);
}

function addTimers() {
    while (timers.length) clearInterval(timers.pop());
    var timestamps = document.getElementsByClassName('relativetime');
    for (var i=0; i<timestamps.length; i++) {
        var stopwatch = new startTimer(timestamps[i]);
    }
}

var timers = [];
addTimers();
addEventListener('click', function() { setTimeout(addTimers, 1000) }, true);