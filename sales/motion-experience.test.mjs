import test from "node:test";
import assert from "node:assert/strict";
import {shouldEnableMotion, startMotionExperience} from "./motion-experience.mjs";

const environment = (reduced = false, saveData = false) => ({
  matchMedia: () => ({matches: reduced}),
  navigator: {connection: {saveData}},
  IntersectionObserver: class {}
});

function fixtures() {
  const hero = [{id: "eyebrow"}, {id: "headline"}, {id: "actions"}];
  const cards = [{id: "software"}, {id: "sites"}];
  const progress = {id: "progress"};
  const document = {
    querySelectorAll(selector) {
      if (selector === "[data-motion-hero]") return hero;
      if (selector === "[data-motion-reveal]") return cards;
      return [];
    },
    querySelector(selector) {return selector === "[data-motion-progress]" ? progress : null;}
  };
  return {document, hero, cards, progress};
}

test("respects reduced motion and data saver without downloading Motion", async () => {
  let loads = 0;
  const load = async () => {loads++; return {};};
  assert.equal(shouldEnableMotion(environment(true)), false);
  assert.equal(shouldEnableMotion(environment(false, true)), false);
  assert.equal(await startMotionExperience({win: environment(true), doc: fixtures().document, load}), false);
  assert.equal(await startMotionExperience({win: environment(false, true), doc: fixtures().document, load}), false);
  assert.equal(loads, 0);
});

test("animates hero, existing product cards and scroll progress without changing links", async () => {
  const {document, hero, cards, progress} = fixtures();
  const calls = {animated: [], entered: [], progress: []};
  const load = async () => ({
    stagger: (delay) => delay,
    animate: (targets, keyframes) => {calls.animated.push({targets, keyframes}); return {targets};},
    inView: (element, onEnter) => {calls.entered.push(element); onEnter(element);},
    scroll: (animation) => {calls.progress.push(animation);}
  });
  assert.equal(await startMotionExperience({win: environment(), doc: document, load}), true);
  assert.deepEqual(calls.animated[0].targets, hero);
  assert.deepEqual(calls.entered, cards);
  assert.equal(calls.progress[0].targets, progress);
  assert.equal(calls.animated.length, 4); // hero, progress, two individual cards
});

test("a blocked CDN never prevents the static website from working", async () => {
  const ok = await startMotionExperience({
    win: environment(), doc: fixtures().document,
    load: async () => {throw new Error("offline");}
  });
  assert.equal(ok, false);
});
