import $, { Component, bind, define, observe, wire } from 'hyperhtml';

const [CONNECTED, DISCONNECTED] = ['connected', 'disconnected'];

const { global, WeakMap } = $._;

const details = new WeakMap;

const clear = global.cancelAnimationFrame || clearTimeout;
const request = clear == clearTimeout ? setTimeout : requestAnimationFrame;

let info = null;

const circus = (fn, $, init) => {
  const previously = info;
  if (init)
    details.set($, info = {
      $,
      fn,
      i: index(),
      timer: 0,
      html: null,
      svg: null,
      counter: [],
      effect: [],
      mutation: [],
      reducer: [],
      ref: [],
      state: [],
      handleEvent(e) {
        const previously = info;
        info = this;
        if (e.type === CONNECTED) {
          this.counter = this.effect.splice(0).map(fn => fn());
        } else {
          clear(this.timer);
          this.counter.splice(0).forEach(fn => { if (fn) fn(); });
        }
        info = previously;
      }
    });
  else {
    info = details.get($);
    info.i = index();
  }
  if (info.counter.length)
    info.handleEvent({type: DISCONNECTED});
  const node = fn($).valueOf(false);
  const {effect, mutation} = info.i;
  if (mutation)
    info.mutation.forEach(fn => fn());
  if (effect) {
    if (init) {
      const target = node.nodeType === 1 ? node : find(node);
      observe(target);
      target.addEventListener(CONNECTED, info);
      target.addEventListener(DISCONNECTED, info);
    } else {
      clear(info.timer);
      info.timer = request(info.handleEvent.bind(info, {type: CONNECTED}));
    }
  }
  info = previously;
  return node;
};

const createReducer = (i, callback, value) => {
  const {reducer, fn, $} = info;
  return reducer[i] = [value, action => {
    value = callback(value, action);
    reducer[i][0] = value;
    circus(fn, $, false);
  }];
};

const createState = (i, value) => {
  const {state, fn, $} = info;
  return state[i] = [value, value => {
    state[i][0] = value;
    circus(fn, $, false);
  }];
};

const find = node => {
  const {childNodes} = node;
  const {length} = childNodes;
  for (let i = 0; i < length; i++) {
    const child = childNodes[i];
    if (child.nodeType === 1)
      return child;
  }
  throw 'unobservable';
};

const lazyWire = type => {
  return (...args) => {
    const hyper = (info[type] || (info[type] = wire(info.$, type)));
    return hyper(...args);
  };
};

const index = () => ({
  effect: 0,
  mutation: 0,
  reducer: 0,
  ref: 0,
  state: 0,
});

// exports
const neverland = fn => ($ = {}) => circus(fn, $, true);

const html = lazyWire('html');

const svg = lazyWire('svg');

const useEffect = callback => {
  const i = info.i.effect++;
  return info.effect[i] || (info.effect[i] = callback);
};

const useMutationEffect = callback => {
  const i = info.i.mutation++;
  return info.mutation[i] || (info.mutation[i] = callback);
};

const useReducer = (callback, value) => {
  const i = info.i.reducer++;
  return info.reducer[i] || createReducer(i, callback, value);
};

const useRef = value => {
  const i = info.i.ref++;
  return info.ref[i] || (info.ref[i] = {current: value});
};

const useState = value => {
  const i = info.i.state++;
  return info.state[i] || createState(i, value);
};

export default neverland;
export {
  Component, bind, define, observe, wire,
  neverland, html, svg,
  useEffect, useMutationEffect, useReducer, useRef, useState
};
