var IS_WEBKIT = navigator.userAgent.indexOf("WebKit") != -1;
var IS_IE = navigator.userAgent.indexOf("MSIE") != -1;
var DEBUG = true;
var INVOKE_DEBUGGER;
if(INVOKE_DEBUGGER = DEBUG && (window.location.href.indexOf("?DebugMuZume")!=-1))
{
    if(confirm("Would you like to debug?")) {
        eval("debugger");
    }
}

if(!console)
{
    var _console = console;
    var void_f = function(){};
    var console = {
        log:function(a,b,c,d,e,f,g)
        {
            //_console.log(a,b,c,d,e,f,g);
        },
        debug:function()
        {
            this.log.apply(this, arguments);
        },
        info:function()
        {
            this.log.apply(this, arguments);
        },
        error:function()
        {
            this.log.apply(this, arguments);
        },
        trace:void_f,
        assert:function(v)
        {
            if(!v)
            {
                this.error("Assertion failed " + v);
            }
        },
        assertNotNull:function(v)
        {
            return this.assert(v != null);
        },
        assertInstanceOf:function(v,t)
        {
            return this.assert(v instanceof t);
        },
        time:function(name)
        {
        },
        timeEnd:function(name)
        {
        }
    };
}

var prefix;
(function() {
    if(IS_IE) {
	return;
    }
    if (typeof(window.MuZumePublicInterface) == "undefined")
    {
		var windowProps = {};

        if(!window.hasOwnProperty)
        {
            Object.prototype.hasOwnProperty = function(property)
            {
                return property in this;
            }
        }
        else
        {        
            for(var i in window)
            {
                if(window.hasOwnProperty(i))
                {
                    windowProps[i] = true;
                }
            }
        }

		window.MuZumePublicInterface = null;	
		prefix = "http://www.tenpow.com/MuZume";
		//prefix = "http://localhost/~mtenpow";
		
        // HELPER FUNCTIONS
		
		//Defines the top level Class
        function Class() { }
        Class.prototype.__init__ = function() {};
        Class.extend = function(def) {            
            var proto = new this(Class);
            var superClass = this.prototype;
            
            var members = {};
            for (var n in def) {
                var item = def[n];                        
                if (item instanceof Function)
                {
                    if(typeof(superClass[n]) == "function")
                    {
                        item.$ = superClass[n];
                    }
                }
                proto[n] = item;
            }
            
            var classDef = function() {
                if (arguments[0] !== Class) {
                    this.$ = superClass;
                    this.__init__.apply(this, arguments);
                }
            };
            
            classDef.prototype = proto;
            
            //Give this new class the same static extend method    
            classDef.extend = this.extend;        
            return classDef;
        };
		
		Object.extend = function(destination, source) {
          for (property in source) {
            destination[property] = source[property];
          }
          return destination;
        }
		
		function $A(iterable) {
          if (!iterable) {
			  return [];
          } else {
            var results = [];
            for (var i = 0; i < iterable.length; i++)
              results.push(iterable[i]);
            return results;
          }
        }
		
		Function.prototype.bind = function() {
          var __method = this, args = $A(arguments), object = args.shift();
          return function() {
            return __method.apply(object, args.concat($A(arguments)));
          }
        };
		
		Function.prototype.bindAsEventListener = function() {
          var __method = this, args = $A(arguments), object = args.shift();
          return function(e) {
            var ret = __method.apply(object, args.concat($A(arguments)));
            if(ret == false)
            {
                return Event.stop(e);
            }
            return ret;
          }
        };
		
		Function.prototype.inherits = function(baseClass,extensions)
		{
			this.prototype = new baseClass;
            var self = this;
            this.prototype.GetClass = function()
            {
                return self;
            };
            Object.extend(this.prototype, extensions);
        }

        String.prototype.camelize = function() {
			var oStringList = this.split('-');
			if (oStringList.length == 1) return oStringList[0];
		
			var camelizedString = this.indexOf('-') == 0
			  ? oStringList[0].charAt(0).toUpperCase() + oStringList[0].substring(1)
			  : oStringList[0];
		
			for (var i = 1, len = oStringList.length; i < len; i++) {
			  var s = oStringList[i];
			  camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
			}
		
			return camelizedString;
        }
		
		function $(elm)
		{
          var elements = new Array();
        
          for (var i = 0; i < arguments.length; i++) {
            var element = arguments[i];
            if (typeof element == 'string')
              element = document.getElementById(element);
        
            if (arguments.length == 1)
              return element;
        
            elements.push(element);
          }
        
          return elements;
		}
		
        var $IDCounter = 0;
        function $ID(elm, force)
        {
			if(!elm)
			{
				return "muzume-element-" + ($IDCounter++);
			}
            var id = elm.getAttribute("id");
            if (!id || force)
            {
                id = "muzume-element-" + ($IDCounter++);
                elm.setAttribute("id", id);
            }
            return id;
        }
        
        function $IS_MUZUME_ELEMENT(elm)
        {
            var id = elm.getAttribute("id");
            if(!id)
            {
                return false;
            }
            else
            {
                return id.indexOf("muzume-element-") == 0;
            }
        }

        var bhElement = document.createElement("DIV");
        bhElement.style.display = "none";
        document.documentElement.appendChild(bhElement);
        bhElement = $ID(bhElement);

        // black hole function
        function $BH(elm)
        {
            $(bhElement).appendChild(elm);
            return elm;
        }
		
		function $ICON(name)
		{
			if(!name)
			{
				return null;
			}
			var img = document.createElement("IMG");
			img.src = prefix + "/images/icons/" + name;
			$BH(img);
			return img;
		}
		
		function $$ICON(icon)
		{
			if(!icon)
			{
				return null;
			}
			var src = icon.getAttribute("src");
			if(!src)
			{
				return null;
			}
			icon = null;
			if(src.indexOf(prefix) != 0)
			{
				return null;
			}
			src = src.substr(prefix.length);
			var m = src.match(/^\/images\/icons\/(.*)$/);
			if(m)
			{
				return m[1];
			}
			return null;
		}
		
		function friendlyDate(x)
		{
			var Modif = new Date(x.toGMTString());
			var Year = takeYear(Modif);
			var Month = Modif.getMonth();
			var Day = Modif.getDate();
			var Mod = (Date.UTC(Year,Month,Day,0,0,0))/86400000;
			x = new Date();
			var today = new Date(x.toGMTString());
			var Year2 = takeYear(today);
			var Month2 = today.getMonth();
			var Day2 = today.getDate();
			var now = (Date.UTC(Year2,Month2,Day2,0,0,0))/86400000;
			var daysago = now - Mod;
			if (daysago < 0) return '';
			var unit = 'days';
			if (daysago > 730)
			{
				daysago = Math.floor(daysago/365);
				unit = 'years';
			}
			else if (daysago > 60)
			{
				daysago = Math.floor(daysago/30);
				unit = 'months';
			}
			else if (daysago > 14)
			{
				daysago = Math.floor(daysago/7);
				unit = 'weeks'
			}
			var towrite = '';
			if (daysago == 0) towrite += 'today';
			else if (daysago == 1) towrite += 'yesterday';
			else towrite += daysago + ' ' + unit + ' ago';
			return towrite;
		}		
		
		function takeYear(theDate)
		{
			x = theDate.getYear();
			var y = x % 100;
			y += (y < 38) ? 2000 : 1900;
			return y;
		}
		
		var Element = {
			leftTopRightBottomArray:['left', 'top', 'right', 'bottom'],
			getStyle: function(element, style) {
				element = $(element);
				var value = element.style[style.camelize()];
				if (!value) {
				  if (document.defaultView && document.defaultView.getComputedStyle) {
					var css = document.defaultView.getComputedStyle(element, null);
					value = css ? css.getPropertyValue(style) : null;
				  } else if (element.currentStyle) {
					value = element.currentStyle[style.camelize()];
				  }
				}
				
				if (window.opera && style in this.leftTopRightBottomArray)
				  if (Element.getStyle(element, 'position') == 'static') value = 'auto';
				
				return value == 'auto' ? null : value;
			},
			setStyle:function(element, style) {
          		element = $(element);
          		for(k in style) element.style[k.camelize()] = style[k];
      		},
			getDimensions: function(element) {
				element = $(element);
				if (Element.getStyle(element, 'display') != 'none')
				  return {width: element.offsetWidth, height: element.offsetHeight};
			
				// All *Width and *Height properties give 0 on elements with display none,
				// so enable the element temporarily
				var els = element.style;
				var originalVisibility = els.visibility;
				var originalPosition = els.position;
				els.visibility = 'hidden';
				els.position = 'absolute';
				els.display = '';
				var originalWidth = element.clientWidth;
				var originalHeight = element.clientHeight;
				els.display = 'none';
				els.position = originalPosition;
				els.visibility = originalVisibility;
				return {width: originalWidth, height: originalHeight};
			},
			setOpacity:function(element, value){  
			  element= $(element);  
			  if (value == 1){
				Element.setStyle(element, { opacity: 
				  (/Gecko/.test(navigator.userAgent) && !/Konqueror|Safari|KHTML/.test(navigator.userAgent)) ? 
				  0.999999 : null });
				if(/MSIE/.test(navigator.userAgent))  
				  Element.setStyle(element, {filter: Element.getStyle(element,'filter').replace(/alpha\([^\)]*\)/gi,'')});  
			  } else {  
				if(value < 0.00001) value = 0;  
				Element.setStyle(element, {opacity: value});
				if(/MSIE/.test(navigator.userAgent))  
				 Element.setStyle(element, 
				   { filter: Element.getStyle(element,'filter').replace(/alpha\([^\)]*\)/gi,'') +
							 'alpha(opacity='+value*100+')' });  
			  }
			},
			getOpacity:function(element){  
			  var opacity;
			  if (opacity = Element.getStyle(element, 'opacity'))  
				return parseFloat(opacity);  
			  if (opacity = (Element.getStyle(element, 'filter') || '').match(/alpha\(opacity=(.*)\)/))  
				if(opacity[1]) return parseFloat(opacity[1]) / 100;  
			  return 1.0;  
			}
		};

        if (typeof(window.Event) == "undefined") {
          window.Event = new Object();
        }
        
        Object.extend(window.Event, {
        
          element: function(event) {
            return event.target || event.srcElement;
          },
        
          isLeftClick: function(event) {
            return (((event.which) && (event.which == 1)) ||
                    ((event.button) && (event.button == 1)));
          },
        
          pointerX: function(event) {
            return event.pageX || (event.clientX +
              (document.documentElement.scrollLeft || document.body.scrollLeft));
          },
        
          pointerY: function(event) {
            return event.pageY || (event.clientY +
              (document.documentElement.scrollTop || document.body.scrollTop));
          },
        
          stop: function(event) {
            if (event.preventDefault) {
              event.preventDefault();
              event.stopPropagation();
            } else {
              event.returnValue = false;
              event.cancelBubble = true;
            }
            return false;
          },
        
          // find the first node with the given tagName, starting from the
          // node the event was triggered on; traverses the DOM upwards
          findElement: function(event, tagName) {
            var element = Event.element(event);
            while (element.parentNode && (!element.tagName ||
                (element.tagName.toUpperCase() != tagName.toUpperCase())))
              element = element.parentNode;
            return element;
          },
        
          observers: false,
        
          _observeAndCache: function(element, name, observer, useCapture) {
            if (!this.observers) this.observers = [];
            if (element.addEventListener) {
              this.observers.push([element, name, observer, useCapture]);
              element.addEventListener(name, observer, useCapture);
            } else if (element.attachEvent) {
              this.observers.push([element, name, observer, useCapture]);
              element.attachEvent('on' + name, observer);
            }
            return this.observers.length - 1;
          },
        
          observe: function(element, name, observer, useCapture, override) {
            var element = $(element);
            useCapture = useCapture || false;
        
            if (!override && name == 'keypress' &&
                (navigator.appVersion.match(/Konqueror|Safari|KHTML/)
                || element.attachEvent))
              name = 'keydown';
        
            return this._observeAndCache(element, name, observer, useCapture);
          },
        
          stopObserving: function(element, name, observer, useCapture, override) {
            var element = $(element);
            useCapture = useCapture || false;
        
            if (!override && name == 'keypress' &&
                (navigator.appVersion.match(/Konqueror|Safari|KHTML/)
                || element.detachEvent))
              name = 'keydown';
        
            if (element.removeEventListener) {
              element.removeEventListener(name, observer, useCapture);
            } else if (element.detachEvent) {
              element.detachEvent('on' + name, observer);
            }
            
          },
          
          stopObservingByToken: function(observationToken, quiet) {
            var args = this.observers[observationToken];
            if(!args)
            {
                if(quiet)
                {
                    return;
                }
                throw new Error("Observation token does not exist.");
            }
            this.stopObserving.apply(this, args);
            this.observers.splice(observationToken, 1);
          }
        });
        
        var AsyncOperations = Class.extend({
            __init__:function()
            {
                this._connections = [];
                this._observations = [];
                this._timeouts = [];
                this._intervals = [];
                this._threads = [];
                this._intervalMap = {};
                this._timeoutMap = {};
            },
            AddConnection: function(connectionToken)
            {
                this._connections.push(connectionToken);
            },
            AddObservation: function(observationToken)
            {
                this._observations.push(observationToken);
            },
            AddTimeout: function(timeoutId)
            {
                this._timeouts.push(timeoutId);
            },
            AddInterval: function(intervalId)
            {
                this._intervals.push(intervalId);
            },
            AddThread: function(thread)
            {
                this._threads.push(thread);
            },
            
            CancelAll: function()
            {
                this.CancelConnections();
                this.CancelObservations();
                this.CancelTimeouts();
                this.CancelIntervals();
                this.CancelThreads();
            },
            CancelConnections: function()
            {
                for(var i=0;i<this._connections.length;i++)
                {
                    disconnectByToken(this._connections[i], true);
                }
                this._connections = [];
            },
            CancelObservations: function()
            {
                for(var i=0;i<this._observations.length;i++)
                {
                    Event.stopObservingByToken(this._observations[i], true);
                }
                this._observations = [];
            },
            CancelTimeouts: function()
            {
                for(var i=0;i<this._timeouts.length;i++)
                {
                    clearTimeout(this._timeouts[i]);
                }
                this._timeouts = [];
            },
            CancelIntervals: function()
            {
                for(var i=0;i<this._intervals.length;i++)
                {
                    clearInterval(this._intervals[i]);
                }
                this._intervals = [];
            },
            CancelThreads: function()
            {
                for(var i=0;i<this._threads.length;i++)
                {
                    this._threads[i].Abort();
                }
                this._threads = [];
            },
            
            SetInterval: function(f, interval, name)
            {
                if(name)
                {
                    var currentInterval;
                    if(currentInterval = this._intervalMap[name])
                    {
                        this.CancelInterval(currentInterval);
                    }
                    this._intervals.push(this._intervalMap[name] = setInterval(f, interval));
                }
                else
                {
                    this._intervals.push(setInterval(f, interval));
                }
                return this._intervals[this._intervals.length - 1];
            },
            HasInterval: function(name)
            {
                return name in this._intervalMap;
            },
            CancelInterval: function(interval)
            {
                clearInterval(interval);
                for(var i in this._intervals)
                {
                    if(this._intervals[i] == interval)
                    {
                        this._intervals.splice(i,1);
                    }
                }
                for(var i in this._intervalMap)
                {
                    if(this._intervalMap[i] == interval)
                    {
                        delete this._intervalMap[i];
                    }
                }
            },
            CancelIntervalByName:function(name, quiet)
            {
                var interval = this._intervalMap[name];
                if(!interval)
                {
                    if(quiet)
                    {
                        return;
                    }
                    throw new Error("Interval " + name + " not found.");
                }
                this.CancelInterval(interval);
            },
            TryCancelIntervalByName:function(name)
            {
                this.CancelIntervalByName(name, true);
            },
            SetTimeout: function(f, timeout, name)
            {
                if(name)
                {
                    var currentTimeout;
                    if(currentTimeout = this._timeoutMap[name])
                    {
                        this.CancelTimeout(currentTimeout);
                    }
                    this._timeouts.push(this._timeoutMap[name] = setTimeout(f, timeout));
                }
                else
                {
                    this._timeouts.push(setTimeout(f, timeout));
                }
                return this._timeouts[this._timeouts.length-1];
            },
            HasTimeout: function(name)
            {
                return name in this._timeoutMap;
            },
            CancelTimeout: function(timeout)
            {
               //console.debug("Cancelling timeout.");
                clearTimeout(timeout);
                for(var i in this._timeouts)
                {
                    if(this._timeouts[i] == timeout)
                    {
                       //console.debug("Removed timeout from list of timeouts.");
                        this._timeouts.splice(i,1);
                    }
                }
                for(var i in this._timeoutMap)
                {
                    if(this._timeoutMap[i] == timeout)
                    {
                       //console.debug("Removed name " + i + " from timeout map.");
                        delete this._timeoutMap[i];
                    }
                }
            },
            CancelTimeoutByName: function(name, quiet)
            {
                var timeout = this._timeoutMap[name];
                if(!timeout)
                {
                    if(quiet)
                    {
                        return;
                    }
                    throw new Error("Timeout " + name + " not found.");
                }
                this.CancelTimeout(timeout);
            },
            TryCancelTimeoutByName: function(name)
            {
                this.CancelTimeoutByName(name, true);
            }
        });
		
        // TODO: Fix KEYMAP and KEY_BINDINGS and make it extensible, configurable and cross-platform
        if(IS_WEBKIT)
        {
            var KEYMAP = {
              KEY_L:            76,
              KEY_BACKSPACE:    8,
              KEY_TAB:          9,
              KEY_SHIFT_TAB:    0,
              KEY_RETURN:       13,
              KEY_ENTER:        3,
              KEY_ESC:          27,
              KEY_DELETE:       46,
              KEY_SPACE:        32,
              KEY_DOT:		    190,
              KEY_ALT_SPACE:    160,
              KEY_LEFT:         37,
              KEY_UP:           38,
              KEY_RIGHT:        39,
              KEY_DOWN:         40
            };
        }
        else
        {
            var KEYMAP = {
              KEY_L:            108,
              KEY_BACKSPACE:    8,
              KEY_TAB:          9,
              KEY_RETURN:       13,
              KEY_ENTER:        3,
              KEY_ESC:          27,
              KEY_DELETE:       46,
              KEY_SPACE:        32,
              KEY_DOT:		    190,
              KEY_ALT_SPACE:    160,
              KEY_LEFT:         37,
              KEY_UP:           38,
              KEY_RIGHT:        39,
              KEY_DOWN:         40
            };
		}
		
		Object.extend(Event, KEYMAP);
		
		function registerSignals(src, signals) {
			if (!src._signals) {
				src._signals = {};
			}
	
			for (var i = 0; i < signals.length; i++) {
				var sig = signals[i];
				if (!src._signals[sig]) {
					src._signals[sig] = [];
					src._signals[sig].tokens = [];
				}
			}
		};
		
		var _connectionTokens = {};
		var _connectionTokenCounter = 0;
		function connect(src, signal, func)
		{
			if(!src._signals || !(signal in src._signals))
			{
				throw new Error("No such signal " + signal + " registered.");
			}
			var token = _connectionTokenCounter++;
			src._signals[signal].tokens.push(token);
			src._signals[signal].push(func);
			_connectionTokens[token] = [src, signal, func];
		};
		
		function connectOnce(src, signal, func)
		{
			var f = function()
			{
				func.apply(this, $A(arguments));
				disconnect(src, signal, f);
			};
			connect(src, signal, f);
		};
		
		function disconnect(src, signal, func)
		{
			if(!src._signals || !(signal in src._signals))
			{
				throw new Error("No such signal " + signal + " registered.");
			}
			var funcs = src._signals[signal];
			var tokens = src._signals[signal].tokens;
			for(var i=0;i<funcs.length;i++)
			{
				if(funcs[i] == func)
				{
					funcs.splice(i,1);
					delete _connectionTokens[tokens[i]];
					tokens.splice(i,1);
				}
			}
		};
		
		function disconnectByToken(token,quiet)
		{
            var args = _connectionTokens[token];
            if(!args)
            {
                if(quiet)
                {
                    return;
                }
                throw new Error("Connection token does not exist.");
            }
            disconnect.apply(this, args);
		}
		
		function signal(src, signal)
		{
			if(!src._signals || !(signal in src._signals))
			{
				throw new Error("No such signal " + signal + " registered.");
			}
			var funcs = src._signals[signal];
			for(var i=0;i<funcs.length;i++)
			{
				funcs[i].apply(this, $A(arguments).slice(2));
			}
		};
		
		// XAEIOS MINI-KERNEL
		var XaeiOS = {};
		
		(function()
		{			
			function void_function(){};
			
			var PriorityQueue = function(){
				this.Heap = [];
				this.LastNodeIndex = -1;
			};
			Object.extend(PriorityQueue.prototype,{
				Add:function(o){
					var newNodeInd = ++this.LastNodeIndex + 1;
					for (;newNodeInd>1&&this.Heap[newNodeInd/2-1]&&o.Priority<this.Heap[newNodeInd/2-1].Priority;newNodeInd/=2)
					this.Heap[newNodeInd - 1] = this.Heap[newNodeInd / 2 -1];
					this.Heap[newNodeInd - 1] = o;
				},
				Remove:function(){
					if (this.IsEmpty())
					return null;  // If the heap is empty, there is nothing to return.
					var ret = this.Heap[0];
					this.Heap[0] = this.Heap[this.LastNodeIndex--];
					this.Rebuild(0);
					return ret;
				},
				Peek:function(){
					if(this.IsEmpty())
						return null;
					return this.Heap[0];
				},
				Rebuild:function(index){
					var childIndex = index * 2 + 1; // next node which should be rebalanced.
					var temp = this.Heap[index];
				
					for (;childIndex<(this.LastNodeIndex+1);index=childIndex,childIndex=index*2+1)
					{
					// First get the smaller child node to be checked
					if (childIndex!=this.LastNodeIndex
						&& this.Heap[childIndex].Priority > this.Heap[childIndex+1].Priority)
					{
						childIndex++;
					}
					// If the child is smaller then a node, make him to be a node, else
					// we have a new balanced heap.
					if (this.Heap[childIndex].Priority < temp.Priority)
						this.Heap[index] = this.Heap[childIndex];
					else
						break;
					}
					this.Heap[index] = temp;
				},
				IsEmpty:function(){
					return this.LastNodeIndex==-1;
				},
				GetCount:function(){
					return this.LastNodeIndex+1;
				}
			});
		
			// KERNEL
			
			// special registers
			var current_task;
			var awaiting_task;
			
			// data structures
			var task_map = {};
			var task_name_map = {};
			var blocked_map = {};
			var task_pq = new PriorityQueue();
			
			var kernel_task = task_map[0] = [null,this,null,0,null];
			task_name_map[0] = "Kernel Task";
			current_task = kernel_task;
			
			var task_count = 1;
			var task_id_counter = 1;
			
			var task_statistics = {};
			
			function scheduler_cpu_cycle()
			{
				if(task_pq.IsEmpty())
				{
					awaiting_task = true;
					scheduler_pause_cpu(); // idle cpu
					return;
				}
				var t = current_task = task_pq.Remove(); // t is a task
				//$(logArea).value = t[3] + " : " + t[2] + " : " + new Date().getTime();
				var co = t[0]; // co is a continuation (t[0] is task.continuation)
				var ts = 30; // time slice is 30 milliseconds
				var st = new Date().getTime();
				if(!co)
				{
					debug("XaeiOS runtime error: Continuation was invalid for task: " + t[3] + " - " + task_name_map[t[3]] + "\n Continuation value was: " + co);
					return;
				}
				co[1] = st + ts; // set end time (co[1] is end time)
				
				try
				{
					var r = t[2].apply(t[1],co); // t[1] is this pointer, t[2] is function
					current_task = kernel_task; // kernel task
										
					// increment CPU time
					task_statistics[task_name_map[t[3]]] += new Date().getTime() - st;

					cleanup_task(t,r);
					return;
				}
				catch(e)
				{
					// increment CPU time
					var dt = new Date().getTime() - st;
					task_statistics[task_name_map[t[3]]] += dt;

					current_task = kernel_task;
					if(e instanceof Array)
					{
                        // threw back a continuation
                        t[0] = e; // set new continuation
                        if(blocked_map[t[3]])
                        {
                            // blocked or killed
                            var bt = blocked_map[t[3]];
                            switch(bt)
                            {
                                case 1:
                                {
                                    // blocked
                                    // lower priority value
                                    //t.Priority -= (t.Priority % 1000)/2;
                                    break;
                                }
                                case 2:
                                {
                                    // killed
                                    cleanup_task(t);
                                    break;
                                }
                                default:
                                {
                                    //console.error("XaeiOS general protection error: Illegal block type - " + bt);
                                    return;
                                }
                            }
                            delete blocked_map[t[3]];
                        }
                        else
                        {
                            /*if((t.Priority % 1000) + dt < 1000)
                            {
                                t.Priority += dt;
                            }*/
                            task_pq.Add(t);				
                        }
					}
					else if(e == 0) // task is blocking
					{			
						return;
					}
					else if(e == 1) // invalid instruction pointer
					{
						console.error("XaeiOS: Thread " + task_name_map[t[3]] + " encountered an error: Invalid IP");
						return;
					}
					else // runtime error
					{
						var s = [];
						var line;
						for(var i in e)
						{
							s.push(typeof(e[i]));
							s.push(" ");
							s.push(i);
							s.push(" = ");
							s.push(e[i]);
							s.push("\n");
							if(i == "line")
							{
								line = e[i];
							}
						}
						if(line)
						{
							s.push("Error is near: \n");
							var parts = t[2].toString().split("\n");
							for(var i = Math.max(-15,-parts.length);line-1+i<parts.length&&i<15;i++)
							{
								s.push(parts[line-1+i]);
								s.push("\n");
							}
						}
						console.error("XaeiOS Thread " + task_name_map[t[3]] + " encountered an error: " + s.join(""));
						console.trace();
						return;
						// TODO: Handle runtime error
                        // TODO: File bug report
					}
				}
			}
			
			function get_task_statistics()
			{
				return task_statistics; 
			}
			
			function new_task(t,f,cb,pr,name)
			{
				var co = [0,0]; // ip, end
				if(arguments.length > 4)
					co = co.concat(Array.prototype.slice.call(arguments,5));
				name = name || "anonymous";
				task_name_map[task_count] = name;
				if(!(task_statistics.hasOwnProperty(name)))
				{
					task_statistics[name] = 0;
				}
				var t = task_map[task_id_counter] = [co,t,f,task_id_counter++,cb];
				task_count++;
				t.Priority = dynamic_priority(pr);
				return t;
			}
			
			function dynamic_priority(p)
			{
				return (p + 1) * 1000;
			}
			
			function block_task(t)
			{
				blocked_map[t[3]] = 1; // 1 for blocked
			}
			
			function kill_task(t)
			{
				var bt = blocked_map[t[3]];
				if(bt == 1) // already blocked
				{
					schedule_task_checked(t);
				}
				else
				{
					blocked_map[t[3]] = 2; // 2 for killed
				}
			}
			
			function cleanup_task(t,r)
			{
				
				// TODO: release locks and other resources
				
				var cb = t[4]; // cb is a callback (t[t] is callback)
				delete task_map[t[3]]; // t[3] is task.id
				delete task_name_map[t[3]];
				task_count--;
				if(cb)
				{
					cb(r); // callback
				}
			}
			
			function schedule_task(t,pr)
			{
				t.Priority = pr;
				task_pq.Add(t);
				if(awaiting_task)
				{
					awaiting_task = false;
					scheduler_resume_cpu();
				}
			}
			
			function schedule_task_checked(t,pr)
			{
				if(!t)
				{
					throw new Error("Illegal task to schedule");
				}
				if(t == kernel_task)
				{
					// kernel task shouldn't be scheduled
					return;
				}
				if(pr == null)
				{
					pr = t.Priority || dynamic_priority(3); // TODO: Define constants for task priorities
				}
				schedule_task(t,pr);
			}
			
			var cpu_interval_id;
			function scheduler_start_cpu()
			{
				cpu_interval_id = this.setInterval(scheduler_cpu_cycle,1,0);
			}
			
			var cpu_pause_id;
			function scheduler_pause_cpu(timeout)
			{
				this.clearInterval(cpu_interval_id);
				if(timeout)
				{
					cpu_pause_id = this.setTimeout(scheduler_start_cpu,timeout);
				}
			}
			
			function scheduler_resume_cpu()
			{
				this.clearTimeout(cpu_pause_id);
				scheduler_start_cpu();
			}
			
			function shutdown()
			{
				// TODO: send terminate signal to all tasks
				// TODO: start a low priority task to monitor when no more tasks (other than itself) are running.  After some time, it should kill any remaining tasks that won't exit
				// TODO: cleanup and halt
				halt();
			}
			
			function halt()
			{
				scheduler_pause_cpu();
				schedule_task = void_function; // in case some tasks are sleeping for a defined interval
				kernel_task = null;
				task_map = null;
				task_name_map = null;
				block_map = null;
				task_pq = null;
			}
			
			Function.prototype.JIT = function(context)
			{
				if(this._jit)
				{
					return this;
				}
				var src = this.toString();
				if (src.charAt(0) == '(')
				{
					src = src.slice(1, -1);
				}
				var args = src.match(/function\s?\(([\w$_\s,]*)\)/);
				if(!args)
				{
					throw new Error("Could not JIT function: Code format was unrecognized.");
				}
				var specialArgs = ["__ip__","__end__"];
				if(args[1])
				{
					args = specialArgs.concat(args[1].split(", "));
				}
				else
				{
					args = specialArgs;
				}
				
				src = src.substring(src.indexOf("{") + 1, src.lastIndexOf("}"));
				
				var matches = src.match(/var\s([\w$_]*)/gm);
				var locals = [];
		
				if(matches)
				{
					for(var i=0;i<matches.length;i++)
					{
						args.push(matches[i].match(/var\s([\w$_]*)/)[1]);
					}
				}
				
				src = src.replace(/__YIELD__;/gm,"__end__=0;continue __ctrl__;");
				src = src.replace(/__SOFT_YIELD__;/gm,"if(new Date()>__end__){throw [" + args.join(",") + "];}");
		
				var basicBlocks = src.split("__END_BLOCK__;");
				
				var buffer = [];
				if(context)
				{
					for(var i=0;i<context.length;i++)
					{
						buffer.push(context[i][0]);
						buffer.push("=context[");
						buffer.push(i);
						buffer.push("][1];");
					}
				}
				buffer.push("__jit__function__=function(");
				buffer.push(args.join(", "));
				buffer.push("){");
				
				// main control loop
				buffer.push("__ctrl__:");
				buffer.push("do {");
				
				buffer.push("if(new Date()>__end__){");
				buffer.push("throw [");
				buffer.push(args.join(", "));
				buffer.push("];}");
				
				buffer.push("switch(__ip__){");
				
				for(var i=0;i<basicBlocks.length;i++)
				{
					buffer.push("case ");
					buffer.push(i);
					buffer.push(":");
					buffer.push(basicBlocks[i]);
					if(i<basicBlocks.length-1)
					{
						buffer.push("__ip__++;");
						buffer.push("continue __ctrl__;");
					}
					else
					{
						buffer.push("return;");
					}
				}
				
				buffer.push("default: throw 1;"); // error code 1 is "Invalid IP"
				
				buffer.push("}");
				buffer.push("}");
				buffer.push("while(true);");
				buffer.push("}");
				var __jit__function__ = null;
				try
				{
					//document.body.innerHTML = "<pre>" + (buffer.join("")) + "</pre>";
					eval(buffer.join(""));
				}
				catch(e)
				{
					document.body.innerHTML = "<pre>" + (buffer.join("")) + "</pre>";
					throw new Error("Could not JIT function: " + e);
				}
				__jit__function__._jit = true;
				return __jit__function__;
			};
			
			var Thread = function(thisPtr, f, priority, name, args)
			{
				this._this = thisPtr;
				this._function = f.JIT();
				this._priority = priority || 3;
				this._dynamicPriority = dynamic_priority(this._priority);
				this._task = new_task.apply(null,[thisPtr, this._function, this._callback.bind(this), priority, name].concat(args || []));
				this._id = this._task[3]; // task[3] is task id
				Thread._taskMap[this._id] = this;
				this._running = false;
				this._blocked = false;
			};
			Object.extend(Thread,
			{
				_taskMap:{},
				Sleep:function(interval)
				{
					var thread = Thread._taskMap[current_task[3]];
					if(interval)
					{
						setTimeout(Thread.prototype._unblock.bind(thread),interval);
					}
					block_task(current_task);
					thread._blocked = true;
				}
			});
			Thread.inherits(Object,
			{
				Start:function()
				{
					if(!this._running)
					{
						schedule_task(this._task, this._dynamicPriority);
						this._running = true;
					}
				},
				Abort:function()
				{
					if(!this._running)
					{
						throw new Error("Illegal thread state: Non-running thread cannot be aborted.");
					}
					kill_task(this._task);
					this._running = false;
				},
				IsRunning:function()
				{
					return this._running;
				},
				_unblock:function()
				{
					if(this._blocked)
					{
						schedule_task(this._task, this._dynamicPriority);
						this._blocked = false;
					}
				},
				_callback:function()
				{
					this._running = false;
				}
			});
			
			var Lock = function()
			{
				this._owner = null;
				this._waitingOwners = [];
				this._waitingFunctions = [];
			};
			Object.extend(Lock.prototype,
			{
				Lock:function()
				{
					if(this._owner && this._owner != current_task)
					{
						console.info("sorry cant give you the lock, you're getting blocked: " + task_name_map[current_task[3]]);
						this._waitingOwners.push(current_task);
						block_task(current_task);
						return false;
					}
					else
					{
						if(!current_task)
						{
							throw new Error("NO CURRENT TASK");
						}
						console.info("you got lock: " + task_name_map[current_task[3]]);
						this._owner = current_task;
						return true;
					}
				},
				TryLock:function()
				{
					if(this._owner && this._owner != current_task)
					{
						console.info("sorry cant give you the lock: " + task_name_map[current_task[3]]);
						return false;
					}
					else
					{
						console.info("you got lock: " + task_name_map[current_task[3]]);
						this._owner = current_task;
						return true;
					}
				},
				Unlock:function()
				{
					if(this._owner == current_task)
					{
						//console.debug("you unlocked lock: " + task_name_map[this._owner[3]]);
						this._owner = null;
						if(this._waitingOwners.length)
						{
							//console.debug("now you can try to get the lock!");
							var t = this._owner = this._waitingOwners.shift();
							schedule_task_checked(t);
						}
					}
					else
					{
						// throw error or send signal
					}
				},
				NewCondition:function()
				{
					return new Condition(this);
				}
			});
			
			var Condition = function(lock)
			{
				this._lock = lock;
				this._waitingList = [];
			};
			Condition.inherits(Object,{
				Signal:function()
				{
					if(this._waitingList.length)
					{
						var t = this._waitingList.shift();
						var saved_task = current_task;
						current_task = t;
						if(this._lock.Lock())
						{
							schedule_task_checked(t);
						}
						current_task = saved_task;
					}
				},
				SignalAll:function()
				{
					throw new Error("Not yet implemented");
				},
				Await:function()
				{
					if(this._lock._owner != current_task)
					{
						throw new Error("Invalid lock state");
					}
					this._lock.Unlock();
					this._waitingList.push(current_task);
					block_task(current_task);
				}
  		    });
			
			XaeiOS.Thread = Thread;
			XaeiOS.Lock = Lock;
			XaeiOS.Shutdown = shutdown;
			XaeiOS.GetTaskStatistics = get_task_statistics;
	
			scheduler_start_cpu();
			
		})();
				
		function ExternalInterfaceWrapper(swf,methodSignatures)
		{
			this._swf = swf;
			for(var i=0;i<methodSignatures.length;i++)
			{
				var method = methodSignatures[i];
				this[method.Name] = this.NewMethodWrapper(method);
			}
		}
		ExternalInterfaceWrapper.inherits(Object,{
			NewMethodWrapper:function(method)
			{
				var returnType = (method.ReturnType || "javascript").toLowerCase();
				
				var resultHandler;
				
				switch(returnType)
				{
					case "string":
					{
						resultHandler = this.StringResultHandler;
						break;
					}
					case "json":
					{
						resultHandler = this.JSONResultHandler;
						break;
					}
					case "javascript":
					{
						resultHandler = this.JavascriptResultHandler;
						break;
					}
					case "array":
					{
						resultHandler = this.ArrayResultHandler;
						break;
					}
					case "xml":
					{
						break;
					}
					case "bool":
					{
						break;
					}
					case "void":
					{
						resultHandler = this.VoidResultHandler;
						break;
					}
					case "number":
					{
						resultHandler = this.NumberResultHandler;
						break;
					}
					case "int":
					{
						resultHandler = this.NumberResultHandler;
						break;
					}
					case "raw":
					{
						resultHandler = this.RawResultHandler;
						returnType = "xml";
						break;
					}
					default:
					{
						throw new Error("Invalid method return type");
					}
				}
				
				var s = [];
				
				s.push("<invoke name=\"");
				s.push(method.Name);
				s.push("\" returnType=\"");
				s.push(returnType);
				s.push("\">")
				
				s = [s.join("")];
				
				s.push("");
				
				s.push("</invoke>");
				
				return function()
				{
					if(arguments.length)
					{
						s[1] = this.SerializeArguments(arguments);
					}
					return resultHandler($(this._swf).CallFunction(s.join("")));
				}.bind(this);
			},
			ArrayResultHandler:function(result)
			{
				return result;
			},
			NumberResultHandler:function(result)
			{
				return Number(result.substring(8,result.length-9));
			},
			StringResultHandler:function(result)
			{
				return result.substring(8,result.length-9);
			},
			JSONResultHandler:function(result)
			{
			    var s = result.substring(8,result.length-9).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'");
			    return eval(s);
			},
			JavascriptResultHandler:function(result)
			{
				return result;
			},
			VoidResultHandler:function(result)
			{
			},
			RawResultHandler:function(result)
			{
				return result;
			},
			SerializeArguments:function(args)
			{
				return __flash__argumentsToXML(args,0);
			}
		});
		
        var MuZumeSwf = null;
		var MuZumeApplet = null;

        var KEY_BINDINGS = {
            65: "a",
            66: "b",
            67: "c",
            68: "d",
            69: "e",
            70: "f",
            71: "g",
            72: "h",
            73: "i",
            74: "j",
            75: "k",
            76: "l",
            77: "m",
            78: "n",
            79: "o",
            80: "p",
            81: "q",
            82: "r",
            83: "s",
            84: "t",
            85: "u",
            86: "v",
            87: "w",
            88: "x",
            89: "y",
            90: "z",
            186: ";",
            187: "=",
            188: ",",
            189: "-",
            190: ".",
            191: "/",
            192: "`",
            219: "[",
            220: "\\",
            221: "]",
            222: "'"
        };
        
        var SHIFT_KEY_BINDINGS = {
            48: ")",
            49: "!",
            50: "@",
            51: "#",
            52: "$",
            53: "%",
            54: "^",
            55: "&",
            56: "*",
            57: "(",
            65: "A",
            66: "B",
            67: "C",
            68: "D",
            69: "E",
            70: "F",
            71: "G",
            72: "H",
            73: "I",
            74: "J",
            75: "K",
            76: "L",
            77: "M",
            78: "N",
            79: "O",
            80: "P",
            81: "Q",
            82: "R",
            83: "S",
            84: "T",
            85: "U",
            86: "V",
            87: "W",
            88: "X",
            89: "Y",
            90: "Z",
            186: ":",
            187: "+",
            188: "<",
            189: "_",
            190: ">",
            191: "?",
            192: "~",
            219: "{",
            220: "|",
            221: "}",
            222: "\""
        }

		var MuZume = {
		
            Initialized: false,
            _loadedModules: {},
            _asyncOperations: new AsyncOperations(),
            Views: [],
            _parameterViews: [],            
		
			Initialize:function()
			{
				if (this.Initialized)
				{
					return;
				}
				
				this.ExternalKernel = new ExternalInterfaceWrapper(MuZumeSwf, [
					{Name:"Ping",ReturnType:"string"},
					{Name:"Initialize",ReturnType:"void"},
					{Name:"BuildIndex",ReturnType:"void"},
					{Name:"GetBuildIndexProgress",ReturnType:"int"},
					{Name:"GetObjectsCount",ReturnType:"int"},
					{Name:"GetObjects",ReturnType:"json"},
					{Name:"PreindexObjects",ReturnType:"void"},
					{Name:"AddMapping",ReturnType:"void"},
					{Name:"AddObject",ReturnType:"String"},
					{Name:"UpdateObject",ReturnType:"void"},
					{Name:"RemoveObject",ReturnType:"void"},
					{Name:"GetIndex",ReturnType:"raw"},
					{Name:"SearchIndex",ReturnType:"String"},
					{Name:"ClearData",ReturnType:"void"},
					{Name:"ScoreString",ReturnType:"Number"},
					{Name:"Debug",ReturnType:"void"},
					{Name:"SaveIndex",ReturnType:"void"},
					{Name:"SaveCatalog",ReturnType:"void"},
					{Name:"CpuCycle",ReturnType:"void"}
				]);
				
				/*var s = [];
				for(var i in window)
				{
					if(i.indexOf("flash") > -1)
					{
						s.push(i + " : " + window[i]);
					}
				}*/
//				document.body.innerHTML += "<pre>" + s.join("\n") + "</pre>";

				registerSignals(this, ["Open","Close", "BuildCatalog", "BuildIndex"]);

				var objectWidget = this._objectWidget = new Widget("blue");
				objectWidget.SetName("Object Widget");
				var actionWidget = this._actionWidget = new Widget("black");
				actionWidget.SetName("Action Widget");
				
				objectWidget.SetContent(window.__muzume__startText || "Type to search");

				this.WidgetContainer = new WidgetContainer();
				this.WidgetContainer.AddWidget(objectWidget);
				this.WidgetContainer.AddWidget(actionWidget);
				this.WidgetContainer.GetElement().style.display = "none";

				objectWidget.GetElement().style.zIndex = 0;
				
				actionWidget.GetElement().width = Widget.LEFT_SIDE_WIDTH + Widget.RIGHT_SIDE_WIDTH;
				actionWidget.SetLogo(false);
				actionWidget.GetElement().style.zIndex = -1;
				
				connectOnce(actionWidget, "Show", function()
			    {
					$(this._element).style.zIndex = -1;
			    }.bind(actionWidget));

				this._startBackground = window.__muzume__background?true:false;
				this.Initialized = true;
				
				if(this._startBackground)
				{
					this.SetBackgroundBrowserEventHooks();
				}
				else
				{
					this.FirstOpen();
				}

			},
			Start:function()
			{
				var objectView = this.ObjectView = new MZObjectView(new MZCatalog(), this._objectWidget);
				objectView.GetWidget().SetMiniContent("");
				this.AddView(objectView);

				var actionView = this.ActionView = new MZActionView(new MZCatalog(), this._actionWidget);
				this.AddView(actionView);
								
				this._currentViewIndex = 0;
				
				// load built in modules
				this.LoadModule(MZCoreModule, MZModuleInterface);
				
				// fetch startup modules
				this._startupModules = [MZBrowserAddonsModule, MZRSSModule, MZDownloadModule, MZPasswordGeneratorModule, MZMouseGesturesModule, MZDebugModule];
				
				// start fast unit external execution thread
				this.ExternalKernelThread = new XaeiOS.Thread(this, this._scheduleExternalKernel.JIT(), 5, "Fast Unit External Execution Thread");
				this.ExternalKernelThread.Start();

				this.BuildCatalogThread = new XaeiOS.Thread(this, this.BuildCatalog.JIT([
						["$",$],
						["MZUrlObject",MZUrlObject],
						["MZHistoryEntryObject",MZHistoryEntryObject],
						["MZHyperlinkObject",MZHyperlinkObject],
						["MZScriptObject",MZScriptObject],
						["MZModuleInterface",MZModuleInterface],
						["MZCoreModule",MZCoreModule],
						["MuZumeSwf",MuZumeSwf],
						["MZApplicationObject",MZApplicationObject],
						["$ICON",$ICON],
						["$$ICON",$$ICON],
						["MZNotification",MZNotification]
				]), 5, "Build Catalog Thread");
				this.IndexingThread = new XaeiOS.Thread(this, this._buildIndex.JIT([
					["$",$],
					["MuZumeSwf",MuZumeSwf]
				]), 5, "Indexing Thread");
				
				if(this._startBackground || this.ObjectView.Widget.IsShown())
				{
					this._doStart();
				}
				else
				{
					connectOnce(this.ObjectView.Widget, "Show", this._doStart.bind(this));
				}
				
				
				this._browseWidgetContainer = new WidgetContainer();
				this._browseWidgetContainer.GetElement().style.display = "none";
				
				var browseWidget = this._browseWidget = new BrowseWidget();
				this._browseWidgetContainer.AddWidget(browseWidget);
				connect(browseWidget, "BeforeShow", function() {
					this._browseWidgetContainer.GetElement().style.display = "block";
					this._browseWidgetContainer.RepositionNow();
				}.bind(this));
				connect(browseWidget, "Hide", function() {
					this._browseWidgetContainer.GetElement().style.display = "none";
				}.bind(this));
				connect(browseWidget, "SelectItem", this._onSelectItem.bind(this));
				this._browseWidgetContainer._reposition = function(widgetContainer)
				{
					var element = this.GetElement();
                    var widgetContainerElement = widgetContainer.GetElement();
					this._targetPosTop = parseInt(widgetContainerElement.style.top) + (widgetContainerElement.offsetHeight) + 10;
					this._targetPosLeft = (document.documentElement.offsetWidth - element.offsetWidth) / 2;
							
					element.style.top = this._targetPosTop + "px";
					element.style.left = this._targetPosLeft + "px";
					element = null;
			
					browseWidget.ResizeItems();
					//this._restartRepositionThread();
				}.bind(this._browseWidgetContainer, this.WidgetContainer);
				this._browseWidgetContainer.RepositionNow();
				/*var oldFunc = this.WidgetContainer._reposition;
				var self = this;
				this.WidgetContainer._reposition = function()
				{
					oldFunc.call(this);
					self._browseWidgetContainer._reposition();
				};*/
				element = null;
				
				// notification system
				
				var nwc = this._notificationWidgetContainer = new WidgetContainer();
				nwc.GetElement().style.display = "none";
				nwc._reposition = function()
				{
					var element = this.GetElement();
					var height;
                    if( typeof( window.innerWidth ) == 'number' ) {
                        //Non-IE
                        height = window.innerHeight;
                      } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                        //IE 6+ in 'standards compliant mode'
                        height = document.documentElement.clientHeight;
                      } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
                        //IE 4 compatible
                        height = document.body.clientHeight;
                      }
					this._targetPosTop = (height) / 4 * 3;
					this._targetPosLeft = 0;
							
					element.style.top = this._targetPosTop + "px";
					element.style.left = this._targetPosLeft + "px";
					element = null;
			
					//this._restartRepositionThread();
				};
				
				this._notificationWidget = new Widget("black");
				this._notificationWidget.SetLogo(false);
				
				nwc.AddWidget(this._notificationWidget);
				
				nwc.GetElement().style.width = "100%";
				nwc.RepositionNow();
				
				this._notificationQueue = [];
				this._notificationLock = new XaeiOS.Lock();
				this._notificationCondition = this._notificationLock.NewCondition();
				this._notificationThread =  new XaeiOS.Thread(this,this._runNotifications.JIT(),5,"Notification Thread");
				this._notificationThread.Start();
				
			},
			_onSelectItem:function(itm)
			{
				clearTimeout(this._onSelectItemTimeout);
				this._onSelectItemTimeout = setTimeout(this._doOnSelectItem.bind(this, itm),30);
			},
			_doOnSelectItem:function(itm)
			{				
				var currentView = this.GetCurrentView();
				if(currentView == this.ObjectView)
				{
					currentView.SetObject(itm._objectIndex, this._browseWidget._objects, this._browseWidget._scores);
					currentView.Precommit(itm._objectIndex, this._browseWidget._objects, this._browseWidget._scores, false);
					this.WidgetContainer.Reposition();
				}
			},
			_doStart:function()
			{
				this.ExternalKernel.Initialize();
				this.BuildCatalogThread.Start();
				//setTimeout(this.LoadAdFrame.bind(this), 4000);
			},
			_scheduleExternalKernel:function()
			{
				var externalKernel = this.ExternalKernel;
				var schedulerEmpty = [false];
				
				// setup external scheduler signals
				var lock = new XaeiOS.Lock();
				var notEmptyCondition = lock.NewCondition();
				window.__xaeios_external_scheduler_not_empty__ = function()
				{
					schedulerEmpty[0] = false;
					notEmptyCondition.Signal();
				};
				window.__xaeios_external_scheduler_empty__ = function()
				{
					schedulerEmpty[0] = true;
				};
				
				lock.Lock();
				
				__END_BLOCK__;
				
				if(schedulerEmpty[0])
				{
					notEmptyCondition.Await();
					__YIELD__;
				}
				
				externalKernel.CpuCycle();
				
				__YIELD__;
				
				//console.debug("Error: ExternalKernel task should never end");
			},
			LoadAdFrame:function()
			{
				var adFrame = document.createElement("IFRAME");
				adFrame.setAttribute("frameborder", "0");
				adFrame.style.overflow = "hidden";
				adFrame.style.width = "150px";
				adFrame.style.height = "400px";
				adFrame.style.top = "60px";
				adFrame.style.right = "10px";
				var color = document.body.style.backgroundColor;
				if (!color)
				{
					color = "white";
				}
				adFrame.style.position = "absolute";
				//this._adFrameDiv.appendChild(this._adFrame);

				document.body.appendChild(adFrame);
				//document.body.insertBefore(this._adFrameDiv, document.body.firstChild);
				adFrame.setAttribute("SRC", "http://www.princeton.edu/~mtenpow/ads.html");
				adFrame.setAttribute("ALLOWTRANSPARENCY", "true");
				adFrame.style.display = "none";

				setTimeout(function()
				{
					$(this._adFrame).style.display = "block";
				}.bind(this), 2000);

				this._adFrame = $ID(adFrame);
			},
			ShowNotification:function(notification)
			{
				this._notificationQueue.push(notification);
				this._notificationCondition.Signal();
			},
			_runNotifications:function()
			{
				if (!this._notificationLock.Lock())
				{
					__YIELD__;
				}
				
				if(!this._notificationQueue.length)
				{
					this._notificationWidgetContainer.Reposition();
					if(this._notificationWidget.IsShown())
					{
						connectOnce(this._notificationWidget, "Hide", function()
						{
							this._notificationWidgetContainer.GetElement().style.display = "none";
						}.bind(this));
						this._notificationWidget.Hide();
					}
					this._notificationCondition.Await();
					__YIELD__;
				}
				
				try
				{
					var notification = this._notificationQueue.shift();
					this._notificationWidget.SetContent(notification.GetText());
					this._notificationWidget.SetIcon(notification.GetIcon());
					this._notificationWidgetContainer.GetElement().style.display = "block";
					this._notificationWidgetContainer.Reposition();
					connectOnce(this._notificationWidget, "Show", function()
					{
						signal(notification, "Show");
					});
					this._notificationWidget.Show();
					XaeiOS.Thread.Sleep(2000);
					__YIELD__;
				}
				catch(e)
				{
					this._notificationLock.Unlock();
					throw e;
				}
				__YIELD__;
			},
			LoadModule:function(module, moduleInterface)
			{
				if(!module)
				{
					throw new Error("Argument module cannot be null.");
				}
				if(!module.Name)
				{
					throw new Error("Module name cannot be null or empty.");
				}
				if (this._loadedModules[module.Name])
				{
					throw new Error("Module " + module.Name + " already exists.");
				}
				if (module.Initialize(moduleInterface) != false)
				{
					this._loadedModules[module.Name] = module;
				}
				if (module.Actions)
				{
					for (var i = 0; i < module.Actions.length; i++)
					{
						this.ActionView.Catalog.AddObject(module.Actions[i]);
					}
				}
				if (module.Objects)
				{
					for (var i = 0; i < module.Objects.length; i++)
					{
						this.ObjectView.Catalog.AddObject(module.Objects[i]);
					}
				}
			},
			GetLoadedModule:function(name)
			{
				var module = this._loadedModules[name];
				return module?module:null;
			},
			AddView:function(view)
			{
				this.Views.push(view);
			},
			RemoveView:function(view)
			{
				var views = this.Views;
				var newViews = [];
				for(var i=0;i<views.length;i++)
				{
					if(views[i] == view)
					{
						continue;
					}
					newViews.push(views[i]);
				}
				this.Views = newViews;
				if(this._currentViewIndex >= newViews.length)
				{
					if(newViews.length)
					{
						this.SetView(0);
					}
					else
					{
						this._currentViewIndex = -1;
					}
				}
			},
			GetViews:function()
			{
				return this.Views;
			},
			GetParameterViews:function()
			{
				return this._parameterViews;	
			},
			AddParameterView:function(view)
			{
				this.Views.push(view);
				this._parameterViews.push(view);	
			},
			RemoveAllParameterViews:function()
			{
				for(var i=0;i<this._parameterViews.length;i++)
				{
					this.RemoveView(this._parameterViews[i]);
				}
				this._parameterViews = [];
			},
			SetView:function(newIndex)
			{
				var view = this.GetCurrentView();
				view.Widget.SetColor("black");
				view.Widget.GetElement().style.zIndex = -1;

				//this._clearContent = true;
				this._currentViewIndex = newIndex;

				view = this.GetCurrentView();
				view.Widget.SetColor("blue");
				view.Widget.GetElement().style.zIndex = 0;
				view.Widget.Show();
			},
			NextView:function()
			{
				if (this._currentViewIndex >= this.Views.length - 1)
				{
					this.SetView(0);
				}
				else
				{
					this.SetView(this._currentViewIndex+1);
				}
			},
			PreviousView:function()
			{
				if (this._currentViewIndex <= 0)
				{
					this.SetView(this.Views.length - 1)
				}
				else
				{
					this._clearContent = true;
					this.SetView(this._currentViewIndex-1);
				}
			},
			GetCurrentView:function()
			{
				if(this._currentViewIndex == -1)
				{
					return null;
				}
				return this.Views[this._currentViewIndex];
			},
			CommitView:function()
			{
				this.GetCurrentView().Commit();
			},
			Open:function()
			{
				if(this._isOpen || this._isClosing)
				{
					return;
				}
				this._isOpen = true;
				this.SetBrowserEventHooks();
				this.WidgetContainer.GetElement().style.display = "block";
				this._browseWidgetContainer.GetElement().style.display = "block";
				connectOnce(this._objectWidget,"Show",function()
			    {
					this.WidgetContainer.Reposition();
					this._browseWidgetContainer.Reposition();
			    }.bind(this));
				this._objectWidget.Show();
				this.WidgetContainer.Reposition();
				if(this.ActionView.InputObject)
				{
					this._actionWidget.Show();
				}
				
				signal(this, "Open");
			},
			FirstOpen:function()
			{
				if(this._isOpen || this._isClosing)
				{
					return;
				}
				this._isOpen = true;
				this.SetBrowserEventHooks();
				this.WidgetContainer.GetElement().style.display = "block";
				this._objectWidget.Show();
//				LoadScript(prefix + "/lib/text-shadow/text-shadow.js");
				setTimeout(signal.bind(this, this, "Open"), 1);
			},
			_closeBrowseView:function()
			{
				this._browseWidget.Hide();
			},
			Close:function()
			{
				if(!this._isOpen || this._isClosing)
				{
					return;
				}
				this._isOpen = false;
				this._isClosing = true;
                this._fullCommitMode = false;
                this._asyncOperations.CancelAll();
				this.SetBackgroundBrowserEventHooks();
				if(this._browseWidget.IsShown())
				{
					connectOnce(this._browseWidget, "Hide", this._closeViews.bind(this));
					this._browseWidget.Hide();
				}
				else
				{
					this._closeViews();
				}
			},
			IsOpen:function()
			{
                return this._isOpen;
			},
			CloseDelayed:function(callback)
			{
                if(callback)
                {
                    connectOnce(this, "Close", callback);
                }
                setTimeout(this.Close.bind(this), 1);
			},
			_closeViews:function()
			{
				for (var i = this.Views.length - 1; i > 0; i--)
				{
					this.Views[i].CancelPendingOperations();
					this.Views[i].Widget.Hide();
				}
				this.SetView(0);
				setTimeout(function()
				{
					if(this.ObjectView)
					{
						this.ObjectView.CancelPendingOperations();
					}
					var f = function()
					{
						this._isClosing = false;
						this.WidgetContainer.GetElement().style.display = "none";
						this._browseWidgetContainer.GetElement().style.display = "none";
						signal(this, "Close");
					}.bind(this);
					connectOnce(this._objectWidget,"Hide",f);
					this._objectWidget.Hide();
				}.bind(this), 1);
			},
			SetBrowserEventHooks:function()
			{
                this._clearBrowserEventHooks();
                if(IS_WEBKIT)
                {
                    Event.observe(window, "keydown", this._currentKeyDownListener = this._onKeyDown.bindAsEventListener(this), true, true);
                    Event.observe(window, "keypress", this._currentKeyPressListener = Event.stop, true, true);
                }
                else
                {
                    Event.observe(window, "keypress", this._currentKeyPressListener = this._onKeyDown.bindAsEventListener(this), true, true);
                    Event.observe(window, "keydown", this._currentKeyDownListener = this._secondaryOnKeyDown.bindAsEventListener(this), true, true);
                }
                Event.observe(window, "keyup", Event.stop, true);
                Event.observe(window, "mouseup", this._currentMouseUpListener = this._onMouseUp.bindAsEventListener(this), true);
        	},
			SetBackgroundBrowserEventHooks:function()
			{
                this._clearBrowserEventHooks();
                if(IS_WEBKIT)
                {
                    Event.observe(window, "keydown", MuZume._currentKeyDownListener = this._backgroundOnKeyDown.bindAsEventListener(this), true, true);
                }
                else
                {
                    Event.observe(window, "keypress", MuZume._currentKeyPressListener = this._backgroundOnKeyDown.bindAsEventListener(this), true, true);
                }
            },
            _clearBrowserEventHooks:function()
            {
                if(this._currentKeyDownListener)
                {
                    Event.stopObserving(window, "keydown", this._currentKeyDownListener, true, true);
                    this._currentKeyDownListener = null;
                }
                if(this._currentKeyPressListener)
                {
                    Event.stopObserving(window, "keypress", this._currentKeyPressListener, true, true);
                    this._currentKeyPressListener = null;
                }
                Event.stopObserving(window, "keyup", Event.stop, true);
                if(this._currentMouseUpListener)
                {
                    Event.stopObserving(window, "mouseup", this._currentMouseUpListener, true);
                    this._currentMouseUpListener = null;
                }
            },
            _onMouseUp:function(e)
            {
                elm = Event.element(e);
                var id;
                // are we inside a muzume element
                while(elm && elm.getAttribute)
                {
                    id = elm.getAttribute("id")
                    if(id && id.indexOf("muzume-element-") == 0)
                    {
                        return true;
                    }
                    elm = elm.parentNode;
                }
                MuZume.Close();
                return false;
            },
			_backgroundOnKeyDown:function(e)
			{	
				if(!MuZume) // TODO: MuZume might be unloaded? but then the event listener should be removed
				{
				    return;
				}
                // TODO: Create a caching mechanism to cache as much javascript "state" as possible, with a view to decreasing start time
                // For instance: objects created on load by core and startup modules should be stored and just persisted next time, rather than recreated
                var keyCode = e.which;
				if(keyCode == Event.KEY_SPACE && (e.ctrlKey || e.altKey)) // TODO: Swap out for key from preferences
				{
                    MuZume.Open();
                    return false;
				}
				else if(keyCode == Event.KEY_ALT_SPACE)
				{
                    MuZume.Open();
                    return false;
				}
				else if(keyCode == Event.KEY_L && (e.ctrlKey || e.metaKey)) // TODO: Refactor out into preferences
				{
				    // TODO: Put object view into edit mode
				    MuZume.Open();
                    return false;
				}
			},
			_onKeyDown:function(e)
			{
				var keyCode = e.which;
				this._asyncOperations.TryCancelTimeoutByName("Start Current View Ranking");
				switch (keyCode)
				{
					case Event.KEY_UP:
					{					
						var currentView = this.GetCurrentView();
						if(this._browseWidget.IsShown())
						{
							var selection = this._browseWidget.GetSelection();
							if(selection > 0)
							{
								this._browseWidget.SelectItem(selection-1);
							} 
						}
						return false;
					}
					case Event.KEY_DOWN:
					{
						var currentView = this.GetCurrentView();
						if(this._browseWidget.IsShown())
						{
							var selection = this._browseWidget.GetSelection();
							if(selection > -1 && this._browseWidget.GetItems().length > selection+1)
							{
								this._browseWidget.SelectItem(selection+1);
							} 
						}
						return false;
					}
					case Event.KEY_LEFT:
					{
						var currentView = this.GetCurrentView();
						return false;
					}
					case Event.KEY_RIGHT:
					{
						var currentView = this.GetCurrentView();
						return false;
					}
					case Event.KEY_ALT_SPACE:
					{
					   this.CloseDelayed();
						return false;
					}
					case Event.KEY_ESC:
					{
						if(this._browseWidget.IsShown())
						{
							this._closeBrowseView();							
						}
						else
						{
							this.Close();
						}
						return false;
					}
					case Event.KEY_SHIFT_TAB:
					case Event.KEY_TAB:
					{
						if (e.shiftKey)
						{
							this.PreviousView();
						}
						else
						{
							this.NextView();
						}
						return false;
					}
					case Event.KEY_ENTER:
					case Event.KEY_RETURN:
					{
						this._fullCommit();
						return false;
					}
					case Event.KEY_BACKSPACE:
					{
						this.GetCurrentView().StopRanking();
						this.GetCurrentView().ClearInputKey();
						this.WidgetContainer.Reposition();
						return false;
					}
					case 0:
					{
					   //console.warn("Got 0 key code");
					   return false;
					}
					default:
					{
                        if(keyCode == Event.KEY_SPACE && (e.ctrlKey || e.altKey)) // TODO: Refactor out for key trigger from preferences
                        {
    						MuZume.CloseDelayed();
                            return false;
                        }
                        else
                        {                            
                            var bindings = e.shiftKey?SHIFT_KEY_BINDINGS:KEY_BINDINGS;
                            var c = bindings[keyCode];
                            if(!c)
                            {
                                c = String.fromCharCode(keyCode);
                            }
                            
                            var currentView = this.GetCurrentView();
                            if (this._clearContent)
                            {
                                currentView.StopRanking();
                                currentView.ClearInputKey();
                                this._clearContent = false;
                            }
                            currentView.AppendInputKey(c);
                            if(c == Event.KEY_DOT)
                            {
                            }
                            
                            this._asyncOperations.SetTimeout(currentView.RestartRanking.bind(currentView), 20, "Start Current View Ranking");
                            
                            /* COMMENTED OUT
                            this._asyncOperations.SetTimeout(this._keyTimeout.bind(this), 1000, "Key Timeout");
                            */
                            this.WidgetContainer.Reposition();
                            return false;
                        }
					}
				}
			},
			
			_secondaryOnKeyDown:function(e)
			{
				var keyCode = e.which;
				this._asyncOperations.TryCancelTimeoutByName("Start Current View Ranking");
				switch (keyCode)
				{
					case Event.KEY_UP:
					{					
						var currentView = this.GetCurrentView();
						if(this._browseWidget.IsShown())
						{
							var selection = this._browseWidget.GetSelection();
							if(selection > 0)
							{
								this._browseWidget.SelectItem(selection-1);
							} 
						}
						return false;
					}
					case Event.KEY_DOWN:
					{
						var currentView = this.GetCurrentView();
						if(this._browseWidget.IsShown())
						{
							var selection = this._browseWidget.GetSelection();
							if(selection > -1 && this._browseWidget.GetItems().length > selection+1)
							{
								this._browseWidget.SelectItem(selection+1);
							} 
						}
						return false;
					}
					case Event.KEY_LEFT:
					{
						var currentView = this.GetCurrentView();
						return false;
					}
					case Event.KEY_RIGHT:
					{
						var currentView = this.GetCurrentView();
						return false;
					}
					case Event.KEY_ALT_SPACE:
					{
                        this.CloseDelayed();
                        return false;
					}
					case Event.KEY_ESC:
					{
						if(this._browseWidget.IsShown())
						{
							this._closeBrowseView();							
						}
						else
						{
							this.CloseDelayed();
						}
						return false;
					}
					case Event.KEY_TAB:
					{
						if (e.shiftKey)
						{
							this.PreviousView();
						}
						else
						{
							this.NextView();
						}
						return false;
					}
				}
				return false;
			},
			_fullCommit:function()
			{
                if(this._fullCommitMode)
                {
                   //console.debug("Already in full commit mode");
                    return;
                }
                this._fullCommitMode = true;
                
				if(this.ObjectView._isRanking)
				{
				   //console.debug("Object view still ranking");
				    this._asyncOperations.AddConnection(connectOnce(this.ObjectView, "StopRanking", this._fullCommit.bind(this)));
					return;
				}
				
				if(!this.ActionView.InputObject)
				{
				   //console.debug("No action view input object");
				    this._fullCommitMode = false;
				    return;
				}
				
				if(this.ActionView._isRanking)
				{
				   //console.debug("Action view still ranking");
				    this._asyncOperations.AddConnection(connectOnce(this.ActionView, "StopRanking", this._fullCommit.bind(this)));
					return;
				}
				
				try
				{				
                    // query object should be at least 1/2 second old in order for a full commit to occur
                    if ((this.ActionView.InputObject instanceof MZQueryObject) && (new Date().getTime() - this.ActionView.InputObject.GetCreationDate().getTime() > 500))
                    {
                        this.ActionView.Commit();
                        //this.Close();
                    }
                    else
                    {
                        // we dont want to search prematurely
                        
                        // make sure we still have the same object to commit
                        if(this._fullCommitActionViewInputObject == this.ActionView.InputObject.Id || (!this.ObjectView._isRanking && !this.ActionView._isRanking))
                        {
                            this.ActionView.Commit();
                        }
                        else
                        {
                            // TODO: Play a sound
                            this._fullCommitActionViewInputObject = this.ActionView.InputObject.Id;
                        }
                    }
				}
				finally
				{
				    this._fullCommitMode = false;
				}
			},
			_keyTimeout:function()
			{
				this._clearContent = true;
			},
			GetViewStack:function()
			{
				return this.Views.slice(0, this._currentViewIndex + 1);
			},
			BuildIndex:function()
			{
                if(this.IndexingThread.IsRunning())
                {
                    this.IndexingThread.Abort();
                }
				this.IndexingThread = new XaeiOS.Thread(this, this._buildIndex.JIT([
					["$",$],
					["MuZumeSwf",MuZumeSwf]
				]), 5, "Indexing Thread");
				this.IndexingThread.Start();
			},
			_buildIndex:function()
			{
                //console.info("Building index");
				this.ExternalKernel.BuildIndex();
				
				__END_BLOCK__;
				
				while(this.ExternalKernel.GetBuildIndexProgress() < 100)
				{
                    //console.info("Build index status = %s percent", this.ExternalKernel.GetBuildIndexProgress());
					XaeiOS.Thread.Sleep(100);
					__YIELD__;
				}
                //console.info("Build index status = %s percent", this.ExternalKernel.GetBuildIndexProgress());
				
				console.info("Saving Index");
				this.ExternalKernel.SaveIndex();
				
				signal(MuZume, "BuildIndex");
			},
			BuildCatalog:function()
			{
				this._isBuildingCatalog = true;
				var catalog = this.ObjectView.Catalog;
				var actionCatalog = this.ActionView.Catalog;

				__END_BLOCK__;

				var t = new Date().getTime();
				
				// load stored objects
				var t = new Date().getTime();
				var nObjects = this.ExternalKernel.GetObjectsCount();//$(MuZumeSwf).GetObjectsCount();
				//console.debug(nObjects + " objects retreived from disk");
//				MuZume.ShowNotification(new MZNotification(nObjects + " objects retreived from disk"));
				var dt1 = (new Date().getTime() - t);
				var currentUrl = location.href;
				var foundCurrentUrl = false;
				var currentUrlHistoryEntryObject = null;
				
				var t = new Date().getTime();
				var inc = 12;
				
				var objects = this.ExternalKernel.GetObjects(0, Math.min(inc,nObjects));
				var n = 0;
				var i = 0;
				var installedApplications = new Object();
				var objectReferences = new Array();
				
				__END_BLOCK__;
				
				while(i<objects.length)
				{
					switch(objects[i].__constructor__)
					{
						case "MZApplicationObject":
						{
                            //console.info("Loading application object");
                            var applicationObject = MZApplicationObject.Deserialize(objects[i]);
							catalog.AddObject(applicationObject);
							if(applicationObject.GetUrl() == currentUrl)
							{
								foundCurrentUrl = true;
							}
							installedApplications[applicationObject.GetName()] = applicationObject;
                            //console.info("Loaded application object %o", applicationObject);
							break;
						}
						case "MZHistoryEntryObject":
						{
                            //console.info("Loading history entry object");
                            var historyEntryObject = MZHistoryEntryObject.Deserialize(objects[i]);
							catalog.AddObject(historyEntryObject);
							if(historyEntryObject.GetUrl() == currentUrl)
							{
								foundCurrentUrl = true;
								currentUrlHistoryEntryObject = historyEntryObject;
							}
                            //console.info("Loaded history entry object %o", historyEntryObject);
							break;
						}
						case "MZObjectReference":
						{
                            //console.info("Found MZObjectReference %o - Queueing for loading later.", objects[i]);
                            objectReferences.push(objects[i]);
							break;
						}
						default:
						{
						    var s = new Array(objects[i]);
						    s.push(objects);
						    for(var q in objects[i])
						    {
						        s.push(q + " = " + objects[i][q]);
						    }
							console.error("Invalid stored object: " + objects[i].__constructor__ + String.fromCharCode(10) + s.join(String.fromCharCode(10)));
							break;
						}
					}
					i++;
					__SOFT_YIELD__;
				}
				
				if(n + i < nObjects)
				{
					i = 0;
					n += inc;
					objects = this.ExternalKernel.GetObjects(n, Math.min(inc,nObjects-n));
					__YIELD__;
				}
				
				var notifications = [];
				if(!foundCurrentUrl)
				{
					// is this an application
					var applicationObject = MuZume.FindApplicationObject(currentUrl);
					if(applicationObject && ((applicationObject.GetName() in installedApplications) == false))
					{
                        this.StoreObject(applicationObject);
                        var applicationObjectShadow = applicationObject.Serialize();
						this.ExternalKernel.PreindexObjects([applicationObjectShadow]);
						this.ExternalKernel.AddMapping(currentUrl, applicationObject.Id);
						catalog.AddObject(applicationObject);
						
						notifications.push(new MZNotification("Installed application: " + applicationObject.GetName(), applicationObject.GetIcon()));
						
						installedApplications[applicationObject.GetName()] = applicationObject;
					}
					
					// add to history
					var newHistoryEntryObject = new MZHistoryEntryObject(document.title, currentUrl, new Date(), $ICON("globe.png"));
				    this.StoreObject(newHistoryEntryObject);
				    var newHistoryEntryObjectShadow = newHistoryEntryObject.Serialize();
					this.ExternalKernel.PreindexObjects([newHistoryEntryObjectShadow]);

					this.ExternalKernel.AddMapping(currentUrl, newHistoryEntryObject.Id)
					catalog.AddObject(newHistoryEntryObject);
					this.GetLoadedModule("Core").SetCurrentLocationHistoryEntryObject(newHistoryEntryObject);
					
					//notifications.push(new MZNotification("This page has been bookmarked", $ICON("bookmark.png")));
				}
				else if(currentUrlHistoryEntryObject)
				{
				    currentUrlHistoryEntryObject.SetAccess(new Date());
				    this.StoreObject(currentUrlHistoryEntryObject);
					this.GetLoadedModule("Core").SetCurrentLocationHistoryEntryObject(currentUrlHistoryEntryObject);
				}
				var dt2 = (new Date().getTime() - t);
				
				__END_BLOCK__;
				
				i = 0;
				
				__END_BLOCK__;
				
				console.info("Loading object references...");
				while(i < objectReferences.length)
				{            
                    var objectReference = MZObjectReference.Deserialize(objectReferences[i]);
                    catalog.AddObject(objectReference);
                    //console.info(objectReference.GetName() + " -> " + objectReference.Dereference().GetName());
                    i++;
                    __SOFT_YIELD__;
				}
				
				__END_BLOCK__;
				
				// add objects to index incrementally
				
				this.IndexingThread.Start();
				var i = 0;
				var shadowIndex = catalog.Indices.Shadow;
				var l = shadowIndex.length;
				var previousShadowIndexLength = l;
				
				__END_BLOCK__;
				
				while(i<l)
				{
					this.ExternalKernel.PreindexObjects(shadowIndex.slice(i,Math.min(i + 10, l)));
					i+=Math.min(i+10,l)-i;
					__SOFT_YIELD__;
				}
				
				__END_BLOCK__;
				

				/*// hyperlink objects
				var anchors = [];//document.getElementsByTagName("A");
				var t = new Date().getTime();
				var i = 0;

				__END_BLOCK__;

				while (i < anchors.length)
				{
					var a = anchors.item(i);
					var href = a.getAttribute("href");
					if (!href)
					{
						i++;
						continue;
					}
					if (href == "#")
					{
						i++;
						continue;
					}
					var range = document.createRange();
					range.selectNode(a);
					name = range.toString();

					// find text and images

					if (!name)
					{
						if (href.indexOf("/") > 0)
						{
							name = (href.split("/").pop());
						}
						else
						{
							name = href;
						}
					}
					catalog.AddObject(new MZHyperlinkObject(name, a, $ICON("globe.png")));
					i++;
					__SOFT_YIELD__;
				}

				__END_BLOCK__;

				*/
				
				var at = new Date().getTime() - t;

				// load start up modules
				
				var i = 0;
				var l = this._startupModules.length;
				
				__END_BLOCK__;
				
				while(i < l)
				{
				    this.LoadModule(this._startupModules[i], MZModuleInterface);
				    i++;
				    __SOFT_YIELD__;
				}
				
				__END_BLOCK__;
				
				// add NEW objects to index incrementally
				var i = previousShadowIndexLength; // var i = l
				var shadowIndex = catalog.Indices.Shadow;
				var l = shadowIndex.length;
				var t = new Date().getTime();
				
				__END_BLOCK__;
				
				while(i<l)
				{
					this.ExternalKernel.PreindexObjects(shadowIndex.slice(i,Math.min(i + 10, l)));
					i+=Math.min(i+10,l)-i;
					__SOFT_YIELD__;
				}
				
				var dt3 = (new Date().getTime() - t);
				
				__END_BLOCK__;
								
				//console.debug("Find urls: " + at + " Fetch cache: " + dt1 + " - Recreate cache: " + dt2 + " - N in cache: " + nObjects + " - Send shadows index: " + dt3 + " - N shadows: " + l);
				
				// populate application catalog
				this.GetLoadedModule("Core").AddApplicationObjects(installedApplications);
				
				this._isBuildingCatalog = false;
				//this.IndexingThread.Start();
				
				for(var i=0;i<notifications.length;i++)
				{
					this.ShowNotification(notifications[i]);
				}
				
                signal(MuZume, "BuildCatalog");
//				MuZume.ShowNotification(new MZNotification(catalog.Objects.length + " objects in the object catalog"));
			},
			FindApplicationObject:function(url)
			{
			    return MZCoreModule.FindApplicationObject(url);
			},
			StoreObject:function(obj)
			{
                //console.info("Storing object %o", obj);
                if(!obj.__constructor__)
                {
                    shadow = obj.Serialize();
                    //console.info("Object was not serialized.  After serialization, object was %o", shadow);
                    if(obj.IsStored())
                    {
                        this.ExternalKernel.UpdateObject(shadow);
                    }
                    else
                    {
                        obj.SetId(this.ExternalKernel.AddObject(shadow));
                    }
                }
                else
                {
                    this.ExternalKernel.AddObject(obj);
                }
			},
			SetLocation:function(url)
			{
                setTimeout(function()
                {
                    window.location.href = url;
                },1);
			}
		};

		var MZView = Class.extend({
            __init__:function(name, catalog, widget)
            {
                this.Name = name;
                this.Catalog = catalog || new MZCatalog();
                this.Widget = widget || new Widget();
                this.Scores = {};
                this._inputKey = "";
                this.Widget.SetMiniContent(this.GetName());
                this.RankingAsyncOperations = new AsyncOperations();
    
                this._smartRankingThread = new XaeiOS.Thread(this, this._sortSmartIndex, null, "Smart Ranking Thread");
                this._smartRankingLock = new XaeiOS.Lock();
    
                this._smartRankingLock.Lock();
                this._smartRankingThread.Start();
    
                registerSignals(this, [
                        "BeforeStartRanking",
                        "StartRanking",
                        "BeforeStopRanking",
                        "StopRanking",
                        "RankingFailed",
                        "CatalogSorted",
                        "BeforeCatalogSorted"
                ]);
                
                connect(this, "RankingFailed", this.CueRankingFailed.bind(this));
                connect(this, "BeforeStartRanking", this.CueStartRanking.bind(this));
            },
            toString:function()
            {
                return this.GetName();
            },
            GetCatalog:function()
            {
                return this.Catalog;
            },
            GetName:function()
            {
                return this.Name;
            },
            Precommit:function(objectIndex, objects, scores, showBrowseWidget)
            {
                this.OutputObject = objects[objectIndex].Dereference();
            },
            Commit:function()
            {
                this.StopRanking();
            },
            CancelPendingOperations:function()
            {
                this.StopRanking();
            },
            GetCurrentSearchKey:function()
            {
                return this._originalInputKey;
            },
            GetInputKey:function()
            {
                return this._inputKey;
            },
            SetInputKey:function(value)
            {
                this._inputKey = value;
                this.Widget.SetMiniContent(value || this.GetName());
                MuZume._browseWidget.SetMiniContent(value);
            },
            AppendInputKey:function(value)
            {
                this._inputKey += value;
                this.SetInputKey(this._inputKey);
            },
            ClearInputKey:function()
            {
                this.SetInputKey("");
                MuZume._browseWidget.ClearMiniContent();
            },
            GenerateScores:function(callback)
            {
            },
            RestartRanking:function()
            {
               //console.debug("Restart ranking", this.GetName());
                if(this._isRanking)
                {
                    this.CancelPendingOperations();
                    this.StartRanking();
                }
                else
                {
                    this.StartRanking();
                }
            },
            StartRanking:function()
            {
                if (this._isRanking)
                {
                    return;
                }
    
               //console.debug("start ranking " + this.GetInputKey(), this.GetName());
                signal(this, "BeforeStartRanking");
    
                this._isRanking = true;
                this._originalInputKey = this.GetInputKey();
                this.Scores = {};
                this._rankingsCursor = 0;
    
                if (!this.UseSmartRanking || !this._originalInputKey)
                {
                    this.Catalog.SearchSet = this.Catalog.Objects; // TODO: Use getters and settings; Move SearchSet into view rather than Catalog
                    this._startRanking(this._shouldRankingStop.bind(this, this._originalInputKey));
                    // don't bother smart ranking if there is no input key
                }
                else
                {
                    this.Catalog.SearchSet = [];
                    this.StartSmartRanking();
                    this.RankingAsyncOperations.SetTimeout(this._startRanking.bind(this), 60, "Really Start Ranking");
                }
                signal(this, "StartRanking");
            },
            StopRanking:function()
            {
               //console.debug("Stop ranking...", this.GetName());
                if (!this._isRanking)
                {
                   //console.debug("Will not stop ranking because not currently ranking.");
                    return;
                }
                signal(this, "BeforeStopRanking");
               //console.debug("Stop ranking", this.GetName());
                
                this.RankingAsyncOperations.TryCancelTimeoutByName("Ranking Failed");
                this.RankingAsyncOperations.TryCancelTimeoutByName("Really Start Ranking");
                
                this.StopSmartRanking();
                this.StopBackgroundRanking();
                
                this.RankingAsyncOperations.CancelAll();                
                this._isRanking = false;
                signal(this, "StopRanking");
            },
            _startRanking:function(callback)
            {
               //console.debug("_startRanking", this.GetName());
                if(!this._isRanking)
                {
                   //console.debug("Not going to _startRanking because not currently ranking.  Search set is " + this.SearchSet.length,this.GetName());
                    return;
                }
                this._sortFunction = this._compareObjectRankings.bind(this);
                this.GenerateScores();
                this._rankingsCursor = 0;
                this._sortCatalog();
                if(this._isRanking)
                {
                    this.RankingAsyncOperations.SetInterval(this.GenerateScores.bind(this, callback), 60, "Generate Scores");
                    this.RankingAsyncOperations.SetInterval(this._sortCatalog.bind(this), 60, "Sort Catalog");
                }
            },
            StartBackgroundRanking:function()
            {
                //console.info("start background ranking: %o", this);
                if (!this._isRanking || this._isBackgroundRanking || this._isSmartRanking)
                {
                    //console.info("cannot start background ranking because not ranking or already is background ranking or is smart ranking: %o", this);
                    return;
                }
                this._isBackgroundRanking = true;
    
                this._hardSearchSet = [];
                var searchSet = this.Catalog.SearchSet;
                var l = searchSet.length;
                for(var i = 0;i<l;i++)
                {
                    var score = this.Scores[searchSet[i].GetId()];
                    if(isNaN(score) || score < .1)
                    {
                        continue;
                    }
                    this._hardSearchSet.push(searchSet[i]);
                }
                this._hardScores = this.Scores;
    
                this.Scores = {};
                this.Catalog.SearchSet = this.Catalog.Objects;
                this._rankingsCursor = 0;
                this._originalInputKey = this.GetInputKey();
                this._catalogSortedAtLeastOnce = false;
    
                this.RankingAsyncOperations.SetInterval(this.GenerateScores.bind(this, this._shouldRankingStop.bind(this, this._originalInputKey)), 500, "Generate Scores");
                this.RankingAsyncOperations.SetInterval(this._sortCatalog.bind(this), 1000, "Sort Catalog");
            },
            StopBackgroundRanking:function()
            {
                //console.info("stop background ranking");
                if(!this._isBackgroundRanking)
                {
                    return false;
                }
                this._isBackgroundRanking = false;
                this._hardSearchSet = null;
                this._hardScores = null;
                
                this.RankingAsyncOperations.TryCancelIntervalByName("Generate Scores");
                this.RankingAsyncOperations.TryCancelIntervalByName("Sort Catalog");
            },
            _shouldRankingStop:function(inputKey)
            {
               //console.debug("Should ranking stop? \"" + inputKey + "\" - " + this.GetInputKey(), this.GetName());
                if (!this._isRanking)
                {
                   //console.debug("Not checking if ranking failed because not ranking!");
                    return;
                }
                if (!this._catalogSortedAtLeastOnce)
                {
                   //console.debug("Catalog not sorted as yet.  Continuing with ranking..", this.GetName());
                    return;
                }
                if (inputKey != this.GetInputKey())
                {
                   //console.debug("Input keys out of sync, ranking will continue with new input key");
                    this._originalInputKey = this.GetInputKey();
                    this._startRegularRanking();
                    return;
                }
                var topHit = this.Catalog.SearchSet[0];
                if (!topHit)
                {
                   //console.debug("ranking failed", this.GetName());
                    this.StopRanking();
                    signal(this, "RankingFailed");
                }
                else if (isNaN(this.Scores[topHit.Id]) || this.Scores[topHit.Id] <= .1)
                {
                   //console.debug("ranking failed", this.GetName());
                    this.StopRanking();
                    signal(this, "RankingFailed");
                }
                else
                {
                   //console.debug("ranking did not fail...top hit is " + topHit.GetName() + " Score = " + this.Scores[topHit.Id], this.GetName());
                    if(this.UseBackgroundRanking && !this._isBackgroundRanking)
                    {
                        //console.info("Going to start background ranking in 1000 seconds.");
                        this.RankingAsyncOperations.SetTimeout(this.StartBackgroundRanking.bind(this),1000,"Start Background Ranking");
                    }
                    else
                    {
                        this.StopRanking();
                    }
                }
            },
            StartSmartRanking:function()
            {
                if (!this._isRanking || this._isSmartRanking)
                {
                    return;
                }
                this._isSmartRanking = true;
               //console.debug("start smart ranking " + this.GetInputKey(), this.GetName());
                this._topHits = {};
                this._oldTopHits = {};
                this._smartRankingUtility = 0;
                this._smartRankingBias = {};
                var index = this.Catalog.Indices.Smart;
                this._smartIndexKeySortFunction = index._compareSmartIndexKeyScores.bind(index);
                this._smartRankingLock.Unlock();
            },
            StopSmartRanking:function()
            {
                if (!this._isSmartRanking)
                {
                   //console.debug("not going to stop smart ranking because not smart ranking currently");
                    return;
                }
               //console.debug("stop smart ranking", this.GetName());
    
                this._isSmartRanking = false;
    
               //console.debug("locking the smart ranking lock");
                this._smartRankingLock.Lock();
    
                this.RankingAsyncOperations.TryCancelIntervalByName("Generate Smart Index Scores");
                this.RankingAsyncOperations.TryCancelIntervalByName("Sort Smart Index");
                this.RankingAsyncOperations.TryCancelTimeoutByName("Did Smart Ranking Fail?");
                
                this.Catalog.SearchSet = this.Catalog.GetObjects();
            },
            _sortSmartIndex:function()
            {
               //console.debug("Locking smart ranking lock from within smart ranking thread.");
                if (!this._smartRankingLock.Lock())
                {
                    __YIELD__;
                }
                try
                {
                    var key = this.GetInputKey();
                   //console.debug("sort smart index: key = " + key, this.GetName());
                    if (key == "")
                    {
                       //console.debug("smart index not sorted because input key is empty", this.GetName());
                        return;
                    }
    
                    //console.time("Sort Smart Index");
                    var result = MuZume.ExternalKernel.SearchIndex(key.toLowerCase(),.4);
                    var originalResult = result;
                    var parts = result.toString().split(",");
                    result = new Array(parts.length);
                    for(var i=0;i<result.length;i++)
                    {
                        result[i] = parts[i];
                    }
                    //console.timeEnd("Sort Smart Index");
                    var idIndex = this.Catalog.Indices.Id; // TODO: Replace MZObject registry with MuZume main catalog ID index
                    var searchSet = []
                    for (var i = 0; i < result.length; i++)
                    {
                        var o = idIndex[result[i]];
                        var object = idIndex[result[i]];
                        if(object)
                        {
                            searchSet.push(object);
                        }
                    }
                    //console.info("Smart index yielded: %o", searchSet);
    
                    if (searchSet.length)
                    {
                        //console.info("Smart index yielded " + searchSet.length + " results. TopHit is " + searchSet[0].Id + " : " + searchSet[0].GetName(), this.GetName());
                        this.RankingAsyncOperations.TryCancelTimeoutByName("Did Smart Ranking Fail?");
                        this.Catalog.SearchSet = searchSet;
                    }
                    else
                    {
                       //console.debug("smart index performed poorly", this.GetName());
                        
                        if(!this.RankingAsyncOperations.HasTimeout("Did Smart Ranking Fail?"))
                        {
                            //console.debug("Setting 'Did Smart Ranking Fail?' timeout");
                            this.RankingAsyncOperations.SetTimeout(this._didSmartRankingFail.bind(this, this._originalInputKey), 110, "Did Smart Ranking Fail?");
                        }
                        else
                        {
                           //console.debug("Not setting Did Smart Ranking Fail? timeout because it already exists.");
                        }
                    }
                   //console.debug("smart ranking thread sleeping for 30 ms");
                    XaeiOS.Thread.Sleep(30);
                    __YIELD__;
                }
                finally
                {
                   //console.debug("Finally unlocking smart ranking lock from within smart ranking thread.");
                    this._smartRankingLock.Unlock();
                }
                throw new Error("Smart ranking thread exited!");
            },
            _didSmartRankingFail:function(inputKey)
            {
               //console.debug("Did smart ranking fail? input key is " + inputKey);
                if (!this._isSmartRanking)
                {
                   //console.debug("Could not check if smart ranking failed because no currently smart ranking");
                    return;
                }
                /*if(this._rankingRestarted)
                {
                    this._rankingRestarted = false;
                    return;
                }*//*
                if (inputKey != this.GetInputKey())
                {
                   //console.debug("Input keys out of sync, smart ranking will continue with new input key");
                    this._originalInputKey = this.GetInputKey();
                    return;
                }*/
               //console.debug("smart ranking failed", this.GetName());
    
                this.StopRanking();
                //console.debug("About to signal RankingFailed");
                signal(this, "RankingFailed");
            },
            _startRegularRanking:function()
            {   
                // start regular ranking
               //console.debug("start regular ranking", this.GetName());
               
               if(!this._isRanking || this._isSmartRanking)
               {
                   return;
               }
                
                this.RankingAsyncOperations.TryCancelIntervalByName("Generate Scores");
                this.RankingAsyncOperations.TryCancelIntervalByName("Sort Catalog");
    
               //console.debug("resetting original input key, scores, search set and rankings cursor", this.GetName());
                this.Scores = {};
                this.Catalog.SearchSet = this.Catalog.Objects;
                this._rankingsCursor = 0;
                this._originalInputKey = this.GetInputKey();
                this._catalogSortedAtLeastOnce = false;
    
                this.RankingAsyncOperations.SetInterval(this.GenerateScores.bind(this, this._shouldRankingStop.bind(this, this._originalInputKey)), 100, "Generate Scores");
                this.RankingAsyncOperations.SetInterval(this._sortCatalog.bind(this), 200, "Sort Catalog");
            },
            _sortCatalog:function()
            {
                this.CatalogIsSorted = false;
                //console.debug("sort catalog:: original input key =" + this._originalInputKey + " input key = " + this.GetInputKey() + " search set size=" + this.Catalog.SearchSet.length, this.GetName());
                var objects = this.Catalog.SearchSet;
                if (!objects.length)
                {
                   //console.debug("will not sort catalog because search set is empty", this.GetName());
                    return;
                }
                
                // check if input key has changed since last time we sorted catalog
                var inputKeyChanged = this.GetInputKey() != this._originalInputKey;
                this._originalInputKey = this.GetInputKey();
                
                if (this._isBackgroundRanking && this.UseSmartRanking)
                {
                   //console.debug("Adding smart ranking bias", this.GetName());
                    for (var i in this._smartRankingBias)
                    {
                        if(!(i in this.Scores))
                        {
                            continue;
                        }
                        //console.debug("Adding " + this._smartRankingBias[i] + " points to " + i);
                        this.Scores[i] += this._smartRankingBias[i];
                    }
                }
                var t = new Date();
                objects.sort(this._sortFunction);
                //console.debug("Took " + (new Date().getTime() - t.getTime()) + " ms to sort catalog", this.GetName());
                this._catalogSortedAtLeastOnce = true;
                
                var topHit = objects[0];
                var topScore = this.Scores[topHit.Id];
                
                if(isNaN(topScore))
                {
                   //console.debug("got NaN score.. scores are::");
                    for(var i in this.Scores)
                    {
                       //console.debug(i + " - " + this.Scores[i]);
                    }
                }
                
                if (topScore <= .1)
                {
                   //console.debug("top score too low: " + topHit.GetName() + " - score = " + topScore, this.GetName());
                    if(this._isSmartRanking)
                    {
                       //console.debug("smart index returned results but scores were low", this.GetName());
                        
                        if (--this._smartRankingUtility <= 0)
                        {
                            this._didSmartRankingFail(this._originalInputKey);
                        }
                        else
                        {
                           //console.debug("Giving smart ranking another chance.  smart ranking utility is at: " + this._smartRankingUtility);
                            
                            if(!this.RankingAsyncOperations.HasTimeout("Did Smart Ranking Fail?"))
                            {
                               //console.debug("Setting 'Did Smart Ranking Fail?' timeout");
                                this.RankingAsyncOperations.SetTimeout(this._didSmartRankingFail.bind(this, this._originalInputKey), 110, "Did Smart Ranking Fail?");
                            }
                            else
                            {
                               //console.debug("Not setting Did Smart Ranking Fail? timeout because it already exists.");
                            }
                        }
                    }
                    return;
                }
                
               //console.debug("Tophit is " + topHit.GetName() + " : " + topScore, this.GetName());
                
                this.RankingAsyncOperations.TryCancelTimeoutByName("Ranking Failed");
                
                if (this._isSmartRanking && !inputKeyChanged)
                {
                   //console.debug("Checking to see if smart ranking should stop");
                    var l = Math.min(objects.length, 3);
                    var difference = false;
                    for (var i = 0; i < l; i++)
                    {
                        if (!(objects[i].GetName() in this._topHits))
                        {
                            this._topHits[objects[i].GetName()] = true;
                            difference = true;
                        }
                    }
                    if (difference)
                    {
                       //console.debug("There is a significant difference between the last results and these results.  Continuing with smart ranking.");
                        this._smartRankingUtility++;
                    }
                    else
                    {
                        if (--this._smartRankingUtility <= 0)
                        {
                           //console.debug("Smart ranking finished", this.GetName());
                           //console.debug("Creating smart ranking bias", this.GetName());
    
                            // since smart ranking is smarter than background ranking, we'll bump up scores for objects found with smart ranking
                            this._smartRankingBias = {};
                            for (var i = 0; i < objects.length; i++)
                            {
                                this._smartRankingBias[objects[i].Id] = Math.pow(this.Scores[objects[i].Id], 2);
                               //console.debug("Creating bias for object " + objects[i].GetName() + " ID=" + objects[i].Id + " Bias=" + this._smartRankingBias[objects[i].Id]);
                            }
                            
                            if (this.UseBackgroundRanking)
                            {
                                this.StopSmartRanking();
                                //console.info("Going to start background ranking in 1000 seconds.");
                                this.RankingAsyncOperations.SetTimeout(this.StartBackgroundRanking.bind(this), 1000, "Start Background Ranking");
                            }
                            else
                            {
                                this.StopRanking();
                            }
                        }
                        else
                        {
                           //console.debug("There was no difference between last results and these results.  Decreasing smart ranking utility.");
                        }
                    }
                }
    
                this.SetObject(0,objects,this.Scores);
                this.CatalogIsSorted = true;
                signal(this, "CatalogSorted", objects, this.Scores);
            },
            SetObject:function(objIndex,objects,scores,omitContent,omitRelevance)
            {
                var t = new Date().getTime();
                var s = [];
                var content;
                var topHit = objects[objIndex];
                var topScore = scores[topHit.Id];
                var realName = topHit.GetName();
                
                if(!omitContent)
                {
                    if (realName != topHit.GetName())
                    {
                        content = topHit.GetName();
                        if (content.length > 40)
                        {
                            content = content.substr(0, 37) + "...";
                        }
                    }
                    else
                    {
                        var inputKey = this.GetInputKey().toLowerCase();
                        if (realName.length > 40)
                        {
                            var theIndex = realName.toLowerCase().indexOf(inputKey);
                            if (theIndex > 0)
                            {
                                // find the end of the word
                                var endIndex = theIndex + inputKey.length;
                                while ((endIndex < realName.length) && ((endIndex - theIndex) < 40))
                                {
                                    if (realName.charAt(endIndex) == " ")
                                    {
                                        endIndex--;
                                        break;
                                    }
                                    endIndex++;
                                }
                                var leeway = 40 - (endIndex - theIndex);
                                var theIndex2 = theIndex - leeway;
                                if (theIndex2 < 0)
                                {
                                    theIndex2 = 0;
                                }
        
                                var firstIndex = theIndex2;
                                // go back as much as possible
                                while (theIndex2 < theIndex)
                                {
                                    if (realName.charAt(theIndex2) == " ")
                                    {
                                        firstIndex = ++theIndex2;
                                        break;
                                    }
                                    theIndex2++;
                                }
        
                                // now go forward as much as possible
                                leeway = 40 - (endIndex - firstIndex);
        
                                realName = realName.substring(firstIndex, endIndex + leeway) + "...";
                            }
                            else
                            {
                                realName = realName.substr(0, 40) + "...";
                            }
                        }
                        var name = realName.toLowerCase();
                        var theIndex;
                        if ((theIndex = name.indexOf(inputKey)) != -1)
                        {
                            content = [realName.substring(0, theIndex - 1 == -1?0:theIndex),"<u>",realName.substr(theIndex, inputKey.length),"</u>",realName.substr(theIndex + inputKey.length)].join("");
                        }
                        else if (inputKey.length)
                        {
                            var i,j;
                            for (i = 0,j = 0; i < name.length && j < inputKey.length; i++)
                            {
                                if (name.charCodeAt(i) == inputKey.charCodeAt(j))
                                {
                                    s.push("<u>");
                                    s.push(realName.charAt(i));
                                    s.push("</u>");
                                    j++;
                                }
                                else
                                {
                                    s.push(realName.charAt(i));
                                }
                            }
                            if (i < realName.length)
                            {
                                s.push(realName.substr(i));
                                content = s.join("");
                            }
                            else
                            {
                                content = s.join("");
                            }
                        }
                        else
                        {
                            content = realName;
                        }
                    }
                    this.Widget.SetContent(content);
                    //this.Widget.SetContent(content + " : " + topScore.toString().substr(0,4) + " : " + relevance.toString().substr(0,4));
                }
                
                if(!omitRelevance)
                {
                    var l = Math.min(objects.length,5);
                    var totalScores = 0;
                    for(var i=0;i<l;i++)
                    {
                        var score = scores[objects[i].Id];
                        if(score == -1)
                        {
                            break;
                        }
                        totalScores += score;
                    }
                    var weight = topScore / totalScores;
                    var matchScore = Math.min(1, Math.pow(topScore,3));
                    var weightWeight = .7;
                    var matchScoreWeight = .3;
                    var relevance = Math.pow(weight * weightWeight + matchScore * matchScoreWeight, 2);
                    this.Widget.SetRelevance(relevance);
                }

                var icon = topHit.GetIcon();
                if (icon)
                {
                    this.Widget.SetIcon(icon);
                }
                else
                {
                    this.Widget.ClearIcon();
                }
                
                var caption = topHit.GetCaption();
                if (caption)
                {
                    if (caption.length > 60)
                    {
                        caption = caption.substr(0, 57) + "...";
                    }
                    this.Widget.SetCaption(caption);
                }
                else
                {
                    this.Widget.ClearCaption();
                }
            },
            _compareObjectRankings:function(a, b)
            {
                var rankB = this.Scores[b.Id];
                var rankA = this.Scores[a.Id];
                rankB = rankB?rankB:0;
                rankA = rankA?rankA:0;
                var ret = rankB - rankA;
                if (!ret)
                {
                    return parseInt(a.Id.substr(1)) - parseInt(b.Id.substr(1));
                }
                return ret;
            },
            CueRankingFailed:function()
            {
                if(this._rankingFailedCueFlag)
                {
                    return;
                }
                this._rankingFailedCueFlag = true;
                this.GetWidget().CueRankingFailed();
            },
            CueStartRanking:function()
            {
                this._rankingFailedCueFlag = false;
                this.GetWidget().CueStartRanking();
            },
            GetWidget:function()
            {
                return this.Widget;
            }
		});

		// BUILT IN VIEWS

		var MZObjectView = MZView.extend({
            __init__:function(catalog, widget)
            {
                arguments.callee.$.call(this, "Object", catalog, widget);
                connect(this, "CatalogSorted", this.OnCatalogSorted.bind(this));
                connect(this, "RankingFailed", this.OnRankingFailed.bind(this));
                
                this.UseSmartRanking = true;
                this.UseBackgroundRanking = false;
            },
            Commit:function()
            {
                this.StopRanking();
                var topHit = this.Catalog.SearchSet[0];
                if (topHit && MuZume.ActionView.InputObject)
                {
                    MuZume.NextView();
                }
            },
            GenerateScores:function(callback)
            {
                var key = this.GetInputKey();
                if (key != "")
                {
                    var length = this.Catalog.SearchSet.length;
                   //console.debug("about to generate scores.  rankings cursor is " + this._rankingsCursor);
                    var cursor = this._rankingsCursor;
                    if (this._originalInputKey != key || cursor > length)
                    {
                        this._rankingsCursor = cursor = 0;
                    }
                   //console.debug("generating scores for key: " + key + " from index " + cursor, this.GetName());
                    //				this._lastRankedInputKey = key;
                    var end = cursor + 75; // TODO: this number seems arbitrary  Convert this function into a XaeiOS threaded function
                    for (; cursor < end && cursor < length; cursor++)
                    {
                        var obj = this.Catalog.SearchSet[cursor];
                        if(!obj)
                        {
                            continue;
                        }
                        var objScore = obj.Score();
                        if (objScore == -1)
                        {
                            this.Scores[obj.Id] = -1;
                        }
                        else
                        {
                            this.Scores[obj.Id] = this.Catalog.Score(obj.GetName(), key) + objScore;
                        }
                    }
                    if (cursor >= length && typeof(callback) == "function")
                    {
                        callback();
                    }
                    this._rankingsCursor = cursor;
                }
            },
            OnCatalogSorted:function(objects,scores)
            {
                var topHit = objects[0];
               //console.debug("Catalog sorted !!!!!!!!!!!!! TopHit=" + topHit.GetName() + ", original input key=" + this._originalInputKey + " score=" + scores[topHit.Id] + ", " + objects.length + " objects", this.GetName());
                var score = scores[topHit.Id];
    
                if (!isNaN(score) && score > .1)
                {
                   //console.debug("Now that we have a top hit (" + topHit.GetName() + "), firing up action view", this.GetName());
                    this.Precommit(0, objects, scores, true);
                }
                else
                {
                   //console.debug("Score too low or NaN");
                }
                MuZume.WidgetContainer.Reposition();
            },
            CancelPendingOperations:function()
            {
                arguments.callee.$.call(this);
                clearTimeout(this._showOrUpdateBrowseViewTimeout);
                clearTimeout(this._repositionWidgetContainerThreadId);
            },
            Precommit:function(objectIndex, objects, scores, showBrowseWidget)
            {
                var topHit = objects[objectIndex];
                if(topHit != this.OutputObject)
                {
                    this.OutputObject = topHit.Dereference();
                   //console.debug("ActionView has a new target object.  Let's start ranking.", this.GetName());
                    MuZume.ActionView.CancelPendingOperations();
                    MuZume.ActionView.InputObject = this.OutputObject;
                    MuZume.ActionView.StartRanking();
                    
                    clearTimeout(this._repositionWidgetContainerThreadId);
                    this._repositionWidgetContainerThreadId = setTimeout(function(){
                        MuZume.WidgetContainer.Reposition();
                    },100);
                }
                else
                {
                   //console.debug("ObjectView output object is the same.  So we won't start action view ranking.", this.GetName());
                }
                
                if(showBrowseWidget)
                {
                    clearTimeout(this._showOrUpdateBrowseViewTimeout);
                    if(MuZume._browseWidget.IsShown())
                    {
                        this._showOrUpdateBrowseView(objects, scores);
                    }
                    else
                    {
                        this._showOrUpdateBrowseViewTimeout = setTimeout(this._showOrUpdateBrowseView.bind(this, objects, scores),500);
                    }
                }
            },
            _showOrUpdateBrowseView:function(objects, scores)
            {
                // update browse widget
                var bw = MuZume._browseWidget;
                var hardSearchSetLength;
                if(this._isBackgroundRanking)
                {
                    hardSearchSetLength = this._hardSearchSet.length;
                    bw.ClearFrom(hardSearchSetLength);       
                    bw._objects = this._hardSearchSet.concat(objects);
                    bw._scores = scores;
                    for(var i in this._hardScores)
                    {
                        bw._scores[i] = this._hardScores[i];
                    }
                }
                else
                {
                    hardSearchSetLength = 0;
                    bw.Clear();                
                    bw._objects = objects;
                    bw._scores = scores;
                }
                if(!objects.length)
                {
                    bw.Hide();
                    return;
                };
                for(var i=0;i<objects.length;i++)
                {
                    var obj = objects[i];
                    var score = scores[obj.Id];
                    if(isNaN(score) || score <= .1)
                    {
                        break;
                    }
                    var itm = new BrowseWidgetItem(obj.GetName(),obj.GetCaption());
                    itm._objectIndex = i + hardSearchSetLength;
                    bw.AddItem(itm);
                    itm.SetIcon(obj.GetIcon());
                }
                if(!bw.GetItems().length)
                {
                    bw.Hide();
                    return;
                }
                
                if(bw._currentSelection == -1)
                {
                    bw.SelectItem(0);
                }
                
                bw.Show();
            },
            OnRankingFailed:function()
            {
               //console.debug("OnRankingFailed",this.GetName());
                if(MuZume._browseWidget.IsShown())
                {
                    MuZume._browseWidget.Hide();
                }
                clearTimeout(this._repositionWidgetContainerThreadId);
               //console.debug("On ranking failed", this.GetName());
                
                /*
                    TODO: Create a "Handler" system that includes "Filters"
                    
                    Handlers should accept [object + action + parameter(s)] sets and execute them.  The handlers would be chosen by action.
                    For instance, an email handler can be define that excepts the [object + action + parameter(s)] sets for which the action is an MZSendAnEmailAction.
                    There could be a GMail handler, a default handler (mailto), and other handlers.
                    
                    Handlers should be implemented as filters so that they may be chained together: the output of one becomes the input of the next.
                */
                // TODO: This should be handled by the "default handler chain"
                var key = this.GetInputKey();
                var urlRegexp =  /^([a-zA-Z0-9]+\:\/\/)?(www.|[a-zA-Z].)[a-zA-Z0-9\-\.]+\.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk|jp|tv)(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\;\?'\\\+&%\$#\=~_\-]+))*$/; //' fixes syntax highlighting
                var emailRegexp = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                                
                var object;
                if(key.match(emailRegexp))
                {
                    object = new MZEmailAddressObject(key);
                    this.Widget.SetContent(key);
                    this.Widget.SetCaption(object.GetCaption());
                    this.Widget.SetRelevance(0);
                }
                else if(key.match(urlRegexp))
                {
                    object = new MZUrlObject(key);
                    this.Widget.SetContent(key);
                    this.Widget.SetCaption(object.GetCaption());
                    object.SetIcon($ICON("globe.png"));
                    this.Widget.SetRelevance(0);
                }
                else
                {			
                    object = new MZQueryObject(key);
                    this.Widget.SetContent(key + "?");
                    this.Widget.SetCaption("");
                   //console.debug("Creating query object: " + object.GetQuery(), this.GetName());
                    this.Widget.SetRelevance(0);
                }
                //this.Catalog.SearchSet = [object];
                
                var scores = {};
                scores[object.GetId()] = 2;
                this.SetObject(0, [object], scores, true, true);
                this.OutputObject = object.Dereference();
                
                MuZume.ActionView.StopRanking();
                MuZume.ActionView.InputObject = object.Dereference();
                MuZume.ActionView.Widget.Show();
                MuZume.ActionView.StartRanking();
                
                MuZume.WidgetContainer.Reposition();
            }
		});
		
		var MZActionView = MZView.extend({
            __init__:function(catalog, widget)
            {
                arguments.callee.$.call(this, "Action", catalog, widget);
                connect(this, "RankingFailed", this.OnRankingFailed.bind(this));
                connect(this, "CatalogSorted", this.OnCatalogSorted.bind(this));
                
                this.UseBackgroundRanking = false;
                this.UseSmartRanking = false;
            },
            Commit:function()
            {
                this.StopRanking();
                var topHit = this.Catalog.SearchSet[0];
                var paramSig = topHit.GetParameterSignature();
                if(paramSig)
                {
                    var args = [this.InputObject];
                    var parameterViews = MuZume.GetParameterViews();
                    for(var i=0;i<parameterViews.length;i++)
                    {
                        args.push(parameterViews[i].OutputObject);
                    }
                    topHit.Execute.apply(topHit.Dereference(), args);
                }
                else
                {
                    topHit.Execute(this.InputObject);
                }
            },
            GenerateScores:function(callback)
            {
                var key = this.GetInputKey();
                var object = this.InputObject;
                if (!object)
                {
                   //console.debug("Not generating scores because there is no target object", this.GetName());
                    this.StopRanking();
                    return;
                }
               //console.debug("Generating scores", this.GetName());
                var length = this.Catalog.SearchSet.length;
                var cursor = this._rankingsCursor;
                if (this._lastRankedInputKey != key || cursor >= length)
                {
                    this._rankingsCursor = cursor = 0;
                }
                var end = cursor + 75;
                for (; cursor < end && cursor < length; cursor++)
                {
                    var action = this.Catalog.SearchSet[cursor];
                    if(!action || !action.ScoreObject)
                    {
                        document.title = action;
                    }
                    var objScore = action.ScoreObject(object.Dereference());
                    var actionScore = object.ScoreAction(action);
                    if (objScore != -1 && actionScore != -1)
                    {
                        this.Scores[action.Id] = this.Catalog.Score(action.GetName(), key) + objScore + actionScore;
                    }
                    else
                    {
                        this.Scores[action.Id] = -1;
                    }
                }
                if (cursor >= length && typeof(callback) == "function")
                {
                    callback();
                }
                this._rankingsCursor = cursor;
                this._lastRankedInputKey = key;
            },
            OnRankingFailed:function()
            {
                this.InputObject = null;
                this.OutputObject = null;
            },
            OnCatalogSorted:function(objects,scores)
            {
                var topHit = objects[0];
                var score = scores[topHit.Id];
    
                if (!isNaN(score) && score > .1)
                {
                    this.Precommit(0, objects, scores, true);
                }
                else
                {
                }
                MuZume.WidgetContainer.Reposition();
            },
            Precommit:function(objectIndex, objects, scores, showBrowseWidget)
            {
                var topHit = objects[objectIndex];
                this.OutputObject = topHit.Dereference();
    
                var paramSig;
                if(topHit instanceof MZExecuteScriptAction)
                {
                    paramSig = this.InputObject.GetParameterSignature();
                }
                else
                {
                    paramSig = topHit.GetParameterSignature();
                }
                
                if(paramSig && paramSig == this._parameterSignature)
                {
                    return;
                }
                
                var parameterViews = MuZume.GetParameterViews();
                for(var i=0;i<parameterViews.length;i++)
                {
                    MuZume.WidgetContainer.RemoveWidget(parameterViews[i].Widget);
                }
                MuZume.RemoveAllParameterViews();
                
                this._parameterSignature = null;
                
                if(paramSig)
                {
                    this._parameterSignature = paramSig;
                    for(var i=0;i<paramSig.length;i++)
                    {
                        var param = paramSig[i];
                        var widget = new Widget("black");
                        widget.SetName("Parameter Widget: " + param.GetName());
                        MuZume.WidgetContainer.AddWidget(widget);
                        
                        widget.GetElement().width = Widget.LEFT_SIDE_WIDTH + Widget.RIGHT_SIDE_WIDTH;
                        widget.SetLogo(false);
                        widget.GetElement().style.zIndex = -1;
                        
                        var paramView;
                        
                        if(param instanceof MZPasswordParameter)
                        {
                            paramView = new MZPasswordParameterView(param, widget);
                        }
                        else if(param instanceof MZTextParameter)
                        {
                            paramView = new MZTextParameterView(param, widget);
                        }
                        else
                        {
                            paramView = new MZParameterView(param, widget);
                        }
                        MuZume.AddParameterView(paramView);
                        
                        if(i == 0)
                        {
                            paramView.InputObject = this.OutputObject;
                            paramView.StartRanking();
                        }
                        else if(param instanceof MZTextParameter)
                        {
                            paramView.StartRanking();
                        }
                        
                        widget.Show();
                    }
                }
            }
        });

		var MZBrowseView = MZView.extend({
            __init__:function(widget)
            {
                arguments.callee.$.call(this, "Browse View", null, widget);
            }
        });	
	    var MZParameterView = MZView.extend({
            __init__:function(parameter, widget)
            {
                arguments.callee.$.call(this, parameter.GetName(), parameter.GetCatalog(), widget);
                
                this.UseSmartRanking = false;
                this.UseBackgroundRanking = false;
                
                this.Widget.SetContent("");
                this.Widget.SetCaption("Parameter: " + parameter.GetDescription());
                
                connect(this, "CatalogSorted", this.OnCatalogSorted.bind(this));
            },
			GenerateScores:function(callback)
			{
			    var key = this.GetInputKey();
			    /*var input = this.InputObject;
			    if (!input)
			    {
				   //console.debug("Not generating scores because there is no input object", this.GetName());
				    this.StopRanking();
				    return;
			    }*/
			   //console.debug("Generating scores", this.GetName());
			    var length = this.Catalog.SearchSet.length;
			    var cursor = this._rankingsCursor;
			    if (this._lastRankedInputKey != key || cursor >= length)
			    {
				    this._rankingsCursor = cursor = 0;
			    }
			    var end = cursor + 75;
			    var s = [];
			    for (; cursor < end && cursor < length; cursor++)
			    {
				    var object = this.Catalog.SearchSet[cursor];
			        /*
				    var objScore = action.ScoreObject(object);
				    var actionScore = object.ScoreAction(action);*/
					this.Scores[object.Id] = this.Catalog.Score(object.GetName(), key);
					s.push(object.Id + " : " + this.Scores[object.Id]);
			    }
			    if (cursor >= length && typeof(callback) == "function")
			    {
				    callback();
			    }
			    this._rankingsCursor = cursor;
			    this._lastRankedInputKey = key;
			},
			OnCatalogSorted:function(objects,scores)
            {
                var topHit = objects[0];
                var score = scores[topHit.Id];
    
                if (!isNaN(score) && score > .1)
                {
                    this.Precommit(0, objects, scores, true);
                }
                else
                {
                   //console.debug("Score too low or NaN");
                }
                MuZume.WidgetContainer.Reposition();
            }
		});
		var MZTextParameterView = MZParameterView.extend({
            __init__:function(parameter, widget)
            {
                arguments.callee.$.call(this, parameter, widget);
                this.SetInputKey(parameter.GetDefaultValue() || "");
                this.GetWidget().SetContent(parameter.GetDefaultValue() || "");
            },
            SetInputKey:function(value)
            {
                this._inputKey = value;
                this.Widget.SetMiniContent(this.GetName());
            },
            ClearInputKey:function()
            {
                this.SetInputKey("");
                this.Widget.ClearContent();
            },
            StartRanking:function()
            {
                if (this._isRanking)
                {
                    return;
                }
    
               //console.debug("start ranking " + this.GetInputKey(), this.GetName());
                signal(this, "BeforeStartRanking");
    
                this._isRanking = true;
                this._originalInputKey = this.GetInputKey();
                //console.debug("settings rankings cursor to 0");
                this._rankingsCursor = 0;
                
                signal(this, "StartRanking");
                
                this.Widget.SetContent(this._originalInputKey);
                this.OutputObject = new MZTextObject(this._originalInputKey);
                
                this.StopRanking();
            },
            StopRanking:function()
            { 
                if (!this._isRanking)
                {
                    return;
                }
                signal(this, "BeforeStopRanking");
               //console.debug("stop ranking", this.GetName());
                
                this._isRanking = false;
                signal(this, "StopRanking");
            },
            GenerateScores:function(callback)
            {
                if(typeof(callback) == "function")
                {
                    callback();
                }
            }
		});
		var MZPasswordParameterView = MZTextParameterView.extend({
            __init__:function(parameter, widget)
            {
                arguments.callee.$.call(this, parameter, AbstractPasswordWidget.Wrap(widget));
            },
            SetInputKey:function(value)
            {
                this._inputKey = value;
                this.GetWidget().__SetMiniContent__(this.GetName());
            },
            ClearInputKey:function()
            {
                this.SetInputKey("");
                this.GetWidget().ClearContent();
            }
        });



		// INDEX
		var MZIndexNode = {
		   Create:function(left, right, keys)
		   {
			   return {Key:null,Left:left,Right:right,Keys:keys||[],Id:MZIndexNode.IdCounter++};
		   },
		   IsLeaf:function(node)
		   {
			   return node.Key == null;
		   }
		}
		
		function MZIndex()
		{
			this.ResultKeys = null;
			this.Index = {};
			this.Scores = {};
			this._order = {};
			this._orderCounter = 0;
			this.Root = MZIndexNode.Create();
			this._longestKeyLength = 0;
			this.MaxResults = MZIndex.MAX_RESULTS;
		};
		MZIndex.MAX_KEYS_PER_NODE = 10;
		MZIndex.MAX_RESULTS = 5;
		Object.extend(MZIndex.prototype,
		{
			FindNode:function(key)
			{
				var current = this.Root;
				while (!MZIndexNode.IsLeaf(current))
				{
					if (key >= current.Key)
					{
						current = current.Right;
					}
					else
					{
						current = current.Left;
					}
				}
				return current;
			},
			AddMapping:function(key, object)
			{
				var objects = this.Index[key];
				console.debug("AddMapping: " + key + " : " + object.GetName());
				if (!objects || !(objects instanceof Array))
				{
					if (key.length > this._longestKeyLength)
					{
						this._longestKeyLength = key.length;
					}
					var node = this.FindNode(key);
					if (node.Keys.length >= MZIndex.MAX_KEYS_PER_NODE)
					{
						// split node down the middle
						node.Keys.sort(this.CompareStrings);
						var middle = MZIndex.MAX_KEYS_PER_NODE / 2;
						node.Left = MZIndexNode.Create(null, null, node.Keys.slice(0, middle));
						node.Right = MZIndexNode.Create(null, null, node.Keys.slice(middle));

						node.Key = node.Keys[middle];
						node.Keys = null;

						console.debug("Too many keys in index node. Middle is " + middle + ". Splitting index node at " + node.Key + ".\n Left: " + node.Left.Keys + "\n Right: " + node.Right.Keys + ".");

						if (key >= node.Key)
						{
							node = node.Right;
						}
						else
						{
							node = node.Left;
						}
					}
					node.Keys.push(key);
					objects = this.Index[key] = [];
					this._order[key] = this._orderCounter++;
				}
				objects.push(object);
			},
			CompareStrings:function(a, b)
			{
				if (a > b)
				{
					return 1;
				}
				else if (a < b)
				{
					return -1;
				}
				else
				{
					return 0;
				}
			},
			GenerateScores:function(catalog, key)
			{
				//	var truncated = false;
				if (key.length > this._longestKeyLength)
				{
					//				truncated = true;
					//			console.debug("key being truncated to " + key.substr(0, this._longestKeyLength));
					key = key.substr(0, this._longestKeyLength);
				}
				var node = this.FindNode(key);
				var length = node.Keys.length;
				//			var penalty = 0;
				for (var i = 0; i < length; i++)
				{
					this.Scores[node.Keys[i]] = catalog.Score(node.Keys[i], key)//; - penalty;
				}
				this.ResultKeys = node.Keys;
				/*if(truncated)
					{
						var s = [];
						for(var i=0;i<this.ResultKeys.length;i++)
						{
							s.push(this.ResultKeys[i] + " : " + this.Scores[this.ResultKeys[i]]);
						}
						console.debug("Truncated key matched: " + s.join(","));
					}*/
			},
			_compareSmartIndexKeyScores:function(a, b)
			{
				var rankB = this.Scores[b];
				var rankA = this.Scores[a];
				rankB = rankB?rankB:0;
				rankA = rankA?rankA:0;
				var ret = rankB - rankA;
				if (!ret)
				{
					return this._order[a] - this._order[b];
				}
				return ret;
			}
		});

		function MZCatalog()
		{
			this.Objects = [];
			this.Indices = {};
			this.Indices.Smart = new MZIndex();
			this.Indices.Id = {};
			this.Indices.Shadow = [];
			this.SearchSet = this.Objects;

			registerSignals(this, [
                "ObjectAdded"
            ]);
		};
		Object.extend(MZCatalog.prototype,{
			AddObject:function(object)
			{
				this.Objects.push(object);
				if(!object.IsStored())
				{
					this.Indices.Shadow.push({Name:object.GetName(),Id:object.Id});
				}
				this.Indices.Id[object.Id] = object;
				//this.Indices.Smart.AddMapping(object.GetName().toLowerCase(), object);
				//signal(this, "ObjectAdded", object);
			},
			GetObjects:function()
			{
                return this.Objects;
			},
			Debug:function()
			{
				var s = [];
				for (var i = 0; i < this.Objects.length; i++)
				{
					s.push(this.Objects[i].GetName() + " : " + this.Objects[i].GetData());
				}
				console.debug(s.join("\n"));
			},
			Score:function(actual, key)
			{
				//return this.SmartScore(actual, key) + this.BasicScore(actual, key);
				return this.BasicScore(actual, key);
				//return MuZume.ExternalKernel.ScoreString(actual, key);
			},
			SmartScore:function(actual, key)
			{
				//var lowerActual = actual.toLowerCase();
				//var lowerKey = key.toLowerCase();

				var score = 0;

				// TODO: match most popular items

				// acronym?
				// first letter must be the same

				// TODO: euclidian distance

				return score;
			},
			BasicScore:function(actual, key, actualRange, keyRange)
			{
				if (!actualRange)
				{
					if (actual == key)
					{
						return 2;
					}
					actualRange = new Range(0, actual.length);
				}
				if (!keyRange)
				{
					keyRange = new Range(0, key.length);
				}
				var score,remainingScore;
				var i,j;
				var remainingActualRange = new Range(0, 0);
				if (!keyRange.Length) return 0.9;
				if (keyRange.Length > actualRange.Length) return 0;
				var lowerActual = actual.toLowerCase();
				var lowerKey = key.toLowerCase();
				for (i = keyRange.Length; i > 0; i--)
				{
					var index = lowerActual.substr(actualRange.Location, actualRange.Length).indexOf(lowerKey.substr(keyRange.Location, keyRange.Length));
					if (index == -1)
					{
						continue;
					}
					if (index + keyRange.Length > actualRange.GetMax())
					{
						continue;
					}
					remainingActualRange.Location = index + keyRange.Length;
					remainingActualRange.Length = actualRange.GetMax() - remainingActualRange.Location;

					remainingScore = this.BasicScore(actual, key, remainingActualRange, new Range(keyRange.Location + i, keyRange.Length - i));

					if (remainingScore)
					{
						score = remainingActualRange.Location - actualRange.Location;

						var penalty;
						// ignore skipped characters if is first letter of a word
						if (index > actualRange.Location)
						{
							penalty = .15;
						}
						else
						{
							penalty = .01;
						}
						
						//if some letters were skipped
						j = 0;
						if (actual.charAt(index - 1).match(/[\s]/))
						{
							for (j = index - 2; j >= actualRange.Location; j--)
							{
								if (actual.charAt(j).match(/[\s]/))
								{
									score--;
								}
								else
								{
									score -= penalty;
								}
							}
						}
						else if (actual.charAt(index).match(/[A-Z]/))
						{
							for (j = index - 1; j >= actualRange.Location; j--)
							{
								if (actual.charAt(j).match(/[A-Z]/))
								{
									score--;
								}
								else
								{
									score -= penalty;
								}
							}
						}
						else
						{
							score -= index - actualRange.Location;
						}
						

						score += remainingScore * remainingActualRange.Length;
						score /= actualRange.Length;
						return score;
					}
				}
				return 0;
			}
		});

		function Range(location, length)
		{
			this.Location = location;
			this.Length = length;
		};
		Object.extend(Range.prototype,{
			GetMax:function()
			{
				return this.Location + this.Length;
			}
		});

		function MZObject(name, data, icon, caption, id)
		{
			if (!arguments.length)
			{
				return;
			}
			this.Name = name;
			this.SetData(data);
			this.Id = id || ("d" + (MZObject.IdCounter++).toString()); // d for dynamic, s for stored

			this.SetIcon(icon);
			this._caption = caption;
			
			MZObject.Register(this.Id, this);			
		};
	  	Object.extend(MZObject, {
	  	    __constructor__:"MZObject",
	  	    IdCounter:0,
            Serialize:function(object)
            {
                return {
                    __constructor__:object.GetClass().__constructor__,
                    Name:object.GetName(),
                    Data:object.GetData(),
                    Id:object.GetId(),
                    Icon:$$ICON(object.GetIcon()),
                    Caption:object.GetCaption()
                };
            },
            Deserialize:function(object)
            {
                var obj = new MZObject(object.Name, object.Data, $ICON(object.Icon), object.Caption, object.Id);
                return obj;
            },
            _registry:{},
            Register:function(id, object)
            {
                this._registry[id] = object;
            },
            SwitchId:function(oldId, newId)
            {
                this._registry[newId] = this._registry[oldId];
                delete this._registry[oldId];
            },
            Get:function(id)
            {
                return this._registry[id];
            }
	  	});
		MZObject.inherits(Object,{
            GetName:function()
			{
				return this.Name;
			},
			Dereference:function()
			{
                return this;
			},
			GetData:function()
			{
                return this._data;
			},
			SetData:function(value)
			{
                this._data = value;
			},
			IsStored:function()
			{
				return this.Id.toString().charAt(0) == "s";
			},
			Score:function()
			{
				return 0;
			},
			ScoreAction:function(mzAction)
			{
				return 0;
			},
			GetIcon:function()
			{
				return $(this._icon);
			},
			SetIcon:function(icon)
			{
				if (icon)
				{
					this._icon = $ID(icon);
				}
				else
				{
					this._icon = null;
				}
			},
			GetCaption:function()
			{
				return this._caption;
			},
			SetCaption:function(value)
			{
				this._caption = value;
			},
			GetId:function()
			{
                return this.Id;
			},
			SetId:function(value)
			{
                MZObject.SwitchId(this.Id, value);
                this.Id = value;
			},
			Serialize:function()
			{
                return this.GetClass().Serialize(this);
			},
			toString:function()
			{
                return this.GetId() + ": " + this.GetName()
			}
	  	});
	  	
        function MZObjectReference(name, reference, icon, caption)
		{
            MZObject.call(this, name, reference, icon, caption);
		};
	  	Object.extend(MZObjectReference, {
	  	    __constructor__:"MZObjectReference",
            Serialize:function(object)
            {
                var o = MZObject.Serialize(object);
                o.Data = object.GetData().GetId();
                //console.info("Serialized MZObjectReference %o.  Result is %o", object, o);
                return o;
            },
            Deserialize:function(object)
            {
                var o = MZObject.Deserialize(object);
                var instance = new MZObjectReference(o.GetName(), MZObject.Get(o.GetData()), o.GetIcon(), o.GetCaption());
                instance.SetId(object.Id);
                //console.info("Deserialized MZObjectReference %o.  Result is %o", object, instance);
                return instance;
            }
	  	});
		MZObjectReference.inherits(MZObject, {
            Dereference:function()
            {
                return this.GetData(); // TODO: In some places where an object is retrieved, we must check if it is an object reference and retrieve the referenced object instead
            },
			GetName:function()
			{
				return this.Name;
			},
			IsStored:function()
			{
				return this.Id.toString().charAt(0) == "s";
			},
			Score:function()
			{
                return this.Dereference().Score();
			},
			ScoreAction:function(mzAction)
			{
                return this.Dereference().ScoreAction(mzAction);
			}
		});

		function MZPluralObject(name, objects, icon, caption)
		{
			MZObject.call(this, name, objects || [], icon, caption);
		};
		MZPluralObject.inherits(MZObject, {
			GetObjects:function()
			{
				return this.GetData();
			},
			AddObject:function(object)
			{
				this.GetObjects().push(object);
			}
		});

		function MZAction(name, data, icon, caption)
		{
			MZObject.call(this, name, data, icon, caption);
			this._parameterSignature = [];
		};
		MZAction.inherits(MZObject, {
			ScoreObject:function(object)
			{
				return -1;
			},
			Execute:function(object)
			{
			},
			GetParameterSignature:function()
			{
				return this._parameterSignature;
			},
			SetParameterSignature:function(value)
			{
                this._parameterSignature = value;
			}
		});
		
		function MZParameter(name, catalog, description)
		{
			this._name = name;
			this._catalog = catalog;
			this._description = description || name;
		};
		MZParameter.inherits(Object,{
			GetName:function()
			{
				return this._name;
			},
			GetCatalog:function()
			{
				return this._catalog;
			},
			GetDescription:function()
			{
                return this._description;
			}
		});
		
		function MZTextParameter(name, defaultValue)
		{
            MZParameter.call(this, name, MZTextParameter.NullCatalog);
            this._defaultValue = defaultValue || "";
		};
		MZTextParameter.NullCatalog = new MZCatalog();
		MZTextParameter.inherits(MZParameter,{
            GetDefaultValue:function()
            {
                return this._defaultValue;
            }
		});
		
		function MZPasswordParameter(name, defaultValue)
		{
            MZTextParameter.call(this, name, defaultValue);
		};
		MZPasswordParameter.inherits(MZTextParameter);
		
		function MZNotification(text,icon)
		{
			registerSignals(this,["Show"]);
			this._text = text;
			this._icon = icon;
		}
		MZNotification.inherits(Object,{
			GetText:function()
			{
				return this._text;
			},
			GetIcon:function()
			{
				return this._icon;
			},
			toString:function()
			{
                return this.GetText();
			}
        });

		var MZModuleInterface = {
			GetLoadedModule:function(name)
			{
				return MuZume.GetLoadedModule(name);
			},
			CreateCatalog:function()
			{
				return new MZCatalog();
			},
			GetObjectCatalog:function()
			{
				return MuZume.ObjectView.Catalog;
			},
			GetActionCatalog:function()
			{
				return MuZume.ActionView.Catalog;
			}
		};

		// USER INTERFACE

		function WidgetContainer()
		{
			var elm = document.createElement("DIV");
//			elm.className = "MuZume";
			var id = this._element = $ID();
			elm.setAttribute("id", id);
			elm.setAttribute("align", "middle");
			elm.style.backgroundColor = "transparent";
			//elm.style.width = "400px";
			elm.style.borderStyle = "none";
			elm.style.marginBottom = "0px";
			elm.style.display = "block";
			elm.style.position = "fixed";
			elm.style.zIndex = 99999;
			elm.style.top = "0px";
			elm.style.left = "0px";

			var table = document.createElement("TABLE");
			table.style.backgroundColor = "transparent";
			table.setAttribute("border", 0);
			table.setAttribute("cellpadding", 0);
			table.setAttribute("cellspacing", 0);
			table.style.width = IS_IE?"100%":"inherit";

			id = this._trElement = id + "-tr";
			this._trElement = id;
			var tr = document.createElement("TR");
			tr.setAttribute("id", id);
			table.appendChild(tr);
			elm.appendChild(table);
			document.documentElement.appendChild(elm);
			
			tr = null;
			table = null;

			this.Widgets = [];

			this._repositionThread = new XaeiOS.Thread(this,this._reposition,1,"Reposition UI Thread"); // high priority ui thread
			this.RepositionNow();
			//elm.style.posLeft = this._targetPosLeft;
			//elm.style.posTop = this._targetPosTop;
			elm = null;
		};
		WidgetContainer.IdCounter = 0;
		var _p = WidgetContainer.prototype;
		_p.GetElement = function()
		{
			return $(this._element);
		};
		_p.AddWidget = function(widget)
		{
			var td = document.createElement("TD");
			var element = widget.GetElement();
			td.appendChild(element);
			$(this._trElement).appendChild(td);
			element.style.left = "-" + (this.Widgets.length * 80) + "px";
			if(!this.Widgets.length)
			{
				element.style.zIndex = 0;
			}
			else
			{
				element.style.zIndex = parseInt(this.Widgets[this.Widgets.length - 1].GetElement().style.zIndex) - 1;
			}
			this.Widgets.push(widget);
			this.RepositionNow();
			td = null;
		};
		_p.RemoveWidget = function(widget)
		{
			var widgets = this.Widgets;
			var newWidgets = [];
			var td;
			var trElement = $(this._trElement);
			for(var i=0;i<widgets.length;i++)
			{
				if(widgets[i] == widget)
				{
					// remove column from table
					widget.ForceHide();
					widget.Dispose();
					td = widget.GetElement().parentNode;
					trElement.removeChild(td);
				}
				else
				{
					newWidgets.push(widgets[i]);
				}
			}
			td = null;
			trElement = null;
			this.Widgets = newWidgets;
			this.RepositionNow();
		};
		_p._restartRepositionThread = function()
		{
			var element = this.GetElement();
			element.style.posTop = this._targetPosTop;
			element.style.posLeft = this._targetPosLeft;
			element = null;
			/*
			if(this._repositionThread.IsRunning())
			{
				return;
			}
			this._repositionThread = new XaeiOS.Thread(this,this._reposition,1,"Reposition UI Thread"); // regular priority ui thread
			clearTimeout(this._startRepositionThreadTimeoutId);
			this._startRepositionThreadTimeoutId = setTimeout(this._repositionThread.Start.bind(this._repositionThread),150);
			*/
		};
		_p.Reposition = function()
		{
			if(!this._repositionTimeout)
			{
				this._repositionTimeout = setTimeout(this._reposition.bind(this), 1);
			}
		}
		_p._reposition = function()
		{
			var element = this.GetElement();
			var width, height;
            if( typeof( window.innerWidth ) == 'number' ) {
                //Non-IE
                width = window.innerWidth;
                height = window.innerHeight;
              } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                //IE 6+ in 'standards compliant mode'
                width = document.documentElement.clientWidth;
                height = document.documentElement.clientHeight;
              } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
                //IE 4 compatible
                width = document.body.clientWidth;
                height = document.body.clientHeight;
              }
			this._targetPosTop = Math.ceil(height / 3);
			this._targetPosLeft = Math.ceil(((width - element.clientWidth) / 2));
			
			element.style.top = this._targetPosTop + "px";
			element.style.left = this._targetPosLeft + "px";
			element = null;
			
			this._repositionTimeout = null;
			
			/*if(!this._repositionThread.IsRunning())
			{
				this._restartRepositionThread();
			}*/
		};
		_p.RepositionNow = function()
		{
			this._reposition();
			/*
			var element = this.GetElement();
			element.style.posTop = this._targetPosTop;
			element.style.posLeft = this._targetPosLeft;
			element = null;
			*/
		};
		/*_p._reposition = function()
		{
			var element = this.GetElement();
			var posTop = element.style.posTop;
			var posLeft = element.style.posLeft;
			var halfDone = false;
			
			var dy = this._targetPosTop - posTop;
			if(dy  == 0)
			{
				halfDone = true;
			}
			else if(dy > 15)
			{
				elementy.style.posTop += dy;
			}
			else if(dy > 3)
			{
				element.style.posTop += Math.min(30,Math.ceil(Math.sqrt(dy)));
			}
			else if(dy < -15)
			{
				elememt.style.posTop += dy;
			}
			else if(dy < -3)
			{
				element.style.posTop -= Math.min(30,Math.ceil(Math.sqrt(-dy)));
			}
			else
			{
				halfDone = true;
			}
			
			var dx = this._targetPosLeft - posLeft;
			if(dx == 0 && halfDone)
			{
				element = null;
				return;
			}
			else if(dx > 15)
			{
				element.style.posLeft = this._targetPosLeft;
			}
			else if(dx > 3)
			{
				element.style.posLeft += Math.min(30,Math.ceil(Math.sqrt(dx)));
			}
			else if(dx < -15)
			{
				element.style.posLeft = this._targetPosLeft;
			}
			else if(dx < -3)
			{
				element.style.posLeft -= Math.min(30,Math.ceil(Math.sqrt(-dx)));
			}
			else if(halfDone)
			{
				element = null;
				return;
			}
			element = null;	
//			XaeiOS.Thread.Sleep(30);
			__YIELD__;
		};*/

		function Widget(color) // TODO: Change this to TubeWidget and derive from AbstractWidget (using new Class system)
		{
			registerSignals(this, ["BeforeShow","Show","Hide"]);
			if (!color)
			{
				color = "blue";
			}
			
            this._asyncOperations = new AsyncOperations();
            
			var div = document.createElement("DIV");
			div.setAttribute("width", Widget.WIDTH);
			div.setAttribute("height", Widget.HEIGHT);
			div.style.visibility = "hidden";
			this._element = $ID(div);
			
			var elm = document.createElement("TABLE");
			elm.setAttribute("cellspacing", 0);
			elm.setAttribute("cellpadding", 0);
			elm.style.borderStyle = "none";
			
			div.appendChild(elm);

			var tr = document.createElement("TR");

			var leftTd = document.createElement("TD");
			leftTd.setAttribute("width", Widget.LEFT_SIDE_WIDTH);
			this._leftTd = $ID(leftTd);

			var leftSideImg = document.createElement("IMG");
			leftSideImg.style.borderStyle = "none";
			leftSideImg.src = prefix + "/images/widgets/TubeWidget/" + color + "/widget-left-side.png";
			leftTd.appendChild(leftSideImg);
			tr.appendChild(leftTd);
			this._leftSideImg = $ID(leftSideImg);

			var iconTd = document.createElement("TD");
			iconTd.setAttribute("align", "right");
			iconTd.setAttribute("style", "background-repeat:x;background-image:url(" + prefix + "/images/widgets/TubeWidget/" + color + "/widget-middle.png);vertical-align:middle;padding-top:5px;padding-right:5px;height:" + Widget.HEIGHT + ";overflow-y:hidden;overflow-x:auto;");
			tr.appendChild(iconTd);
			this._iconTd = $ID(iconTd);

			var middleTd = document.createElement("TD");
			middleTd.setAttribute("width", "100%");
			middleTd.setAttribute("style", "background-repeat:x;background-image:url(" + prefix + "/images/widgets/TubeWidget/" + color + "/widget-middle.png);vertical-align:top;padding-top:15px;");
			this._middleTd = $ID(middleTd);

			var topLineContainer = document.createElement("NOBR");
			
			var miniContentElement = document.createElement("SPAN");
//			miniContentElement.setAttribute("style", "white-space:nowrap;left:-8px;position:relative;");
			miniContentElement.setAttribute("style", "white-space:nowrap;font-family:Lucida Sans, Trebuchet MS, Tahoma, sans-serif;font-size:12px;font-weight:bold;color:white;text-shadow:#000000 3px 3px 3px;line-height:12px;text-transform:uppercase;");
			miniContentElement.innerHTML = "&nbsp;";
			this._miniContentElement = $ID(miniContentElement);
			
			var relevanceImg = document.createElement("IMG");
			relevanceImg.setAttribute("style","position:relative;left:10px;float:right;");
			this._relevanceImg = $ID(relevanceImg);

			var contentElement = document.createElement("DIV");
			contentElement.setAttribute("style", "white-space:nowrap;font-family:Lucida Sans, Trebuchet MS, Tahoma, sans-serif;font-size:22px;font-weight:bold;color:white;text-shadow:#000000 3px 3px 3px;text-align:middle;");
			this._contentElement = $ID(contentElement);

			var captionElement = document.createElement("DIV");
			captionElement.setAttribute("style", "white-space:nowrap;font-family:Lucida Sans, Trebuchet MS, Tahoma, sans-serif;font-size:12px;font-weight:bold;color:white;text-shadow:#000000 3px 3px 3px;line-height:12px;left:0px;left:-8px;position:relative;");
			captionElement.innerHTML = "&nbsp;";
			this._captionElement = $ID(captionElement);

			topLineContainer.appendChild(miniContentElement);
			topLineContainer.appendChild(relevanceImg);
			
			middleTd.appendChild(topLineContainer);
			middleTd.appendChild(contentElement);
			middleTd.appendChild(captionElement);
			
			tr.appendChild(middleTd);

			var rightTd = document.createElement("TD");
			rightTd.setAttribute("width", Widget.RIGHT_SIDE_WIDTH);
			rightTd.style.borderStyle = "none";
			this._rightTd = $ID(rightTd);

			var rightSideImg = document.createElement("IMG");
			rightSideImg.style.borderStyle = "none";
			rightSideImg.src = prefix + "/images/widgets/TubeWidget/" + color + "/widget-right-side.png";
			rightTd.appendChild(rightSideImg);
			tr.appendChild(rightTd);
			this._rightSideImg = $ID(rightSideImg);

			elm.appendChild(tr);

			this._changingVisibility = false;
			this._visible = false;

			$BH(div);

			this._logo = true;
			this.SetColor(color);
			
			this.SetRelevance(0);
			this._name = "";

			//Event.observe(elm, 'click', this._onClick.bind(this), false);
		};
		Widget.WIDTH = 300;
		Widget.LEFT_SIDE_WIDTH = 81;
		Widget.RIGHT_SIDE_WIDTH = 40;
		Widget.HEIGHT = 85;
		Widget.IdCounter = 0;
		var _p = Widget.prototype;
		_p.Dispose = function()
		{
            this._asyncOperations.CancelAll();
            if(this._uiThread && this._uiThread.IsRunning())
            {
                this._uiThread.Abort();
            }
		};
		_p.toString = function()
		{
			return this.GetName();
		};
		_p.GetName = function()
		{
			return this._name;
		};
		_p.SetName = function(value)
		{
			this._name = value;
		};
		_p.GetElement = function()
		{
			return $(this._element);
		};
		_p.SetRelevance = function(value)
		{
			var img = $(this._relevanceImg);
			var ordinal;
			if(value < .05)
			{
				img.style.visibility = "hidden";
				return;
			}
			else
			{
				img.style.visibility = "visible";
			}
			
			if(value < .4)
			{
				ordinal = 1;
			}
			else if(value < .65)
			{
				ordinal = 2;
			}
			else if(value < .9)
			{
				ordinal = 3;
			}
			else
			{
				ordinal = 4;
			}
			img.src = prefix + "/images/"+ordinal+"-bars.png";
		};
		_p.SetColor = function(color)
		{
			if (this._color == color)
			{
				return;
			}
			var captionElement = $(this._captionElement);
			var contentElement = $(this._contentElement);
			var miniContentElement = $(this._miniContentElement);
			if(color == "glass")
			{
				captionElement.style.color = "black";
				captionElement.style.textShadow = "#ffffff 1px 1px 3px";
				
				contentElement.style.color = "black";
				contentElement.style.textShadow = "#ffffff 1px 1px 3px";
				
				miniContentElement.style.color = "black";
				miniContentElement.style.textShadow = "#ffffff 1px 1px 3px";
			}
			else
			{
				captionElement.style.color = "white";
				captionElement.style.textShadow = "#000000 3px 3px 3px";
				
				contentElement.style.color = "white";
				contentElement.style.textShadow = "#000000 3px 3px 3px";
				
				miniContentElement.style.color = "white";
				miniContentElement.style.textShadow = "#000000 3px 3px 3px";		
			}
			this._color = color;
			$(this._middleTd).style.backgroundImage = $(this._iconTd).style.backgroundImage = "url(" + prefix + "/images/widgets/TubeWidget/" + color + "/widget-middle.png)";
			$(this._rightSideImg).src = prefix + "/images/widgets/TubeWidget/" + color + "/widget-right-side.png";
			this._setLogo(this._logo);
		};
		_p.SetIcon = function(icon)
        {
            if(icon)
            {
                this._asyncOperations.SetTimeout(this._setIcon.bind(this, $ID(icon)),10, "Set Icon"); // TODO: create a separate thread with a queue to set these icons
            }
            else
            {
                this.ClearIcon();
            }
        };
        _p._setIcon = function(icon)
        {
            if (this._currentIcon)
            {
                var currentIcon = $(this._currentIcon);
                currentIcon.parentNode.removeChild(currentIcon);
            }
            icon = $(icon);
            icon = icon.cloneNode(true);
            this._setIconStyle(icon);
            $(this._iconTd).appendChild(icon);
            this._currentIcon = $ID(icon, true);
        };
        _p.ClearIcon = function()
        {
            this._asyncOperations.TryCancelTimeoutByName("Set Icon");
            if (this._currentIcon)
            {
                var currentIcon = $(this._currentIcon);
                currentIcon.parentNode.removeChild(currentIcon);
                this._currentIcon = null;
            }
        };
		/*_p.SetIcon = function(icon)
		{
			if (icon)
			{
				if (this._currentIcon)
				{
					$BH($(this._currentIcon));
				}
                this._setIconStyle(icon);
                $(this._iconTd).appendChild(icon);
				this._currentIcon = $ID(icon);
			}
			else
			{
				this.ClearIcon();
			}
		};
		_p.ClearIcon = function()
		{
			if (this._currentIcon)
			{
				$BH($(this._currentIcon));
				this._currentIcon = null;
			}
		};*/
		_p._setIconStyle = function(icon)
		{
			if(this._logo)
			{
				icon.style.left = "-8px";
			}
			else
			{
				icon.style.left = "-3px";
			}
			if (icon._styleSet)
			{
				return;
			}
			var dimensions = Element.getDimensions(icon);
			if(!dimensions.width)//typeof(dimensions.width) == "undefined")
			{
				dimensions.width = dimensions.height = 50;
			}
			if ((dimensions.width > 49) || (dimensions.height > 49))
			{
				var width;
				var height;
				if (dimensions.width > dimensions.height)
				{
					width = 49;
					height = dimensions.height / dimensions.width * 49;
				}
				else
				{
					height = 49;
					width = dimensions.width / dimensions.height * 49;
				}
				icon.style.width = width + "px";
				icon.style.height = height + "px";
				icon.style.position = "relative";
			}
			icon._styleSet = true;
		};
		_p.SetCaption = function(caption)
		{
			$(this._captionElement).innerHTML = caption;
		};
		_p.ClearCaption = function()
		{
			$(this._captionElement).innerHTML = "&nbsp;";
		};
		_p.SetLogo = function(b)
		{
			if (b == this._logo)
			{
				return;
			}
			this._setLogo(b);
		};
		_p._setLogo = function(b)
		{
			if (!b)
			{
				$(this._leftSideImg).src = prefix + "/images/widgets/TubeWidget/" + this._color + "/widget-left-side-no-icon.png";
				$(this._element).style.position = "relative";
			}
			else
			{
				$(this._leftSideImg).src = prefix + "/images/widgets/TubeWidget/" + this._color + "/widget-left-side.png"
				$(this._element).style.position = "relative";
			}
			this._logo = b;
		};
		_p.SetMiniContent = function(content)
		{
			$(this._miniContentElement).innerHTML = content + "&nbsp;";
		};
		_p.ClearMiniContent = function()
		{
			$(this._miniContentElement).innerHTML = "&nbsp;";
		};
		_p.SetContent = function(content)
		{
			$(this._contentElement).innerHTML = content + "&nbsp;";
		};
		_p.GetContent = function()
		{
			return $(this._contentElement).innerHTML;
		};
		_p.AppendContent = function(content)
		{
			$(this._contentElement).innerHTML += content;
		};
		_p.BackspaceContent = function()
		{
			$(this._contentElement).innerHTML = this._content;
		};
		_p.ClearContent = function()
		{
			this.SetContent("");
		},
		_p._onClick = function()
		{
		};
		_p.IsShown = function()
		{
			return this._visible;
		},
		_p.Show = function()
		{
			if (this._visible)
			{
				return;
			}
			if(this._changingVisibility)
			{
				this._uiThread.Abort();
			}
			this._visible = true;
			this._changingVisibility = true;
			
			this._uiThread = new XaeiOS.Thread(this,this._show,1,"UI Thread"); // high priority ui thread
			Element.setOpacity(this._element, 0);
			this._opacity = 0;
			
			this._uiThread.Start()
		};
		_p._show = function()
		{
			while(this._opacity < 1)
			{
				this._opacity += .3;
				Element.setOpacity(this._element, this._opacity);
				$(this._element).style.visibility = "visible";
				__YIELD__;
			}
			this._changingVisibility = false;
			signal(this, "Show");
		};
		_p.Hide = function()
		{
			if (!this._visible)
			{
				return;
			}
			if(this._changingVisibility)
			{
				this._uiThread.Abort();
			}
			this._changingVisibility = true;
			this._visible = false;
			
			this._uiThread = new XaeiOS.Thread(this,this._hide,1,"UI Thread"); // high priority ui thread			
			Element.setOpacity(this._element, .9);
			this._opacity = .9;
			
			this._uiThread.Start();
		};
		_p._hide = function()
		{
			while(this._opacity > 0)
			{
				this._opacity -= .3;
				Element.setOpacity(this._element, this._opacity);
				__YIELD__;
			}
			$(this._element).style.visibility = "hidden";
			this._changingVisibility = false;
			this._visible = false;
			signal(this, "Hide");
		};	
		_p.ForceHide = function()
		{
			if(this._changingVisibility)
			{
				this._uiThread.Abort();
				this._changingVisibility = false;
			}
			this._visible = false;
			this._opacity = 0;
			Element.setOpacity(this._element, this._opacity);
			$(this._element).style.visibility = "hidden";
			signal(this, "Hide");
		};
		_p.CueRankingFailed = function()
		{
			if(this._cueingRankingFailed)
			{
                return;
			}
			this._cueingRankingFailed = true;
			
			this._cueRankingFailedThread = new XaeiOS.Thread(this,this._cueRankingFailed,1,"Cue Ranking Failed UI Thread"); // high priority ui thread
			this._cueRankingFailedThread.Start();		  
		};
		_p._cueRankingFailed = function()
		{
            // TODO: Play a sound
            this._cueingRankingFailed = false;
		};
		_p.CueStartRanking = function()
		{
		  this.Show();
		};
		
		function AbstractPasswordWidget(color)
		{
            Widget.call(this, color);
		}
		Object.extend(AbstractPasswordWidget, {
            Functions: {
                SetContent:function(value)
                {
                    return this.__SetContent__(value?new Array(value.length+1).join("*"):value);
                },
                SetMiniContent:function(value)
                {
                    return this.__SetMiniContent__(value?new Array(value.length+1).join("*"):value);
                }
            },
            Wrap:function(widget)
            {
                for(var i in this.Functions)
                {
                    if(typeof(this.Functions[i]) == "function")
                    {
                        var saved = widget[i];
                        widget[i] = this.Functions[i].bind(widget);
                        widget["__" + i + "__"] = saved;
                    }
                }
                return widget;
            }
        });
		
		function BrowseWidget(color)
		{
			registerSignals(this, ["BeforeShow","Show","Hide","SelectItem"]);
			color = "ffffff";
			var element = document.createElement("DIV");
			element.style.visibility = "hidden";
			
			this._tableElement = $ID();
			this._fractionElement = $ID();
			this._listTable = $ID();
			this._miniContentElement = $ID();
			this._listTableContainer = $ID();
			this._resizeGrip = $ID();
			
			var replacements = [
				[/\{widget-base\}/g,prefix + "/images/widgets"],
				[/\{skin-base\}/g,prefix + "/images/widgets/" + "BrowseWidget/" + color],				
				[/\{table-element\}/g, this._tableElement],
				[/\{fraction-element\}/g, this._fractionElement],
				[/\{list-table-container\}/g, this._listTableContainer],
				[/\{list-table\}/g, this._listTable],
				[/\{mini-content-element\}/g, this._miniContentElement],
				[/\{resize-grip\}/g, this._resizeGrip]
			];
			
			var s = BrowseWidget.TEMPLATE;
			for(var i=0;i<replacements.length;i++)
			{
				s = s.replace(replacements[i][0], replacements[i][1]);
			}
			element.innerHTML = s;
			
			element.style.height = BrowseWidget.HEIGHT + "px";
			element.style.width = BrowseWidget.WIDTH + "px";
			
			$BH(element);
			this._element = $ID(element);
			element = null;
			
			this._color = color;
			this._items = [];			
			this._visible = false;
			this._changingVisibility = false;
			this._currentSelection = -1;
			
			// handle
			var widgetElement = $(this._element);
			var resizeGrip = $(this._resizeGrip);
			var listTableContainerElement = $(this._listTableContainer);
			
			var clientX;
			var clientY;
			var srcElement;
			
			var startX = 0;
			var startY = 0;
			var startWidth = 0;
			var startHeight = 0;
			
			document.body.appendChild(widgetElement);
			
			var minWidth = widgetElement.offsetWidth;
			var minHeight = widgetElement.offsetHeight;
			
			var listTableContainerHeightDifference = widgetElement.offsetHeight - listTableContainerElement.offsetHeight;
			var listTableContainerWidthDifference = widgetElement.offsetWidth - listTableContainerElement.offsetWidth;

			$BH(widgetElement);
			
			var isDragging = false;
			var dragIntervalId;
			
			this.ResizeGripOnMouseDown = function()
			{
				if(isDragging)
				{
					return;
				}
				var widgetElement = $(this._element);
				startX = clientX - widgetElement.style.posLeft;
				startY = clientY - widgetElement.style.posTop;
				startWidth = widgetElement.offsetWidth;
				startHeight = widgetElement.offsetHeight;
				
				isDragging = true;
				
				dragIntervalId = setInterval(this.OnDrag,23);
				
				return false;
			}.bind(this);
			this.OnDrag = function()
			{
				var listTableContainerElement = $(this._listTableContainer);
				var widgetElement = $(this._element);
				var x = clientX - widgetElement.style.posLeft;
				var y = clientY - widgetElement.style.posTop;
				
				var newWidth = (startWidth + x - startX);
				if(newWidth < minWidth)
				{
					newWidth = minWidth;
					startX = MuZume._browseWidgetContainer.GetElement().style.posLeft + minWidth - 10;
				}
				else
				{
					startX = x;
				}
				var newHeight = (startHeight + y - startY);
				if(newHeight < minHeight)
				{
					newHeight = minHeight;
					startY = MuZume._browseWidgetContainer.GetElement().style.posTop + minHeight - 10;
				}
				else
				{
					startY = y;
				}
				
				widgetElement.style.width = newWidth + "px";
				widgetElement.style.height = newHeight + "px";
				
				listTableContainerElement.style.height = (newHeight - listTableContainerHeightDifference) + "px";
				listTableContainerElement.style.width = (newWidth - listTableContainerWidthDifference) + "px";
				
				startWidth = widgetElement.offsetWidth;
				startHeight = widgetElement.offsetHeight;
				
				this.ResizeItems();
			}.bind(this);

			resizeGrip.onmousedown = this.ResizeGripOnMouseDown;
			document.documentElement.onmouseup = function()
			{
				isDragging = false;
				clearInterval(dragIntervalId);
			};
			document.onmousemove = function(e)
			{
				e = e || window.event;
				clientX = e.clientX;
				clientY = e.clientY;
			}
		};
		BrowseWidget.HEIGHT = 200;
		BrowseWidget.WIDTH = 280;
		BrowseWidget.INNER_HEIGHT = 140;
		BrowseWidget.TEMPLATE = '<table id="{table-element}" border="0" cellpadding="0" cellspacing="0" style="width:100%;height:100%;opacity:1;"> \
  <tr> \
   <td><img id="{top-left}" src="{skin-base}/top-left.png" width="28" height="28" border="0" alt=""></td> \
   <td rowspan="2"><img src="{skin-base}/main-area.png" width="215" height="153" border="0" alt=""></td> \
   <td background="{skin-base}/top-extender.png" width="100%" height="28" border="0" alt=""></td> \
   <td><img name="topright" src="{skin-base}/top-right.png" width="32" height="28" border="0" alt=""></td> \
  </tr> \
  <tr> \
   <td><img name="leftside" src="{skin-base}/left-side.png" width="28" height="125" border="0" alt=""></td> \
   <td background="{skin-base}/main-area-right-extender.png" width="100%" height="125" border="0" alt=""></td> \
   <td><img name="rightside" src="{skin-base}/right-side.png" width="32" height="125" border="0" alt=""></td> \
  </tr> \
  <tr> \
   <td background="{skin-base}/left-side-extender.png" width="28" height="100%" border="0" alt=""></td> \
   <td colspan="2" background="{skin-base}/main-area-bottom-extender.png" width="100%" height="100%" border="0" alt=""></td> \
   <td background="{skin-base}/right-side-extender.png" width="32" height="100%" border="0" alt=""></td> \
  </tr> \
  <tr> \
   <td><img name="bottomleft" src="{skin-base}/bottom-left.png" width="28" height="28" border="0" alt=""></td> \
   <td colspan="2" background="{skin-base}/bottom.png" width="100%" height="28" alt="" style="white-space:nowrap;font-family:Lucida Sans, Trebuchet MS, Tahoma, sans-serif;font-size:10px;font-weight:bold;color:#000000;text-shadow:#ffffff 1px 1px 3px;"><div style="height:100%" id="{fraction-element}">...</div></td> \
   <td><img src="{skin-base}/bottom-right.png" width="32" height="28" border="0" alt=""></td> \
  </tr> \
</table> \
 \
<table style="position:absolute;top:2px;left:-45px;" cellpadding="0" cellspacing="0" border="0"> \
<tr> \
<td><img src="{widget-base}/CloudWidget/left.png"></td> \
<td background="{widget-base}/CloudWidget/extender.png"> \
 \
<div id="{mini-content-element}" style="position:relative;left:-10px;white-space:nowrap;font-family:Lucida Sans, Trebuchet MS, Tahoma, sans-serif;font-size:10px;font-weight:bold;color:#000000;text-shadow:#ffffff 1px 1px 3px;line-height:10px;text-transform:uppercase;">&nbsp;</div> \
 \
</td> \
<td> \
<img src="{widget-base}/CloudWidget/right.png"> \
</td> \
</tr> \
</table> \
 \
<table border=0 cellspacing=0 cellpadding=0 style="position:absolute;top:30px;left:6px;width:100%;height:100%;"> \
<tr> \
<td> \
 \
<div id="{list-table-container}" style="height:140px;width:262px;overflow:auto;"> \
<table border="0" cellpadding="0" cellspacing="0" style="width:100%;height:100%;"> \
<tbody id="{list-table}" style="overflow-x:hidden"> \
<tr><td></td></tr> \
</tbody> \
</table> \
</div> \
 \
</td> \
<td style="width:14px;">&nbsp;</td> \
</tr> \
<tr> \
<td style="height:60px;"><div id="{resize-grip}" style="position:absolute;width:16px;height:16px;right:18px;bottom:40px"></div></td> \
<td style="width:14px;height:60px;">&nbsp;</td> \
</tr> \
</table>';
		BrowseWidget.inherits(Object, {
			ResizeItems:function()
			{
				var container = $(this._listTableContainer);
				var captionElement;
				var titleElement;
				var mainTd;
				var maxWidth = container.offsetWidth;
				for(var i=0;i<this._items.length;i++)
				{
					var itm = this._items[i];
					captionElement = $(itm._captionElement);
					titleElement = $(itm._titleElement);
/*					mainTd = $(itm._mainTd);
					
					// which one is wider?
					var originalWidth = mainTd.offsetWidth;
					var widerElement;
					var baseString;
					var baseLength;
					captionElement.innerHTML = itm._caption.substr(0,itm._caption.length-1);
					if(mainTd.offsetWidth < originalWidth)
					{
						widerElement = captionElement;
						baseString = itm._caption;
						baseLength = baseString.length-2;
					}
					else
					{
						widerElement = titleElement;
						baseString = itm._title;
						baseLength = baseString.length-2;
					}
					captionElement.innerHTML = itm._caption;
					
					var j = 10;
					while(mainTd.offsetWidth >= maxWidth && --j > 0)
					{
						widerElement.innerHTML = baseString.substr(0,--baseLength);
					}					
	*/				
					titleElement.innerHTML = itm._title.substr(0,Math.floor(container.clientWidth/10));
					if(titleElement.innerHTML.length < itm._title.length)
					{
						titleElement.innerHTML += "...";
					}
					if(itm._caption)
					{
						captionElement.innerHTML = itm._caption.substr(0,Math.floor(container.clientWidth/7));
						if(captionElement.offsetWidth < maxWidth)
						{
							captionElement.innerHTML = itm._caption.substr(0,Math.floor(container.clientWidth/7));
						}
						if(captionElement.innerHTML.length < itm._caption.length)
						{
							captionElement.innerHTML += "...";
						}
					}
					else
					{
						captionElement.innerHTML = "&nbsp;";
					}
				}
			},
			GetElement:function()
			{
				return $(this._element);
			},
			SetFraction:function(num, den)
			{
				$(this._fractionElement).innerHTML = num + " of " + den;
			},
			ClearFraction:function()
			{
				$(this._fractionElement).innerHTML = "...";
			},
			SetMiniContent:function(value)
			{
				$(this._miniContentElement).innerHTML = value || "&nbsp;";
			},
			ClearMiniContent:function()
			{
				$(this._miniContentElement).innerHTML = "&nbsp;";
			},
			SelectItem:function(index)
			{
				if(index < 0 || index >= this._items.length)
				{
					throw new Error("Index out of range");
				}
				if(this._currentSelection > -1)
				{
					this._items[this._currentSelection].SetSelected(false);
				}
				this._currentSelection = index;
				this._items[index].SetSelected(true);
				this.SetFraction(index+1, this._items.length);
				signal(this, "SelectItem", this._items[index]);
			},
			GetSelection:function()
			{
				return this._currentSelection;
			},
			AddItem:function(itm)
			{
				itm._index = this._items.length;
				itm._owner = this;
				this._items.push(itm);
				var elm = $(this._listTable);
				elm.insertBefore(itm.GetElement(),elm.lastChild);
				elm = null;
				this.ResizeItems();
			},
			GetItems:function()
			{
				return this._items;
			},
			Clear:function()
			{
				var elm = $(this._listTable);
				for(var i=0;i<this._items.length;i++)
				{
					this._items[i].ClearIcon();
					elm.removeChild(this._items[i].GetElement());
				}
				this._items.length = 0;
				elm = null;
				this._currentSelection = -1;
			},
			ClearFrom:function(index)
			{
				var elm = $(this._listTable);
				for(var i=index;i<this._items.length;i++)
				{
					this._items[i].ClearIcon();
					elm.removeChild(this._items[i].GetElement());
				}
				this._items = this._items.slice(0,index);
				elm = null;
				if(this._currentSelection >= index)
				{
                    this._currentSelection = -1;
                }
                    
			},
			IsShown:function()
			{
				return this._visible;
			},
			Show:function()
			{
				if (this._visible)
				{
					return;
				}
				signal(this, "BeforeShow");
				if(this._changingVisibility)
				{
					this._uiThread.Abort();
				}
				this._visible = true;
				this._changingVisibility = true;
				
				this._uiThread = new XaeiOS.Thread(this,this._show,1,"UI Thread"); // high priority ui thread
				Element.setOpacity(this._element, 0);
				this._opacity = 0;
				
				setTimeout(function()
				{
					$(this._element).style.visibility = "visible";
				}.bind(this), 50);
				
				this._uiThread.Start()
			},
			_show:function()
			{
				while(this._opacity < 1)
				{
					this._opacity += .3;
					Element.setOpacity(this._element, this._opacity);
					__YIELD__;
				}
				this._changingVisibility = false;
				signal(this, "Show");
			},
			ForceHide:function()
			{
				if(this._changingVisibility)
				{
					this._uiThread.Abort();
					this._changingVisibility = false;
				}
				this._visible = false;
				this._opacity = 0;
				Element.setOpacity(this._element, this._opacity);
				$(this._element).style.visibility = "hidden";
				signal(this, "Hide");
			},
			Hide:function()
			{
				if (!this._visible)
				{
					return;
				}
				if(this._changingVisibility)
				{
					this._uiThread.Abort();
				}
				this._changingVisibility = true;
				this._visible = false;
				
				this._uiThread = new XaeiOS.Thread(this,this._hide,1,"UI Thread"); // high priority ui thread			
				Element.setOpacity(this._element, .9);
				this._opacity = .9;
				
				this._uiThread.Start();
			},
			_hide:function()
			{
				while(this._opacity > 0)
				{
					this._opacity -= .3;
					Element.setOpacity(this._element, this._opacity);
					__YIELD__;
				}
				$(this._element).style.visibility = "hidden";
				this._changingVisibility = false;
				signal(this, "Hide");
			}
	  	});
		
		function BrowseWidgetItem(title, caption, icon)
		{
		
            this._asyncOperations = new AsyncOperations();
			
			var element = document.createElement("TR");
			
			this._mainTd = $ID();
			this._iconContainer = $ID();
			this._titleElement = $ID();
			this._captionElement = $ID();
			
			var replacements = [
				[/\{main-td\}/g,this._mainTd],
				[/\{icon-container\}/g,this._iconContainer],
				[/\{title-element\}/g, this._titleElement],
				[/\{caption-element\}/g, this._captionElement]
			];
			
			var s = BrowseWidgetItem.TEMPLATE;
			for(var i=0;i<replacements.length;i++)
			{
				s = s.replace(replacements[i][0], replacements[i][1]);
			}
			element.innerHTML = s;
			
			element.onclick = function()
			{
				if(!this._owner)
				{
					return;
				}
				this._owner.SelectItem(this._index);
			}.bind(this);
			
			$BH(element);
			this._element = $ID(element);
			element = null;
			
			if(title)
			{
				this.SetTitle(title);
			}
			if(caption)
			{
				this.SetCaption(caption);
			}
			if(icon)
			{
				this.SetIcon(icon);
			}
			else
			{
				this._currentIcon = null;
			}
			this._selected = false;
			this._index = -1;
		};
		BrowseWidgetItem.TEMPLATE = '<td><div id="{main-td}" style="height:39px;padding-left:8px;vertical-align:middle;width:100%;white-space:nowrap;font-family:Lucida Sans, Trebuchet MS, Tahoma, sans-serif;color:#000000;text-shadow:#ffffff 1px 1px 3px;cursor:pointer;overflow-y:hidden;"> \
<table border="0" cellpadding="0" cellspacing="0"> \
<tr> \
<td rowspan="2" style="padding-left:7px;padding-right:7px;width:39px;" id="{icon-container}"></td> \
<td id="{title-element}" style="font-weight:bold;font-size:12px;font-family:inherit;white-space:inherit;color:inherit;">&nbsp;</td> \
</tr> \
<tr><td id="{caption-element}" style="font-size:10px;font-family:inherit;white-space:inherit;color:inherit;">&nbsp;</td></tr> \
</table> \
</div> \
</td>';
		BrowseWidgetItem.inherits(Object, {
			GetElement:function()
			{
				return $(this._element);
			},
			GetIndex:function()
			{
				return this._index;
			},
			SetSelected:function(selected)
			{
				if(selected == this._selected)
				{
					return;
				}
				this._selected = selected;
				var elm = $(this._mainTd);
				var titleElement = $(this._titleElement);
				var captionElement = $(this._captionElement);
				if(selected)
				{
					elm.style.backgroundColor = "#064080";
					titleElement.style.color = "#ffffff";
					captionElement.style.color = "#ffffff";
					elm.style.textShadow = "#000000 3px 3px 4px";
					elm.style.opacity = ".9";
				}
				else
				{
					elm.style.backgroundColor = "transparent";
					titleElement.style.color = "#000000";
					captionElement.style.color = "#000000";
					elm.style.textShadow = "#ffffff 1px 1px 3px";
					elm.style.opacity = "1";
				}
				elm = null;
				titleElement = null;
				captionElement = null;
			},
			SetIcon:function(icon)
			{
                if(icon)
                {
                    this._asyncOperations.SetTimeout(this._setIcon.bind(this, $ID(icon)),10, "Set Icon"); // TODO: Use a separate, low priority, thread with a queue to set these icons
                }
                else
                {
                    this.ClearIcon();
                }
			},
			_setIcon:function(icon)
			{
                if (this._currentIcon)
                {
                    var currentIcon = $(this._currentIcon);
                    currentIcon.parentNode.removeChild(currentIcon);
                }
                icon = $(icon).cloneNode(true);
                this._setIconStyle(icon);
                $(this._iconContainer).appendChild(icon);
                this._currentIcon = $ID(icon, true);
			},
			ClearIcon:function()
			{
                this._asyncOperations.TryCancelTimeoutByName("Set Icon");
				if (this._currentIcon)
				{
                    var currentIcon = $(this._currentIcon);
                    currentIcon.parentNode.removeChild(currentIcon);
                    this._currentIcon = false;
				}
			},
			_setIconStyle:function(icon)
			{
				if (icon._styleSet)
				{
					return;
				}
				var dimensions = Element.getDimensions(icon);
				if(!dimensions.width)//typeof(dimensions.width) == "undefined")
				{
					dimensions.width = dimensions.height = 40;
				}
				if ((dimensions.width > 39) || (dimensions.height > 39))
				{
					var width;
					var height;
					if (dimensions.width > dimensions.height)
					{
						width = 39;
						height = dimensions.height / dimensions.width * 39;
					}
					else
					{
						height = 39;
						width = dimensions.width / dimensions.height * 39;
					}
					icon.style.width = width + "px";
					icon.style.height = height + "px";
				}
				icon._styleSet = true;
			},
			SetTitle:function(value)
			{
				$(this._titleElement).innerHTML = this._title = value;
			},
			SetCaption:function(value)
			{
				$(this._captionElement).innerHTML = this._caption = value;
			},
			GetTitle:function(value)
			{
				return this._title;
			}
		});
		
		function BoxWidget(color)
		{
			color = color || "black";
			var imagePrefix = prefix + "/images/widgets/BoxWidget/" + color;
			var fillerColor;

			var element = document.createElement("TABLE");
			this._element = $ID(element);
			element.setAttribute("border", 0);
			element.setAttribute("cellspacing", 0);
			element.setAttribute("cellpadding", 0);
			element.style.position = "fixed";
			element.style.width = BoxWidget.WIDTH + "px";
			element.style.height = BoxWidget.HEIGHT + "px";

			// trs
			var tr1 = document.createElement("TR");
			tr1.setAttribute("valign", "top");
			
				var tlTd = document.createElement("TD");
				tlTd.setAttribute("width", 38);
				tlTd.setAttribute("height", 32);
					
					var tlImg = document.createElement("IMG");
					this._tlImg = $ID(tlImg);
					tlImg.src = imagePrefix + "-box-top-left.png";
					
					tlTd.appendChild(tlImg);
				
				tr1.appendChild(tlTd);
				
				var tmTd = document.createElement("TD");
				tmTd.setAttribute("width","100%");
				tmTd.setAttribute("height","100%");
				tmTd.setAttribute("rowspan","3");
				tmTd.setAttribute("align","center");
				tmTd.setAttribute("style","padding-top:16px;background-color:black;background-image:url('"+imagePrefix+"-box-top-middle.png');background-repeat:repeat-x;");
				tmTd.innerHTML = "&nbsp;";
				
				tr1.appendChild(tmTd);
				
				var trTd = document.createElement("TD");
				trTd.setAttribute("width", 38);
				trTd.setAttribute("height", 32);
					
					var trImg = document.createElement("IMG");
					this._trImg = $ID(trImg);
					trImg.src = imagePrefix + "-box-top-right.png";
					
					trTd.appendChild(trImg);
				
				tr1.appendChild(trTd);
			
			element.appendChild(tr1);

			var tr2 = document.createElement("TR");
				
				var lstTd = document.createElement("TD");
				this._lstTd = $ID(lstTd);
				lstTd.setAttribute("width", 38);
				lstTd.setAttribute("height", 56);
				lstTd.setAttribute("background", imagePrefix + "-box-left-side-top.png");
				tr2.appendChild(lstTd);
				
				var rstTd = document.createElement("TD");
				this._rstTd = $ID(rstTd);
				rstTd.setAttribute("width", 38);
				rstTd.setAttribute("height", 56);
				rstTd.setAttribute("background", imagePrefix + "-box-right-side-top.png");
				tr2.appendChild(rstTd);
				
			element.appendChild(tr2);

			var tr3 = document.createElement("TR");
				
				var lsmTd = document.createElement("TD");
				this._lsmTd = $ID(lsmTd);
				lsmTd.setAttribute("height", "100%");
				lsmTd.setAttribute("rowspan", 2);
				lsmTd.setAttribute("background", imagePrefix + "-box-left-side-middle.png");
				tr3.appendChild(lsmTd);
				
				var rsmTd = document.createElement("TD");
				this._rsmTd = $ID(rsmTd);
				rsmTd.setAttribute("height", "100%");
				rsmTd.setAttribute("rowspan", 2);
				rsmTd.setAttribute("background", imagePrefix + "-box-right-side-middle.png");
				tr3.appendChild(rsmTd);
				
			element.appendChild(tr3);

			var tr4 = document.createElement("TR");
			
				var extenderTd = document.createElement("TD");
				this._extenderTd = $ID(extenderTd);
				extenderTd.setAttribute("height", 1);
				extenderTd.setAttribute("valign", "baseline");
				extenderTd.setAttribute("bgcolor", color);
				tr4.appendChild(extenderTd);
				
			element.appendChild(tr4);

			var tr5 = document.createElement("TR");
			element.appendChild(tr5);

			$BH(element);
			
		};
		BoxWidget.WIDTH = 300;
		BoxWidget.HEIGHT = 200;
		BoxWidget.inherits(Object, {
	   		GetElement:function()
			{
				return $(this._element);
			}
	    });

		// MODULES ---------------------------------------------------------------------------------------
		
		// MZCoreModule ----------------------------------------------------------------------------------
		
		function MZUrlObject(title, url, icon, caption)
		{
			if(!url)
			{
				MZObject.call(this, title, title, icon, caption||"URL: [" + title + "]");
			}
			else
			{
				MZObject.call(this, title, url, icon, caption||"URL: " + title + " [" + url + "]");
			}
		}
		MZUrlObject.inherits(MZObject,{
			GetUrl:function()
			{
				return this.GetData();
			},
			ScoreAction:function(mzAction)
			{
				if (mzAction instanceof MZGoToUrlAction)
				{
					return .5;
				}
				return 0;
			}
		});
		
		function MZApplicationObject(title, url, icon, caption)
		{
			MZObject.call(this, title, url, icon, (caption) || ("Application: " + title));
		};
		Object.extend(MZApplicationObject, {
            __constructor__:"MZApplicationObject",
            Serialize:function(object)
            {
                var o = MZObject.Serialize(object);
                o.ApplicationType = object.GetUrl();
                return o;
            },
            Deserialize:function(object)
            {
                var o = MZObject.Deserialize(object);
                var instance = MZCoreModule.GetRegisteredApplicationTypeInstance(o.GetData());
                instance.SetId(object.Id);
                return instance;
            }
		});
		MZApplicationObject.inherits(MZObject,{
			GetUrl:function()
			{
				return this.GetData();
			},
			ScoreAction:function(mzAction)
			{
				if (mzAction instanceof MZOpenApplicationAction)
				{
					return 1;
				}
				return 0;
			},
			Open:function(object)
			{
			    // TODO: What should the basic open functionality be?
			}
		});
		
		function MZHistoryEntryObject(title, url, access, icon)
		{
			MZUrlObject.call(this, title, url, icon, " ");
			this._access = access;
		}
		Object.extend(MZHistoryEntryObject, {
            __constructor__:"MZHistoryEntryObject",
            Serialize:function(object)
            {
                var obj = MZObject.Serialize(object);
                obj.Access = object.GetAccess().getTime();

                return obj;
            },
            Deserialize:function(o)
            {
			    var obj = MZObject.Deserialize(o);
                var instance = new MZHistoryEntryObject(obj.GetName(), obj.GetData(), new Date(o.Access), obj.GetIcon());
                instance.SetId(obj.Id);
			    return instance;
            }
		});
		MZHistoryEntryObject.inherits(MZUrlObject,{
			GetAccess:function()
			{
				return this._access;
			},
			SetAccess:function(value)
			{
			    this._access = value;
			},
			GetCaption:function()
			{				
				return "Last visited " + (friendlyDate(this.GetAccess())) + " - " + this.GetName() + " [" + this.GetUrl() + "]";
			}
		});
		
		function MZEmailAddressObject(address)
		{
			MZObject.call(this, address, address, $ICON("email-address.png"), "Email address: [" + address + "]");
		}
		MZEmailAddressObject.inherits(MZObject,{
			GetAddress:function()
			{
				return this.GetData();
			},
			ScoreAction:function(mzAction)
			{
				if (mzAction instanceof MZSendAnEmailAction)
				{
					return .5;
				}
				return 0;
			}
		});

		function MZDomElementObject(name, element, icon, caption)
		{
			if (arguments.length)
			{
				MZObject.call(this, name, $ID(element), icon, caption);
			}
		};
		Object.extend(MZDomElementObject.prototype, MZObject.prototype);
		var _p = MZDomElementObject.prototype;
		_p.GetElement = function()
		{
			return $(this.GetData());
		};

		function MZHyperlinkObject(name, element, icon)
		{
			MZDomElementObject.call(this, name, element, icon);
			this.SetCaption("Link: " + this.GetHyperlink());
		};
		MZHyperlinkObject.prototype = new MZDomElementObject;
		var _p = MZHyperlinkObject.prototype;
		_p.GetHyperlink = function()
		{
			return this.GetElement().getAttribute("href");
		};
		_p.toString = function()
		{
			return this.GetName() + ":" + this.GetHyperlink();
		};
		_p.ScoreAction = function(mzAction)
		{
			if (mzAction instanceof MZFollowLinkAction)
			{
				return .5;
			}
			return 0;
		};

		function MZQueryObject(query)
		{
			MZObject.call(this, query, null, $ICON("query.png"));
			this._creationDate = new Date();
		};
		MZQueryObject.inherits(MZObject, {
			GetQuery:function()
			{
				return this.GetName();
			},
			GetCreationDate:function()
			{
				return this._creationDate;
			}
		});

		function MZTextObject(text)
		{
			MZObject.call(this, text);
		};
		MZTextObject.inherits(MZObject, {
			GetText:function()
			{
				return this.GetName();
			},
			toString:function()
			{
                return this.GetText();
			}
		});

		function MZScriptObject(name, fun, icon, caption)
		{
			MZObject.call(this, name, fun, icon, caption);
			this._parameterSignature = null;
		}
		MZScriptObject.inherits(MZObject, {
			GetFunction:function()
			{
				return this.GetData();
			},
			ScoreAction:function(mzAction)
			{
				if (mzAction instanceof MZExecuteScriptAction)
				{
					return .5;
				}
				return 0;
			},
			GetParameterSignature:function()
			{
				return this._parameterSignature;
			},
			SetParameterSignature:function(value)
			{
                this._parameterSignature = value;
			}
		});
		
		function MZOpenApplicationAction()
		{
			MZObject.call(this, "Open", null, $ICON("open-application.png"));
		};
		MZOpenApplicationAction.inherits(MZAction,{
			ScoreObject:function(mzObject)
			{
				if(mzObject instanceof MZApplicationObject)
				{
					return 1;
				}
				return -1;
			},
			Execute:function(mzApplicationObject)
			{
				MuZume.CloseDelayed(function()
				{
				    MuZume.SetLocation(mzApplicationObject.GetUrl());
				});
			}
		});
		function MZSearchActionBase(name, data, icon, caption)
		{
			MZAction.call(this, name, data, icon, caption);
		};
		MZSearchActionBase.inherits(MZAction, {
			ScoreObject:function(object)
			{
				if (object instanceof MZQueryObject)
				{
					return .5;
				}
				return 0;
			},
			Execute:function(object)
			{
				var query;
				if (object instanceof MZQueryObject)
				{
					query = object.GetQuery();
				}
				else
				{
					query = object.GetName();
				}
				this.ExecuteQuery(query);
			},
			ExecuteQuery:function()
			{
			}
		});
		function MZGoogleSearchAction()
		{
			MZSearchActionBase.call(this, "Google", null, null, "Search with Google");
		};
		MZGoogleSearchAction.inherits(MZSearchActionBase,
		{
			ExecuteQuery:function(query)
			{
				MuZume.CloseDelayed(function()
				{
					MuZume.SetLocation("http://www.google.com/search?q=" + query);
				});
			}
		});

		function MZGoToUrlAction()
		{
			MZAction.call(this, "Go");
			this._regexp = /^([a-zA-Z0-9]+\:\/\/)?(www.|[a-zA-Z].)[a-zA-Z0-9\-\.]+\.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk)(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\;\?'\\\+&%\$#\=~_\-]+))*$/;
			//' THIS COMMENT NEEDS TO BE HERE FOR DREAMWEAVER SYNTAX HIGHLIGHTING
			this._protocolRegexp = /^[a-zA-Z0-9]+:\//;
		};
		MZGoToUrlAction.inherits(MZAction, {
			ScoreObject:function(object)
			{
				if(object instanceof MZUrlObject)
				{
					return .5;
				}
				return -1;
			},
			Execute:function(object)
			{
				if(object instanceof MZUrlObject)
				{
					var url = object.GetUrl();		
					if (!url.match(this._protocolRegexp))
					{
						url = "http://" + url;
					}			
				}
				else if(object instanceof MZHyperlinkObject)
				{
					var url = object.GetHyperlink();
				}
				else
				{
					throw new Error("MZGoToUrlAction could not handle object: " + object);
				}
				MuZume.CloseDelayed(function()
				{
					MuZume.SetLocation(url);
				});
			}
		});

		function MZFollowLinkAction()
		{
			MZAction.call(this, "Go");
		}
		MZFollowLinkAction.inherits(MZAction, {
			ScoreObject:function(mzObject)
			{
				if (mzObject instanceof MZHyperlinkObject)
				{
					return .5;
				}
				return -1;
			},
			Execute:function(hyperlinkObject)
			{
				MuZume.CloseDelayed(function()
				{
				    MuZume.SetLocation(hyperlinkObject.GetHyperlink());
				});
			}
		});

		function MZSendAnEmailAction()
		{
			MZAction.call(this, "Send an Email...", null, $ICON("email-compose.png"));
			this.SetParameterSignature([new MZTextParameter("Subject"), new MZTextParameter("Body")]);
		};
		MZSendAnEmailAction.inherits(MZAction,{
			ScoreObject:function(mzObject)
			{
				if(mzObject instanceof MZEmailAddressObject)
				{
					return 1;
				}
				return -1;
			},
			Execute:function(mzEmailAddressObject, subject, body)
			{
				MuZume.CloseDelayed(function()
				{
					var not = new MZNotification("Starting email client...", $ICON("email.png"));
					connectOnce(not, "Show", function()
					{
                        var url = ["mailto:",mzEmailAddressObject.GetAddress()];
                        if(subject || body)
                        {
                            url.push("?");
                            var extras = [];
                            if(subject)
                            {
                                extras.push("subject=" + subject.GetText());
                            }
                            if(body)
                            {
                                extras.push("body=" + body.GetText());
                            }
                            url.push(extras.join("&"))
                        }
						window.location.href = url.join("");
					});
					MuZume.ShowNotification(not);
				});
			}
		});

		function MZExecuteScriptAction()
		{
			MZAction.call(this, "Execute");
		};
		MZExecuteScriptAction.inherits(MZAction, {
            ScoreObject:function(mzObject)
            {
                if (mzObject instanceof MZScriptObject)
                {
                    return .5;
                }
                return -1;
            },
            Execute:function(scriptObject)
            {
                // TODO: Apply MZParameters
                var args = $A(arguments);
                args.shift();
                scriptObject.GetFunction().apply(scriptObject, args);
            }
		});
		
		function MZAliasThisLocationObject()
		{
            MZScriptObject.call(this, "Make an alias", this.Execute, $ICON("alias.png"), "Action: Make a named reference to the current location");
            this.SetParameterSignature(MZAliasThisLocationObject.ParameterSignature);
		};
		MZAliasThisLocationObject.ParameterSignature = [new MZTextParameter("Alias name")];
		MZAliasThisLocationObject.inherits(MZScriptObject, {
            Execute:function(aliasTextObject)
            {
                MuZume.CloseDelayed(function(a)
                {
                    try
                    {
                        this._execute(a);
                    }
                    catch(e)
                    {
                        //console.debug(e);
                    }
                }.bind(this, aliasTextObject.GetText()));
            },
            _execute:function(aliasName)
            {
                var referencedObject = MZCoreModule.GetCurrentLocationHistoryEntryObject();
                var icon = referencedObject.GetIcon();
                if(icon)
                {
                    icon = $ICON($$ICON(icon));
                }
                //console.info("Creating new MZObjectReference to object %o. Name is %o", referencedObject, aliasName);
                var objectReference = new MZObjectReference(aliasName, referencedObject, icon, referencedObject.GetCaption());
                var objectReferenceShadow = objectReference.Serialize();
                MuZume.StoreObject(objectReference);
                MuZume.ExternalKernel.PreindexObjects([objectReferenceShadow]);
                MuZume.ExternalKernel.AddMapping(aliasName, objectReference.GetId());
                MuZume.ObjectView.Catalog.AddObject(objectReference);
                MuZume.BuildIndex(); // TODO: Add this functionality to module interface
                // TODO: Modules should rely strictly upon the module interface
            }
		});
		
		function MZApplicationsObject(catalog)
		{
			MZPluralObject.call(this, "Applications", null, $ICON("applications.png"), "Set: All installed applications");
			this._catalog = catalog;
		};
		MZApplicationsObject.inherits(MZPluralObject, {
			GetObjects:function()
			{
				return this._catalog.GetObjects();
			}
		});
		function MZOpenWithAction(applicationCatalog)
		{
			MZAction.call(this, "Open With...", null, $ICON("open-application.png"));
			this.SetParameterSignature([new MZParameter("Application", applicationCatalog)]);
		}
		MZOpenWithAction.inherits(MZAction, {
			Execute:function(object, application)
			{
			    application.Open(object);
			},
			GetParameterSignature:function()
			{
				return this._parameterSignature;
			},
			ScoreObject:function(object)
			{
				if (object instanceof MZImageObject) // TODO: Create an Openable interface
				{
					return 1;
				}
				return -1;
			}
		});

		// TODO: MZTagObject
		function MZTagObject(tag, objects, icon, caption)
		{
			MZPluralObject.call(this, tag, objects, icon, caption);
		};
		MZTagObject.inherits(MZPluralObject,{
		});

		var MZCoreModule = {
			Name:"Core",
			Version:1,
			Objects: [
                new MZAliasThisLocationObject()
			],
			Actions: [
			        new MZGoToUrlAction(),
                    new MZSendAnEmailAction(),
                    new MZFollowLinkAction(),
                    new MZGoogleSearchAction(),
				    new MZExecuteScriptAction(),
					new MZOpenApplicationAction()
            ],
			Initialize:function(mzModuleInterface)
			{
			    this._applicationCatalog = mzModuleInterface.CreateCatalog();
			    this._applicationTypes = {};
			    this.Objects.push(new MZApplicationsObject(this._applicationCatalog))
			    this.Actions.push(new MZOpenWithAction(this._applicationCatalog)); // TODO: Create a special "MZOpenWithApplicationCatalog" that knows about application types and openers
			    
			    // register built in application types
			    this.RegisterApplicationType({
			        Name: "Snipshot",
			        Url: "http://snipshot.com",
			        Icon: $ICON("snipshot.png"),
			        Caption: "Application: Snipshot - Edit pictures online", // TODO: "Application: " prefix should be stored in a constant
			        Regex: /^http:\/\/snipshot\.com/,
			        Prototype: {
			            Open: function(object)
			            {
					        if(object instanceof MZImageObject)
					        {
					            var src = escape(object.GetSource()).replace(/\//g,"%2" + "F");
			                    window.location = "http://open.snipshot.com/import?url=" + src;
					        }
			            }
			        }
			    });
			    this.RegisterApplicationType({
			        Name: "Meebo",
			        Url: "http://meebo.com",
			        Icon: $ICON("chat.png"),
			        Caption: "Application: Meebo", // TODO: "Application: " prefix should be stored in a constant
			        Regex: /^http:\/\/www\d*.meebo\.com/,
			        Prototype: {
			        }
			    });
			},
			SetCurrentLocationHistoryEntryObject:function(o)
			{
                this._currentLocationHistoryEntryObject = o;
			},
			GetCurrentLocationHistoryEntryObject:function()
			{
                return this._currentLocationHistoryEntryObject;
			},
			GetApplicationCatalog:function()
			{
			    return this._applicationCatalog;
			},
			AddApplicationObjects:function(applicationObjects)
			{
			    for(var i in applicationObjects)
			    {
			        if(applicationObjects[i] instanceof MZApplicationObject)
			        {
			            this._applicationCatalog.AddObject(applicationObjects[i]);
			        }
			    }
			},
			FindApplicationObject:function(url)
			{
				for(var i in this._applicationTypes)
				{
				    var type = this._applicationTypes[i];
				    if(url.match(type.Regex))
				    {
				        return new type();
				    }
				}
				return null;
			},
			RegisterApplicationType:function(desc)
			{
			    var types = this._applicationTypes;
			    var type = types[desc.Url] = function()
			    {
			        MZApplicationObject.call(this, desc.Name, desc.Url, desc.Icon, desc.Caption);
			    }
			    type.inherits(MZApplicationObject, desc.Prototype || {});
			    type.Regex = desc.Regex;
                type.__constructor__ = "MZApplicationObject",
                type.Serialize = MZApplicationObject.Serialize;
			    return type;
			},
			GetRegisteredApplicationTypeInstance:function(url)
			{
			    var type = this._applicationTypes[url];
			    if(type)
			    {
			        return new type();
			    }
			    else
			    {
			        throw new Error("Application matching \"" + url + "\" not found.");
			    }
			}
		};
		
		// End MZCoreModule -------------------------------------------------------------------------------

		// MZBrowserAddonsModule --------------------------------------------------------------------------
		function GeneratePassword()
		{
			MuZume.CloseDelayed(function()
			{
				window.location.href = "javascript:function%20hex_md5(p){return%20binl2hex(core_md5(str2binl(p),p.length*8));}function%20core_md5(x,len){x[len%3E%3E5]|=0x80%3C%3C((len)%2532);x[(((len+64)%3E%3E%3E9)%3C%3C4)+14]=len;var%20a=1732584193;var%20b=-271733879;var%20c=-1732584194;var%20d=271733878;for(var%20i=0;i%3Cx.length;i+=16){var%20olda=a;var%20oldb=b;var%20oldc=c;var%20oldd=d;a=md5_ff(a,b,c,d,x[i+0],7,-680876936);d=md5_ff(d,a,b,c,x[i+1],12,-389564586);c=md5_ff(c,d,a,b,x[i+2],17,606105819);b=md5_ff(b,c,d,a,x[i+3],22,-1044525330);a=md5_ff(a,b,c,d,x[i+4],7,-176418897);d=md5_ff(d,a,b,c,x[i+5],12,1200080426);c=md5_ff(c,d,a,b,x[i+6],17,-1473231341);b=md5_ff(b,c,d,a,x[i+7],22,-45705983);a=md5_ff(a,b,c,d,x[i+8],7,1770035416);d=md5_ff(d,a,b,c,x[i+9],12,-1958414417);c=md5_ff(c,d,a,b,x[i+10],17,-42063);b=md5_ff(b,c,d,a,x[i+11],22,-1990404162);a=md5_ff(a,b,c,d,x[i+12],7,1804603682);d=md5_ff(d,a,b,c,x[i+13],12,-40341101);c=md5_ff(c,d,a,b,x[i+14],17,-1502002290);b=md5_ff(b,c,d,a,x[i+15],22,1236535329);a=md5_gg(a,b,c,d,x[i+1],5,-165796510);d=md5_gg(d,a,b,c,x[i+6],9,-1069501632);c=md5_gg(c,d,a,b,x[i+11],14,643717713);b=md5_gg(b,c,d,a,x[i+0],20,-373897302);a=md5_gg(a,b,c,d,x[i+5],5,-701558691);d=md5_gg(d,a,b,c,x[i+10],9,38016083);c=md5_gg(c,d,a,b,x[i+15],14,-660478335);b=md5_gg(b,c,d,a,x[i+4],20,-405537848);a=md5_gg(a,b,c,d,x[i+9],5,568446438);d=md5_gg(d,a,b,c,x[i+14],9,-1019803690);c=md5_gg(c,d,a,b,x[i+3],14,-187363961);b=md5_gg(b,c,d,a,x[i+8],20,1163531501);a=md5_gg(a,b,c,d,x[i+13],5,-1444681467);d=md5_gg(d,a,b,c,x[i+2],9,-51403784);c=md5_gg(c,d,a,b,x[i+7],14,1735328473);b=md5_gg(b,c,d,a,x[i+12],20,-1926607734);a=md5_hh(a,b,c,d,x[i+5],4,-378558);d=md5_hh(d,a,b,c,x[i+8],11,-2022574463);c=md5_hh(c,d,a,b,x[i+11],16,1839030562);b=md5_hh(b,c,d,a,x[i+14],23,-35309556);a=md5_hh(a,b,c,d,x[i+1],4,-1530992060);d=md5_hh(d,a,b,c,x[i+4],11,1272893353);c=md5_hh(c,d,a,b,x[i+7],16,-155497632);b=md5_hh(b,c,d,a,x[i+10],23,-1094730640);a=md5_hh(a,b,c,d,x[i+13],4,681279174);d=md5_hh(d,a,b,c,x[i+0],11,-358537222);c=md5_hh(c,d,a,b,x[i+3],16,-722521979);b=md5_hh(b,c,d,a,x[i+6],23,76029189);a=md5_hh(a,b,c,d,x[i+9],4,-640364487);d=md5_hh(d,a,b,c,x[i+12],11,-421815835);c=md5_hh(c,d,a,b,x[i+15],16,530742520);b=md5_hh(b,c,d,a,x[i+2],23,-995338651);a=md5_ii(a,b,c,d,x[i+0],6,-198630844);d=md5_ii(d,a,b,c,x[i+7],10,1126891415);c=md5_ii(c,d,a,b,x[i+14],15,-1416354905);b=md5_ii(b,c,d,a,x[i+5],21,-57434055);a=md5_ii(a,b,c,d,x[i+12],6,1700485571);d=md5_ii(d,a,b,c,x[i+3],10,-1894986606);c=md5_ii(c,d,a,b,x[i+10],15,-1051523);b=md5_ii(b,c,d,a,x[i+1],21,-2054922799);a=md5_ii(a,b,c,d,x[i+8],6,1873313359);d=md5_ii(d,a,b,c,x[i+15],10,-30611744);c=md5_ii(c,d,a,b,x[i+6],15,-1560198380);b=md5_ii(b,c,d,a,x[i+13],21,1309151649);a=md5_ii(a,b,c,d,x[i+4],6,-145523070);d=md5_ii(d,a,b,c,x[i+11],10,-1120210379);c=md5_ii(c,d,a,b,x[i+2],15,718787259);b=md5_ii(b,c,d,a,x[i+9],21,-343485551);a=safe_add(a,olda);b=safe_add(b,oldb);c=safe_add(c,oldc);d=safe_add(d,oldd);}return%20Array(a,b,c,d);}function%20md5_cmn(q,a,b,x,s,t){return%20safe_add(bit_rol(safe_add(safe_add(a,q),safe_add(x,t)),s),b);}function%20md5_ff(a,b,c,d,x,s,t){return%20md5_cmn((b&c)|((~b)&d),a,b,x,s,t);}function%20md5_gg(a,b,c,d,x,s,t){return%20md5_cmn((b&d)|(c&(~d)),a,b,x,s,t);}function%20md5_hh(a,b,c,d,x,s,t){return%20md5_cmn(b^c^d,a,b,x,s,t);}function%20md5_ii(a,b,c,d,x,s,t){return%20md5_cmn(c^(b|(~d)),a,b,x,s,t);}function%20safe_add(x,y){var%20lsw=(x&0xFFFF)+(y&0xFFFF);var%20msw=(x%3E%3E16)+(y%3E%3E16)+(lsw%3E%3E16);return%20(msw%3C%3C16)|(lsw&0xFFFF);}function%20bit_rol(num,cnt){return%20(num%3C%3Ccnt)|(num%3E%3E%3E(32-cnt));}function%20str2binl(str){var%20bin=Array();var%20mask=(1%3C%3C8)-1;for(var%20i=0;i%3Cstr.length*8;i+=8)bin[i%3E%3E5]|=(str.charCodeAt(i/8)&mask)%3C%3C(i%2532);return%20bin;}function%20binl2hex(binarray){var%20hex_tab='0123456789abcdefABCDEF';var%20str='';var%20j=0;for(var%20i=0;i%3Cbinarray.length*4;i++){x1=(binarray[i%3E%3E2]%3E%3E((i%254)*8+4))&0xF;x2=(binarray[i%3E%3E2]%3E%3E((i%254)*8))&0xF;if(x1%3E9){j++;if(j%252)x1=x1+6;}if(x2%3E9){j++;if(j%252)x2=x2+6;}str+=hex_tab.charAt(x1)+hex_tab.charAt(x2);}return%20str;}function%20genpass(pcapture,p,dpresent,plen,pcase,ppop){if(pcapture){var%20i=0,j=0,F=document.forms;for(i=0;i%3CF.length;i++){E=F[i].elements;for(j=0;j%3CE.length;j++){D=E[j];if(D.type=='password'){if(D.value){p=D.value;alert('Using%20password%20found%20on%20page');break;}}}}}re=new%20RegExp(%22https*%3A//(%5B%5E/%3A%5D+)%22);host=document.location.href.match(re)[1];host=host.split('.');if(host[2]!=null){s=host[host.length-2]+'.'+host[host.length-1];domains='ab.ca|ac.ac|ac.at|ac.be|ac.cn|ac.il|ac.in|ac.jp|ac.kr|ac.nz|ac.th|ac.uk|ac.za|adm.br|adv.br|agro.pl|ah.cn|aid.pl|alt.za|am.br|arq.br|art.br|arts.ro|asn.au|asso.fr|asso.mc|atm.pl|auto.pl|bbs.tr|bc.ca|bio.br|biz.pl|bj.cn|br.com|cn.com|cng.br|cnt.br|co.ac|co.at|co.il|co.in|co.jp|co.kr|co.nz|co.th|co.uk|co.za|com.au|com.br|com.cn|com.ec|com.fr|com.hk|com.mm|com.mx|com.pl|com.ro|com.ru|com.sg|com.tr|com.tw|cq.cn|cri.nz|de.com|ecn.br|edu.au|edu.cn|edu.hk|edu.mm|edu.mx|edu.pl|edu.tr|edu.za|eng.br|ernet.in|esp.br|etc.br|eti.br|eu.com|eu.lv|fin.ec|firm.ro|fm.br|fot.br|fst.br|g12.br|gb.com|gb.net|gd.cn|gen.nz|gmina.pl|go.jp|go.kr|go.th|gob.mx|gov.br|gov.cn|gov.ec|gov.il|gov.in|gov.mm|gov.mx|gov.sg|gov.tr|gov.za|govt.nz|gs.cn|gsm.pl|gv.ac|gv.at|gx.cn|gz.cn|hb.cn|he.cn|hi.cn|hk.cn|hl.cn|hn.cn|hu.com|idv.tw|ind.br|inf.br|info.pl|info.ro|iwi.nz|jl.cn|jor.br|jpn.com|js.cn|k12.il|k12.tr|lel.br|ln.cn|ltd.uk|mail.pl|maori.nz|mb.ca|me.uk|med.br|med.ec|media.pl|mi.th|miasta.pl|mil.br|mil.ec|mil.nz|mil.pl|mil.tr|mil.za|mo.cn|muni.il|nb.ca|ne.jp|ne.kr|net.au|net.br|net.cn|net.ec|net.hk|net.il|net.in|net.mm|net.mx|net.nz|net.pl|net.ru|net.sg|net.th|net.tr|net.tw|net.za|nf.ca|ngo.za|nm.cn|nm.kr|no.com|nom.br|nom.pl|nom.ro|nom.za|ns.ca|nt.ca|nt.ro|ntr.br|nx.cn|odo.br|on.ca|or.ac|or.at|or.jp|or.kr|or.th|org.au|org.br|org.cn|org.ec|org.hk|org.il|org.mm|org.mx|org.nz|org.pl|org.ro|org.ru|org.sg|org.tr|org.tw|org.uk|org.za|pc.pl|pe.ca|plc.uk|ppg.br|presse.fr|priv.pl|pro.br|psc.br|psi.br|qc.ca|qc.com|qh.cn|re.kr|realestate.pl|rec.br|rec.ro|rel.pl|res.in|ru.com|sa.com|sc.cn|school.nz|school.za|se.com|se.net|sh.cn|shop.pl|sk.ca|sklep.pl|slg.br|sn.cn|sos.pl|store.ro|targi.pl|tj.cn|tm.fr|tm.mc|tm.pl|tm.ro|tm.za|tmp.br|tourism.pl|travel.pl|tur.br|turystyka.pl|tv.br|tw.cn|uk.co|uk.com|uk.net|us.com|uy.com|vet.br|web.za|web.com|www.ro|xj.cn|xz.cn|yk.ca|yn.cn|za.com';domains=domains.split('|');for(var%20i=0;i%3Cdomains.length;i++){if(s==domains[i]){s=host[host.length-3]+'.'+s;break;}}}else{s=host.join('.');}i=(dpresent)?'Master%20password%3A'%3A'Master%20password%20for%20%22'+s+'%22%3A';p=(!p)?prompt(i,'')%3Aunescape(p);if(p){if(dpresent)s=prompt('Using%20domain%3A',s).replace(/%5E%5Cs*|%5Cs*$/g,'');if(s){if(!plen){plen='8';plen=prompt('Generated%20password%20length%3A',plen).replace(/%5E%5Cs*|%5Cs*$/g,'');if(plen.search(/%5E%5Cd+$/)||plen%3C1||plen%3E32){if(plen%3E32){plen=32;alert('Password%20length%20cannot%20exceed%20'+plen+';%20using%20maximum%20value%20of%20'+plen+'.');}else{plen=8;alert('Password%20length%20supplied%20is%20not%20a%20valid%20integer;%20using%20default%20of%20'+plen+'.');}}}p=hex_md5(p+'%3A'+s).substr(0,plen);if(!pcase)p=p.toLowerCase();if(pcase==1)p=p.toUpperCase();var%20not_found=true;s='Generated%20password%3A';if(!ppop){var%20i=0,j=0,F=document.forms;s='No%20obvious%20password%20field%20detected;%20the%20generated%20password%20is%3A';for(i=0;i%3CF.length;i++){E=F[i].elements;for(j=0;j%3CE.length;j++){D=E[j];if(D.type=='password'){D.value=p;D.focus();not_found=false;}}}}if(not_found)prompt(s,p);}else{alert('Domain%20empty;%20cannot%20proceed.');}}else{alert('Password%20empty;%20cannot%20proceed.');}}genpass(1,0,1,8,0,0);void(null);";
			});
		};

		function MZHighlightedTextObject()
		{
			MZQueryObject.call(this, this.GetName(), null, null, null);
		};
		MZHighlightedTextObject.inherits(MZQueryObject, {
			GetName:function()
			{
				return this.GetHighlightedText();
			},
			GetHighlightedText:function()
			{
				var s = (getSelection() + '').toString();
				return s;
			},
			GetQuery:function()
			{
				return this.GetHighlightedText();
			},
			GetCaption:function()
			{
				return "Highlighted text: \"" + this.GetHighlightedText() + "\"";
			},
			Score:function()
			{
				if (this.GetHighlightedText() != "")
				{
					return .5;
				}
				else
				{
					return -1;
				}
			}
		});

		function MZFormSearchAction(searchInput, form)
		{
			MZSearchActionBase.call(this, "Search", null, $ICON("search.png"), "Search from this page");
			this._searchInput = $ID(searchInput);
			this._form = $ID(form);
		};
		MZFormSearchAction.inherits(MZSearchActionBase, {
			GetSearchInput:function()
			{
				return $(this._searchInput);
			},
			GetForm:function()
			{
				return $(this._form);
			},
			ExecuteQuery:function(query)
			{
				this.GetSearchInput().value = query;
				this.GetForm().submit();
			}
		});

		var MZBrowserAddonsModule = {
			Name: "Browser Addons",
			Objects: [
				new MZScriptObject("Back", function()
				{
					MuZume.CloseDelayed(function()
                    {
						window.history.back();
                    });
				},$ICON("back.png"), "Navigation: Go back in history"),
				new MZScriptObject("Reload", function()
				{
					MuZume.CloseDelayed(function()
				    {
				        MuZume.SetLocation(window.location.href);
				    });
				},$ICON("reload.png"), "Navigation: Reload the current page"),
				new MZScriptObject("Forward", function()
				{					
					MuZume.CloseDelayed(function()
				    {
						window.history.forward();
				    });
				},$ICON("forward.png"), "Navigation: Go forward in history"),
				new MZScriptObject("SnapBack", function()
				{					
					MuZume.CloseDelayed(function()
					 {
						var l = location;
						// TODO: Look for well known snap back points
						MuZume.SetLocation(l.protocol + "//" + l.hostname + (l.port?(":" + l.port):""));
					 });
				}, $ICON("snapback.png"), "Navigation: Snapback to start page"),
				new MZScriptObject("Fit Window", function()
				{
				    // TODO: Smart Fit Window algorithm
				    MuZume.CloseDelayed(function()
				    {
                        if(document.body.scrollWidth - window.innerWidth)
                        {
                            window.resizeTo(document.body.scrollWidth + (window.outerWidth - window.innerWidth) + 32, window.outerHeight)
                        }
                    });
				}, $ICON("fit-window.png"), "Helper: Sizes the window just right."),
				new MZScriptObject("Generate Password", GeneratePassword, $ICON("keyring.png"), "Script: Use a single password everywhere")
			],
			Actions: [],
			Initialize:function(mzModuleInterface)
			{
                connect(MuZume, "Open", this.CheckForHighlightedText);
				var forms = document.getElementsByTagName("form");
				for (var k = 0; k < forms.length; k++)
				{
					var form = forms.item(k);
					var inputs = document.getElementsByTagName("input");
					var searchInput = null;
					for (var i = 0; i < inputs.length; i++)
					{
						var type = inputs[i].getAttribute("type");
						if (type && type.toLowerCase() == "search")
						{
							searchInput = inputs[i];
							break;
						}
					}
					if (searchInput)
					{
						mzModuleInterface.GetActionCatalog().AddObject(new MZFormSearchAction(searchInput, form));
						break;
					}
					else
					{
						var foundSubmitButton = false;
						var failed = false;
						for (var i = 0; i < inputs.length; i++)
						{
							var type = inputs[i].getAttribute("type");
							if (type && type.toLowerCase() == "submit")
							{
								var value = inputs[i].value;
								if (value.match(/(go|search)/i))
								{
									foundSubmitButton = true;
								}
							}
							else if (type && type.toLowerCase() == "image")
							{
								var alt = inputs[i].getAttribute("alt");
								if (alt && alt.match(/(go|search)/i))
								{
									foundSubmitButton = true;
								}
							}
							else if (type && type.toLowerCase() == "text")
							{
								if (searchInput)
								{
									// this form has two text inputs?  probably not a search form
									failed = true;
									break;
								}
								else
								{
									searchInput = inputs[i];
								}
							}
							if (foundSubmitButton && searchInput)
							{
								break;
							}
						}
						if (foundSubmitButton && searchInput && !failed)
						{
							mzModuleInterface.GetActionCatalog().AddObject(new MZFormSearchAction(searchInput, form));
							break;
						}
					}
				}
			},
			CheckForHighlightedText:function()
			{
                if (((getSelection()) + '') != "")
				{
				
                    var object = new MZHighlightedTextObject();
                    
                    var scores = {};
                    scores[object.GetId()] = 2;
                    MuZume.ObjectView.SetObject(0, [object], scores);
                    MuZume.ObjectView.OutputObject = object;
                    MuZume._clearContent = true;
                    
                    MuZume.ActionView.StopRanking();
                    MuZume.ActionView.InputObject = object.Dereference();
                    MuZume.ActionView.Widget.Show();
                    MuZume.ActionView.StartRanking();
                    
                    MuZume.WidgetContainer.Reposition();
				}
			}
		};

		// End MZBrowserAddonsModule ----------------------------------------------------------------------

		// MZMouseGesturesModule --------------------------------------------------------------------------
		
		var MZMouseGesturesModule = {
			Name:"Mouse Gestures",
			Version:1,
			Objects: [],
			Actions: [],
			Initialize:function(mzModuleInterface)
			{
                // TODO: MuZume should be "quittable"
                connect(MuZume, "Open", this._onOpen.bind(this));
                connect(MuZume, "Close", this._onClose.bind(this));
                this._mouseMoveEventListener = this._onMouseMove.bindAsEventListener(this);
                
                this._previousY = null;
                this._previousX = null;
                
                if(MuZume.IsOpen)
                {
                    this._onOpen();
                }
			},
			_onOpen:function()
			{
                Event.observe(document.documentElement, "mousemove", this._mouseMoveEventListener);
			},
			_onClose:function()
			{
                Event.stopObserving(document.documentElement, "mousemove", this._mouseMoveEventListener)
			},
			_onMouseMove:function(e)
			{
                if(e.metaKey) // TODO: Virtual jog dial
                {
                    var x = Event.pointerX(e);//e.screenX;
                    var y = Event.pointerY(e);//e.screenY;
                    
                    if(x < 0 || y < 0)
                    {
                        this._previousX = this._previousY = null;
                        return true;
                    }
                    
                    if(this._previousX != null)
                    {
                        var deltaX = (x - this._previousX) * 2;
                        var deltaY = (y - this._previousY) * 2;
                        
                        document.body.scrollLeft = Math.max(0, document.body.scrollLeft + deltaX);
                        document.body.scrollTop = Math.max(0, document.body.scrollTop + deltaY);
                        
                        x += deltaX;
                        y += deltaY;
                    }
                    
                    this._previousX = x;
                    this._previousY = y;
                    return false; // stop the event
                }
                else
                {
                    this._previousX = this._previousY = null;
                    return true;
                }
			}
        }
		
		// End MZMouseGesturesModule ----------------------------------------------------------------------
		
		// MZDownloadModule -------------------------------------------------------------------------------

		// objects

		function MZDownloadableObject(name, data, icon, caption)
		{
			MZObject.call(this, name, data, icon, caption);
		};
		MZDownloadableObject.inherits(MZObject, {
			ScoreAction:function(mzAction)
			{
				if (mzAction instanceof MZDownloadActionBase)
				{
					return .5;
				}
				else
				{
					return -1;
				}
			}
		});

		function MZYouTubeVideoLinkObject(videoId)
		{
			MZDownloadableObject.call(this, videoId, videoId, null, "YouTube Video: " + videoId);
		};
		MZYouTubeVideoLinkObject.inherits(MZDownloadableObject, {
			GetVideoId:function()
			{
				return this.GetData();
			},
			toString:function()
			{
				return this.GetCaption();
			}
		});

		function MZGoogleVideoLinkObject(videoId)
		{
			MZDownloadableObject.call(this, videoId, videoId, null, "Google Video: " + videoId);
		};
		MZGoogleVideoLinkObject.inherits(MZDownloadableObject, {
			GetVideoId:function()
			{
				return this.GetData();
			},
			toString:function()
			{
				return this.GetCaption();
			}
		});

		function MZGameTrailersVideoLinkObject(videoId, type)
		{
			MZDownloadableObject.call(this, videoId, videoId, null, "GameTrailers.com Video: " + videoId);
		}
		MZGameTrailersVideoLinkObject.inherits(MZDownloadableObject, {
			GetVideoId:function()
			{
				return this.GetData();
			},
			toString:function()
			{
				return this.GetCaption();
			}
		});

		function MZImageObject(name, src, element)
		{
			var node = $BH(element.cloneNode(true));
			$ID(node, true);
			MZDownloadableObject.call(this, name, src, node, "Image: " + src);
			this._element = $ID(element);
		};
		MZImageObject.inherits(MZDownloadableObject, {
			toString:function()
			{
				return this.GetName() + " @ " + this.GetSource();
			},
			GetSource:function()
			{
			    var src = this.GetData();
			    if(src.indexOf("http://") == 0 || src.indexOf("https://") == 0|| src.indexOf("file://") == 0)
			    {
			        return src;
			    }
			    else if(src.indexOf("/") == 0)
			    {
			        return window.location.protocol + "//" + window.location.hostname + src;
			    }
			    else
			    {
			        var pathname = window.location.pathname;
			        if(pathname.charAt(pathname.length-1) != "/")
			        {
			            pathname = pathname.split("/");
			            pathname.pop();
			            pathname = pathname.join("/") + "/";
			        }
			        return window.location.protocol + "//" + window.location.hostname + pathname + src;
			    }
				return this.GetData();
			},
			GetElement:function()
			{
				return $(this._element);
			},
			ScoreAction:function(action)
			{
				var score = -1;
				if(action instanceof MZOpenWithAction)
				{
					score = .5;
				}
				return Math.max(MZDownloadableObject.prototype.ScoreAction.call(this, action), score);
			}
		});

		function MZMoviesObject()
		{
			MZPluralObject.call(this, "Movies", null, $ICON("movies.png"), "Set: All movies on this page");
		};
		MZMoviesObject.inherits(MZPluralObject, {
			GetObjects:function()
			{
				return ["hello"];
			}
		});

		function MZVideosObject()
		{
			MZPluralObject.call(this, "Videos", null, $ICON("videos.png"), "Set: All videos on this page");
		};
		MZVideosObject.inherits(MZPluralObject, {
			GetObjects:function()
			{
				return MZDownloadModule._videoCatalog.Objects;
			}
		});

		function MZMusicObject()
		{
			MZPluralObject.call(this, "Music", null, $ICON("music.png"), "Set: All music on this page");
		};
		MZMusicObject.inherits(MZPluralObject, {
		});

		function MZPicturesObject()
		{
			MZPluralObject.call(this, "Pictures", null, $ICON("pictures.png"), "Set: All pictures on this page");
		};
		MZPicturesObject.inherits(MZPluralObject, {
		});

		function MZImagesObject()
		{
			MZPluralObject.call(this, "Images", null, $ICON("images.png"), "Set: All images on this page");
		};
		MZImagesObject.inherits(MZPluralObject, {
			GetObjects:function()
			{
				return MZDownloadModule._imageCatalog.Objects;
			}
		});

		function MZDocumentsObject()
		{
			MZPluralObject.call(this, "Documents", null, $ICON("documents.png"), "Set: All documents on this page");
		};
		MZDocumentsObject.inherits(MZPluralObject, {
			GetObjects:function()
			{
				return MZDownloadModule._documentCatalog.Objects;
			}
		});

		function MZTorrentsObject()
		{
			MZPluralObject.call(this, "Torrents", null, $ICON("torrents.png"), "Set: All BitTorrent files on this page");
		};
		MZTorrentsObject.inherits(MZPluralObject, {
			GetObjects:function()
			{
				return MZDownloadModule._torrentCatalog.Objects;
			}
		});

		function MZAllDownloadsObject()
		{
			MZPluralObject.call(this, "All Downloads", null, $ICON("download.png"), "Set: All downloads on this page");
		};
		MZAllDownloadsObject.inherits(MZPluralObject, {
			GetObjects:function()
			{
				/* this._imageCatalog = mzModuleInterface.CreateCatalog();
				this._videoCatalog = mzModuleInterface.CreateCatalog();
				this._documentCatalog = mzModuleInterface.CreateCatalog();
				this._programCatalog = mzModuleInterface.CreateCatalog();
				this._torrentCatalog = mzModuleInterface.CreateCatalog();
				this._otherDownloadsCatalog = mzModuleInterface.CreateCatalog();*/
				var catalogs = ["_imageCatalog","_videoCatalog","_documentCatalog","_programCatalog","_torrentCatalog","_otherDownloadsCatalog"];
				var ary = [];
				for(var i=0;i<catalogs.length;i++)
				{
					ary = ary.concat(MZDownloadModule[catalogs[i]].Objects);
				}
				return ary;
			}
		});

		// actions

		function MZDownloadActionBase(name)
		{
			MZAction.call(this, name);
		};
		MZDownloadActionBase.inherits(MZAction, {
			ScoreObject:function(mzObject)
			{
				if (MZDownloadModule.CanDownload(mzObject))
				{
					return .5;
				}
				else
				{
					return -1;
				}
			}
		});

		function MZDownloadAllAction()
		{
			MZDownloadActionBase.call(this, "Download All");
			this.SetIcon($ICON("download.png"));
		};
		MZDownloadAllAction.inherits(MZDownloadActionBase, {
			ScoreObject:function(mzObject)
			{
				if (mzObject instanceof MZPluralObject)
				{
					var objects = mzObject.GetObjects();
					return .5;
					if (!objects || !objects.length || !MZDownloadModule.CanDownload(objects[0]))
					{
						return -1;
					}
					return .5;
				}
				return -1;
			},
			Execute:function(mzPluralObject)
			{
				MuZume.ShowNotification(new MZNotification("Downloading all: " + mzPluralObject.GetObjects()));
			}
		});

		function MZDownloadAction()
		{
			MZDownloadActionBase.call(this, "Download");
			this.SetIcon($ICON("download.png"));
		};
		MZDownloadAction.inherits(MZDownloadActionBase, {});

		var MZDownloadModule = {
			Name:"Download",
			Version:1,
			Objects: [
					new MZMoviesObject(),
					new MZVideosObject(),
					new MZMusicObject(),
					new MZPicturesObject(),
					new MZImagesObject(),
					new MZDocumentsObject(),
					new MZTorrentsObject(),
					new MZAllDownloadsObject()
					],
			Actions: [
					new MZDownloadAction(),
					new MZDownloadAllAction()
					],
			Initialize:function(mzModuleInterface)
			{
				this.ModuleInterface = mzModuleInterface;

				this._objectCatalog = mzModuleInterface.GetObjectCatalog();
				
				this._imageCatalog = mzModuleInterface.CreateCatalog();
				this._videoCatalog = mzModuleInterface.CreateCatalog();
				this._documentCatalog = mzModuleInterface.CreateCatalog();
				this._programCatalog = mzModuleInterface.CreateCatalog();
				this._torrentCatalog = mzModuleInterface.CreateCatalog();
				this._otherDownloadsCatalog = mzModuleInterface.CreateCatalog();

				this._downloadableObjectCache = {};
				/*
				
					 var url = "http://www.flickr.com";
					 var method = "GET";
			
					 var xhr = new FlashXMLHttpRequest();
					 xhr.onload = function() { alert(xhr.responseText); }
					 xhr.open(method, url);
					 xhr.send(null);*/

				// process objects already in the catalog
				for (var i = 0; i < this._objectCatalog.Objects.length; i++)
				{
					this._processExternalObject(this._objectCatalog.Objects[i]);
				}

				var images = document.getElementsByTagName("IMG");
				var l = images.length;
				for (var i = 0; i < l; i++)
				{
					var image = images.item(i);
					if($IS_MUZUME_ELEMENT(image))
					{
                        continue;
					}
					var name = image.getAttribute("ALT");
					var src = image.getAttribute("SRC");
					if (!src)
					{
						continue;
					}
					if (src.indexOf(prefix) == 0)
					{
						continue;
					}
					var autoName = false;
					if (!name)
					{
						autoName = true;
						name = src.split("/");
						name = name[name.length - 1];
					}

					// is this a link?
					if (image.parentNode.tagName.toLowerCase() == "a")
					{
						var href = image.parentNode.getAttribute("HREF");
						if (href && href != "#" && image.parentNode.getAttribute("HREF").replace(" ", "") != "")
						{
							if (href.match(/\.(jpeg|gif|jpg|png|bmp)$/))
							{
								// ok this image points to another image, so this is probably a thumbnail

								if (autoName)
								{
									name = href.split("/");
									name = name[name.length - 1];
								}
								var imageObject = new MZImageObject(name, href, image);

								this._downloadableObjectCache[imageObject.Id] = true;
								this._objectCatalog.AddObject(imageObject);
								this._imageCatalog.AddObject(imageObject);
							}
							else
							{
								// this is probably just some regular link on the page that uses an image

								// TODO: check to see if this hyperlink object is already in the catalog.  If so, just add "name" to the list of secondary triggers.  How can we quickly find these hyperlink objects?
								var node = $BH(image.cloneNode(true));
								$ID(node, true);
								this._objectCatalog.AddObject(new MZHyperlinkObject(name, image.parentNode, node));
							}
						}
					}
					else
					{
						// ok just add an image object to be downloaded then
						var imageObject = new MZImageObject(name, src, image);

						this._downloadableObjectCache[imageObject.Id] = true;
						this._objectCatalog.AddObject(imageObject);
						this._imageCatalog.AddObject(imageObject);
					}
				}

				connect(this._objectCatalog, "ObjectAdded", this._processExternalObject.bind(this));
			},
			CanDownload:function(mzObject)
			{
				var cachedValue = this._downloadableObjectCache[mzObject.Id];
				if (cachedValue == true)
				{
					return true;
				}
				else if (cachedValue == false)
				{
					return false;
				}
				else if (mzObject instanceof MZDownloadableObject)
				{
					return true;
				}
				else
				{
					return false;
				}
			},
			_processExternalObject:function(mzObject)
			{
				if (mzObject instanceof MZHyperlinkObject)
				{
					console.info("MZDownloadModule is processing: " + mzObject);
					var hyperlink = mzObject.GetHyperlink();
					var m;
					if (hyperlink.match(/\.(jpeg|gif|jpg|png|bmp)$/))
					{
						this._imageCatalog.AddObject(mzObject);
						this._downloadableObjectCache[mzObject.Id] = true;
						return;
					}
					if (hyperlink.match(/\.(wmv|mp4|mpeg|mpg|avi|mov)$/))
					{
						this._videoCatalog.AddObject(mzObject);
						this._downloadableObjectCache[mzObject.Id] = true;
						return;
					}
					if (hyperlink.match(/\.(exe|bin|app)$/))
					{
						this._programCatalog.AddObject(mzObject);
						this._downloadableObjectCache[mzObject.Id] = true;
						return;
					}
					if (hyperlink.match(/\.(doc|pdf)$/))
					{
						this._documentCatalog.AddObject(mzObject);
						this._downloadableObjectCache[mzObject.Id] = true;
						return;
					}
					if (hyperlink.match(/\.torrent$/))
					{
						this._torrentCatalog.AddObject(mzObject);
						this._downloadableObjectCache[mzObject.Id] = true;
						return;
					}

					var domain = location.hostname;

					m = hyperlink.match(/^(?:(?:http(?:s?))\:\/\/)?(?:www.|[a-zA-Z].)?youtube\.com\/watch\?v=([a-zA-Z0-9]+)/);
					if (!m && domain.match(/youtube\.com/))
					{
						m = hyperlink.match(/^\/watch\?v=([a-zA-Z0-9]+)/)
					}
					if (m) // http://youtube.com/watch?v=3vQKAtHdfuc
					{
						var ytObject = new MZYouTubeVideoLinkObject(m[1])
						this._objectCatalog.AddObject(ytObject);
						this._videoCatalog.AddObject(ytObject);
						this._downloadableObjectCache[ytObject.Id] = true;
						return;
					}

					m = hyperlink.match(/^(?:(?:http(?:s?))\:\/\/)?video\.google\.com\/videoplay\?docid=([-a-zA-Z0-9]+)/);
					if (!m && domain.match(/video\.google\.com/))
					{
						m = hyperlink.match(/^videoplay\?docid=([-a-zA-Z0-9]+)/)
					}
					if (m)
					{
						var gvObject = new MZGoogleVideoLinkObject(m[1])
						this._objectCatalog.AddObject(gvObject);
						this._videoCatalog.AddObject(gvObject);
						this._downloadableObjectCache[gvObject.Id] = true;
						return;
					}

					m = hyperlink.match(/^(?:(?:http(?:s?))\:\/\/)?(?:www.|[a-zA-Z].)?gametrailers\.com\/(?:player|download)\.php\?id=([0-9]+)/);
					if (!m && domain.match(/gametrailers\.com/))
					{
					}
					if (m = hyperlink.match(/(?:player|download)\.php\?id=([0-9]+)/))
					{
						// TODO: Match type
						var gtObject = new MZGameTrailersVideoLinkObject(m[1]);
						this._objectCatalog.AddObject(gtObject);
						this._videoCatalog.AddObject(gtObject);
						this._downloadableObjectCache[gtObject.Id] = true;
					}
				}
			}
		};

        // MZAddressBookModule
        function MZAddressBookObject()
        {
            MZObject.call(this, "Address Book", null, $ICON("addressbook.png"), "Catalog: An address book containing contacts and organizations");
        };
        MZAddressBookObject.inherits(MZObject,{
            
        });

        function MZImportAddressesAction()
        {
            MZAction.call(this, "Import Addresses...", null, null, "Action: Import address into the address book from a specified location");
        }
        MZImportAddressesAction.inherits(MZAction, {

        });

        var MZAddressBookModule = {
			Name:"Address Book",
			Version:1,
			Objects: [
					new MZAddressBookObject(),
					],
			Actions: [
					new MZImportAddressesAction(),
					],
			Initialize:function(mzModuleInterface)
			{
				this.ModuleInterface = mzModuleInterface;
            }
        }
        
		// MZDebugModule
		function MZDebugObject()
		{
			MZObject.call(this, "Debug", null, $ICON("debug.png"), "MuZume debugging utilities");
		};
		MZDebugObject.inherits(MZObject, {
			ScoreAction:function(mzAction)
			{
				if (mzAction instanceof MZDebugAction)
				{
					return .5;
				}
				return -1;
			}
		});

		function MZDebugAction(name, data)
		{
			MZAction.call(this, name, data);
		};
		MZDebugAction.inherits(MZAction, {
			ScoreObject:function(mzObject)
			{
				if (mzObject instanceof MZDebugObject)
				{
					return .5;
				}
				return -1;
			}
		});
		
		function MZXaeiOSKillProcessAction()
		{
			MZDebugAction.call(this, "Kill XaeiOS Process");
			this.SetIcon($ICON("kill-process.png"));
		}
		MZXaeiOSKillProcessAction.inherits(MZDebugAction, {
			Execute:function(mzObject)
			{
				MuZume.ShowNotification(new MZNotification("Not yet implemented", $ICON("kill-process.png")));
			}
		});

		function MZXaeiOSSystemMonitorAction()
		{
			MZDebugAction.call(this, "XaeiOS System Monitor");
			this.SetIcon($ICON("system-monitor.png"));
		};
		MZXaeiOSSystemMonitorAction.inherits(MZDebugAction, {
			Execute:function(mzObject)
			{
				var stats = XaeiOS.GetTaskStatistics();
				var s = [];
				for(var i in stats)
				{
					if(i == "undefined" || !(stats.hasOwnProperty(i)))
					{
						continue;
					}
					s.push("Task: " + i + " ::\n\tCPU Time: " + stats[i] + " ms\n");
				}
				console.info(s.join("\n"));
			}
		});

		function MZClearDataAction()
		{
			MZDebugAction.call(this, "Clear Data");
			this.SetIcon($ICON("clear-data.png"));
		};
		MZClearDataAction.inherits(MZDebugAction, {
			Execute:function(mzObject)
			{
				MuZume.ExternalKernel.ClearData();
				MuZume.ShowNotification(new MZNotification("Personal data cleared", $ICON("clear-data.png")));
			}
		});

		function MZReportABugAction()
		{
			MZDebugAction.call(this, "Report A Bug");
			this.SetIcon($ICON("bug-report.png"));
		};
		MZReportABugAction.inherits(MZDebugAction, {
			Execute:function(mzObject)
			{
				MuZume.ShowNotification(new MZNotification("Not yet implemented", $ICON("bug-report.png")));
			}
		});

		function MZXaeiOSTerminalAction()
		{
			MZDebugAction.call(this, "XaeiOS Terminal");
			this.SetIcon($ICON("terminal.png"));
		};
		MZXaeiOSTerminalAction.inherits(MZDebugAction, {
			Execute:function(mzObject)
			{
				MuZume.ShowNotification(new MZNotification("Not yet implemented", $ICON("terminal.png")));
			}
		});

		function MZKernelDebuggerAction()
		{
			MZDebugAction.call(this, "Kernel Debugger");
			this.SetIcon($ICON("debug.png"));
		};
		MZKernelDebuggerAction.inherits(MZDebugAction, {
			Execute:function(mzObject)
			{
				setTimeout(function()
				{
					eval("debugger;");
				});
			}
		});

		function MZExternalKernelDebuggerAction()
		{
			MZDebugAction.call(this, "External Kernel Debugger");
			this.SetIcon($ICON("debug.png"));
		};
		MZExternalKernelDebuggerAction.inherits(MZDebugAction, {
			Execute:function(mzObject)
			{
				MuZume.ExternalKernel.Debug();
			}
		});

		var MZDebugModule = {
			Name:"Debug",
			Version:1,
			Objects: [
					new MZDebugObject(),
					],
			Actions: [
					new MZClearDataAction(),
					new MZXaeiOSTerminalAction(),
					new MZXaeiOSSystemMonitorAction(),
					new MZReportABugAction(),
					new MZXaeiOSKillProcessAction(),
					new MZExternalKernelDebuggerAction(),
					new MZKernelDebuggerAction()
			],
			Initialize:function(mzModuleInterface)
			{
				window.ShowLog = this.Actions[0].Execute.bind(this.Actions[0]);
			}
		};
		
		function MZRSSFeedObject(title, url)
		{
			MZObject.call(this, title, url, $ICON("RSS.png"), "RSS Feed: " + url);
		};
		MZRSSFeedObject.inherits(MZObject, {
			ScoreAction:function(mzAction)
			{
				if (mzAction instanceof MZRSSSubscribeAction)
				{
					return 1;
				}
				return -1;
			},
			GetUrl:function()
			{
                return this.GetData();
			}
		});
		
		function MZRSSSubscribeAction()
		{
			MZAction.call(this, "Subscribe", null, $ICON("RSS.png"), "Action: Subscribe to this RSS feed");
		};
		MZRSSSubscribeAction.inherits(MZAction, {
			ScoreObject:function(mzObject)
			{
				if(mzObject instanceof MZRSSFeedObject)
				{
					return 1;
				}
				return -1;
			},
			Execute:function(mzRSSFeedObject)
			{
                MuZume.ShowNotification(new MZNotification("Not yet implemented: " + mzRSSFeedObject.GetUrl(), $ICON("RSS.png")));
			}
		});

		var MZRSSModule = {
			Name:"RSS",
			Version:1,
			Objects: [
			],
			Actions: [
			],
			Initialize:function(mzModuleInterface)
			{
                var linkTags = document.getElementsByTagName("link");
                var href = null;
                for(var i=0;i<linkTags.length;i++)
                {
                    var linkTag = linkTags[i];
                    if(linkTag.getAttribute("type") == "application/rss+xml")
                    {
                        href = linkTag.getAttribute("href"); // TODO: Make into an absolute url
                        if(href)
                        {
                            this.Objects.push(new MZRSSFeedObject(linkTag.getAttribute("title") || href, href));
                        }
                    }
                }
                if(href)
                {
                    this.Actions.push(new MZRSSSubscribeAction());
                }
			}
		};
		
		function MZPasswordGeneratorObject()
		{
			MZObject.call(this, "Password Generator", null, $ICON("keyring.png"), "Application: Securely use a single password everywhere");
		};
		MZPasswordGeneratorObject.inherits(MZObject, {
			ScoreAction:function(mzAction)
			{
				if(mzAction instanceof MZGeneratePasswordAction)
				{
					return .5;
				}
				return -1;
			}
		});
		
		function MZGeneratePasswordAction()
		{
            // TODO: Complete password generator module and add settings to store master password
			MZAction.call(this, "Open");
			var defaultDomain = window.location.host;
			var parts = defaultDomain.split(".");
			if(parts.length > 2)
			{
			     defaultDomain = [parts[parts.length - 2], parts[parts.length - 1]].join(".");
			}
			this.SetParameterSignature([new MZPasswordParameter("Master Password"), new MZTextParameter("Domain", defaultDomain)]);
		};
		MZGeneratePasswordAction.inherits(MZAction, {
			Execute:function(passwordGeneratorObject, passwordTextObject, domainTextObject)
			{
                MuZume.ShowNotification(new MZNotification(passwordTextObject + " : " + domainTextObject));
			},
			ScoreObject:function(mzObject)
			{
				if (mzObject instanceof MZPasswordGeneratorObject)
				{
					return 1;
				}
				return -1;
			}
		});

		var MZPasswordGeneratorModule = {
			Name:"Password Generator",
			Version:1,
			Objects: [
                new MZPasswordGeneratorObject()
			],
			Actions: [
                new MZGeneratePasswordAction()
			],
			Initialize:function(mzModuleInterface)
			{
			}
		};

		var PublicClasses = {
			"MZScriptObject":MZScriptObject,
			"MZApplicationObject":MZApplicationObject
		};
			
        window.MuZumePublicInterface = {
			_isInitialized:false,
			_pendingOpen:false,
			IsInitialized:function()
			{
				return this._isInitialized;
			},
            SetStartBackground:function(value)
            {
                window.__muzume__background = value;
            },
			SetStartText:function(value)
			{
				window.__muzume__startText = value || "";
			},
            Open:function()
            {
				if(!this.IsInitialized())
				{
					this._pendingOpen = true;
					return;
				}
	            MuZume.Open();
            },
			Close:function()
			{
				if(!this.IsInitialized())
				{
					return;
				}
				MuZume.Close();
			},
            LoadModule:function(module)
            {
                // TODO: Check module and return false if bad
				if(!this.IsInitialized())
				{
					connectOnce(this, "Initialize", MuZume.LoadModule.bind(MuZume, module, MZModuleInterface));
				}
				else
				{
                	MuZume.LoadModule(module, MZModuleInterface);
				}
            },
			ShowNotification:function(text)
			{
                if(text instanceof MZNotification)
                {
                    MuZume.ShowNotification(text);
                }
                else
                {
                    MuZume.ShowNotification(new MZNotification(text));
                }
			},
			GetClass:function(name)
			{
				return PublicClasses[name];
			},
			GetIcon:function(name)
			{
				return $ICON(name);
			}
        };
		registerSignals(MuZumePublicInterface, ["Initialize"]);
		
		// initialization code

		// insert external kernel
        MuZumeSwf = "muzume_swf";

		var muZumeSwfContainer = document.createElement("DIV");
		
        var s = '<OBJECT ';
        
        if(IS_IE)
        {
            s += 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" \
            codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,16,0"';
        }
        
        var muZumeSwfFileName = "MuZume" + (INVOKE_DEBUGGER?"-debug":"") + ".swf";
        
        s += 'id="'+MuZumeSwf+'" \
            data="' + (prefix + '/' + muZumeSwfFileName) + '" \
            type="application/x-shockwave-flash" \
            height="0" width="0"><PARAM name="movie" \
            value="'+(prefix + "/MuZume.swf")+'">\
                <PARAM name="quality" value="high"> \
                <PARAM name="swliveconnect" value="true"> \
                <PARAM name="allowScriptAccess" value="always"> \
                <PARAM name="pluginurl" value="http://www.macromedia.com/go/getflashplayer"> \
                <PARAM name="pluginspage" value="http://www.macromedia.com/go/getflashplayer"> \
            </OBJECT>';
        
        muZumeSwfContainer.innerHTML = s;
//		muZumeSwfContainer.style.display = "none";
//		muZumeSwfContainer.style.visibility = "hidden";
        setTimeout(function() {
            document.documentElement.appendChild(muZumeSwfContainer);
            muZumeSwfContainer = $ID(muZumeSwfContainer);
        },1);
		
		window.onbeforeunload = function()
		{
			// cleanup
			
			// stop all tasks (cancel all async operations)
			
			// shutdown XaeiOS
			XaeiOS.Shutdown();
	
			try
			{
				MuZume.WidgetContainer.GetElement().innerHTML = "";
				MuZume._browseWidgetContainer.GetElement().innerHTML = "";
				MuZume._notificationWidgetContainer.GetElement().innerHTML = "";
				document.documentElement.removeChild(MuZume.WidgetContainer.GetElement());
				document.documentElement.removeChild(MuZume._browseWidgetContainer.GetElement());
				document.documentElement.removeChild(MuZume._notificationWidgetContainer.GetElement());
				document.documentElement.removeChild($(bhElement));
				document.documentElement.removeChild($(muZumeSwfContainer));
			}
			catch(e)
			{
			};
			
			MuZume = null;
			MuZumeSwf = null;
			
			
			if(!IS_IE)
			{
                delete window["MuZumePublicInterface"];
			
                //var s = [];
                var count = 0;
                for(var i in window)
                {
                    if(window.hasOwnProperty(i) && !(i in windowProps))
                    {
                        count++;
                    }
                }
                
                for(var i in window)
                {
                    if(window.hasOwnProperty(i) && !(i in windowProps))
                    {
                        //s.push(i);
                        delete window[i];
                    }
                    if(--count <= 0)
                    {
                        break;
                    }
                }
			}
			//alert(s);
		}

        // poll for dependencies to be loaded

        var intervalId = setInterval(function()
        {
            try
            {
                if ($(MuZumeSwf).Ping() != "Pong")
                {
					return;
                }

            }
            catch(e)
			{
				return;
			}
			
			clearInterval(intervalId);
			
			MuZume.Initialize();
			MuZume.Start();
			MuZumePublicInterface._isInitialized = true;
			
			if(window.location.href.indexOf("?ClearMuZumeData") != -1)
			{
				MuZume.ExternalKernel.ClearData();
				MuZume.ShowNotification(new MZNotification("Personal data cleared", $ICON("clear-data.png")));            
			}
			else if(window.location.href.indexOf("?DebugMuZumeExternalKernel") != -1)
			{
                MuZume.ExternalKernel.Debug();
			}
			
			if(MuZumePublicInterface._pendingOpen)
			{
				MuZume.Open();
			}
			signal(MuZumePublicInterface, "Initialize");
        }, 1);
    }
    else if(window.MuZumePublicInterface != null && window.MuZumePublicInterface.IsInitialized())
    {
		// reshow muzume
		window.MuZumePublicInterface.Open();
    }
	else
	{
		// muzume is loading
	}
})();
