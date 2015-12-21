// Set up sinon and chai

import sinon from 'sinon';
import chai, {expect} from 'chai';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

global.sinon = sinon;
global.expect = expect;

// Set up the DOM

import {jsdom} from 'jsdom';

global.document = jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = global.window.navigator;

global.print = ::console.log; // eslint-disable-line no-console
