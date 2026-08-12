module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // babel-preset-expo's 'hermes-stable' transform profile (used for SDK 54's
    // Hermes) assumes the engine natively handles ES private class fields, but
    // it doesn't reliably yet — react-native's own bundled DOMException.js
    // (node_modules/react-native/src/private/webapis/...) uses `#field` syntax
    // and crashes at runtime in Expo Go with "private properties are not
    // supported". Force these down explicitly regardless of profile.
    // IMPORTANT: loose:false (spec-compliant, DefineOwnProperty-based) is
    // required here, not loose:true. react-native's own Event.js declares
    // Flow-typed public fields (e.g. `NONE;`) that get field-initialized to
    // `undefined` by this transform, then separately hardened read-only via
    // Object.defineProperty(..., {writable:false}). Loose mode compiles field
    // init to plain `this.NONE = undefined`, which respects the prototype
    // chain and throws "Cannot assign to read-only property" against that
    // later defineProperty. Non-loose mode uses DefineOwnProperty semantics
    // (matching native class fields), which bypasses that check correctly.
    plugins: [
      ['@babel/plugin-transform-class-properties', { loose: false }],
      ['@babel/plugin-transform-private-methods', { loose: false }],
      ['@babel/plugin-transform-private-property-in-object', { loose: false }],
    ],
  };
};
