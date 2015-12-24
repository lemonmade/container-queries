let cache = new WeakMap();

const DOMCache = Object.freeze({
  clear() {
    cache = new WeakMap();
  },

  clearForNode(node) {
    cache.delete(node);
  },

  setValueForNode(node, {key, value}) {
    let currentCache = cache.get(node) || {};
    currentCache[key] = value;
    cache.set(node, currentCache);
  },

  deleteValueForNode(node, {key}) {
    delete (cache.get(node) || {})[key];
  },

  getValueForNode(node, {key}) {
    return (cache.get(node) || {})[key];
  },
});

export default DOMCache;
