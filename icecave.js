const Immutable = require('immutable');
const fs = require('fs');

class IceCave {

  /**
   * @summary Create an instance of IceCave
   * @name IceCave
   * @class
   * @public
   *
   * @desc IceCave stores data in memory in an Immutable JS "list" structure
   * (similar to an array). This data is then periodically written to a flat file as JSON.
   * When a DB is created it will try to load the a JSON file from the location
   * specified by the 'dir' and 'name' parameters, otherwise it will start a new
   * "list" structure.
   * This class can only be Instantiated through the 'create' method exposed by
   * this module.
   *
   * @param {String} dir - Path to the directory where the DB data will be
   * written.
   * @param {String} name - The name of the DB
   *
   * @returns {IceCave} - Instance of IceCave
   *
   * @example
   * const storage = require('icecave').create('./data-directory');
   */
  constructor(dir, name) {
    if (!fs.existsSync(dir)) {
      throw new Error(`Whoops! The directory ${dir} doesn't exist.`);
    }

    const writeInterval = 1000;

    const getName = () => name;
    const getDir = () => dir;


    /**
     * @desc The source data used to seed this DB instance. If the data file is not
     * available this will be an empty array.
     * @type {Array}
     * @const
     * @private
     */
    const data = (() => {
      try {
        return require(`${dir}/${name}.json`);
      } catch(e) {
        return [];
      }
    })();

    /**
     * @desc In memory data storage for this DB instance. Uses an immutable
     * list.
     * {@link https://facebook.github.io/immutable-js/docs/#/List}
     */
    let core = Immutable.fromJS(data);

    /**
     * @desc Converts immutable data structures to plain JS.
     * @private
     *
     * @param {*} item - The data to convert to js
     *
     * @returns {*} - The converted data structure
     *
     * @example
     * const struct = Immutable.fromJS({ foo: 'bar' });
     * unpack(struct); // --> { foo: 'bar' }
     */
    const unpack = (item) => {
      return item.toJS ? item.toJS() : item;
    };

    /**
     * @summary Adds a value as the last item in the DB
     * @memberof IceCave
     * @public
     * @method
     *
     * @param {*} val - The value to store.
     *
     * @returns {Number} - The index of the new value
     *
     * @example
     * const storage = require('icecave').create('./data-directory');
     *
     * let index = storage.push({ foo: 'bar' });
     */
    const push = (val) => {
      core = core.push(Immutable.fromJS(val));
      return core.size - 1;
    };

    /**
     * @summary Deletes the value at 'index'.
     * @memberof IceCave
     * @public
     * @method
     *
     * @param {Number} index - The index of the item to delete
     *
     * @returns {void}
     *
     * @example
     * const storage = require('icecave').create('./data-directory');
     *
     * let index = storage.push({ foo: 'bar' });
     *
     * // ...
     *
     * storage.remove(index);
     */
    const remove = (index) => {
      core = core.delete(index);
    };

    /**
     * @summary Sets a new value at 'index'.
     * @memberof IceCave
     * @public
     * @method
     *
     * @param {Number} index - The index to set the new value at.
     * @param {*} val - The val to set
     *
     * @returns {Void}
     *
     * @example
     * const storage = require('icecave').create('./data-directory');
     *
     * let index = storage.push({ foo: 'bar' });
     *
     * // ...
     *
     * storage.set(index, { hello: 'world' });
     */
    const set = (index, val) => {
      core = core.set(index, Immutable.fromJS(val));
    };

    /**
     * @summary Retrieves the value at 'index'.
     * @memberof IceCave
     * @public
     * @method
     *
     * @param {Number} index - The index that should be retrieved.
     *
     * @returns {*} - The value at the specified index
     *
     * @example
     * const storage = require('icecave').create('./data-directory');
     *
     * let index = storage.push({ foo: 'bar' });
     *
     * // ...
     *
     * storage.get(index); // --> { foo: 'bar' }
     */
    const get = (index) => unpack(core.get(index));

    /**
     * @summary Returns the first value for which the predicate 'fn' returns true.
     * @memberof IceCave
     * @public
     * @method
     *
     * @param {Function} fn - fn(item): Predicate function that is provided with
     * the current item and should return a boolean value
     *
     * @returns {*} - The first value that matches the predicate.
     *
     * @example
     * const storage = require('icecave').create('./data-directory');
     *
     * storage.push({ id: 1, name: 'Adam' });
     * storage.push({ id: 2, name: 'Ben' });
     * storage.push({ id: 3, name: 'Chris' });
     *
     * // ...
     *
     * const user = storage.find(item => item.id === 2); // --> { id: 2, name: 'Ben' }
     */
    const find = (fn) => unpack(core.find((item) => fn(unpack(item))));

    /**
     * @summary Returns all values for which the predicate 'fn' returns true.
     * @memberof IceCave
     * @public
     * @method
     *
     * @param {Function} fn - fn(item): Predicate function that is provided with
     * the current item and should return a boolean value
     *
     * @returns {Array} - The values that match the predicate.
     *
     * @example
     * const storage = require('icecave').create('./data-directory');
     *
     * storage.push({ id: 1, name: 'Adam' });
     * storage.push({ id: 2, name: 'Ben' });
     * storage.push({ id: 3, name: 'Chris' });
     *
     * // ...
     *
     * const users = storage.filter(item => item.id > 1); // --> [{ id: 2, name: 'Ben' }, { id: 3, name: 'Chris' }]
     */
    const filter = (fn) => unpack(core.filter((item) => fn(unpack(item))));

    /**
     * @summary Returns the first value in storage
     * @memberof IceCave
     * @public
     * @method
     *
     * @returns {*} - The first value in storage
     *
     * @example
     * const storage = require('icecave').create('./data-directory');
     *
     * storage.push({ id: 1, name: 'Adam' });
     * storage.push({ id: 2, name: 'Ben' });
     * storage.push({ id: 3, name: 'Chris' });
     *
     * // ...
     *
     * const users = storage.first(); // --> { id: 1, name: 'Adam' }
     */
    const first = () => unpack(core.first());

    /**
     * @summary Returns the last value in storage
     * @memberof IceCave
     * @public
     * @method
     *
     * @returns {*} - The last value in storage
     *
     * @example
     * const storage = require('icecave').create('./data-directory');
     *
     * storage.push({ id: 1, name: 'Adam' });
     * storage.push({ id: 2, name: 'Ben' });
     * storage.push({ id: 3, name: 'Chris' });
     *
     * // ...
     *
     * const users = storage.last(); // --> { id: 3, name: 'Chris' }
     */
    const last = () => unpack(core.last());

    /**
     * @summary Writes the in memory storage to a JSON file.
     * @private
     */
    const write = () => {
      fs.writeFile(`${dir}/${name}.json`, JSON.stringify(core.toJS()));
    };

    setInterval(write, writeInterval);

    return {
      push,
      remove,
      get: get,
      set: set,
      find,
      filter,
      first,
      last,
    };
  }
}

/**
 * @module icecave
 */

/**
 * @summary Creates a new IceCave instance
 * @function
 * @public
 *
 * @desc Creates and returns a new IceCave instance. The instance will write
 * data to the directory specified by the `dir` parameter. You can optionally
 * specify a name for the instance, If a name is not provided then the name will
 * default to 'icecave'. The name is used to generate the storage flat file and
 * should be unique. For example if your IceCave DB has the name 'friends' then
 * it will write to a file named 'friends.json'.
 *
 * @param {String} dir - Path to the directory where the DB data will be
 * written.
 * @param {String} [name = 'icecave'] - (Optional) The name of the DB, defaults
 * to "icecave".
 *
 * @return {IceCave} - An instance of an IceCave DB
 *
 * @example
 * const IceCave = require('icecave');
 *
 * const storage = IceCave.create('./data-directory', 'storage');
 *
 * storage.push({ id: 1, name: 'Adam' });
 */
exports.create = (dir, name = 'icecave') => {
  return new IceCave(dir, name);
}

