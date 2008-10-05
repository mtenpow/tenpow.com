/*
if(window.addEventListener)window.addEventListener('load',textShadows,false);
else if(window.attachEvent)window.attachEvent('onload',textShadows);
*/
function setStyles(o,s){
	var i;
	s=s.split(';');
	for(i in s){
		var p=s[i].split(':');
		o.style[p[0]]=p[1];
	}
}
function textShadows(){
	var ua=navigator.userAgent;
	if(ua.indexOf('KHTML')>=0&&!(ua.indexOf('Safari')>=0))return;
	var ss=document.styleSheets,a;
	for(a in ss){
		var theRules=[],b;
		if(ss[a].cssRules)theRules=ss[a].cssRules;
		else if(ss[a].rules)theRules=ss[a].rules;
		for(b in theRules){
			var selector=theRules[b].selectorText,r=theRules[b].style.cssText;
			if(/text-shadow/.test(r)){
				r=r.replace(/([ ,]) /g,'$1').replace(/.*text-shadow[ :]+/,'').replace(/[ ]*;.*/,'');
				var shadows=r.split(','),k,els=cssQuery(selector),l;
				for(l in els){
					var x=parseInt(els[l].offsetLeft),y=parseInt(els[l].offsetTop),el3=els[l].cloneNode(true);
					setStyles(el3,'position:absolute;zIndex:50;margin:0');
					for(k in shadows){
						var parts=shadows[k].split(' ');
						var newX=x+parseInt(parts[1]),newY=y+parseInt(parts[2]),rad=parseInt(parts[3]);
						for(m=0-rad;m<=rad;++m)for(n=0-rad;n<=rad;++n)showShadow(els[l],newX+m,newY+n,parts[0]);
						var el2=el3.cloneNode(true);
						setStyles(el2,'left:'+x+'px;top:'+y+'px');
						els[l].parentNode.appendChild(el2);
					}
				}
			}
		}
	}
}
function showShadow(el,x,y,color){
	var el2=el.cloneNode(true);
	setStyles(el2,'position:absolute;color:'+color+';left:'+x+'px;top:'+y+'px;margin:0;textShadow:none;zIndex:49');
	el2.style.opacity='.08';
	el2.style.filter='alpha(opacity=8)';
	el.parentNode.appendChild(el2);
}



/*
	This work is licensed under a Creative Commons License.

	License: http://creativecommons.org/licenses/by/1.0/

	You are free:

	to copy, distribute, display, and perform the work
	to make derivative works
	to make commercial use of the work

	Under the following conditions:

	Attribution. You must give the original author credit

	Author:  Dean Edwards/2004
	Web:     http://dean.edwards.name/
*/

/* keeping code tidy! */

/* extendible css query function for common platforms

			tested on IE5.0/5.5/6.0, Mozilla 1.6/Firefox 0.8, Opera 7.23/7.5
			(all windows platforms - somebody buy me a mac!)
*/

// -----------------------------------------------------------------------
//  css query engine
// -----------------------------------------------------------------------

