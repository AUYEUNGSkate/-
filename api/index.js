process.env.VERCEL = "1";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@neon-rs/load/dist/index.js
var require_dist = __commonJS({
  "node_modules/@neon-rs/load/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.load = exports.currentTarget = void 0;
    var path4 = __importStar(__require("path"));
    var fs2 = __importStar(__require("fs"));
    function currentTarget() {
      let os = null;
      switch (process.platform) {
        case "android":
          switch (process.arch) {
            case "arm":
              return "android-arm-eabi";
            case "arm64":
              return "android-arm64";
          }
          os = "Android";
          break;
        case "win32":
          switch (process.arch) {
            case "x64":
              return "win32-x64-msvc";
            case "arm64":
              return "win32-arm64-msvc";
            case "ia32":
              return "win32-ia32-msvc";
          }
          os = "Windows";
          break;
        case "darwin":
          switch (process.arch) {
            case "x64":
              return "darwin-x64";
            case "arm64":
              return "darwin-arm64";
          }
          os = "macOS";
          break;
        case "linux":
          switch (process.arch) {
            case "x64":
            case "arm64":
              return isGlibc() ? `linux-${process.arch}-gnu` : `linux-${process.arch}-musl`;
            case "arm":
              return "linux-arm-gnueabihf";
          }
          os = "Linux";
          break;
        case "freebsd":
          if (process.arch === "x64") {
            return "freebsd-x64";
          }
          os = "FreeBSD";
          break;
      }
      if (os) {
        throw new Error(`Neon: unsupported ${os} architecture: ${process.arch}`);
      }
      throw new Error(`Neon: unsupported system: ${process.platform}`);
    }
    exports.currentTarget = currentTarget;
    function isGlibc() {
      const report = process.report?.getReport();
      if (typeof report !== "object" || !report || !("header" in report)) {
        return false;
      }
      const header = report.header;
      return typeof header === "object" && !!header && "glibcVersionRuntime" in header;
    }
    function load(dirname) {
      const m = path4.join(dirname, "index.node");
      return fs2.existsSync(m) ? __require(m) : null;
    }
    exports.load = load;
  }
});

// node_modules/libsql/node_modules/detect-libc/lib/process.js
var require_process = __commonJS({
  "node_modules/libsql/node_modules/detect-libc/lib/process.js"(exports, module) {
    "use strict";
    var isLinux = () => process.platform === "linux";
    var report = null;
    var getReport = () => {
      if (!report) {
        report = isLinux() && process.report ? process.report.getReport() : {};
      }
      return report;
    };
    module.exports = { isLinux, getReport };
  }
});

// node_modules/libsql/node_modules/detect-libc/lib/filesystem.js
var require_filesystem = __commonJS({
  "node_modules/libsql/node_modules/detect-libc/lib/filesystem.js"(exports, module) {
    "use strict";
    var fs2 = __require("fs");
    var LDD_PATH = "/usr/bin/ldd";
    var readFileSync = (path4) => fs2.readFileSync(path4, "utf-8");
    var readFile = (path4) => new Promise((resolve, reject) => {
      fs2.readFile(path4, "utf-8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    module.exports = {
      LDD_PATH,
      readFileSync,
      readFile
    };
  }
});

// node_modules/libsql/node_modules/detect-libc/lib/detect-libc.js
var require_detect_libc = __commonJS({
  "node_modules/libsql/node_modules/detect-libc/lib/detect-libc.js"(exports, module) {
    "use strict";
    var childProcess = __require("child_process");
    var { isLinux, getReport } = require_process();
    var { LDD_PATH, readFile, readFileSync } = require_filesystem();
    var cachedFamilyFilesystem;
    var cachedVersionFilesystem;
    var command = "getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true";
    var commandOut = "";
    var safeCommand = () => {
      if (!commandOut) {
        return new Promise((resolve) => {
          childProcess.exec(command, (err, out) => {
            commandOut = err ? " " : out;
            resolve(commandOut);
          });
        });
      }
      return commandOut;
    };
    var safeCommandSync = () => {
      if (!commandOut) {
        try {
          commandOut = childProcess.execSync(command, { encoding: "utf8" });
        } catch (_err) {
          commandOut = " ";
        }
      }
      return commandOut;
    };
    var GLIBC = "glibc";
    var RE_GLIBC_VERSION = /GLIBC\s(\d+\.\d+)/;
    var MUSL = "musl";
    var GLIBC_ON_LDD = GLIBC.toUpperCase();
    var MUSL_ON_LDD = MUSL.toLowerCase();
    var isFileMusl = (f) => f.includes("libc.musl-") || f.includes("ld-musl-");
    var familyFromReport = () => {
      const report = getReport();
      if (report.header && report.header.glibcVersionRuntime) {
        return GLIBC;
      }
      if (Array.isArray(report.sharedObjects)) {
        if (report.sharedObjects.some(isFileMusl)) {
          return MUSL;
        }
      }
      return null;
    };
    var familyFromCommand = (out) => {
      const [getconf, ldd1] = out.split(/[\r\n]+/);
      if (getconf && getconf.includes(GLIBC)) {
        return GLIBC;
      }
      if (ldd1 && ldd1.includes(MUSL)) {
        return MUSL;
      }
      return null;
    };
    var getFamilyFromLddContent = (content) => {
      if (content.includes(MUSL_ON_LDD)) {
        return MUSL;
      }
      if (content.includes(GLIBC_ON_LDD)) {
        return GLIBC;
      }
      return null;
    };
    var familyFromFilesystem = async () => {
      if (cachedFamilyFilesystem !== void 0) {
        return cachedFamilyFilesystem;
      }
      cachedFamilyFilesystem = null;
      try {
        const lddContent = await readFile(LDD_PATH);
        cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
      } catch (e) {
      }
      return cachedFamilyFilesystem;
    };
    var familyFromFilesystemSync = () => {
      if (cachedFamilyFilesystem !== void 0) {
        return cachedFamilyFilesystem;
      }
      cachedFamilyFilesystem = null;
      try {
        const lddContent = readFileSync(LDD_PATH);
        cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
      } catch (e) {
      }
      return cachedFamilyFilesystem;
    };
    var family = async () => {
      let family2 = null;
      if (isLinux()) {
        family2 = await familyFromFilesystem();
        if (!family2) {
          family2 = familyFromReport();
        }
        if (!family2) {
          const out = await safeCommand();
          family2 = familyFromCommand(out);
        }
      }
      return family2;
    };
    var familySync = () => {
      let family2 = null;
      if (isLinux()) {
        family2 = familyFromFilesystemSync();
        if (!family2) {
          family2 = familyFromReport();
        }
        if (!family2) {
          const out = safeCommandSync();
          family2 = familyFromCommand(out);
        }
      }
      return family2;
    };
    var isNonGlibcLinux = async () => isLinux() && await family() !== GLIBC;
    var isNonGlibcLinuxSync = () => isLinux() && familySync() !== GLIBC;
    var versionFromFilesystem = async () => {
      if (cachedVersionFilesystem !== void 0) {
        return cachedVersionFilesystem;
      }
      cachedVersionFilesystem = null;
      try {
        const lddContent = await readFile(LDD_PATH);
        const versionMatch = lddContent.match(RE_GLIBC_VERSION);
        if (versionMatch) {
          cachedVersionFilesystem = versionMatch[1];
        }
      } catch (e) {
      }
      return cachedVersionFilesystem;
    };
    var versionFromFilesystemSync = () => {
      if (cachedVersionFilesystem !== void 0) {
        return cachedVersionFilesystem;
      }
      cachedVersionFilesystem = null;
      try {
        const lddContent = readFileSync(LDD_PATH);
        const versionMatch = lddContent.match(RE_GLIBC_VERSION);
        if (versionMatch) {
          cachedVersionFilesystem = versionMatch[1];
        }
      } catch (e) {
      }
      return cachedVersionFilesystem;
    };
    var versionFromReport = () => {
      const report = getReport();
      if (report.header && report.header.glibcVersionRuntime) {
        return report.header.glibcVersionRuntime;
      }
      return null;
    };
    var versionSuffix = (s) => s.trim().split(/\s+/)[1];
    var versionFromCommand = (out) => {
      const [getconf, ldd1, ldd2] = out.split(/[\r\n]+/);
      if (getconf && getconf.includes(GLIBC)) {
        return versionSuffix(getconf);
      }
      if (ldd1 && ldd2 && ldd1.includes(MUSL)) {
        return versionSuffix(ldd2);
      }
      return null;
    };
    var version2 = async () => {
      let version3 = null;
      if (isLinux()) {
        version3 = await versionFromFilesystem();
        if (!version3) {
          version3 = versionFromReport();
        }
        if (!version3) {
          const out = await safeCommand();
          version3 = versionFromCommand(out);
        }
      }
      return version3;
    };
    var versionSync = () => {
      let version3 = null;
      if (isLinux()) {
        version3 = versionFromFilesystemSync();
        if (!version3) {
          version3 = versionFromReport();
        }
        if (!version3) {
          const out = safeCommandSync();
          version3 = versionFromCommand(out);
        }
      }
      return version3;
    };
    module.exports = {
      GLIBC,
      MUSL,
      family,
      familySync,
      isNonGlibcLinux,
      isNonGlibcLinuxSync,
      version: version2,
      versionSync
    };
  }
});

// node_modules/libsql/auth.js
var require_auth = __commonJS({
  "node_modules/libsql/auth.js"(exports, module) {
    var Authorization = {
      /**
       * Allow access to a resource.
       * @type {number}
       */
      ALLOW: 0,
      /**
       * Deny access to a resource and throw an error in `prepare()`.
       * @type {number}
       */
      DENY: 1
    };
    module.exports = Authorization;
  }
});

// node_modules/libsql/sqlite-error.js
var require_sqlite_error = __commonJS({
  "node_modules/libsql/sqlite-error.js"(exports, module) {
    "use strict";
    var descriptor = { value: "SqliteError", writable: true, enumerable: false, configurable: true };
    function SqliteError(message, code, rawCode) {
      if (new.target !== SqliteError) {
        return new SqliteError(message, code);
      }
      if (typeof code !== "string") {
        throw new TypeError("Expected second argument to be a string");
      }
      Error.call(this, message);
      descriptor.value = "" + message;
      Object.defineProperty(this, "message", descriptor);
      Error.captureStackTrace(this, SqliteError);
      this.code = code;
      this.rawCode = rawCode;
    }
    Object.setPrototypeOf(SqliteError, Error);
    Object.setPrototypeOf(SqliteError.prototype, Error.prototype);
    Object.defineProperty(SqliteError.prototype, "name", descriptor);
    module.exports = SqliteError;
  }
});

// node_modules/libsql/index.js
var require_libsql = __commonJS({
  "node_modules/libsql/index.js"(exports, module) {
    "use strict";
    var { load, currentTarget } = require_dist();
    var { familySync, GLIBC, MUSL } = require_detect_libc();
    function requireNative() {
      if (process.env.LIBSQL_JS_DEV) {
        return load(__dirname);
      }
      let target = currentTarget();
      if (familySync() == GLIBC) {
        switch (target) {
          case "linux-x64-musl":
            target = "linux-x64-gnu";
            break;
          case "linux-arm64-musl":
            target = "linux-arm64-gnu";
            break;
        }
      }
      if (target === "linux-arm-gnueabihf" && familySync() == MUSL) {
        target = "linux-arm-musleabihf";
      }
      return __require(`@libsql/${target}`);
    }
    var {
      databaseOpen,
      databaseOpenWithSync,
      databaseInTransaction,
      databaseInterrupt,
      databaseClose,
      databaseSyncSync,
      databaseSyncUntilSync,
      databaseExecSync,
      databasePrepareSync,
      databaseDefaultSafeIntegers,
      databaseAuthorizer,
      databaseLoadExtension,
      databaseMaxWriteReplicationIndex,
      statementRaw,
      statementIsReader,
      statementGet,
      statementRun,
      statementInterrupt,
      statementRowsSync,
      statementColumns,
      statementSafeIntegers,
      rowsNext
    } = requireNative();
    var Authorization = require_auth();
    var SqliteError = require_sqlite_error();
    function convertError(err) {
      if (err.libsqlError) {
        return new SqliteError(err.message, err.code, err.rawCode);
      }
      return err;
    }
    var Database3 = class {
      /**
       * Creates a new database connection. If the database file pointed to by `path` does not exists, it will be created.
       *
       * @constructor
       * @param {string} path - Path to the database file.
       */
      constructor(path4, opts) {
        const encryptionCipher = opts?.encryptionCipher ?? "aes256cbc";
        if (opts && opts.syncUrl) {
          var authToken = "";
          if (opts.syncAuth) {
            console.warn("Warning: The `syncAuth` option is deprecated, please use `authToken` option instead.");
            authToken = opts.syncAuth;
          } else if (opts.authToken) {
            authToken = opts.authToken;
          }
          const encryptionKey = opts?.encryptionKey ?? "";
          const syncPeriod = opts?.syncPeriod ?? 0;
          const readYourWrites = opts?.readYourWrites ?? true;
          const offline = opts?.offline ?? false;
          const remoteEncryptionKey = opts?.remoteEncryptionKey ?? "";
          this.db = databaseOpenWithSync(path4, opts.syncUrl, authToken, encryptionCipher, encryptionKey, syncPeriod, readYourWrites, offline, remoteEncryptionKey);
        } else {
          const authToken2 = opts?.authToken ?? "";
          const encryptionKey = opts?.encryptionKey ?? "";
          const timeout = opts?.timeout ?? 0;
          const remoteEncryptionKey = opts?.remoteEncryptionKey ?? "";
          this.db = databaseOpen(path4, authToken2, encryptionCipher, encryptionKey, timeout, remoteEncryptionKey);
        }
        this.memory = path4 === ":memory:";
        this.readonly = false;
        this.name = "";
        this.open = true;
        const db = this.db;
        Object.defineProperties(this, {
          inTransaction: {
            get() {
              return databaseInTransaction(db);
            }
          }
        });
      }
      sync() {
        return databaseSyncSync.call(this.db);
      }
      syncUntil(replicationIndex) {
        return databaseSyncUntilSync.call(this.db, replicationIndex);
      }
      /**
       * Prepares a SQL statement for execution.
       *
       * @param {string} sql - The SQL statement string to prepare.
       */
      prepare(sql) {
        try {
          const stmt = databasePrepareSync.call(this.db, sql);
          return new Statement(stmt);
        } catch (err) {
          throw convertError(err);
        }
      }
      /**
       * Returns a function that executes the given function in a transaction.
       *
       * @param {function} fn - The function to wrap in a transaction.
       */
      transaction(fn) {
        if (typeof fn !== "function")
          throw new TypeError("Expected first argument to be a function");
        const db = this;
        const wrapTxn = (mode) => {
          return (...bindParameters) => {
            db.exec("BEGIN " + mode);
            try {
              const result = fn(...bindParameters);
              db.exec("COMMIT");
              return result;
            } catch (err) {
              db.exec("ROLLBACK");
              throw err;
            }
          };
        };
        const properties = {
          default: { value: wrapTxn("") },
          deferred: { value: wrapTxn("DEFERRED") },
          immediate: { value: wrapTxn("IMMEDIATE") },
          exclusive: { value: wrapTxn("EXCLUSIVE") },
          database: { value: this, enumerable: true }
        };
        Object.defineProperties(properties.default.value, properties);
        Object.defineProperties(properties.deferred.value, properties);
        Object.defineProperties(properties.immediate.value, properties);
        Object.defineProperties(properties.exclusive.value, properties);
        return properties.default.value;
      }
      pragma(source, options) {
        if (options == null) options = {};
        if (typeof source !== "string") throw new TypeError("Expected first argument to be a string");
        if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
        const simple = options["simple"];
        const stmt = this.prepare(`PRAGMA ${source}`, this, true);
        return simple ? stmt.pluck().get() : stmt.all();
      }
      backup(filename, options) {
        throw new Error("not implemented");
      }
      serialize(options) {
        throw new Error("not implemented");
      }
      function(name, options, fn) {
        if (options == null) options = {};
        if (typeof options === "function") {
          fn = options;
          options = {};
        }
        if (typeof name !== "string")
          throw new TypeError("Expected first argument to be a string");
        if (typeof fn !== "function")
          throw new TypeError("Expected last argument to be a function");
        if (typeof options !== "object")
          throw new TypeError("Expected second argument to be an options object");
        if (!name)
          throw new TypeError(
            "User-defined function name cannot be an empty string"
          );
        throw new Error("not implemented");
      }
      aggregate(name, options) {
        if (typeof name !== "string")
          throw new TypeError("Expected first argument to be a string");
        if (typeof options !== "object" || options === null)
          throw new TypeError("Expected second argument to be an options object");
        if (!name)
          throw new TypeError(
            "User-defined function name cannot be an empty string"
          );
        throw new Error("not implemented");
      }
      table(name, factory) {
        if (typeof name !== "string")
          throw new TypeError("Expected first argument to be a string");
        if (!name)
          throw new TypeError(
            "Virtual table module name cannot be an empty string"
          );
        throw new Error("not implemented");
      }
      authorizer(rules) {
        databaseAuthorizer.call(this.db, rules);
      }
      loadExtension(...args) {
        databaseLoadExtension.call(this.db, ...args);
      }
      maxWriteReplicationIndex() {
        return databaseMaxWriteReplicationIndex.call(this.db);
      }
      /**
       * Executes a SQL statement.
       *
       * @param {string} sql - The SQL statement string to execute.
       */
      exec(sql) {
        try {
          databaseExecSync.call(this.db, sql);
        } catch (err) {
          throw convertError(err);
        }
      }
      /**
       * Interrupts the database connection.
       */
      interrupt() {
        databaseInterrupt.call(this.db);
      }
      /**
       * Closes the database connection.
       */
      close() {
        databaseClose.call(this.db);
        this.open = false;
      }
      /**
       * Toggle 64-bit integer support.
       */
      defaultSafeIntegers(toggle) {
        databaseDefaultSafeIntegers.call(this.db, toggle ?? true);
        return this;
      }
      unsafeMode(...args) {
        throw new Error("not implemented");
      }
    };
    var Statement = class {
      constructor(stmt) {
        this.stmt = stmt;
        this.pluckMode = false;
      }
      /**
       * Toggle raw mode.
       *
       * @param raw Enable or disable raw mode. If you don't pass the parameter, raw mode is enabled.
       */
      raw(raw) {
        statementRaw.call(this.stmt, raw ?? true);
        return this;
      }
      /**
       * Toggle pluck mode.
       *
       * @param pluckMode Enable or disable pluck mode. If you don't pass the parameter, pluck mode is enabled.
       */
      pluck(pluckMode) {
        this.pluckMode = pluckMode ?? true;
        return this;
      }
      get reader() {
        return statementIsReader.call(this.stmt);
      }
      /**
       * Executes the SQL statement and returns an info object.
       */
      run(...bindParameters) {
        try {
          if (bindParameters.length == 1 && typeof bindParameters[0] === "object") {
            return statementRun.call(this.stmt, bindParameters[0]);
          } else {
            return statementRun.call(this.stmt, bindParameters.flat());
          }
        } catch (err) {
          throw convertError(err);
        }
      }
      /**
       * Executes the SQL statement and returns the first row.
       *
       * @param bindParameters - The bind parameters for executing the statement.
       */
      get(...bindParameters) {
        try {
          if (bindParameters.length == 1 && typeof bindParameters[0] === "object") {
            return statementGet.call(this.stmt, bindParameters[0]);
          } else {
            return statementGet.call(this.stmt, bindParameters.flat());
          }
        } catch (err) {
          throw convertError(err);
        }
      }
      /**
       * Executes the SQL statement and returns an iterator to the resulting rows.
       *
       * @param bindParameters - The bind parameters for executing the statement.
       */
      iterate(...bindParameters) {
        var rows = void 0;
        if (bindParameters.length == 1 && typeof bindParameters[0] === "object") {
          rows = statementRowsSync.call(this.stmt, bindParameters[0]);
        } else {
          rows = statementRowsSync.call(this.stmt, bindParameters.flat());
        }
        const iter = {
          nextRows: Array(100),
          nextRowIndex: 100,
          next() {
            try {
              if (this.nextRowIndex === 100) {
                rowsNext.call(rows, this.nextRows);
                this.nextRowIndex = 0;
              }
              const row = this.nextRows[this.nextRowIndex];
              this.nextRows[this.nextRowIndex] = void 0;
              if (!row) {
                return { done: true };
              }
              this.nextRowIndex++;
              return { value: row, done: false };
            } catch (err) {
              throw convertError(err);
            }
          },
          [Symbol.iterator]() {
            return this;
          }
        };
        return iter;
      }
      /**
       * Executes the SQL statement and returns an array of the resulting rows.
       *
       * @param bindParameters - The bind parameters for executing the statement.
       */
      all(...bindParameters) {
        try {
          const result = [];
          for (const row of this.iterate(...bindParameters)) {
            if (this.pluckMode) {
              result.push(row[Object.keys(row)[0]]);
            } else {
              result.push(row);
            }
          }
          return result;
        } catch (err) {
          throw convertError(err);
        }
      }
      /**
       * Interrupts the statement.
       */
      interrupt() {
        statementInterrupt.call(this.stmt);
      }
      /**
       * Returns the columns in the result set returned by this prepared statement.
       */
      columns() {
        return statementColumns.call(this.stmt);
      }
      /**
       * Toggle 64-bit integer support.
       */
      safeIntegers(toggle) {
        statementSafeIntegers.call(this.stmt, toggle ?? true);
        return this;
      }
    };
    module.exports = Database3;
    module.exports.Authorization = Authorization;
    module.exports.SqliteError = SqliteError;
  }
});

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports, module) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports, module) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = __require("bufferutil");
        module.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports, module) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports, module) {
    "use strict";
    var zlib = __require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports, module) {
    "use strict";
    var { isUtf8 } = __require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = __require("utf-8-validate");
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports, module) {
    "use strict";
    var { Writable } = __require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          if (this._maxFragments > 0 && this._fragments.length >= this._maxFragments) {
            const error = this.createError(
              RangeError,
              "Too many message fragments",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            );
            cb(error);
            return;
          }
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            if (this._maxFragments > 0 && this._fragments.length >= this._maxFragments) {
              const error = this.createError(
                RangeError,
                "Too many message fragments",
                false,
                1008,
                "WS_ERR_TOO_MANY_BUFFERED_PARTS"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    var { randomFillSync } = __require("crypto");
    var {
      types: { isUint8Array }
    } = __require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports, module) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var https = __require("https");
    var http = __require("http");
    var net = __require("net");
    var tls = __require("tls");
    var { randomBytes, createHash } = __require("crypto");
    var { Duplex, Readable } = __require("stream");
    var { URL: URL2 } = __require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 1024 * 1024,
        maxFragments: 128 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports, module) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = __require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var http = __require("http");
    var { Duplex } = __require("stream");
    var { createHash } = __require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=1048576] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=131072] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 1024 * 1024,
          maxFragments: 128 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version2 = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version2 !== 13 && version2 !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version2 === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// node_modules/promise-limit/index.js
var require_promise_limit = __commonJS({
  "node_modules/promise-limit/index.js"(exports, module) {
    function limiter(count) {
      var outstanding = 0;
      var jobs = [];
      function remove() {
        outstanding--;
        if (outstanding < count) {
          dequeue();
        }
      }
      function dequeue() {
        var job = jobs.shift();
        semaphore.queue = jobs.length;
        if (job) {
          run2(job.fn).then(job.resolve).catch(job.reject);
        }
      }
      function queue(fn) {
        return new Promise(function(resolve, reject) {
          jobs.push({ fn, resolve, reject });
          semaphore.queue = jobs.length;
        });
      }
      function run2(fn) {
        outstanding++;
        try {
          return Promise.resolve(fn()).then(function(result) {
            remove();
            return result;
          }, function(error) {
            remove();
            throw error;
          });
        } catch (err) {
          remove();
          return Promise.reject(err);
        }
      }
      var semaphore = function(fn) {
        if (outstanding >= count) {
          return queue(fn);
        } else {
          return run2(fn);
        }
      };
      return semaphore;
    }
    function map(items, mapper) {
      var failed = false;
      var limit = this;
      return Promise.all(items.map(function() {
        var args = arguments;
        return limit(function() {
          if (!failed) {
            return mapper.apply(void 0, args).catch(function(e) {
              failed = true;
              throw e;
            });
          }
        });
      }));
    }
    function addExtras(fn) {
      fn.queue = 0;
      fn.map = map;
      return fn;
    }
    module.exports = function(count) {
      if (count) {
        return addExtras(limiter(count));
      } else {
        return addExtras(function(fn) {
          return fn();
        });
      }
    };
  }
});

// server/index.ts
import express from "express";
import path3 from "node:path";
import { fileURLToPath } from "node:url";

// server/config/env.ts
import "dotenv/config";
import path from "node:path";
function getEnv() {
  const dbPath = process.env.VERCEL ? "/tmp/hotpulse.sqlite" : path.resolve(process.cwd(), process.env.DATABASE_PATH ?? "./data/hotspot-radar.sqlite");
  return {
    port: Number(process.env.PORT ?? 8787),
    databasePath: dbPath,
    scanIntervalMinutes: Number(process.env.SCAN_INTERVAL_MINUTES ?? 30),
    aiMode: process.env.AI_MODE === "mock" ? "mock" : "openrouter",
    openRouterApiKey: process.env.OPEN_ROUTER ?? process.env.OPENROUTER_API_KEY ?? "",
    openRouterModel: process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-v4-flash",
    openRouterReferer: process.env.OPENROUTER_REFERER ?? "http://localhost:5173",
    openRouterTitle: process.env.OPENROUTER_TITLE ?? "Game Hotspot Radar",
    braveSearchApiKey: process.env.BRAVE_SEARCH_API_KEY ?? ""
  };
}

// server/db/client.ts
import Database from "better-sqlite3";
import fs from "node:fs";
import path2 from "node:path";

// server/services/contentFilter.ts
var SPAM_PATTERNS = [
  /results\s+for/i,
  /bet365/i,
  /博彩|彩票|开奖|开户地址|体育投注|体育综合版|极速赛车|北京赛车|快三|盘口|代理/i,
  /(?:^|[\s{【])官网[}:：】]/i,
  /\b(?:852|x999)\s*\./i,
  /\.(?:tw|pw|ojd|cls|nze)\b/i,
  /api\.weibo\.com/i
];
var GENERIC_TITLES = /* @__PURE__ */ new Set(["\u5FAE\u535A\u6B63\u6587", "\u77E5\u4E4E", "\u9996\u9875", "\u641C\u7D22\u7ED3\u679C", "results"]);
var COMMUNITY_HOSTS = [/taptap\.cn$/i, /zhihu\.com$/i, /tieba\.baidu\.com$/i, /weibo\.com$/i, /bilibili\.com$/i];
var FORUM_PAGE_PATTERNS = [
  /第\s*\d+\s*页/,
  /\bpage[=/_-]?\d+\b/i,
  /\/forum\//i,
  /\/topic\//i,
  /\/post\//i,
  /\/question\//i
];
function cleanArticleTitle(title) {
  const decoded = decodeHtml(title).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  let cleaned = decoded;
  for (let index = 0; index < 3; index += 1) {
    const next = cleaned.replace(
      /\s+-\s+(搜狐网|腾讯网|网易|新浪|新浪网|澎湃新闻|TapTap|发现好游戏|知乎专栏|游研社|触乐|竞核|游戏葡萄|哔哩哔哩|Bilibili|微博|百度贴吧|yeeyi)$/i,
      ""
    );
    if (next === cleaned) break;
    cleaned = next;
  }
  return cleaned.trim();
}
function isLowQualityResult(input) {
  return assessContentQuality(input).lowQuality;
}
function assessContentQuality(input) {
  const title = cleanArticleTitle(input.title);
  const haystack = `${input.title} ${input.url ?? ""} ${input.summary ?? ""}`;
  const signals = [];
  let score = 92;
  if (!title || title.length < 6) {
    signals.push("\u6807\u9898\u8FC7\u77ED\u6216\u7F3A\u5931");
    score -= 55;
  }
  if (GENERIC_TITLES.has(title.toLowerCase())) {
    signals.push("\u6CDB\u5316\u9875\u9762\u6807\u9898");
    score -= 60;
  }
  if (SPAM_PATTERNS.some((pattern) => pattern.test(haystack))) {
    signals.push("\u547D\u4E2D\u5783\u573E/\u535A\u5F69\u6A21\u5F0F");
    score -= 75;
  }
  const symbolCount = (title.match(/[{}【】[\]".|]/g) ?? []).length;
  if (symbolCount >= 5) {
    signals.push("\u6807\u9898\u7B26\u53F7\u5F02\u5E38");
    score -= 35;
  }
  const latinAndDigits = (title.match(/[A-Za-z0-9]/g) ?? []).length;
  if (latinAndDigits > 24 && /[{}]|\.com|\.tw|\.pw|\.ojd|\.cls/i.test(title)) {
    signals.push("\u7591\u4F3C\u641C\u7D22\u5783\u573E\u6807\u9898");
    score -= 45;
  }
  if (!input.summary?.trim()) {
    signals.push("\u6458\u8981\u7F3A\u5931");
    score -= 12;
  }
  const host = hostname(input.url ?? "");
  const communityHost = COMMUNITY_HOSTS.some((pattern) => pattern.test(host));
  if (communityHost) {
    signals.push("\u793E\u533A\u5E73\u53F0\u5355\u6761\u4FE1\u53F7");
    score -= 10;
  }
  if (input.sourceCommunity && input.sourceName) {
    const platform = identifyPlatform(input.sourceName, input.url || "");
    if (isReplyContent(title)) {
      signals.push("\u56DE\u590D/\u8BC4\u8BBA\u5185\u5BB9");
      score -= 60;
    }
    const counts = extractInteractionCounts(title);
    const hasInteraction = counts.likes > 0 || counts.reposts > 0 || counts.replies > 0 || counts.views > 0;
    if (hasInteraction) {
      const thresholdCheck = checkInteractionThresholds(platform, counts);
      if (!thresholdCheck.passed) {
        signals.push(thresholdCheck.reason);
        score -= 50;
      }
    }
  }
  if (FORUM_PAGE_PATTERNS.some((pattern) => pattern.test(haystack))) {
    signals.push("\u7591\u4F3C\u8BBA\u575B/\u5206\u9875\u5185\u5BB9");
    score -= 32;
  }
  if (/api\./i.test(host) || /\/api\//i.test(input.url ?? "")) {
    signals.push("API \u9875\u9762");
    score -= 45;
  }
  if (/(?:baidu|sogou)\.com\/(?:link|sf|bai|url)/i.test(input.url ?? "")) {
    signals.push("\u641C\u7D22\u5F15\u64CE\u4E2D\u8F6C/\u7D22\u5F15\u9875");
    score -= 45;
  }
  const commaSegments = title.split(/[,，、;；\s]+/).filter((s) => s.length > 1);
  const enSegments = title.match(/[a-zA-Z]{2,}/g) ?? [];
  if (commaSegments.length >= 10 || enSegments.length >= 5 && /[\u4e00-\u9fff]/.test(title)) {
    signals.push("\u7591\u4F3CSEO\u5806\u780C\u6807\u9898");
    score -= 40;
  }
  if (/目录|索引|标签|分类汇总|搜索结果|问答$|聚合|归档$/i.test(title)) {
    signals.push("\u76EE\u5F55/\u5BFC\u822A\u7C7B\u6807\u9898");
    score -= 35;
  }
  if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(title) || title.length < 12 && !input.summary?.trim()) {
    signals.push("\u7A7A\u6216\u7EAF\u65E5\u671F\u6807\u9898");
    score -= 50;
  }
  score = Math.max(0, Math.min(100, score));
  return {
    score,
    signals: signals.length ? signals : ["\u57FA\u7840\u8D28\u91CF\u901A\u8FC7"],
    lowQuality: score < 45
  };
}
function cleanSummary(value) {
  const cleaned = decodeHtml(value).replace(/<[^>]*>/g, " ").replace(/<[^>]*$/g, " ").replace(/https?:\/\/\S+/g, " ").replace(/\bnews\.google\.com\/rss\/articles\/\S+/gi, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  if (/^<a\s/i.test(value) || cleaned.length > 180) {
    return cleanArticleTitle(cleaned);
  }
  return cleaned;
}
function identifyPlatform(sourceName, sourceUrl) {
  const name = sourceName.toLowerCase();
  const url = sourceUrl.toLowerCase();
  if (name.includes("\u5FAE\u535A") || url.includes("weibo.com")) return "weibo";
  if (name.includes("b\u7AD9") || name.includes("bilibili") || url.includes("bilibili.com")) return "bilibili";
  if (name.includes("taptap") || url.includes("taptap.cn")) return "taptap";
  if (name.includes("\u77E5\u4E4E") || url.includes("zhihu.com")) return "zhihu";
  if (name.includes("\u8D34\u5427") || url.includes("tieba.baidu.com")) return "tieba";
  return "other";
}
function isReplyContent(title) {
  const replyPatterns = [
    /^回复[:：]/,
    /^Re[:：]/i,
    /^回复@/,
    /的回复$/,
    /的评论$/,
    /^评论[:：]/,
    /^@[\w]+[\s：:]/,
    /^回复\s/
  ];
  return replyPatterns.some((pattern) => pattern.test(title.trim()));
}
function extractInteractionCounts(title) {
  const patterns = {
    likes: /(\d+(?:\.\d+)?[kK万]?)\s*(?:赞|点赞|like|upvote|赞同)/i,
    reposts: /(\d+(?:\.\d+)?[kK万]?)\s*(?:转发|repost|share)/i,
    replies: /(\d+(?:\.\d+)?[kK万]?)\s*(?:回复|评论|comment|reply|回答|条评价|个回答)/i,
    views: /(\d+(?:\.\d+)?[kK万]?)\s*(?:播放|浏览|view|阅读)/i
  };
  const result = { likes: 0, reposts: 0, replies: 0, views: 0 };
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = title.match(pattern);
    if (match) {
      result[key] = parseNumber(match[1]);
    }
  }
  return result;
}
function parseNumber(str) {
  const num = parseFloat(str);
  if (str.toLowerCase().includes("k")) return num * 1e3;
  if (str.includes("\u4E07")) return num * 1e4;
  return num;
}
function checkInteractionThresholds(platform, counts) {
  switch (platform) {
    case "weibo":
      if (counts.likes > 0 && counts.likes < 10) return { passed: false, reason: "\u70B9\u8D5E\u6570" + counts.likes + "\u4F4E\u4E8E\u9608\u503C10" };
      if (counts.reposts > 0 && counts.reposts < 5) return { passed: false, reason: "\u8F6C\u53D1\u6570" + counts.reposts + "\u4F4E\u4E8E\u9608\u503C5" };
      break;
    case "bilibili":
      if (counts.views > 0 && counts.views < 500) return { passed: false, reason: "\u64AD\u653E\u91CF" + counts.views + "\u4F4E\u4E8E\u9608\u503C500" };
      if (counts.likes > 0 && counts.likes < 10) return { passed: false, reason: "\u70B9\u8D5E\u6570" + counts.likes + "\u4F4E\u4E8E\u9608\u503C10" };
      break;
    case "taptap":
      if (counts.replies > 0 && counts.replies < 5) return { passed: false, reason: "\u8BC4\u4EF7\u6570" + counts.replies + "\u4F4E\u4E8E\u9608\u503C5" };
      break;
    case "zhihu":
      if (counts.replies > 0 && counts.replies < 5) return { passed: false, reason: "\u56DE\u7B54\u6570" + counts.replies + "\u4F4E\u4E8E\u9608\u503C5" };
      if (counts.likes > 0 && counts.likes < 10) return { passed: false, reason: "\u8D5E\u540C\u6570" + counts.likes + "\u4F4E\u4E8E\u9608\u503C10" };
      break;
    case "tieba":
      if (counts.replies > 0 && counts.replies < 10) return { passed: false, reason: "\u56DE\u590D\u6570" + counts.replies + "\u4F4E\u4E8E\u9608\u503C10" };
      break;
  }
  return { passed: true, reason: "" };
}
function hostname(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}
function decodeHtml(value) {
  return value.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// server/services/dedupe.ts
var TRACKING_PARAMS = /* @__PURE__ */ new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid"
]);
function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) parsed.searchParams.delete(key);
    }
    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}
function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}
function titleSimilarity(left, right) {
  const a = new Set(titleTokens(left));
  const b = new Set(titleTokens(right));
  if (a.size === 0 || b.size === 0) return 0;
  const intersection = Array.from(a).filter((token) => b.has(token)).length;
  const union = (/* @__PURE__ */ new Set([...a, ...b])).size;
  return intersection / union;
}
function titleTokens(title) {
  const normalized = normalizeTitle(title);
  const wordTokens = normalized.split(" ").filter((token) => token.length > 1);
  const cjkChars = Array.from(normalized.replace(/\s+/g, "")).filter((char) => new RegExp("\\p{Script=Han}", "u").test(char));
  const cjkBigrams = [];
  for (let index = 0; index < cjkChars.length - 1; index += 1) {
    cjkBigrams.push(`${cjkChars[index]}${cjkChars[index + 1]}`);
  }
  return [...wordTokens, ...cjkBigrams];
}

