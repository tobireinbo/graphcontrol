export default class Util {
  /**
   * iterate over an object. Specify the action at each step via callback function
   * @param object
   * @param cb
   */
  static objectToArray(
    object: { [key: string]: unknown },
    cb: (key: string, index: number, length: number) => void
  ): void {
    const dataKeysAsArray = Object.keys(object);
    const length = dataKeysAsArray.length || 0;
    dataKeysAsArray.map((key, index) => cb(key, index, length));
  }
}
