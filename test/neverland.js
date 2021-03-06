var neverland = (function (exports) {
  'use strict';

  /*! (c) Andrea Giammarchi - ISC */
  var self = null ||
  /* istanbul ignore next */
  {};
  self.CustomEvent = typeof CustomEvent === 'function' ? CustomEvent : function (__p__) {
    CustomEvent[__p__] = new CustomEvent('').constructor[__p__];
    return CustomEvent;

    function CustomEvent(type, init) {
      if (!init) init = {};
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, !!init.bubbles, !!init.cancelable, init.detail);
      return e;
    }
  }('prototype');
  var CustomEvent$1 = self.CustomEvent;

  /*! (c) Andrea Giammarchi - ISC */
  var self$1 = null ||
  /* istanbul ignore next */
  {};

  try {
    self$1.WeakSet = WeakSet;
  } catch (WeakSet) {
    // requires a global WeakMap (IE11+)
    (function (WeakMap) {
      var all = new WeakMap();
      var proto = WeakSet.prototype;

      proto.add = function (value) {
        return all.get(this).set(value, 1), this;
      };

      proto.delete = function (value) {
        return all.get(this).delete(value);
      };

      proto.has = function (value) {
        return all.get(this).has(value);
      };

      self$1.WeakSet = WeakSet;

      function WeakSet(iterable) {

        all.set(this, new WeakMap());
        if (iterable) iterable.forEach(this.add, this);
      }
    })(WeakMap);
  }

  var WeakSet$1 = self$1.WeakSet;

  

  var now = null;
  var current = function current() {
    return now;
  };
  var empty = [];
  var setup = [];
  var $ = function $(value, args) {
    return typeof(value) === typeof($) ? value.apply(null, args) : value;
  };
  var diff = function diff(a, b) {
    return a.length !== b.length || a.some(diverse, b);
  };
  var stacked = function stacked(id) {
    return function (runner) {
      var state = {
        i: 0,
        stack: []
      };
      runner[id] = state;
      runner.before.push(function () {
        state.i = 0;
      });
    };
  };
  var id$1 = 0;
  var uid = function uid() {
    return '_$' + id$1++;
  };
  var unstacked = function unstacked(id) {
    var _now = now,
        state = _now[id],
        update = _now.update;
    var i = state.i,
        stack = state.stack;
    state.i++;
    return {
      i: i,
      stack: stack,
      update: update,
      unknown: i === stack.length
    };
  };
  var augmentor = (function (fn) {
    var current = runner($);
    each(setup, current);

    $.reset = function () {
      each(current.reset, current);

      for (var key in current) {
        if (/^_\$/.test(key)) current[key].stack.splice(0);
      }
    };

    return $;

    function $() {
      var prev = now;
      now = current;
      var _ = current._,
          before = current.before,
          after = current.after,
          external = current.external;

      try {
        var result;

        do {
          _.$ = _._ = false;
          each(before, current);
          result = fn.apply(_.c = this, _.a = arguments);
          each(after, current);
          if (external.length) each(external.splice(0), result);
        } while (_._);

        return result;
      } finally {
        _.$ = true;
        now = prev;
      }
    }
  });

  var each = function each(arr, value) {
    var length = arr.length;
    var i = 0;

    while (i < length) {
      arr[i++](value);
    }
  };

  var runner = function runner($) {
    var _ = {
      _: true,
      $: true,
      c: null,
      a: null
    };
    return {
      _: _,
      before: [],
      after: [],
      external: [],
      reset: [],
      update: function update() {
        return _.$ ? $.apply(_.c, _.a) : _._ = true;
      }
    };
  };

  function diverse(value, i) {
    return value !== this[i];
  }

  var id$2 = uid();
  var cancel, request;

  try {
    cancel = cancelAnimationFrame;
    request = requestAnimationFrame;
  } catch (o_O) {
    cancel = clearTimeout;
    request = setTimeout;
  }

  var create = function create(always, check, inputs, raf, cb, stack, i) {
    var info = {
      always: always,
      cb: cb,
      check: check,
      clean: null,
      inputs: inputs,
      raf: raf,
      t: 0,
      update: check,
      fn: function fn() {
        set$1(stack[i], info.cb());
      }
    };
    return info;
  };

  var effect = function effect(raf) {
    return function (cb, refs) {
      var _unstacked = unstacked(id$2),
          i = _unstacked.i,
          stack = _unstacked.stack,
          unknown = _unstacked.unknown;

      var comp = refs || empty;

      if (unknown) {
        var always = comp === empty;

        var check = always || !raf || typeof(comp) !== typeof(effect);

        if (always || !raf || typeof(comp) !== typeof(effect)) {
          stack.push(create(always, check, comp, raf, cb, stack, i));
        } else {
          current().external.push(function (result) {
            return refs(cb, result);
          });
          stack.push(create(always, always, empty, raf, effect, stack, i));
        }
      } else {
        var info = stack[i];
        var _check = info.check,
            _always = info.always,
            inputs = info.inputs;

        if (_check && (_always || diff(inputs, comp))) {
          info.cb = cb;
          info.inputs = comp;
          info.update = true;
        }
      }
    };
  };

  var set$1 = function set(info, clean) {
    info.t = 0;
    info.clean = clean;
  };

  setup.push(function (runner) {
    var stack = [];
    var state = {
      i: 0,
      stack: stack
    };

    var drop = function drop(current$$1, clean, raf, t) {
      if (raf && t) cancel(t);else if (clean) clean();
      set$1(current$$1, null);
    };

    runner[id$2] = state;
    runner.before.push(function () {
      state.i = 0;
    });
    runner.reset.push(function () {
      state.i = 0;

      for (var length = stack.length, i = 0; i < length; i++) {
        var _current = stack[i];
        var check = _current.check,
            clean = _current.clean,
            raf = _current.raf,
            t = _current.t;
        if (check) drop(_current, clean, raf, t);
      }
    });
    runner.after.push(function () {
      for (var length = stack.length, i = 0; i < length; i++) {
        var _current2 = stack[i];
        var check = _current2.check,
            clean = _current2.clean,
            fn = _current2.fn,
            raf = _current2.raf,
            t = _current2.t,
            update = _current2.update;

        if (check && update) {
          _current2.update = false;
          drop(_current2, clean, raf, t);
          if (raf) _current2.t = request(fn);else fn();
        }
      }
    });
  });
  var useEffect = effect(true);
  var useLayoutEffect = effect(false);

  var id$3 = uid();
  setup.push(stacked(id$3));
  var useRef = (function (value) {
    var _unstacked = unstacked(id$3),
        i = _unstacked.i,
        stack = _unstacked.stack,
        unknown = _unstacked.unknown;

    if (unknown) {
      var info = {
        current: null
      };
      stack.push(info);
      info.current = $(value, empty);
    }

    return stack[i];
  });

  var id$4 = uid();
  setup.push(stacked(id$4));
  var useMemo = (function (callback, refs) {
    var _unstacked = unstacked(id$4),
        i = _unstacked.i,
        stack = _unstacked.stack,
        unknown = _unstacked.unknown;

    var comp = refs || empty;
    if (unknown) create$1(stack, -1, callback, comp);
    var _stack$i = stack[i],
        filter = _stack$i.filter,
        value = _stack$i.value,
        fn = _stack$i.fn,
        inputs = _stack$i.inputs;
    return (filter ? diff(inputs, comp) : callback !== fn) ? create$1(stack, i, callback, comp) : value;
  });

  var create$1 = function create(stack, i, fn, inputs) {
    var info = {
      filter: inputs !== empty,
      value: null,
      fn: fn,
      inputs: inputs
    };
    if (i < 0) stack.push(info);else stack[i] = info;
    info.value = fn();
    return info.value;
  };

  var callback = (function (fn, inputs) {
    return useMemo(function () {
      return fn;
    }, inputs);
  });

  var id$5 = uid();
  setup.push(stacked(id$5));
  var useReducer = (function (reducer, value) {
    var _unstacked = unstacked(id$5),
        i = _unstacked.i,
        stack = _unstacked.stack,
        unknown = _unstacked.unknown,
        update = _unstacked.update;

    if (unknown) {
      var info = [null, function (action) {
        value = reducer(value, action);
        info[0] = value;
        update();
      }];
      stack.push(info);
      info[0] = $(value, empty);
    }

    return stack[i];
  });

  var state = (function (value) {
    return useReducer(function (_, value) {
      return $(value, [_]);
    }, value);
  });

  var all = new WeakMap();
  var id$6 = uid();
  setup.push(stacked(id$6));
  var createContext = function createContext(value) {
    var context = {
      value: value,
      provide: provide
    };
    all.set(context, []);
    return context;
  };
  var useContext = function useContext(context) {
    var _unstacked = unstacked(id$6),
        i = _unstacked.i,
        stack = _unstacked.stack,
        unknown = _unstacked.unknown,
        update = _unstacked.update;

    if (unknown) {
      all.get(context).push(update);
      stack.push(context);
    }

    return stack[i].value;
  };

  function provide(value) {
    if (this.value !== value) {
      this.value = value;

      for (var arr = all.get(this), length = arr.length, i = 0; i < length; i++) {
        arr[i]();
      }
    }
  }

  /*! (c) Andrea Giammarchi */
  function disconnected(poly) {

    var CONNECTED = 'connected';
    var DISCONNECTED = 'dis' + CONNECTED;
    var Event = poly.Event;
    var WeakSet = poly.WeakSet;
    var notObserving = true;
    var observer = new WeakSet();
    return function observe(node) {
      if (notObserving) {
        notObserving = !notObserving;
        startObserving(node.ownerDocument);
      }

      observer.add(node);
      return node;
    };

    function startObserving(document) {
      var dispatched = null;

      try {
        new MutationObserver(changes).observe(document, {
          subtree: true,
          childList: true
        });
      } catch (o_O) {
        var timer = 0;
        var records = [];

        var reschedule = function reschedule(record) {
          records.push(record);
          clearTimeout(timer);
          timer = setTimeout(function () {
            changes(records.splice(timer = 0, records.length));
          }, 0);
        };

        document.addEventListener('DOMNodeRemoved', function (event) {
          reschedule({
            addedNodes: [],
            removedNodes: [event.target]
          });
        }, true);
        document.addEventListener('DOMNodeInserted', function (event) {
          reschedule({
            addedNodes: [event.target],
            removedNodes: []
          });
        }, true);
      }

      function changes(records) {
        dispatched = new Tracker();

        for (var record, length = records.length, i = 0; i < length; i++) {
          record = records[i];
          dispatchAll(record.removedNodes, DISCONNECTED, CONNECTED);
          dispatchAll(record.addedNodes, CONNECTED, DISCONNECTED);
        }

        dispatched = null;
      }

      function dispatchAll(nodes, type, counter) {
        for (var node, event = new Event(type), length = nodes.length, i = 0; i < length; (node = nodes[i++]).nodeType === 1 && dispatchTarget(node, event, type, counter)) {
        }
      }

      function dispatchTarget(node, event, type, counter) {
        if (observer.has(node) && !dispatched[type].has(node)) {
          dispatched[counter].delete(node);
          dispatched[type].add(node);
          node.dispatchEvent(event);
          /*
          // The event is not bubbling (perf reason: should it?),
          // hence there's no way to know if
          // stop/Immediate/Propagation() was called.
          // Should DOM Level 0 work at all?
          // I say it's a YAGNI case for the time being,
          // and easy to implement in user-land.
          if (!event.cancelBubble) {
            var fn = node['on' + type];
            if (fn)
              fn.call(node, event);
          }
          */
        }

        for (var // apparently is node.children || IE11 ... ^_^;;
        // https://github.com/WebReflection/disconnected/issues/1
        children = node.children || [], length = children.length, i = 0; i < length; dispatchTarget(children[i++], event, type, counter)) {
        }
      }

      function Tracker() {
        this[CONNECTED] = new WeakSet();
        this[DISCONNECTED] = new WeakSet();
      }
    }
  }

  var find = function find(node) {
    var childNodes = node.childNodes;
    var length = childNodes.length;
    var i = 0;

    while (i < length) {
      var child = childNodes[i++];
      if (child.nodeType === 1) return child;
    }

    throw 'unobservable';
  };

  var observe = disconnected({
    Event: CustomEvent$1,
    WeakSet: WeakSet$1
  });

  var observer = function observer($, element) {
    var nodeType = element.nodeType;

    if (nodeType) {
      var node = nodeType === 1 ? element : find(element);
      observe(node);
      var handler = {
        handleEvent: handleEvent,
        onconnected: onconnected,
        ondisconnected: ondisconnected,
        $: $,
        _: null
      };
      node.addEventListener('connected', handler, false);
      node.addEventListener('disconnected', handler, false);
    } else {
      var value = element.valueOf(); // give a chance to facades to return a reasonable value

      if (value !== element) observer($, value);
    }
  };

  var useEffect$1 = function useEffect$$1(fn, inputs) {
    var args = [fn];
    if (inputs) // if the inputs is an empty array
      // observe the returned element for connect/disconnect events
      // and invoke effects/cleanup on these events only
      args.push(inputs.length ? inputs : observer);
    return useEffect.apply(null, args);
  };

  function handleEvent(e) {
    this['on' + e.type]();
  }

  function onconnected() {
    ondisconnected.call(this);
    this._ = this.$();
  }

  function ondisconnected() {
    var _ = this._;
    this._ = null;
    if (_) _();
  }

  /*! (c) Andrea Giammarchi - ISC */
  var self$2 = null ||
  /* istanbul ignore next */
  {};

  try {
    self$2.WeakMap = WeakMap;
  } catch (WeakMap) {
    // this could be better but 90% of the time
    // it's everything developers need as fallback
    self$2.WeakMap = function (id, Object) {

      var dP = Object.defineProperty;
      var hOP = Object.hasOwnProperty;
      var proto = WeakMap.prototype;

      proto.delete = function (key) {
        return this.has(key) && delete key[this._];
      };

      proto.get = function (key) {
        return this.has(key) ? key[this._] : void 0;
      };

      proto.has = function (key) {
        return hOP.call(key, this._);
      };

      proto.set = function (key, value) {
        dP(key, this._, {
          configurable: true,
          value: value
        });
        return this;
      };

      return WeakMap;

      function WeakMap(iterable) {
        dP(this, '_', {
          value: '_@ungap/weakmap' + id++
        });
        if (iterable) iterable.forEach(add, this);
      }

      function add(pair) {
        this.set(pair[0], pair[1]);
      }
    }(Math.random(), Object);
  }

  var WeakMap$1 = self$2.WeakMap;

  /*! (c) Andrea Giammarchi - ISC */
  var templateLiteral = function () {

    var RAW = 'raw';
    var isNoOp = (typeof document === "undefined" ? "undefined" : typeof(document)) !== 'object';

    var _templateLiteral = function templateLiteral(tl) {
      if ( // for badly transpiled literals
      !(RAW in tl) || // for some version of TypeScript
      tl.propertyIsEnumerable(RAW) || // and some other version of TypeScript
      !Object.isFrozen(tl[RAW]) || // or for Firefox < 55
      /Firefox\/(\d+)/.test((document.defaultView.navigator || {}).userAgent) && parseFloat(RegExp.$1) < 55) {
        var forever = {};

        _templateLiteral = function templateLiteral(tl) {
          for (var key = '.', i = 0; i < tl.length; i++) {
            key += tl[i].length + '.' + tl[i];
          }

          return forever[key] || (forever[key] = tl);
        };
      } else {
        isNoOp = true;
      }

      return TL(tl);
    };

    return TL;

    function TL(tl) {
      return isNoOp ? tl : _templateLiteral(tl);
    }
  }();

  function tta (template) {
    var length = arguments.length;
    var args = [templateLiteral(template)];
    var i = 1;

    while (i < length) {
      args.push(arguments[i++]);
    }

    return args;
  }

  /*! (c) Andrea Giammarchi - ISC */
  var Wire = function (slice, proto) {
    proto = Wire.prototype;
    proto.ELEMENT_NODE = 1;
    proto.nodeType = 111;

    proto.remove = function (keepFirst) {
      var childNodes = this.childNodes;
      var first = this.firstChild;
      var last = this.lastChild;
      this._ = null;

      if (keepFirst && childNodes.length === 2) {
        last.parentNode.removeChild(last);
      } else {
        var range = this.ownerDocument.createRange();
        range.setStartBefore(keepFirst ? childNodes[1] : first);
        range.setEndAfter(last);
        range.deleteContents();
      }

      return first;
    };

    proto.valueOf = function (forceAppend) {
      var fragment = this._;
      var noFragment = fragment == null;
      if (noFragment) fragment = this._ = this.ownerDocument.createDocumentFragment();

      if (noFragment || forceAppend) {
        for (var n = this.childNodes, i = 0, l = n.length; i < l; i++) {
          fragment.appendChild(n[i]);
        }
      }

      return fragment;
    };

    return Wire;

    function Wire(childNodes) {
      var nodes = this.childNodes = slice.call(childNodes, 0);
      this.firstChild = nodes[0];
      this.lastChild = nodes[nodes.length - 1];
      this.ownerDocument = nodes[0].ownerDocument;
      this._ = null;
    }
  }([].slice);

  var isArray = Array.isArray;
  var wireType = Wire.prototype.nodeType;

  /*! (c) Andrea Giammarchi - ISC */
  var createContent = function (document) {

    var FRAGMENT = 'fragment';
    var TEMPLATE = 'template';
    var HAS_CONTENT = 'content' in create(TEMPLATE);
    var createHTML = HAS_CONTENT ? function (html) {
      var template = create(TEMPLATE);
      template.innerHTML = html;
      return template.content;
    } : function (html) {
      var content = create(FRAGMENT);
      var template = create(TEMPLATE);
      var childNodes = null;

      if (/^[^\S]*?<(col(?:group)?|t(?:head|body|foot|r|d|h))/i.test(html)) {
        var selector = RegExp.$1;
        template.innerHTML = '<table>' + html + '</table>';
        childNodes = template.querySelectorAll(selector);
      } else {
        template.innerHTML = html;
        childNodes = template.childNodes;
      }

      append(content, childNodes);
      return content;
    };
    return function createContent(markup, type) {
      return (type === 'svg' ? createSVG : createHTML)(markup);
    };

    function append(root, childNodes) {
      var length = childNodes.length;

      while (length--) {
        root.appendChild(childNodes[0]);
      }
    }

    function create(element) {
      return element === FRAGMENT ? document.createDocumentFragment() : document.createElementNS('http://www.w3.org/1999/xhtml', element);
    } // it could use createElementNS when hasNode is there
    // but this fallback is equally fast and easier to maintain
    // it is also battle tested already in all IE


    function createSVG(svg) {
      var content = create(FRAGMENT);
      var template = create('div');
      template.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>';
      append(content, template.firstChild.childNodes);
      return content;
    }
  }(document);

  /*! (c) Andrea Giammarchi - ISC */
  var self$3 = null ||
  /* istanbul ignore next */
  {};

  try {
    self$3.Map = Map;
  } catch (Map) {
    self$3.Map = function Map() {
      var i = 0;
      var k = [];
      var v = [];
      return {
        delete: function _delete(key) {
          var had = contains(key);

          if (had) {
            k.splice(i, 1);
            v.splice(i, 1);
          }

          return had;
        },
        get: function get(key) {
          return contains(key) ? v[i] : void 0;
        },
        has: function has(key) {
          return contains(key);
        },
        set: function set(key, value) {
          v[contains(key) ? i : k.push(key) - 1] = value;
          return this;
        }
      };

      function contains(v) {
        i = k.indexOf(v);
        return -1 < i;
      }
    };
  }

  var Map$1 = self$3.Map;

  var append = function append(get, parent, children, start, end, before) {
    if (end - start < 2) parent.insertBefore(get(children[start], 1), before);else {
      var fragment = parent.ownerDocument.createDocumentFragment();

      while (start < end) {
        fragment.appendChild(get(children[start++], 1));
      }

      parent.insertBefore(fragment, before);
    }
  };
  var eqeq = function eqeq(a, b) {
    return a == b;
  };
  var identity = function identity(O) {
    return O;
  };
  var indexOf = function indexOf(moreNodes, moreStart, moreEnd, lessNodes, lessStart, lessEnd, compare) {
    var length = lessEnd - lessStart;
    /* istanbul ignore if */

    if (length < 1) return -1;

    while (moreEnd - moreStart >= length) {
      var m = moreStart;
      var l = lessStart;

      while (m < moreEnd && l < lessEnd && compare(moreNodes[m], lessNodes[l])) {
        m++;
        l++;
      }

      if (l === lessEnd) return moreStart;
      moreStart = m + 1;
    }

    return -1;
  };
  var isReversed = function isReversed(futureNodes, futureEnd, currentNodes, currentStart, currentEnd, compare) {
    while (currentStart < currentEnd && compare(currentNodes[currentStart], futureNodes[futureEnd - 1])) {
      currentStart++;
      futureEnd--;
    }
    return futureEnd === 0;
  };
  var next = function next(get, list, i, length, before) {
    return i < length ? get(list[i], 0) : 0 < i ? get(list[i - 1], -0).nextSibling : before;
  };
  var remove = function remove(get, parent, children, start, end) {
    if (end - start < 2) parent.removeChild(get(children[start], -1));else {
      var range = parent.ownerDocument.createRange();
      range.setStartBefore(get(children[start], -1));
      range.setEndAfter(get(children[end - 1], -1));
      range.deleteContents();
    }
  }; // - - - - - - - - - - - - - - - - - - -
  // diff related constants and utilities
  // - - - - - - - - - - - - - - - - - - -

  var DELETION = -1;
  var INSERTION = 1;
  var SKIP = 0;
  var SKIP_OND = 50;

  var HS = function HS(futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges) {
    var k = 0;
    /* istanbul ignore next */

    var minLen = futureChanges < currentChanges ? futureChanges : currentChanges;
    var link = Array(minLen++);
    var tresh = Array(minLen);
    tresh[0] = -1;

    for (var i = 1; i < minLen; i++) {
      tresh[i] = currentEnd;
    }

    var keymap = new Map$1();

    for (var _i = currentStart; _i < currentEnd; _i++) {
      keymap.set(currentNodes[_i], _i);
    }

    for (var _i2 = futureStart; _i2 < futureEnd; _i2++) {
      var idxInOld = keymap.get(futureNodes[_i2]);

      if (idxInOld != null) {
        k = findK(tresh, minLen, idxInOld);
        /* istanbul ignore else */

        if (-1 < k) {
          tresh[k] = idxInOld;
          link[k] = {
            newi: _i2,
            oldi: idxInOld,
            prev: link[k - 1]
          };
        }
      }
    }

    k = --minLen;
    --currentEnd;

    while (tresh[k] > currentEnd) {
      --k;
    }

    minLen = currentChanges + futureChanges - k;
    var diff = Array(minLen);
    var ptr = link[k];
    --futureEnd;

    while (ptr) {
      var _ptr = ptr,
          newi = _ptr.newi,
          oldi = _ptr.oldi;

      while (futureEnd > newi) {
        diff[--minLen] = INSERTION;
        --futureEnd;
      }

      while (currentEnd > oldi) {
        diff[--minLen] = DELETION;
        --currentEnd;
      }

      diff[--minLen] = SKIP;
      --futureEnd;
      --currentEnd;
      ptr = ptr.prev;
    }

    while (futureEnd >= futureStart) {
      diff[--minLen] = INSERTION;
      --futureEnd;
    }

    while (currentEnd >= currentStart) {
      diff[--minLen] = DELETION;
      --currentEnd;
    }

    return diff;
  }; // this is pretty much the same petit-dom code without the delete map part
  // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L556-L561


  var OND = function OND(futureNodes, futureStart, rows, currentNodes, currentStart, cols, compare) {
    var length = rows + cols;
    var v = [];
    var d, k, r, c, pv, cv, pd;

    outer: for (d = 0; d <= length; d++) {
      /* istanbul ignore if */
      if (d > SKIP_OND) return null;
      pd = d - 1;
      /* istanbul ignore next */

      pv = d ? v[d - 1] : [0, 0];
      cv = v[d] = [];

      for (k = -d; k <= d; k += 2) {
        if (k === -d || k !== d && pv[pd + k - 1] < pv[pd + k + 1]) {
          c = pv[pd + k + 1];
        } else {
          c = pv[pd + k - 1] + 1;
        }

        r = c - k;

        while (c < cols && r < rows && compare(currentNodes[currentStart + c], futureNodes[futureStart + r])) {
          c++;
          r++;
        }

        if (c === cols && r === rows) {
          break outer;
        }

        cv[d + k] = c;
      }
    }

    var diff = Array(d / 2 + length / 2);
    var diffIdx = diff.length - 1;

    for (d = v.length - 1; d >= 0; d--) {
      while (c > 0 && r > 0 && compare(currentNodes[currentStart + c - 1], futureNodes[futureStart + r - 1])) {
        // diagonal edge = equality
        diff[diffIdx--] = SKIP;
        c--;
        r--;
      }

      if (!d) break;
      pd = d - 1;
      /* istanbul ignore next */

      pv = d ? v[d - 1] : [0, 0];
      k = c - r;

      if (k === -d || k !== d && pv[pd + k - 1] < pv[pd + k + 1]) {
        // vertical edge = insertion
        r--;
        diff[diffIdx--] = INSERTION;
      } else {
        // horizontal edge = deletion
        c--;
        diff[diffIdx--] = DELETION;
      }
    }

    return diff;
  };

  var applyDiff = function applyDiff(diff, get, parentNode, futureNodes, futureStart, currentNodes, currentStart, currentLength, before) {
    var live = new Map$1();
    var length = diff.length;
    var currentIndex = currentStart;
    var i = 0;

    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          futureStart++;
          currentIndex++;
          break;

        case INSERTION:
          // TODO: bulk appends for sequential nodes
          live.set(futureNodes[futureStart], 1);
          append(get, parentNode, futureNodes, futureStart++, futureStart, currentIndex < currentLength ? get(currentNodes[currentIndex], 0) : before);
          break;

        case DELETION:
          currentIndex++;
          break;
      }
    }

    i = 0;

    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          currentStart++;
          break;

        case DELETION:
          // TODO: bulk removes for sequential nodes
          if (live.has(currentNodes[currentStart])) currentStart++;else remove(get, parentNode, currentNodes, currentStart++, currentStart);
          break;
      }
    }
  };

  var findK = function findK(ktr, length, j) {
    var lo = 1;
    var hi = length;

    while (lo < hi) {
      var mid = (lo + hi) / 2 >>> 0;
      if (j < ktr[mid]) hi = mid;else lo = mid + 1;
    }

    return lo;
  };

  var smartDiff = function smartDiff(get, parentNode, futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges, currentLength, compare, before) {
    applyDiff(OND(futureNodes, futureStart, futureChanges, currentNodes, currentStart, currentChanges, compare) || HS(futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges), get, parentNode, futureNodes, futureStart, currentNodes, currentStart, currentLength, before);
  };

  /*! (c) 2018 Andrea Giammarchi (ISC) */

  var domdiff = function domdiff(parentNode, // where changes happen
  currentNodes, // Array of current items/nodes
  futureNodes, // Array of future items/nodes
  options // optional object with one of the following properties
  //  before: domNode
  //  compare(generic, generic) => true if same generic
  //  node(generic) => Node
  ) {
    if (!options) options = {};
    var compare = options.compare || eqeq;
    var get = options.node || identity;
    var before = options.before == null ? null : get(options.before, 0);
    var currentLength = currentNodes.length;
    var currentEnd = currentLength;
    var currentStart = 0;
    var futureEnd = futureNodes.length;
    var futureStart = 0; // common prefix

    while (currentStart < currentEnd && futureStart < futureEnd && compare(currentNodes[currentStart], futureNodes[futureStart])) {
      currentStart++;
      futureStart++;
    } // common suffix


    while (currentStart < currentEnd && futureStart < futureEnd && compare(currentNodes[currentEnd - 1], futureNodes[futureEnd - 1])) {
      currentEnd--;
      futureEnd--;
    }

    var currentSame = currentStart === currentEnd;
    var futureSame = futureStart === futureEnd; // same list

    if (currentSame && futureSame) return futureNodes; // only stuff to add

    if (currentSame && futureStart < futureEnd) {
      append(get, parentNode, futureNodes, futureStart, futureEnd, next(get, currentNodes, currentStart, currentLength, before));
      return futureNodes;
    } // only stuff to remove


    if (futureSame && currentStart < currentEnd) {
      remove(get, parentNode, currentNodes, currentStart, currentEnd);
      return futureNodes;
    }

    var currentChanges = currentEnd - currentStart;
    var futureChanges = futureEnd - futureStart;
    var i = -1; // 2 simple indels: the shortest sequence is a subsequence of the longest

    if (currentChanges < futureChanges) {
      i = indexOf(futureNodes, futureStart, futureEnd, currentNodes, currentStart, currentEnd, compare); // inner diff

      if (-1 < i) {
        append(get, parentNode, futureNodes, futureStart, i, get(currentNodes[currentStart], 0));
        append(get, parentNode, futureNodes, i + currentChanges, futureEnd, next(get, currentNodes, currentEnd, currentLength, before));
        return futureNodes;
      }
    }
    /* istanbul ignore else */
    else if (futureChanges < currentChanges) {
        i = indexOf(currentNodes, currentStart, currentEnd, futureNodes, futureStart, futureEnd, compare); // outer diff

        if (-1 < i) {
          remove(get, parentNode, currentNodes, currentStart, i);
          remove(get, parentNode, currentNodes, i + futureChanges, currentEnd);
          return futureNodes;
        }
      } // common case with one replacement for many nodes
    // or many nodes replaced for a single one

    /* istanbul ignore else */


    if (currentChanges < 2 || futureChanges < 2) {
      append(get, parentNode, futureNodes, futureStart, futureEnd, get(currentNodes[currentStart], 0));
      remove(get, parentNode, currentNodes, currentStart, currentEnd);
      return futureNodes;
    } // the half match diff part has been skipped in petit-dom
    // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L391-L397
    // accordingly, I think it's safe to skip in here too
    // if one day it'll come out like the speediest thing ever to do
    // then I might add it in here too
    // Extra: before going too fancy, what about reversed lists ?
    //        This should bail out pretty quickly if that's not the case.


    if (currentChanges === futureChanges && isReversed(futureNodes, futureEnd, currentNodes, currentStart, currentEnd, compare)) {
      append(get, parentNode, futureNodes, futureStart, futureEnd, next(get, currentNodes, currentEnd, currentLength, before));
      return futureNodes;
    } // last resort through a smart diff


    smartDiff(get, parentNode, futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges, currentLength, compare, before);
    return futureNodes;
  };

  /*! (c) Andrea Giammarchi - ISC */
  var importNode = function (document, appendChild, cloneNode, createTextNode, importNode) {
    var native = importNode in document; // IE 11 has problems with cloning templates:
    // it "forgets" empty childNodes. This feature-detects that.

    var fragment = document.createDocumentFragment();
    fragment[appendChild](document[createTextNode]('g'));
    fragment[appendChild](document[createTextNode](''));
    var content = native ? document[importNode](fragment, true) : fragment[cloneNode](true);
    return content.childNodes.length < 2 ? function importNode(node, deep) {
      var clone = node[cloneNode]();

      for (var childNodes = node.childNodes || [], length = childNodes.length, i = 0; deep && i < length; i++) {
        clone[appendChild](importNode(childNodes[i], deep));
      }

      return clone;
    } : native ? document[importNode] : function (node, deep) {
      return node[cloneNode](!!deep);
    };
  }(document, 'appendChild', 'cloneNode', 'createTextNode', 'importNode');

  var trim = ''.trim || function () {
    return String(this).replace(/^\s+|\s+/g, '');
  };

  // Custom
  var UID = '-' + Math.random().toFixed(6) + '%'; //                           Edge issue!

  if (!function (template, content, tabindex) {
    return content in template && (template.innerHTML = '<p ' + tabindex + '="' + UID + '"></p>', template[content].childNodes[0].getAttribute(tabindex) == UID);
  }(document.createElement('template'), 'content', 'tabindex')) {
    UID = '_dt: ' + UID.slice(1, -1) + ';';
  }

  var UIDC = '<!--' + UID + '-->'; // DOM

  var COMMENT_NODE = 8;
  var ELEMENT_NODE = 1;
  var TEXT_NODE = 3;
  var SHOULD_USE_TEXT_CONTENT = /^(?:style|textarea)$/i;
  var VOID_ELEMENTS = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;

  function sanitize (template) {
    return template.join(UIDC).replace(selfClosing, fullClosing).replace(attrSeeker, attrReplacer);
  }
  var spaces = ' \\f\\n\\r\\t';
  var almostEverything = '[^ ' + spaces + '\\/>"\'=]+';
  var attrName = '[ ' + spaces + ']+' + almostEverything;
  var tagName = '<([A-Za-z]+[A-Za-z0-9:_-]*)((?:';
  var attrPartials = '(?:\\s*=\\s*(?:\'[^\']*?\'|"[^"]*?"|<[^>]*?>|' + almostEverything + '))?)';
  var attrSeeker = new RegExp(tagName + attrName + attrPartials + '+)([ ' + spaces + ']*/?>)', 'g');
  var selfClosing = new RegExp(tagName + attrName + attrPartials + '*)([ ' + spaces + ']*/>)', 'g');
  var findAttributes = new RegExp('(' + attrName + '\\s*=\\s*)([\'"]?)' + UIDC + '\\2', 'gi');

  function attrReplacer($0, $1, $2, $3) {
    return '<' + $1 + $2.replace(findAttributes, replaceAttributes) + $3;
  }

  function replaceAttributes($0, $1, $2) {
    return $1 + ($2 || '"') + UID + ($2 || '"');
  }

  function fullClosing($0, $1, $2) {
    return VOID_ELEMENTS.test($1) ? $0 : '<' + $1 + $2 + '></' + $1 + '>';
  }

  function create$2(type, node, path, name) {
    return {
      name: name,
      node: node,
      path: path,
      type: type
    };
  }

  function find$1(node, path) {
    var length = path.length;
    var i = 0;

    while (i < length) {
      node = node.childNodes[path[i++]];
    }

    return node;
  }

  function parse(node, holes, parts, path) {
    var childNodes = node.childNodes;
    var length = childNodes.length;
    var i = 0;

    while (i < length) {
      var child = childNodes[i];

      switch (child.nodeType) {
        case ELEMENT_NODE:
          var childPath = path.concat(i);
          parseAttributes(child, holes, parts, childPath);
          parse(child, holes, parts, childPath);
          break;

        case COMMENT_NODE:
          if (child.textContent === UID) {
            parts.shift();
            holes.push( // basicHTML or other non standard engines
            // might end up having comments in nodes
            // where they shouldn't, hence this check.
            SHOULD_USE_TEXT_CONTENT.test(node.nodeName) ? create$2('text', node, path) : create$2('any', child, path.concat(i)));
          }

          break;

        case TEXT_NODE:
          // the following ignore is actually covered by browsers
          // only basicHTML ends up on previous COMMENT_NODE case
          // instead of TEXT_NODE because it knows nothing about
          // special style or textarea behavior

          /* istanbul ignore if */
          if (SHOULD_USE_TEXT_CONTENT.test(node.nodeName) && trim.call(child.textContent) === UIDC) {
            parts.shift();
            holes.push(create$2('text', node, path));
          }

          break;
      }

      i++;
    }
  }

  function parseAttributes(node, holes, parts, path) {
    var cache = new Map$1();
    var attributes = node.attributes;
    var remove = [];
    var array = remove.slice.call(attributes, 0);
    var length = array.length;
    var i = 0;

    while (i < length) {
      var attribute = array[i++];

      if (attribute.value === UID) {
        var name = attribute.name; // the following ignore is covered by IE
        // and the IE9 double viewBox test

        /* istanbul ignore else */

        if (!cache.has(name)) {
          var realName = parts.shift().replace(/^(?:|[\S\s]*?\s)(\S+?)\s*=\s*['"]?$/, '$1');
          var value = attributes[realName] || // the following ignore is covered by browsers
          // while basicHTML is already case-sensitive

          /* istanbul ignore next */
          attributes[realName.toLowerCase()];
          cache.set(name, value);
          holes.push(create$2('attr', value, path, realName));
        }

        remove.push(attribute);
      }
    }

    length = remove.length;
    i = 0;

    while (i < length) {
      // Edge HTML bug #16878726
      var attr = remove[i++];
      if (/^id$/i.test(attr.name)) node.removeAttribute(attr.name); // standard browsers would work just fine here
      else node.removeAttributeNode(attr);
    } // This is a very specific Firefox/Safari issue
    // but since it should be a not so common pattern,
    // it's probably worth patching regardless.
    // Basically, scripts created through strings are death.
    // You need to create fresh new scripts instead.
    // TODO: is there any other node that needs such nonsense?


    var nodeName = node.nodeName;

    if (/^script$/i.test(nodeName)) {
      // this used to be like that
      // var script = createElement(node, nodeName);
      // then Edge arrived and decided that scripts created
      // through template documents aren't worth executing
      // so it became this ... hopefully it won't hurt in the wild
      var script = document.createElement(nodeName);
      length = attributes.length;
      i = 0;

      while (i < length) {
        script.setAttributeNode(attributes[i++].cloneNode(true));
      }

      script.textContent = node.textContent;
      node.parentNode.replaceChild(script, node);
    }
  }

  // globals
  var parsed = new WeakMap$1();
  var referenced = new WeakMap$1();

  function createInfo(options, template) {
    var markup = sanitize(template);
    var transform = options.transform;
    if (transform) markup = transform(markup);
    var content = createContent(markup, options.type);
    cleanContent(content);
    var holes = [];
    parse(content, holes, template.slice(0), []);
    var info = {
      content: content,
      updates: function updates(content) {
        var callbacks = [];
        var len = holes.length;
        var i = 0;

        while (i < len) {
          var info = holes[i++];
          var node = find$1(content, info.path);

          switch (info.type) {
            case 'any':
              callbacks.push(options.any(node, []));
              break;

            case 'attr':
              callbacks.push(options.attribute(node, info.name, info.node));
              break;

            case 'text':
              callbacks.push(options.text(node));
              node.textContent = '';
              break;
          }
        }

        return function () {
          var length = arguments.length;
          var values = length - 1;
          var i = 1;

          if (len !== values) {
            throw new Error(values + ' values instead of ' + len + '\n' + template.join(', '));
          }

          while (i < length) {
            callbacks[i - 1](arguments[i++]);
          }

          return content;
        };
      }
    };
    parsed.set(template, info);
    return info;
  }

  function createDetails(options, template) {
    var info = parsed.get(template) || createInfo(options, template);
    var content = importNode.call(document, info.content, true);
    var details = {
      content: content,
      template: template,
      updates: info.updates(content)
    };
    referenced.set(options, details);
    return details;
  }

  function domtagger(options) {
    return function (template) {
      var details = referenced.get(options);
      if (details == null || details.template !== template) details = createDetails(options, template);
      details.updates.apply(null, arguments);
      return details.content;
    };
  }

  function cleanContent(fragment) {
    var childNodes = fragment.childNodes;
    var i = childNodes.length;

    while (i--) {
      var child = childNodes[i];

      if (child.nodeType !== 1 && trim.call(child.textContent).length === 0) {
        fragment.removeChild(child);
      }
    }
  }

  /*! (c) Andrea Giammarchi - ISC */
  var hyperStyle = function () {

    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var hyphen = /([^A-Z])([A-Z]+)/g;
    return function hyperStyle(node, original) {
      return 'ownerSVGElement' in node ? svg(node, original) : update(node.style, false);
    };

    function ized($0, $1, $2) {
      return $1 + '-' + $2.toLowerCase();
    }

    function svg(node, original) {
      var style;
      if (original) style = original.cloneNode(true);else {
        node.setAttribute('style', '--hyper:style;');
        style = node.getAttributeNode('style');
      }
      style.value = '';
      node.setAttributeNode(style);
      return update(style, true);
    }

    function toStyle(object) {
      var key,
          css = [];

      for (key in object) {
        css.push(key.replace(hyphen, ized), ':', object[key], ';');
      }

      return css.join('');
    }

    function update(style, isSVG) {
      var oldType, oldValue;
      return function (newValue) {
        var info, key, styleValue, value;

        switch (typeof(newValue)) {
          case 'object':
            if (newValue) {
              if (oldType === 'object') {
                if (!isSVG) {
                  if (oldValue !== newValue) {
                    for (key in oldValue) {
                      if (!(key in newValue)) {
                        style[key] = '';
                      }
                    }
                  }
                }
              } else {
                if (isSVG) style.value = '';else style.cssText = '';
              }

              info = isSVG ? {} : style;

              for (key in newValue) {
                value = newValue[key];
                styleValue = typeof value === 'number' && !IS_NON_DIMENSIONAL.test(key) ? value + 'px' : value;
                if (!isSVG && /^--/.test(key)) info.setProperty(key, styleValue);else info[key] = styleValue;
              }

              oldType = 'object';
              if (isSVG) style.value = toStyle(oldValue = info);else oldValue = newValue;
              break;
            }

          default:
            if (oldValue != newValue) {
              oldType = 'string';
              oldValue = newValue;
              if (isSVG) style.value = newValue || '';else style.cssText = newValue || '';
            }

            break;
        }
      };
    }
  }();

  var OWNER_SVG_ELEMENT = 'ownerSVGElement'; // returns nodes from wires and components

  var asNode = function asNode(item, i) {
    return item.nodeType === wireType ? 1 / i < 0 ? i ? item.remove(true) : item.lastChild : i ? item.valueOf(true) : item.firstChild : item;
  }; // returns true if domdiff can handle the value


  var canDiff = function canDiff(value) {
    return 'ELEMENT_NODE' in value;
  }; // generic attributes helpers


  var hyperAttribute = function hyperAttribute(node, attribute) {
    var oldValue;
    var owner = false;
    return function (newValue) {
      if (oldValue !== newValue) {
        oldValue = newValue;

        if (attribute.value !== newValue) {
          if (newValue == null) {
            if (owner) {
              owner = false;
              node.removeAttributeNode(attribute);
            }

            attribute.value = newValue;
          } else {
            attribute.value = newValue;

            if (!owner) {
              owner = true;
              node.setAttributeNode(attribute);
            }
          }
        }
      }
    };
  }; // events attributes helpers


  var hyperEvent = function hyperEvent(node, name) {
    var oldValue;
    var type = name.slice(2);
    if (name.toLowerCase() in node) type = type.toLowerCase();
    return function (newValue) {
      if (oldValue !== newValue) {
        if (oldValue) node.removeEventListener(type, oldValue, false);
        oldValue = newValue;
        if (newValue) node.addEventListener(type, newValue, false);
      }
    };
  }; // special attributes helpers


  var hyperProperty = function hyperProperty(node, name) {
    var oldValue;
    return function (newValue) {
      if (oldValue !== newValue) {
        oldValue = newValue;

        if (node[name] !== newValue) {
          node[name] = newValue;

          if (newValue == null) {
            node.removeAttribute(name);
          }
        }
      }
    };
  }; // special hooks helpers


  var hyperRef = function hyperRef(node) {
    return function (ref) {
      ref.current = node;
    };
  }; // list of attributes that should not be directly assigned


  var readOnly = /^(?:form|list)$/i; // reused every slice time

  var slice = [].slice; // simplifies text node creation

  var text = function text(node, _text) {
    return node.ownerDocument.createTextNode(_text);
  };

  function Tagger(type) {
    this.type = type;
    return domtagger(this);
  }
  Tagger.prototype = {
    // there are four kind of attributes, and related behavior:
    //  * events, with a name starting with `on`, to add/remove event listeners
    //  * special, with a name present in their inherited prototype, accessed directly
    //  * regular, accessed through get/setAttribute standard DOM methods
    //  * style, the only regular attribute that also accepts an object as value
    //    so that you can style=${{width: 120}}. In this case, the behavior has been
    //    fully inspired by Preact library and its simplicity.
    attribute: function attribute(node, name, original) {
      switch (name) {
        case 'class':
          name = 'className';

        case 'data':
        case 'props':
          return hyperProperty(node, name);

        case 'style':
          return hyperStyle(node, original, OWNER_SVG_ELEMENT in node);

        case 'ref':
          return hyperRef(node);

        default:
          if (name.slice(0, 2) === 'on') return hyperEvent(node, name);
          if (name in node && !(OWNER_SVG_ELEMENT in node || readOnly.test(name))) return hyperProperty(node, name);
          return hyperAttribute(node, original.cloneNode(true));
      }
    },
    // in a hyper(node)`<div>${content}</div>` case
    // everything could happen:
    //  * it's a JS primitive, stored as text
    //  * it's null or undefined, the node should be cleaned
    //  * it's a promise, update the content once resolved
    //  * it's an explicit intent, perform the desired operation
    //  * it's an Array, resolve all values if Promises and/or
    //    update the node with the resulting list of content
    any: function any(node, childNodes) {
      var diffOptions = {
        node: asNode,
        before: node
      };
      var nodeType = OWNER_SVG_ELEMENT in node ?
      /* istanbul ignore next */
      'svg' : 'html';
      var fastPath = false;
      var oldValue;

      var anyContent = function anyContent(value) {
        switch (typeof(value)) {
          case 'string':
          case 'number':
          case 'boolean':
            if (fastPath) {
              if (oldValue !== value) {
                oldValue = value;
                childNodes[0].textContent = value;
              }
            } else {
              fastPath = true;
              oldValue = value;
              childNodes = domdiff(node.parentNode, childNodes, [text(node, value)], diffOptions);
            }

            break;

          case 'function':
            anyContent(value(node));
            break;

          case 'object':
          case 'undefined':
            if (value == null) {
              fastPath = false;
              childNodes = domdiff(node.parentNode, childNodes, [], diffOptions);
              break;
            }

          default:
            fastPath = false;
            oldValue = value;

            if (isArray(value)) {
              if (value.length === 0) {
                if (childNodes.length) {
                  childNodes = domdiff(node.parentNode, childNodes, [], diffOptions);
                }
              } else {
                switch (typeof(value[0])) {
                  case 'string':
                  case 'number':
                  case 'boolean':
                    anyContent(String(value));
                    break;

                  case 'function':
                    anyContent(value.map(invoke, node));
                    break;

                  case 'object':
                    if (isArray(value[0])) {
                      value = value.concat.apply([], value);
                    }

                  default:
                    childNodes = domdiff(node.parentNode, childNodes, value, diffOptions);
                    break;
                }
              }
            } else if (canDiff(value)) {
              childNodes = domdiff(node.parentNode, childNodes, value.nodeType === 11 ? slice.call(value.childNodes) : [value], diffOptions);
            } else if ('text' in value) {
              anyContent(String(value.text));
            } else if ('any' in value) {
              anyContent(value.any);
            } else if ('html' in value) {
              childNodes = domdiff(node.parentNode, childNodes, slice.call(createContent([].concat(value.html).join(''), nodeType).childNodes), diffOptions);
            } else if ('length' in value) {
              anyContent(slice.call(value));
            }

            break;
        }
      };

      return anyContent;
    },
    // style or textareas don't accept HTML as content
    // it's pointless to transform or analyze anything
    // different from text there but it's worth checking
    // for possible defined intents.
    text: function text(node) {
      var oldValue;

      var textContent = function textContent(value) {
        if (oldValue !== value) {
          oldValue = value;

          var type = typeof(value);

          if (type === 'object' && value) {
            if ('text' in value) {
              textContent(String(value.text));
            } else if ('any' in value) {
              textContent(value.any);
            } else if ('html' in value) {
              textContent([].concat(value.html).join(''));
            } else if ('length' in value) {
              textContent(slice.call(value).join(''));
            }
          } else if (type === 'function') {
            textContent(value(node));
          } else {
            node.textContent = value == null ? '' : value;
          }
        }
      };

      return textContent;
    }
  };

  function invoke(callback) {
    return callback(this);
  }

  var wm = new WeakMap$1();
  var container = new WeakMap$1();
  var current$1 = null; // can be used with any useRef hook
  // returns an `html` and `svg` function

  var hook = function hook(useRef) {
    return {
      html: createHook(useRef, html),
      svg: createHook(useRef, svg)
    };
  }; // generic content render

  function render(node, callback) {
    var value = update.call(this, node, callback);

    if (container.get(node) !== value) {
      container.set(node, value);
      appendClean(node, value);
    }

    return node;
  } // keyed render via render(node, () => html`...`)
  // non keyed renders in the wild via html`...`

  var html = outer$1('html');
  var svg = outer$1('svg'); // - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function appendClean(node, fragment) {
    node.textContent = '';
    node.appendChild(fragment);
  }

  function asNode$1(result, forceFragment) {
    return result.nodeType === wireType ? result.valueOf(forceFragment) : result;
  }

  function createHook(useRef, view) {
    return function () {
      var ref = useRef(null);
      if (ref.current === null) ref.current = view.for(ref);
      return asNode$1(ref.current.apply(null, arguments), false);
    };
  }

  function outer$1(type) {
    var wm = new WeakMap$1();

    tag.for = function (identity, id) {
      var ref = wm.get(identity) || set(identity);
      if (id == null) id = '$';
      return ref[id] || create(ref, id);
    };

    return tag;

    function create(ref, id) {
      var wire = null;
      var $ = new Tagger(type);
      return ref[id] = function () {
        var result = $.apply(null, tta.apply(null, arguments));
        return wire || (wire = wiredContent(result));
      };
    }

    function set(identity) {
      var ref = {
        '$': null
      };
      wm.set(identity, ref);
      return ref;
    }

    function tag() {
      var args = tta.apply(null, arguments);
      return current$1 ? new Hole(type, args) : new Tagger(type).apply(null, args);
    }
  }

  function set$2(node) {
    var info = {
      i: 0,
      length: 0,
      stack: [],
      update: false
    };
    wm.set(node, info);
    return info;
  }

  function update(reference, callback) {
    var prev = current$1;
    current$1 = wm.get(reference) || set$2(reference);
    current$1.i = 0;
    var ret = callback.call(this);
    var value;

    if (ret instanceof Hole) {
      value = asNode$1(unroll(ret, 0), current$1.update);
      var _current = current$1,
          i = _current.i,
          length = _current.length,
          stack = _current.stack,
          _update = _current.update;
      if (i < length) stack.splice(current$1.length = i);
      if (_update) current$1.update = false;
    } else {
      value = asNode$1(ret, false);
    }

    current$1 = prev;
    return value;
  }

  function unroll(hole, level) {
    var _current2 = current$1,
        i = _current2.i,
        length = _current2.length,
        stack = _current2.stack;
    var type = hole.type,
        args = hole.args;
    var stacked = i < length;
    current$1.i++;
    if (!stacked) current$1.length = stack.push({
      l: level,
      kind: type,
      tag: null,
      tpl: args[0],
      wire: null
    });
    unrollArray(args, 1, level + 1);
    var info = stack[i];

    if (stacked) {
      var control = info.l,
          kind = info.kind,
          _tag = info.tag,
          tpl = info.tpl,
          _wire = info.wire;

      if (control === level && type === kind && tpl === args[0]) {
        _tag.apply(null, args);

        return _wire;
      }
    }

    var tag = new Tagger(type);
    var wire = wiredContent(tag.apply(null, args));
    info.l = level;
    info.kind = type;
    info.tag = tag;
    info.tpl = args[0];
    info.wire = wire;
    if (i < 1) current$1.update = true;
    return wire;
  }

  function unrollArray(arr, i, level) {
    for (var length = arr.length; i < length; i++) {
      var value = arr[i];

      if (typeof(value) === 'object' && value) {
        if (value instanceof Hole) {
          arr[i] = unroll(value, level - 1);
        } else if (isArray(value)) {
          arr[i] = unrollArray(value, 0, level++);
        }
      }
    }

    return arr;
  }

  function wiredContent(node) {
    var childNodes = node.childNodes;
    var length = childNodes.length;
    return length === 1 ? childNodes[0] : length ? new Wire(childNodes) : node;
  }

  function Hole(type, args) {
    this.type = type;
    this.args = args;
  }

  var _hook = hook(useRef),
      html$1 = _hook.html,
      svg$1 = _hook.svg;

  var index = (function (fn) {
    return augmentor(function () {
      var _useRef = useRef({
        i: 0,
        $: []
      }),
          info = _useRef.current;

      var i = info.i,
          $ = info.$;
      useEffect$1(function () {
        var i = info.i,
            $ = info.$;
        if (i > $.length) $.splice(i);
        info.i = 0;
      });
      info.i++;
      if (i === $.length) $.push(augmentor(fn));
      return $[i].apply(this, arguments);
    });
  });

  exports.default = index;
  exports.render = render;
  exports.html = html$1;
  exports.svg = svg$1;
  exports.createContext = createContext;
  exports.useCallback = callback;
  exports.useContext = useContext;
  exports.useEffect = useEffect$1;
  exports.useLayoutEffect = useLayoutEffect;
  exports.useMemo = useMemo;
  exports.useReducer = useReducer;
  exports.useRef = useRef;
  exports.useState = state;

  return exports;

}({}));
