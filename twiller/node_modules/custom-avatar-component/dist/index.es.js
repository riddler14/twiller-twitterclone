import Pe from "react";
import I from "prop-types";
var Q = { exports: {} }, W = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Oe;
function dr() {
  if (Oe) return W;
  Oe = 1;
  var y = Pe, h = Symbol.for("react.element"), R = Symbol.for("react.fragment"), b = Object.prototype.hasOwnProperty, _ = y.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, P = { key: !0, ref: !0, __self: !0, __source: !0 };
  function T(S, c, j) {
    var p, E = {}, O = null, L = null;
    j !== void 0 && (O = "" + j), c.key !== void 0 && (O = "" + c.key), c.ref !== void 0 && (L = c.ref);
    for (p in c) b.call(c, p) && !P.hasOwnProperty(p) && (E[p] = c[p]);
    if (S && S.defaultProps) for (p in c = S.defaultProps, c) E[p] === void 0 && (E[p] = c[p]);
    return { $$typeof: h, type: S, key: O, ref: L, props: E, _owner: _.current };
  }
  return W.Fragment = R, W.jsx = T, W.jsxs = T, W;
}
var Y = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ce;
function vr() {
  return Ce || (Ce = 1, process.env.NODE_ENV !== "production" && function() {
    var y = Pe, h = Symbol.for("react.element"), R = Symbol.for("react.portal"), b = Symbol.for("react.fragment"), _ = Symbol.for("react.strict_mode"), P = Symbol.for("react.profiler"), T = Symbol.for("react.provider"), S = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), j = Symbol.for("react.suspense"), p = Symbol.for("react.suspense_list"), E = Symbol.for("react.memo"), O = Symbol.for("react.lazy"), L = Symbol.for("react.offscreen"), ee = Symbol.iterator, je = "@@iterator";
    function xe(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = ee && e[ee] || e[je];
      return typeof r == "function" ? r : null;
    }
    var x = y.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function f(e) {
      {
        for (var r = arguments.length, t = new Array(r > 1 ? r - 1 : 0), n = 1; n < r; n++)
          t[n - 1] = arguments[n];
        ke("error", e, t);
      }
    }
    function ke(e, r, t) {
      {
        var n = x.ReactDebugCurrentFrame, o = n.getStackAddendum();
        o !== "" && (r += "%s", t = t.concat([o]));
        var u = t.map(function(i) {
          return String(i);
        });
        u.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, u);
      }
    }
    var De = !1, Ae = !1, Fe = !1, $e = !1, Ie = !1, re;
    re = Symbol.for("react.module.reference");
    function We(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === b || e === P || Ie || e === _ || e === j || e === p || $e || e === L || De || Ae || Fe || typeof e == "object" && e !== null && (e.$$typeof === O || e.$$typeof === E || e.$$typeof === T || e.$$typeof === S || e.$$typeof === c || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === re || e.getModuleId !== void 0));
    }
    function Ye(e, r, t) {
      var n = e.displayName;
      if (n)
        return n;
      var o = r.displayName || r.name || "";
      return o !== "" ? t + "(" + o + ")" : t;
    }
    function te(e) {
      return e.displayName || "Context";
    }
    function m(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && f("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case b:
          return "Fragment";
        case R:
          return "Portal";
        case P:
          return "Profiler";
        case _:
          return "StrictMode";
        case j:
          return "Suspense";
        case p:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case S:
            var r = e;
            return te(r) + ".Consumer";
          case T:
            var t = e;
            return te(t._context) + ".Provider";
          case c:
            return Ye(e, e.render, "ForwardRef");
          case E:
            var n = e.displayName || null;
            return n !== null ? n : m(e.type) || "Memo";
          case O: {
            var o = e, u = o._payload, i = o._init;
            try {
              return m(i(u));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var C = Object.assign, A = 0, ne, ae, ie, oe, ue, se, le;
    function fe() {
    }
    fe.__reactDisabledLog = !0;
    function Le() {
      {
        if (A === 0) {
          ne = console.log, ae = console.info, ie = console.warn, oe = console.error, ue = console.group, se = console.groupCollapsed, le = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: fe,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        A++;
      }
    }
    function Ue() {
      {
        if (A--, A === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: C({}, e, {
              value: ne
            }),
            info: C({}, e, {
              value: ae
            }),
            warn: C({}, e, {
              value: ie
            }),
            error: C({}, e, {
              value: oe
            }),
            group: C({}, e, {
              value: ue
            }),
            groupCollapsed: C({}, e, {
              value: se
            }),
            groupEnd: C({}, e, {
              value: le
            })
          });
        }
        A < 0 && f("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var q = x.ReactCurrentDispatcher, B;
    function U(e, r, t) {
      {
        if (B === void 0)
          try {
            throw Error();
          } catch (o) {
            var n = o.stack.trim().match(/\n( *(at )?)/);
            B = n && n[1] || "";
          }
        return `
` + B + e;
      }
    }
    var J = !1, V;
    {
      var Ve = typeof WeakMap == "function" ? WeakMap : Map;
      V = new Ve();
    }
    function ce(e, r) {
      if (!e || J)
        return "";
      {
        var t = V.get(e);
        if (t !== void 0)
          return t;
      }
      var n;
      J = !0;
      var o = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var u;
      u = q.current, q.current = null, Le();
      try {
        if (r) {
          var i = function() {
            throw Error();
          };
          if (Object.defineProperty(i.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(i, []);
            } catch (v) {
              n = v;
            }
            Reflect.construct(e, [], i);
          } else {
            try {
              i.call();
            } catch (v) {
              n = v;
            }
            e.call(i.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (v) {
            n = v;
          }
          e();
        }
      } catch (v) {
        if (v && n && typeof v.stack == "string") {
          for (var a = v.stack.split(`
`), d = n.stack.split(`
`), s = a.length - 1, l = d.length - 1; s >= 1 && l >= 0 && a[s] !== d[l]; )
            l--;
          for (; s >= 1 && l >= 0; s--, l--)
            if (a[s] !== d[l]) {
              if (s !== 1 || l !== 1)
                do
                  if (s--, l--, l < 0 || a[s] !== d[l]) {
                    var g = `
` + a[s].replace(" at new ", " at ");
                    return e.displayName && g.includes("<anonymous>") && (g = g.replace("<anonymous>", e.displayName)), typeof e == "function" && V.set(e, g), g;
                  }
                while (s >= 1 && l >= 0);
              break;
            }
        }
      } finally {
        J = !1, q.current = u, Ue(), Error.prepareStackTrace = o;
      }
      var D = e ? e.displayName || e.name : "", w = D ? U(D) : "";
      return typeof e == "function" && V.set(e, w), w;
    }
    function Me(e, r, t) {
      return ce(e, !1);
    }
    function Ne(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function M(e, r, t) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return ce(e, Ne(e));
      if (typeof e == "string")
        return U(e);
      switch (e) {
        case j:
          return U("Suspense");
        case p:
          return U("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case c:
            return Me(e.render);
          case E:
            return M(e.type, r, t);
          case O: {
            var n = e, o = n._payload, u = n._init;
            try {
              return M(u(o), r, t);
            } catch {
            }
          }
        }
      return "";
    }
    var F = Object.prototype.hasOwnProperty, de = {}, ve = x.ReactDebugCurrentFrame;
    function N(e) {
      if (e) {
        var r = e._owner, t = M(e.type, e._source, r ? r.type : null);
        ve.setExtraStackFrame(t);
      } else
        ve.setExtraStackFrame(null);
    }
    function qe(e, r, t, n, o) {
      {
        var u = Function.call.bind(F);
        for (var i in e)
          if (u(e, i)) {
            var a = void 0;
            try {
              if (typeof e[i] != "function") {
                var d = Error((n || "React class") + ": " + t + " type `" + i + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[i] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw d.name = "Invariant Violation", d;
              }
              a = e[i](r, i, n, t, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (s) {
              a = s;
            }
            a && !(a instanceof Error) && (N(o), f("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", n || "React class", t, i, typeof a), N(null)), a instanceof Error && !(a.message in de) && (de[a.message] = !0, N(o), f("Failed %s type: %s", t, a.message), N(null));
          }
      }
    }
    var Be = Array.isArray;
    function K(e) {
      return Be(e);
    }
    function Je(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, t = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return t;
      }
    }
    function Ke(e) {
      try {
        return pe(e), !1;
      } catch {
        return !0;
      }
    }
    function pe(e) {
      return "" + e;
    }
    function ge(e) {
      if (Ke(e))
        return f("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Je(e)), pe(e);
    }
    var $ = x.ReactCurrentOwner, Ge = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, ye, he, G;
    G = {};
    function ze(e) {
      if (F.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function Xe(e) {
      if (F.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function He(e, r) {
      if (typeof e.ref == "string" && $.current && r && $.current.stateNode !== r) {
        var t = m($.current.type);
        G[t] || (f('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', m($.current.type), e.ref), G[t] = !0);
      }
    }
    function Ze(e, r) {
      {
        var t = function() {
          ye || (ye = !0, f("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: t,
          configurable: !0
        });
      }
    }
    function Qe(e, r) {
      {
        var t = function() {
          he || (he = !0, f("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: t,
          configurable: !0
        });
      }
    }
    var er = function(e, r, t, n, o, u, i) {
      var a = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: h,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: t,
        props: i,
        // Record the component responsible for creating this element.
        _owner: u
      };
      return a._store = {}, Object.defineProperty(a._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(a, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: n
      }), Object.defineProperty(a, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: o
      }), Object.freeze && (Object.freeze(a.props), Object.freeze(a)), a;
    };
    function rr(e, r, t, n, o) {
      {
        var u, i = {}, a = null, d = null;
        t !== void 0 && (ge(t), a = "" + t), Xe(r) && (ge(r.key), a = "" + r.key), ze(r) && (d = r.ref, He(r, o));
        for (u in r)
          F.call(r, u) && !Ge.hasOwnProperty(u) && (i[u] = r[u]);
        if (e && e.defaultProps) {
          var s = e.defaultProps;
          for (u in s)
            i[u] === void 0 && (i[u] = s[u]);
        }
        if (a || d) {
          var l = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          a && Ze(i, l), d && Qe(i, l);
        }
        return er(e, a, d, o, n, $.current, i);
      }
    }
    var z = x.ReactCurrentOwner, be = x.ReactDebugCurrentFrame;
    function k(e) {
      if (e) {
        var r = e._owner, t = M(e.type, e._source, r ? r.type : null);
        be.setExtraStackFrame(t);
      } else
        be.setExtraStackFrame(null);
    }
    var X;
    X = !1;
    function H(e) {
      return typeof e == "object" && e !== null && e.$$typeof === h;
    }
    function me() {
      {
        if (z.current) {
          var e = m(z.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function tr(e) {
      return "";
    }
    var Re = {};
    function nr(e) {
      {
        var r = me();
        if (!r) {
          var t = typeof e == "string" ? e : e.displayName || e.name;
          t && (r = `

Check the top-level render call using <` + t + ">.");
        }
        return r;
      }
    }
    function Ee(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var t = nr(r);
        if (Re[t])
          return;
        Re[t] = !0;
        var n = "";
        e && e._owner && e._owner !== z.current && (n = " It was passed a child from " + m(e._owner.type) + "."), k(e), f('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', t, n), k(null);
      }
    }
    function _e(e, r) {
      {
        if (typeof e != "object")
          return;
        if (K(e))
          for (var t = 0; t < e.length; t++) {
            var n = e[t];
            H(n) && Ee(n, r);
          }
        else if (H(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var o = xe(e);
          if (typeof o == "function" && o !== e.entries)
            for (var u = o.call(e), i; !(i = u.next()).done; )
              H(i.value) && Ee(i.value, r);
        }
      }
    }
    function ar(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var t;
        if (typeof r == "function")
          t = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === c || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === E))
          t = r.propTypes;
        else
          return;
        if (t) {
          var n = m(r);
          qe(t, e.props, "prop", n, e);
        } else if (r.PropTypes !== void 0 && !X) {
          X = !0;
          var o = m(r);
          f("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", o || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && f("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function ir(e) {
      {
        for (var r = Object.keys(e.props), t = 0; t < r.length; t++) {
          var n = r[t];
          if (n !== "children" && n !== "key") {
            k(e), f("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", n), k(null);
            break;
          }
        }
        e.ref !== null && (k(e), f("Invalid attribute `ref` supplied to `React.Fragment`."), k(null));
      }
    }
    var Te = {};
    function Se(e, r, t, n, o, u) {
      {
        var i = We(e);
        if (!i) {
          var a = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (a += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var d = tr();
          d ? a += d : a += me();
          var s;
          e === null ? s = "null" : K(e) ? s = "array" : e !== void 0 && e.$$typeof === h ? (s = "<" + (m(e.type) || "Unknown") + " />", a = " Did you accidentally export a JSX literal instead of a component?") : s = typeof e, f("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", s, a);
        }
        var l = rr(e, r, t, o, u);
        if (l == null)
          return l;
        if (i) {
          var g = r.children;
          if (g !== void 0)
            if (n)
              if (K(g)) {
                for (var D = 0; D < g.length; D++)
                  _e(g[D], e);
                Object.freeze && Object.freeze(g);
              } else
                f("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              _e(g, e);
        }
        if (F.call(r, "key")) {
          var w = m(e), v = Object.keys(r).filter(function(cr) {
            return cr !== "key";
          }), Z = v.length > 0 ? "{key: someKey, " + v.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!Te[w + Z]) {
            var fr = v.length > 0 ? "{" + v.join(": ..., ") + ": ...}" : "{}";
            f(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, Z, w, fr, w), Te[w + Z] = !0;
          }
        }
        return e === b ? ir(l) : ar(l), l;
      }
    }
    function or(e, r, t) {
      return Se(e, r, t, !0);
    }
    function ur(e, r, t) {
      return Se(e, r, t, !1);
    }
    var sr = ur, lr = or;
    Y.Fragment = b, Y.jsx = sr, Y.jsxs = lr;
  }()), Y;
}
process.env.NODE_ENV === "production" ? Q.exports = dr() : Q.exports = vr();
var we = Q.exports;
function pr(y) {
  return y.split(" ").map((R) => R[0]).join("").toUpperCase();
}
function gr(y, h, R, b) {
  return {
    width: `${y}px`,
    height: `${y}px`,
    backgroundColor: `${h}`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontSize: `${y / 4}px`,
    color: `${R}`,
    borderRadius: `${b}px`
  };
}
function yr({ name: y, size: h = 200, bgcolor: R = "black", fontColor: b = "white", radius: _ }) {
  const P = pr(y), T = gr(h, R, b, _);
  return /* @__PURE__ */ we.jsx("div", { className: "avatar-container", style: T, children: /* @__PURE__ */ we.jsx("h1", { children: P }) });
}
yr.propTypes = {
  name: I.string.isRequired,
  size: I.number,
  bgcolor: I.string,
  fontColor: I.string,
  radius: I.number
};
export {
  yr as Avatar
};
