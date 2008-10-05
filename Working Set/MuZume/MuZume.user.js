// ==UserScript==
// @name          MuZume
// @namespace     http://www.muzume.com
// @description   MuZume web utility 2.0
// @include       *
// ==/UserScript==
if(window.MuZumePublicInterface && window.MuZumePublicInterface.IsInitialized()){
	MuZumePublicInterface.Open();
}
else
{
var mzse=document.createElement('SCRIPT');
mzse.src='http://www.tenpow.com/MuZume/MuZume.js';
var w = typeof(unsafeWindow) != "undefined" ? unsafeWindow : window;
w.__muzume__background = true;
document.documentElement.appendChild(mzse);
}
