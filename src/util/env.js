/* global MutationObserver */

// can we use __proto__?
export const hasProto = '__proto__' in {}

// Browser environment sniffing
export const inBrowser =
  typeof window !== 'undefined' &&
  Object.prototype.toString.call(window) !== '[object Object]'

// detect devtools
export const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__

// UA sniffing for working around browser-specific quirks
const UA = inBrowser && window.navigator.userAgent.toLowerCase()
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0
export const isAndroid = UA && UA.indexOf('android') > 0

let transitionProp
let transitionEndEvent
let animationProp
let animationEndEvent

// Transition property/event sniffing
if (inBrowser && !isIE9) {
  const isWebkitTrans =
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  const isWebkitAnim =
    window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  transitionProp = isWebkitTrans
    ? 'WebkitTransition'
    : 'transition'
  transitionEndEvent = isWebkitTrans
    ? 'webkitTransitionEnd'
    : 'transitionend'
  animationProp = isWebkitAnim
    ? 'WebkitAnimation'
    : 'animation'
  animationEndEvent = isWebkitAnim
    ? 'webkitAnimationEnd'
    : 'animationend'
}

export {
  transitionProp,
  transitionEndEvent,
  animationProp,
  animationEndEvent
}

/**
 * 延时任务到异步执行
 * 利用MutationObserver
 * 否则用setTimeout
 *
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

export const nextTick = (function () {
  var callbacks = []
  var pending = false
  var timerFunc
  function nextTickHandler () {
    pending = false
    var copies = callbacks.slice(0)
    callbacks = []
    for (var i = 0; i < copies.length; i++) {
      copies[i]()
    }
  }

  /* istanbul ignore if */
  if (typeof MutationObserver !== 'undefined') {
    var counter = 1
    var observer = new MutationObserver(nextTickHandler)
    var textNode = document.createTextNode(counter)
    //节点内容或节点文本的变动
    observer.observe(textNode, {
      characterData: true
    })
    timerFunc = function () {
      counter = (counter + 1) % 2
      textNode.data = counter
    }
  } else {
    // webpack attempts to inject a shim for setImmediate
    // if it is used as a global, so we have to work around that to
    // avoid bundling unnecessary code.
    const context = inBrowser
      ? window
      : typeof global !== 'undefined' ? global : {}
    timerFunc = context.setImmediate || setTimeout
  }
  return function (cb, ctx) {
    var func = ctx
      ? function () { cb.call(ctx) }
      : cb
    callbacks.push(func)
    if (pending) return
    pending = true
    timerFunc(nextTickHandler, 0)
  }
})()
