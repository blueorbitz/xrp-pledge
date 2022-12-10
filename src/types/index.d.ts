/* eslint-disable no-var */
import type xrpl from 'xrpl'

declare global {
  interface Window {
    xrpl: xrpl;
  }
}

export {};
