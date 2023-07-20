//@typescript-eslint/no-explicit-any
export const removeEmpty = (obj: any) => {
  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] === Object(obj[key])) {
      if (obj[key].length >= 0) newObj[key] = obj[key]; //handle array
      else newObj[key] = removeEmpty(obj[key]);
    } else if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};
