/**
 * A basic collection of data
 * @param {iterable} [iterable] An iterable that can be put into the collection
 */
class Collection extends Map {
  constructor(iterable) {
    super(iterable);
  }

  get(id) {
    const item = super.get(id);
    if (item) {
      return item;
    }
    throw new Error('Undefined collection item id');
  }
}

module.exports = Collection;
