//@ts-nocheck : Sweet, sweet cursed TypeScript code that I'm not bothering to transpile to JavaScript.

/** @cursorsdottsx */

/** Notes */
/**
 * Extended native classes need to have the `this` context in methods equivalent to an instance of themselves, which is done by storing the old methods in an object for later invokation.
 *
 * If the class we are extending is native, we have to make the defined properties configurable.
 *
 * Testing on any browser that is not using V8 is not advised since results and output have been proven to be drastically different.
 *
 * Strive to mimic native behaviour as close as possible while still provided useless but entertaining extensions.
 */

(function () {
    "use strict";

    try {
        /** Utility functions to reduce the heaps of required repeated code. */

        Object.defineProperty(globalThis, "x", {
            configurable: false,
            enumerable: false,
            writable: false,
            value: {},
        });

        globalThis.x.defineCasts = function (prototype, casts) {
            if (typeof prototype === "undefined") this.error("No prototype provided to define casts.");

            if (!Array.isArray(casts)) this.error("No array of casts provided.");

            const primitives = new Map([
                [globalThis.number, globalThis.Number],
                [globalThis.string, globalThis.String],
                [globalThis.boolean, globalThis.Boolean],
                [globalThis.bigint, globalThis.BigInt],
                [globalThis.symbol, globalThis.Symbol],
            ]);

            return Object.defineProperties(
                prototype,
                casts.reduce((obj, cast) => {
                    obj[cast] = {
                        configurable: true,
                        enumerable: false,
                        get() {
                            if (primitives.has(cast)) return new (primitives.get(cast))(this.valueOf()).valueOf();

                            return new cast(this.valueOf());
                        },
                    };

                    return obj;
                }, {})
            );
        }.bind(function defineCasts() {});

        globalThis.x.nativeToString = function (fn) {
            if (typeof fn === "undefined") this.error("No function to modify.");

            if (!fn.name) this.error("Cannot modify anonymous functions.");

            Reflect.deleteProperty(fn, "toString");
            Object.defineProperty(fn, "toString", {
                configurable: false,
                enumerable: false,
                writable: false,
                value() {
                    return `function ${fn.name}() { [native code] }`;
                },
            });

            Object.defineProperty(fn.prototype, Symbol.toStringTag, {
                configurable: false,
                enumerable: false,
                get() {
                    return fn.name;
                },
            });

            return fn;
        }.bind(function nativeToString() {});

        globalThis.x.defineMethod = function (prototype, method, fn) {
            if (typeof prototype === "undefined") this.error("No prototype provided to define casts.");

            if (typeof method === "undefined") this.error("No method name provided.");

            if (typeof fn === "undefined") this.error("No method implementation provided.");

            //
        }.bind(function defineMethod() {});

        Object.freeze(globalThis.x);

        /** Static extension definitions. */

        Object.defineProperty(globalThis.Function.prototype, "error", {
            configurable: false,
            enumerable: false,
            writable: false,
            value(error) {
                if (typeof error === "undefined") throw new Error("Function.prototype.error: No error message provided.");

                throw new Error(`${this.name || "anonymous"}: ${error}`);
            },
        });

        Object.defineProperty(globalThis.String.prototype, "!", {
            configurable: false,
            enumerable: false,
            get() {
                return this.length;
            },
        });

        /** Store native classes to retain their old behaviour. */

        const NATIVE_NUMBER = globalThis.Number;
        const NATIVE_STRING = globalThis.String;
        const NATIVE_BOOLEAN = globalThis.Boolean;
        const NATIVE_BIGINT = globalThis.BigInt;
        const NATIVE_SYMBOL = globalThis.Symbol;
        const NATIVE_ARRAY = globalThis.Array;

        /** Recreate native `toString` behaviour. */

        globalThis.x.nativeToString(NATIVE_NUMBER);
        globalThis.x.nativeToString(NATIVE_STRING);
        globalThis.x.nativeToString(NATIVE_BOOLEAN);
        globalThis.x.nativeToString(NATIVE_BIGINT);
        globalThis.x.nativeToString(NATIVE_SYMBOL);
        globalThis.x.nativeToString(NATIVE_ARRAY);

        /** Define new extension classes and extend native classes with `Proxy`. */

        globalThis.Char = globalThis.x.nativeToString(
            Object.setPrototypeOf(function Char(...args) {
                if (!new.target) return new Char(...args);

                return new (class Char extends globalThis.String {
                    constructor(...args) {
                        super(args[0] || "\0", ...args.slice(1));

                        if (args[0] && args[0].toString().length > 1) throw new TypeError("[Extensions] Illegal constructor.");
                    }
                })(...args);
            }, globalThis.String)
        );

        globalThis.Byte = globalThis.x.nativeToString(
            Object.setPrototypeOf(function Byte(...args) {
                if (!new.target) return new Byte(...args);

                return new (class Byte extends globalThis.Number {
                    constructor(...args) {
                        super(...args);

                        if (typeof args[0] === "symbol" || Number(args[0]) < -128 || Number(args[0]) > 127) throw new TypeError("[Extensions] Illegal constructor.");
                    }
                })(...args);
            }, globalThis.Number)
        );

        globalThis.Int8 = globalThis.x.nativeToString(
            Object.setPrototypeOf(function Int8(...args) {
                if (!new.target) return new Int8(...args);

                return new (class Int8 extends globalThis.Byte {})(...args);
            }, globalThis.Byte)
        );

        globalThis.Short = globalThis.x
            .nativeToString(
                Object.setPrototypeOf(function Short(...args) {
                    if (!new.target) return new Short(...args);

                    return new (class Short extends globalThis.Number {
                        constructor(...args) {
                            super(...args);

                            if (typeof args[0] === "symbol" || Number(args[0]) < -32768 || Number(args[0]) > 32767) throw new TypeError("[Extensions] Illegal constructor.");
                        }
                    })(...args);
                }, globalThis.Number)
            )
            .bind(globalThis.Number);

        globalThis.Int16 = globalThis.x.nativeToString(
            Object.setPrototypeOf(function Int16(...args) {
                if (!new.target) return new Int16(...args);

                return new (class Int16 extends globalThis.Short {})(...args);
            }, globalThis.Short)
        );

        globalThis.Number = globalThis.x
            .nativeToString(
                Object.setPrototypeOf(function Number(...args) {
                    if (!new.target) return NATIVE_NUMBER(...args);

                    return new Proxy(
                        new (class Number extends NATIVE_NUMBER {
                            constructor(...args) {
                                super(...args);

                                if (typeof args[0] === "string" && args[0].slice(2).length) {
                                    const n = args[0].slice(2);

                                    if (args[0].startsWith("0x")) args[0] = parseInt(n, 16);
                                    else if (args[0].startsWith("0o")) args[0] = parseInt(n, 8);
                                    else if (args[0].startsWith("0b")) args[0] = parseInt(n, 2);
                                }
                            }
                        })(...args),
                        {
                            get(...args) {
                                if (typeof args[1] === "string") {
                                    if (args[1] === "++") return new Number(args[0].valueOf() + 1);
                                    if (args[1] === "--") return new Number(args[0].valueOf() - 1);

                                    if (/^\+\d*\.?\d*$/.test(args[1])) return new Number(args[0].valueOf() + parseFloat(args[1].match(/\d*\.?\d*/g)[1]));
                                    if (/^\-\d*\.?\d*$/.test(args[1])) return new Number(args[0].valueOf() - parseFloat(args[1].match(/\d*\.?\d*/g)[1]));
                                }

                                if (typeof args[0][args[1]] === "function") return args[0][args[1]].bind(args[0]);

                                return Reflect.get(...args);
                            },
                        }
                    );
                }, NATIVE_NUMBER)
            )
            .bind(NATIVE_NUMBER);

        globalThis.String = globalThis.x
            .nativeToString(
                Object.setPrototypeOf(function String(...args) {
                    if (!new.target) return NATIVE_STRING(...args);

                    return new Proxy(new (class String extends NATIVE_STRING {})(...args), {
                        get(...args) {
                            if (typeof args[1] === "string" && parseInt(args[1]) < 0 && parseInt(args[1].slice(1)) <= args[0].length)
                                return args[0][args[0].length - parseInt(args[1].slice(1))];

                            if (typeof args[1] === "string") {
                                if (/^\+.+$/.test(args[1])) return new String(args[0].valueOf() + args[1].match(/^\+(.+)$/)[1]);
                                if (/^\-.+$/.test(args[1])) return new String(args[1].match(/^\-(.+)$/)[1] + args[0].valueOf());

                                if (args[1] === "^") return new String(args[0].trim());
                                if (args[1] === "^>") return new String(args[0].trimEnd());
                                if (args[1] === "^<") return new String(args[0].trimStart());

                                if (/^\$[><]\d*$/.test(args[1])) {
                                    const d = args[1][1];
                                    const n = args[1].match(/^\$[><](\d*)$/)[1] || (d === ">" ? 0 : -args[0].length);

                                    return new String(d === ">" ? args[0].slice(n) : args[0].slice(0, -n));
                                }
                            }

                            if (typeof args[0][args[1]] === "function") return args[0][args[1]].bind(args[0]);

                            return Reflect.get(...args);
                        },
                    });
                }, NATIVE_STRING)
            )
            .bind(NATIVE_STRING);

        globalThis.Boolean = globalThis.x
            .nativeToString(
                Object.setPrototypeOf(function Boolean(...args) {
                    if (!new.target) return NATIVE_BOOLEAN(...args);

                    return new Proxy(new (class Boolean extends NATIVE_BOOLEAN {})(...args), {
                        get(...args) {
                            if (/^!+$/.test(args[1])) return new Array(args[0].length).fill("").reduce(($) => !$, args[0].valueOf());

                            if (typeof args[0][args[1]] === "function") return args[0][args[1]].bind(args[0]);

                            return Reflect.get(...args);
                        },
                    });
                }, NATIVE_BOOLEAN)
            )
            .bind(NATIVE_BOOLEAN);

        globalThis.BigInt = globalThis.x
            .nativeToString(
                Object.setPrototypeOf(function BigInt(...args) {
                    if (!new.target) return new BigInt(...args);

                    const SYMBOL = Symbol("internal");

                    function BigInt(...args) {
                        if (typeof args[0] === "string" && args[0].slice(2).length) {
                            const n = args[0].slice(2);

                            if (args[0].startsWith("0x")) args[0] = parseInt(n, 16);
                            else if (args[0].startsWith("0o")) args[0] = parseInt(n, 8);
                            else if (args[0].startsWith("0b")) args[0] = parseInt(n, 2);
                            else args[0] = parseInt(args[0], 10);
                        }

                        this[SYMBOL] = NATIVE_BIGINT(args[0]);
                    }

                    Object.defineProperty(BigInt.prototype, SYMBOL, {
                        configurable: false,
                        enumerable: false,
                        writable: true,
                        value: 0n,
                    });

                    BigInt.prototype.toString = function () {
                        return this[SYMBOL].toString();
                    };

                    BigInt.prototype.toLocaleString = function () {
                        return this[SYMBOL].toLocaleString();
                    };

                    BigInt.prototype.valueOf = function () {
                        return this[SYMBOL];
                    };

                    globalThis.x.nativeToString(BigInt);

                    return new BigInt(...args);
                }, NATIVE_BIGINT)
            )
            .bind(NATIVE_BIGINT);

        globalThis.Symbol = NATIVE_SYMBOL; // No changes needed for Symbol, actually.

        globalThis.Array = globalThis.x
            .nativeToString(
                Object.setPrototypeOf(function Array(...args) {
                    if (!new.target) return new Array(...args);

                    return new Proxy(new (class Array extends NATIVE_ARRAY {})(...args), {
                        get(...args) {
                            if (typeof args[1] === "string" && parseInt(args[1]) < 0 && parseInt(args[1].slice(1)) <= args[0].length)
                                return args[0][args[0].length - parseInt(args[1].slice(1))];

                            if (typeof args[0][args[1]] === "function") return args[0][args[1]].bind(args[0]);

                            return Reflect.get(...args);
                        },
                    });
                }, NATIVE_ARRAY)
            )
            .bind(NATIVE_ARRAY);

        /** Classes to represent primitive casts. */

        globalThis.number = function number() {};
        globalThis.string = function string() {};
        globalThis.boolean = function boolean() {};
        globalThis.bigint = function bigint() {};
        globalThis.symbol = function symbol() {};

        /** Define casts for each extension class and extended native class. */

        const primitives = [globalThis.number, globalThis.string, globalThis.boolean, globalThis.bigint, globalThis.symbol];

        const wrappers = [globalThis.String, globalThis.Number, globalThis.Boolean];

        globalThis.x.defineCasts(globalThis.Char.prototype, [...primitives, globalThis.Char, ...wrappers]);

        globalThis.x.defineCasts(globalThis.Byte.prototype, [...primitives, globalThis.Byte, globalThis.Int8, globalThis.Short, globalThis.Int16, ...wrappers]);

        globalThis.x.defineCasts(globalThis.Short.prototype, [...primitives, globalThis.Short, globalThis.Int16, ...wrappers]);

        globalThis.x.defineCasts(globalThis.Number.prototype, [...primitives, ...wrappers]);

        globalThis.x.defineCasts(globalThis.String.prototype, [...primitives, ...wrappers]);

        globalThis.x.defineCasts(globalThis.Boolean.prototype, [...primitives, ...wrappers]);

        globalThis.x.defineCasts(globalThis.Array.prototype, [
            ...wrappers,
            globalThis.Array,
            globalThis.Int8Array,
            globalThis.Int16Array,
            globalThis.Int32Array,
            globalThis.Uint8Array,
            globalThis.Uint8ClampedArray,
            globalThis.Uint16Array,
            globalThis.Uint32Array,
            globalThis.Float32Array,
            globalThis.Float64Array,
            globalThis.BigInt64Array,
            globalThis.BigUint64Array,
        ]);

        return console.log(`[Extensions] Initialization complete.`);
    } catch (error) {
        /** Something went wrong in the initialization sequence. */

        return console.error(`[Extensions] Initialization error:`, error);
    }
})();
