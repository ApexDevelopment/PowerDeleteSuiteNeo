// ==UserScript==
// @name         Power Delete Suite
// @namespace    pds
// @version      1
// @description  Add a power delete suite button to the reddit overview page.
// @author       ObiDriftKenobi
// @match        https://old.reddit.com/user/*/overview
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    fetch("https://raw.githubusercontent.com/j0be/PowerDeleteSuite/master/bookmarklet.js").then(response => response.text()).then(scr => {
        const ul = document.querySelector("#header-bottom-right > ul.flat-list");
        const sep = ul.nextSibling;
        sep.parentNode.insertBefore(sep.cloneNode(true), sep.nextSibling);
        const a = document.createElement('a');
        a.id = 'pd-delete';
        a.href = scr.trim();
        a.textContent = 'PDS';
        sep.parentNode.insertBefore(a, sep.nextSibling);
    });
})();