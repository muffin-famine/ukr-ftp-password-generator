// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"index.ts":[function(require,module,exports) {
"use strict";

function init() {
  document.getElementById("generateButton").addEventListener("click", function () {
    try {
      generate();
    } catch (e) {
      alert(e);
    }

    return false;
  });
}

function generate() {
  var rawUsers = parseUsers();
  var domain = document.forms["main_form"]["domain"].value;
  var genUsers = generateEmails(rawUsers, domain);

  if (genUsers.length > 0) {
    displayGeneratedInfo(genUsers);
  }
}

function parseUsers() {
  var lines = document.forms["main_form"]["users"].value.split("\n");
  var users = [];
  var i = 0;
  var badLines = [];
  var alertMessages = [];

  for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
    var line = lines_1[_i];
    var trimmedLine = line.trim();
    var unknowns = getUnknownTransliterate(trimmedLine.split("\t").slice(0, 3).join("\t"));

    if (unknowns.length > 0) {
      badLines.push({
        line: trimmedLine,
        badSymbols: unknowns
      });
      continue;
    }

    if (trimmedLine.length > 0) {
      var userPrefs = trimmedLine.split("\t");

      if (userPrefs.length < 3) {
        alertMessages.push("Лінійка " + trimmedLine + " не містить повної інформації");
        continue;
      }

      users[i] = {
        group: userPrefs[0].trim(),
        lastName: userPrefs[1].trim(),
        firstName: userPrefs[2].trim(),
        plainText: trimmedLine
      };

      if (userPrefs[3]) {
        users[i].email = userPrefs[3].trim();

        if (userPrefs[4]) {
          users[i].password = userPrefs[4].trim();
        } else {
          alertMessages.push("Студент має існуючий імейл " + users[i].email + ", але не має пароля!");
        }
      }

      i++;
    }
  }

  if (alertMessages.length > 0) {
    alert(alertMessages.join("\r\n"));
    return [];
  }

  if (badLines.length > 0) {
    document.getElementById("badlinesroot").classList = "visible";

    for (var _a = 0, badLines_1 = badLines; _a < badLines_1.length; _a++) {
      var badLine = badLines_1[_a];
      document.getElementById("badlines").innerHTML += "<p>" + badLine.line + " <b>Символи: </b> " + badLine.badSymbols.join(", ") + "</p>";
    }
  } else {
    document.getElementById("badlinesroot").classList = "hidden";
    document.getElementById("badlines").innerHTML = "";
  }

  return users;
}

function generateEmails(rawUsers, domain) {
  var genUsers = [];
  var allUsernames = []; // First process everyone that already have emails

  for (var _i = 0, rawUsers_1 = rawUsers; _i < rawUsers_1.length; _i++) {
    var rawUser = rawUsers_1[_i];

    if (rawUser.email) {
      rawUser.doNotTouch = true;
      rawUser.username = rawUser.email.split('@')[0];
      allUsernames.push(rawUser.username);
      genUsers.push(rawUser);
    }
  } // Then process new users


  for (var _a = 0, rawUsers_2 = rawUsers; _a < rawUsers_2.length; _a++) {
    var rawUser = rawUsers_2[_a];

    if (!rawUser.email) {
      var username = transliterate(rawUser.group) + "." + transliterate(rawUser.lastName) + "." + transliterate(rawUser.firstName[0]);
      username = username.toLowerCase();
      var arrayCopy = rawUsers.slice();
      username = generateUniqueUsername(allUsernames, username);
      rawUser.username = username;
      allUsernames.push(rawUser.username);
      rawUser.password = randPassword(4, 3, 1, 2);
      rawUser.email = username + "@" + domain;
      genUsers.push(rawUser);
    }
  } // Double-check. Перевіряємо на однакові юзернейми знову


  var alertMessages = [];

  for (var i = 0; i < genUsers.length - 1; i++) {
    for (var j = i + 1; j < genUsers.length; j++) {
      if (genUsers[i].email == genUsers[j].email) {
        alertMessages.push("Знайдено кілька однакових імейлів: " + genUsers[i].email);
      }
    }
  }

  if (alertMessages.length > 0) {
    alert(alertMessages.join("\r\n"));
    return [];
  }

  return genUsers;
}