// server/db/client.ts
var singleton = null;
function getDb() {
  if (singleton) return singleton;
  const env2 = getEnv();
  fs.mkdirSync(path2.dirname(env2.databasePath), { recursive: true });
  singleton = new Database(env2.databasePath);
  singleton.pragma("journal_mode = WAL");
  singleton.pragma("foreign_keys = ON");
  initializeSchema(singleton);
  seedDefaults(singleton);
  return singleton;
}
function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      term TEXT NOT NULL,
      scope TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      category TEXT NOT NULL,
      provider_type TEXT NOT NULL DEFAULT 'rss',
      reliability_tier TEXT NOT NULL DEFAULT 'trusted',
      community_source INTEGER NOT NULL DEFAULT 0,
      min_quality_score INTEGER NOT NULL DEFAULT 60,
      enabled INTEGER NOT NULL DEFAULT 1,
      builtin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
      keyword_id INTEGER REFERENCES keywords(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      normalized_url TEXT NOT NULL UNIQUE,
      summary TEXT NOT NULL DEFAULT '',
      published_at TEXT NOT NULL,
      fetched_at TEXT NOT NULL,
      matched_keyword TEXT NOT NULL,
      read_at TEXT,
      status TEXT NOT NULL DEFAULT 'watch',
      quality_score INTEGER NOT NULL DEFAULT 70,
      quality_signals TEXT NOT NULL DEFAULT '[]',
      evidence_count INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL UNIQUE REFERENCES items(id) ON DELETE CASCADE,
      relevance_score REAL NOT NULL,
      credibility_score REAL NOT NULL,
      novelty_score REAL NOT NULL,
      hotness_score REAL NOT NULL,
      is_impersonation_likely INTEGER NOT NULL,
      summary TEXT NOT NULL,
      reason TEXT NOT NULL,
      recommended_action TEXT NOT NULL,
      raw_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scan_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      status TEXT NOT NULL,
      total_fetched INTEGER NOT NULL DEFAULT 0,
      total_inserted INTEGER NOT NULL DEFAULT 0,
      total_evaluated INTEGER NOT NULL DEFAULT 0,
      error TEXT
    );

    CREATE TABLE IF NOT EXISTS item_evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      provider_type TEXT NOT NULL,
      source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
      source_name TEXT NOT NULL,
      query TEXT NOT NULL,
      rank INTEGER NOT NULL DEFAULT 0,
      original_url TEXT NOT NULL,
      normalized_url TEXT NOT NULL,
      domain TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(item_id, provider_type, source_id, normalized_url)
    );
  `);
  addColumnIfMissing(db, "sources", "provider_type", "TEXT NOT NULL DEFAULT 'rss'");
  addColumnIfMissing(db, "sources", "reliability_tier", "TEXT NOT NULL DEFAULT 'trusted'");
  addColumnIfMissing(db, "sources", "community_source", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "sources", "min_quality_score", "INTEGER NOT NULL DEFAULT 60");
  addColumnIfMissing(db, "items", "quality_score", "INTEGER NOT NULL DEFAULT 70");
  addColumnIfMissing(db, "items", "quality_signals", "TEXT NOT NULL DEFAULT '[]'");
  addColumnIfMissing(db, "items", "evidence_count", "INTEGER NOT NULL DEFAULT 1");
  addColumnIfMissing(db, "items", "archived_at", "TEXT");
  addColumnIfMissing(db, "items", "interaction_likes", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "interaction_reposts", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "interaction_replies", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "interaction_views", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "summary_source", "TEXT NOT NULL DEFAULT 'rss'");
  addColumnIfMissing(db, "items", "interaction_source", "TEXT NOT NULL DEFAULT 'none'");
  addColumnIfMissing(db, "items", "priority_score", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "freshness_score", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "author_name", "TEXT");
  addColumnIfMissing(db, "items", "author_followers", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "author_verified", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "interaction_danmaku", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "items", "interaction_quotes", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "ai_evaluations", "keyword_mentioned", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "ai_evaluations", "relevance_summary", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "keywords", "account_mode", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "keywords", "account_platform", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "keywords", "account_uid", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "keywords", "account_url", "TEXT NOT NULL DEFAULT ''");
}
function addColumnIfMissing(db, table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((entry) => entry.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
function seedDefaults(db) {
  const env2 = getEnv();
  const settingCount = db.prepare("SELECT COUNT(*) AS count FROM settings").get();
  if (settingCount.count === 0) {
    const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (@key, @value)");
    insertSetting.run({ key: "aiMode", value: env2.aiMode });
    insertSetting.run({ key: "scanIntervalMinutes", value: String(env2.scanIntervalMinutes) });
  }
  const keywordCount = db.prepare("SELECT COUNT(*) AS count FROM keywords").get();
  if (keywordCount.count === 0) {
    const insertKeyword = db.prepare("INSERT INTO keywords (term, scope) VALUES (@term, @scope)");
    insertKeyword.run({ term: "AI \u7F16\u7A0B", scope: "\u6E38\u620F\u5F00\u53D1\u3001\u751F\u4EA7\u529B\u5DE5\u5177\u3001Agent \u5DE5\u4F5C\u6D41" });
    insertKeyword.run({ term: "Unity", scope: "\u6E38\u620F\u5F15\u64CE\u3001\u6280\u672F\u66F4\u65B0\u3001\u5546\u4E1A\u653F\u7B56" });
    insertKeyword.run({ term: "\u6E38\u620F\u51FA\u6D77", scope: "\u53D1\u884C\u3001\u4E70\u91CF\u3001\u5E02\u573A\u3001\u5E73\u53F0\u653F\u7B56" });
  }
  ensureDefaultSources(db);
}
function getDefaultSources() {
  return [
    {
      name: "RSSHub \u767E\u5EA6\u641C\u7D22",
      url: "https://rsshub.rssforever.com/baidu/search/{query}",
      category: "\u56FD\u5185\u7EFC\u5408",
      providerType: "rss",
      reliabilityTier: "search",
      communitySource: false,
      minQualityScore: 70,
      enabled: true,
      builtin: true
    },
    {
      name: "\u5FAE\u535A\u70ED\u641C",
      url: "https://weibo.com/ajax/side/hotSearch",
      category: "\u641C\u7D22\u589E\u5F3A",
      providerType: "weibo_hot",
      reliabilityTier: "search",
      communitySource: false,
      minQualityScore: 50,
      enabled: true,
      builtin: true
    },
    {
      name: "\u56FD\u5185\u7EFC\u5408\u65B0\u95FB",
      url: "https://news.google.com/rss/search?q={query}%20(%E6%B8%B8%E6%88%8F%20OR%20%E6%89%8B%E6%B8%B8%20OR%20%E5%8E%82%E5%95%86%20OR%20%E7%89%88%E5%8F%B7)&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "\u56FD\u5185\u7EFC\u5408",
      providerType: "google_news",
      reliabilityTier: "search",
      communitySource: false,
      minQualityScore: 68,
      enabled: false,
      builtin: true
    },
    {
      name: "\u5FAE\u535A\u70ED\u70B9",
      url: "https://news.google.com/rss/search?q={query}%20site%3Aweibo.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "\u56FD\u5185\u5E73\u53F0",
      providerType: "google_news",
      reliabilityTier: "community",
      communitySource: true,
      minQualityScore: 78,
      enabled: false,
      builtin: true
    },
    {
      name: "B\u7AD9\u5185\u5BB9",
      url: "https://news.google.com/rss/search?q={query}%20site%3Abilibili.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "\u56FD\u5185\u5E73\u53F0",
      providerType: "google_news",
      reliabilityTier: "community",
      communitySource: true,
      minQualityScore: 76,
      enabled: false,
      builtin: true
    },
    {
      name: "B\u7AD9\u8D26\u53F7\u89C6\u9891",
      url: "https://rsshub.app/bilibili/user/video/{accountUid}",
      category: "\u8D26\u53F7\u6E90",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 65,
      enabled: true,
      builtin: true
    },
    {
      name: "B\u7AD9\u8D26\u53F7\u52A8\u6001",
      url: "https://rsshub.app/bilibili/user/dynamic/{accountUid}",
      category: "\u8D26\u53F7\u6E90",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 65,
      enabled: true,
      builtin: true
    },
    {
      name: "TapTap \u793E\u533A",
      url: "https://news.google.com/rss/search?q={query}%20site%3Ataptap.cn&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "\u56FD\u5185\u5E73\u53F0",
      providerType: "google_news",
      reliabilityTier: "community",
      communitySource: true,
      minQualityScore: 82,
      enabled: false,
      builtin: true
    },
    {
      name: "\u77E5\u4E4E\u8BA8\u8BBA",
      url: "https://news.google.com/rss/search?q={query}%20site%3Azhihu.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "\u56FD\u5185\u5E73\u53F0",
      providerType: "google_news",
      reliabilityTier: "community",
      communitySource: true,
      minQualityScore: 78,
      enabled: false,
      builtin: true
    },
    {
      name: "\u5FAE\u4FE1\u516C\u4F17\u53F7\u6587\u7AE0",
      url: "https://news.google.com/rss/search?q={query}%20site%3Amp.weixin.qq.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "\u56FD\u5185\u5E73\u53F0",
      providerType: "google_news",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 72,
      enabled: false,
      builtin: true
    },
    {
      name: "\u767E\u5EA6\u8D34\u5427\u8BA8\u8BBA",
      url: "https://news.google.com/rss/search?q={query}%20site%3Atieba.baidu.com&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "\u56FD\u5185\u5E73\u53F0",
      providerType: "google_news",
      reliabilityTier: "community",
      communitySource: true,
      minQualityScore: 84,
      enabled: false,
      builtin: true
    },
    {
      name: "\u56FD\u5185\u6E38\u620F\u5A92\u4F53",
      url: "https://news.google.com/rss/search?q={query}%20(%E6%B8%B8%E6%88%8F%E8%91%A1%E8%90%84%20OR%20%E7%AB%9E%E6%A0%B8%20OR%20%E6%B8%B8%E7%A0%94%E7%A4%BE%20OR%20%E8%A7%A6%E4%B9%90)&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      category: "\u56FD\u5185\u5A92\u4F53",
      providerType: "google_news",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 66,
      enabled: false,
      builtin: true
    },
    {
      name: "\u673A\u6838\u7F51",
      url: "https://www.gcores.com/rss",
      category: "\u56FD\u5185\u5A92\u4F53",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "\u6E38\u7814\u793E",
      url: "https://www.yystv.cn/rss/feed",
      category: "\u56FD\u5185\u5A92\u4F53",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "\u89E6\u4E50",
      url: "https://www.chuapp.com/feed",
      category: "\u56FD\u5185\u5A92\u4F53",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "\u6E38\u6C11\u661F\u7A7A",
      url: "https://rsshub.rssforever.com/gamersky/news",
      category: "\u56FD\u5185\u5A92\u4F53",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: false,
      builtin: true
    },
    {
      name: "3DM \u6E38\u620F",
      url: "https://rsshub.app/3dm/news",
      category: "\u56FD\u5185\u5A92\u4F53",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "\u641C\u72D0\u6E38\u620F",
      url: "https://rsshub.app/sohu/game",
      category: "\u56FD\u5185\u7EFC\u5408",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "\u7F51\u6613\u6E38\u620F",
      url: "https://rsshub.app/163/dy",
      category: "\u56FD\u5185\u7EFC\u5408",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "17173 \u65B0\u95FB",
      url: "https://rsshub.app/17173/news",
      category: "\u56FD\u5185\u5A92\u4F53",
      providerType: "rss",
      reliabilityTier: "trusted",
      communitySource: false,
      minQualityScore: 62,
      enabled: true,
      builtin: true
    },
    {
      name: "Brave Search \u589E\u5F3A",
      url: "{query}",
      category: "\u641C\u7D22\u589E\u5F3A",
      providerType: "brave_search",
      reliabilityTier: "search",
      communitySource: false,
      minQualityScore: 70,
      enabled: false,
      builtin: true
    }
  ];
}
function ensureDefaultSources(db) {
  const findByName = db.prepare("SELECT id FROM sources WHERE name = ?");
  const insertSource = db.prepare(`
    INSERT INTO sources (
      name, url, category, provider_type, reliability_tier,
      community_source, min_quality_score, enabled, builtin
    )
    VALUES (
      @name, @url, @category, @providerType, @reliabilityTier,
      @communitySource, @minQualityScore, @enabled, @builtin
    )
  `);
  const updateSource = db.prepare(`
    UPDATE sources
    SET
      url = @url,
      category = @category,
      provider_type = @providerType,
      reliability_tier = @reliabilityTier,
      community_source = @communitySource,
      min_quality_score = @minQualityScore,
      builtin = 1
    WHERE id = @id
  `);
  const upsertDefaults = db.transaction((sources) => {
    for (const source of sources) {
      const row = findByName.get(source.name);
      const payload = {
        ...source,
        providerType: source.providerType,
        reliabilityTier: source.reliabilityTier,
        communitySource: Number(source.communitySource),
        minQualityScore: source.minQualityScore,
        enabled: Number(source.enabled),
        builtin: Number(source.builtin)
      };
      if (row) {
        updateSource.run({ ...payload, id: row.id });
      } else {
        insertSource.run(payload);
      }
    }
  });
  upsertDefaults(getDefaultSources());
  db.prepare(`
    UPDATE sources
    SET enabled = 0
    WHERE builtin = 1 AND name IN (
      'Google News \u5168\u7403\u6E38\u620F\u6280\u672F',
      'Google News AI \u7F16\u7A0B',
      'Google News \u4E2D\u6587\u6E38\u620F\u884C\u4E1A'
    )
  `).run();
}
var repositories = {
  settings: {
    all() {
      const db = getDb();
      const rows = db.prepare("SELECT key, value FROM settings").all();
      const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
      const env2 = getEnv();
      return {
        aiMode: map.aiMode === "mock" ? "mock" : "openrouter",
        scanIntervalMinutes: Number(map.scanIntervalMinutes ?? env2.scanIntervalMinutes),
        openRouterConfigured: Boolean(env2.openRouterApiKey),
        openRouterModel: env2.openRouterModel
      };
    },
    set(key, value) {
      getDb().prepare(`
        INSERT INTO settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).run(key, value);
    }
  },
  keywords: {
    all() {
      const rows = getDb().prepare("SELECT * FROM keywords ORDER BY enabled DESC, id DESC").all();
      return rows.map(mapKeyword);
    },
    active() {
      const rows = getDb().prepare("SELECT * FROM keywords WHERE enabled = 1 ORDER BY id DESC").all();
      return rows.map(mapKeyword);
    },
    create(term, scope) {
      const account = detectAccountInfo(term.trim());
      const info = getDb().prepare(`
        INSERT INTO keywords (term, scope, account_mode, account_platform, account_uid, account_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(term.trim(), scope.trim(), Number(account.accountMode), account.accountPlatform, account.accountUid, account.accountUrl);
      return this.byId(Number(info.lastInsertRowid));
    },
    update(id, input) {
      const current = this.byId(id);
      if (!current) return null;
      const nextTerm = input.term?.trim() ?? current.term;
      const detected = input.term ? detectAccountInfo(nextTerm) : null;
      getDb().prepare(`
        UPDATE keywords
        SET term = ?, scope = ?, enabled = ?, account_mode = ?, account_platform = ?, account_uid = ?, account_url = ?
        WHERE id = ?
      `).run(
        nextTerm,
        input.scope?.trim() ?? current.scope,
        typeof input.enabled === "boolean" ? Number(input.enabled) : Number(current.enabled),
        typeof input.accountMode === "boolean" ? Number(input.accountMode) : Number(detected?.accountMode ?? current.accountMode),
        input.accountPlatform ?? detected?.accountPlatform ?? current.accountPlatform,
        input.accountUid ?? detected?.accountUid ?? current.accountUid,
        input.accountUrl ?? detected?.accountUrl ?? current.accountUrl,
        id
      );
      return this.byId(id);
    },
    delete(id) {
      return getDb().prepare("DELETE FROM keywords WHERE id = ?").run(id).changes > 0;
    },
    byId(id) {
      const row = getDb().prepare("SELECT * FROM keywords WHERE id = ?").get(id);
      return row ? mapKeyword(row) : null;
    }
  },
  sources: {
    all() {
      const rows = getDb().prepare("SELECT * FROM sources ORDER BY enabled DESC, builtin DESC, id DESC").all();
      return rows.map(mapSource);
    },
    active() {
      const rows = getDb().prepare("SELECT * FROM sources WHERE enabled = 1 ORDER BY id").all();
      return rows.map(mapSource);
    },
    create(input) {
      const info = getDb().prepare(`
        INSERT INTO sources (
          name, url, category, provider_type, reliability_tier,
          community_source, min_quality_score, enabled, builtin
        )
        VALUES (
          @name, @url, @category, @providerType, @reliabilityTier,
          @communitySource, @minQualityScore, @enabled, @builtin
        )
      `).run({
        name: input.name.trim(),
        url: input.url.trim(),
        category: input.category.trim() || "\u81EA\u5B9A\u4E49",
        providerType: input.providerType ?? inferProviderType(input.url),
        reliabilityTier: input.reliabilityTier ?? "trusted",
        communitySource: Number(input.communitySource ?? false),
        minQualityScore: input.minQualityScore ?? 65,
        enabled: Number(input.enabled ?? true),
        builtin: Number(input.builtin ?? false)
      });
      return this.byId(Number(info.lastInsertRowid));
    },
    update(id, input) {
      const current = this.byId(id);
      if (!current) return null;
      getDb().prepare(`
        UPDATE sources
        SET
          name = ?,
          url = ?,
          category = ?,
          provider_type = ?,
          reliability_tier = ?,
          community_source = ?,
          min_quality_score = ?,
          enabled = ?
        WHERE id = ?
      `).run(
        input.name?.trim() ?? current.name,
        input.url?.trim() ?? current.url,
        input.category?.trim() ?? current.category,
        input.providerType ?? current.providerType,
        input.reliabilityTier ?? current.reliabilityTier,
        typeof input.communitySource === "boolean" ? Number(input.communitySource) : Number(current.communitySource),
        input.minQualityScore ?? current.minQualityScore,
        typeof input.enabled === "boolean" ? Number(input.enabled) : Number(current.enabled),
        id
      );
      return this.byId(id);
    },
    delete(id) {
      const source = this.byId(id);
      if (!source) return false;
      if (source.builtin) {
        return this.update(id, { enabled: false }) !== null;
      }
      return getDb().prepare("DELETE FROM sources WHERE id = ?").run(id).changes > 0;
    },
    byId(id) {
      const row = getDb().prepare("SELECT * FROM sources WHERE id = ?").get(id);
      return row ? mapSource(row) : null;
    }
  },
  items: {
    list(limit = 80) {
      const rows = getDb().prepare(`
        SELECT
          i.*,
          i.interaction_likes,
          i.interaction_reposts,
          i.interaction_replies,
          i.interaction_views,
          i.interaction_danmaku,
          i.interaction_quotes,
          i.priority_score,
          i.freshness_score,
          i.author_name,
          i.author_followers,
          i.author_verified,
          s.reliability_tier AS source_reliability,
          s.community_source AS source_community,
          e.relevance_score,
          e.credibility_score,
          e.novelty_score,
          e.hotness_score,
          e.is_impersonation_likely,
          e.summary AS ai_summary,
          e.reason,
          e.recommended_action,
          e.keyword_mentioned,
          e.relevance_summary,
          (
            SELECT json_group_array(DISTINCT provider_type)
            FROM item_evidence
            WHERE item_id = i.id
          ) AS evidence_providers,
          (
            SELECT json_group_array(DISTINCT source_name)
            FROM item_evidence
            WHERE item_id = i.id
          ) AS evidence_source_names
        FROM items i
        LEFT JOIN sources s ON s.id = i.source_id
        LEFT JOIN ai_evaluations e ON e.item_id = i.id
        WHERE i.archived_at IS NULL
          AND datetime(i.published_at) >= datetime('now', '-24 hours')
        ORDER BY i.priority_score DESC, i.published_at DESC, i.id DESC
        LIMIT ?
      `).all(limit);
      return rows.map(mapItem).filter((item) => !isLowQualityResult({ title: item.title, url: item.url, summary: item.summary }));
    },
    unreadCount() {
      return this.list(1e3).filter((item) => item.status === "new" && item.readAt === null).length;
    },
    archived(limit = 100) {
      const rows = getDb().prepare(`SELECT
        i.*,
        i.interaction_likes,
        i.interaction_reposts,
        i.interaction_replies,
        i.interaction_views,
        i.interaction_danmaku,
        i.interaction_quotes,
        i.author_name,
        i.author_followers,
        i.author_verified,
        s.reliability_tier AS source_reliability,
        s.community_source AS source_community,
        e.relevance_score,
        e.credibility_score,
        e.novelty_score,
        e.hotness_score,
        e.is_impersonation_likely,
        e.summary AS ai_summary,
        e.reason,
        e.recommended_action,
        (SELECT json_group_array(DISTINCT provider_type) FROM item_evidence WHERE item_id = i.id) AS evidence_providers,
        (SELECT json_group_array(DISTINCT source_name) FROM item_evidence WHERE item_id = i.id) AS evidence_source_names
      FROM items i
      LEFT JOIN sources s ON s.id = i.source_id
      LEFT JOIN ai_evaluations e ON e.item_id = i.id
      WHERE i.archived_at IS NOT NULL
      ORDER BY i.archived_at DESC, i.id DESC
      LIMIT ?`).all(limit);
      return rows.map(mapItem);
    },
    restore(id) {
      return getDb().prepare("UPDATE items SET archived_at = NULL WHERE id = ?").run(id).changes > 0;
    },
    batchRestore(ids) {
      if (ids.length === 0) return 0;
      const placeholders = ids.map(() => "?").join(",");
      return getDb().prepare("UPDATE items SET archived_at = NULL WHERE id IN (" + placeholders + ")").run(...ids).changes;
    },
    batchDelete(ids) {
      if (ids.length === 0) return 0;
      const placeholders = ids.map(() => "?").join(",");
      return getDb().prepare("DELETE FROM items WHERE id IN (" + placeholders + ")").run(...ids).changes;
    },
    archiveOldReadItems() {
      return this.archiveStaleItems();
    },
    archiveStaleItems() {
      const db = getDb();
      const demoted = db.prepare(`
        UPDATE items
        SET status = 'watch'
        WHERE status = 'new'
          AND archived_at IS NULL
          AND datetime(published_at) < datetime('now', '-24 hours')
      `).run().changes;
      const archived = db.prepare(`
        UPDATE items
        SET archived_at = CURRENT_TIMESTAMP
        WHERE archived_at IS NULL
          AND datetime(published_at) < datetime('now', '-24 hours')
          AND (read_at IS NOT NULL OR status IN ('watch', 'ignored'))
      `).run().changes;
      return demoted + archived;
    },
    byId(id) {
      const row = getDb().prepare(`
        SELECT
          i.*,
          s.reliability_tier AS source_reliability,
          s.community_source AS source_community,
          e.relevance_score,
          e.credibility_score,
          e.novelty_score,
          e.hotness_score,
          e.is_impersonation_likely,
          e.summary AS ai_summary,
          e.reason,
          e.recommended_action,
          e.keyword_mentioned,
          e.relevance_summary,
          (
            SELECT json_group_array(DISTINCT provider_type)
            FROM item_evidence
            WHERE item_id = i.id
          ) AS evidence_providers,
          (
            SELECT json_group_array(DISTINCT source_name)
            FROM item_evidence
            WHERE item_id = i.id
          ) AS evidence_source_names
        FROM items i
        LEFT JOIN sources s ON s.id = i.source_id
        LEFT JOIN ai_evaluations e ON e.item_id = i.id
        WHERE i.id = ?
      `).get(id);
      return row ? mapItem(row) : null;
    },
    insert(input) {
      const db = getDb();
      const similarId = findSimilarItemId(db, input);
      if (similarId) {
        mergeItemEvidence(db, similarId, input);
        return { id: similarId, inserted: false };
      }
      try {
        const info = db.prepare(`
          INSERT INTO items (
            source_id, keyword_id, title, url, normalized_url, summary,
            published_at, fetched_at, matched_keyword, status,
            quality_score, quality_signals, evidence_count,
            interaction_likes, interaction_reposts, interaction_replies, interaction_views,
            interaction_danmaku, interaction_quotes,
            summary_source, interaction_source,
            author_name, author_followers, author_verified
          ) VALUES (
            @sourceId, @keywordId, @title, @url, @normalizedUrl, @summary,
            @publishedAt, @fetchedAt, @matchedKeyword, 'watch',
            @qualityScore, @qualitySignalsJson, 1,
            @interactionLikes, @interactionReposts, @interactionReplies, @interactionViews,
            @interactionDanmaku, @interactionQuotes,
            @summarySource, @interactionSource,
            @authorName, @authorFollowers, @authorVerified
          )
        `).run({
          ...input,
          qualitySignalsJson: JSON.stringify(input.qualitySignals),
          summarySource: input.summarySource ?? "rss",
          interactionSource: input.interactionSource ?? "none",
          interactionDanmaku: input.interactionDanmaku ?? 0,
          interactionQuotes: input.interactionQuotes ?? 0,
          authorName: input.authorName ?? null,
          authorFollowers: input.authorFollowers ?? 0,
          authorVerified: input.authorVerified ? 1 : 0
        });
        const itemId = Number(info.lastInsertRowid);
        mergeItemEvidence(db, itemId, input);
        return { id: itemId, inserted: true };
      } catch (error) {
        if (error instanceof Error && error.message.includes("UNIQUE")) {
          const row = db.prepare("SELECT id FROM items WHERE normalized_url = ?").get(input.normalizedUrl);
          if (!row) return null;
          mergeItemEvidence(db, row.id, input);
          return { id: row.id, inserted: false };
        }
        throw error;
      }
    },
    markRead(id) {
      return getDb().prepare("UPDATE items SET read_at = CURRENT_TIMESTAMP WHERE id = ?").run(id).changes > 0;
    },
    updateStatus(id, status) {
      getDb().prepare("UPDATE items SET status = ? WHERE id = ?").run(status, id);
    },
    addEvaluation(itemId, evaluation) {
      getDb().prepare(`
        INSERT INTO ai_evaluations (
          item_id, relevance_score, credibility_score, novelty_score, hotness_score,
          is_impersonation_likely, summary, reason, recommended_action,
          keyword_mentioned, relevance_summary, raw_json
        ) VALUES (
          @itemId, @relevanceScore, @credibilityScore, @noveltyScore, @hotnessScore,
          @isImpersonationLikely, @summary, @reason, @recommendedAction,
          @keywordMentioned, @relevanceSummary, @rawJson
        )
        ON CONFLICT(item_id) DO UPDATE SET
          relevance_score = excluded.relevance_score,
          credibility_score = excluded.credibility_score,
          novelty_score = excluded.novelty_score,
          hotness_score = excluded.hotness_score,
          is_impersonation_likely = excluded.is_impersonation_likely,
          summary = excluded.summary,
          reason = excluded.reason,
          recommended_action = excluded.recommended_action,
          keyword_mentioned = excluded.keyword_mentioned,
          relevance_summary = excluded.relevance_summary,
          raw_json = excluded.raw_json
      `).run({
        itemId,
        relevanceScore: evaluation.relevanceScore,
        credibilityScore: evaluation.credibilityScore,
        noveltyScore: evaluation.noveltyScore,
        hotnessScore: evaluation.hotnessScore,
        isImpersonationLikely: Number(evaluation.isImpersonationLikely),
        summary: evaluation.summary,
        reason: evaluation.reason,
        recommendedAction: evaluation.recommendedAction,
        keywordMentioned: evaluation.keywordMentioned ? 1 : 0,
        relevanceSummary: evaluation.relevanceSummary ?? "",
        rawJson: JSON.stringify(evaluation)
      });
    }
  },
  scanRuns: {
    start() {
      const info = getDb().prepare("INSERT INTO scan_runs (started_at, status) VALUES (?, 'running')").run((/* @__PURE__ */ new Date()).toISOString());
      return Number(info.lastInsertRowid);
    },
    finish(id, status, totals) {
      getDb().prepare(`
        UPDATE scan_runs
        SET finished_at = ?, status = ?, total_fetched = ?, total_inserted = ?, total_evaluated = ?, error = ?
        WHERE id = ?
      `).run((/* @__PURE__ */ new Date()).toISOString(), status, totals.fetched, totals.inserted, totals.evaluated, totals.error ?? null, id);
    },
    last() {
      const row = getDb().prepare("SELECT * FROM scan_runs ORDER BY id DESC LIMIT 1").get();
      return row ? mapScanRun(row) : null;
    }
  }
};
function mapKeyword(row) {
  return {
    id: row.id,
    term: row.term,
    scope: row.scope,
    enabled: Boolean(row.enabled),
    accountMode: Boolean(row.account_mode),
    accountPlatform: row.account_platform ?? "",
    accountUid: row.account_uid ?? "",
    accountUrl: row.account_url ?? "",
    createdAt: row.created_at
  };
}
function mapSource(row) {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    category: row.category,
    providerType: parseProviderType(row.provider_type),
    reliabilityTier: parseReliabilityTier(row.reliability_tier),
    communitySource: Boolean(row.community_source),
    minQualityScore: row.min_quality_score,
    enabled: Boolean(row.enabled),
    builtin: Boolean(row.builtin),
    createdAt: row.created_at
  };
}
function mapScanRun(row) {
  return {
    id: row.id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    status: row.status,
    totalFetched: row.total_fetched,
    totalInserted: row.total_inserted,
    totalEvaluated: row.total_evaluated,
    error: row.error
  };
}
function mapItem(row) {
  return {
    id: row.id,
    sourceId: row.source_id,
    keywordId: row.keyword_id,
    title: cleanArticleTitle(row.title),
    url: row.url,
    normalizedUrl: row.normalized_url,
    summary: cleanSummary(row.summary),
    publishedAt: row.published_at,
    fetchedAt: row.fetched_at,
    matchedKeyword: row.matched_keyword,
    readAt: row.read_at,
    status: row.status,
    qualityScore: row.quality_score,
    qualitySignals: parseJsonArray(row.quality_signals),
    evidenceCount: row.evidence_count,
    evidenceProviders: parseJsonArray(row.evidence_providers).map(parseProviderType),
    evidenceSourceNames: parseJsonArray(row.evidence_source_names),
    sourceReliability: row.source_reliability ? parseReliabilityTier(row.source_reliability) : null,
    communitySource: Boolean(row.source_community),
    interactionLikes: row.interaction_likes ?? 0,
    interactionReposts: row.interaction_reposts ?? 0,
    interactionReplies: row.interaction_replies ?? 0,
    interactionViews: row.interaction_views ?? 0,
    interactionDanmaku: row.interaction_danmaku ?? 0,
    interactionQuotes: row.interaction_quotes ?? 0,
    summarySource: parseSummarySource(row.summary_source),
    interactionSource: parseInteractionSource(row.interaction_source),
    priorityScore: row.priority_score ?? 0,
    freshnessScore: row.freshness_score ?? 0,
    authorName: row.author_name ?? null,
    authorFollowers: row.author_followers ?? 0,
    authorVerified: Boolean(row.author_verified),
    evaluation: row.relevance_score === null ? null : {
      relevanceScore: row.relevance_score,
      credibilityScore: row.credibility_score ?? 0,
      noveltyScore: row.novelty_score ?? 0,
      hotnessScore: row.hotness_score ?? 0,
      isImpersonationLikely: Boolean(row.is_impersonation_likely),
      summary: cleanSummary(row.ai_summary ?? ""),
      reason: cleanSummary(row.reason ?? ""),
      recommendedAction: row.recommended_action ?? "watch",
      keywordMentioned: Boolean(row.keyword_mentioned),
      relevanceSummary: row.relevance_summary ?? ""
    }
  };
}
function inferProviderType(url) {
  if (/news\.google\.com\/rss/i.test(url)) return "google_news";
  return "rss";
}
function parseProviderType(value) {
  if (value === "google_news" || value === "brave_search" || value === "bilibili_search" || value === "weibo_hot") return value;
  return "rss";
}
function parseReliabilityTier(value) {
  if (value === "official" || value === "community" || value === "search") return value;
  return "trusted";
}
function parseSummarySource(value) {
  if (value === "ai" || value === "metadata" || value === "title") return value;
  return "rss";
}
function parseInteractionSource(value) {
  if (value === "bilibili" || value === "zhihu" || value === "wechat" || value === "weibo" || value === "html" || value === "rss") return value;
  return "none";
}
function parseJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((entry) => String(entry)).filter(Boolean) : [];
  } catch {
    return [];
  }
}
function findSimilarItemId(db, input) {
  const rows = db.prepare(`
    SELECT id, title, published_at
    FROM items
    WHERE keyword_id = ?
    ORDER BY id DESC
    LIMIT 120
  `).all(input.keywordId);
  const inputTime = new Date(input.publishedAt).getTime();
  for (const row of rows) {
    const rowTime = new Date(row.published_at).getTime();
    const closeInTime = Number.isNaN(inputTime) || Number.isNaN(rowTime) || Math.abs(inputTime - rowTime) <= 36 * 60 * 60 * 1e3;
    if (closeInTime && titleSimilarity(row.title, input.title) >= 0.62) return row.id;
  }
  return null;
}
function mergeItemEvidence(db, itemId, input) {
  const source = repositories.sources.byId(input.sourceId);
  db.prepare(`
    INSERT INTO item_evidence (
      item_id, provider_type, source_id, source_name, query, rank,
      original_url, normalized_url, domain, title, summary, published_at
    ) VALUES (
      @itemId, @providerType, @sourceId, @sourceName, @query, @rank,
      @url, @normalizedUrl, @domain, @title, @summary, @publishedAt
    )
    ON CONFLICT(item_id, provider_type, source_id, normalized_url) DO UPDATE SET
      rank = MIN(rank, excluded.rank),
      summary = CASE WHEN length(excluded.summary) > length(summary) THEN excluded.summary ELSE summary END
  `).run({
    ...input,
    itemId,
    sourceName: source?.name ?? "\u672A\u77E5\u6765\u6E90",
    domain: hostname2(input.normalizedUrl)
  });
  const row = db.prepare("SELECT COUNT(*) AS count FROM item_evidence WHERE item_id = ?").get(itemId);
  db.prepare(`
    UPDATE items
    SET
      evidence_count = ?,
      quality_score = MAX(quality_score, ?),
      quality_signals = CASE
        WHEN ? > quality_score THEN ?
        ELSE quality_signals
      END
    WHERE id = ?
  `).run(row.count, input.qualityScore, input.qualityScore, JSON.stringify(input.qualitySignals), itemId);
}
function detectAccountInfo(term) {
  const url = extractUrlLike(term);
  const bilibiliUid = extractBilibiliUid(term);
  if (bilibiliUid) {
    return {
      accountMode: true,
      accountPlatform: "bilibili",
      accountUid: bilibiliUid,
      accountUrl: url
    };
  }
  const accountPatterns = [
    /公司$/,
    /团队$/,
    /工作室$/,
    /官方$/,
    /游戏$/,
    /科技$/,
    /平台$/,
    /引擎$/
  ];
  if (accountPatterns.some((p) => p.test(term))) {
    return { accountMode: true, accountPlatform: "", accountUid: "", accountUrl: url };
  }
  const chineseOnly = term.replace(/[^\u4e00-\u9fff]/g, "");
  if (chineseOnly.length >= 2 && chineseOnly.length <= 3 && !term.includes(" ")) {
    return { accountMode: true, accountPlatform: "", accountUid: "", accountUrl: url };
  }
  return { accountMode: false, accountPlatform: "", accountUid: "", accountUrl: url };
}
function extractUrlLike(value) {
  const match = value.match(/https?:\/\/\S+/i);
  return match?.[0] ?? "";
}
function extractBilibiliUid(value) {
  const spaceMatch = value.match(/space\.bilibili\.com\/(\d+)/i);
  if (spaceMatch) return spaceMatch[1];
  const uidMatch = value.match(/\buid[:：\s]*(\d{3,})\b/i);
  if (uidMatch) return uidMatch[1];
  return "";
}
function hostname2(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

// node_modules/@libsql/core/lib-esm/api.js
var LibsqlError = class extends Error {
  /** Machine-readable error code. */
  code;
  /** Extended error code with more specific information (e.g., SQLITE_CONSTRAINT_PRIMARYKEY). */
  extendedCode;
  /** Raw numeric error code */
  rawCode;
  constructor(message, code, extendedCode, rawCode, cause) {
    if (code !== void 0) {
      message = `${code}: ${message}`;
    }
    super(message, { cause });
    this.code = code;
    this.extendedCode = extendedCode;
    this.rawCode = rawCode;
    this.name = "LibsqlError";
  }
};
var LibsqlBatchError = class extends LibsqlError {
  /** The zero-based index of the statement that failed in the batch. */
  statementIndex;
  constructor(message, statementIndex, code, extendedCode, rawCode, cause) {
    super(message, code, extendedCode, rawCode, cause);
    this.statementIndex = statementIndex;
    this.name = "LibsqlBatchError";
  }
};

// node_modules/@libsql/core/lib-esm/uri.js
function parseUri(text2) {
  const match = URI_RE.exec(text2);
  if (match === null) {
    throw new LibsqlError(`The URL '${text2}' is not in a valid format`, "URL_INVALID");
  }
  const groups = match.groups;
  const scheme = groups["scheme"];
  const authority = groups["authority"] !== void 0 ? parseAuthority(groups["authority"]) : void 0;
  const path4 = percentDecode(groups["path"]);
  const query = groups["query"] !== void 0 ? parseQuery(groups["query"]) : void 0;
  const fragment = groups["fragment"] !== void 0 ? percentDecode(groups["fragment"]) : void 0;
  return { scheme, authority, path: path4, query, fragment };
}
var URI_RE = (() => {
  const SCHEME = "(?<scheme>[A-Za-z][A-Za-z.+-]*)";
  const AUTHORITY = "(?<authority>[^/?#]*)";
  const PATH = "(?<path>[^?#]*)";
  const QUERY = "(?<query>[^#]*)";
  const FRAGMENT = "(?<fragment>.*)";
  return new RegExp(`^${SCHEME}:(//${AUTHORITY})?${PATH}(\\?${QUERY})?(#${FRAGMENT})?$`, "su");
})();
function parseAuthority(text2) {
  const match = AUTHORITY_RE.exec(text2);
  if (match === null) {
    throw new LibsqlError("The authority part of the URL is not in a valid format", "URL_INVALID");
  }
  const groups = match.groups;
  const host = percentDecode(groups["host_br"] ?? groups["host"]);
  const port = groups["port"] ? parseInt(groups["port"], 10) : void 0;
  const userinfo = groups["username"] !== void 0 ? {
    username: percentDecode(groups["username"]),
    password: groups["password"] !== void 0 ? percentDecode(groups["password"]) : void 0
  } : void 0;
  return { host, port, userinfo };
}
var AUTHORITY_RE = (() => {
  return new RegExp(`^((?<username>[^:]*)(:(?<password>.*))?@)?((?<host>[^:\\[\\]]*)|(\\[(?<host_br>[^\\[\\]]*)\\]))(:(?<port>[0-9]*))?$`, "su");
})();
function parseQuery(text2) {
  const sequences = text2.split("&");
  const pairs = [];
  for (const sequence of sequences) {
    if (sequence === "") {
      continue;
    }
    let key;
    let value;
    const splitIdx = sequence.indexOf("=");
    if (splitIdx < 0) {
      key = sequence;
      value = "";
    } else {
      key = sequence.substring(0, splitIdx);
      value = sequence.substring(splitIdx + 1);
    }
    pairs.push({
      key: percentDecode(key.replaceAll("+", " ")),
      value: percentDecode(value.replaceAll("+", " "))
    });
  }
  return { pairs };
}
function percentDecode(text2) {
  try {
    return decodeURIComponent(text2);
  } catch (e) {
    if (e instanceof URIError) {
      throw new LibsqlError(`URL component has invalid percent encoding: ${e}`, "URL_INVALID", void 0, void 0, e);
    }
    throw e;
  }
}
function encodeBaseUrl(scheme, authority, path4) {
  if (authority === void 0) {
    throw new LibsqlError(`URL with scheme ${JSON.stringify(scheme + ":")} requires authority (the "//" part)`, "URL_INVALID");
  }
  const schemeText = `${scheme}:`;
  const hostText = encodeHost(authority.host);
  const portText = encodePort(authority.port);
  const userinfoText = encodeUserinfo(authority.userinfo);
  const authorityText = `//${userinfoText}${hostText}${portText}`;
  let pathText = path4.split("/").map(encodeURIComponent).join("/");
  if (pathText !== "" && !pathText.startsWith("/")) {
    pathText = "/" + pathText;
  }
  return new URL(`${schemeText}${authorityText}${pathText}`);
}
function encodeHost(host) {
  return host.includes(":") ? `[${encodeURI(host)}]` : encodeURI(host);
}
function encodePort(port) {
  return port !== void 0 ? `:${port}` : "";
}
function encodeUserinfo(userinfo) {
  if (userinfo === void 0) {
    return "";
  }
  const usernameText = encodeURIComponent(userinfo.username);
  const passwordText = userinfo.password !== void 0 ? `:${encodeURIComponent(userinfo.password)}` : "";
  return `${usernameText}${passwordText}@`;
}

// node_modules/js-base64/base64.mjs
var version = "3.7.8";
var VERSION = version;
var _hasBuffer = typeof Buffer === "function";
var _TD = typeof TextDecoder === "function" ? new TextDecoder() : void 0;
var _TE = typeof TextEncoder === "function" ? new TextEncoder() : void 0;
var b64ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var b64chs = Array.prototype.slice.call(b64ch);
var b64tab = ((a) => {
  let tab = {};
  a.forEach((c, i) => tab[c] = i);
  return tab;
})(b64chs);
var b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
var _fromCC = String.fromCharCode.bind(String);
var _U8Afrom = typeof Uint8Array.from === "function" ? Uint8Array.from.bind(Uint8Array) : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
var _mkUriSafe = (src) => src.replace(/=/g, "").replace(/[+\/]/g, (m0) => m0 == "+" ? "-" : "_");
var _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, "");
var btoaPolyfill = (bin) => {
  let u32, c0, c1, c2, asc = "";
  const pad = bin.length % 3;
  for (let i = 0; i < bin.length; ) {
    if ((c0 = bin.charCodeAt(i++)) > 255 || (c1 = bin.charCodeAt(i++)) > 255 || (c2 = bin.charCodeAt(i++)) > 255)
      throw new TypeError("invalid character found");
    u32 = c0 << 16 | c1 << 8 | c2;
    asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
  }
  return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
};
var _btoa = typeof btoa === "function" ? (bin) => btoa(bin) : _hasBuffer ? (bin) => Buffer.from(bin, "binary").toString("base64") : btoaPolyfill;
var _fromUint8Array = _hasBuffer ? (u8a) => Buffer.from(u8a).toString("base64") : (u8a) => {
  const maxargs = 4096;
  let strs = [];
  for (let i = 0, l = u8a.length; i < l; i += maxargs) {
    strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
  }
  return _btoa(strs.join(""));
};
var fromUint8Array = (u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
var cb_utob = (c) => {
  if (c.length < 2) {
    var cc = c.charCodeAt(0);
    return cc < 128 ? c : cc < 2048 ? _fromCC(192 | cc >>> 6) + _fromCC(128 | cc & 63) : _fromCC(224 | cc >>> 12 & 15) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
  } else {
    var cc = 65536 + (c.charCodeAt(0) - 55296) * 1024 + (c.charCodeAt(1) - 56320);
    return _fromCC(240 | cc >>> 18 & 7) + _fromCC(128 | cc >>> 12 & 63) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
  }
};
var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
var utob = (u) => u.replace(re_utob, cb_utob);
var _encode = _hasBuffer ? (s) => Buffer.from(s, "utf8").toString("base64") : _TE ? (s) => _fromUint8Array(_TE.encode(s)) : (s) => _btoa(utob(s));
var encode = (src, urlsafe = false) => urlsafe ? _mkUriSafe(_encode(src)) : _encode(src);
var encodeURI2 = (src) => encode(src, true);
var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
var cb_btou = (cccc) => {
  switch (cccc.length) {
    case 4:
      var cp = (7 & cccc.charCodeAt(0)) << 18 | (63 & cccc.charCodeAt(1)) << 12 | (63 & cccc.charCodeAt(2)) << 6 | 63 & cccc.charCodeAt(3), offset = cp - 65536;
      return _fromCC((offset >>> 10) + 55296) + _fromCC((offset & 1023) + 56320);
    case 3:
      return _fromCC((15 & cccc.charCodeAt(0)) << 12 | (63 & cccc.charCodeAt(1)) << 6 | 63 & cccc.charCodeAt(2));
    default:
      return _fromCC((31 & cccc.charCodeAt(0)) << 6 | 63 & cccc.charCodeAt(1));
  }
};
var btou = (b) => b.replace(re_btou, cb_btou);
var atobPolyfill = (asc) => {
  asc = asc.replace(/\s+/g, "");
  if (!b64re.test(asc))
    throw new TypeError("malformed base64.");
  asc += "==".slice(2 - (asc.length & 3));
  let u24, r1, r2;
  let binArray = [];
  for (let i = 0; i < asc.length; ) {
    u24 = b64tab[asc.charAt(i++)] << 18 | b64tab[asc.charAt(i++)] << 12 | (r1 = b64tab[asc.charAt(i++)]) << 6 | (r2 = b64tab[asc.charAt(i++)]);
    if (r1 === 64) {
      binArray.push(_fromCC(u24 >> 16 & 255));
    } else if (r2 === 64) {
      binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
    } else {
      binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
    }
  }
  return binArray.join("");
};
var _atob = typeof atob === "function" ? (asc) => atob(_tidyB64(asc)) : _hasBuffer ? (asc) => Buffer.from(asc, "base64").toString("binary") : atobPolyfill;
var _toUint8Array = _hasBuffer ? (a) => _U8Afrom(Buffer.from(a, "base64")) : (a) => _U8Afrom(_atob(a).split("").map((c) => c.charCodeAt(0)));
var toUint8Array = (a) => _toUint8Array(_unURI(a));
var _decode = _hasBuffer ? (a) => Buffer.from(a, "base64").toString("utf8") : _TD ? (a) => _TD.decode(_toUint8Array(a)) : (a) => btou(_atob(a));
var _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == "-" ? "+" : "/"));
var decode = (src) => _decode(_unURI(src));
var isValid = (src) => {
  if (typeof src !== "string")
    return false;
  const s = src.replace(/\s+/g, "").replace(/={0,2}$/, "");
  return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
};
var _noEnum = (v) => {
  return {
    value: v,
    enumerable: false,
    writable: true,
    configurable: true
  };
};
var extendString = function() {
  const _add = (name, body) => Object.defineProperty(String.prototype, name, _noEnum(body));
  _add("fromBase64", function() {
    return decode(this);
  });
  _add("toBase64", function(urlsafe) {
    return encode(this, urlsafe);
  });
  _add("toBase64URI", function() {
    return encode(this, true);
  });
  _add("toBase64URL", function() {
    return encode(this, true);
  });
  _add("toUint8Array", function() {
    return toUint8Array(this);
  });
};
var extendUint8Array = function() {
  const _add = (name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
  _add("toBase64", function(urlsafe) {
    return fromUint8Array(this, urlsafe);
  });
  _add("toBase64URI", function() {
    return fromUint8Array(this, true);
  });
  _add("toBase64URL", function() {
    return fromUint8Array(this, true);
  });
};
var extendBuiltins = () => {
  extendString();
  extendUint8Array();
};
var gBase64 = {
  version,
  VERSION,
  atob: _atob,
  atobPolyfill,
  btoa: _btoa,
  btoaPolyfill,
  fromBase64: decode,
  toBase64: encode,
  encode,
  encodeURI: encodeURI2,
  encodeURL: encodeURI2,
  utob,
  btou,
  decode,
  isValid,
  fromUint8Array,
  toUint8Array,
  extendString,
  extendUint8Array,
  extendBuiltins
};

// node_modules/@libsql/core/lib-esm/util.js
var supportedUrlLink = "https://github.com/libsql/libsql-client-ts#supported-urls";
function transactionModeToBegin(mode) {
  if (mode === "write") {
    return "BEGIN IMMEDIATE";
  } else if (mode === "read") {
    return "BEGIN TRANSACTION READONLY";
  } else if (mode === "deferred") {
    return "BEGIN DEFERRED";
  } else {
    throw RangeError('Unknown transaction mode, supported values are "write", "read" and "deferred"');
  }
}
var ResultSetImpl = class {
  columns;
  columnTypes;
  rows;
  rowsAffected;
  lastInsertRowid;
  constructor(columns, columnTypes, rows, rowsAffected, lastInsertRowid2) {
    this.columns = columns;
    this.columnTypes = columnTypes;
    this.rows = rows;
    this.rowsAffected = rowsAffected;
    this.lastInsertRowid = lastInsertRowid2;
  }
  toJSON() {
    return {
      columns: this.columns,
      columnTypes: this.columnTypes,
      rows: this.rows.map(rowToJson),
      rowsAffected: this.rowsAffected,
      lastInsertRowid: this.lastInsertRowid !== void 0 ? "" + this.lastInsertRowid : null
    };
  }
};
function rowToJson(row) {
  return Array.prototype.map.call(row, valueToJson);
}
function valueToJson(value) {
  if (typeof value === "bigint") {
    return "" + value;
  } else if (value instanceof ArrayBuffer) {
    return gBase64.fromUint8Array(new Uint8Array(value));
  } else {
    return value;
  }
}

// node_modules/@libsql/core/lib-esm/config.js
var inMemoryMode = ":memory:";
function isInMemoryConfig(config) {
  return config.scheme === "file" && (config.path === ":memory:" || config.path.startsWith(":memory:?"));
}
function expandConfig(config, preferHttp) {
  if (typeof config !== "object") {
    throw new TypeError(`Expected client configuration as object, got ${typeof config}`);
  }
  let { url, authToken, tls, intMode, concurrency } = config;
  concurrency = Math.max(0, concurrency || 20);
  intMode ??= "number";
  let connectionQueryParams = [];
  if (url === inMemoryMode) {
    url = "file::memory:";
  }
  const uri = parseUri(url);
  const originalUriScheme = uri.scheme.toLowerCase();
  const isInMemoryMode = originalUriScheme === "file" && uri.path === inMemoryMode && uri.authority === void 0;
  let queryParamsDef;
  if (isInMemoryMode) {
    queryParamsDef = {
      cache: {
        values: ["shared", "private"],
        update: (key, value) => connectionQueryParams.push(`${key}=${value}`)
      }
    };
  } else {
    queryParamsDef = {
      tls: {
        values: ["0", "1"],
        update: (_, value) => tls = value === "1"
      },
      authToken: {
        update: (_, value) => authToken = value
      }
    };
  }
  for (const { key, value } of uri.query?.pairs ?? []) {
    if (!Object.hasOwn(queryParamsDef, key)) {
      throw new LibsqlError(`Unsupported URL query parameter ${JSON.stringify(key)}`, "URL_PARAM_NOT_SUPPORTED");
    }
    const queryParamDef = queryParamsDef[key];
    if (queryParamDef.values !== void 0 && !queryParamDef.values.includes(value)) {
      throw new LibsqlError(`Unknown value for the "${key}" query argument: ${JSON.stringify(value)}. Supported values are: [${queryParamDef.values.map((x) => '"' + x + '"').join(", ")}]`, "URL_INVALID");
    }
    if (queryParamDef.update !== void 0) {
      queryParamDef?.update(key, value);
    }
  }
  const connectionQueryParamsString = connectionQueryParams.length === 0 ? "" : `?${connectionQueryParams.join("&")}`;
  const path4 = uri.path + connectionQueryParamsString;
  let scheme;
  if (originalUriScheme === "libsql") {
    if (tls === false) {
      if (uri.authority?.port === void 0) {
        throw new LibsqlError('A "libsql:" URL with ?tls=0 must specify an explicit port', "URL_INVALID");
      }
      scheme = preferHttp ? "http" : "ws";
    } else {
      scheme = preferHttp ? "https" : "wss";
    }
  } else {
    scheme = originalUriScheme;
  }
  if (scheme === "http" || scheme === "ws") {
    tls ??= false;
  } else {
    tls ??= true;
  }
  if (scheme !== "http" && scheme !== "ws" && scheme !== "https" && scheme !== "wss" && scheme !== "file") {
    throw new LibsqlError(`The client supports only "libsql:", "wss:", "ws:", "https:", "http:" and "file:" URLs, got ${JSON.stringify(uri.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  if (intMode !== "number" && intMode !== "bigint" && intMode !== "string") {
    throw new TypeError(`Invalid value for intMode, expected "number", "bigint" or "string", got ${JSON.stringify(intMode)}`);
  }
  if (uri.fragment !== void 0) {
    throw new LibsqlError(`URL fragments are not supported: ${JSON.stringify("#" + uri.fragment)}`, "URL_INVALID");
  }
  if (isInMemoryMode) {
    return {
      scheme: "file",
      tls: false,
      path: path4,
      intMode,
      concurrency,
      syncUrl: config.syncUrl,
      syncInterval: config.syncInterval,
      readYourWrites: config.readYourWrites,
      offline: config.offline,
      fetch: config.fetch,
      authToken: void 0,
      encryptionKey: void 0,
      remoteEncryptionKey: void 0,
      authority: void 0
    };
  }
  return {
    scheme,
    tls,
    authority: uri.authority,
    path: path4,
    authToken,
    intMode,
    concurrency,
    encryptionKey: config.encryptionKey,
    remoteEncryptionKey: config.remoteEncryptionKey,
    syncUrl: config.syncUrl,
    syncInterval: config.syncInterval,
    readYourWrites: config.readYourWrites,
    offline: config.offline,
    fetch: config.fetch
  };
}

// node_modules/@libsql/client/lib-esm/sqlite3.js
var import_libsql = __toESM(require_libsql(), 1);
import { Buffer as Buffer2 } from "node:buffer";
function _createClient(config) {
  if (config.scheme !== "file") {
    throw new LibsqlError(`URL scheme ${JSON.stringify(config.scheme + ":")} is not supported by the local sqlite3 client. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  const authority = config.authority;
  if (authority !== void 0) {
    const host = authority.host.toLowerCase();
    if (host !== "" && host !== "localhost") {
      throw new LibsqlError(`Invalid host in file URL: ${JSON.stringify(authority.host)}. A "file:" URL with an absolute path should start with one slash ("file:/absolute/path.db") or with three slashes ("file:///absolute/path.db"). For more information, please read ${supportedUrlLink}`, "URL_INVALID");
    }
    if (authority.port !== void 0) {
      throw new LibsqlError("File URL cannot have a port", "URL_INVALID");
    }
    if (authority.userinfo !== void 0) {
      throw new LibsqlError("File URL cannot have username and password", "URL_INVALID");
    }
  }
  let isInMemory = isInMemoryConfig(config);
  if (isInMemory && config.syncUrl) {
    throw new LibsqlError(`Embedded replica must use file for local db but URI with in-memory mode were provided instead: ${config.path}`, "URL_INVALID");
  }
  let path4 = config.path;
  if (isInMemory) {
    path4 = `${config.scheme}:${config.path}`;
  }
  const options = {
    authToken: config.authToken,
    encryptionKey: config.encryptionKey,
    remoteEncryptionKey: config.remoteEncryptionKey,
    syncUrl: config.syncUrl,
    syncPeriod: config.syncInterval,
    readYourWrites: config.readYourWrites,
    offline: config.offline
  };
  const db = new import_libsql.default(path4, options);
  executeStmt(db, "SELECT 1 AS checkThatTheDatabaseCanBeOpened", config.intMode);
  return new Sqlite3Client(path4, options, db, config.intMode);
}
var Sqlite3Client = class {
  #path;
  #options;
  #db;
  #intMode;
  closed;
  protocol;
  /** @private */
  constructor(path4, options, db, intMode) {
    this.#path = path4;
    this.#options = options;
    this.#db = db;
    this.#intMode = intMode;
    this.closed = false;
    this.protocol = "file";
  }
  async execute(stmtOrSql, args) {
    let stmt;
    if (typeof stmtOrSql === "string") {
      stmt = {
        sql: stmtOrSql,
        args: args || []
      };
    } else {
      stmt = stmtOrSql;
    }
    this.#checkNotClosed();
    return executeStmt(this.#getDb(), stmt, this.#intMode);
  }
  async batch(stmts, mode = "deferred") {
    this.#checkNotClosed();
    const db = this.#getDb();
    try {
      executeStmt(db, transactionModeToBegin(mode), this.#intMode);
      const resultSets = [];
      for (let i = 0; i < stmts.length; i++) {
        try {
          if (!db.inTransaction) {
            throw new LibsqlBatchError("The transaction has been rolled back", i, "TRANSACTION_CLOSED");
          }
          const stmt = stmts[i];
          const normalizedStmt = Array.isArray(stmt) ? { sql: stmt[0], args: stmt[1] || [] } : stmt;
          resultSets.push(executeStmt(db, normalizedStmt, this.#intMode));
        } catch (e) {
          if (e instanceof LibsqlBatchError) {
            throw e;
          }
          if (e instanceof LibsqlError) {
            throw new LibsqlBatchError(e.message, i, e.code, e.extendedCode, e.rawCode, e.cause instanceof Error ? e.cause : void 0);
          }
          throw e;
        }
      }
      executeStmt(db, "COMMIT", this.#intMode);
      return resultSets;
    } finally {
      if (db.inTransaction) {
        executeStmt(db, "ROLLBACK", this.#intMode);
      }
    }
  }
  async migrate(stmts) {
    this.#checkNotClosed();
    const db = this.#getDb();
    try {
      executeStmt(db, "PRAGMA foreign_keys=off", this.#intMode);
      executeStmt(db, transactionModeToBegin("deferred"), this.#intMode);
      const resultSets = [];
      for (let i = 0; i < stmts.length; i++) {
        try {
          if (!db.inTransaction) {
            throw new LibsqlBatchError("The transaction has been rolled back", i, "TRANSACTION_CLOSED");
          }
          resultSets.push(executeStmt(db, stmts[i], this.#intMode));
        } catch (e) {
          if (e instanceof LibsqlBatchError) {
            throw e;
          }
          if (e instanceof LibsqlError) {
            throw new LibsqlBatchError(e.message, i, e.code, e.extendedCode, e.rawCode, e.cause instanceof Error ? e.cause : void 0);
          }
          throw e;
        }
      }
      executeStmt(db, "COMMIT", this.#intMode);
      return resultSets;
    } finally {
      if (db.inTransaction) {
        executeStmt(db, "ROLLBACK", this.#intMode);
      }
      executeStmt(db, "PRAGMA foreign_keys=on", this.#intMode);
    }
  }
  async transaction(mode = "write") {
    const db = this.#getDb();
    executeStmt(db, transactionModeToBegin(mode), this.#intMode);
    this.#db = null;
    return new Sqlite3Transaction(db, this.#intMode);
  }
  async executeMultiple(sql) {
    this.#checkNotClosed();
    const db = this.#getDb();
    try {
      return executeMultiple(db, sql);
    } finally {
      if (db.inTransaction) {
        executeStmt(db, "ROLLBACK", this.#intMode);
      }
    }
  }
  async sync() {
    this.#checkNotClosed();
    const rep = await this.#getDb().sync();
    return {
      frames_synced: rep.frames_synced,
      frame_no: rep.frame_no
    };
  }
  async reconnect() {
    try {
      if (!this.closed && this.#db !== null) {
        this.#db.close();
      }
    } finally {
      this.#db = new import_libsql.default(this.#path, this.#options);
      this.closed = false;
    }
  }
  close() {
    this.closed = true;
    if (this.#db !== null) {
      this.#db.close();
      this.#db = null;
    }
  }
  #checkNotClosed() {
    if (this.closed) {
      throw new LibsqlError("The client is closed", "CLIENT_CLOSED");
    }
  }
  // Lazily creates the database connection and returns it
  #getDb() {
    if (this.#db === null) {
      this.#db = new import_libsql.default(this.#path, this.#options);
    }
    return this.#db;
  }
};
var Sqlite3Transaction = class {
  #database;
  #intMode;
  /** @private */
  constructor(database, intMode) {
    this.#database = database;
    this.#intMode = intMode;
  }
  async execute(stmtOrSql, args) {
    let stmt;
    if (typeof stmtOrSql === "string") {
      stmt = {
        sql: stmtOrSql,
        args: args || []
      };
    } else {
      stmt = stmtOrSql;
    }
    this.#checkNotClosed();
    return executeStmt(this.#database, stmt, this.#intMode);
  }
  async batch(stmts) {
    const resultSets = [];
    for (let i = 0; i < stmts.length; i++) {
      try {
        this.#checkNotClosed();
        const stmt = stmts[i];
        const normalizedStmt = Array.isArray(stmt) ? { sql: stmt[0], args: stmt[1] || [] } : stmt;
        resultSets.push(executeStmt(this.#database, normalizedStmt, this.#intMode));
      } catch (e) {
        if (e instanceof LibsqlBatchError) {
          throw e;
        }
        if (e instanceof LibsqlError) {
          throw new LibsqlBatchError(e.message, i, e.code, e.extendedCode, e.rawCode, e.cause instanceof Error ? e.cause : void 0);
        }
        throw e;
      }
    }
    return resultSets;
  }
  async executeMultiple(sql) {
    this.#checkNotClosed();
    return executeMultiple(this.#database, sql);
  }
  async rollback() {
    if (!this.#database.open) {
      return;
    }
    this.#checkNotClosed();
    executeStmt(this.#database, "ROLLBACK", this.#intMode);
  }
  async commit() {
    this.#checkNotClosed();
    executeStmt(this.#database, "COMMIT", this.#intMode);
  }
  close() {
    if (this.#database.inTransaction) {
      executeStmt(this.#database, "ROLLBACK", this.#intMode);
    }
  }
  get closed() {
    return !this.#database.inTransaction;
  }
  #checkNotClosed() {
    if (this.closed) {
      throw new LibsqlError("The transaction is closed", "TRANSACTION_CLOSED");
    }
  }
};
function executeStmt(db, stmt, intMode) {
  let sql;
  let args;
  if (typeof stmt === "string") {
    sql = stmt;
    args = [];
  } else {
    sql = stmt.sql;
    if (Array.isArray(stmt.args)) {
      args = stmt.args.map((value) => valueToSql(value, intMode));
    } else {
      args = {};
      for (const name in stmt.args) {
        const argName = name[0] === "@" || name[0] === "$" || name[0] === ":" ? name.substring(1) : name;
        args[argName] = valueToSql(stmt.args[name], intMode);
      }
    }
  }
  try {
    const sqlStmt = db.prepare(sql);
    sqlStmt.safeIntegers(true);
    let returnsData = true;
    try {
      sqlStmt.raw(true);
    } catch {
      returnsData = false;
    }
    if (returnsData) {
      const columns = Array.from(sqlStmt.columns().map((col) => col.name));
      const columnTypes = Array.from(sqlStmt.columns().map((col) => col.type ?? ""));
      const rows = sqlStmt.all(args).map((sqlRow) => {
        return rowFromSql(sqlRow, columns, intMode);
      });
      const rowsAffected = 0;
      const lastInsertRowid2 = void 0;
      return new ResultSetImpl(columns, columnTypes, rows, rowsAffected, lastInsertRowid2);
    } else {
      const info = sqlStmt.run(args);
      const rowsAffected = info.changes;
      const lastInsertRowid2 = BigInt(info.lastInsertRowid);
      return new ResultSetImpl([], [], [], rowsAffected, lastInsertRowid2);
    }
  } catch (e) {
    throw mapSqliteError(e);
  }
}
function rowFromSql(sqlRow, columns, intMode) {
  const row = {};
  Object.defineProperty(row, "length", { value: sqlRow.length });
  for (let i = 0; i < sqlRow.length; ++i) {
    const value = valueFromSql(sqlRow[i], intMode);
    Object.defineProperty(row, i, { value });
    const column = columns[i];
    if (!Object.hasOwn(row, column)) {
      Object.defineProperty(row, column, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
  }
  return row;
}
function valueFromSql(sqlValue, intMode) {
  if (typeof sqlValue === "bigint") {
    if (intMode === "number") {
      if (sqlValue < minSafeBigint || sqlValue > maxSafeBigint) {
        throw new RangeError("Received integer which cannot be safely represented as a JavaScript number");
      }
      return Number(sqlValue);
    } else if (intMode === "bigint") {
      return sqlValue;
    } else if (intMode === "string") {
      return "" + sqlValue;
    } else {
      throw new Error("Invalid value for IntMode");
    }
  } else if (sqlValue instanceof Buffer2) {
    return sqlValue.buffer;
  }
  return sqlValue;
}
var minSafeBigint = -9007199254740991n;
var maxSafeBigint = 9007199254740991n;
function valueToSql(value, intMode) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new RangeError("Only finite numbers (not Infinity or NaN) can be passed as arguments");
    }
    return value;
  } else if (typeof value === "bigint") {
    if (value < minInteger || value > maxInteger) {
      throw new RangeError("bigint is too large to be represented as a 64-bit integer and passed as argument");
    }
    return value;
  } else if (typeof value === "boolean") {
    switch (intMode) {
      case "bigint":
        return value ? 1n : 0n;
      case "string":
        return value ? "1" : "0";
      default:
        return value ? 1 : 0;
    }
  } else if (value instanceof ArrayBuffer) {
    return Buffer2.from(value);
  } else if (value instanceof Date) {
    return value.valueOf();
  } else if (value === void 0) {
    throw new TypeError("undefined cannot be passed as argument to the database");
  } else {
    return value;
  }
}
var minInteger = -9223372036854775808n;
var maxInteger = 9223372036854775807n;
function executeMultiple(db, sql) {
  try {
    db.exec(sql);
  } catch (e) {
    throw mapSqliteError(e);
  }
}
function mapSqliteError(e) {
  if (e instanceof import_libsql.default.SqliteError) {
    const extendedCode = e.code;
    const code = mapToBaseCode(e.rawCode);
    return new LibsqlError(e.message, code, extendedCode, e.rawCode, e);
  }
  return e;
}
function mapToBaseCode(rawCode) {
  if (rawCode === void 0) {
    return "SQLITE_UNKNOWN";
  }
  const baseCode = rawCode & 255;
  return sqliteErrorCodes[baseCode] ?? `SQLITE_UNKNOWN_${baseCode.toString()}`;
}
var sqliteErrorCodes = {
  1: "SQLITE_ERROR",
  2: "SQLITE_INTERNAL",
  3: "SQLITE_PERM",
  4: "SQLITE_ABORT",
  5: "SQLITE_BUSY",
  6: "SQLITE_LOCKED",
  7: "SQLITE_NOMEM",
  8: "SQLITE_READONLY",
  9: "SQLITE_INTERRUPT",
  10: "SQLITE_IOERR",
  11: "SQLITE_CORRUPT",
  12: "SQLITE_NOTFOUND",
  13: "SQLITE_FULL",
  14: "SQLITE_CANTOPEN",
  15: "SQLITE_PROTOCOL",
  16: "SQLITE_EMPTY",
  17: "SQLITE_SCHEMA",
  18: "SQLITE_TOOBIG",
  19: "SQLITE_CONSTRAINT",
  20: "SQLITE_MISMATCH",
  21: "SQLITE_MISUSE",
  22: "SQLITE_NOLFS",
  23: "SQLITE_AUTH",
  24: "SQLITE_FORMAT",
  25: "SQLITE_RANGE",
  26: "SQLITE_NOTADB",
  27: "SQLITE_NOTICE",
  28: "SQLITE_WARNING"
};

// node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);

// node_modules/@libsql/hrana-client/lib-esm/client.js
var Client = class {
  /** @private */
  constructor() {
    this.intMode = "number";
  }
  /** Representation of integers returned from the database. See {@link IntMode}.
   *
   * This value is inherited by {@link Stream} objects created with {@link openStream}, but you can
   * override the integer mode for every stream by setting {@link Stream.intMode} on the stream.
   */
  intMode;
};

// node_modules/@libsql/hrana-client/lib-esm/errors.js
var ClientError = class extends Error {
  /** @private */
  constructor(message) {
    super(message);
    this.name = "ClientError";
  }
};
var ProtoError = class extends ClientError {
  /** @private */
  constructor(message) {
    super(message);
    this.name = "ProtoError";
  }
};
var ResponseError = class extends ClientError {
  code;
  /** @internal */
  proto;
  /** @private */
  constructor(message, protoError) {
    super(message);
    this.name = "ResponseError";
    this.code = protoError.code;
    this.proto = protoError;
    this.stack = void 0;
  }
};
var ClosedError = class extends ClientError {
  /** @private */
  constructor(message, cause) {
    if (cause !== void 0) {
      super(`${message}: ${cause}`);
      this.cause = cause;
    } else {
      super(message);
    }
    this.name = "ClosedError";
  }
};
var WebSocketUnsupportedError = class extends ClientError {
  /** @private */
  constructor(message) {
    super(message);
    this.name = "WebSocketUnsupportedError";
  }
};
var WebSocketError = class extends ClientError {
  /** @private */
  constructor(message) {
    super(message);
    this.name = "WebSocketError";
  }
};
var HttpServerError = class extends ClientError {
  status;
  /** @private */
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "HttpServerError";
  }
};
var ProtocolVersionError = class extends ClientError {
  /** @private */
  constructor(message) {
    super(message);
    this.name = "ProtocolVersionError";
  }
};
var InternalError = class extends ClientError {
  /** @private */
  constructor(message) {
    super(message);
    this.name = "InternalError";
  }
};
var MisuseError = class extends ClientError {
  /** @private */
  constructor(message) {
    super(message);
    this.name = "MisuseError";
  }
};

// node_modules/@libsql/hrana-client/lib-esm/encoding/json/decode.js
function string(value) {
  if (typeof value === "string") {
    return value;
  }
  throw typeError(value, "string");
}
function stringOpt(value) {
  if (value === null || value === void 0) {
    return void 0;
  } else if (typeof value === "string") {
    return value;
  }
  throw typeError(value, "string or null");
}
function number(value) {
  if (typeof value === "number") {
    return value;
  }
  throw typeError(value, "number");
}
function boolean(value) {
  if (typeof value === "boolean") {
    return value;
  }
  throw typeError(value, "boolean");
}
function array(value) {
  if (Array.isArray(value)) {
    return value;
  }
  throw typeError(value, "array");
}
function object(value) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  throw typeError(value, "object");
}
function arrayObjectsMap(value, fun) {
  return array(value).map((elemValue) => fun(object(elemValue)));
}
function typeError(value, expected) {
  if (value === void 0) {
    return new ProtoError(`Expected ${expected}, but the property was missing`);
  }
  let received = typeof value;
  if (value === null) {
    received = "null";
  } else if (Array.isArray(value)) {
    received = "array";
  }
  return new ProtoError(`Expected ${expected}, received ${received}`);
}
function readJsonObject(value, fun) {
  return fun(object(value));
}

// node_modules/@libsql/hrana-client/lib-esm/encoding/json/encode.js
var ObjectWriter = class {
  #output;
  #isFirst;
  constructor(output) {
    this.#output = output;
    this.#isFirst = false;
  }
  begin() {
    this.#output.push("{");
    this.#isFirst = true;
  }
  end() {
    this.#output.push("}");
    this.#isFirst = false;
  }
  #key(name) {
    if (this.#isFirst) {
      this.#output.push('"');
      this.#isFirst = false;
    } else {
      this.#output.push(',"');
    }
    this.#output.push(name);
    this.#output.push('":');
  }
  string(name, value) {
    this.#key(name);
    this.#output.push(JSON.stringify(value));
  }
  stringRaw(name, value) {
    this.#key(name);
    this.#output.push('"');
    this.#output.push(value);
    this.#output.push('"');
  }
  number(name, value) {
    this.#key(name);
    this.#output.push("" + value);
  }
  boolean(name, value) {
    this.#key(name);
    this.#output.push(value ? "true" : "false");
  }
  object(name, value, valueFun) {
    this.#key(name);
    this.begin();
    valueFun(this, value);
    this.end();
  }
  arrayObjects(name, values, valueFun) {
    this.#key(name);
    this.#output.push("[");
    for (let i = 0; i < values.length; ++i) {
      if (i !== 0) {
        this.#output.push(",");
      }
      this.begin();
      valueFun(this, values[i]);
      this.end();
    }
    this.#output.push("]");
  }
};
function writeJsonObject(value, fun) {
  const output = [];
  const writer = new ObjectWriter(output);
  writer.begin();
  fun(writer, value);
  writer.end();
  return output.join("");
}

// node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/util.js
var VARINT = 0;
var FIXED_64 = 1;
var LENGTH_DELIMITED = 2;
var FIXED_32 = 5;

// node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/decode.js
var MessageReader = class {
  #array;
  #view;
  #pos;
  constructor(array2) {
    this.#array = array2;
    this.#view = new DataView(array2.buffer, array2.byteOffset, array2.byteLength);
    this.#pos = 0;
  }
  varint() {
    let value = 0;
    for (let shift = 0; ; shift += 7) {
      const byte = this.#array[this.#pos++];
      value |= (byte & 127) << shift;
      if (!(byte & 128)) {
        break;
      }
    }
    return value;
  }
  varintBig() {
    let value = 0n;
    for (let shift = 0n; ; shift += 7n) {
      const byte = this.#array[this.#pos++];
      value |= BigInt(byte & 127) << shift;
      if (!(byte & 128)) {
        break;
      }
    }
    return value;
  }
  bytes(length) {
    const array2 = new Uint8Array(this.#array.buffer, this.#array.byteOffset + this.#pos, length);
    this.#pos += length;
    return array2;
  }
  double() {
    const value = this.#view.getFloat64(this.#pos, true);
    this.#pos += 8;
    return value;
  }
  skipVarint() {
    for (; ; ) {
      const byte = this.#array[this.#pos++];
      if (!(byte & 128)) {
        break;
      }
    }
  }
  skip(count) {
    this.#pos += count;
  }
  eof() {
    return this.#pos >= this.#array.byteLength;
  }
};
var FieldReader = class {
  #reader;
  #wireType;
  constructor(reader) {
    this.#reader = reader;
    this.#wireType = -1;
  }
  setup(wireType) {
    this.#wireType = wireType;
  }
  #expect(expectedWireType) {
    if (this.#wireType !== expectedWireType) {
      throw new ProtoError(`Expected wire type ${expectedWireType}, got ${this.#wireType}`);
    }
    this.#wireType = -1;
  }
  bytes() {
    this.#expect(LENGTH_DELIMITED);
    const length = this.#reader.varint();
    return this.#reader.bytes(length);
  }
  string() {
    return new TextDecoder().decode(this.bytes());
  }
  message(def) {
    return readProtobufMessage(this.bytes(), def);
  }
  int32() {
    this.#expect(VARINT);
    return this.#reader.varint();
  }
  uint32() {
    return this.int32();
  }
  bool() {
    return this.int32() !== 0;
  }
  uint64() {
    this.#expect(VARINT);
    return this.#reader.varintBig();
  }
  sint64() {
    const value = this.uint64();
    return value >> 1n ^ -(value & 1n);
  }
  double() {
    this.#expect(FIXED_64);
    return this.#reader.double();
  }
  maybeSkip() {
    if (this.#wireType < 0) {
      return;
    } else if (this.#wireType === VARINT) {
      this.#reader.skipVarint();
    } else if (this.#wireType === FIXED_64) {
      this.#reader.skip(8);
    } else if (this.#wireType === LENGTH_DELIMITED) {
      const length = this.#reader.varint();
      this.#reader.skip(length);
    } else if (this.#wireType === FIXED_32) {
      this.#reader.skip(4);
    } else {
      throw new ProtoError(`Unexpected wire type ${this.#wireType}`);
    }
    this.#wireType = -1;
  }
};
function readProtobufMessage(data, def) {
  const msgReader = new MessageReader(data);
  const fieldReader = new FieldReader(msgReader);
  let value = def.default();
  while (!msgReader.eof()) {
    const key = msgReader.varint();
    const tag = key >> 3;
    const wireType = key & 7;
    fieldReader.setup(wireType);
    const tagFun = def[tag];
    if (tagFun !== void 0) {
      const returnedValue = tagFun(fieldReader, value);
      if (returnedValue !== void 0) {
        value = returnedValue;
      }
    }
    fieldReader.maybeSkip();
  }
  return value;
}

// node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/encode.js
var MessageWriter = class _MessageWriter {
  #buf;
  #array;
  #view;
  #pos;
  constructor() {
    this.#buf = new ArrayBuffer(256);
    this.#array = new Uint8Array(this.#buf);
    this.#view = new DataView(this.#buf);
    this.#pos = 0;
  }
  #ensure(extra) {
    if (this.#pos + extra <= this.#buf.byteLength) {
      return;
    }
    let newCap = this.#buf.byteLength;
    while (newCap < this.#pos + extra) {
      newCap *= 2;
    }
    const newBuf = new ArrayBuffer(newCap);
    const newArray = new Uint8Array(newBuf);
    const newView = new DataView(newBuf);
    newArray.set(new Uint8Array(this.#buf, 0, this.#pos));
    this.#buf = newBuf;
    this.#array = newArray;
    this.#view = newView;
  }
  #varint(value) {
    this.#ensure(5);
    value = 0 | value;
    do {
      let byte = value & 127;
      value >>>= 7;
      byte |= value ? 128 : 0;
      this.#array[this.#pos++] = byte;
    } while (value);
  }
  #varintBig(value) {
    this.#ensure(10);
    value = value & 0xffffffffffffffffn;
    do {
      let byte = Number(value & 0x7fn);
      value >>= 7n;
      byte |= value ? 128 : 0;
      this.#array[this.#pos++] = byte;
    } while (value);
  }
  #tag(tag, wireType) {
    this.#varint(tag << 3 | wireType);
  }
  bytes(tag, value) {
    this.#tag(tag, LENGTH_DELIMITED);
    this.#varint(value.byteLength);
    this.#ensure(value.byteLength);
    this.#array.set(value, this.#pos);
    this.#pos += value.byteLength;
  }
  string(tag, value) {
    this.bytes(tag, new TextEncoder().encode(value));
  }
  message(tag, value, fun) {
    const writer = new _MessageWriter();
    fun(writer, value);
    this.bytes(tag, writer.data());
  }
  int32(tag, value) {
    this.#tag(tag, VARINT);
    this.#varint(value);
  }
  uint32(tag, value) {
    this.int32(tag, value);
  }
  bool(tag, value) {
    this.int32(tag, value ? 1 : 0);
  }
  sint64(tag, value) {
    this.#tag(tag, VARINT);
    this.#varintBig(value << 1n ^ value >> 63n);
  }
  double(tag, value) {
    this.#tag(tag, FIXED_64);
    this.#ensure(8);
    this.#view.setFloat64(this.#pos, value, true);
    this.#pos += 8;
  }
  data() {
    return new Uint8Array(this.#buf, 0, this.#pos);
  }
};
function writeProtobufMessage(value, fun) {
  const w = new MessageWriter();
  fun(w, value);
  return w.data();
}

// node_modules/@libsql/hrana-client/lib-esm/id_alloc.js
var IdAlloc = class {
  // Set of all allocated ids
  #usedIds;
  // Set of all free ids lower than `#usedIds.size`
  #freeIds;
  constructor() {
    this.#usedIds = /* @__PURE__ */ new Set();
    this.#freeIds = /* @__PURE__ */ new Set();
  }
  // Returns an id that was free, and marks it as used.
  alloc() {
    for (const freeId2 of this.#freeIds) {
      this.#freeIds.delete(freeId2);
      this.#usedIds.add(freeId2);
      if (!this.#usedIds.has(this.#usedIds.size - 1)) {
        this.#freeIds.add(this.#usedIds.size - 1);
      }
      return freeId2;
    }
    const freeId = this.#usedIds.size;
    this.#usedIds.add(freeId);
    return freeId;
  }
  free(id) {
    if (!this.#usedIds.delete(id)) {
      throw new InternalError("Freeing an id that is not allocated");
    }
    this.#freeIds.delete(this.#usedIds.size);
    if (id < this.#usedIds.size) {
      this.#freeIds.add(id);
    }
  }
};

// node_modules/@libsql/hrana-client/lib-esm/util.js
function impossible(value, message) {
  throw new InternalError(message);
}

// node_modules/@libsql/hrana-client/lib-esm/value.js
function valueToProto(value) {
  if (value === null) {
    return null;
  } else if (typeof value === "string") {
    return value;
  } else if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new RangeError("Only finite numbers (not Infinity or NaN) can be passed as arguments");
    }
    return value;
  } else if (typeof value === "bigint") {
    if (value < minInteger2 || value > maxInteger2) {
      throw new RangeError("This bigint value is too large to be represented as a 64-bit integer and passed as argument");
    }
    return value;
  } else if (typeof value === "boolean") {
    return value ? 1n : 0n;
  } else if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  } else if (value instanceof Uint8Array) {
    return value;
  } else if (value instanceof Date) {
    return +value.valueOf();
  } else if (typeof value === "object") {
    return "" + value.toString();
  } else {
    throw new TypeError("Unsupported type of value");
  }
}
var minInteger2 = -9223372036854775808n;
var maxInteger2 = 9223372036854775807n;
function valueFromProto(value, intMode) {
  if (value === null) {
    return null;
  } else if (typeof value === "number") {
    return value;
  } else if (typeof value === "string") {
    return value;
  } else if (typeof value === "bigint") {
    if (intMode === "number") {
      const num = Number(value);
      if (!Number.isSafeInteger(num)) {
        throw new RangeError("Received integer which is too large to be safely represented as a JavaScript number");
      }
      return num;
    } else if (intMode === "bigint") {
      return value;
    } else if (intMode === "string") {
      return "" + value;
    } else {
      throw new MisuseError("Invalid value for IntMode");
    }
  } else if (value instanceof Uint8Array) {
    return value.slice().buffer;
  } else if (value === void 0) {
    throw new ProtoError("Received unrecognized type of Value");
  } else {
    throw impossible(value, "Impossible type of Value");
  }
}

// node_modules/@libsql/hrana-client/lib-esm/result.js
function stmtResultFromProto(result) {
  return {
    affectedRowCount: result.affectedRowCount,
    lastInsertRowid: result.lastInsertRowid,
    columnNames: result.cols.map((col) => col.name),
    columnDecltypes: result.cols.map((col) => col.decltype)
  };
}
function rowsResultFromProto(result, intMode) {
  const stmtResult = stmtResultFromProto(result);
  const rows = result.rows.map((row) => rowFromProto(stmtResult.columnNames, row, intMode));
  return { ...stmtResult, rows };
}
function rowResultFromProto(result, intMode) {
  const stmtResult = stmtResultFromProto(result);
  let row;
  if (result.rows.length > 0) {
    row = rowFromProto(stmtResult.columnNames, result.rows[0], intMode);
  }
  return { ...stmtResult, row };
}
function valueResultFromProto(result, intMode) {
  const stmtResult = stmtResultFromProto(result);
  let value;
  if (result.rows.length > 0 && stmtResult.columnNames.length > 0) {
    value = valueFromProto(result.rows[0][0], intMode);
  }
  return { ...stmtResult, value };
}
function rowFromProto(colNames, values, intMode) {
  const row = {};
  Object.defineProperty(row, "length", { value: values.length });
  for (let i = 0; i < values.length; ++i) {
    const value = valueFromProto(values[i], intMode);
    Object.defineProperty(row, i, { value });
    const colName = colNames[i];
    if (colName !== void 0 && !Object.hasOwn(row, colName)) {
      Object.defineProperty(row, colName, { value, enumerable: true, configurable: true, writable: true });
    }
  }
  return row;
}
function errorFromProto(error) {
  return new ResponseError(error.message, error);
}

// node_modules/@libsql/hrana-client/lib-esm/sql.js
var Sql = class {
  #owner;
  #sqlId;
  #closed;
  /** @private */
  constructor(owner, sqlId) {
    this.#owner = owner;
    this.#sqlId = sqlId;
    this.#closed = void 0;
  }
  /** @private */
  _getSqlId(owner) {
    if (this.#owner !== owner) {
      throw new MisuseError("Attempted to use SQL text opened with other object");
    } else if (this.#closed !== void 0) {
      throw new ClosedError("SQL text is closed", this.#closed);
    }
    return this.#sqlId;
  }
  /** Remove the SQL text from the server, releasing resouces. */
  close() {
    this._setClosed(new ClientError("SQL text was manually closed"));
  }
  /** @private */
  _setClosed(error) {
    if (this.#closed === void 0) {
      this.#closed = error;
      this.#owner._closeSql(this.#sqlId);
    }
  }
  /** True if the SQL text is closed (removed from the server). */
  get closed() {
    return this.#closed !== void 0;
  }
};
function sqlToProto(owner, sql) {
  if (sql instanceof Sql) {
    return { sqlId: sql._getSqlId(owner) };
  } else {
    return { sql: "" + sql };
  }
}

// node_modules/@libsql/hrana-client/lib-esm/queue.js
var Queue = class {
  #pushStack;
  #shiftStack;
  constructor() {
    this.#pushStack = [];
    this.#shiftStack = [];
  }
  get length() {
    return this.#pushStack.length + this.#shiftStack.length;
  }
  push(elem) {
    this.#pushStack.push(elem);
  }
  shift() {
    if (this.#shiftStack.length === 0 && this.#pushStack.length > 0) {
      this.#shiftStack = this.#pushStack.reverse();
      this.#pushStack = [];
    }
    return this.#shiftStack.pop();
  }
  first() {
    return this.#shiftStack.length !== 0 ? this.#shiftStack[this.#shiftStack.length - 1] : this.#pushStack[0];
  }
};

// node_modules/@libsql/hrana-client/lib-esm/stmt.js
var Stmt = class {
  /** The SQL statement text. */
  sql;
  /** @private */
  _args;
  /** @private */
  _namedArgs;
  /** Initialize the statement with given SQL text. */
  constructor(sql) {
    this.sql = sql;
    this._args = [];
    this._namedArgs = /* @__PURE__ */ new Map();
  }
  /** Binds positional parameters from the given `values`. All previous positional bindings are cleared. */
  bindIndexes(values) {
    this._args.length = 0;
    for (const value of values) {
      this._args.push(valueToProto(value));
    }
    return this;
  }
  /** Binds a parameter by a 1-based index. */
  bindIndex(index, value) {
    if (index !== (index | 0) || index <= 0) {
      throw new RangeError("Index of a positional argument must be positive integer");
    }
    while (this._args.length < index) {
      this._args.push(null);
    }
    this._args[index - 1] = valueToProto(value);
    return this;
  }
  /** Binds a parameter by name. */
  bindName(name, value) {
    this._namedArgs.set(name, valueToProto(value));
    return this;
  }
  /** Clears all bindings. */
  unbindAll() {
    this._args.length = 0;
    this._namedArgs.clear();
    return this;
  }
};
function stmtToProto(sqlOwner, stmt, wantRows) {
  let inSql;
  let args = [];
  let namedArgs = [];
  if (stmt instanceof Stmt) {
    inSql = stmt.sql;
    args = stmt._args;
    for (const [name, value] of stmt._namedArgs.entries()) {
      namedArgs.push({ name, value });
    }
  } else if (Array.isArray(stmt)) {
    inSql = stmt[0];
    if (Array.isArray(stmt[1])) {
      args = stmt[1].map((arg) => valueToProto(arg));
    } else {
      namedArgs = Object.entries(stmt[1]).map(([name, value]) => {
        return { name, value: valueToProto(value) };
      });
    }
  } else {
    inSql = stmt;
  }
  const { sql, sqlId } = sqlToProto(sqlOwner, inSql);
  return { sql, sqlId, args, namedArgs, wantRows };
}

// node_modules/@libsql/hrana-client/lib-esm/batch.js
var Batch = class {
  /** @private */
  _stream;
  #useCursor;
  /** @private */
  _steps;
  #executed;
  /** @private */
  constructor(stream, useCursor) {
    this._stream = stream;
    this.#useCursor = useCursor;
    this._steps = [];
    this.#executed = false;
  }
  /** Return a builder for adding a step to the batch. */
  step() {
    return new BatchStep(this);
  }
  /** Execute the batch. */
  execute() {
    if (this.#executed) {
      throw new MisuseError("This batch has already been executed");
    }
    this.#executed = true;
    const batch = {
      steps: this._steps.map((step) => step.proto)
    };
    if (this.#useCursor) {
      return executeCursor(this._stream, this._steps, batch);
    } else {
      return executeRegular(this._stream, this._steps, batch);
    }
  }
};
function executeRegular(stream, steps, batch) {
  return stream._batch(batch).then((result) => {
    for (let step = 0; step < steps.length; ++step) {
      const stepResult = result.stepResults.get(step);
      const stepError = result.stepErrors.get(step);
      steps[step].callback(stepResult, stepError);
    }
  });
}
async function executeCursor(stream, steps, batch) {
  const cursor = await stream._openCursor(batch);
  try {
    let nextStep = 0;
    let beginEntry = void 0;
    let rows = [];
    for (; ; ) {
      const entry = await cursor.next();
      if (entry === void 0) {
        break;
      }
      if (entry.type === "step_begin") {
        if (entry.step < nextStep || entry.step >= steps.length) {
          throw new ProtoError("Server produced StepBeginEntry for unexpected step");
        } else if (beginEntry !== void 0) {
          throw new ProtoError("Server produced StepBeginEntry before terminating previous step");
        }
        for (let step = nextStep; step < entry.step; ++step) {
          steps[step].callback(void 0, void 0);
        }
        nextStep = entry.step + 1;
        beginEntry = entry;
        rows = [];
      } else if (entry.type === "step_end") {
        if (beginEntry === void 0) {
          throw new ProtoError("Server produced StepEndEntry but no step is active");
        }
        const stmtResult = {
          cols: beginEntry.cols,
          rows,
          affectedRowCount: entry.affectedRowCount,
          lastInsertRowid: entry.lastInsertRowid
        };
        steps[beginEntry.step].callback(stmtResult, void 0);
        beginEntry = void 0;
        rows = [];
      } else if (entry.type === "step_error") {
        if (beginEntry === void 0) {
          if (entry.step >= steps.length) {
            throw new ProtoError("Server produced StepErrorEntry for unexpected step");
          }
          for (let step = nextStep; step < entry.step; ++step) {
            steps[step].callback(void 0, void 0);
          }
        } else {
          if (entry.step !== beginEntry.step) {
            throw new ProtoError("Server produced StepErrorEntry for unexpected step");
          }
          beginEntry = void 0;
          rows = [];
        }
        steps[entry.step].callback(void 0, entry.error);
        nextStep = entry.step + 1;
      } else if (entry.type === "row") {
        if (beginEntry === void 0) {
          throw new ProtoError("Server produced RowEntry but no step is active");
        }
        rows.push(entry.row);
      } else if (entry.type === "error") {
        throw errorFromProto(entry.error);
      } else if (entry.type === "none") {
        throw new ProtoError("Server produced unrecognized CursorEntry");
      } else {
        throw impossible(entry, "Impossible CursorEntry");
      }
    }
    if (beginEntry !== void 0) {
      throw new ProtoError("Server closed Cursor before terminating active step");
    }
    for (let step = nextStep; step < steps.length; ++step) {
      steps[step].callback(void 0, void 0);
    }
  } finally {
    cursor.close();
  }
}
var BatchStep = class {
  /** @private */
  _batch;
  #conds;
  /** @private */
  _index;
  /** @private */
  constructor(batch) {
    this._batch = batch;
    this.#conds = [];
    this._index = void 0;
  }
  /** Add the condition that needs to be satisfied to execute the statement. If you use this method multiple
   * times, we join the conditions with a logical AND. */
  condition(cond) {
    this.#conds.push(cond._proto);
    return this;
  }
  /** Add a statement that returns rows. */
  query(stmt) {
    return this.#add(stmt, true, rowsResultFromProto);
  }
  /** Add a statement that returns at most a single row. */
  queryRow(stmt) {
    return this.#add(stmt, true, rowResultFromProto);
  }
  /** Add a statement that returns at most a single value. */
  queryValue(stmt) {
    return this.#add(stmt, true, valueResultFromProto);
  }
  /** Add a statement without returning rows. */
  run(stmt) {
    return this.#add(stmt, false, stmtResultFromProto);
  }
  #add(inStmt, wantRows, fromProto) {
    if (this._index !== void 0) {
      throw new MisuseError("This BatchStep has already been added to the batch");
    }
    const stmt = stmtToProto(this._batch._stream._sqlOwner(), inStmt, wantRows);
    let condition;
    if (this.#conds.length === 0) {
      condition = void 0;
    } else if (this.#conds.length === 1) {
      condition = this.#conds[0];
    } else {
      condition = { type: "and", conds: this.#conds.slice() };
    }
    const proto = { stmt, condition };
    return new Promise((outputCallback, errorCallback) => {
      const callback = (stepResult, stepError) => {
        if (stepResult !== void 0 && stepError !== void 0) {
          errorCallback(new ProtoError("Server returned both result and error"));
        } else if (stepError !== void 0) {
          errorCallback(errorFromProto(stepError));
        } else if (stepResult !== void 0) {
          outputCallback(fromProto(stepResult, this._batch._stream.intMode));
        } else {
          outputCallback(void 0);
        }
      };
      this._index = this._batch._steps.length;
      this._batch._steps.push({ proto, callback });
    });
  }
};
var BatchCond = class _BatchCond {
  /** @private */
  _batch;
  /** @private */
  _proto;
  /** @private */
  constructor(batch, proto) {
    this._batch = batch;
    this._proto = proto;
  }
  /** Create a condition that evaluates to true when the given step executes successfully.
   *
   * If the given step fails error or is skipped because its condition evaluated to false, this
   * condition evaluates to false.
   */
  static ok(step) {
    return new _BatchCond(step._batch, { type: "ok", step: stepIndex(step) });
  }
  /** Create a condition that evaluates to true when the given step fails.
   *
   * If the given step succeeds or is skipped because its condition evaluated to false, this condition
   * evaluates to false.
   */
  static error(step) {
    return new _BatchCond(step._batch, { type: "error", step: stepIndex(step) });
  }
  /** Create a condition that is a logical negation of another condition.
   */
  static not(cond) {
    return new _BatchCond(cond._batch, { type: "not", cond: cond._proto });
  }
  /** Create a condition that is a logical AND of other conditions.
   */
  static and(batch, conds) {
    for (const cond of conds) {
      checkCondBatch(batch, cond);
    }
    return new _BatchCond(batch, { type: "and", conds: conds.map((e) => e._proto) });
  }
  /** Create a condition that is a logical OR of other conditions.
   */
  static or(batch, conds) {
    for (const cond of conds) {
      checkCondBatch(batch, cond);
    }
    return new _BatchCond(batch, { type: "or", conds: conds.map((e) => e._proto) });
  }
  /** Create a condition that evaluates to true when the SQL connection is in autocommit mode (not inside an
   * explicit transaction). This requires protocol version 3 or higher.
   */
  static isAutocommit(batch) {
    batch._stream.client()._ensureVersion(3, "BatchCond.isAutocommit()");
    return new _BatchCond(batch, { type: "is_autocommit" });
  }
};
function stepIndex(step) {
  if (step._index === void 0) {
    throw new MisuseError("Cannot add a condition referencing a step that has not been added to the batch");
  }
  return step._index;
}
function checkCondBatch(expectedBatch, cond) {
  if (cond._batch !== expectedBatch) {
    throw new MisuseError("Cannot mix BatchCond objects for different Batch objects");
  }
}

// node_modules/@libsql/hrana-client/lib-esm/describe.js
function describeResultFromProto(result) {
  return {
    paramNames: result.params.map((p) => p.name),
    columns: result.cols,
    isExplain: result.isExplain,
    isReadonly: result.isReadonly
  };
}

// node_modules/@libsql/hrana-client/lib-esm/stream.js
var Stream = class {
  /** @private */
  constructor(intMode) {
    this.intMode = intMode;
  }
  /** Execute a statement and return rows. */
  query(stmt) {
    return this.#execute(stmt, true, rowsResultFromProto);
  }
  /** Execute a statement and return at most a single row. */
  queryRow(stmt) {
    return this.#execute(stmt, true, rowResultFromProto);
  }
  /** Execute a statement and return at most a single value. */
  queryValue(stmt) {
    return this.#execute(stmt, true, valueResultFromProto);
  }
  /** Execute a statement without returning rows. */
  run(stmt) {
    return this.#execute(stmt, false, stmtResultFromProto);
  }
  #execute(inStmt, wantRows, fromProto) {
    const stmt = stmtToProto(this._sqlOwner(), inStmt, wantRows);
    return this._execute(stmt).then((r) => fromProto(r, this.intMode));
  }
  /** Return a builder for creating and executing a batch.
   *
   * If `useCursor` is true, the batch will be executed using a Hrana cursor, which will stream results from
   * the server to the client, which consumes less memory on the server. This requires protocol version 3 or
   * higher.
   */
  batch(useCursor = false) {
    return new Batch(this, useCursor);
  }
  /** Parse and analyze a statement. This requires protocol version 2 or higher. */
  describe(inSql) {
    const protoSql = sqlToProto(this._sqlOwner(), inSql);
    return this._describe(protoSql).then(describeResultFromProto);
  }
  /** Execute a sequence of statements separated by semicolons. This requires protocol version 2 or higher.
   * */
  sequence(inSql) {
    const protoSql = sqlToProto(this._sqlOwner(), inSql);
    return this._sequence(protoSql);
  }
  /** Representation of integers returned from the database. See {@link IntMode}.
   *
   * This value affects the results of all operations on this stream.
   */
  intMode;
};

// node_modules/@libsql/hrana-client/lib-esm/cursor.js
var Cursor = class {
};

// node_modules/@libsql/hrana-client/lib-esm/ws/cursor.js
var fetchChunkSize = 1e3;
var fetchQueueSize = 10;
var WsCursor = class extends Cursor {
  #client;
  #stream;
  #cursorId;
  #entryQueue;
  #fetchQueue;
  #closed;
  #done;
  /** @private */
  constructor(client2, stream, cursorId) {
    super();
    this.#client = client2;
    this.#stream = stream;
    this.#cursorId = cursorId;
    this.#entryQueue = new Queue();
    this.#fetchQueue = new Queue();
    this.#closed = void 0;
    this.#done = false;
  }
  /** Fetch the next entry from the cursor. */
  async next() {
    for (; ; ) {
      if (this.#closed !== void 0) {
        throw new ClosedError("Cursor is closed", this.#closed);
      }
      while (!this.#done && this.#fetchQueue.length < fetchQueueSize) {
        this.#fetchQueue.push(this.#fetch());
      }
      const entry = this.#entryQueue.shift();
      if (this.#done || entry !== void 0) {
        return entry;
      }
      await this.#fetchQueue.shift().then((response) => {
        if (response === void 0) {
          return;
        }
        for (const entry2 of response.entries) {
          this.#entryQueue.push(entry2);
        }
        this.#done ||= response.done;
      });
    }
  }
  #fetch() {
    return this.#stream._sendCursorRequest(this, {
      type: "fetch_cursor",
      cursorId: this.#cursorId,
      maxCount: fetchChunkSize
    }).then((resp) => resp, (error) => {
      this._setClosed(error);
      return void 0;
    });
  }
  /** @private */
  _setClosed(error) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#closed = error;
    this.#stream._sendCursorRequest(this, {
      type: "close_cursor",
      cursorId: this.#cursorId
    }).catch(() => void 0);
    this.#stream._cursorClosed(this);
  }
  /** Close the cursor. */
  close() {
    this._setClosed(new ClientError("Cursor was manually closed"));
  }
  /** True if the cursor is closed. */
  get closed() {
    return this.#closed !== void 0;
  }
};

// node_modules/@libsql/hrana-client/lib-esm/ws/stream.js
var WsStream = class _WsStream extends Stream {
  #client;
  #streamId;
  #queue;
  #cursor;
  #closing;
  #closed;
  /** @private */
  static open(client2) {
    const streamId = client2._streamIdAlloc.alloc();
    const stream = new _WsStream(client2, streamId);
    const responseCallback = () => void 0;
    const errorCallback = (e) => stream.#setClosed(e);
    const request = { type: "open_stream", streamId };
    client2._sendRequest(request, { responseCallback, errorCallback });
    return stream;
  }
  /** @private */
  constructor(client2, streamId) {
    super(client2.intMode);
    this.#client = client2;
    this.#streamId = streamId;
    this.#queue = new Queue();
    this.#cursor = void 0;
    this.#closing = false;
    this.#closed = void 0;
  }
  /** Get the {@link WsClient} object that this stream belongs to. */
  client() {
    return this.#client;
  }
  /** @private */
  _sqlOwner() {
    return this.#client;
  }
  /** @private */
  _execute(stmt) {
    return this.#sendStreamRequest({
      type: "execute",
      streamId: this.#streamId,
      stmt
    }).then((response) => {
      return response.result;
    });
  }
  /** @private */
  _batch(batch) {
    return this.#sendStreamRequest({
      type: "batch",
      streamId: this.#streamId,
      batch
    }).then((response) => {
      return response.result;
    });
  }
  /** @private */
  _describe(protoSql) {
    this.#client._ensureVersion(2, "describe()");
    return this.#sendStreamRequest({
      type: "describe",
      streamId: this.#streamId,
      sql: protoSql.sql,
      sqlId: protoSql.sqlId
    }).then((response) => {
      return response.result;
    });
  }
  /** @private */
  _sequence(protoSql) {
    this.#client._ensureVersion(2, "sequence()");
    return this.#sendStreamRequest({
      type: "sequence",
      streamId: this.#streamId,
      sql: protoSql.sql,
      sqlId: protoSql.sqlId
    }).then((_response) => {
      return void 0;
    });
  }
  /** Check whether the SQL connection underlying this stream is in autocommit state (i.e., outside of an
   * explicit transaction). This requires protocol version 3 or higher.
   */
  getAutocommit() {
    this.#client._ensureVersion(3, "getAutocommit()");
    return this.#sendStreamRequest({
      type: "get_autocommit",
      streamId: this.#streamId
    }).then((response) => {
      return response.isAutocommit;
    });
  }
  #sendStreamRequest(request) {
    return new Promise((responseCallback, errorCallback) => {
      this.#pushToQueue({ type: "request", request, responseCallback, errorCallback });
    });
  }
  /** @private */
  _openCursor(batch) {
    this.#client._ensureVersion(3, "cursor");
    return new Promise((cursorCallback, errorCallback) => {
      this.#pushToQueue({ type: "cursor", batch, cursorCallback, errorCallback });
    });
  }
  /** @private */
  _sendCursorRequest(cursor, request) {
    if (cursor !== this.#cursor) {
      throw new InternalError("Cursor not associated with the stream attempted to execute a request");
    }
    return new Promise((responseCallback, errorCallback) => {
      if (this.#closed !== void 0) {
        errorCallback(new ClosedError("Stream is closed", this.#closed));
      } else {
        this.#client._sendRequest(request, { responseCallback, errorCallback });
      }
    });
  }
  /** @private */
  _cursorClosed(cursor) {
    if (cursor !== this.#cursor) {
      throw new InternalError("Cursor was closed, but it was not associated with the stream");
    }
    this.#cursor = void 0;
    this.#flushQueue();
  }
  #pushToQueue(entry) {
    if (this.#closed !== void 0) {
      entry.errorCallback(new ClosedError("Stream is closed", this.#closed));
    } else if (this.#closing) {
      entry.errorCallback(new ClosedError("Stream is closing", void 0));
    } else {
      this.#queue.push(entry);
      this.#flushQueue();
    }
  }
  #flushQueue() {
    for (; ; ) {
      const entry = this.#queue.first();
      if (entry === void 0 && this.#cursor === void 0 && this.#closing) {
        this.#setClosed(new ClientError("Stream was gracefully closed"));
        break;
      } else if (entry?.type === "request" && this.#cursor === void 0) {
        const { request, responseCallback, errorCallback } = entry;
        this.#queue.shift();
        this.#client._sendRequest(request, { responseCallback, errorCallback });
      } else if (entry?.type === "cursor" && this.#cursor === void 0) {
        const { batch, cursorCallback } = entry;
        this.#queue.shift();
        const cursorId = this.#client._cursorIdAlloc.alloc();
        const cursor = new WsCursor(this.#client, this, cursorId);
        const request = {
          type: "open_cursor",
          streamId: this.#streamId,
          cursorId,
          batch
        };
        const responseCallback = () => void 0;
        const errorCallback = (e) => cursor._setClosed(e);
        this.#client._sendRequest(request, { responseCallback, errorCallback });
        this.#cursor = cursor;
        cursorCallback(cursor);
      } else {
        break;
      }
    }
  }
  #setClosed(error) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#closed = error;
    if (this.#cursor !== void 0) {
      this.#cursor._setClosed(error);
    }
    for (; ; ) {
      const entry = this.#queue.shift();
      if (entry !== void 0) {
        entry.errorCallback(error);
      } else {
        break;
      }
    }
    const request = { type: "close_stream", streamId: this.#streamId };
    const responseCallback = () => this.#client._streamIdAlloc.free(this.#streamId);
    const errorCallback = () => void 0;
    this.#client._sendRequest(request, { responseCallback, errorCallback });
  }
  /** Immediately close the stream. */
  close() {
    this.#setClosed(new ClientError("Stream was manually closed"));
  }
  /** Gracefully close the stream. */
  closeGracefully() {
    this.#closing = true;
    this.#flushQueue();
  }
  /** True if the stream is closed or closing. */
  get closed() {
    return this.#closed !== void 0 || this.#closing;
  }
};

// node_modules/@libsql/hrana-client/lib-esm/shared/json_encode.js
function Stmt2(w, msg) {
  if (msg.sql !== void 0) {
    w.string("sql", msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.number("sql_id", msg.sqlId);
  }
  w.arrayObjects("args", msg.args, Value);
  w.arrayObjects("named_args", msg.namedArgs, NamedArg);
  w.boolean("want_rows", msg.wantRows);
}
function NamedArg(w, msg) {
  w.string("name", msg.name);
  w.object("value", msg.value, Value);
}
function Batch2(w, msg) {
  w.arrayObjects("steps", msg.steps, BatchStep2);
}
function BatchStep2(w, msg) {
  if (msg.condition !== void 0) {
    w.object("condition", msg.condition, BatchCond2);
  }
  w.object("stmt", msg.stmt, Stmt2);
}
function BatchCond2(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "ok" || msg.type === "error") {
    w.number("step", msg.step);
  } else if (msg.type === "not") {
    w.object("cond", msg.cond, BatchCond2);
  } else if (msg.type === "and" || msg.type === "or") {
    w.arrayObjects("conds", msg.conds, BatchCond2);
  } else if (msg.type === "is_autocommit") {
  } else {
    throw impossible(msg, "Impossible type of BatchCond");
  }
}
function Value(w, msg) {
  if (msg === null) {
    w.stringRaw("type", "null");
  } else if (typeof msg === "bigint") {
    w.stringRaw("type", "integer");
    w.stringRaw("value", "" + msg);
  } else if (typeof msg === "number") {
    w.stringRaw("type", "float");
    w.number("value", msg);
  } else if (typeof msg === "string") {
    w.stringRaw("type", "text");
    w.string("value", msg);
  } else if (msg instanceof Uint8Array) {
    w.stringRaw("type", "blob");
    w.stringRaw("base64", gBase64.fromUint8Array(msg));
  } else if (msg === void 0) {
  } else {
    throw impossible(msg, "Impossible type of Value");
  }
}

// node_modules/@libsql/hrana-client/lib-esm/ws/json_encode.js
function ClientMsg(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "hello") {
    if (msg.jwt !== void 0) {
      w.string("jwt", msg.jwt);
    }
  } else if (msg.type === "request") {
    w.number("request_id", msg.requestId);
    w.object("request", msg.request, Request2);
  } else {
    throw impossible(msg, "Impossible type of ClientMsg");
  }
}
function Request2(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "open_stream") {
    w.number("stream_id", msg.streamId);
  } else if (msg.type === "close_stream") {
    w.number("stream_id", msg.streamId);
  } else if (msg.type === "execute") {
    w.number("stream_id", msg.streamId);
    w.object("stmt", msg.stmt, Stmt2);
  } else if (msg.type === "batch") {
    w.number("stream_id", msg.streamId);
    w.object("batch", msg.batch, Batch2);
  } else if (msg.type === "open_cursor") {
    w.number("stream_id", msg.streamId);
    w.number("cursor_id", msg.cursorId);
    w.object("batch", msg.batch, Batch2);
  } else if (msg.type === "close_cursor") {
    w.number("cursor_id", msg.cursorId);
  } else if (msg.type === "fetch_cursor") {
    w.number("cursor_id", msg.cursorId);
    w.number("max_count", msg.maxCount);
  } else if (msg.type === "sequence") {
    w.number("stream_id", msg.streamId);
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "describe") {
    w.number("stream_id", msg.streamId);
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "store_sql") {
    w.number("sql_id", msg.sqlId);
    w.string("sql", msg.sql);
  } else if (msg.type === "close_sql") {
    w.number("sql_id", msg.sqlId);
  } else if (msg.type === "get_autocommit") {
    w.number("stream_id", msg.streamId);
  } else {
    throw impossible(msg, "Impossible type of Request");
  }
}

