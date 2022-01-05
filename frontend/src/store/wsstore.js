import { writable } from 'svelte/store';

export const book = writable(false);
export const ticker = writable(false);
export const trade = writable(false);
export const spread = writable(false);
export const ohlc = writable(false);
export const openorders = writable(false);
export const owntrades = writable(false);
export const tradebalance = writable(false);