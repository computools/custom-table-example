export class ObjectUtils {
  public static resolveFieldData(data: any, field: any): string | number | null {
    if (data && field) {
      if (this.isFunction(field)) {
        return field(data);
      } else if (field.indexOf('.') == -1) {
        return data[field];
      } else {
        const fields: string[] = field.split('.');
        let value = data;
        for (let i = 0, len = fields.length; i < len; ++i) {
          if (value == null) {
            return null;
          }
          value = value[fields[i]];
        }
        return value;
      }
    } else {
      return null;
    }
  }

  public static isFunction(obj: any): boolean {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  }

  public static set = (
    object: any,
    propertyStr: string,
    value: any,
    properties = propertyStr.split('.'),
    i = 0
  ): void => {
    if (i === properties.length - 1) {
      object[properties[i]] = value;
    } else {
      if (!object[properties[i]]) {
        object[properties[i]] = {};
      }
      ObjectUtils.set(object[properties[i]], '', value, properties, i + 1);
    }
  };

  public static cloneDeep = (data: unknown, objMap?: WeakMap<any, any>): any => {
    if (!objMap) {
      // Map for handle recursive objects
      objMap = new WeakMap();
    }

    // recursion wrapper
    const deeper = (value: unknown): unknown => {
      if (value && typeof value === 'object') {
        return ObjectUtils.cloneDeep(value, objMap);
      }
      return value;
    };

    // Array value
    if (Array.isArray(data)) return data.map(deeper);

    // Object value
    if (data && typeof data === 'object') {
      // Same object seen earlier
      if (objMap.has(data)) return objMap.get(data);
      // Date object
      if (data instanceof Date) {
        const result = new Date(data.valueOf());
        objMap.set(data, result);
        return result;
      }
      // Use original prototype
      const node = Object.create(Object.getPrototypeOf(data));
      // Save object to map before recursion
      objMap.set(data, node);
      for (const [key, value] of Object.entries(data)) {
        node[key] = deeper(value);
      }
      return node;
    }
    // Scalar value
    return data;
  };
}