// node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_encode.js
function Stmt3(w, msg) {
  if (msg.sql !== void 0) {
    w.string(1, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(2, msg.sqlId);
  }
  for (const arg of msg.args) {
    w.message(3, arg, Value2);
  }
  for (const arg of msg.namedArgs) {
    w.message(4, arg, NamedArg2);
  }
  w.bool(5, msg.wantRows);
}
function NamedArg2(w, msg) {
  w.string(1, msg.name);
  w.message(2, msg.value, Value2);
}
function Batch3(w, msg) {
  for (const step of msg.steps) {
    w.message(1, step, BatchStep3);
  }
}
function BatchStep3(w, msg) {
  if (msg.condition !== void 0) {
    w.message(1, msg.condition, BatchCond3);
  }
  w.message(2, msg.stmt, Stmt3);
}
function BatchCond3(w, msg) {
  if (msg.type === "ok") {
    w.uint32(1, msg.step);
  } else if (msg.type === "error") {
    w.uint32(2, msg.step);
  } else if (msg.type === "not") {
    w.message(3, msg.cond, BatchCond3);
  } else if (msg.type === "and") {
    w.message(4, msg.conds, BatchCondList);
  } else if (msg.type === "or") {
    w.message(5, msg.conds, BatchCondList);
  } else if (msg.type === "is_autocommit") {
    w.message(6, void 0, Empty);
  } else {
    throw impossible(msg, "Impossible type of BatchCond");
  }
}
function BatchCondList(w, msg) {
  for (const cond of msg) {
    w.message(1, cond, BatchCond3);
  }
}
function Value2(w, msg) {
  if (msg === null) {
    w.message(1, void 0, Empty);
  } else if (typeof msg === "bigint") {
    w.sint64(2, msg);
  } else if (typeof msg === "number") {
    w.double(3, msg);
  } else if (typeof msg === "string") {
    w.string(4, msg);
  } else if (msg instanceof Uint8Array) {
    w.bytes(5, msg);
  } else if (msg === void 0) {
  } else {
    throw impossible(msg, "Impossible type of Value");
  }
}
function Empty(_w, _msg) {
}

// node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_encode.js
function ClientMsg2(w, msg) {
  if (msg.type === "hello") {
    w.message(1, msg, HelloMsg);
  } else if (msg.type === "request") {
    w.message(2, msg, RequestMsg);
  } else {
    throw impossible(msg, "Impossible type of ClientMsg");
  }
}
function HelloMsg(w, msg) {
  if (msg.jwt !== void 0) {
    w.string(1, msg.jwt);
  }
}
function RequestMsg(w, msg) {
  w.int32(1, msg.requestId);
  const request = msg.request;
  if (request.type === "open_stream") {
    w.message(2, request, OpenStreamReq);
  } else if (request.type === "close_stream") {
    w.message(3, request, CloseStreamReq);
  } else if (request.type === "execute") {
    w.message(4, request, ExecuteReq);
  } else if (request.type === "batch") {
    w.message(5, request, BatchReq);
  } else if (request.type === "open_cursor") {
    w.message(6, request, OpenCursorReq);
  } else if (request.type === "close_cursor") {
    w.message(7, request, CloseCursorReq);
  } else if (request.type === "fetch_cursor") {
    w.message(8, request, FetchCursorReq);
  } else if (request.type === "sequence") {
    w.message(9, request, SequenceReq);
  } else if (request.type === "describe") {
    w.message(10, request, DescribeReq);
  } else if (request.type === "store_sql") {
    w.message(11, request, StoreSqlReq);
  } else if (request.type === "close_sql") {
    w.message(12, request, CloseSqlReq);
  } else if (request.type === "get_autocommit") {
    w.message(13, request, GetAutocommitReq);
  } else {
    throw impossible(request, "Impossible type of Request");
  }
}
function OpenStreamReq(w, msg) {
  w.int32(1, msg.streamId);
}
function CloseStreamReq(w, msg) {
  w.int32(1, msg.streamId);
}
function ExecuteReq(w, msg) {
  w.int32(1, msg.streamId);
  w.message(2, msg.stmt, Stmt3);
}
function BatchReq(w, msg) {
  w.int32(1, msg.streamId);
  w.message(2, msg.batch, Batch3);
}
function OpenCursorReq(w, msg) {
  w.int32(1, msg.streamId);
  w.int32(2, msg.cursorId);
  w.message(3, msg.batch, Batch3);
}
function CloseCursorReq(w, msg) {
  w.int32(1, msg.cursorId);
}
function FetchCursorReq(w, msg) {
  w.int32(1, msg.cursorId);
  w.uint32(2, msg.maxCount);
}
function SequenceReq(w, msg) {
  w.int32(1, msg.streamId);
  if (msg.sql !== void 0) {
    w.string(2, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(3, msg.sqlId);
  }
}
function DescribeReq(w, msg) {
  w.int32(1, msg.streamId);
  if (msg.sql !== void 0) {
    w.string(2, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(3, msg.sqlId);
  }
}
function StoreSqlReq(w, msg) {
  w.int32(1, msg.sqlId);
  w.string(2, msg.sql);
}
function CloseSqlReq(w, msg) {
  w.int32(1, msg.sqlId);
}
function GetAutocommitReq(w, msg) {
  w.int32(1, msg.streamId);
}

// node_modules/@libsql/hrana-client/lib-esm/shared/json_decode.js
function Error2(obj) {
  const message = string(obj["message"]);
  const code = stringOpt(obj["code"]);
  return { message, code };
}
function StmtResult(obj) {
  const cols = arrayObjectsMap(obj["cols"], Col);
  const rows = array(obj["rows"]).map((rowObj) => arrayObjectsMap(rowObj, Value3));
  const affectedRowCount = number(obj["affected_row_count"]);
  const lastInsertRowidStr = stringOpt(obj["last_insert_rowid"]);
  const lastInsertRowid2 = lastInsertRowidStr !== void 0 ? BigInt(lastInsertRowidStr) : void 0;
  return { cols, rows, affectedRowCount, lastInsertRowid: lastInsertRowid2 };
}
function Col(obj) {
  const name = stringOpt(obj["name"]);
  const decltype = stringOpt(obj["decltype"]);
  return { name, decltype };
}
function BatchResult(obj) {
  const stepResults = /* @__PURE__ */ new Map();
  array(obj["step_results"]).forEach((value, i) => {
    if (value !== null) {
      stepResults.set(i, StmtResult(object(value)));
    }
  });
  const stepErrors = /* @__PURE__ */ new Map();
  array(obj["step_errors"]).forEach((value, i) => {
    if (value !== null) {
      stepErrors.set(i, Error2(object(value)));
    }
  });
  return { stepResults, stepErrors };
}
function CursorEntry(obj) {
  const type = string(obj["type"]);
  if (type === "step_begin") {
    const step = number(obj["step"]);
    const cols = arrayObjectsMap(obj["cols"], Col);
    return { type: "step_begin", step, cols };
  } else if (type === "step_end") {
    const affectedRowCount = number(obj["affected_row_count"]);
    const lastInsertRowidStr = stringOpt(obj["last_insert_rowid"]);
    const lastInsertRowid2 = lastInsertRowidStr !== void 0 ? BigInt(lastInsertRowidStr) : void 0;
    return { type: "step_end", affectedRowCount, lastInsertRowid: lastInsertRowid2 };
  } else if (type === "step_error") {
    const step = number(obj["step"]);
    const error = Error2(object(obj["error"]));
    return { type: "step_error", step, error };
  } else if (type === "row") {
    const row = arrayObjectsMap(obj["row"], Value3);
    return { type: "row", row };
  } else if (type === "error") {
    const error = Error2(object(obj["error"]));
    return { type: "error", error };
  } else {
    throw new ProtoError("Unexpected type of CursorEntry");
  }
}
function DescribeResult(obj) {
  const params = arrayObjectsMap(obj["params"], DescribeParam);
  const cols = arrayObjectsMap(obj["cols"], DescribeCol);
  const isExplain = boolean(obj["is_explain"]);
  const isReadonly = boolean(obj["is_readonly"]);
  return { params, cols, isExplain, isReadonly };
}
function DescribeParam(obj) {
  const name = stringOpt(obj["name"]);
  return { name };
}
function DescribeCol(obj) {
  const name = string(obj["name"]);
  const decltype = stringOpt(obj["decltype"]);
  return { name, decltype };
}
function Value3(obj) {
  const type = string(obj["type"]);
  if (type === "null") {
    return null;
  } else if (type === "integer") {
    const value = string(obj["value"]);
    return BigInt(value);
  } else if (type === "float") {
    return number(obj["value"]);
  } else if (type === "text") {
    return string(obj["value"]);
  } else if (type === "blob") {
    return gBase64.toUint8Array(string(obj["base64"]));
  } else {
    throw new ProtoError("Unexpected type of Value");
  }
}

// node_modules/@libsql/hrana-client/lib-esm/ws/json_decode.js
function ServerMsg(obj) {
  const type = string(obj["type"]);
  if (type === "hello_ok") {
    return { type: "hello_ok" };
  } else if (type === "hello_error") {
    const error = Error2(object(obj["error"]));
    return { type: "hello_error", error };
  } else if (type === "response_ok") {
    const requestId = number(obj["request_id"]);
    const response = Response(object(obj["response"]));
    return { type: "response_ok", requestId, response };
  } else if (type === "response_error") {
    const requestId = number(obj["request_id"]);
    const error = Error2(object(obj["error"]));
    return { type: "response_error", requestId, error };
  } else {
    throw new ProtoError("Unexpected type of ServerMsg");
  }
}
function Response(obj) {
  const type = string(obj["type"]);
  if (type === "open_stream") {
    return { type: "open_stream" };
  } else if (type === "close_stream") {
    return { type: "close_stream" };
  } else if (type === "execute") {
    const result = StmtResult(object(obj["result"]));
    return { type: "execute", result };
  } else if (type === "batch") {
    const result = BatchResult(object(obj["result"]));
    return { type: "batch", result };
  } else if (type === "open_cursor") {
    return { type: "open_cursor" };
  } else if (type === "close_cursor") {
    return { type: "close_cursor" };
  } else if (type === "fetch_cursor") {
    const entries = arrayObjectsMap(obj["entries"], CursorEntry);
    const done = boolean(obj["done"]);
    return { type: "fetch_cursor", entries, done };
  } else if (type === "sequence") {
    return { type: "sequence" };
  } else if (type === "describe") {
    const result = DescribeResult(object(obj["result"]));
    return { type: "describe", result };
  } else if (type === "store_sql") {
    return { type: "store_sql" };
  } else if (type === "close_sql") {
    return { type: "close_sql" };
  } else if (type === "get_autocommit") {
    const isAutocommit = boolean(obj["is_autocommit"]);
    return { type: "get_autocommit", isAutocommit };
  } else {
    throw new ProtoError("Unexpected type of Response");
  }
}

// node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_decode.js
var Error3 = {
  default() {
    return { message: "", code: void 0 };
  },
  1(r, msg) {
    msg.message = r.string();
  },
  2(r, msg) {
    msg.code = r.string();
  }
};
var StmtResult2 = {
  default() {
    return {
      cols: [],
      rows: [],
      affectedRowCount: 0,
      lastInsertRowid: void 0
    };
  },
  1(r, msg) {
    msg.cols.push(r.message(Col2));
  },
  2(r, msg) {
    msg.rows.push(r.message(Row));
  },
  3(r, msg) {
    msg.affectedRowCount = Number(r.uint64());
  },
  4(r, msg) {
    msg.lastInsertRowid = r.sint64();
  }
};
var Col2 = {
  default() {
    return { name: void 0, decltype: void 0 };
  },
  1(r, msg) {
    msg.name = r.string();
  },
  2(r, msg) {
    msg.decltype = r.string();
  }
};
var Row = {
  default() {
    return [];
  },
  1(r, msg) {
    msg.push(r.message(Value4));
  }
};
var BatchResult2 = {
  default() {
    return { stepResults: /* @__PURE__ */ new Map(), stepErrors: /* @__PURE__ */ new Map() };
  },
  1(r, msg) {
    const [key, value] = r.message(BatchResultStepResult);
    msg.stepResults.set(key, value);
  },
  2(r, msg) {
    const [key, value] = r.message(BatchResultStepError);
    msg.stepErrors.set(key, value);
  }
};
var BatchResultStepResult = {
  default() {
    return [0, StmtResult2.default()];
  },
  1(r, msg) {
    msg[0] = r.uint32();
  },
  2(r, msg) {
    msg[1] = r.message(StmtResult2);
  }
};
var BatchResultStepError = {
  default() {
    return [0, Error3.default()];
  },
  1(r, msg) {
    msg[0] = r.uint32();
  },
  2(r, msg) {
    msg[1] = r.message(Error3);
  }
};
var CursorEntry2 = {
  default() {
    return { type: "none" };
  },
  1(r) {
    return r.message(StepBeginEntry);
  },
  2(r) {
    return r.message(StepEndEntry);
  },
  3(r) {
    return r.message(StepErrorEntry);
  },
  4(r) {
    return { type: "row", row: r.message(Row) };
  },
  5(r) {
    return { type: "error", error: r.message(Error3) };
  }
};
var StepBeginEntry = {
  default() {
    return { type: "step_begin", step: 0, cols: [] };
  },
  1(r, msg) {
    msg.step = r.uint32();
  },
  2(r, msg) {
    msg.cols.push(r.message(Col2));
  }
};
var StepEndEntry = {
  default() {
    return {
      type: "step_end",
      affectedRowCount: 0,
      lastInsertRowid: void 0
    };
  },
  1(r, msg) {
    msg.affectedRowCount = r.uint32();
  },
  2(r, msg) {
    msg.lastInsertRowid = r.uint64();
  }
};
var StepErrorEntry = {
  default() {
    return {
      type: "step_error",
      step: 0,
      error: Error3.default()
    };
  },
  1(r, msg) {
    msg.step = r.uint32();
  },
  2(r, msg) {
    msg.error = r.message(Error3);
  }
};
var DescribeResult2 = {
  default() {
    return {
      params: [],
      cols: [],
      isExplain: false,
      isReadonly: false
    };
  },
  1(r, msg) {
    msg.params.push(r.message(DescribeParam2));
  },
  2(r, msg) {
    msg.cols.push(r.message(DescribeCol2));
  },
  3(r, msg) {
    msg.isExplain = r.bool();
  },
  4(r, msg) {
    msg.isReadonly = r.bool();
  }
};
var DescribeParam2 = {
  default() {
    return { name: void 0 };
  },
  1(r, msg) {
    msg.name = r.string();
  }
};
var DescribeCol2 = {
  default() {
    return { name: "", decltype: void 0 };
  },
  1(r, msg) {
    msg.name = r.string();
  },
  2(r, msg) {
    msg.decltype = r.string();
  }
};
var Value4 = {
  default() {
    return void 0;
  },
  1(r) {
    return null;
  },
  2(r) {
    return r.sint64();
  },
  3(r) {
    return r.double();
  },
  4(r) {
    return r.string();
  },
  5(r) {
    return r.bytes();
  }
};

// node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_decode.js
var ServerMsg2 = {
  default() {
    return { type: "none" };
  },
  1(r) {
    return { type: "hello_ok" };
  },
  2(r) {
    return r.message(HelloErrorMsg);
  },
  3(r) {
    return r.message(ResponseOkMsg);
  },
  4(r) {
    return r.message(ResponseErrorMsg);
  }
};
var HelloErrorMsg = {
  default() {
    return { type: "hello_error", error: Error3.default() };
  },
  1(r, msg) {
    msg.error = r.message(Error3);
  }
};
var ResponseErrorMsg = {
  default() {
    return { type: "response_error", requestId: 0, error: Error3.default() };
  },
  1(r, msg) {
    msg.requestId = r.int32();
  },
  2(r, msg) {
    msg.error = r.message(Error3);
  }
};
var ResponseOkMsg = {
  default() {
    return {
      type: "response_ok",
      requestId: 0,
      response: { type: "none" }
    };
  },
  1(r, msg) {
    msg.requestId = r.int32();
  },
  2(r, msg) {
    msg.response = { type: "open_stream" };
  },
  3(r, msg) {
    msg.response = { type: "close_stream" };
  },
  4(r, msg) {
    msg.response = r.message(ExecuteResp);
  },
  5(r, msg) {
    msg.response = r.message(BatchResp);
  },
  6(r, msg) {
    msg.response = { type: "open_cursor" };
  },
  7(r, msg) {
    msg.response = { type: "close_cursor" };
  },
  8(r, msg) {
    msg.response = r.message(FetchCursorResp);
  },
  9(r, msg) {
    msg.response = { type: "sequence" };
  },
  10(r, msg) {
    msg.response = r.message(DescribeResp);
  },
  11(r, msg) {
    msg.response = { type: "store_sql" };
  },
  12(r, msg) {
    msg.response = { type: "close_sql" };
  },
  13(r, msg) {
    msg.response = r.message(GetAutocommitResp);
  }
};
var ExecuteResp = {
  default() {
    return { type: "execute", result: StmtResult2.default() };
  },
  1(r, msg) {
    msg.result = r.message(StmtResult2);
  }
};
var BatchResp = {
  default() {
    return { type: "batch", result: BatchResult2.default() };
  },
  1(r, msg) {
    msg.result = r.message(BatchResult2);
  }
};
var FetchCursorResp = {
  default() {
    return { type: "fetch_cursor", entries: [], done: false };
  },
  1(r, msg) {
    msg.entries.push(r.message(CursorEntry2));
  },
  2(r, msg) {
    msg.done = r.bool();
  }
};
var DescribeResp = {
  default() {
    return { type: "describe", result: DescribeResult2.default() };
  },
  1(r, msg) {
    msg.result = r.message(DescribeResult2);
  }
};
var GetAutocommitResp = {
  default() {
    return { type: "get_autocommit", isAutocommit: false };
  },
  1(r, msg) {
    msg.isAutocommit = r.bool();
  }
};

// node_modules/@libsql/hrana-client/lib-esm/ws/client.js
var subprotocolsV2 = /* @__PURE__ */ new Map([
  ["hrana2", { version: 2, encoding: "json" }],
  ["hrana1", { version: 1, encoding: "json" }]
]);
var subprotocolsV3 = /* @__PURE__ */ new Map([
  ["hrana3-protobuf", { version: 3, encoding: "protobuf" }],
  ["hrana3", { version: 3, encoding: "json" }],
  ["hrana2", { version: 2, encoding: "json" }],
  ["hrana1", { version: 1, encoding: "json" }]
]);
var WsClient = class extends Client {
  #socket;
  // List of callbacks that we queue until the socket transitions from the CONNECTING to the OPEN state.
  #openCallbacks;
  // Have we already transitioned from CONNECTING to OPEN and fired the callbacks in #openCallbacks?
  #opened;
  // Stores the error that caused us to close the client (and the socket). If we are not closed, this is
  // `undefined`.
  #closed;
  // Have we received a response to our "hello" from the server?
  #recvdHello;
  // Subprotocol negotiated with the server. It is only available after the socket transitions to the OPEN
  // state.
  #subprotocol;
  // Has the `getVersion()` function been called? This is only used to validate that the API is used
  // correctly.
  #getVersionCalled;
  // A map from request id to the responses that we expect to receive from the server.
  #responseMap;
  // An allocator of request ids.
  #requestIdAlloc;
  // An allocator of stream ids.
  /** @private */
  _streamIdAlloc;
  // An allocator of cursor ids.
  /** @private */
  _cursorIdAlloc;
  // An allocator of SQL text ids.
  #sqlIdAlloc;
  /** @private */
  constructor(socket, jwt) {
    super();
    this.#socket = socket;
    this.#openCallbacks = [];
    this.#opened = false;
    this.#closed = void 0;
    this.#recvdHello = false;
    this.#subprotocol = void 0;
    this.#getVersionCalled = false;
    this.#responseMap = /* @__PURE__ */ new Map();
    this.#requestIdAlloc = new IdAlloc();
    this._streamIdAlloc = new IdAlloc();
    this._cursorIdAlloc = new IdAlloc();
    this.#sqlIdAlloc = new IdAlloc();
    this.#socket.binaryType = "arraybuffer";
    this.#socket.addEventListener("open", () => this.#onSocketOpen());
    this.#socket.addEventListener("close", (event) => this.#onSocketClose(event));
    this.#socket.addEventListener("error", (event) => this.#onSocketError(event));
    this.#socket.addEventListener("message", (event) => this.#onSocketMessage(event));
    this.#send({ type: "hello", jwt });
  }
  // Send (or enqueue to send) a message to the server.
  #send(msg) {
    if (this.#closed !== void 0) {
      throw new InternalError("Trying to send a message on a closed client");
    }
    if (this.#opened) {
      this.#sendToSocket(msg);
    } else {
      const openCallback = () => this.#sendToSocket(msg);
      const errorCallback = () => void 0;
      this.#openCallbacks.push({ openCallback, errorCallback });
    }
  }
  // The socket transitioned from CONNECTING to OPEN
  #onSocketOpen() {
    const protocol = this.#socket.protocol;
    if (protocol === void 0) {
      this.#setClosed(new ClientError("The `WebSocket.protocol` property is undefined. This most likely means that the WebSocket implementation provided by the environment is broken. If you are using Miniflare 2, please update to Miniflare 3, which fixes this problem."));
      return;
    } else if (protocol === "") {
      this.#subprotocol = { version: 1, encoding: "json" };
    } else {
      this.#subprotocol = subprotocolsV3.get(protocol);
      if (this.#subprotocol === void 0) {
        this.#setClosed(new ProtoError(`Unrecognized WebSocket subprotocol: ${JSON.stringify(protocol)}`));
        return;
      }
    }
    for (const callbacks of this.#openCallbacks) {
      callbacks.openCallback();
    }
    this.#openCallbacks.length = 0;
    this.#opened = true;
  }
  #sendToSocket(msg) {
    const encoding = this.#subprotocol.encoding;
    if (encoding === "json") {
      const jsonMsg = writeJsonObject(msg, ClientMsg);
      this.#socket.send(jsonMsg);
    } else if (encoding === "protobuf") {
      const protobufMsg = writeProtobufMessage(msg, ClientMsg2);
      this.#socket.send(protobufMsg);
    } else {
      throw impossible(encoding, "Impossible encoding");
    }
  }
  /** Get the protocol version negotiated with the server, possibly waiting until the socket is open. */
  getVersion() {
    return new Promise((versionCallback, errorCallback) => {
      this.#getVersionCalled = true;
      if (this.#closed !== void 0) {
        errorCallback(this.#closed);
      } else if (!this.#opened) {
        const openCallback = () => versionCallback(this.#subprotocol.version);
        this.#openCallbacks.push({ openCallback, errorCallback });
      } else {
        versionCallback(this.#subprotocol.version);
      }
    });
  }
  // Make sure that the negotiated version is at least `minVersion`.
  /** @private */
  _ensureVersion(minVersion, feature) {
    if (this.#subprotocol === void 0 || !this.#getVersionCalled) {
      throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the version supported by the WebSocket server is not yet known. Use Client.getVersion() to wait until the version is available.`);
    } else if (this.#subprotocol.version < minVersion) {
      throw new ProtocolVersionError(`${feature} is supported on protocol version ${minVersion} and higher, but the WebSocket server only supports version ${this.#subprotocol.version}`);
    }
  }
  // Send a request to the server and invoke a callback when we get the response.
  /** @private */
  _sendRequest(request, callbacks) {
    if (this.#closed !== void 0) {
      callbacks.errorCallback(new ClosedError("Client is closed", this.#closed));
      return;
    }
    const requestId = this.#requestIdAlloc.alloc();
    this.#responseMap.set(requestId, { ...callbacks, type: request.type });
    this.#send({ type: "request", requestId, request });
  }
  // The socket encountered an error.
  #onSocketError(event) {
    const eventMessage = event.message;
    const message = eventMessage ?? "WebSocket was closed due to an error";
    this.#setClosed(new WebSocketError(message));
  }
  // The socket was closed.
  #onSocketClose(event) {
    let message = `WebSocket was closed with code ${event.code}`;
    if (event.reason) {
      message += `: ${event.reason}`;
    }
    this.#setClosed(new WebSocketError(message));
  }
  // Close the client with the given error.
  #setClosed(error) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#closed = error;
    for (const callbacks of this.#openCallbacks) {
      callbacks.errorCallback(error);
    }
    this.#openCallbacks.length = 0;
    for (const [requestId, responseState] of this.#responseMap.entries()) {
      responseState.errorCallback(error);
      this.#requestIdAlloc.free(requestId);
    }
    this.#responseMap.clear();
    this.#socket.close();
  }
  // We received a message from the socket.
  #onSocketMessage(event) {
    if (this.#closed !== void 0) {
      return;
    }
    try {
      let msg;
      const encoding = this.#subprotocol.encoding;
      if (encoding === "json") {
        if (typeof event.data !== "string") {
          this.#socket.close(3003, "Only text messages are accepted with JSON encoding");
          this.#setClosed(new ProtoError("Received non-text message from server with JSON encoding"));
          return;
        }
        msg = readJsonObject(JSON.parse(event.data), ServerMsg);
      } else if (encoding === "protobuf") {
        if (!(event.data instanceof ArrayBuffer)) {
          this.#socket.close(3003, "Only binary messages are accepted with Protobuf encoding");
          this.#setClosed(new ProtoError("Received non-binary message from server with Protobuf encoding"));
          return;
        }
        msg = readProtobufMessage(new Uint8Array(event.data), ServerMsg2);
      } else {
        throw impossible(encoding, "Impossible encoding");
      }
      this.#handleMsg(msg);
    } catch (e) {
      this.#socket.close(3007, "Could not handle message");
      this.#setClosed(e);
    }
  }
  // Handle a message from the server.
  #handleMsg(msg) {
    if (msg.type === "none") {
      throw new ProtoError("Received an unrecognized ServerMsg");
    } else if (msg.type === "hello_ok" || msg.type === "hello_error") {
      if (this.#recvdHello) {
        throw new ProtoError("Received a duplicated hello response");
      }
      this.#recvdHello = true;
      if (msg.type === "hello_error") {
        throw errorFromProto(msg.error);
      }
      return;
    } else if (!this.#recvdHello) {
      throw new ProtoError("Received a non-hello message before a hello response");
    }
    if (msg.type === "response_ok") {
      const requestId = msg.requestId;
      const responseState = this.#responseMap.get(requestId);
      this.#responseMap.delete(requestId);
      if (responseState === void 0) {
        throw new ProtoError("Received unexpected OK response");
      }
      this.#requestIdAlloc.free(requestId);
      try {
        if (responseState.type !== msg.response.type) {
          console.dir({ responseState, msg });
          throw new ProtoError("Received unexpected type of response");
        }
        responseState.responseCallback(msg.response);
      } catch (e) {
        responseState.errorCallback(e);
        throw e;
      }
    } else if (msg.type === "response_error") {
      const requestId = msg.requestId;
      const responseState = this.#responseMap.get(requestId);
      this.#responseMap.delete(requestId);
      if (responseState === void 0) {
        throw new ProtoError("Received unexpected error response");
      }
      this.#requestIdAlloc.free(requestId);
      responseState.errorCallback(errorFromProto(msg.error));
    } else {
      throw impossible(msg, "Impossible ServerMsg type");
    }
  }
  /** Open a {@link WsStream}, a stream for executing SQL statements. */
  openStream() {
    return WsStream.open(this);
  }
  /** Cache a SQL text on the server. This requires protocol version 2 or higher. */
  storeSql(sql) {
    this._ensureVersion(2, "storeSql()");
    const sqlId = this.#sqlIdAlloc.alloc();
    const sqlObj = new Sql(this, sqlId);
    const responseCallback = () => void 0;
    const errorCallback = (e) => sqlObj._setClosed(e);
    const request = { type: "store_sql", sqlId, sql };
    this._sendRequest(request, { responseCallback, errorCallback });
    return sqlObj;
  }
  /** @private */
  _closeSql(sqlId) {
    if (this.#closed !== void 0) {
      return;
    }
    const responseCallback = () => this.#sqlIdAlloc.free(sqlId);
    const errorCallback = (e) => this.#setClosed(e);
    const request = { type: "close_sql", sqlId };
    this._sendRequest(request, { responseCallback, errorCallback });
  }
  /** Close the client and the WebSocket. */
  close() {
    this.#setClosed(new ClientError("Client was manually closed"));
  }
  /** True if the client is closed. */
  get closed() {
    return this.#closed !== void 0;
  }
};

// node_modules/@libsql/hrana-client/lib-esm/queue_microtask.js
var _queueMicrotask;
if (typeof queueMicrotask !== "undefined") {
  _queueMicrotask = queueMicrotask;
} else {
  const resolved = Promise.resolve();
  _queueMicrotask = (callback) => {
    resolved.then(callback);
  };
}

// node_modules/@libsql/hrana-client/lib-esm/byte_queue.js
var ByteQueue = class {
  #array;
  #shiftPos;
  #pushPos;
  constructor(initialCap) {
    this.#array = new Uint8Array(new ArrayBuffer(initialCap));
    this.#shiftPos = 0;
    this.#pushPos = 0;
  }
  get length() {
    return this.#pushPos - this.#shiftPos;
  }
  data() {
    return this.#array.slice(this.#shiftPos, this.#pushPos);
  }
  push(chunk) {
    this.#ensurePush(chunk.byteLength);
    this.#array.set(chunk, this.#pushPos);
    this.#pushPos += chunk.byteLength;
  }
  #ensurePush(pushLength) {
    if (this.#pushPos + pushLength <= this.#array.byteLength) {
      return;
    }
    const filledLength = this.#pushPos - this.#shiftPos;
    if (filledLength + pushLength <= this.#array.byteLength && 2 * this.#pushPos >= this.#array.byteLength) {
      this.#array.copyWithin(0, this.#shiftPos, this.#pushPos);
    } else {
      let newCap = this.#array.byteLength;
      do {
        newCap *= 2;
      } while (filledLength + pushLength > newCap);
      const newArray = new Uint8Array(new ArrayBuffer(newCap));
      newArray.set(this.#array.slice(this.#shiftPos, this.#pushPos), 0);
      this.#array = newArray;
    }
    this.#pushPos = filledLength;
    this.#shiftPos = 0;
  }
  shift(length) {
    this.#shiftPos += length;
  }
};

// node_modules/@libsql/hrana-client/lib-esm/http/json_decode.js
function PipelineRespBody(obj) {
  const baton = stringOpt(obj["baton"]);
  const baseUrl = stringOpt(obj["base_url"]);
  const results = arrayObjectsMap(obj["results"], StreamResult);
  return { baton, baseUrl, results };
}
function StreamResult(obj) {
  const type = string(obj["type"]);
  if (type === "ok") {
    const response = StreamResponse(object(obj["response"]));
    return { type: "ok", response };
  } else if (type === "error") {
    const error = Error2(object(obj["error"]));
    return { type: "error", error };
  } else {
    throw new ProtoError("Unexpected type of StreamResult");
  }
}
function StreamResponse(obj) {
  const type = string(obj["type"]);
  if (type === "close") {
    return { type: "close" };
  } else if (type === "execute") {
    const result = StmtResult(object(obj["result"]));
    return { type: "execute", result };
  } else if (type === "batch") {
    const result = BatchResult(object(obj["result"]));
    return { type: "batch", result };
  } else if (type === "sequence") {
    return { type: "sequence" };
  } else if (type === "describe") {
    const result = DescribeResult(object(obj["result"]));
    return { type: "describe", result };
  } else if (type === "store_sql") {
    return { type: "store_sql" };
  } else if (type === "close_sql") {
    return { type: "close_sql" };
  } else if (type === "get_autocommit") {
    const isAutocommit = boolean(obj["is_autocommit"]);
    return { type: "get_autocommit", isAutocommit };
  } else {
    throw new ProtoError("Unexpected type of StreamResponse");
  }
}
function CursorRespBody(obj) {
  const baton = stringOpt(obj["baton"]);
  const baseUrl = stringOpt(obj["base_url"]);
  return { baton, baseUrl };
}

// node_modules/@libsql/hrana-client/lib-esm/http/protobuf_decode.js
var PipelineRespBody2 = {
  default() {
    return { baton: void 0, baseUrl: void 0, results: [] };
  },
  1(r, msg) {
    msg.baton = r.string();
  },
  2(r, msg) {
    msg.baseUrl = r.string();
  },
  3(r, msg) {
    msg.results.push(r.message(StreamResult2));
  }
};
var StreamResult2 = {
  default() {
    return { type: "none" };
  },
  1(r) {
    return { type: "ok", response: r.message(StreamResponse2) };
  },
  2(r) {
    return { type: "error", error: r.message(Error3) };
  }
};
var StreamResponse2 = {
  default() {
    return { type: "none" };
  },
  1(r) {
    return { type: "close" };
  },
  2(r) {
    return r.message(ExecuteStreamResp);
  },
  3(r) {
    return r.message(BatchStreamResp);
  },
  4(r) {
    return { type: "sequence" };
  },
  5(r) {
    return r.message(DescribeStreamResp);
  },
  6(r) {
    return { type: "store_sql" };
  },
  7(r) {
    return { type: "close_sql" };
  },
  8(r) {
    return r.message(GetAutocommitStreamResp);
  }
};
var ExecuteStreamResp = {
  default() {
    return { type: "execute", result: StmtResult2.default() };
  },
  1(r, msg) {
    msg.result = r.message(StmtResult2);
  }
};
var BatchStreamResp = {
  default() {
    return { type: "batch", result: BatchResult2.default() };
  },
  1(r, msg) {
    msg.result = r.message(BatchResult2);
  }
};
var DescribeStreamResp = {
  default() {
    return { type: "describe", result: DescribeResult2.default() };
  },
  1(r, msg) {
    msg.result = r.message(DescribeResult2);
  }
};
var GetAutocommitStreamResp = {
  default() {
    return { type: "get_autocommit", isAutocommit: false };
  },
  1(r, msg) {
    msg.isAutocommit = r.bool();
  }
};
var CursorRespBody2 = {
  default() {
    return { baton: void 0, baseUrl: void 0 };
  },
  1(r, msg) {
    msg.baton = r.string();
  },
  2(r, msg) {
    msg.baseUrl = r.string();
  }
};

// node_modules/@libsql/hrana-client/lib-esm/http/cursor.js
var HttpCursor = class extends Cursor {
  #stream;
  #encoding;
  #reader;
  #queue;
  #closed;
  #done;
  /** @private */
  constructor(stream, encoding) {
    super();
    this.#stream = stream;
    this.#encoding = encoding;
    this.#reader = void 0;
    this.#queue = new ByteQueue(16 * 1024);
    this.#closed = void 0;
    this.#done = false;
  }
  async open(response) {
    if (response.body === null) {
      throw new ProtoError("No response body for cursor request");
    }
    this.#reader = response.body[Symbol.asyncIterator]();
    const respBody = await this.#nextItem(CursorRespBody, CursorRespBody2);
    if (respBody === void 0) {
      throw new ProtoError("Empty response to cursor request");
    }
    return respBody;
  }
  /** Fetch the next entry from the cursor. */
  next() {
    return this.#nextItem(CursorEntry, CursorEntry2);
  }
  /** Close the cursor. */
  close() {
    this._setClosed(new ClientError("Cursor was manually closed"));
  }
  /** @private */
  _setClosed(error) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#closed = error;
    this.#stream._cursorClosed(this);
    if (this.#reader !== void 0) {
      this.#reader.return();
    }
  }
  /** True if the cursor is closed. */
  get closed() {
    return this.#closed !== void 0;
  }
  async #nextItem(jsonFun, protobufDef) {
    for (; ; ) {
      if (this.#done) {
        return void 0;
      } else if (this.#closed !== void 0) {
        throw new ClosedError("Cursor is closed", this.#closed);
      }
      if (this.#encoding === "json") {
        const jsonData = this.#parseItemJson();
        if (jsonData !== void 0) {
          const jsonText = new TextDecoder().decode(jsonData);
          const jsonValue = JSON.parse(jsonText);
          return readJsonObject(jsonValue, jsonFun);
        }
      } else if (this.#encoding === "protobuf") {
        const protobufData = this.#parseItemProtobuf();
        if (protobufData !== void 0) {
          return readProtobufMessage(protobufData, protobufDef);
        }
      } else {
        throw impossible(this.#encoding, "Impossible encoding");
      }
      if (this.#reader === void 0) {
        throw new InternalError("Attempted to read from HTTP cursor before it was opened");
      }
      const { value, done } = await this.#reader.next();
      if (done && this.#queue.length === 0) {
        this.#done = true;
      } else if (done) {
        throw new ProtoError("Unexpected end of cursor stream");
      } else {
        this.#queue.push(value);
      }
    }
  }
  #parseItemJson() {
    const data = this.#queue.data();
    const newlineByte = 10;
    const newlinePos = data.indexOf(newlineByte);
    if (newlinePos < 0) {
      return void 0;
    }
    const jsonData = data.slice(0, newlinePos);
    this.#queue.shift(newlinePos + 1);
    return jsonData;
  }
  #parseItemProtobuf() {
    const data = this.#queue.data();
    let varintValue = 0;
    let varintLength = 0;
    for (; ; ) {
      if (varintLength >= data.byteLength) {
        return void 0;
      }
      const byte = data[varintLength];
      varintValue |= (byte & 127) << 7 * varintLength;
      varintLength += 1;
      if (!(byte & 128)) {
        break;
      }
    }
    if (data.byteLength < varintLength + varintValue) {
      return void 0;
    }
    const protobufData = data.slice(varintLength, varintLength + varintValue);
    this.#queue.shift(varintLength + varintValue);
    return protobufData;
  }
};

