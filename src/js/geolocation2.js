//import "../css/style.css"; /* extract the styles to a external css bundle */
//import * as styles from "oswc2_styles/oswc2_styles.css"; /* import the styles as a string */
//import {styles} from '../css/style.css' assert { type: "css" }; /* import the styles as a CSSStyleSheet */

import { html } from "./geo/html.js";
html();

import { geoLoc } from './geo/geoLoc.js';
setTimeout(geoLoc(), 100);

import { fromDB } from './geo/fromDB.js';
setTimeout(fromDB(), 1000);

// reread data from db with regions or city data of executors or customers from city of localstorage

/* <!-- js for esc on modal (in Home part of site that based on PicnicCSS) --> */
document.onkeydown = function (event) {
    if (event.key == "Escape") {
        var mods = document.querySelectorAll('.modal > [type=checkbox]');
        [].forEach.call(mods, function (mod) { mod.checked = false; });
    }
}
