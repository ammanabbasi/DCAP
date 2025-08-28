export const firstLetterToUpperCase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const getName = (name: string, userType: string, section = '') => {
  const formattedName = section ? firstLetterToUpperCase(name) : name;
  return `${userType}_${section}${formattedName}`;
};

interface ApplicationData {
  [key: string]: {
    [key: string]: any;
  };
}

interface FlattenedData {
  [key: string]: string;
}
export const flattenApplicationData = (data: ApplicationData): FlattenedData => {
  const result: FlattenedData = {};

  for (const [section, values] of Object.entries(data)) {
    for (const [key, value] of Object.entries(values)) {
      result[`${section}_${key}`] = value?.toString() ?? '';
    }
  }
  return result;
};

interface UnflattenedData {
  buyer: Record<string, string>;
  coBuyer: Record<string, string>;
}

export const unflattenApplicationData = (flatData: Record<string, string>): UnflattenedData => {
  const result: UnflattenedData = { buyer: {}, coBuyer: {} };

  for (const [key, value] of Object.entries(flatData)) {
    const [prefix, ...rest] = key.split('_');
    const actualKey = rest.join('_');

    if (prefix === 'buyer' || prefix === 'coBuyer') {
      result[prefix][actualKey] = value;
    }
  }

  return result;
};
