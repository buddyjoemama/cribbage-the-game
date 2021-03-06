var tests = [];
for (var file in window.__karma__.files) {
    if (/Spec\.js$/.test(file)) {
        tests.push(file);
    }
}

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/app/scripts',

  // example of using shim, to load non AMD libraries (such as underscore and jquery)
  paths: {
    'text': '../bower_components/requirejs-text/text',
    'jquery': '../bower_components/zepto/zepto',
    'mustache': '../bower_components/mustache/mustache'
  },
  map: {
    'app': {
      'modules/Mediator': '../../test/mocks/MediatorMock'
    },
    'modules/Mediator': {
      'modules/GameModule': '../../test/mocks/GameModuleMock'
    }
  },
  shim: {
    'jquery': {
      exports: '$'
    }
  },

  // dynamically load all test files
  deps: tests,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});


if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    'use strict';
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        FNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof FNOP && oThis ? this
              : oThis,
            aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    FNOP.prototype = this.prototype;
    fBound.prototype = new FNOP();

    return fBound;
  };
}