function generateUniqueUsername(allUsernames, username) {
  if (allUsernames.indexOf(username) === -1) {
    return username;
  }

  var uniqueUsername;

  for (var i = 2; i < 100; i++) {
    uniqueUsername = username + i;

    if (allUsernames.indexOf(uniqueUsername) === -1) {
      return uniqueUsername;
    }
  }

  return username;
}

var translitMap = {
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '0': '0',
  'зг': 'zgh',
  'Зг': 'Zgh',
  'А': 'A',
  'а': 'a',
  'Б': 'B',
  'б': 'b',
  'В': 'V',
  'в': 'v',
  'Г': 'H',
  'г': 'h',
  'Ґ': 'G',
  'ґ': 'g',
  'Д': 'D',
  'д': 'd',
  'Е': 'E',
  'е': 'e',
  'Є': 'Ye',
  'є': 'ie',
  'Ж': 'Zh',
  'ж': 'zh',
  'З': 'Z',
  'з': 'z',
  'И': 'Y',
  'и': 'y',
  'І': 'I',
  'і': 'i',
  'Ї': 'Yi',
  'ї': 'i',
  'Й': 'Y',
  'й': 'i',
  'К': 'K',
  'к': 'k',
  'Л': 'L',
  'л': 'l',
  'М': 'M',
  'м': 'm',
  'Н': 'N',
  'н': 'n',
  'О': 'O',
  'о': 'o',
  'П': 'P',
  'п': 'p',
  'Р': 'R',
  'р': 'r',
  'С': 'S',
  'с': 's',
  'Т': 'T',
  'т': 't',
  'У': 'U',
  'у': 'u',
  'Ф': 'F',
  'ф': 'f',
  'Х': 'Kh',
  'х': 'kh',
  'Ц': 'Ts',
  'ц': 'ts',
  'Ч': 'Ch',
  'ч': 'ch',
  'Ш': 'Sh',
  'ш': 'sh',
  'Щ': 'Shch',
  'щ': 'shch',
  'ь': '',
  'Ю': 'Yu',
  'ю': 'iu',
  'Я': 'Ya',
  'я': 'ia',
  '’': '',
  '`': '',
  '\'': '',
  ' ': '',
  '-': ''
};

function transliterate(str) {
  var result = '';

  for (var i = 0; i < str.length; i++) {
    var translated = translitMap[str[i]];

    if (translated !== '' && !translated) {
      alert("Символа " + str[i] + " немає в мапі транслітерації, тому він додасться без змін.");
      translated = str[i];
    }

    result += translated;
  }

  return result.toLowerCase();
}

function getUnknownTransliterate(str) {
  var unknowns = [];

  for (var i = 0; i < str.length; i++) {
    var translated = translitMap[str[i]];

    if (translated !== '' && !translated && str[i] !== '\t') {
      unknowns.push(str[i]);
    }
  }

  return unknowns;
}

function randPassword(letters, numbers, specials, either) {
  var chars = ["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", "0123456789", "!@#$%^&*()_+", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" // either
  ];
  return [letters, numbers, specials, either].map(function (len, i) {
    return Array(len).fill(chars[i]).map(function (x) {
      return x[Math.floor(Math.random() * x.length)];
    }).join('');
  }).concat().join('').split('').sort(function () {
    return 0.5 - Math.random();
  }).join('');
}

function displayGeneratedInfo(genUsers) {
  var text = '';

  for (var _i = 0, genUsers_1 = genUsers; _i < genUsers_1.length; _i++) {
    var genUser = genUsers_1[_i];
    text += genUser.group + '\t' + genUser.lastName + '\t' + genUser.firstName + '\t' + genUser.email + '\t' + genUser.password + '\n';
  }

  document.getElementById("generatedUsernames").value = text;
  document.getElementById("results").classList = "visible";
}

window.onload = function () {
  init();
};
},{}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63128" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/src.77de5100.js.map