var cssQuery=function() {
	var version="1.0.1"; // timestamp: 2004/05/25

	// constants
	var STANDARD_SELECT=/^[^>\+~\s]/;
	var STREAM=/[\s>\+~:@#\.]|[^\s>\+~:@#\.]+/g;
	var NAMESPACE=/\|/;
	var IMPLIED_SELECTOR=/([\s>\+~\,]|^)([\.:#@])/g;
	var ASTERISK ="$1*$2";
	var WHITESPACE=/^\s+|\s*([\+\,>\s;:])\s*|\s+$/g;
	var TRIM="$1";
	var NODE_ELEMENT=1;
	var NODE_TEXT=3;
	var NODE_DOCUMENT=9;

	// sniff for explorer (cos of one little bug)
	var isMSIE=/MSIE/.test(navigator.appVersion), isXML;

	// cache results for faster processing
	var cssCache={};

	// this is the query function
	function cssQuery(selector, from) {
		if (!selector) return [];
		var useCache=arguments.callee.caching && !from;
		from=(from) ? (from.constructor == Array) ? from : [from] : [document];
		isXML=checkXML(from[0]);
		// process comma separated selectors
		var selectors=parseSelector(selector).split(",");
		var match=[];
		for (var i in selectors) {
			// convert the selector to a stream
			selector=toStream(selectors[i]);
			// process the stream
			var j=0, token, filter, cacheSelector="", filtered=from;
			while (j < selector.length) {
				token=selector[j++];
				filter=selector[j++];
				cacheSelector += token + filter;
				// process a token/filter pair
				filtered=(useCache && cssCache[cacheSelector]) ? cssCache[cacheSelector] : select(filtered, token, filter);
				if (useCache) cssCache[cacheSelector]=filtered;
			}
			match=match.concat(filtered);
		}
		// return the filtered selection
		return match;
	};
	cssQuery.caching=false;
	cssQuery.reset=function() {
		cssCache={};
	};
	cssQuery.toString=function () {
		return "function cssQuery() {\n  [version " + version + "]\n}";
	};

	var checkXML=(isMSIE) ? function(node) {
		if (node.nodeType != NODE_DOCUMENT) node=node.document;
		return node.mimeType == "XML Document";
	} : function(node) {
		if (node.nodeType == NODE_DOCUMENT) node=node.documentElement;
		return node.localName != "HTML";
	};

	function parseSelector(selector) {
		return selector
		// trim whitespace
		.replace(WHITESPACE, TRIM)
		// encode attribute selectors
		.replace(attributeSelector.ALL, attributeSelector.ID)
		// e.g. ".class1" --> "*.class1"
		.replace(IMPLIED_SELECTOR, ASTERISK);
	};

	// convert css selectors to a stream of tokens and filters
	//  it's not a real stream. it's just an array of strings.
	function toStream(selector) {
		if (STANDARD_SELECT.test(selector)) selector=" " + selector;
		return selector.match(STREAM) || [];
	};

	var pseudoClasses={ // static
		// CSS1
		"link": function(element) {
			for (var i=0; i < document.links; i++) {
				if (document.links[i] == element) return true;
			}
		},
		"visited": function(element) {
			// can't do this without jiggery-pokery
		},
		// CSS2
		"first-child": function(element) {
			return !previousElement(element);
		},
		// CSS3
		"last-child": function(element) {
			return !nextElement(element);
		},
		"root": function(element) {
			var document=element.ownerDocument || element.document;
			return Boolean(element == document.documentElement);
		},
		"empty": function(element) {
			for (var i=0; i < element.childNodes.length; i++) {
				if (isElement(element.childNodes[i]) || element.childNodes[i].nodeType == NODE_TEXT) return false;
			}
			return true;
		}
		// add your own...
	};

	var QUOTED=/([\'\"])[^\1]*\1/;
	function quote(value) {return (QUOTED.test(value)) ? value : "'" + value + "'"};
	function unquote(value) {return (QUOTED.test(value)) ? value.slice(1, -1) : value};

	var attributeSelectors=[];

	function attributeSelector(attribute, compare, value) {
		// properties
		this.id=attributeSelectors.length;
		// build the test expression
		var test="element.";
		switch (attribute.toLowerCase()) {
			case "id":
				test += "id";
				break;
			case "class":
				test += "className";
				break;
			default:
				test += "getAttribute('" + attribute + "')";
		}
		// continue building the test expression
		switch (compare) {
			case "=":
				test += "==" + quote(value);
				break;
			case "~=":
				test="/(^|\\s)" + unquote(value) + "(\\s|$)/.test(" + test + ")";
				break;
			case "|=":
				test="/(^|-)" + unquote(value) + "(-|$)/.test(" + test + ")";
				break;
		}
		push(attributeSelectors, new Function("element", "return " + test));
	};
	attributeSelector.prototype.toString=function() {
		return attributeSelector.PREFIX + this.id;
	};
	// constants
	attributeSelector.PREFIX="@";
	attributeSelector.ALL=/\[([^~|=\]]+)([~|]?=?)([^\]]+)?\]/g;
	// class methods
	attributeSelector.ID=function(match, attribute, compare, value) {
		return new attributeSelector(attribute, compare, value);
	};

	// select a set of matching elements.
	// "from" is an array of elements.
	// "token" is a character representing the type of filter
	//  e.g. ">" means child selector
	// "filter" represents the tag name, id or class name that is being selected
	// the function returns an array of matching elements
	function select(from, token, filter) {
		//alert("token="+token+",filter="+filter);
		var namespace="";
		if (NAMESPACE.test(filter)) {
			filter=filter.split("|");
			namespace=filter[0];
			filter=filter[1];
		}
		var filtered=[], i;
		switch (token) {
			case " ": // descendant
				for (i in from) {
					var subset=getElementsByTagNameNS(from[i], filter, namespace);
					for (var j=0; j < subset.length; j++) {
						if (isElement(subset[j]) && (!namespace || compareNamespace(subset[j], namespace)))
							push(filtered, subset[j]);
					}
				}
				break;
			case ">": // child
				for (i in from) {
					var subset=from[i].childNodes;
					for (var j=0; j < subset.length; j++)
						if (compareTagName(subset[j], filter, namespace)) push(filtered, subset[j]);
				}
				break;
			case "+": // adjacent (direct)
				for (i in from) {
					var adjacent=nextElement(from[i]);
					if (adjacent && compareTagName(adjacent, filter, namespace)) push(filtered, adjacent);
				}
				break;
			case "~": // adjacent (indirect)
				for (i in from) {
					var adjacent=from[i];
					while (adjacent=nextElement(adjacent)) {
						if (adjacent && compareTagName(adjacent, filter, namespace)) push(filtered, adjacent);
					}
				}
				break;
			case ".": // class
				filter=new RegExp("(^|\\s)" + filter + "(\\s|$)");
				for (i in from) if (filter.test(from[i].className)) push(filtered, from[i]);
				break;
			case "#": // id
				for (i in from) if (from[i].id == filter) push(filtered, from[i]);
				break;
			case "@": // attribute selector
				filter=attributeSelectors[filter];
				for (i in from) if (filter(from[i])) push(filtered, from[i]);
				break;
			case ":": // pseudo-class (static)
				filter=pseudoClasses[filter];
				for (i in from) if (filter(from[i])) push(filtered, from[i]);
				break;
		}
		return filtered;
	};

	var getElementsByTagNameNS=(isMSIE) ? function(from, tagName) {
		return (tagName == "*" && from.all) ? from.all : from.getElementsByTagName(tagName);
	} : function(from, tagName, namespace) {
		return (namespace) ? from.getElementsByTagNameNS("*", tagName) : from.getElementsByTagName(tagName);
	};

	function compareTagName(element, tagName, namespace) {
		if (namespace && !compareNamespace(element, namespace)) return false;
		return (tagName == "*") ? isElement(element) : (isXML) ? (element.tagName == tagName) : (element.tagName == tagName.toUpperCase());
	};

	var PREFIX=(isMSIE) ? "scopeName" : "prefix";
	function compareNamespace(element, namespace) {
		return element[PREFIX] == namespace;
	};

	// return the previous element to the supplied element
	//  previousSibling is not good enough as it might return a text or comment node
	function previousElement(element) {
		while ((element=element.previousSibling) && !isElement(element)) continue;
		return element;
	};

	// return the next element to the supplied element
	function nextElement(element) {
		while ((element=element.nextSibling) && !isElement(element)) continue;
		return element;
	};

	function isElement(node) {
		return Boolean(node.nodeType == NODE_ELEMENT && node.tagName != "!");
	};


	// use a baby push function because IE5.0 doesn't support Array.push
	function push(array, item) {
		array[array.length]=item;
	};

	// fix IE5.0 String.replace
	if ("i".replace(/i/,function(){return""})) {
		// preserve String.replace
		var string_replace=String.prototype.replace;
		// create String.replace for handling functions
		var function_replace=function(regexp, replacement) {
			var match, newString="", string=this;
			while ((match=regexp.exec(string))) {
				// five string replacement arguments is sufficent for cssQuery
				newString += string.slice(0, match.index) + replacement(match[0], match[1], match[2], match[3], match[4]);
				string=string.slice(match.lastIndex);
			}
			return newString + string;
		};
		// replace String.replace
		String.prototype.replace=function (regexp, replacement) {
			this.replace=(typeof replacement == "function") ? function_replace : string_replace;
			return this.replace(regexp, replacement);
		};
	}

	return cssQuery;
}();
textShadows();
