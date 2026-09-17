const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

import { wait4selector, closeModalWindow } from '../utils.js';
import * as ST from '../selectors.js';

const baseURL = process.env.url || 'http://localhost:8080/org.geppetto.frontend';
const TEMPLATE_ID = 'VFB_00101567';
const TERM_ID = 'VFB_00102107';
const PROJECT_URL = `${baseURL}/geppetto?id=${TERM_ID}&i=${TEMPLATE_ID},${TERM_ID}&q=${TEMPLATE_ID},PaintedDomains`;

/*
 * Analytics is how the release is watched once it is out, so the events have to
 * actually fire. safeGa() calls window.ga when it is a function; the GA snippet
 * assigns window.ga itself, so record through an accessor that keeps working
 * whenever that assignment happens rather than being overwritten by it.
 */
const recordAnalytics = () => {
	window.__vfbGaEvents = [];
	let real;
	const recorder = function () {
		try {
			window.__vfbGaEvents.push(Array.prototype.slice.call(arguments).map(String).join('|'));
		} catch (ignore) {
			/* recording must not break the page */
		}
		if (typeof real === 'function') {
			return real.apply(window, arguments);
		}
		return undefined;
	};
	Object.defineProperty(window, 'ga', {
		configurable: true,
		get: function () {
			return recorder;
		},
		set: function (assigned) {
			real = assigned;
		}
	});
};

const eventsMatching = async (page, pattern) => page.evaluate(
	(source) => (window.__vfbGaEvents || []).filter((event) => new RegExp(source).test(event)),
	pattern
);

const waitForEvent = async (page, pattern, timeout) => page.waitForFunction(
	(source) => (window.__vfbGaEvents || []).some((event) => new RegExp(source).test(event)),
	{ timeout: timeout || 240000 },
	pattern
);

describe('VFB Analytics Tests', () => {
	beforeAll(async () => {
		jest.setTimeout(900000);
		await page.evaluateOnNewDocument(recordAnalytics);
		await page.goto(PROJECT_URL, { timeout: 220000 });
	}, 300000);

	describe('Test landing page', () => {
		it('Loading spinner goes away', async () => {
			await wait4selector(page, ST.SPINNER_SELECTOR, { hidden: true, timeout: 120000 });
			closeModalWindow(page);
		}, 180000);

		it('Term info component created after load', async () => {
			await wait4selector(page, 'div#bar-div-vfbterminfowidget', { visible: true, timeout: 240000 });
		}, 300000);
	});

	describe('Startup is reported', () => {
		it('The model arriving is timed', async () => {
			await waitForEvent(page, 'startup-model:');
			expect((await eventsMatching(page, 'startup-model:')).length).toBeGreaterThan(0);
		}, 300000);

		it('The first term reaching the screen is timed', async () => {
			await waitForEvent(page, 'startup-first-term:');
			expect((await eventsMatching(page, 'startup-first-term:')).length).toBeGreaterThan(0);
		}, 300000);
	});

	describe('Loading a term is reported', () => {
		it('Each requested term is timed and its outcome recorded', async () => {
			await waitForEvent(page, 'term-load:(ok|failed):');
			expect((await eventsMatching(page, 'term-load:ok:')).length).toBeGreaterThan(0);
		}, 360000);
	});

	describe('Running a query is reported', () => {
		/*
		 * The URL runs a query, so this covers the deep-link path. What matters is
		 * that a query is timed at all: the direct-query counts say which path ran
		 * it, not how long the user waited or whether anything came back.
		 */
		it('The query from the URL is timed', async () => {
			await waitForEvent(page, 'query-run:', 360000);
			expect((await eventsMatching(page, 'query-run:')).length).toBeGreaterThan(0);
		}, 420000);

		it('The size of what came back is recorded', async () => {
			await waitForEvent(page, 'query-rows:', 120000);
			expect((await eventsMatching(page, 'query-rows:')).length).toBeGreaterThan(0);
		}, 180000);
	});
});