// node_modules/@libsql/hrana-client/lib-esm/http/json_encode.js
function PipelineReqBody(w, msg) {
  if (msg.baton !== void 0) {
    w.string("baton", msg.baton);
  }
  w.arrayObjects("requests", msg.requests, StreamRequest);
}
function StreamRequest(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "close") {
  } else if (msg.type === "execute") {
    w.object("stmt", msg.stmt, Stmt2);
  } else if (msg.type === "batch") {
    w.object("batch", msg.batch, Batch2);
  } else if (msg.type === "sequence") {
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "describe") {
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "store_sql") {
    w.number("sql_id", msg.sqlId);
    w.string("sql", msg.sql);
  } else if (msg.type === "close_sql") {
    w.number("sql_id", msg.sqlId);
  } else if (msg.type === "get_autocommit") {
  } else {
    throw impossible(msg, "Impossible type of StreamRequest");
  }
}
function CursorReqBody(w, msg) {
  if (msg.baton !== void 0) {
    w.string("baton", msg.baton);
  }
  w.object("batch", msg.batch, Batch2);
}

// node_modules/@libsql/hrana-client/lib-esm/http/protobuf_encode.js
function PipelineReqBody2(w, msg) {
  if (msg.baton !== void 0) {
    w.string(1, msg.baton);
  }
  for (const req of msg.requests) {
    w.message(2, req, StreamRequest2);
  }
}
function StreamRequest2(w, msg) {
  if (msg.type === "close") {
    w.message(1, msg, CloseStreamReq2);
  } else if (msg.type === "execute") {
    w.message(2, msg, ExecuteStreamReq);
  } else if (msg.type === "batch") {
    w.message(3, msg, BatchStreamReq);
  } else if (msg.type === "sequence") {
    w.message(4, msg, SequenceStreamReq);
  } else if (msg.type === "describe") {
    w.message(5, msg, DescribeStreamReq);
  } else if (msg.type === "store_sql") {
    w.message(6, msg, StoreSqlStreamReq);
  } else if (msg.type === "close_sql") {
    w.message(7, msg, CloseSqlStreamReq);
  } else if (msg.type === "get_autocommit") {
    w.message(8, msg, GetAutocommitStreamReq);
  } else {
    throw impossible(msg, "Impossible type of StreamRequest");
  }
}
function CloseStreamReq2(_w, _msg) {
}
function ExecuteStreamReq(w, msg) {
  w.message(1, msg.stmt, Stmt3);
}
function BatchStreamReq(w, msg) {
  w.message(1, msg.batch, Batch3);
}
function SequenceStreamReq(w, msg) {
  if (msg.sql !== void 0) {
    w.string(1, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(2, msg.sqlId);
  }
}
function DescribeStreamReq(w, msg) {
  if (msg.sql !== void 0) {
    w.string(1, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(2, msg.sqlId);
  }
}
function StoreSqlStreamReq(w, msg) {
  w.int32(1, msg.sqlId);
  w.string(2, msg.sql);
}
function CloseSqlStreamReq(w, msg) {
  w.int32(1, msg.sqlId);
}
function GetAutocommitStreamReq(_w, _msg) {
}
function CursorReqBody2(w, msg) {
  if (msg.baton !== void 0) {
    w.string(1, msg.baton);
  }
  w.message(2, msg.batch, Batch3);
}

// node_modules/@libsql/hrana-client/lib-esm/http/stream.js
var HttpStream = class extends Stream {
  #client;
  #baseUrl;
  #jwt;
  #fetch;
  #remoteEncryptionKey;
  #baton;
  #queue;
  #flushing;
  #cursor;
  #closing;
  #closeQueued;
  #closed;
  #sqlIdAlloc;
  /** @private */
  constructor(client2, baseUrl, jwt, customFetch, remoteEncryptionKey) {
    super(client2.intMode);
    this.#client = client2;
    this.#baseUrl = baseUrl.toString();
    this.#jwt = jwt;
    this.#fetch = customFetch;
    this.#remoteEncryptionKey = remoteEncryptionKey;
    this.#baton = void 0;
    this.#queue = new Queue();
    this.#flushing = false;
    this.#closing = false;
    this.#closeQueued = false;
    this.#closed = void 0;
    this.#sqlIdAlloc = new IdAlloc();
  }
  /** Get the {@link HttpClient} object that this stream belongs to. */
  client() {
    return this.#client;
  }
  /** @private */
  _sqlOwner() {
    return this;
  }
  /** Cache a SQL text on the server. */
  storeSql(sql) {
    const sqlId = this.#sqlIdAlloc.alloc();
    this.#sendStreamRequest({ type: "store_sql", sqlId, sql }).then(() => void 0, (error) => this._setClosed(error));
    return new Sql(this, sqlId);
  }
  /** @private */
  _closeSql(sqlId) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#sendStreamRequest({ type: "close_sql", sqlId }).then(() => this.#sqlIdAlloc.free(sqlId), (error) => this._setClosed(error));
  }
  /** @private */
  _execute(stmt) {
    return this.#sendStreamRequest({ type: "execute", stmt }).then((response) => {
      return response.result;
    });
  }
  /** @private */
  _batch(batch) {
    return this.#sendStreamRequest({ type: "batch", batch }).then((response) => {
      return response.result;
    });
  }
  /** @private */
  _describe(protoSql) {
    return this.#sendStreamRequest({
      type: "describe",
      sql: protoSql.sql,
      sqlId: protoSql.sqlId
    }).then((response) => {
      return response.result;
    });
  }
  /** @private */
  _sequence(protoSql) {
    return this.#sendStreamRequest({
      type: "sequence",
      sql: protoSql.sql,
      sqlId: protoSql.sqlId
    }).then((_response) => {
      return void 0;
    });
  }
  /** Check whether the SQL connection underlying this stream is in autocommit state (i.e., outside of an
   * explicit transaction). This requires protocol version 3 or higher.
   */
  getAutocommit() {
    this.#client._ensureVersion(3, "getAutocommit()");
    return this.#sendStreamRequest({
      type: "get_autocommit"
    }).then((response) => {
      return response.isAutocommit;
    });
  }
  #sendStreamRequest(request) {
    return new Promise((responseCallback, errorCallback) => {
      this.#pushToQueue({ type: "pipeline", request, responseCallback, errorCallback });
    });
  }
  /** @private */
  _openCursor(batch) {
    return new Promise((cursorCallback, errorCallback) => {
      this.#pushToQueue({ type: "cursor", batch, cursorCallback, errorCallback });
    });
  }
  /** @private */
  _cursorClosed(cursor) {
    if (cursor !== this.#cursor) {
      throw new InternalError("Cursor was closed, but it was not associated with the stream");
    }
    this.#cursor = void 0;
    _queueMicrotask(() => this.#flushQueue());
  }
  /** Immediately close the stream. */
  close() {
    this._setClosed(new ClientError("Stream was manually closed"));
  }
  /** Gracefully close the stream. */
  closeGracefully() {
    this.#closing = true;
    _queueMicrotask(() => this.#flushQueue());
  }
  /** True if the stream is closed. */
  get closed() {
    return this.#closed !== void 0 || this.#closing;
  }
  /** @private */
  _setClosed(error) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#closed = error;
    if (this.#cursor !== void 0) {
      this.#cursor._setClosed(error);
    }
    this.#client._streamClosed(this);
    for (; ; ) {
      const entry = this.#queue.shift();
      if (entry !== void 0) {
        entry.errorCallback(error);
      } else {
        break;
      }
    }
    if ((this.#baton !== void 0 || this.#flushing) && !this.#closeQueued) {
      this.#queue.push({
        type: "pipeline",
        request: { type: "close" },
        responseCallback: () => void 0,
        errorCallback: () => void 0
      });
      this.#closeQueued = true;
      _queueMicrotask(() => this.#flushQueue());
    }
  }
  #pushToQueue(entry) {
    if (this.#closed !== void 0) {
      throw new ClosedError("Stream is closed", this.#closed);
    } else if (this.#closing) {
      throw new ClosedError("Stream is closing", void 0);
    } else {
      this.#queue.push(entry);
      _queueMicrotask(() => this.#flushQueue());
    }
  }
  #flushQueue() {
    if (this.#flushing || this.#cursor !== void 0) {
      return;
    }
    if (this.#closing && this.#queue.length === 0) {
      this._setClosed(new ClientError("Stream was gracefully closed"));
      return;
    }
    const endpoint = this.#client._endpoint;
    if (endpoint === void 0) {
      this.#client._endpointPromise.then(() => this.#flushQueue(), (error) => this._setClosed(error));
      return;
    }
    const firstEntry = this.#queue.shift();
    if (firstEntry === void 0) {
      return;
    } else if (firstEntry.type === "pipeline") {
      const pipeline = [firstEntry];
      for (; ; ) {
        const entry = this.#queue.first();
        if (entry !== void 0 && entry.type === "pipeline") {
          pipeline.push(entry);
          this.#queue.shift();
        } else if (entry === void 0 && this.#closing && !this.#closeQueued) {
          pipeline.push({
            type: "pipeline",
            request: { type: "close" },
            responseCallback: () => void 0,
            errorCallback: () => void 0
          });
          this.#closeQueued = true;
          break;
        } else {
          break;
        }
      }
      this.#flushPipeline(endpoint, pipeline);
    } else if (firstEntry.type === "cursor") {
      this.#flushCursor(endpoint, firstEntry);
    } else {
      throw impossible(firstEntry, "Impossible type of QueueEntry");
    }
  }
  #flushPipeline(endpoint, pipeline) {
    this.#flush(() => this.#createPipelineRequest(pipeline, endpoint), (resp) => decodePipelineResponse(resp, endpoint.encoding), (respBody) => respBody.baton, (respBody) => respBody.baseUrl, (respBody) => handlePipelineResponse(pipeline, respBody), (error) => pipeline.forEach((entry) => entry.errorCallback(error)));
  }
  #flushCursor(endpoint, entry) {
    const cursor = new HttpCursor(this, endpoint.encoding);
    this.#cursor = cursor;
    this.#flush(() => this.#createCursorRequest(entry, endpoint), (resp) => cursor.open(resp), (respBody) => respBody.baton, (respBody) => respBody.baseUrl, (_respBody) => entry.cursorCallback(cursor), (error) => entry.errorCallback(error));
  }
  #flush(createRequest, decodeResponse, getBaton, getBaseUrl, handleResponse, handleError) {
    let promise;
    try {
      const request = createRequest();
      const fetch2 = this.#fetch;
      promise = fetch2(request);
    } catch (error) {
      promise = Promise.reject(error);
    }
    this.#flushing = true;
    promise.then((resp) => {
      if (!resp.ok) {
        return errorFromResponse(resp).then((error) => {
          throw error;
        });
      }
      return decodeResponse(resp);
    }).then((r) => {
      this.#baton = getBaton(r);
      this.#baseUrl = getBaseUrl(r) ?? this.#baseUrl;
      handleResponse(r);
    }).catch((error) => {
      this._setClosed(error);
      handleError(error);
    }).finally(() => {
      this.#flushing = false;
      this.#flushQueue();
    });
  }
  #createPipelineRequest(pipeline, endpoint) {
    return this.#createRequest(new URL(endpoint.pipelinePath, this.#baseUrl), {
      baton: this.#baton,
      requests: pipeline.map((entry) => entry.request)
    }, endpoint.encoding, PipelineReqBody, PipelineReqBody2);
  }
  #createCursorRequest(entry, endpoint) {
    if (endpoint.cursorPath === void 0) {
      throw new ProtocolVersionError(`Cursors are supported only on protocol version 3 and higher, but the HTTP server only supports version ${endpoint.version}.`);
    }
    return this.#createRequest(new URL(endpoint.cursorPath, this.#baseUrl), {
      baton: this.#baton,
      batch: entry.batch
    }, endpoint.encoding, CursorReqBody, CursorReqBody2);
  }
  #createRequest(url, reqBody, encoding, jsonFun, protobufFun) {
    let bodyData;
    let contentType;
    if (encoding === "json") {
      bodyData = writeJsonObject(reqBody, jsonFun);
      contentType = "application/json";
    } else if (encoding === "protobuf") {
      bodyData = writeProtobufMessage(reqBody, protobufFun);
      contentType = "application/x-protobuf";
    } else {
      throw impossible(encoding, "Impossible encoding");
    }
    const headers = new Headers();
    headers.set("content-type", contentType);
    if (this.#jwt !== void 0) {
      headers.set("authorization", `Bearer ${this.#jwt}`);
    }
    if (this.#remoteEncryptionKey !== void 0) {
      headers.set("x-turso-encryption-key", this.#remoteEncryptionKey);
    }
    return new Request(url.toString(), { method: "POST", headers, body: bodyData });
  }
};
function handlePipelineResponse(pipeline, respBody) {
  if (respBody.results.length !== pipeline.length) {
    throw new ProtoError("Server returned unexpected number of pipeline results");
  }
  for (let i = 0; i < pipeline.length; ++i) {
    const result = respBody.results[i];
    const entry = pipeline[i];
    if (result.type === "ok") {
      if (result.response.type !== entry.request.type) {
        throw new ProtoError("Received unexpected type of response");
      }
      entry.responseCallback(result.response);
    } else if (result.type === "error") {
      entry.errorCallback(errorFromProto(result.error));
    } else if (result.type === "none") {
      throw new ProtoError("Received unrecognized type of StreamResult");
    } else {
      throw impossible(result, "Received impossible type of StreamResult");
    }
  }
}
async function decodePipelineResponse(resp, encoding) {
  if (encoding === "json") {
    const respJson = await resp.json();
    return readJsonObject(respJson, PipelineRespBody);
  }
  if (encoding === "protobuf") {
    const respData = await resp.arrayBuffer();
    return readProtobufMessage(new Uint8Array(respData), PipelineRespBody2);
  }
  await resp.body?.cancel();
  throw impossible(encoding, "Impossible encoding");
}
async function errorFromResponse(resp) {
  const respType = resp.headers.get("content-type") ?? "text/plain";
  let message = `Server returned HTTP status ${resp.status}`;
  if (respType === "application/json") {
    const respBody = await resp.json();
    if ("message" in respBody) {
      return errorFromProto(respBody);
    }
    return new HttpServerError(message, resp.status);
  }
  if (respType === "text/plain") {
    const respBody = (await resp.text()).trim();
    if (respBody !== "") {
      message += `: ${respBody}`;
    }
    return new HttpServerError(message, resp.status);
  }
  await resp.body?.cancel();
  return new HttpServerError(message, resp.status);
}

