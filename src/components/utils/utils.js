class Utils {
  static isEmpty(value) {
    return (
      value == null ||
      (typeof value === 'string' && value.trim().length === 0) ||
      value == ''
    );
  }
  static isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
  }

  static unique() {
    return Math.random().toString().substring(2, 8);
  }
}

export default Utils;
