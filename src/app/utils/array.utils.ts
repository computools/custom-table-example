export class ArrayUtils {
  public static getArrayDepth = (arr: unknown): number => {
    if (Array.isArray(arr)) {
      let depth = 1;
      for (let i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i])) {
          const nestedDepth = ArrayUtils.getArrayDepth(arr[i]) + 1;
          depth = Math.max(depth, nestedDepth);
        }
      }
      return depth;
    } else {
      return 0;
    }
  };
}
