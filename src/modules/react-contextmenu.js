/* eslint-disable */
!(function (e, t) {
  'object' == typeof exports && 'object' == typeof module
    ? (module.exports = t(require('react')))
    : 'function' == typeof define && define.amd
    ? define(['react'], t)
    : 'object' == typeof exports
    ? (exports.ReactContextMenu = t(require('react')))
    : (e.ReactContextMenu = t(e.React))
})('undefined' != typeof self ? self : this, function (e) {
  return (function (e) {
    function t(o) {
      if (n[o]) return n[o].exports
      var r = (n[o] = { i: o, l: !1, exports: {} })
      return e[o].call(r.exports, r, r.exports, t), (r.l = !0), r.exports
    }
    var n = {}
    return (
      (t.m = e),
      (t.c = n),
      (t.d = function (e, n, o) {
        t.o(e, n) ||
          Object.defineProperty(e, n, {
            configurable: !1,
            enumerable: !0,
            get: o,
          })
      }),
      (t.n = function (e) {
        var n =
          e && e.__esModule
            ? function () {
                return e.default
              }
            : function () {
                return e
              }
        return t.d(n, 'a', n), n
      }),
      (t.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
      }),
      (t.p = ''),
      t((t.s = 11))
    )
  })([
    function (t, n) {
      t.exports = e
    },
    function (e, t, n) {
      'use strict'
      function o(e, t) {
        var n =
            arguments.length > 2 && void 0 !== arguments[2]
              ? arguments[2]
              : window,
          o = void 0
        'function' == typeof window.CustomEvent
          ? (o = new window.CustomEvent(e, { detail: t }))
          : ((o = document.createEvent('CustomEvent')),
            o.initCustomEvent(e, !1, !0, t)),
          n && (n.dispatchEvent(o), u()(s.e, t))
      }
      function r() {
        var e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
          t = arguments[1]
        o(l, u()({}, e, { type: l }), t)
      }
      function i() {
        var e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
          t = arguments[1]
        o(c, u()({}, e, { type: c }), t)
      }
      n.d(t, 'b', function () {
        return l
      }),
        n.d(t, 'a', function () {
          return c
        }),
        (t.d = r),
        (t.c = i)
      var a = n(4),
        u = n.n(a),
        s = n(2),
        l = 'REACT_CONTEXTMENU_SHOW',
        c = 'REACT_CONTEXTMENU_HIDE'
    },
    function (e, t, n) {
      'use strict'
      function o(e) {
        for (
          var t = arguments.length, n = Array(t > 1 ? t - 1 : 0), o = 1;
          o < t;
          o++
        )
          n[o - 1] = arguments[o]
        return 'function' == typeof e && e.apply(void 0, n)
      }
      function r(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
      }
      function i() {
        return Math.random().toString(36).substring(7)
      }
      ;(t.a = o),
        (t.d = r),
        (t.f = i),
        n.d(t, 'c', function () {
          return a
        }),
        n.d(t, 'e', function () {
          return u
        }),
        n.d(t, 'b', function () {
          return s
        })
      var a = {
          menu: 'react-contextmenu',
          menuVisible: 'react-contextmenu--visible',
          menuWrapper: 'react-contextmenu-wrapper',
          menuItem: 'react-contextmenu-item',
          menuItemActive: 'react-contextmenu-item--active',
          menuItemDisabled: 'react-contextmenu-item--disabled',
          menuItemDivider: 'react-contextmenu-item--divider',
          menuItemSelected: 'react-contextmenu-item--selected',
          subMenu: 'react-contextmenu-submenu',
        },
        u = {},
        s = Boolean(
          'undefined' != typeof window &&
            window.document &&
            window.document.createElement,
        )
    },
    function (e, t, n) {
      e.exports = n(13)()
    },
    function (e, t, n) {
      'use strict'
      function o(e) {
        if (null === e || void 0 === e)
          throw new TypeError(
            'Object.assign cannot be called with null or undefined',
          )
        return Object(e)
      } /*
object-assign
(c) Sindre Sorhus
@license MIT
*/
      var r = Object.getOwnPropertySymbols,
        i = Object.prototype.hasOwnProperty,
        a = Object.prototype.propertyIsEnumerable
      e.exports = (function () {
        try {
          if (!Object.assign) return !1
          var e = new String('abc')
          if (((e[5] = 'de'), '5' === Object.getOwnPropertyNames(e)[0]))
            return !1
          for (var t = {}, n = 0; n < 10; n++)
            t['_' + String.fromCharCode(n)] = n
          if (
            '0123456789' !==
            Object.getOwnPropertyNames(t)
              .map(function (e) {
                return t[e]
              })
              .join('')
          )
            return !1
          var o = {}
          return (
            'abcdefghijklmnopqrst'.split('').forEach(function (e) {
              o[e] = e
            }),
            'abcdefghijklmnopqrst' ===
              Object.keys(Object.assign({}, o)).join('')
          )
        } catch (e) {
          return !1
        }
      })()
        ? Object.assign
        : function (e, t) {
            for (var n, u, s = o(e), l = 1; l < arguments.length; l++) {
              n = Object(arguments[l])
              for (var c in n) i.call(n, c) && (s[c] = n[c])
              if (r) {
                u = r(n)
                for (var p = 0; p < u.length; p++)
                  a.call(n, u[p]) && (s[u[p]] = n[u[p]])
              }
            }
            return s
          }
    },
    function (e, t, n) {
      var o,
        r /*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
      !(function () {
        'use strict'
        function n() {
          for (var e = [], t = 0; t < arguments.length; t++) {
            var o = arguments[t]
            if (o) {
              var r = typeof o
              if ('string' === r || 'number' === r) e.push(o)
              else if (Array.isArray(o) && o.length) {
                var a = n.apply(null, o)
                a && e.push(a)
              } else if ('object' === r)
                for (var u in o) i.call(o, u) && o[u] && e.push(u)
            }
          }
          return e.join(' ')
        }
        var i = {}.hasOwnProperty
        void 0 !== e && e.exports
          ? ((n.default = n), (e.exports = n))
          : ((o = []),
            void 0 !==
              (r = function () {
                return n
              }.apply(t, o)) && (e.exports = r))
      })()
    },
    function (e, t, n) {
      'use strict'
      function o(e, t) {
        if (!(e instanceof t))
          throw new TypeError('Cannot call a class as a function')
      }
      var r = n(1),
        i = n(2),
        a = function e() {
          var t = this
          o(this, e),
            (this.handleShowEvent = function (e) {
              for (var n in t.callbacks)
                Object(i.d)(t.callbacks, n) && t.callbacks[n].show(e)
            }),
            (this.handleHideEvent = function (e) {
              for (var n in t.callbacks)
                Object(i.d)(t.callbacks, n) && t.callbacks[n].hide(e)
            }),
            (this.register = function (e, n) {
              var o = Object(i.f)()
              return (t.callbacks[o] = { show: e, hide: n }), o
            }),
            (this.unregister = function (e) {
              e && t.callbacks[e] && delete t.callbacks[e]
            }),
            (this.callbacks = {}),
            i.b &&
              (window.addEventListener(r.b, this.handleShowEvent),
              window.addEventListener(r.a, this.handleHideEvent))
        }
      t.a = new a()
    },
    function (e, t, n) {
      'use strict'
      function o(e, t) {
        if (!(e instanceof t))
          throw new TypeError('Cannot call a class as a function')
      }
      function r(e, t) {
        if (!e)
          throw new ReferenceError(
            "this hasn't been initialised - super() hasn't been called",
          )
        return !t || ('object' != typeof t && 'function' != typeof t) ? e : t
      }
      function i(e, t) {
        if ('function' != typeof t && null !== t)
          throw new TypeError(
            'Super expression must either be null or a function, not ' +
              typeof t,
          )
        ;(e.prototype = Object.create(t && t.prototype, {
          constructor: {
            value: e,
            enumerable: !1,
            writable: !0,
            configurable: !0,
          },
        })),
          t &&
            (Object.setPrototypeOf
              ? Object.setPrototypeOf(e, t)
              : (e.__proto__ = t))
      }
      var a = n(0),
        u = n.n(a),
        s = n(3),
        l = n.n(s),
        c = n(8),
        p = (function (e) {
          function t(e) {
            o(this, t)
            var n = r(
              this,
              (t.__proto__ || Object.getPrototypeOf(t)).call(this, e),
            )
            return (
              d.call(n),
              (n.seletedItemRef = null),
              (n.state = { selectedItem: null, forceSubMenuOpen: !1 }),
              n
            )
          }
          return i(t, e), t
        })(a.Component)
      p.propTypes = { children: l.a.node.isRequired }
      var d = function () {
        var e = this
        ;(this.handleKeyNavigation = function (t) {
          if (!1 !== e.state.isVisible)
            switch (t.keyCode) {
              case 37:
              case 27:
                t.preventDefault(), e.hideMenu(t)
                break
              case 38:
                t.preventDefault(), e.selectChildren(!0)
                break
              case 40:
                t.preventDefault(), e.selectChildren(!1)
                break
              case 39:
                e.tryToOpenSubMenu(t)
                break
              case 13:
                t.preventDefault(), e.tryToOpenSubMenu(t)
                var n =
                  e.seletedItemRef &&
                  e.seletedItemRef.props &&
                  e.seletedItemRef.props.disabled
                e.seletedItemRef &&
                e.seletedItemRef.ref instanceof HTMLElement &&
                !n
                  ? e.seletedItemRef.ref.click()
                  : e.hideMenu(t)
            }
        }),
          (this.handleForceClose = function () {
            e.setState({ forceSubMenuOpen: !1 })
          }),
          (this.tryToOpenSubMenu = function (t) {
            e.state.selectedItem &&
              e.state.selectedItem.type === e.getSubMenuType() &&
              (t.preventDefault(), e.setState({ forceSubMenuOpen: !0 }))
          }),
          (this.selectChildren = function (t) {
            var n = e.state.selectedItem,
              o = [],
              r = 0,
              i = {},
              a = function t(n, a) {
                n &&
                  ([c.a, e.getSubMenuType()].indexOf(n.type) < 0
                    ? u.a.Children.forEach(n.props.children, t)
                    : n.props.divider ||
                      (n.props.disabled && (++r, (i[a] = !0)), o.push(n)))
              }
            if ((u.a.Children.forEach(e.props.children, a), r !== o.length)) {
              var s = o.indexOf(n),
                l = (function (e) {
                  var n = e
                  do {
                    !(function () {
                      t ? --n : ++n,
                        n < 0 ? (n = o.length - 1) : n >= o.length && (n = 0)
                    })()
                  } while (n !== e && i[n])
                  return n === e ? null : n
                })(s)
              null !== l &&
                e.setState({ selectedItem: o[l], forceSubMenuOpen: !1 })
            }
          }),
          (this.onChildMouseMove = function (t) {
            e.state.selectedItem !== t &&
              e.setState({ selectedItem: t, forceSubMenuOpen: !1 })
          }),
          (this.onChildMouseLeave = function () {
            e.setState({ selectedItem: null, forceSubMenuOpen: !1 })
          }),
          (this.renderChildren = function (t) {
            return u.a.Children.map(t, function (t) {
              var n = {}
              return u.a.isValidElement(t)
                ? [c.a, e.getSubMenuType()].indexOf(t.type) < 0
                  ? ((n.children = e.renderChildren(t.props.children)),
                    u.a.cloneElement(t, n))
                  : ((n.onMouseLeave = e.onChildMouseLeave.bind(e)),
                    t.type === e.getSubMenuType() &&
                      ((n.forceOpen =
                        e.state.forceSubMenuOpen && e.state.selectedItem === t),
                      (n.forceClose = e.handleForceClose),
                      (n.parentKeyNavigationHandler = e.handleKeyNavigation)),
                    t.props.divider || e.state.selectedItem !== t
                      ? ((n.onMouseMove = function () {
                          return e.onChildMouseMove(t)
                        }),
                        u.a.cloneElement(t, n))
                      : ((n.selected = !0),
                        (n.ref = function (t) {
                          e.seletedItemRef = t
                        }),
                        u.a.cloneElement(t, n)))
                : t
            })
          })
      }
      t.a = p
    },
    function (e, t, n) {
      'use strict'
      function o(e, t, n) {
        return (
          t in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = n),
          e
        )
      }
      function r(e, t) {
        if (!(e instanceof t))
          throw new TypeError('Cannot call a class as a function')
      }
      function i(e, t) {
        if (!e)
          throw new ReferenceError(
            "this hasn't been initialised - super() hasn't been called",
          )
        return !t || ('object' != typeof t && 'function' != typeof t) ? e : t
      }
      function a(e, t) {
        if ('function' != typeof t && null !== t)
          throw new TypeError(
            'Super expression must either be null or a function, not ' +
              typeof t,
          )
        ;(e.prototype = Object.create(t && t.prototype, {
          constructor: {
            value: e,
            enumerable: !1,
            writable: !0,
            configurable: !0,
          },
        })),
          t &&
            (Object.setPrototypeOf
              ? Object.setPrototypeOf(e, t)
              : (e.__proto__ = t))
      }
      var u = n(0),
        s = n.n(u),
        l = n(3),
        c = n.n(l),
        p = n(5),
        d = n.n(p),
        f = n(4),
        h = n.n(f),
        b = n(1),
        m = n(2),
        v =
          Object.assign ||
          function (e) {
            for (var t = 1; t < arguments.length; t++) {
              var n = arguments[t]
              for (var o in n)
                Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o])
            }
            return e
          },
        y = (function () {
          function e(e, t) {
            for (var n = 0; n < t.length; n++) {
              var o = t[n]
              ;(o.enumerable = o.enumerable || !1),
                (o.configurable = !0),
                'value' in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o)
            }
          }
          return function (t, n, o) {
            return n && e(t.prototype, n), o && e(t, o), t
          }
        })(),
        g = (function (e) {
          function t() {
            var e, n, o, a
            r(this, t)
            for (var u = arguments.length, s = Array(u), l = 0; l < u; l++)
              s[l] = arguments[l]
            return (
              (n = o = i(
                this,
                (e = t.__proto__ || Object.getPrototypeOf(t)).call.apply(
                  e,
                  [this].concat(s),
                ),
              )),
              (o.handleClick = function (e) {
                0 !== e.button && 1 !== e.button && e.preventDefault(),
                  o.props.disabled ||
                    o.props.divider ||
                    (Object(m.a)(
                      o.props.onClick,
                      e,
                      h()({}, o.props.data, m.e.data),
                      m.e.target,
                    ),
                    o.props.preventClose || Object(b.c)())
              }),
              (a = n),
              i(o, a)
            )
          }
          return (
            a(t, e),
            y(t, [
              {
                key: 'render',
                value: function () {
                  var e,
                    t = this,
                    n = this.props,
                    r = n.attributes,
                    i = n.children,
                    a = n.className,
                    u = n.disabled,
                    l = n.divider,
                    c = n.selected,
                    p = d()(
                      a,
                      m.c.menuItem,
                      r.className,
                      ((e = {}),
                      o(e, d()(m.c.menuItemDisabled, r.disabledClassName), u),
                      o(e, d()(m.c.menuItemDivider, r.dividerClassName), l),
                      o(e, d()(m.c.menuItemSelected, r.selectedClassName), c),
                      e),
                    )
                  return s.a.createElement(
                    'div',
                    v({}, r, {
                      className: p,
                      role: 'menuitem',
                      tabIndex: '-1',
                      'aria-disabled': u ? 'true' : 'false',
                      'aria-orientation': l ? 'horizontal' : null,
                      ref: function (e) {
                        t.ref = e
                      },
                      onMouseMove: this.props.onMouseMove,
                      onMouseLeave: this.props.onMouseLeave,
                      onTouchEnd: this.handleClick,
                      onClick: this.handleClick,
                    }),
                    l ? null : i,
                  )
                },
              },
            ]),
            t
          )
        })(u.Component)
      ;(g.propTypes = {
        attributes: c.a.object,
        children: c.a.node,
        className: c.a.string,
        data: c.a.object,
        disabled: c.a.bool,
        divider: c.a.bool,
        onClick: c.a.func,
        onMouseLeave: c.a.func,
        onMouseMove: c.a.func,
        preventClose: c.a.bool,
        selected: c.a.bool,
      }),
        (g.defaultProps = {
          attributes: {},
          children: null,
          className: '',
          data: {},
          disabled: !1,
          divider: !1,
          onClick: function () {
            return null
          },
          onMouseMove: function () {
            return null
          },
          onMouseLeave: function () {
            return null
          },
          preventClose: !1,
          selected: !1,
        }),
        (t.a = g)
    },
    function (e, t, n) {
      'use strict'
      function o(e, t, n) {
        return (
          t in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = n),
          e
        )
      }
      function r(e, t) {
        if (!(e instanceof t))
          throw new TypeError('Cannot call a class as a function')
      }
      function i(e, t) {
        if (!e)
          throw new ReferenceError(
            "this hasn't been initialised - super() hasn't been called",
          )
        return !t || ('object' != typeof t && 'function' != typeof t) ? e : t
      }
      function a(e, t) {
        if ('function' != typeof t && null !== t)
          throw new TypeError(
            'Super expression must either be null or a function, not ' +
              typeof t,
          )
        ;(e.prototype = Object.create(t && t.prototype, {
          constructor: {
            value: e,
            enumerable: !1,
            writable: !0,
            configurable: !0,
          },
        })),
          t &&
            (Object.setPrototypeOf
              ? Object.setPrototypeOf(e, t)
              : (e.__proto__ = t))
      }
      var u = n(0),
        s = n.n(u),
        l = n(3),
        c = n.n(l),
        p = n(5),
        d = n.n(p),
        f = n(4),
        h = n.n(f),
        b = n(1),
        m = n(7),
        v = n(2),
        y = n(6),
        g =
          Object.assign ||
          function (e) {
            for (var t = 1; t < arguments.length; t++) {
              var n = arguments[t]
              for (var o in n)
                Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o])
            }
            return e
          },
        O = (function () {
          function e(e, t) {
            for (var n = 0; n < t.length; n++) {
              var o = t[n]
              ;(o.enumerable = o.enumerable || !1),
                (o.configurable = !0),
                'value' in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o)
            }
          }
          return function (t, n, o) {
            return n && e(t.prototype, n), o && e(t, o), t
          }
        })(),
        M = (function (e) {
          function t(e) {
            r(this, t)
            var n = i(
              this,
              (t.__proto__ || Object.getPrototypeOf(t)).call(this, e),
            )
            return (
              (n.getMenuPosition = function () {
                var e = window,
                  t = e.innerWidth,
                  o = e.innerHeight,
                  r = n.subMenu.getBoundingClientRect(),
                  i = {}
                return (
                  r.bottom > o ? (i.bottom = 0) : (i.top = 0),
                  r.right < t ? (i.left = '100%') : (i.right = '100%'),
                  i
                )
              }),
              (n.getRTLMenuPosition = function () {
                var e = window,
                  t = e.innerHeight,
                  o = n.subMenu.getBoundingClientRect(),
                  r = {}
                return (
                  o.bottom > t ? (r.bottom = 0) : (r.top = 0),
                  o.left < 0 ? (r.left = '100%') : (r.right = '100%'),
                  r
                )
              }),
              (n.hideMenu = function (e) {
                e.preventDefault(), n.hideSubMenu(e)
              }),
              (n.hideSubMenu = function (e) {
                ;(e.detail &&
                  e.detail.id &&
                  n.menu &&
                  e.detail.id !== n.menu.id) ||
                  (n.props.forceOpen && n.props.forceClose(),
                  n.setState({ visible: !1, selectedItem: null }),
                  n.unregisterHandlers())
              }),
              (n.handleClick = function (e) {
                e.preventDefault(),
                  n.props.disabled ||
                    (Object(v.a)(
                      n.props.onClick,
                      e,
                      h()({}, n.props.data, v.e.data),
                      v.e.target,
                    ),
                    n.props.onClick &&
                      !n.props.preventCloseOnClick &&
                      Object(b.c)())
              }),
              (n.handleMouseEnter = function () {
                n.closetimer && clearTimeout(n.closetimer),
                  n.props.disabled ||
                    n.state.visible ||
                    (n.opentimer = setTimeout(function () {
                      return n.setState({ visible: !0, selectedItem: null })
                    }, n.props.hoverDelay))
              }),
              (n.handleMouseLeave = function () {
                n.opentimer && clearTimeout(n.opentimer),
                  n.state.visible &&
                    (n.closetimer = setTimeout(function () {
                      return n.setState({ visible: !1, selectedItem: null })
                    }, n.props.hoverDelay))
              }),
              (n.menuRef = function (e) {
                n.menu = e
              }),
              (n.subMenuRef = function (e) {
                n.subMenu = e
              }),
              (n.registerHandlers = function () {
                document.removeEventListener(
                  'keydown',
                  n.props.parentKeyNavigationHandler,
                ),
                  document.addEventListener('keydown', n.handleKeyNavigation)
              }),
              (n.unregisterHandlers = function (e) {
                document.removeEventListener('keydown', n.handleKeyNavigation),
                  e ||
                    document.addEventListener(
                      'keydown',
                      n.props.parentKeyNavigationHandler,
                    )
              }),
              (n.state = h()({}, n.state, { visible: !1 })),
              n
            )
          }
          return (
            a(t, e),
            O(t, [
              {
                key: 'componentDidMount',
                value: function () {
                  this.listenId = y.a.register(function () {}, this.hideSubMenu)
                },
              },
              {
                key: 'getSubMenuType',
                value: function () {
                  return t
                },
              },
              {
                key: 'shouldComponentUpdate',
                value: function (e, t) {
                  return (
                    (this.isVisibilityChange = !(
                      (this.state.visible === t.visible &&
                        this.props.forceOpen === e.forceOpen) ||
                      (this.state.visible && e.forceOpen) ||
                      (this.props.forceOpen && t.visible)
                    )),
                    !0
                  )
                },
              },
              {
                key: 'componentDidUpdate',
                value: function () {
                  var e = this
                  if (this.isVisibilityChange)
                    if (this.props.forceOpen || this.state.visible) {
                      var t = window.requestAnimationFrame || setTimeout
                      t(function () {
                        var t = e.props.rtl
                          ? e.getRTLMenuPosition()
                          : e.getMenuPosition()
                        e.subMenu.style.removeProperty('top'),
                          e.subMenu.style.removeProperty('bottom'),
                          e.subMenu.style.removeProperty('left'),
                          e.subMenu.style.removeProperty('right'),
                          Object(v.d)(t, 'top') &&
                            (e.subMenu.style.top = t.top),
                          Object(v.d)(t, 'left') &&
                            (e.subMenu.style.left = t.left),
                          Object(v.d)(t, 'bottom') &&
                            (e.subMenu.style.bottom = t.bottom),
                          Object(v.d)(t, 'right') &&
                            (e.subMenu.style.right = t.right),
                          e.subMenu.classList.add(v.c.menuVisible),
                          e.registerHandlers(),
                          e.setState({ selectedItem: null })
                      })
                    } else {
                      var n = function t() {
                        e.subMenu.removeEventListener('transitionend', t),
                          e.subMenu.style.removeProperty('bottom'),
                          e.subMenu.style.removeProperty('right'),
                          (e.subMenu.style.top = 0),
                          (e.subMenu.style.left = '100%'),
                          e.unregisterHandlers()
                      }
                      this.subMenu.addEventListener('transitionend', n),
                        this.subMenu.classList.remove(v.c.menuVisible)
                    }
                },
              },
              {
                key: 'componentWillUnmount',
                value: function () {
                  this.listenId && y.a.unregister(this.listenId),
                    this.opentimer && clearTimeout(this.opentimer),
                    this.closetimer && clearTimeout(this.closetimer),
                    this.unregisterHandlers(!0)
                },
              },
              {
                key: 'render',
                value: function () {
                  var e,
                    t = this.props,
                    n = t.children,
                    r = t.attributes,
                    i = t.disabled,
                    a = t.title,
                    u = t.selected,
                    l = this.state.visible,
                    c = {
                      ref: this.menuRef,
                      onMouseEnter: this.handleMouseEnter,
                      onMouseLeave: this.handleMouseLeave,
                      className: d()(
                        v.c.menuItem,
                        v.c.subMenu,
                        r.listClassName,
                      ),
                      style: { position: 'relative' },
                    },
                    p = {
                      className: d()(
                        v.c.menuItem,
                        r.className,
                        ((e = {}),
                        o(e, d()(v.c.menuItemDisabled, r.disabledClassName), i),
                        o(e, d()(v.c.menuItemActive, r.visibleClassName), l),
                        o(e, d()(v.c.menuItemSelected, r.selectedClassName), u),
                        e),
                      ),
                      onMouseMove: this.props.onMouseMove,
                      onMouseOut: this.props.onMouseOut,
                      onClick: this.handleClick,
                    },
                    f = {
                      ref: this.subMenuRef,
                      style: {
                        position: 'absolute',
                        transition: 'opacity 1ms',
                        top: 0,
                        left: '100%',
                      },
                      className: d()(v.c.menu, this.props.className),
                    }
                  return s.a.createElement(
                    'nav',
                    g({}, c, {
                      role: 'menuitem',
                      tabIndex: '-1',
                      'aria-haspopup': 'true',
                    }),
                    s.a.createElement('div', g({}, r, p), a),
                    s.a.createElement(
                      'nav',
                      g({}, f, { role: 'menu', tabIndex: '-1' }),
                      this.renderChildren(n),
                    ),
                  )
                },
              },
            ]),
            t
          )
        })(m.a)
      ;(M.propTypes = {
        children: c.a.node.isRequired,
        attributes: c.a.object,
        title: c.a.node.isRequired,
        className: c.a.string,
        disabled: c.a.bool,
        hoverDelay: c.a.number,
        rtl: c.a.bool,
        selected: c.a.bool,
        onMouseMove: c.a.func,
        onMouseOut: c.a.func,
        forceOpen: c.a.bool,
        forceClose: c.a.func,
        parentKeyNavigationHandler: c.a.func,
      }),
        (M.defaultProps = {
          disabled: !1,
          hoverDelay: 500,
          attributes: {},
          className: '',
          rtl: !1,
          selected: !1,
          onMouseMove: function () {
            return null
          },
          onMouseOut: function () {
            return null
          },
          forceOpen: !1,
          forceClose: function () {
            return null
          },
          parentKeyNavigationHandler: function () {
            return null
          },
        }),
        (t.a = M)
    },
    function (e, t, n) {
      'use strict'
      function o(e, t) {
        if (!(e instanceof t))
          throw new TypeError('Cannot call a class as a function')
      }
      function r(e, t) {
        if (!e)
          throw new ReferenceError(
            "this hasn't been initialised - super() hasn't been called",
          )
        return !t || ('object' != typeof t && 'function' != typeof t) ? e : t
      }
      function i(e, t) {
        if ('function' != typeof t && null !== t)
          throw new TypeError(
            'Super expression must either be null or a function, not ' +
              typeof t,
          )
        ;(e.prototype = Object.create(t && t.prototype, {
          constructor: {
            value: e,
            enumerable: !1,
            writable: !0,
            configurable: !0,
          },
        })),
          t &&
            (Object.setPrototypeOf
              ? Object.setPrototypeOf(e, t)
              : (e.__proto__ = t))
      }
      var a = n(0),
        u = n.n(a),
        s = n(3),
        l = n.n(s),
        c = n(5),
        p = n.n(c),
        d = n(4),
        f = n.n(d),
        h = n(1),
        b = n(2),
        m = (function () {
          function e(e, t) {
            for (var n = 0; n < t.length; n++) {
              var o = t[n]
              ;(o.enumerable = o.enumerable || !1),
                (o.configurable = !0),
                'value' in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o)
            }
          }
          return function (t, n, o) {
            return n && e(t.prototype, n), o && e(t, o), t
          }
        })(),
        v = (function (e) {
          function t() {
            var e, n, i, a
            o(this, t)
            for (var u = arguments.length, s = Array(u), l = 0; l < u; l++)
              s[l] = arguments[l]
            return (
              (n = i = r(
                this,
                (e = t.__proto__ || Object.getPrototypeOf(t)).call.apply(
                  e,
                  [this].concat(s),
                ),
              )),
              (i.touchHandled = !1),
              (i.handleMouseDown = function (e) {
                i.props.holdToDisplay >= 0 &&
                  0 === e.button &&
                  (e.persist(),
                  e.stopPropagation(),
                  (i.mouseDownTimeoutId = setTimeout(function () {
                    return i.handleContextClick(e)
                  }, i.props.holdToDisplay))),
                  Object(b.a)(i.props.attributes.onMouseDown, e)
              }),
              (i.handleMouseUp = function (e) {
                0 === e.button && clearTimeout(i.mouseDownTimeoutId),
                  Object(b.a)(i.props.attributes.onMouseUp, e)
              }),
              (i.handleMouseOut = function (e) {
                0 === e.button && clearTimeout(i.mouseDownTimeoutId),
                  Object(b.a)(i.props.attributes.onMouseOut, e)
              }),
              (i.handleTouchstart = function (e) {
                ;(i.touchHandled = !1),
                  i.props.holdToDisplay >= 0 &&
                    (e.persist(),
                    e.stopPropagation(),
                    (i.touchstartTimeoutId = setTimeout(function () {
                      i.handleContextClick(e), (i.touchHandled = !0)
                    }, i.props.holdToDisplay))),
                  Object(b.a)(i.props.attributes.onTouchStart, e)
              }),
              (i.handleTouchEnd = function (e) {
                i.touchHandled && e.preventDefault(),
                  clearTimeout(i.touchstartTimeoutId),
                  Object(b.a)(i.props.attributes.onTouchEnd, e)
              }),
              (i.handleContextMenu = function (e) {
                e.button === i.props.mouseButton && i.handleContextClick(e),
                  Object(b.a)(i.props.attributes.onContextMenu, e)
              }),
              (i.handleMouseClick = function (e) {
                e.button === i.props.mouseButton && i.handleContextClick(e),
                  Object(b.a)(i.props.attributes.onClick, e)
              }),
              (i.handleContextClick = function (e) {
                if (
                  !(
                    i.props.disable ||
                    (i.props.disableIfShiftIsPressed && e.shiftKey)
                  )
                ) {
                  e.preventDefault(), e.stopPropagation()
                  var t = e.clientX || (e.touches && e.touches[0].pageX),
                    n = e.clientY || (e.touches && e.touches[0].pageY)
                  i.props.posX && (t -= i.props.posX),
                    i.props.posY && (n -= i.props.posY),
                    Object(h.c)()
                  var o = Object(b.a)(i.props.collect, i.props),
                    r = {
                      position: { x: t, y: n },
                      target: i.elem,
                      id: i.props.id,
                    }
                  o && 'function' == typeof o.then
                    ? o.then(function (t) {
                        ;(r.data = f()({}, t, { target: e.target })),
                          Object(h.d)(r)
                      })
                    : ((r.data = f()({}, o, { target: e.target })),
                      Object(h.d)(r))
                }
              }),
              (i.elemRef = function (e) {
                i.elem = e
              }),
              (a = n),
              r(i, a)
            )
          }
          return (
            i(t, e),
            m(t, [
              {
                key: 'render',
                value: function () {
                  var e = this.props,
                    t = e.renderTag,
                    n = e.attributes,
                    o = e.children,
                    r = f()({}, n, {
                      className: p()(b.c.menuWrapper, n.className),
                      onContextMenu: this.handleContextMenu,
                      onClick: this.handleMouseClick,
                      onMouseDown: this.handleMouseDown,
                      onMouseUp: this.handleMouseUp,
                      onTouchStart: this.handleTouchstart,
                      onTouchEnd: this.handleTouchEnd,
                      onMouseOut: this.handleMouseOut,
                      ref: this.elemRef,
                    })
                  return u.a.createElement(t, r, o)
                },
              },
            ]),
            t
          )
        })(a.Component)
      ;(v.propTypes = {
        id: l.a.string.isRequired,
        children: l.a.node.isRequired,
        attributes: l.a.object,
        collect: l.a.func,
        disable: l.a.bool,
        holdToDisplay: l.a.number,
        posX: l.a.number,
        posY: l.a.number,
        renderTag: l.a.elementType,
        mouseButton: l.a.number,
        disableIfShiftIsPressed: l.a.bool,
      }),
        (v.defaultProps = {
          attributes: {},
          collect: function () {
            return null
          },
          disable: !1,
          holdToDisplay: 1e3,
          renderTag: 'div',
          posX: 0,
          posY: 0,
          mouseButton: 2,
          disableIfShiftIsPressed: !1,
        }),
        (t.a = v)
    },
    function (e, t, n) {
      'use strict'
      Object.defineProperty(t, '__esModule', { value: !0 })
      var o = n(12)
      n.d(t, 'ContextMenu', function () {
        return o.a
      })
      var r = n(10)
      n.d(t, 'ContextMenuTrigger', function () {
        return r.a
      })
      var i = n(8)
      n.d(t, 'MenuItem', function () {
        return i.a
      })
      var a = n(9)
      n.d(t, 'SubMenu', function () {
        return a.a
      })
      var u = n(15)
      n.d(t, 'connectMenu', function () {
        return u.a
      })
      var s = n(1)
      n.d(t, 'hideMenu', function () {
        return s.c
      }),
        n.d(t, 'showMenu', function () {
          return s.d
        })
    },
    function (e, t, n) {
      'use strict'
      function o(e, t, n) {
        return (
          t in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = n),
          e
        )
      }
      function r(e, t) {
        if (!(e instanceof t))
          throw new TypeError('Cannot call a class as a function')
      }
      function i(e, t) {
        if (!e)
          throw new ReferenceError(
            "this hasn't been initialised - super() hasn't been called",
          )
        return !t || ('object' != typeof t && 'function' != typeof t) ? e : t
      }
      function a(e, t) {
        if ('function' != typeof t && null !== t)
          throw new TypeError(
            'Super expression must either be null or a function, not ' +
              typeof t,
          )
        ;(e.prototype = Object.create(t && t.prototype, {
          constructor: {
            value: e,
            enumerable: !1,
            writable: !0,
            configurable: !0,
          },
        })),
          t &&
            (Object.setPrototypeOf
              ? Object.setPrototypeOf(e, t)
              : (e.__proto__ = t))
      }
      var u = n(0),
        s = n.n(u),
        l = n(3),
        c = n.n(l),
        p = n(5),
        d = n.n(p),
        f = n(4),
        h = n.n(f),
        b = n(6),
        m = n(7),
        v = n(9),
        y = n(1),
        g = n(2),
        O = (function () {
          function e(e, t) {
            for (var n = 0; n < t.length; n++) {
              var o = t[n]
              ;(o.enumerable = o.enumerable || !1),
                (o.configurable = !0),
                'value' in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o)
            }
          }
          return function (t, n, o) {
            return n && e(t.prototype, n), o && e(t, o), t
          }
        })(),
        M = (function (e) {
          function t(e) {
            r(this, t)
            var n = i(
              this,
              (t.__proto__ || Object.getPrototypeOf(t)).call(this, e),
            )
            return (
              (n.registerHandlers = function () {
                document.addEventListener('mousedown', n.handleOutsideClick),
                  document.addEventListener('touchstart', n.handleOutsideClick),
                  n.props.preventHideOnScroll ||
                    document.addEventListener('scroll', n.handleHide),
                  n.props.preventHideOnContextMenu ||
                    document.addEventListener('contextmenu', n.handleHide),
                  document.addEventListener('keydown', n.handleKeyNavigation),
                  n.props.preventHideOnResize ||
                    window.addEventListener('resize', n.handleHide)
              }),
              (n.unregisterHandlers = function () {
                document.removeEventListener('mousedown', n.handleOutsideClick),
                  document.removeEventListener(
                    'touchstart',
                    n.handleOutsideClick,
                  ),
                  document.removeEventListener('scroll', n.handleHide),
                  document.removeEventListener('contextmenu', n.handleHide),
                  document.removeEventListener(
                    'keydown',
                    n.handleKeyNavigation,
                  ),
                  window.removeEventListener('resize', n.handleHide)
              }),
              (n.handleShow = function (e) {
                if (e.detail.id === n.props.id && !n.state.isVisible) {
                  var t = e.detail.position,
                    o = t.x,
                    r = t.y
                  n.setState({ isVisible: !0, x: o, y: r }),
                    n.registerHandlers(),
                    Object(g.a)(n.props.onShow, e)
                }
              }),
              (n.handleHide = function (e) {
                !n.state.isVisible ||
                  (e.detail && e.detail.id && e.detail.id !== n.props.id) ||
                  (n.unregisterHandlers(),
                  n.setState({
                    isVisible: !1,
                    selectedItem: null,
                    forceSubMenuOpen: !1,
                  }),
                  Object(g.a)(n.props.onHide, e))
              }),
              (n.handleOutsideClick = function (e) {
                n.menu.contains(e.target) || Object(y.c)()
              }),
              (n.handleMouseLeave = function (e) {
                e.preventDefault(),
                  Object(g.a)(
                    n.props.onMouseLeave,
                    e,
                    h()({}, n.props.data, g.e.data),
                    g.e.target,
                  ),
                  n.props.hideOnLeave && Object(y.c)()
              }),
              (n.handleContextMenu = function (e) {
                e.preventDefault(), n.handleHide(e)
              }),
              (n.hideMenu = function (e) {
                ;(27 !== e.keyCode && 13 !== e.keyCode) || Object(y.c)()
              }),
              (n.getMenuPosition = function () {
                var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : 0,
                  t =
                    arguments.length > 1 && void 0 !== arguments[1]
                      ? arguments[1]
                      : 0,
                  o = { top: t, left: e }
                if (!n.menu) return o
                var r = window,
                  i = r.innerWidth,
                  a = r.innerHeight,
                  u = n.menu.getBoundingClientRect()
                return (
                  t + u.height > a && (o.top -= u.height),
                  e + u.width > i && (o.left -= u.width),
                  o.top < 0 && (o.top = u.height < a ? (a - u.height) / 2 : 0),
                  o.left < 0 && (o.left = u.width < i ? (i - u.width) / 2 : 0),
                  o
                )
              }),
              (n.getRTLMenuPosition = function () {
                var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : 0,
                  t =
                    arguments.length > 1 && void 0 !== arguments[1]
                      ? arguments[1]
                      : 0,
                  o = { top: t, left: e }
                if (!n.menu) return o
                var r = window,
                  i = r.innerWidth,
                  a = r.innerHeight,
                  u = n.menu.getBoundingClientRect()
                return (
                  (o.left = e - u.width),
                  t + u.height > a && (o.top -= u.height),
                  o.left < 0 && (o.left += u.width),
                  o.top < 0 && (o.top = u.height < a ? (a - u.height) / 2 : 0),
                  o.left + u.width > i &&
                    (o.left = u.width < i ? (i - u.width) / 2 : 0),
                  o
                )
              }),
              (n.menuRef = function (e) {
                n.menu = e
              }),
              (n.state = h()({}, n.state, { x: 0, y: 0, isVisible: !1 })),
              n
            )
          }
          return (
            a(t, e),
            O(t, [
              {
                key: 'getSubMenuType',
                value: function () {
                  return v.a
                },
              },
              {
                key: 'componentDidMount',
                value: function () {
                  this.listenId = b.a.register(this.handleShow, this.handleHide)
                },
              },
              {
                key: 'componentDidUpdate',
                value: function () {
                  var e = this,
                    t = window.requestAnimationFrame || setTimeout
                  t(
                    this.state.isVisible
                      ? function () {
                          var n = e.state,
                            o = n.x,
                            r = n.y,
                            i = e.props.rtl
                              ? e.getRTLMenuPosition(o, r)
                              : e.getMenuPosition(o, r),
                            a = i.top,
                            u = i.left
                          t(function () {
                            e.menu &&
                              ((e.menu.style.top = a + 'px'),
                              (e.menu.style.left = u + 'px'),
                              (e.menu.style.opacity = 1),
                              (e.menu.style.pointerEvents = 'auto'))
                          })
                        }
                      : function () {
                          e.menu &&
                            ((e.menu.style.opacity = 0),
                            (e.menu.style.pointerEvents = 'none'))
                        },
                  )
                },
              },
              {
                key: 'componentWillUnmount',
                value: function () {
                  this.listenId && b.a.unregister(this.listenId),
                    this.unregisterHandlers()
                },
              },
              {
                key: 'render',
                value: function () {
                  var e = this.props,
                    t = e.children,
                    n = e.className,
                    r = e.style,
                    i = this.state.isVisible,
                    a = h()({}, r, {
                      position: 'fixed',
                      opacity: 0,
                      pointerEvents: 'none',
                    }),
                    u = d()(g.c.menu, n, o({}, g.c.menuVisible, i))
                  return s.a.createElement(
                    'nav',
                    {
                      role: 'menu',
                      tabIndex: '-1',
                      ref: this.menuRef,
                      style: a,
                      className: u,
                      onContextMenu: this.handleContextMenu,
                      onMouseLeave: this.handleMouseLeave,
                    },
                    this.renderChildren(t),
                  )
                },
              },
            ]),
            t
          )
        })(m.a)
      ;(M.propTypes = {
        id: c.a.string.isRequired,
        children: c.a.node.isRequired,
        data: c.a.object,
        className: c.a.string,
        hideOnLeave: c.a.bool,
        rtl: c.a.bool,
        onHide: c.a.func,
        onMouseLeave: c.a.func,
        onShow: c.a.func,
        preventHideOnContextMenu: c.a.bool,
        preventHideOnResize: c.a.bool,
        preventHideOnScroll: c.a.bool,
        style: c.a.object,
      }),
        (M.defaultProps = {
          className: '',
          data: {},
          hideOnLeave: !1,
          rtl: !1,
          onHide: function () {
            return null
          },
          onMouseLeave: function () {
            return null
          },
          onShow: function () {
            return null
          },
          preventHideOnContextMenu: !1,
          preventHideOnResize: !1,
          preventHideOnScroll: !1,
          style: {},
        }),
        (t.a = M)
    },
    function (e, t, n) {
      'use strict'
      function o() {}
      function r() {}
      var i = n(14)
      ;(r.resetWarningCache = o),
        (e.exports = function () {
          function e(e, t, n, o, r, a) {
            if (a !== i) {
              var u = new Error(
                'Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types',
              )
              throw ((u.name = 'Invariant Violation'), u)
            }
          }
          function t() {
            return e
          }
          e.isRequired = e
          var n = {
            array: e,
            bool: e,
            func: e,
            number: e,
            object: e,
            string: e,
            symbol: e,
            any: e,
            arrayOf: t,
            element: e,
            elementType: e,
            instanceOf: t,
            node: e,
            objectOf: t,
            oneOf: t,
            oneOfType: t,
            shape: t,
            exact: t,
            checkPropTypes: r,
            resetWarningCache: o,
          }
          return (n.PropTypes = n), n
        })
    },
    function (e, t, n) {
      'use strict'
      e.exports = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED'
    },
    function (e, t, n) {
      'use strict'
      function o(e, t) {
        if (!(e instanceof t))
          throw new TypeError('Cannot call a class as a function')
      }
      function r(e, t) {
        if (!e)
          throw new ReferenceError(
            "this hasn't been initialised - super() hasn't been called",
          )
        return !t || ('object' != typeof t && 'function' != typeof t) ? e : t
      }
      function i(e, t) {
        if ('function' != typeof t && null !== t)
          throw new TypeError(
            'Super expression must either be null or a function, not ' +
              typeof t,
          )
        ;(e.prototype = Object.create(t && t.prototype, {
          constructor: {
            value: e,
            enumerable: !1,
            writable: !0,
            configurable: !0,
          },
        })),
          t &&
            (Object.setPrototypeOf
              ? Object.setPrototypeOf(e, t)
              : (e.__proto__ = t))
      }
      var a = n(0),
        u = n.n(a),
        s = n(10),
        l = n(6),
        c =
          Object.assign ||
          function (e) {
            for (var t = 1; t < arguments.length; t++) {
              var n = arguments[t]
              for (var o in n)
                Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o])
            }
            return e
          },
        p = (function () {
          function e(e, t) {
            for (var n = 0; n < t.length; n++) {
              var o = t[n]
              ;(o.enumerable = o.enumerable || !1),
                (o.configurable = !0),
                'value' in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o)
            }
          }
          return function (t, n, o) {
            return n && e(t.prototype, n), o && e(t, o), t
          }
        })(),
        d = [].concat(
          (function (e) {
            if (Array.isArray(e)) {
              for (var t = 0, n = Array(e.length); t < e.length; t++)
                n[t] = e[t]
              return n
            }
            return Array.from(e)
          })(Object.keys(s.a.propTypes)),
          ['children'],
        )
      t.a = function (e) {
        return function (t) {
          return (function (n) {
            function a(t) {
              o(this, a)
              var n = r(
                this,
                (a.__proto__ || Object.getPrototypeOf(a)).call(this, t),
              )
              return (
                (n.handleShow = function (t) {
                  if (t.detail.id === e) {
                    var o = t.detail.data,
                      r = {}
                    for (var i in o) d.includes(i) || (r[i] = o[i])
                    n.setState({ trigger: r })
                  }
                }),
                (n.handleHide = function () {
                  n.setState({ trigger: null })
                }),
                (n.state = { trigger: null }),
                n
              )
            }
            return (
              i(a, n),
              p(a, [
                {
                  key: 'componentDidMount',
                  value: function () {
                    this.listenId = l.a.register(
                      this.handleShow,
                      this.handleHide,
                    )
                  },
                },
                {
                  key: 'componentWillUnmount',
                  value: function () {
                    this.listenId && l.a.unregister(this.listenId)
                  },
                },
                {
                  key: 'render',
                  value: function () {
                    return u.a.createElement(
                      t,
                      c({}, this.props, { id: e, trigger: this.state.trigger }),
                    )
                  },
                },
              ]),
              a
            )
          })(a.Component)
        }
      }
    },
  ])
})