// node_modules/@libsql/hrana-client/lib-esm/http/client.js
var checkEndpoints = [
  {
    versionPath: "v3-protobuf",
    pipelinePath: "v3-protobuf/pipeline",
    cursorPath: "v3-protobuf/cursor",
    version: 3,
    encoding: "protobuf"
  }
  /*
  {
      versionPath: "v3",
      pipelinePath: "v3/pipeline",
      cursorPath: "v3/cursor",
      version: 3,
      encoding: "json",
  },
  */
];
var fallbackEndpoint = {
  versionPath: "v2",
  pipelinePath: "v2/pipeline",
  cursorPath: void 0,
  version: 2,
  encoding: "json"
};
var HttpClient = class extends Client {
  #url;
  #jwt;
  #fetch;
  #remoteEncryptionKey;
  #closed;
  #streams;
  /** @private */
  _endpointPromise;
  /** @private */
  _endpoint;
  /** @private */
  constructor(url, jwt, customFetch, remoteEncryptionKey, protocolVersion = 2) {
    super();
    this.#url = url;
    this.#jwt = jwt;
    this.#fetch = customFetch ?? globalThis.fetch;
    this.#remoteEncryptionKey = remoteEncryptionKey;
    this.#closed = void 0;
    this.#streams = /* @__PURE__ */ new Set();
    if (protocolVersion == 3) {
      this._endpointPromise = findEndpoint(this.#fetch, this.#url);
      this._endpointPromise.then((endpoint) => this._endpoint = endpoint, (error) => this.#setClosed(error));
    } else {
      this._endpointPromise = Promise.resolve(fallbackEndpoint);
      this._endpointPromise.then((endpoint) => this._endpoint = endpoint, (error) => this.#setClosed(error));
    }
  }
  /** Get the protocol version supported by the server. */
  async getVersion() {
    if (this._endpoint !== void 0) {
      return this._endpoint.version;
    }
    return (await this._endpointPromise).version;
  }
  // Make sure that the negotiated version is at least `minVersion`.
  /** @private */
  _ensureVersion(minVersion, feature) {
    if (minVersion <= fallbackEndpoint.version) {
      return;
    } else if (this._endpoint === void 0) {
      throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the version supported by the HTTP server is not yet known. Use Client.getVersion() to wait until the version is available.`);
    } else if (this._endpoint.version < minVersion) {
      throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the HTTP server only supports version ${this._endpoint.version}.`);
    }
  }
  /** Open a {@link HttpStream}, a stream for executing SQL statements. */
  openStream() {
    if (this.#closed !== void 0) {
      throw new ClosedError("Client is closed", this.#closed);
    }
    const stream = new HttpStream(this, this.#url, this.#jwt, this.#fetch, this.#remoteEncryptionKey);
    this.#streams.add(stream);
    return stream;
  }
  /** @private */
  _streamClosed(stream) {
    this.#streams.delete(stream);
  }
  /** Close the client and all its streams. */
  close() {
    this.#setClosed(new ClientError("Client was manually closed"));
  }
  /** True if the client is closed. */
  get closed() {
    return this.#closed !== void 0;
  }
  #setClosed(error) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#closed = error;
    for (const stream of Array.from(this.#streams)) {
      stream._setClosed(new ClosedError("Client was closed", error));
    }
  }
};
async function findEndpoint(customFetch, clientUrl) {
  const fetch2 = customFetch;
  for (const endpoint of checkEndpoints) {
    const url = new URL(endpoint.versionPath, clientUrl);
    const request = new Request(url.toString(), { method: "GET" });
    const response = await fetch2(request);
    await response.arrayBuffer();
    if (response.ok) {
      return endpoint;
    }
  }
  return fallbackEndpoint;
}

// node_modules/@libsql/hrana-client/lib-esm/index.js
function openWs(url, jwt, protocolVersion = 2) {
  if (typeof import_websocket.default === "undefined") {
    throw new WebSocketUnsupportedError("WebSockets are not supported in this environment");
  }
  var subprotocols = void 0;
  if (protocolVersion == 3) {
    subprotocols = Array.from(subprotocolsV3.keys());
  } else {
    subprotocols = Array.from(subprotocolsV2.keys());
  }
  const socket = new import_websocket.default(url, subprotocols);
  return new WsClient(socket, jwt);
}
function openHttp(url, jwt, customFetch, remoteEncryptionKey, protocolVersion = 2) {
  return new HttpClient(url instanceof URL ? url : new URL(url), jwt, customFetch, remoteEncryptionKey, protocolVersion);
}

// node_modules/@libsql/client/lib-esm/hrana.js
var HranaTransaction = class {
  #mode;
  #version;
  // Promise that is resolved when the BEGIN statement completes, or `undefined` if we haven't executed the
  // BEGIN statement yet.
  #started;
  /** @private */
  constructor(mode, version2) {
    this.#mode = mode;
    this.#version = version2;
    this.#started = void 0;
  }
  execute(stmt) {
    return this.batch([stmt]).then((results) => results[0]);
  }
  async batch(stmts) {
    const stream = this._getStream();
    if (stream.closed) {
      throw new LibsqlError("Cannot execute statements because the transaction is closed", "TRANSACTION_CLOSED");
    }
    try {
      const hranaStmts = stmts.map(stmtToHrana);
      let rowsPromises;
      if (this.#started === void 0) {
        this._getSqlCache().apply(hranaStmts);
        const batch = stream.batch(this.#version >= 3);
        const beginStep = batch.step();
        const beginPromise = beginStep.run(transactionModeToBegin(this.#mode));
        let lastStep = beginStep;
        rowsPromises = hranaStmts.map((hranaStmt) => {
          const stmtStep = batch.step().condition(BatchCond.ok(lastStep));
          if (this.#version >= 3) {
            stmtStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
          }
          const rowsPromise = stmtStep.query(hranaStmt);
          rowsPromise.catch(() => void 0);
          lastStep = stmtStep;
          return rowsPromise;
        });
        this.#started = batch.execute().then(() => beginPromise).then(() => void 0);
        try {
          await this.#started;
        } catch (e) {
          this.close();
          throw e;
        }
      } else {
        if (this.#version < 3) {
          await this.#started;
        } else {
        }
        this._getSqlCache().apply(hranaStmts);
        const batch = stream.batch(this.#version >= 3);
        let lastStep = void 0;
        rowsPromises = hranaStmts.map((hranaStmt) => {
          const stmtStep = batch.step();
          if (lastStep !== void 0) {
            stmtStep.condition(BatchCond.ok(lastStep));
          }
          if (this.#version >= 3) {
            stmtStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
          }
          const rowsPromise = stmtStep.query(hranaStmt);
          rowsPromise.catch(() => void 0);
          lastStep = stmtStep;
          return rowsPromise;
        });
        await batch.execute();
      }
      const resultSets = [];
      for (let i = 0; i < rowsPromises.length; i++) {
        try {
          const rows = await rowsPromises[i];
          if (rows === void 0) {
            throw new LibsqlBatchError("Statement in a transaction was not executed, probably because the transaction has been rolled back", i, "TRANSACTION_CLOSED");
          }
          resultSets.push(resultSetFromHrana(rows));
        } catch (e) {
          if (e instanceof LibsqlBatchError) {
            throw e;
          }
          const mappedError = mapHranaError(e);
          if (mappedError instanceof LibsqlError) {
            throw new LibsqlBatchError(mappedError.message, i, mappedError.code, mappedError.extendedCode, mappedError.rawCode, mappedError.cause instanceof Error ? mappedError.cause : void 0);
          }
          throw mappedError;
        }
      }
      return resultSets;
    } catch (e) {
      throw mapHranaError(e);
    }
  }
  async executeMultiple(sql) {
    const stream = this._getStream();
    if (stream.closed) {
      throw new LibsqlError("Cannot execute statements because the transaction is closed", "TRANSACTION_CLOSED");
    }
    try {
      if (this.#started === void 0) {
        this.#started = stream.run(transactionModeToBegin(this.#mode)).then(() => void 0);
        try {
          await this.#started;
        } catch (e) {
          this.close();
          throw e;
        }
      } else {
        await this.#started;
      }
      await stream.sequence(sql);
    } catch (e) {
      throw mapHranaError(e);
    }
  }
  async rollback() {
    try {
      const stream = this._getStream();
      if (stream.closed) {
        return;
      }
      if (this.#started !== void 0) {
      } else {
        return;
      }
      const promise = stream.run("ROLLBACK").catch((e) => {
        throw mapHranaError(e);
      });
      stream.closeGracefully();
      await promise;
    } catch (e) {
      throw mapHranaError(e);
    } finally {
      this.close();
    }
  }
  async commit() {
    try {
      const stream = this._getStream();
      if (stream.closed) {
        throw new LibsqlError("Cannot commit the transaction because it is already closed", "TRANSACTION_CLOSED");
      }
      if (this.#started !== void 0) {
        await this.#started;
      } else {
        return;
      }
      const promise = stream.run("COMMIT").catch((e) => {
        throw mapHranaError(e);
      });
      stream.closeGracefully();
      await promise;
    } catch (e) {
      throw mapHranaError(e);
    } finally {
      this.close();
    }
  }
};
async function executeHranaBatch(mode, version2, batch, hranaStmts, disableForeignKeys = false) {
  if (disableForeignKeys) {
    batch.step().run("PRAGMA foreign_keys=off");
  }
  const beginStep = batch.step();
  const beginPromise = beginStep.run(transactionModeToBegin(mode));
  let lastStep = beginStep;
  const stmtPromises = hranaStmts.map((hranaStmt) => {
    const stmtStep = batch.step().condition(BatchCond.ok(lastStep));
    if (version2 >= 3) {
      stmtStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
    }
    const stmtPromise = stmtStep.query(hranaStmt);
    lastStep = stmtStep;
    return stmtPromise;
  });
  const commitStep = batch.step().condition(BatchCond.ok(lastStep));
  if (version2 >= 3) {
    commitStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
  }
  const commitPromise = commitStep.run("COMMIT");
  const rollbackStep = batch.step().condition(BatchCond.not(BatchCond.ok(commitStep)));
  rollbackStep.run("ROLLBACK").catch((_) => void 0);
  if (disableForeignKeys) {
    batch.step().run("PRAGMA foreign_keys=on");
  }
  await batch.execute();
  const resultSets = [];
  await beginPromise;
  for (let i = 0; i < stmtPromises.length; i++) {
    try {
      const hranaRows = await stmtPromises[i];
      if (hranaRows === void 0) {
        throw new LibsqlBatchError("Statement in a batch was not executed, probably because the transaction has been rolled back", i, "TRANSACTION_CLOSED");
      }
      resultSets.push(resultSetFromHrana(hranaRows));
    } catch (e) {
      if (e instanceof LibsqlBatchError) {
        throw e;
      }
      const mappedError = mapHranaError(e);
      if (mappedError instanceof LibsqlError) {
        throw new LibsqlBatchError(mappedError.message, i, mappedError.code, mappedError.extendedCode, mappedError.rawCode, mappedError.cause instanceof Error ? mappedError.cause : void 0);
      }
      throw mappedError;
    }
  }
  await commitPromise;
  return resultSets;
}
function stmtToHrana(stmt) {
  let sql;
  let args;
  if (Array.isArray(stmt)) {
    [sql, args] = stmt;
  } else if (typeof stmt === "string") {
    sql = stmt;
  } else {
    sql = stmt.sql;
    args = stmt.args;
  }
  const hranaStmt = new Stmt(sql);
  if (args) {
    if (Array.isArray(args)) {
      hranaStmt.bindIndexes(args);
    } else {
      for (const [key, value] of Object.entries(args)) {
        hranaStmt.bindName(key, value);
      }
    }
  }
  return hranaStmt;
}
function resultSetFromHrana(hranaRows) {
  const columns = hranaRows.columnNames.map((c) => c ?? "");
  const columnTypes = hranaRows.columnDecltypes.map((c) => c ?? "");
  const rows = hranaRows.rows;
  const rowsAffected = hranaRows.affectedRowCount;
  const lastInsertRowid2 = hranaRows.lastInsertRowid !== void 0 ? hranaRows.lastInsertRowid : void 0;
  return new ResultSetImpl(columns, columnTypes, rows, rowsAffected, lastInsertRowid2);
}
function mapHranaError(e) {
  if (e instanceof ClientError) {
    const code = mapHranaErrorCode(e);
    return new LibsqlError(e.message, code, void 0, void 0, e);
  }
  return e;
}
function mapHranaErrorCode(e) {
  if (e instanceof ResponseError && e.code !== void 0) {
    return e.code;
  } else if (e instanceof ProtoError) {
    return "HRANA_PROTO_ERROR";
  } else if (e instanceof ClosedError) {
    return e.cause instanceof ClientError ? mapHranaErrorCode(e.cause) : "HRANA_CLOSED_ERROR";
  } else if (e instanceof WebSocketError) {
    return "HRANA_WEBSOCKET_ERROR";
  } else if (e instanceof HttpServerError) {
    return "SERVER_ERROR";
  } else if (e instanceof ProtocolVersionError) {
    return "PROTOCOL_VERSION_ERROR";
  } else if (e instanceof InternalError) {
    return "INTERNAL_ERROR";
  } else {
    return "UNKNOWN";
  }
}

// node_modules/@libsql/client/lib-esm/sql_cache.js
var SqlCache = class {
  #owner;
  #sqls;
  capacity;
  constructor(owner, capacity) {
    this.#owner = owner;
    this.#sqls = new Lru();
    this.capacity = capacity;
  }
  // Replaces SQL strings with cached `hrana.Sql` objects in the statements in `hranaStmts`. After this
  // function returns, we guarantee that all `hranaStmts` refer to valid (not closed) `hrana.Sql` objects,
  // but _we may invalidate any other `hrana.Sql` objects_ (by closing them, thus removing them from the
  // server).
  //
  // In practice, this means that after calling this function, you can use the statements only up to the
  // first `await`, because concurrent code may also use the cache and invalidate those statements.
  apply(hranaStmts) {
    if (this.capacity <= 0) {
      return;
    }
    const usedSqlObjs = /* @__PURE__ */ new Set();
    for (const hranaStmt of hranaStmts) {
      if (typeof hranaStmt.sql !== "string") {
        continue;
      }
      const sqlText = hranaStmt.sql;
      if (sqlText.length >= 5e3) {
        continue;
      }
      let sqlObj = this.#sqls.get(sqlText);
      if (sqlObj === void 0) {
        while (this.#sqls.size + 1 > this.capacity) {
          const [evictSqlText, evictSqlObj] = this.#sqls.peekLru();
          if (usedSqlObjs.has(evictSqlObj)) {
            break;
          }
          evictSqlObj.close();
          this.#sqls.delete(evictSqlText);
        }
        if (this.#sqls.size + 1 <= this.capacity) {
          sqlObj = this.#owner.storeSql(sqlText);
          this.#sqls.set(sqlText, sqlObj);
        }
      }
      if (sqlObj !== void 0) {
        hranaStmt.sql = sqlObj;
        usedSqlObjs.add(sqlObj);
      }
    }
  }
};
var Lru = class {
  // This maps keys to the cache values. The entries are ordered by their last use (entires that were used
  // most recently are at the end).
  #cache;
  constructor() {
    this.#cache = /* @__PURE__ */ new Map();
  }
  get(key) {
    const value = this.#cache.get(key);
    if (value !== void 0) {
      this.#cache.delete(key);
      this.#cache.set(key, value);
    }
    return value;
  }
  set(key, value) {
    this.#cache.set(key, value);
  }
  peekLru() {
    for (const entry of this.#cache.entries()) {
      return entry;
    }
    return void 0;
  }
  delete(key) {
    this.#cache.delete(key);
  }
  get size() {
    return this.#cache.size;
  }
};

// node_modules/@libsql/client/lib-esm/ws.js
var import_promise_limit = __toESM(require_promise_limit(), 1);
function _createClient2(config) {
  if (config.scheme !== "wss" && config.scheme !== "ws") {
    throw new LibsqlError(`The WebSocket client supports only "libsql:", "wss:" and "ws:" URLs, got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  if (config.encryptionKey !== void 0) {
    throw new LibsqlError("Encryption key is not supported by the remote client.", "ENCRYPTION_KEY_NOT_SUPPORTED");
  }
  if (config.scheme === "ws" && config.tls) {
    throw new LibsqlError(`A "ws:" URL cannot opt into TLS by using ?tls=1`, "URL_INVALID");
  } else if (config.scheme === "wss" && !config.tls) {
    throw new LibsqlError(`A "wss:" URL cannot opt out of TLS by using ?tls=0`, "URL_INVALID");
  }
  const url = encodeBaseUrl(config.scheme, config.authority, config.path);
  let client2;
  try {
    client2 = openWs(url, config.authToken);
  } catch (e) {
    if (e instanceof WebSocketUnsupportedError) {
      const suggestedScheme = config.scheme === "wss" ? "https" : "http";
      const suggestedUrl = encodeBaseUrl(suggestedScheme, config.authority, config.path);
      throw new LibsqlError(`This environment does not support WebSockets, please switch to the HTTP client by using a "${suggestedScheme}:" URL (${JSON.stringify(suggestedUrl)}). For more information, please read ${supportedUrlLink}`, "WEBSOCKETS_NOT_SUPPORTED");
    }
    throw mapHranaError(e);
  }
  return new WsClient2(client2, url, config.authToken, config.intMode, config.concurrency);
}
var maxConnAgeMillis = 60 * 1e3;
var sqlCacheCapacity = 100;
var WsClient2 = class {
  #url;
  #authToken;
  #intMode;
  // State of the current connection. The `hrana.WsClient` inside may be closed at any moment due to an
  // asynchronous error.
  #connState;
  // If defined, this is a connection that will be used in the future, once it is ready.
  #futureConnState;
  closed;
  protocol;
  #isSchemaDatabase;
  #promiseLimitFunction;
  /** @private */
  constructor(client2, url, authToken, intMode, concurrency) {
    this.#url = url;
    this.#authToken = authToken;
    this.#intMode = intMode;
    this.#connState = this.#openConn(client2);
    this.#futureConnState = void 0;
    this.closed = false;
    this.protocol = "ws";
    this.#promiseLimitFunction = (0, import_promise_limit.default)(concurrency);
  }
  async limit(fn) {
    return this.#promiseLimitFunction(fn);
  }
  async execute(stmtOrSql, args) {
    let stmt;
    if (typeof stmtOrSql === "string") {
      stmt = {
        sql: stmtOrSql,
        args: args || []
      };
    } else {
      stmt = stmtOrSql;
    }
    return this.limit(async () => {
      const streamState = await this.#openStream();
      try {
        const hranaStmt = stmtToHrana(stmt);
        streamState.conn.sqlCache.apply([hranaStmt]);
        const hranaRowsPromise = streamState.stream.query(hranaStmt);
        streamState.stream.closeGracefully();
        const hranaRowsResult = await hranaRowsPromise;
        return resultSetFromHrana(hranaRowsResult);
      } catch (e) {
        throw mapHranaError(e);
      } finally {
        this._closeStream(streamState);
      }
    });
  }
  async batch(stmts, mode = "deferred") {
    return this.limit(async () => {
      const streamState = await this.#openStream();
      try {
        const normalizedStmts = stmts.map((stmt) => {
          if (Array.isArray(stmt)) {
            return {
              sql: stmt[0],
              args: stmt[1] || []
            };
          }
          return stmt;
        });
        const hranaStmts = normalizedStmts.map(stmtToHrana);
        const version2 = await streamState.conn.client.getVersion();
        streamState.conn.sqlCache.apply(hranaStmts);
        const batch = streamState.stream.batch(version2 >= 3);
        const resultsPromise = executeHranaBatch(mode, version2, batch, hranaStmts);
        const results = await resultsPromise;
        return results;
      } catch (e) {
        throw mapHranaError(e);
      } finally {
        this._closeStream(streamState);
      }
    });
  }
  async migrate(stmts) {
    return this.limit(async () => {
      const streamState = await this.#openStream();
      try {
        const hranaStmts = stmts.map(stmtToHrana);
        const version2 = await streamState.conn.client.getVersion();
        const batch = streamState.stream.batch(version2 >= 3);
        const resultsPromise = executeHranaBatch("deferred", version2, batch, hranaStmts, true);
        const results = await resultsPromise;
        return results;
      } catch (e) {
        throw mapHranaError(e);
      } finally {
        this._closeStream(streamState);
      }
    });
  }
  async transaction(mode = "write") {
    return this.limit(async () => {
      const streamState = await this.#openStream();
      try {
        const version2 = await streamState.conn.client.getVersion();
        return new WsTransaction(this, streamState, mode, version2);
      } catch (e) {
        this._closeStream(streamState);
        throw mapHranaError(e);
      }
    });
  }
  async executeMultiple(sql) {
    return this.limit(async () => {
      const streamState = await this.#openStream();
      try {
        const promise = streamState.stream.sequence(sql);
        streamState.stream.closeGracefully();
        await promise;
      } catch (e) {
        throw mapHranaError(e);
      } finally {
        this._closeStream(streamState);
      }
    });
  }
  sync() {
    throw new LibsqlError("sync not supported in ws mode", "SYNC_NOT_SUPPORTED");
  }
  async #openStream() {
    if (this.closed) {
      throw new LibsqlError("The client is closed", "CLIENT_CLOSED");
    }
    const now = /* @__PURE__ */ new Date();
    const ageMillis = now.valueOf() - this.#connState.openTime.valueOf();
    if (ageMillis > maxConnAgeMillis && this.#futureConnState === void 0) {
      const futureConnState = this.#openConn();
      this.#futureConnState = futureConnState;
      futureConnState.client.getVersion().then((_version) => {
        if (this.#connState !== futureConnState) {
          if (this.#connState.streamStates.size === 0) {
            this.#connState.client.close();
          } else {
          }
        }
        this.#connState = futureConnState;
        this.#futureConnState = void 0;
      }, (_e) => {
        this.#futureConnState = void 0;
      });
    }
    if (this.#connState.client.closed) {
      try {
        if (this.#futureConnState !== void 0) {
          this.#connState = this.#futureConnState;
        } else {
          this.#connState = this.#openConn();
        }
      } catch (e) {
        throw mapHranaError(e);
      }
    }
    const connState = this.#connState;
    try {
      if (connState.useSqlCache === void 0) {
        connState.useSqlCache = await connState.client.getVersion() >= 2;
        if (connState.useSqlCache) {
          connState.sqlCache.capacity = sqlCacheCapacity;
        }
      }
      const stream = connState.client.openStream();
      stream.intMode = this.#intMode;
      const streamState = { conn: connState, stream };
      connState.streamStates.add(streamState);
      return streamState;
    } catch (e) {
      throw mapHranaError(e);
    }
  }
  #openConn(client2) {
    try {
      client2 ??= openWs(this.#url, this.#authToken);
      return {
        client: client2,
        useSqlCache: void 0,
        sqlCache: new SqlCache(client2, 0),
        openTime: /* @__PURE__ */ new Date(),
        streamStates: /* @__PURE__ */ new Set()
      };
    } catch (e) {
      throw mapHranaError(e);
    }
  }
  async reconnect() {
    try {
      for (const st of Array.from(this.#connState.streamStates)) {
        try {
          st.stream.close();
        } catch {
        }
      }
      this.#connState.client.close();
    } catch {
    }
    if (this.#futureConnState) {
      try {
        this.#futureConnState.client.close();
      } catch {
      }
      this.#futureConnState = void 0;
    }
    const next = this.#openConn();
    const version2 = await next.client.getVersion();
    next.useSqlCache = version2 >= 2;
    if (next.useSqlCache) {
      next.sqlCache.capacity = sqlCacheCapacity;
    }
    this.#connState = next;
    this.closed = false;
  }
  _closeStream(streamState) {
    streamState.stream.close();
    const connState = streamState.conn;
    connState.streamStates.delete(streamState);
    if (connState.streamStates.size === 0 && connState !== this.#connState) {
      connState.client.close();
    }
  }
  close() {
    this.#connState.client.close();
    this.closed = true;
    if (this.#futureConnState) {
      try {
        this.#futureConnState.client.close();
      } catch {
      }
      this.#futureConnState = void 0;
    }
    this.closed = true;
  }
};
var WsTransaction = class extends HranaTransaction {
  #client;
  #streamState;
  /** @private */
  constructor(client2, state, mode, version2) {
    super(mode, version2);
    this.#client = client2;
    this.#streamState = state;
  }
  /** @private */
  _getStream() {
    return this.#streamState.stream;
  }
  /** @private */
  _getSqlCache() {
    return this.#streamState.conn.sqlCache;
  }
  close() {
    this.#client._closeStream(this.#streamState);
  }
  get closed() {
    return this.#streamState.stream.closed;
  }
};

// node_modules/@libsql/client/lib-esm/http.js
var import_promise_limit2 = __toESM(require_promise_limit(), 1);
function _createClient3(config) {
  if (config.scheme !== "https" && config.scheme !== "http") {
    throw new LibsqlError(`The HTTP client supports only "libsql:", "https:" and "http:" URLs, got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  if (config.encryptionKey !== void 0) {
    throw new LibsqlError("Encryption key is not supported by the remote client.", "ENCRYPTION_KEY_NOT_SUPPORTED");
  }
  if (config.scheme === "http" && config.tls) {
    throw new LibsqlError(`A "http:" URL cannot opt into TLS by using ?tls=1`, "URL_INVALID");
  } else if (config.scheme === "https" && !config.tls) {
    throw new LibsqlError(`A "https:" URL cannot opt out of TLS by using ?tls=0`, "URL_INVALID");
  }
  const url = encodeBaseUrl(config.scheme, config.authority, config.path);
  return new HttpClient2(url, config.authToken, config.intMode, config.fetch, config.concurrency, config.remoteEncryptionKey);
}
var sqlCacheCapacity2 = 30;
var HttpClient2 = class {
  #client;
  protocol;
  #url;
  #intMode;
  #customFetch;
  #concurrency;
  #authToken;
  #remoteEncryptionKey;
  #promiseLimitFunction;
  /** @private */
  constructor(url, authToken, intMode, customFetch, concurrency, remoteEncryptionKey) {
    this.#url = url;
    this.#authToken = authToken;
    this.#intMode = intMode;
    this.#customFetch = customFetch;
    this.#concurrency = concurrency;
    this.#remoteEncryptionKey = remoteEncryptionKey;
    this.#client = openHttp(this.#url, this.#authToken, this.#customFetch, remoteEncryptionKey);
    this.#client.intMode = this.#intMode;
    this.protocol = "http";
    this.#promiseLimitFunction = (0, import_promise_limit2.default)(this.#concurrency);
  }
  async limit(fn) {
    return this.#promiseLimitFunction(fn);
  }
  async execute(stmtOrSql, args) {
    let stmt;
    if (typeof stmtOrSql === "string") {
      stmt = {
        sql: stmtOrSql,
        args: args || []
      };
    } else {
      stmt = stmtOrSql;
    }
    return this.limit(async () => {
      try {
        const hranaStmt = stmtToHrana(stmt);
        let rowsPromise;
        const stream = this.#client.openStream();
        try {
          rowsPromise = stream.query(hranaStmt);
        } finally {
          stream.closeGracefully();
        }
        const rowsResult = await rowsPromise;
        return resultSetFromHrana(rowsResult);
      } catch (e) {
        throw mapHranaError(e);
      }
    });
  }
  async batch(stmts, mode = "deferred") {
    return this.limit(async () => {
      try {
        const normalizedStmts = stmts.map((stmt) => {
          if (Array.isArray(stmt)) {
            return {
              sql: stmt[0],
              args: stmt[1] || []
            };
          }
          return stmt;
        });
        const hranaStmts = normalizedStmts.map(stmtToHrana);
        const version2 = await this.#client.getVersion();
        let resultsPromise;
        const stream = this.#client.openStream();
        try {
          const sqlCache = new SqlCache(stream, sqlCacheCapacity2);
          sqlCache.apply(hranaStmts);
          const batch = stream.batch(false);
          resultsPromise = executeHranaBatch(mode, version2, batch, hranaStmts);
        } finally {
          stream.closeGracefully();
        }
        const results = await resultsPromise;
        return results;
      } catch (e) {
        throw mapHranaError(e);
      }
    });
  }
  async migrate(stmts) {
    return this.limit(async () => {
      try {
        const hranaStmts = stmts.map(stmtToHrana);
        const version2 = await this.#client.getVersion();
        let resultsPromise;
        const stream = this.#client.openStream();
        try {
          const batch = stream.batch(false);
          resultsPromise = executeHranaBatch("deferred", version2, batch, hranaStmts, true);
        } finally {
          stream.closeGracefully();
        }
        const results = await resultsPromise;
        return results;
      } catch (e) {
        throw mapHranaError(e);
      }
    });
  }
  async transaction(mode = "write") {
    return this.limit(async () => {
      try {
        const version2 = await this.#client.getVersion();
        return new HttpTransaction(this.#client.openStream(), mode, version2);
      } catch (e) {
        throw mapHranaError(e);
      }
    });
  }
  async executeMultiple(sql) {
    return this.limit(async () => {
      try {
        let promise;
        const stream = this.#client.openStream();
        try {
          promise = stream.sequence(sql);
        } finally {
          stream.closeGracefully();
        }
        await promise;
      } catch (e) {
        throw mapHranaError(e);
      }
    });
  }
  sync() {
    throw new LibsqlError("sync not supported in http mode", "SYNC_NOT_SUPPORTED");
  }
  close() {
    this.#client.close();
  }
  async reconnect() {
    try {
      if (!this.closed) {
        this.#client.close();
      }
    } finally {
      this.#client = openHttp(this.#url, this.#authToken, this.#customFetch, this.#remoteEncryptionKey);
      this.#client.intMode = this.#intMode;
    }
  }
  get closed() {
    return this.#client.closed;
  }
};
var HttpTransaction = class extends HranaTransaction {
  #stream;
  #sqlCache;
  /** @private */
  constructor(stream, mode, version2) {
    super(mode, version2);
    this.#stream = stream;
    this.#sqlCache = new SqlCache(stream, sqlCacheCapacity2);
  }
  /** @private */
  _getStream() {
    return this.#stream;
  }
  /** @private */
  _getSqlCache() {
    return this.#sqlCache;
  }
  close() {
    this.#stream.close();
  }
  get closed() {
    return this.#stream.closed;
  }
};

// node_modules/@libsql/client/lib-esm/node.js
function createClient(config) {
  return _createClient4(expandConfig(config, true));
}
function _createClient4(config) {
  if (config.scheme === "wss" || config.scheme === "ws") {
    return _createClient2(config);
  } else if (config.scheme === "https" || config.scheme === "http") {
    return _createClient3(config);
  } else {
    return _createClient(config);
  }
}

// server/db/turso.ts
var client = null;
var initialized = false;
function getTursoClient() {
  if (client) return client;
  const env2 = getEnv();
  const url = process.env.TURSO_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) throw new Error("TURSO_URL and TURSO_AUTH_TOKEN required for Turso");
  client = createClient({ url, authToken: token });
  return client;
}
async function exec(stmts) {
  const c = getTursoClient();
  for (const s of stmts) {
    await c.execute(s);
  }
}
async function run(sql, args) {
  const c = getTursoClient();
  return c.execute({ sql, args });
}
async function all(sql, args) {
  const result = await run(sql, args);
  return result.rows;
}
async function get(sql, args) {
  const result = await run(sql, args);
  return result.rows[0] ?? null;
}
async function lastInsertRowid() {
  const result = await get("SELECT last_insert_rowid() AS id");
  return Number(result.id);
}
async function initSchema() {
  await exec([
    `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS keywords (id INTEGER PRIMARY KEY AUTOINCREMENT, term TEXT NOT NULL, scope TEXT NOT NULL DEFAULT '', enabled INTEGER NOT NULL DEFAULT 1, account_mode INTEGER NOT NULL DEFAULT 0, account_platform TEXT NOT NULL DEFAULT '', account_uid TEXT NOT NULL DEFAULT '', account_url TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS sources (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, url TEXT NOT NULL, category TEXT NOT NULL, provider_type TEXT NOT NULL DEFAULT 'rss', reliability_tier TEXT NOT NULL DEFAULT 'trusted', community_source INTEGER NOT NULL DEFAULT 0, min_quality_score INTEGER NOT NULL DEFAULT 60, enabled INTEGER NOT NULL DEFAULT 1, builtin INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL, keyword_id INTEGER REFERENCES keywords(id) ON DELETE SET NULL, title TEXT NOT NULL, url TEXT NOT NULL, normalized_url TEXT NOT NULL UNIQUE, summary TEXT NOT NULL DEFAULT '', published_at TEXT NOT NULL, fetched_at TEXT NOT NULL, matched_keyword TEXT NOT NULL, read_at TEXT, status TEXT NOT NULL DEFAULT 'watch', quality_score INTEGER NOT NULL DEFAULT 70, quality_signals TEXT NOT NULL DEFAULT '[]', evidence_count INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, archived_at TEXT, interaction_likes INTEGER NOT NULL DEFAULT 0, interaction_reposts INTEGER NOT NULL DEFAULT 0, interaction_replies INTEGER NOT NULL DEFAULT 0, interaction_views INTEGER NOT NULL DEFAULT 0, summary_source TEXT NOT NULL DEFAULT 'rss', interaction_source TEXT NOT NULL DEFAULT 'none', priority_score INTEGER NOT NULL DEFAULT 0, freshness_score INTEGER NOT NULL DEFAULT 0, author_name TEXT, author_followers INTEGER NOT NULL DEFAULT 0, author_verified INTEGER NOT NULL DEFAULT 0, interaction_danmaku INTEGER NOT NULL DEFAULT 0, interaction_quotes INTEGER NOT NULL DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS ai_evaluations (id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER NOT NULL UNIQUE REFERENCES items(id) ON DELETE CASCADE, relevance_score REAL NOT NULL, credibility_score REAL NOT NULL, novelty_score REAL NOT NULL, hotness_score REAL NOT NULL, is_impersonation_likely INTEGER NOT NULL, summary TEXT NOT NULL, reason TEXT NOT NULL, recommended_action TEXT NOT NULL, raw_json TEXT NOT NULL, keyword_mentioned INTEGER NOT NULL DEFAULT 0, relevance_summary TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS scan_runs (id INTEGER PRIMARY KEY AUTOINCREMENT, started_at TEXT NOT NULL, finished_at TEXT, status TEXT NOT NULL, total_fetched INTEGER NOT NULL DEFAULT 0, total_inserted INTEGER NOT NULL DEFAULT 0, total_evaluated INTEGER NOT NULL DEFAULT 0, error TEXT)`,
    `CREATE TABLE IF NOT EXISTS item_evidence (id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE, provider_type TEXT NOT NULL, source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL, source_name TEXT NOT NULL, query TEXT NOT NULL, rank INTEGER NOT NULL DEFAULT 0, original_url TEXT NOT NULL, normalized_url TEXT NOT NULL, domain TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', published_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(item_id, provider_type, source_id, normalized_url))`
  ]);
}
async function seedData() {
  const env2 = getEnv();
  const count = await get("SELECT COUNT(*) AS count FROM settings");
  if (Number(count.count) === 0) {
    await run("INSERT INTO settings (key, value) VALUES ('aiMode', ?)", { "aiMode": env2.aiMode });
    await run("INSERT INTO settings (key, value) VALUES ('scanIntervalMinutes', ?)", { "scanIntervalMinutes": String(env2.scanIntervalMinutes) });
  }
  const kCount = await get("SELECT COUNT(*) AS count FROM keywords");
  if (Number(kCount.count) === 0) {
    await run("INSERT INTO keywords (term, scope) VALUES ('AI \u7F16\u7A0B', '\u6E38\u620F\u5F00\u53D1\u3001\u751F\u4EA7\u529B\u5DE5\u5177\u3001Agent \u5DE5\u4F5C\u6D41')");
    await run("INSERT INTO keywords (term, scope) VALUES ('Unity', '\u6E38\u620F\u5F15\u64CE\u3001\u6280\u672F\u66F4\u65B0\u3001\u5546\u4E1A\u653F\u7B56')");
    await run("INSERT INTO keywords (term, scope) VALUES ('\u6E38\u620F\u51FA\u6D77', '\u53D1\u884C\u3001\u4E70\u91CF\u3001\u5E02\u573A\u3001\u5E73\u53F0\u653F\u7B56')");
  }
  await ensureDefaultSources2();
}
async function ensureDefaultSources2() {
  const count = await get("SELECT COUNT(*) AS count FROM sources");
  if (Number(count.count) > 0) return;
  const sources = getDefaultSources2();
  for (const s of sources) {
    await run(
      `INSERT INTO sources (name, url, category, provider_type, reliability_tier, community_source, min_quality_score, enabled, builtin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.name, s.url, s.category, s.providerType, s.reliabilityTier, Number(s.communitySource), s.minQualityScore, Number(s.enabled), Number(s.builtin)]
    );
  }
}
function getDefaultSources2() {
  return [
    { name: "RSSHub \u767E\u5EA6\u641C\u7D22", url: "https://rsshub.rssforever.com/baidu/search/{query}", category: "\u56FD\u5185\u7EFC\u5408", providerType: "rss", reliabilityTier: "search", communitySource: false, minQualityScore: 70, enabled: true, builtin: true },
    { name: "\u5FAE\u535A\u70ED\u641C", url: "https://weibo.com/ajax/side/hotSearch", category: "\u641C\u7D22\u589E\u5F3A", providerType: "weibo_hot", reliabilityTier: "search", communitySource: false, minQualityScore: 50, enabled: true, builtin: true },
    { name: "\u673A\u6838\u7F51", url: "https://www.gcores.com/rss", category: "\u56FD\u5185\u5A92\u4F53", providerType: "rss", reliabilityTier: "trusted", communitySource: false, minQualityScore: 62, enabled: true, builtin: true },
    { name: "\u6E38\u7814\u793E", url: "https://www.yystv.cn/rss/feed", category: "\u56FD\u5185\u5A92\u4F53", providerType: "rss", reliabilityTier: "trusted", communitySource: false, minQualityScore: 62, enabled: true, builtin: true },
    { name: "\u89E6\u4E50", url: "https://www.chuapp.com/feed", category: "\u56FD\u5185\u5A92\u4F53", providerType: "rss", reliabilityTier: "trusted", communitySource: false, minQualityScore: 62, enabled: true, builtin: true },
    { name: "B\u7AD9\u89C6\u9891\u641C\u7D22", url: "https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword={query}", category: "\u56FD\u5185\u5E73\u53F0", providerType: "bilibili_search", reliabilityTier: "community", communitySource: true, minQualityScore: 70, enabled: false, builtin: true },
    { name: "Brave Search \u589E\u5F3A", url: "{query}", category: "\u641C\u7D22\u589E\u5F3A", providerType: "brave_search", reliabilityTier: "search", communitySource: false, minQualityScore: 70, enabled: false, builtin: true }
  ];
}
async function initTursoDb() {
  if (initialized) return;
  await initSchema();
  await seedData();
  initialized = true;
}
function mapKeyword2(row) {
  return { id: row.id, term: row.term, scope: row.scope, enabled: Boolean(row.enabled), accountMode: Boolean(row.account_mode), accountPlatform: row.account_platform ?? "", accountUid: row.account_uid ?? "", accountUrl: row.account_url ?? "", createdAt: row.created_at };
}
function mapSource2(row) {
  return { id: row.id, name: row.name, url: row.url, category: row.category, providerType: parseProviderType2(row.provider_type), reliabilityTier: parseReliabilityTier2(row.reliability_tier), communitySource: Boolean(row.community_source), minQualityScore: row.min_quality_score, enabled: Boolean(row.enabled), builtin: Boolean(row.builtin), createdAt: row.created_at };
}
function mapScanRun2(row) {
  return { id: row.id, startedAt: row.started_at, finishedAt: row.finished_at, status: row.status, totalFetched: row.total_fetched, totalInserted: row.total_inserted, totalEvaluated: row.total_evaluated, error: row.error };
}
function mapItem2(row) {
  return {
    id: row.id,
    sourceId: row.source_id,
    keywordId: row.keyword_id,
    title: cleanArticleTitle(row.title),
    url: row.url,
    normalizedUrl: row.normalized_url,
    summary: cleanSummary(row.summary),
    publishedAt: row.published_at,
    fetchedAt: row.fetched_at,
    matchedKeyword: row.matched_keyword,
    readAt: row.read_at,
    status: row.status,
    qualityScore: row.quality_score,
    qualitySignals: parseJsonArray2(row.quality_signals),
    evidenceCount: row.evidence_count,
    evidenceProviders: parseJsonArray2(row.evidence_providers).map(parseProviderType2),
    evidenceSourceNames: parseJsonArray2(row.evidence_source_names),
    sourceReliability: row.source_reliability ? parseReliabilityTier2(row.source_reliability) : null,
    communitySource: Boolean(row.source_community),
    interactionLikes: row.interaction_likes ?? 0,
    interactionReposts: row.interaction_reposts ?? 0,
    interactionReplies: row.interaction_replies ?? 0,
    interactionViews: row.interaction_views ?? 0,
    interactionDanmaku: row.interaction_danmaku ?? 0,
    interactionQuotes: row.interaction_quotes ?? 0,
    summarySource: parseSummarySource2(row.summary_source),
    interactionSource: parseInteractionSource2(row.interaction_source),
    priorityScore: row.priority_score ?? 0,
    freshnessScore: row.freshness_score ?? 0,
    authorName: row.author_name ?? null,
    authorFollowers: row.author_followers ?? 0,
    authorVerified: Boolean(row.author_verified),
    evaluation: row.relevance_score === null ? null : {
      relevanceScore: row.relevance_score,
      credibilityScore: row.credibility_score ?? 0,
      noveltyScore: row.novelty_score ?? 0,
      hotnessScore: row.hotness_score ?? 0,
      isImpersonationLikely: Boolean(row.is_impersonation_likely),
      summary: cleanSummary(row.ai_summary ?? ""),
      reason: cleanSummary(row.reason ?? ""),
      recommendedAction: row.recommended_action ?? "watch",
      keywordMentioned: Boolean(row.keyword_mentioned),
      relevanceSummary: row.relevance_summary ?? ""
    }
  };
}
function parseProviderType2(v) {
  return ["google_news", "brave_search", "bilibili_search", "weibo_hot"].includes(v) ? v : "rss";
}
function parseReliabilityTier2(v) {
  return ["official", "community", "search"].includes(v) ? v : "trusted";
}
function parseSummarySource2(v) {
  return ["ai", "metadata", "title"].includes(v) ? v : "rss";
}
function parseInteractionSource2(v) {
  return ["bilibili", "zhihu", "wechat", "weibo", "html", "rss"].includes(v) ? v : "none";
}
function parseJsonArray2(v) {
  if (!v) return [];
  try {
    const p = JSON.parse(v);
    return Array.isArray(p) ? p.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}
function detectAccountInfo2(term) {
  const url = term.match(/https?:\/\/\S+/i)?.[0] ?? "";
  const bilibiliUid = term.match(/space\.bilibili\.com\/(\d+)/i)?.[1] ?? term.match(/\buid[:：\s]*(\d{3,})\b/i)?.[1] ?? "";
  if (bilibiliUid) return { accountMode: true, accountPlatform: "bilibili", accountUid: bilibiliUid, accountUrl: url };
  const patterns = [/公司$/, /团队$/, /工作室$/, /官方$/, /游戏$/, /科技$/, /平台$/, /引擎$/];
  if (patterns.some((p) => p.test(term))) return { accountMode: true, accountPlatform: "", accountUid: "", accountUrl: url };
  const chineseOnly = term.replace(/[^\u4e00-\u9fff]/g, "");
  if (chineseOnly.length >= 2 && chineseOnly.length <= 3 && !term.includes(" ")) return { accountMode: true, accountPlatform: "", accountUid: "", accountUrl: url };
  return { accountMode: false, accountPlatform: "", accountUid: "", accountUrl: url };
}
var tursoRepos = {
  settings: {
    async all() {
      const rows = await all("SELECT key, value FROM settings");
      const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
      const env2 = getEnv();
      return { aiMode: map.aiMode === "mock" ? "mock" : "openrouter", scanIntervalMinutes: Number(map.scanIntervalMinutes ?? env2.scanIntervalMinutes), openRouterConfigured: Boolean(env2.openRouterApiKey), openRouterModel: env2.openRouterModel };
    },
    async set(key, value) {
      await run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [key, value]);
    }
  },
  keywords: {
    async all() {
      const rows = await all("SELECT * FROM keywords ORDER BY enabled DESC, id DESC");
      return rows.map(mapKeyword2);
    },
    async active() {
      const rows = await all("SELECT * FROM keywords WHERE enabled = 1 ORDER BY id DESC");
      return rows.map(mapKeyword2);
    },
    async create(term, scope) {
      const acc = detectAccountInfo2(term.trim());
      await run("INSERT INTO keywords (term, scope, account_mode, account_platform, account_uid, account_url) VALUES (?, ?, ?, ?, ?, ?)", [term.trim(), scope.trim(), Number(acc.accountMode), acc.accountPlatform, acc.accountUid, acc.accountUrl]);
      return await this.byId(Number(await lastInsertRowid()));
    },
    async update(id, input) {
      const cur = await this.byId(id);
      if (!cur) return null;
      const nt = input.term?.trim() ?? cur.term;
      const det = input.term ? detectAccountInfo2(nt) : null;
      await run("UPDATE keywords SET term=?, scope=?, enabled=?, account_mode=?, account_platform=?, account_uid=?, account_url=? WHERE id=?", [nt, input.scope?.trim() ?? cur.scope, typeof input.enabled === "boolean" ? Number(input.enabled) : Number(cur.enabled), typeof input.accountMode === "boolean" ? Number(input.accountMode) : Number(det?.accountMode ?? cur.accountMode), input.accountPlatform ?? det?.accountPlatform ?? cur.accountPlatform, input.accountUid ?? det?.accountUid ?? cur.accountUid, input.accountUrl ?? det?.accountUrl ?? cur.accountUrl, id]);
      return this.byId(id);
    },
    async delete(id) {
      await run("DELETE FROM keywords WHERE id = ?", [id]);
      return true;
    },
    async byId(id) {
      const r = await get("SELECT * FROM keywords WHERE id = ?", [id]);
      return r ? mapKeyword2(r) : null;
    }
  },
  sources: {
    async all() {
      const r = await all("SELECT * FROM sources ORDER BY enabled DESC, builtin DESC, id DESC");
      return r.map(mapSource2);
    },
    async active() {
      const r = await all("SELECT * FROM sources WHERE enabled = 1 ORDER BY id");
      return r.map(mapSource2);
    },
    async create(input) {
      await run("INSERT INTO sources (name,url,category,provider_type,reliability_tier,community_source,min_quality_score,enabled,builtin) VALUES (?,?,?,?,?,?,?,?,?)", [input.name.trim(), input.url.trim(), input.category.trim() || "\u81EA\u5B9A\u4E49", input.providerType ?? "rss", input.reliabilityTier ?? "trusted", Number(input.communitySource ?? false), input.minQualityScore ?? 65, Number(input.enabled ?? true), Number(input.builtin ?? false)]);
      return await this.byId(Number(await lastInsertRowid()));
    },
    async update(id, input) {
      const cur = await this.byId(id);
      if (!cur) return null;
      await run("UPDATE sources SET name=?,url=?,category=?,provider_type=?,reliability_tier=?,community_source=?,min_quality_score=?,enabled=? WHERE id=?", [input.name?.trim() ?? cur.name, input.url?.trim() ?? cur.url, input.category?.trim() ?? cur.category, input.providerType ?? cur.providerType, input.reliabilityTier ?? cur.reliabilityTier, typeof input.communitySource === "boolean" ? Number(input.communitySource) : Number(cur.communitySource), input.minQualityScore ?? cur.minQualityScore, typeof input.enabled === "boolean" ? Number(input.enabled) : Number(cur.enabled), id]);
      return this.byId(id);
    },
    async delete(id) {
      const s = await this.byId(id);
      if (!s) return false;
      if (s.builtin) {
        return await this.update(id, { enabled: false }) !== null;
      }
      await run("DELETE FROM sources WHERE id=?", [id]);
      return true;
    },
    async byId(id) {
      const r = await get("SELECT * FROM sources WHERE id=?", [id]);
      return r ? mapSource2(r) : null;
    }
  },
  items: {
    async list(limit = 80) {
      const rows = await all(
        `SELECT i.*, s.reliability_tier AS source_reliability, s.community_source AS source_community, e.relevance_score, e.credibility_score, e.novelty_score, e.hotness_score, e.is_impersonation_likely, e.summary AS ai_summary, e.reason, e.recommended_action, e.keyword_mentioned, e.relevance_summary, (SELECT json_group_array(DISTINCT provider_type) FROM item_evidence WHERE item_id=i.id) AS evidence_providers, (SELECT json_group_array(DISTINCT source_name) FROM item_evidence WHERE item_id=i.id) AS evidence_source_names FROM items i LEFT JOIN sources s ON s.id=i.source_id LEFT JOIN ai_evaluations e ON e.item_id=i.id WHERE i.archived_at IS NULL AND datetime(i.published_at) >= datetime('now','-24 hours') ORDER BY i.priority_score DESC, i.published_at DESC, i.id DESC LIMIT ?`,
        [limit]
      );
      return rows.map(mapItem2).filter((item) => !isLowQualityResult({ title: item.title, url: item.url, summary: item.summary }));
    },
    async archived(limit = 100) {
      const rows = await all(`SELECT i.*, s.reliability_tier AS source_reliability, s.community_source AS source_community, e.relevance_score,e.credibility_score,e.novelty_score,e.hotness_score,e.is_impersonation_likely,e.summary AS ai_summary,e.reason,e.recommended_action, (SELECT json_group_array(DISTINCT provider_type) FROM item_evidence WHERE item_id=i.id) AS evidence_providers, (SELECT json_group_array(DISTINCT source_name) FROM item_evidence WHERE item_id=i.id) AS evidence_source_names FROM items i LEFT JOIN sources s ON s.id=i.source_id LEFT JOIN ai_evaluations e ON e.item_id=i.id WHERE i.archived_at IS NOT NULL ORDER BY i.archived_at DESC, i.id DESC LIMIT ?`, [limit]);
      return rows.map(mapItem2);
    },
    async restore(id) {
      await run("UPDATE items SET archived_at=NULL WHERE id=?", [id]);
      return true;
    },
    async batchRestore(ids) {
      if (!ids.length) return 0;
      const ph = ids.map(() => "?").join(",");
      const r = await run("UPDATE items SET archived_at=NULL WHERE id IN (" + ph + ")", ids);
      return Number(r.rowsAffected);
    },
    async batchDelete(ids) {
      if (!ids.length) return 0;
      const ph = ids.map(() => "?").join(",");
      const r = await run("DELETE FROM items WHERE id IN (" + ph + ")", ids);
      return Number(r.rowsAffected);
    },
    async archiveStaleItems() {
      const d1 = await run("UPDATE items SET status='watch' WHERE status='new' AND archived_at IS NULL AND datetime(published_at) < datetime('now','-24 hours')");
      const d2 = await run("UPDATE items SET archived_at=CURRENT_TIMESTAMP WHERE archived_at IS NULL AND datetime(published_at) < datetime('now','-24 hours') AND (read_at IS NOT NULL OR status IN ('watch','ignored'))");
      return Number(d1.rowsAffected) + Number(d2.rowsAffected);
    },
    async byId(id) {
      const row = await get(`SELECT i.*, s.reliability_tier AS source_reliability, s.community_source AS source_community, e.relevance_score,e.credibility_score,e.novelty_score,e.hotness_score,e.is_impersonation_likely,e.summary AS ai_summary,e.reason,e.recommended_action,e.keyword_mentioned,e.relevance_summary, (SELECT json_group_array(DISTINCT provider_type) FROM item_evidence WHERE item_id=i.id) AS evidence_providers, (SELECT json_group_array(DISTINCT source_name) FROM item_evidence WHERE item_id=i.id) AS evidence_source_names FROM items i LEFT JOIN sources s ON s.id=i.source_id LEFT JOIN ai_evaluations e ON e.item_id=i.id WHERE i.id=?`, [id]);
      return row ? mapItem2(row) : null;
    },
    async insert(input) {
      const rows = await all("SELECT id,title,published_at FROM items WHERE keyword_id=? ORDER BY id DESC LIMIT 120", [input.keywordId]);
      const inputTime = new Date(input.publishedAt).getTime();
      for (const row of rows) {
        const rt = new Date(row.published_at).getTime();
        if ((isNaN(inputTime) || isNaN(rt) || Math.abs(inputTime - rt) <= 36 * 60 * 60 * 1e3) && titleSimilarity(row.title, input.title) >= 0.62) {
          await mergeEvidence(row.id, input);
          return { id: row.id, inserted: false };
        }
      }
      try {
        await run(
          `INSERT INTO items (source_id,keyword_id,title,url,normalized_url,summary,published_at,fetched_at,matched_keyword,status,quality_score,quality_signals,evidence_count,interaction_likes,interaction_reposts,interaction_replies,interaction_views,interaction_danmaku,interaction_quotes,summary_source,interaction_source,author_name,author_followers,author_verified) VALUES (?,?,?,?,?,?,?,?,?,'watch',?,?,1,?,?,?,?,?,?,?,?,?,?,?)`,
          [input.sourceId, input.keywordId, input.title, input.url, input.normalizedUrl, input.summary, input.publishedAt, input.fetchedAt, input.matchedKeyword, input.qualityScore, JSON.stringify(input.qualitySignals), input.interactionLikes, input.interactionReposts, input.interactionReplies, input.interactionViews, input.interactionDanmaku ?? 0, input.interactionQuotes ?? 0, input.summarySource ?? "rss", input.interactionSource ?? "none", input.authorName ?? null, input.authorFollowers ?? 0, input.authorVerified ? 1 : 0]
        );
        const id = Number(await lastInsertRowid());
        await mergeEvidence(id, input);
        return { id, inserted: true };
      } catch (e) {
        if (e instanceof Error && e.message.includes("UNIQUE")) {
          const r = await get("SELECT id FROM items WHERE normalized_url=?", [input.normalizedUrl]);
          if (!r) return null;
          await mergeEvidence(r.id, input);
          return { id: r.id, inserted: false };
        }
        throw e;
      }
    },
    async markRead(id) {
      await run("UPDATE items SET read_at=CURRENT_TIMESTAMP WHERE id=?", [id]);
      return true;
    },
    async updateStatus(id, status) {
      await run("UPDATE items SET status=? WHERE id=?", [status, id]);
    },
    async addEvaluation(itemId, evaluation) {
      await run(
        `INSERT INTO ai_evaluations (item_id,relevance_score,credibility_score,novelty_score,hotness_score,is_impersonation_likely,summary,reason,recommended_action,keyword_mentioned,relevance_summary,raw_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(item_id) DO UPDATE SET relevance_score=excluded.relevance_score,credibility_score=excluded.credibility_score,novelty_score=excluded.novelty_score,hotness_score=excluded.hotness_score,is_impersonation_likely=excluded.is_impersonation_likely,summary=excluded.summary,reason=excluded.reason,recommended_action=excluded.recommended_action,keyword_mentioned=excluded.keyword_mentioned,relevance_summary=excluded.relevance_summary,raw_json=excluded.raw_json`,
        [itemId, evaluation.relevanceScore, evaluation.credibilityScore, evaluation.noveltyScore, evaluation.hotnessScore, Number(evaluation.isImpersonationLikely), evaluation.summary, evaluation.reason, evaluation.recommendedAction, evaluation.keywordMentioned ? 1 : 0, evaluation.relevanceSummary ?? "", JSON.stringify(evaluation)]
      );
    }
  },
  scanRuns: {
    async start() {
      await run("INSERT INTO scan_runs (started_at,status) VALUES (?,?)", [(/* @__PURE__ */ new Date()).toISOString(), "running"]);
      return Number(await lastInsertRowid());
    },
    async finish(id, status, totals) {
      await run("UPDATE scan_runs SET finished_at=?,status=?,total_fetched=?,total_inserted=?,total_evaluated=?,error=? WHERE id=?", [(/* @__PURE__ */ new Date()).toISOString(), status, totals.fetched, totals.inserted, totals.evaluated, totals.error ?? null, id]);
    },
    async last() {
      const r = await get("SELECT * FROM scan_runs ORDER BY id DESC LIMIT 1");
      return r ? mapScanRun2(r) : null;
    }
  }
};
async function mergeEvidence(itemId, input) {
  const src = await tursoRepos.sources.byId(input.sourceId);
  await run(
    "INSERT INTO item_evidence (item_id,provider_type,source_id,source_name,query,rank,original_url,normalized_url,domain,title,summary,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(item_id,provider_type,source_id,normalized_url) DO UPDATE SET rank=MIN(rank,excluded.rank), summary=CASE WHEN length(excluded.summary)>length(summary) THEN excluded.summary ELSE summary END",
    [itemId, input.providerType, input.sourceId, src?.name ?? "\u672A\u77E5\u6765\u6E90", input.query, input.rank, input.url, input.normalizedUrl, hostname3(input.normalizedUrl), input.title, input.summary, input.publishedAt]
  );
  const row = await get("SELECT COUNT(*) AS count FROM item_evidence WHERE item_id=?", [itemId]);
  await run("UPDATE items SET evidence_count=?, quality_score=MAX(quality_score,?) WHERE id=?", [row.count, input.qualityScore, itemId]);
}
function hostname3(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

// server/db/index.ts
var initialized2 = false;
async function initDb() {
  if (initialized2) return;
  if (process.env.VERCEL) {
    await initTursoDb();
  } else {
    getDb();
  }
  initialized2 = true;
}
var repos = {
  settings: {
    async all() {
      return process.env.VERCEL ? tursoRepos.settings.all() : repositories.settings.all();
    },
    async set(key, value) {
      if (process.env.VERCEL) await tursoRepos.settings.set(key, value);
      else repositories.settings.set(key, value);
    }
  },
  keywords: {
    async all() {
      return process.env.VERCEL ? tursoRepos.keywords.all() : repositories.keywords.all();
    },
    async active() {
      return process.env.VERCEL ? tursoRepos.keywords.active() : repositories.keywords.active();
    },
    async create(term, scope) {
      return process.env.VERCEL ? tursoRepos.keywords.create(term, scope) : repositories.keywords.create(term, scope);
    },
    async update(id, input) {
      return process.env.VERCEL ? tursoRepos.keywords.update(id, input) : repositories.keywords.update(id, input);
    },
    async delete(id) {
      return process.env.VERCEL ? tursoRepos.keywords.delete(id) : repositories.keywords.delete(id);
    },
    async byId(id) {
      return process.env.VERCEL ? tursoRepos.keywords.byId(id) : repositories.keywords.byId(id);
    }
  },
  sources: {
    async all() {
      return process.env.VERCEL ? tursoRepos.sources.all() : repositories.sources.all();
    },
    async active() {
      return process.env.VERCEL ? tursoRepos.sources.active() : repositories.sources.active();
    },
    async create(input) {
      return process.env.VERCEL ? tursoRepos.sources.create(input) : repositories.sources.create(input);
    },
    async update(id, input) {
      return process.env.VERCEL ? tursoRepos.sources.update(id, input) : repositories.sources.update(id, input);
    },
    async delete(id) {
      return process.env.VERCEL ? tursoRepos.sources.delete(id) : repositories.sources.delete(id);
    },
    async byId(id) {
      return process.env.VERCEL ? tursoRepos.sources.byId(id) : repositories.sources.byId(id);
    }
  },
  items: {
    async list(limit = 80) {
      return process.env.VERCEL ? tursoRepos.items.list(limit) : repositories.items.list(limit);
    },
    async archived(limit = 100) {
      return process.env.VERCEL ? tursoRepos.items.archived(limit) : repositories.items.archived(limit);
    },
    async restore(id) {
      return process.env.VERCEL ? tursoRepos.items.restore(id) : repositories.items.restore(id);
    },
    async batchRestore(ids) {
      return process.env.VERCEL ? tursoRepos.items.batchRestore(ids) : repositories.items.batchRestore(ids);
    },
    async batchDelete(ids) {
      return process.env.VERCEL ? tursoRepos.items.batchDelete(ids) : repositories.items.batchDelete(ids);
    },
    async archiveStaleItems() {
      return process.env.VERCEL ? tursoRepos.items.archiveStaleItems() : repositories.items.archiveStaleItems();
    },
    async byId(id) {
      return process.env.VERCEL ? tursoRepos.items.byId(id) : repositories.items.byId(id);
    },
    async insert(input) {
      return process.env.VERCEL ? tursoRepos.items.insert(input) : repositories.items.insert(input);
    },
    async markRead(id) {
      return process.env.VERCEL ? tursoRepos.items.markRead(id) : repositories.items.markRead(id);
    },
    async updateStatus(id, status) {
      if (process.env.VERCEL) await tursoRepos.items.updateStatus(id, status);
      else repositories.items.updateStatus(id, status);
    },
    async addEvaluation(itemId, evaluation) {
      if (process.env.VERCEL) await tursoRepos.items.addEvaluation(itemId, evaluation);
      else repositories.items.addEvaluation(itemId, evaluation);
    }
  },
  scanRuns: {
    async start() {
      return process.env.VERCEL ? tursoRepos.scanRuns.start() : repositories.scanRuns.start();
    },
    async finish(id, status, totals) {
      if (process.env.VERCEL) await tursoRepos.scanRuns.finish(id, status, totals);
      else repositories.scanRuns.finish(id, status, totals);
    },
    async last() {
      return process.env.VERCEL ? tursoRepos.scanRuns.last() : repositories.scanRuns.last();
    }
  }
};
function getDirectDb() {
  return getDb();
}

// server/services/collector.ts
import { XMLParser, XMLValidator } from "fast-xml-parser";

// server/services/enrichment.ts
var GAME_SITE_HOSTS = [
  "17173.com",
  "gcores.com",
  "gamersky.com",
  "3dmgame.com",
  "sohu.com",
  "163.com"
];
var REDIRECT_PARAM_KEYS = ["url", "u", "target", "dest", "destination", "redirect", "redir", "jump"];
async function enrichCollectedItem(item) {
  try {
    const resolved = await withTimeout(resolveCanonicalUrl(item.url), 5e3);
    const resolvedUrl = resolved?.url ?? item.url;
    const normalizedUrl = resolvedUrl === item.url ? item.normalizedUrl : normalizeUrl(resolvedUrl);
    const result = await withTimeout(enrichUrl(resolvedUrl, resolved?.html), 5e3);
    if (!result && resolvedUrl === item.url) return item;
    return {
      ...item,
      url: result?.url ?? resolvedUrl,
      normalizedUrl: result?.normalizedUrl ?? normalizedUrl,
      summary: result?.summary ? result.summary : item.summary,
      summarySource: result?.summarySource ?? item.summarySource,
      interactionLikes: result?.interactionLikes ?? item.interactionLikes,
      interactionReposts: result?.interactionReposts ?? item.interactionReposts,
      interactionReplies: result?.interactionReplies ?? item.interactionReplies,
      interactionViews: result?.interactionViews ?? item.interactionViews,
      interactionSource: result?.interactionSource ?? item.interactionSource,
      authorName: result?.authorName ?? item.authorName,
      authorFollowers: result?.authorFollowers ?? item.authorFollowers,
      authorVerified: result?.authorVerified ?? item.authorVerified,
      interactionDanmaku: result?.interactionDanmaku ?? item.interactionDanmaku,
      interactionQuotes: result?.interactionQuotes ?? item.interactionQuotes
    };
  } catch {
    return item;
  }
}
async function enrichUrl(url, html = "") {
  const bvid = extractBvid(url);
  const aid = extractAid(url);
  if (bvid || aid) {
    const result = await enrichBilibiliVideo({ bvid, aid });
    return result ? { ...result, url, normalizedUrl: normalizeUrl(url) } : null;
  }
  if (isZhihu(url)) {
    const result = await enrichZhihu(url);
    return result ? { ...result, url, normalizedUrl: normalizeUrl(url) } : null;
  }
  if (isWechatMp(url)) {
    const result = await enrichWechatMp(url, html);
    return result ? { ...result, url, normalizedUrl: normalizeUrl(url) } : null;
  }
  if (isGameSite(url) || isArticleSite(url)) {
    const result = await enrichHtmlMetadata(url, html);
    return result ? { ...result, url, normalizedUrl: normalizeUrl(url) } : null;
  }
  return null;
}
async function resolveCanonicalUrl(url, depth = 0) {
  if (depth > 2) return { url, html: "" };
  const directParam = redirectParamUrl(url);
  if (directParam && directParam !== url) {
    return resolveCanonicalUrl(directParam, depth + 1);
  }
  if (!shouldResolveUrl(url)) return { url, html: "" };
  const response = await fetch(url, {
    headers: {
      "User-Agent": "GameHotspotRadar/0.1"
    },
    redirect: "follow"
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const finalUrl = response.url || url;
  const candidates = [
    redirectParamUrl(finalUrl),
    !isGoogleNewsUrl(finalUrl) ? finalUrl : "",
    extractOriginalUrlFromHtml(html)
  ].filter(Boolean);
  const resolvedUrl = candidates.find((candidate) => /^https?:\/\//i.test(candidate) && !isGoogleNewsUrl(candidate)) ?? finalUrl;
  if (resolvedUrl !== finalUrl && shouldResolveUrl(resolvedUrl)) {
    return resolveCanonicalUrl(resolvedUrl, depth + 1);
  }
  return { url: resolvedUrl, html: resolvedUrl === finalUrl ? html : "" };
}
async function enrichBilibiliVideo(input) {
  const url = new URL("https://api.bilibili.com/x/web-interface/view");
  if (input.bvid) url.searchParams.set("bvid", input.bvid);
  if (input.aid) url.searchParams.set("aid", input.aid);
  const response = await fetchText(url.toString());
  const payload = JSON.parse(response);
  const data = payload.data;
  if (!data) return null;
  return {
    summary: cleanSummary(data.desc || data.title || ""),
    summarySource: data.desc ? "metadata" : "title",
    interactionLikes: data.stat?.like ?? 0,
    interactionReposts: data.stat?.share ?? 0,
    interactionReplies: data.stat?.reply ?? 0,
    interactionViews: data.stat?.view ?? 0,
    interactionDanmaku: data.stat?.danmaku ?? 0,
    interactionSource: "bilibili",
    authorName: data.owner?.name ?? null,
    authorFollowers: data.owner?.follower ?? 0,
    authorVerified: data.owner?.official_verify?.type === 0
  };
}
async function enrichZhihu(url) {
  const html = await fetchText(url);
  const likesMatch = html.match(/class="[^"]*Button.*?VoteButton.*?"[^>]*>[\s\S]*?(\d[\d,]*(?:,\d{3})*(?:\.\d+)?[kKwW万万]?)[\s\S]*?<\/button>/i) ?? html.match(/"voteupCount"\s*:\s*(\d+)/i) ?? html.match(/赞同[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  const repliesMatch = html.match(/"commentCount"\s*:\s*(\d+)/i) ?? html.match(/评论[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  const viewsMatch = html.match(/"visitCount"\s*:\s*(\d+)/i) ?? html.match(/浏览[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  if (!likesMatch && !repliesMatch && !viewsMatch) return null;
  return {
    summary: metaContent(html, "description") || metaContent(html, "og:description"),
    summarySource: "metadata",
    interactionLikes: likesMatch ? parseInt(likesMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionReplies: repliesMatch ? parseInt(repliesMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionViews: viewsMatch ? parseInt(viewsMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionSource: "zhihu",
    authorName: extractZhihuAuthor(html)
  };
}
function extractZhihuAuthor(html) {
  const m = html.match(/class="[^"]*AuthorInfo[^"]*"[^>]*>[\s\S]*?class="[^"]*UserLink[^"]*"[^>]*>([^<]+)</i) ?? html.match(/"author"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/i) ?? html.match(/<meta[^>]+itemprop="name"[^>]+content="([^"]+)"/i);
  return m?.[1]?.trim() ?? null;
}
async function enrichWechatMp(url, existingHtml = "") {
  const html = existingHtml || await fetchText(url);
  const viewsMatch = html.match(/var\s+read_num\s*=\s*(\d+)/i) ?? html.match(/"read_num"\s*:\s*(\d+)/i) ?? html.match(/var\s+readNum\s*=\s*(\d+)/i) ?? html.match(/阅读[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  const likesMatch = html.match(/var\s+like_num\s*=\s*(\d+)/i) ?? html.match(/"like_num"\s*:\s*(\d+)/i) ?? html.match(/var\s+likeNum\s*=\s*(\d+)/i) ?? html.match(/点赞[：:\s]*(\d[\d,]*(?:[kKwW万万])?)/i);
  if (!viewsMatch && !likesMatch) return null;
  return {
    summary: metaContent(html, "description") || metaContent(html, "og:description"),
    summarySource: "metadata",
    interactionLikes: likesMatch ? parseInt(likesMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionViews: viewsMatch ? parseInt(viewsMatch[1].replace(/[,，]/g, ""), 10) : 0,
    interactionSource: "wechat",
    authorName: extractWechatAuthor(html)
  };
}
function extractWechatAuthor(html) {
  const m = html.match(/class="[^"]*rich_media_meta_text[^"]*"[^>]*>([^<]+)</i) ?? html.match(/var\s+nickname\s*=\s*"([^"]+)"/i) ?? html.match(/"nickname"\s*:\s*"([^"]+)"/i);
  return m?.[1]?.trim() ?? null;
}
async function enrichHtmlMetadata(url, existingHtml = "") {
  const html = existingHtml || await fetchText(url);
  const summary = metaContent(html, "description") || metaContent(html, "og:description") || jsonLdDescription(html);
  if (!summary) return null;
  const counts = extractInteractionCounts2(html);
  return {
    summary: cleanSummary(summary).slice(0, 240),
    summarySource: "metadata",
    interactionLikes: counts.likes,
    interactionReposts: counts.reposts,
    interactionReplies: counts.replies,
    interactionViews: counts.views,
    interactionSource: hasAnyCount(counts) ? "html" : "none",
    authorName: metaContent(html, "author") || null
  };
}
function extractBvid(value) {
  return value.match(/\b(BV[0-9A-Za-z]{8,})\b/)?.[1] ?? "";
}
function extractAid(value) {
  return value.match(/(?:\/video\/av|[?&]aid=|(?:^|\s)av)(\d+)/i)?.[1] ?? "";
}
function extractInteractionCounts2(value) {
  const patterns = {
    likes: /(\d+(?:\.\d+)?[kKwW万]?)\s*(?:赞|点赞|like|upvote|赞同)/i,
    reposts: /(\d+(?:\.\d+)?[kKwW万]?)\s*(?:转发|repost|share|分享)/i,
    replies: /(\d+(?:\.\d+)?[kKwW万]?)\s*(?:回复|评论|comment|reply|回答|条评价|个回答)/i,
    views: /(\d+(?:\.\d+)?[kKwW万]?)\s*(?:播放|浏览|view|阅读)/i
  };
  const result = { likes: 0, reposts: 0, replies: 0, views: 0 };
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = value.match(pattern);
    if (match) result[key] = parseNumber2(match[1]);
  }
  return result;
}
function extractOriginalUrlFromHtml(html) {
  const candidates = [
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? "",
    html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? "",
    html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url=([^"']+)["']/i)?.[1] ?? "",
    html.match(/"url"\s*:\s*"([^"]+)"/i)?.[1] ?? "",
    ...Array.from(html.matchAll(/href=["']([^"']+)["']/gi)).map((match) => decodeHtml2(match[1]))
  ];
  return candidates.map((candidate) => decodeHtml2(candidate)).find((candidate) => /^https?:\/\//i.test(candidate) && !isGoogleNewsUrl(candidate)) ?? "";
}
function redirectParamUrl(value) {
  try {
    const url = new URL(value);
    for (const key of REDIRECT_PARAM_KEYS) {
      const candidate = url.searchParams.get(key);
      if (candidate && /^https?:\/\//i.test(candidate)) {
        try {
          return decodeURIComponent(candidate);
        } catch {
          return candidate;
        }
      }
    }
  } catch {
    return "";
  }
  return "";
}
function shouldResolveUrl(value) {
  return isGoogleNewsUrl(value) || isShortRedirectUrl(value);
}
function isGoogleNewsUrl(value) {
  return /news\.google\.com/i.test(value);
}
function isShortRedirectUrl(value) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "b23.tv" || host.endsWith(".b23.tv");
  } catch {
    return false;
  }
}
function isGameSite(value) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return GAME_SITE_HOSTS.some((entry) => host === entry || host.endsWith(`.${entry}`));
  } catch {
    return false;
  }
}
function isZhihu(value) {
  return /zhihu\.com/.test(value);
}
function isWechatMp(value) {
  return /mp\.weixin\.qq\.com/.test(value);
}
function isArticleSite(value) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    const articleHosts = [
      "news.qq.com",
      "tech.qq.com",
      "game.qq.com",
      "tech.sina.com.cn",
      "finance.sina.com.cn",
      "tech.163.com",
      "game.163.com",
      "it.sohu.com",
      "news.sohu.com",
      "36kr.com",
      "geekpark.net",
      "ithome.com",
      "cnbeta.com"
    ];
    return articleHosts.some((entry) => host === entry || host.endsWith(`.${entry}`));
  } catch {
    return false;
  }
}
async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "GameHotspotRadar/0.1"
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}
async function withTimeout(promise, timeoutMs) {
  let timeout;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error("enrichment timeout")), timeoutMs);
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
function metaContent(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  return decodeHtml2(pattern.exec(html)?.[1] ?? "");
}
function jsonLdDescription(html) {
  const match = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return "";
  try {
    const parsed = JSON.parse(match[1]);
    const entry = Array.isArray(parsed) ? parsed.find((item) => item.description) : parsed;
    return typeof entry?.description === "string" ? entry.description : "";
  } catch {
    return "";
  }
}
function parseNumber2(str) {
  const normalized = str.toLowerCase();
  const num = parseFloat(normalized);
  if (normalized.includes("k")) return Math.round(num * 1e3);
  if (normalized.includes("w") || str.includes("\u4E07")) return Math.round(num * 1e4);
  return Math.round(num);
}
function hasAnyCount(counts) {
  return counts.likes > 0 || counts.reposts > 0 || counts.replies > 0 || counts.views > 0;
}
function decodeHtml2(value) {
  return value.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// server/services/collector.ts
var parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: true
});
function fetchWithTimeout(url, init, timeoutMs = 8e3) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}
var GAME_TERMS = ["\u6E38\u620F", "\u7535\u7ADE", "\u624B\u6E38", "\u4E3B\u673A", "PS5", "Switch", "Steam", "\u539F\u795E", "\u7C73\u54C8\u6E38", "\u817E\u8BAF", "\u7F51\u6613", "3A", "\u8D5B\u535A", "\u9ED1\u795E\u8BDD", "\u865A\u5E7B", "Unity", "\u80B2\u78A7", "\u66B4\u96EA", "R\u661F"];
function isGameKeyword(keyword) {
  const haystack = `${keyword.term} ${keyword.scope}`.toLowerCase();
  return GAME_TERMS.some((gt) => haystack.includes(gt.toLowerCase()));
}
var GAME_MEDIA_SOURCES = /* @__PURE__ */ new Set(["\u673A\u6838\u7F51", "\u6E38\u7814\u793E", "\u89E6\u4E50"]);
async function collectFromSources(keywords, sources) {
  const results = [];
  const failures = /* @__PURE__ */ new Map();
  const tasks = [];
  for (const keyword of keywords) {
    const isGame = isGameKeyword(keyword);
    for (const source of sources) {
      if (!isGame && GAME_MEDIA_SOURCES.has(source.name)) continue;
      tasks.push(
        collectFromSource(keyword, source).catch((error) => {
          const key = `${source.name} (${source.providerType})`;
          const current = failures.get(key) ?? { count: 0, messages: /* @__PURE__ */ new Set() };
          current.count += 1;
          current.messages.add(error instanceof Error ? error.message : String(error));
          failures.set(key, current);
          return [];
        })
      );
    }
  }
  const batches = await Promise.all(tasks);
  for (const batch of batches) {
    results.push(...batch);
  }
  if (failures.size > 0) {
    const summary = Array.from(failures.entries()).map(([name, failure]) => {
      const messages = Array.from(failure.messages).slice(0, 2).join("; ");
      return `${name} x${failure.count}: ${messages}`;
    }).join(" | ");
    console.warn(`[collector] source failures: ${summary}`);
  }
  return results;
}
async function collectFromSource(keyword, source) {
  if (source.url.includes("{accountUid}") && (!keyword.accountMode || keyword.accountPlatform !== "bilibili" || !keyword.accountUid)) {
    return [];
  }
  if (source.providerType === "brave_search") {
    return collectFromBraveSearch(keyword, source);
  }
  if (source.providerType === "bilibili_search") {
    return collectFromBilibiliSearch(keyword, source);
  }
  if (source.providerType === "weibo_hot") {
    return collectFromWeiboHot(keyword, source);
  }
  const feedUrl = buildFeedUrl(source.url, keyword);
  const xml = await fetchText2(feedUrl);
  let items = parseFeed(xml, source, keyword);
  if (source.url.includes("{query}")) {
    const expanded = expandQuery(keyword);
    for (const variant of expanded) {
      if (variant === buildQuery(keyword)) continue;
      const variantUrl = source.url.replace("{query}", encodeURIComponent(variant));
      try {
        const variantXml = await fetchText2(variantUrl);
        const variantItems = parseFeed(variantXml, source, keyword);
        items = items.concat(variantItems);
      } catch {
      }
    }
  }
  if (!source.url.includes("{query}") && !keyword.accountMode) {
    const term = keyword.term.toLowerCase();
    items = items.filter(
      (item) => item.title.toLowerCase().includes(term) || item.summary.toLowerCase().includes(term) || keyword.scope && keyword.scope.split(/[,，、\s]+/).some(
        (w) => item.title.includes(w) || item.summary.includes(w)
      )
    );
  }
  return Promise.all(items.map(enrichCollectedItem));
}
function buildFeedUrl(template, keyword) {
  if (template.includes("{accountUid}")) {
    return template.replaceAll("{accountUid}", encodeURIComponent(keyword.accountUid));
  }
  if (keyword.accountMode) {
    return template.replaceAll("{query}", encodeURIComponent(keyword.term));
  }
  const query = [keyword.term, keyword.scope].filter(Boolean).join(" ");
  if (template.includes("baidu/search")) {
    const preciseQuery = `"${query}" -site:csdn.net -site:zhihu.com -site:jianshu.com`;
    return template.replaceAll("{query}", encodeURIComponent(preciseQuery));
  }
  return template.replaceAll("{query}", encodeURIComponent(query));
}
function parseFeed(xml, source, keyword) {
  const validation = XMLValidator.validate(xml, { allowBooleanAttributes: true });
  if (validation !== true) {
    throw new Error(`Invalid XML at line ${validation.err.line}`);
  }
  const parsed = parser.parse(xml);
  const rawItems = extractRawItems(parsed);
  const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
  return rawItems.map((item, index) => normalizeFeedItem(item, source, keyword, fetchedAt, index + 1)).filter((item) => Boolean(item));
}
async function collectFromBraveSearch(keyword, source) {
  const env2 = getEnv();
  if (!env2.braveSearchApiKey) return [];
  const query = buildQuery(keyword);
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", "10");
  url.searchParams.set("freshness", "pd");
  url.searchParams.set("country", "cn");
  url.searchParams.set("search_lang", "zh-hans");
  const response = await fetchWithTimeout(url, {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": env2.braveSearchApiKey,
      "User-Agent": "GameHotspotRadar/0.1"
    }
  });
  if (!response.ok) throw new Error(`Brave Search HTTP ${response.status}`);
  const payload = await response.json();
  const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
  const items = (payload.web?.results ?? []).map((result, index) => normalizeSearchResult(result, source, keyword, query, fetchedAt, index + 1)).filter((item) => Boolean(item));
  return Promise.all(items.map(enrichCollectedItem));
}
async function collectFromBilibiliSearch(keyword, source) {
  const query = buildQuery(keyword);
  const url = new URL("https://api.bilibili.com/x/web-interface/search/type");
  url.searchParams.set("search_type", "video");
  url.searchParams.set("keyword", query);
  url.searchParams.set("page", "1");
  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://search.bilibili.com",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "zh-CN,zh;q=0.9",
      "Cookie": "buvid3=auto"
    }
  });
  if (!response.ok) throw new Error(`Bilibili Search HTTP ${response.status}`);
  const text2 = await response.text();
  let payload;
  try {
    payload = JSON.parse(text2);
  } catch {
    return [];
  }
  const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
  const rawItems = (payload.data?.result ?? []).filter((v) => Boolean(v.bvid && v.title && (v.play ?? 0) >= 1e3));
  const results = [];
  for (let index = 0; index < rawItems.length; index++) {
    const video = rawItems[index];
    const videoUrl = video.arcurl || `https://www.bilibili.com/video/${video.bvid}`;
    const quality = assessContentQuality({ title: video.title, url: videoUrl, summary: video.description ?? "" });
    if (quality.lowQuality) continue;
    const counts = extractInteractionCounts2(video.title);
    results.push({
      sourceId: source.id,
      keywordId: keyword.id,
      providerType: "bilibili_search",
      title: cleanArticleTitle(video.title.replace(/<[^>]*>/g, "").trim()),
      url: videoUrl,
      normalizedUrl: normalizeUrl(videoUrl),
      summary: cleanSummary(video.description ?? ""),
      publishedAt: new Date((video.pubdate ?? 0) * 1e3).toISOString(),
      fetchedAt,
      matchedKeyword: keyword.term,
      query: buildQuery(keyword),
      rank: index + 1,
      qualityScore: quality.score,
      qualitySignals: quality.signals,
      interactionLikes: counts.likes,
      interactionReposts: counts.reposts,
      interactionReplies: counts.replies,
      interactionViews: video.play ?? 0,
      interactionSource: video.play ? "bilibili" : "none",
      summarySource: video.description ? "rss" : "title"
    });
  }
  let enriched = await Promise.all(results.map(enrichCollectedItem));
  const term = keyword.term.toLowerCase();
  enriched = enriched.filter(
    (item) => item.title.toLowerCase().includes(term) || item.summary.toLowerCase().includes(term)
  );
  return enriched;
}
var weiboHotCache = null;
async function collectFromWeiboHot(keyword, source) {
  const now = Date.now();
  if (weiboHotCache && now - weiboHotCache.fetchedAt < 3e5) {
    return filterWeiboTopics(weiboHotCache.topics, keyword, source);
  }
  const response = await fetchWithTimeout("https://weibo.com/ajax/side/hotSearch", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Referer": "https://www.weibo.com"
    }
  });
  if (!response.ok) throw new Error(`Weibo Hot HTTP ${response.status}`);
  const payload = await response.json();
  const topics = (payload.data?.realtime ?? []).map((t) => ({
    word: t.word ?? "",
    rank: t.rank ?? 0,
    raw_hot: t.raw_hot ?? 0
  }));
  weiboHotCache = { fetchedAt: now, topics };
  return filterWeiboTopics(topics, keyword, source);
}
function filterWeiboTopics(topics, keyword, source) {
  const term = keyword.term.toLowerCase();
  const gameTerms = ["\u6E38\u620F", "\u7535\u7ADE", "\u624B\u6E38", "\u4E3B\u673A", "PS5", "Switch", "Steam", "\u539F\u795E", "\u7C73\u54C8\u6E38", "\u817E\u8BAF", "\u7F51\u6613", "\u72EC\u7ACB\u6E38\u620F", "3A", "\u8D5B\u535A", "\u9ED1\u795E\u8BDD", "VR", "AI", "\u865A\u5E7B", "Unity", "\u80B2\u78A7", "\u66B4\u96EA", "R\u661F"];
  const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
  const results = [];
  for (const topic of topics) {
    const word = topic.word;
    const matchKeyword = word.includes(term) || term.split(" ").some((t) => word.includes(t));
    const matchGame = gameTerms.some((gt) => word.includes(gt.toLowerCase()));
    if (!matchKeyword && !matchGame) continue;
    const title = word;
    const url = `https://s.weibo.com/weibo?q=${encodeURIComponent(title)}`;
    const quality = assessContentQuality({ title, url, summary: "" });
    if (quality.lowQuality) continue;
    results.push({
      sourceId: source.id,
      keywordId: keyword.id,
      providerType: "weibo_hot",
      title: cleanArticleTitle(title),
      url,
      normalizedUrl: normalizeUrl(url),
      summary: `\u5FAE\u535A\u70ED\u641C #${topic.rank + 1}`,
      publishedAt: fetchedAt,
      fetchedAt,
      matchedKeyword: keyword.term,
      query: keyword.term,
      rank: 0,
      qualityScore: quality.score,
      qualitySignals: quality.signals,
      interactionLikes: 0,
      interactionReposts: 0,
      interactionReplies: 0,
      interactionViews: topic.raw_hot,
      interactionSource: "weibo",
      summarySource: "rss"
    });
  }
  return results;
}
async function fetchText2(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15e3);
  try {
    const response = await fetchWithTimeout(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "GameHotspotRadar/0.1"
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}
function extractRawItems(parsed) {
  const rss = parsed.rss;
  if (rss?.channel?.item) return arrayify(rss.channel.item);
  const feed = parsed.feed;
  if (feed?.entry) return arrayify(feed.entry);
  return [];
}
function normalizeFeedItem(raw, source, keyword, fetchedAt, rank) {
  const title = text(raw.title);
  const feedUrl = extractUrl(raw);
  const url = source.providerType === "google_news" ? extractOriginalUrl(raw, feedUrl) : feedUrl;
  if (!title || !url) return null;
  const summary = cleanSummary(text(raw.description) || text(raw.summary) || text(raw.content) || "");
  const quality = assessContentQuality({ title, url, summary, sourceName: source.name, sourceCommunity: source.communitySource });
  if (quality.lowQuality) return null;
  const unresolvedGoogleProxy = source.providerType === "google_news" && /news\.google\.com/i.test(url);
  const counts = extractInteractionCounts2(title);
  return {
    sourceId: source.id,
    keywordId: keyword.id,
    providerType: source.providerType,
    title: cleanArticleTitle(title),
    url,
    normalizedUrl: normalizeUrl(url),
    summary,
    publishedAt: parseDate(text(raw.pubDate) || text(raw.published) || text(raw.updated) || text(raw["dc:date"])) ?? fetchedAt,
    fetchedAt,
    matchedKeyword: keyword.term,
    query: buildQuery(keyword),
    rank,
    qualityScore: unresolvedGoogleProxy ? Math.max(0, quality.score - 18) : quality.score,
    qualitySignals: unresolvedGoogleProxy ? [...quality.signals, "Google \u4EE3\u7406\u539F\u6587\u672A\u6062\u590D"] : quality.signals,
    interactionLikes: counts.likes,
    interactionReposts: counts.reposts,
    interactionReplies: counts.replies,
    interactionViews: counts.views,
    summarySource: summary ? "rss" : "title",
    interactionSource: counts.likes || counts.reposts || counts.replies || counts.views ? "rss" : "none"
  };
}
function normalizeSearchResult(result, source, keyword, query, fetchedAt, rank) {
  const title = result.title ?? "";
  const url = result.url ?? "";
  if (!title || !url) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  const summary = cleanSummary(result.description ?? "");
  const quality = assessContentQuality({ title, url, summary, sourceName: source.name, sourceCommunity: source.communitySource });
  if (quality.lowQuality) return null;
  const counts = extractInteractionCounts2(title);
  return {
    sourceId: source.id,
    keywordId: keyword.id,
    providerType: "brave_search",
    title: cleanArticleTitle(title),
    url,
    normalizedUrl: normalizeUrl(url),
    summary,
    publishedAt: parseDate(result.age ?? "") ?? fetchedAt,
    fetchedAt,
    matchedKeyword: keyword.term,
    query,
    rank,
    qualityScore: quality.score,
    qualitySignals: quality.signals,
    interactionLikes: counts.likes,
    interactionReposts: counts.reposts,
    interactionReplies: counts.replies,
    interactionViews: counts.views,
    summarySource: summary ? "rss" : "title",
    interactionSource: counts.likes || counts.reposts || counts.replies || counts.views ? "rss" : "none"
  };
}
function extractUrl(raw) {
  const direct = text(raw.link) || text(raw.guid);
  if (direct && /^https?:\/\//i.test(direct)) return direct;
  const link = raw.link;
  if (Array.isArray(link)) {
    const hrefLink = link.find((entry) => typeof entry === "object" && entry !== null && "@_href" in entry);
    if (hrefLink?.["@_href"]) return hrefLink["@_href"];
  }
  if (typeof link === "object" && link !== null && "@_href" in link) {
    return String(link["@_href"]);
  }
  return "";
}
function extractOriginalUrl(raw, fallback) {
  const description = text(raw.description);
  const hrefs = Array.from(description.matchAll(/href=["']([^"']+)["']/gi)).map((match) => decodeHtml3(match[1]));
  const original = hrefs.find((href) => /^https?:\/\//i.test(href) && !/news\.google\.com/i.test(href));
  return original ?? fallback;
}
function buildQuery(keyword) {
  if (keyword.accountMode) return keyword.term;
  return [keyword.term, keyword.scope].filter(Boolean).join(" ");
}
function expandQuery(keyword) {
  const term = keyword.term.trim();
  const scope = keyword.scope.trim();
  if (keyword.accountMode) return [term];
  const variants = [];
  const combined = [term, scope].filter(Boolean).join(" ");
  if (combined) variants.push(combined);
  if (scope && term !== scope) {
    variants.push(term);
  }
  if (scope) {
    const tokens = scope.split(/[,，、\s]+/).filter(Boolean);
    for (const token of tokens) {
      const variant = `${term} ${token}`;
      if (!variants.includes(variant) && variant !== combined) {
        variants.push(variant);
      }
    }
  }
  return variants.slice(0, 4);
}
function parseDate(value) {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}
function text(value) {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value === "object" && value !== null && "#text" in value) {
    return String(value["#text"]).trim();
  }
  return "";
}
function decodeHtml3(value) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
function arrayify(value) {
  const array2 = Array.isArray(value) ? value : [value];
  return array2.filter((entry) => typeof entry === "object" && entry !== null);
}

// server/services/ai.ts
var RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "hotspot_evaluation",
    strict: true,
    schema: {
      type: "object",
      properties: {
        relevanceScore: { type: "number", minimum: 0, maximum: 100 },
        credibilityScore: { type: "number", minimum: 0, maximum: 100 },
        noveltyScore: { type: "number", minimum: 0, maximum: 100 },
        hotnessScore: { type: "number", minimum: 0, maximum: 100 },
        isImpersonationLikely: { type: "boolean" },
        summary: { type: "string" },
        reason: { type: "string" },
        recommendedAction: { type: "string", enum: ["notify", "watch", "ignore"] },
        keywordMentioned: { type: "boolean" },
        relevanceSummary: { type: "string" }
      },
      required: [
        "relevanceScore",
        "credibilityScore",
        "noveltyScore",
        "hotnessScore",
        "isImpersonationLikely",
        "summary",
        "reason",
        "recommendedAction",
        "keywordMentioned",
        "relevanceSummary"
      ],
      additionalProperties: false
    }
  }
};
var loggedOpenRouterFallbacks = /* @__PURE__ */ new Set();
function computeFreshnessScore(publishedAt) {
  const ageMs = Date.now() - new Date(publishedAt).getTime();
  if (Number.isNaN(ageMs)) return 50;
  const hours = ageMs / (60 * 60 * 1e3);
  if (hours < 6) return 100;
  if (hours < 12) return 85;
  if (hours < 24) return 65;
  if (hours < 48) return 35;
  return 0;
}
function computeInteractionScore(item) {
  const views = item.interactionViews ?? 0;
  const likes = item.interactionLikes ?? 0;
  if (views === 0 && likes === 0) return 50;
  const viewScore = views > 0 ? Math.min(100, Math.log10(views + 1) * 18) : 0;
  const likeScore = likes > 0 ? Math.min(100, Math.log10(likes + 1) * 12) : 0;
  return Math.round(Math.max(viewScore, likeScore));
}
function computeSourceScore(item) {
  if (item.sourceReliability === "official") return 100;
  if (item.sourceReliability === "trusted") return 80;
  if (item.sourceReliability === "search") return 60;
  return 40;
}
function computeEvidenceScore(evidenceCount) {
  return Math.min(100, evidenceCount * 25);
}
function computeKeywordRelevance(title, summary, keywordTerm) {
  const term = keywordTerm.toLowerCase().trim();
  const haystack = `${title} ${summary}`.toLowerCase();
  if (!term) return 50;
  if (haystack.includes(term)) return 100;
  const tokens = term.split(/[,，、\s]+/).filter((t) => t.length > 1);
  if (tokens.length === 0) return haystack.includes(term) ? 100 : 20;
  const hits = tokens.filter((t) => haystack.includes(t));
  const hitRatio = hits.length / tokens.length;
  const titleHasKeyword = tokens.some((t) => title.toLowerCase().includes(t));
  if (hitRatio >= 1) return 85;
  if (hitRatio >= 0.5 && titleHasKeyword) return 70;
  if (hitRatio >= 0.5) return 50;
  if (hitRatio > 0) return 30;
  return 0;
}
function computePriorityScore(item) {
  const freshness = computeFreshnessScore(item.publishedAt);
  const interaction = computeInteractionScore(item);
  const source = computeSourceScore(item);
  const evidence = computeEvidenceScore(item.evidenceCount);
  const relevance = computeKeywordRelevance(item.title, item.summary, item.matchedKeyword);
  const score = relevance * 0.3 + item.qualityScore * 0.2 + freshness * 0.2 + interaction * 0.15 + source * 0.1 + evidence * 0.05;
  return Math.round(Math.max(0, Math.min(100, score)));
}
async function generateBriefing(items) {
  const env2 = getEnv();
  if (!env2.openRouterApiKey) return generateMockBriefing(items);
  const topItems = items.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 10).map((item, i) => `${i + 1}. [${item.matchedKeyword}] ${item.title}${item.summary ? ` \u2014 ${item.summary.slice(0, 80)}` : ""}`).join("\n");
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env2.openRouterApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env2.openRouterModel,
        messages: [
          { role: "system", content: "\u4F60\u662F\u8D44\u8BAF\u7B80\u62A5\u52A9\u624B\u3002\u6839\u636E\u7ED9\u51FA\u7684\u70ED\u70B9\u6761\u76EE\uFF0C\u7528 2-3 \u53E5\u8BDD\u505A\u4E00\u4EFD\u4E2D\u6587\u7B80\u62A5\uFF0C\u6982\u62EC\u5F53\u524D\u6700\u503C\u5F97\u5173\u6CE8\u7684\u4E3B\u9898\u548C\u8D8B\u52BF\u3002\u8BED\u6C14\u7B80\u6D01\u4E13\u4E1A\uFF0C\u4E0D\u8D85\u8FC7 120 \u5B57\uFF0C\u4E0D\u5206\u70B9\u3002" },
          { role: "user", content: topItems }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });
    if (!response.ok) return generateMockBriefing(items);
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || generateMockBriefing(items);
  } catch {
    return generateMockBriefing(items);
  }
}
function generateMockBriefing(items) {
  const top = items.sort((a, b) => 0).slice(0, 5);
  const keywords = [...new Set(top.map((i) => i.matchedKeyword))].slice(0, 3).join("\u3001");
  return `\u5F53\u524D\u76D1\u63A7\u5230 ${items.length} \u6761\u70ED\u70B9\uFF0C\u4E3B\u8981\u6D89\u53CA ${keywords} \u7B49\u9886\u57DF\uFF0C\u5176\u4E2D\u591A\u7BC7\u5185\u5BB9\u5173\u6CE8\u6700\u65B0\u52A8\u6001\u4E0E\u6280\u672F\u8D8B\u52BF\u3002`;
}
async function evaluateItem(item, keyword, source) {
  const settings = repositories.settings.all();
  const env2 = getEnv();
  if (settings.aiMode === "mock" || !env2.openRouterApiKey) {
    return mockEvaluation(item, keyword, source);
  }
  try {
    return await evaluateWithOpenRouter(item, keyword, source);
  } catch (error) {
    logOpenRouterFallback(error);
    return mockEvaluation(item, keyword, source);
  }
}
async function evaluateWithOpenRouter(item, keyword, source) {
  const env2 = getEnv();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env2.openRouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env2.openRouterReferer,
      "X-OpenRouter-Title": env2.openRouterTitle
    },
    body: JSON.stringify({
      model: env2.openRouterModel,
      messages: [
        {
          role: "system",
          content: `\u4F60\u6839\u636E\u7ED9\u5B9A\u7684\u5173\u952E\u8BCD\u5224\u65AD\u6587\u7AE0\u7684\u76F8\u5173\u6027\u3002
\u6838\u5FC3\u4EFB\u52A1\uFF1A\u8BC4\u4F30\u6587\u7AE0\u662F\u5426**\u771F\u6B63\u8BA8\u8BBA**\u4E86\u5173\u952E\u8BCD\u6240\u4EE3\u8868\u7684\u8BDD\u9898\uFF0C\u800C\u975E\u4EC5\u5B57\u9762\u63D0\u53CA\u3002
keywordMentioned: \u6587\u7AE0\u662F\u5426\u786E\u5B9E\u6D89\u53CA\u5173\u952E\u8BCD\u4E3B\u9898\uFF08\u533A\u5206"\u63D0\u5230\u4E86\u8BCD"\u4E0E"\u8BA8\u8BBA\u4E86\u8BDD\u9898"\uFF09\u3002
relevanceScore: \u6587\u7AE0\u5185\u5BB9\u4E0E\u5173\u952E\u8BCD\u7684\u76F4\u63A5\u5173\u8054\u7A0B\u5EA6\uFF080=\u5B8C\u5168\u65E0\u5173\uFF0C100=\u9AD8\u5EA6\u6838\u5FC3\uFF09\u3002
relevanceSummary: \u7528\u4E00\u53E5\u8BDD\uFF08\u226450\u5B57\uFF09\u8BF4\u660E\u6587\u7AE0\u4E0E\u5173\u952E\u8BCD\u7684\u5177\u4F53\u5173\u8054\u3002
relevanceScore \u4E25\u683C\u6309\u5982\u4E0B\u6807\u51C6\uFF1A
0-20: \u5B8C\u5168\u65E0\u5173\u6216\u4EC5\u5076\u7136\u51FA\u73B0\u5173\u952E\u8BCD\uFF1B20-40: \u4EC5\u5B57\u9762\u63D0\u53CA\u4F46\u672A\u5B9E\u8D28\u6027\u8BA8\u8BBA\uFF1B
40-60: \u90E8\u5206\u76F8\u5173\u4F46\u6838\u5FC3\u4E3B\u9898\u4E0D\u540C\uFF1B60-80: \u76F8\u5173\u4F46\u975E\u4E13\u6CE8\u8BE5\u8BDD\u9898\uFF1B
80-100: \u6587\u7AE0\u6838\u5FC3\u4E3B\u9898\u5C31\u662F\u8BE5\u5173\u952E\u8BCD\u8BDD\u9898\u3002
\u53EA\u8F93\u51FA\u7B26\u5408 JSON Schema \u7684\u7ED3\u679C\u3002`
        },
        {
          role: "user",
          content: JSON.stringify({
            keyword: keyword?.term ?? item.matchedKeyword,
            scope: keyword?.scope ?? "",
            source: source ? {
              name: source.name,
              category: source.category,
              url: source.url,
              providerType: source.providerType,
              reliabilityTier: source.reliabilityTier,
              communitySource: source.communitySource,
              minQualityScore: source.minQualityScore
            } : null,
            qualitySignals: item.qualitySignals,
            evidenceCount: item.evidenceCount,
            evidenceProviders: item.evidenceProviders,
            sourceReliability: item.sourceReliability,
            communitySource: item.communitySource,
            item
          })
        }
      ],
      response_format: RESPONSE_FORMAT,
      temperature: 0.2,
      max_tokens: 800
    })
  });
  if (!response.ok) {
    throw new Error(`OpenRouter HTTP ${response.status}: ${summarizeOpenRouterError(await response.text())}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty content");
  return sanitizeEvaluation(JSON.parse(content));
}
function mockEvaluation(item, keyword, source) {
  const haystack = `${item.title} ${item.summary}`.toLowerCase();
  const term = (keyword?.term ?? item.matchedKeyword).toLowerCase();
  const baseMatch = computeKeywordRelevance(item.title, item.summary, term);
  const keywordMentioned = baseMatch >= 50;
  const relevance = keywordMentioned ? baseMatch : Math.min(baseMatch, 20);
  const credibilityBase = source?.reliabilityTier === "official" ? 86 : source?.reliabilityTier === "trusted" ? 78 : source?.reliabilityTier === "community" ? 58 : 70;
  const credibility = Math.min(95, credibilityBase + Math.max(0, item.evidenceCount - 1) * 8 + Math.floor((item.qualityScore - 70) / 4));
  const novelty = Date.now() - new Date(item.publishedAt).getTime() <= 24 * 60 * 60 * 1e3 ? 78 : 52;
  const hotness = relevance > 60 ? Math.min(50 + relevance * 0.35, 90) : 35;
  const suspicious = /免费领取|破解|内部绝密|必看爆料/.test(item.title);
  const relevanceSummary = keywordMentioned ? `\u6807\u9898\u4E0E\u6458\u8981\u4E2D\u5305\u542B\u5173\u952E\u8BCD"${term}"\u7684\u76F8\u5173\u8BA8\u8BBA` : `\u5185\u5BB9\u672A\u660E\u663E\u6D89\u53CA\u5173\u952E\u8BCD"${term}"\u7684\u6838\u5FC3\u8BDD\u9898`;
  return sanitizeEvaluation({
    relevanceScore: relevance,
    credibilityScore: suspicious ? 45 : credibility,
    noveltyScore: novelty,
    hotnessScore: suspicious ? 42 : hotness,
    isImpersonationLikely: suspicious,
    summary: item.summary ? cleanSummary(item.summary).slice(0, 120) : cleanArticleTitle(item.title),
    reason: suspicious ? "\u6807\u9898\u5B58\u5728\u660E\u663E\u8425\u9500\u6216\u7206\u6599\u8BDD\u672F\uFF0C\u5148\u964D\u7EA7\u4E3A\u5F85\u89C2\u5BDF\u3002" : `Mock: baseMatch=${baseMatch}, keywordMentioned=${keywordMentioned}`,
    recommendedAction: !suspicious && relevance >= 60 && item.qualityScore >= 70 ? "notify" : "watch",
    keywordMentioned,
    relevanceSummary
  });
}
function sanitizeEvaluation(input) {
  const credibilityScore = clamp(input.credibilityScore);
  const isImpersonationLikely = Boolean(input.isImpersonationLikely) && !(credibilityScore >= 75 && clamp(Math.max(input.relevanceScore, input.noveltyScore)) >= 70);
  return {
    relevanceScore: clamp(input.relevanceScore),
    credibilityScore,
    noveltyScore: clamp(input.noveltyScore),
    hotnessScore: clamp(input.hotnessScore),
    isImpersonationLikely,
    summary: cleanSummary(String(input.summary ?? "")).slice(0, 300),
    reason: String(input.reason ?? "").slice(0, 600),
    recommendedAction: ["notify", "watch", "ignore"].includes(input.recommendedAction) ? input.recommendedAction : "watch",
    keywordMentioned: Boolean(input.keywordMentioned),
    relevanceSummary: String(input.relevanceSummary ?? "").slice(0, 120)
  };
}
function isKeywordMentioned(title, summary, keywordTerm) {
  return computeKeywordRelevance(title, summary, keywordTerm) >= 30;
}
function computeFinalRelevance(item) {
  const baseMatch = computeKeywordRelevance(item.title, item.summary, item.matchedKeyword);
  const hasEval = item.evaluation !== null && item.evaluation !== void 0;
  const aiRelevance = item.evaluation?.relevanceScore ?? 0;
  const keywordMentioned = item.evaluation?.keywordMentioned ?? baseMatch >= 30;
  let semanticBoost = 1;
  if (hasEval) {
    if (aiRelevance >= 80) semanticBoost = 1.3;
    else if (aiRelevance >= 60) semanticBoost = 1.1;
    else if (aiRelevance >= 40) semanticBoost = 1;
    else if (aiRelevance >= 20) semanticBoost = 0.9;
    else semanticBoost = 0.8;
  }
  const mentionedBonus = keywordMentioned ? 1 : 0.3;
  return Math.round(Math.min(100, baseMatch * mentionedBonus * semanticBoost));
}
function clamp(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}
function logOpenRouterFallback(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (loggedOpenRouterFallbacks.has(message)) return;
  loggedOpenRouterFallbacks.add(message);
  console.warn(`[ai] OpenRouter unavailable, using mock fallback: ${message}`);
}
function summarizeOpenRouterError(text2) {
  try {
    const payload = JSON.parse(text2);
    const code = payload.error?.code ? `code ${payload.error.code}` : "request failed";
    const message = payload.error?.message ?? "unknown error";
    return `${code} - ${message}`;
  } catch {
    return text2.slice(0, 240);
  }
}

// server/services/scanner.ts
var scanning = false;
async function runScan() {
  if (scanning) {
    return { skipped: true, reason: "scan already running" };
  }
  scanning = true;
  const scanRunId = await repos.scanRuns.start();
  const totals = { fetched: 0, inserted: 0, evaluated: 0 };
  const isVercel = Boolean(process.env.VERCEL);
  try {
    const keywords = await repos.keywords.active();
    let sources = await repos.sources.active();
    if (isVercel) {
      sources = sources.filter((s) => s.providerType === "rss" && !s.name.includes("B\u7AD9"));
      console.log(`[scanner] Vercel fast mode: ${sources.length} sources`);
    }
    const collected = await collectFromSources(keywords, sources);
    totals.fetched = collected.length;
    const deduped = deduplicateBatch(collected);
    console.log(`[scanner] collected=${collected.length} deduped=${deduped.length}`);
    const insertedIds = [];
    for (const raw of deduped) {
      const source = sources.find((entry) => entry.id === raw.sourceId) ?? null;
      if (source && raw.qualityScore < source.minQualityScore) continue;
      const result = await repos.items.insert(raw);
      if (!result) continue;
      if (result.inserted) {
        totals.inserted += 1;
        insertedIds.push(result.id);
      }
    }
    const scoredItems = [];
    for (const itemId of insertedIds) {
      const item = await repos.items.byId(itemId);
      if (!item) continue;
      const freshnessScore = computeFreshnessScore(item.publishedAt);
      const priorityScore = computePriorityScore(item);
      scoredItems.push({ id: itemId, priorityScore, freshnessScore });
    }
    const existingTop = (await repos.items.list(50)).filter((i) => i.evaluation !== null && !insertedIds.includes(i.id)).slice(0, 8);
    for (const item of existingTop) {
      scoredItems.push({ id: item.id, priorityScore: item.priorityScore, freshnessScore: item.freshnessScore });
    }
    scoredItems.sort((a, b) => b.priorityScore - a.priorityScore);
    const seenIds = /* @__PURE__ */ new Set();
    const aiCandidates = scoredItems.filter((s) => {
      if (seenIds.has(s.id)) return false;
      seenIds.add(s.id);
      return true;
    }).slice(0, isVercel ? 1 : 15);
    if (!isVercel) {
      for (const candidate of aiCandidates) {
        const item = await repos.items.byId(candidate.id);
        if (!item) continue;
        if (!isKeywordMentioned(item.title, item.summary, item.matchedKeyword)) {
          console.log(`[scanner] skip AI eval (keyword not mentioned): ${item.title.slice(0, 40)}`);
          await repos.items.updateStatus(candidate.id, "ignored");
          continue;
        }
        const keyword = item.keywordId ? keywords.find((entry) => entry.id === item.keywordId) ?? null : null;
        const source = item.sourceId ? sources.find((entry) => entry.id === item.sourceId) ?? null : null;
        const evaluation = await evaluateItem(item, keyword, source);
        await repos.items.addEvaluation(candidate.id, evaluation);
        totals.evaluated += 1;
      }
    }
    for (const candidate of scoredItems) {
      const item = await repos.items.byId(candidate.id);
      if (!item) continue;
      const finalRelevance = computeFinalRelevance(item);
      let status;
      if (finalRelevance < 30) {
        status = "ignored";
      } else if (finalRelevance < 50) {
        status = candidate.priorityScore >= 75 ? "watch" : "ignored";
      } else if (candidate.priorityScore >= 75) {
        status = "new";
      } else if (candidate.priorityScore >= 50) {
        status = "watch";
      } else {
        status = "ignored";
      }
      const db = getDirectDb();
      db.prepare("UPDATE items SET priority_score = ?, freshness_score = ?, status = ? WHERE id = ?").run(candidate.priorityScore, candidate.freshnessScore, status, candidate.id);
    }
    await repos.scanRuns.finish(scanRunId, "success", totals);
    const archivedCount = await repos.items.archiveStaleItems();
    if (archivedCount > 0) {
      console.log("[scanner] Archived " + archivedCount + " old items");
    }
    return { skipped: false, ...totals };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await repos.scanRuns.finish(scanRunId, "failed", { ...totals, error: message });
    throw error;
  } finally {
    scanning = false;
  }
}
function deduplicateBatch(items) {
  const seenUrls = /* @__PURE__ */ new Set();
  const result = [];
  for (const item of items) {
    if (seenUrls.has(item.normalizedUrl)) continue;
    seenUrls.add(item.normalizedUrl);
    const duplicate = result.find(
      (existing) => existing.keywordId === item.keywordId && titleSimilarity(existing.title, item.title) >= 0.65
    );
    if (duplicate) continue;
    result.push(item);
  }
  return result;
}

// server/index.ts
var app = express();
var env = getEnv();
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", async (_req, res) => {
  await initDb();
  res.json({ ok: true, time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/dashboard", async (_req, res) => {
  res.json(await getDashboard());
});
app.get("/api/settings", async (_req, res) => {
  res.json(await repos.settings.all());
});
app.patch("/api/settings", async (req, res) => {
  const { aiMode, scanIntervalMinutes } = req.body;
  if (aiMode && !["openrouter", "mock"].includes(aiMode)) {
    return res.status(400).json({ error: "Invalid aiMode" });
  }
  if (aiMode) await repos.settings.set("aiMode", aiMode);
  if (typeof scanIntervalMinutes === "number") {
    if (scanIntervalMinutes < 5 || scanIntervalMinutes > 1440) {
      return res.status(400).json({ error: "scanIntervalMinutes must be 5-1440" });
    }
    await repos.settings.set("scanIntervalMinutes", String(Math.round(scanIntervalMinutes)));
  }
  return res.json(await repos.settings.all());
});
app.get("/api/keywords", async (_req, res) => {
  res.json(await repos.keywords.all());
});
app.post("/api/keywords", async (req, res) => {
  const { term, scope } = req.body;
  if (!term?.trim()) return res.status(400).json({ error: "term is required" });
  return res.status(201).json(await repos.keywords.create(term, scope ?? ""));
});
app.patch("/api/keywords/:id", async (req, res) => {
  const item = await repos.keywords.update(Number(req.params.id), req.body);
  if (!item) return res.status(404).json({ error: "Keyword not found" });
  return res.json(item);
});
app.delete("/api/keywords/:id", async (req, res) => {
  return res.json({ ok: await repos.keywords.delete(Number(req.params.id)) });
});
app.get("/api/sources", async (_req, res) => {
  res.json(await repos.sources.all());
});
app.post("/api/sources", async (req, res) => {
  const { name, url, category } = req.body;
  if (!name?.trim() || !url?.trim()) return res.status(400).json({ error: "name and url are required" });
  return res.status(201).json(await repos.sources.create({ name, url, category: category ?? "\u81EA\u5B9A\u4E49" }));
});
app.patch("/api/sources/:id", async (req, res) => {
  const item = await repos.sources.update(Number(req.params.id), req.body);
  if (!item) return res.status(404).json({ error: "Source not found" });
  return res.json(item);
});
app.delete("/api/sources/:id", async (req, res) => {
  return res.json({ ok: await repos.sources.delete(Number(req.params.id)) });
});
app.get("/api/items", async (req, res) => {
  const limit = Number(req.query.limit ?? 80);
  res.json(await repos.items.list(limit));
});
app.patch("/api/items/:id/read", async (req, res) => {
  const ok = await repos.items.markRead(Number(req.params.id));
  const items = await repos.items.list();
  res.json({ ok, unreadCount: visibleUnreadCount(items) });
});
app.get("/api/items/archived", async (req, res) => {
  const limit = Number(req.query.limit ?? 100);
  res.json(await repos.items.archived(limit));
});
app.post("/api/items/:id/restore", async (req, res) => {
  res.json({ ok: await repos.items.restore(Number(req.params.id)) });
});
app.post("/api/items/batch-restore", async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) return res.status(400).json({ error: "ids is required" });
  res.json({ ok: await repos.items.batchRestore(ids) });
});
app.post("/api/items/batch-delete", async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) return res.status(400).json({ error: "ids is required" });
  res.json({ ok: await repos.items.batchDelete(ids) });
});
app.post("/api/items/archive-stale", async (_req, res) => {
  const ok = await repos.items.archiveStaleItems();
  const items = await repos.items.list();
  res.json({ ok, unreadCount: visibleUnreadCount(items) });
});
app.get("/api/summary", async (_req, res) => {
  try {
    const items = (await repos.items.list()).map((item) => ({
      title: item.title,
      summary: item.summary,
      matchedKeyword: item.matchedKeyword,
      priorityScore: item.priorityScore
    }));
    const briefing = await generateBriefing(items);
    res.json({ briefing });
  } catch (error) {
    res.json({ briefing: "\u7B80\u62A5\u751F\u6210\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" });
  }
});
app.post("/api/scan", async (_req, res, next) => {
  try {
    const result = await runScan();
    res.json({ result, dashboard: await getDashboard() });
  } catch (error) {
    next(error);
  }
});
if (!process.env.VERCEL) {
  serveFrontendInProduction();
}
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.path}` });
});
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: error.message });
});
if (!process.env.VERCEL) {
  app.listen(env.port, "127.0.0.1", () => {
    console.log(`API listening on http://127.0.0.1:${env.port}`);
  });
}
var index_default = app;
async function getDashboard() {
  const items = await repos.items.list();
  return {
    settings: await repos.settings.all(),
    keywords: await repos.keywords.all(),
    sources: await repos.sources.all(),
    items,
    lastScan: await repos.scanRuns.last(),
    unreadCount: visibleUnreadCount(items)
  };
}
function visibleUnreadCount(items) {
  return items.filter((item) => item.status === "new" && item.readAt === null && !item.archivedAt).length;
}
function serveFrontendInProduction() {
  const __dirname2 = path3.dirname(fileURLToPath(import.meta.url));
  const dist = path3.resolve(__dirname2, "../dist");
  app.use(express.static(dist));
  app.get("*splat", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path3.join(dist, "index.html"), (error) => {
      if (error) next();
    });
  });
}
export {
  index_default as default
};
