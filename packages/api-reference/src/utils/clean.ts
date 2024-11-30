export function removeUndefinedFields<T>(obj: T): T | undefined {
  if (Array.isArray(obj)) {
    // Recursively clean each element in the array
    return obj.map((item) => removeUndefinedFields(item)) as T;
  } else if (typeof obj === "object" && obj !== null) {
    // Recursively clean each property in the object
    return Object.fromEntries(
      Object.entries(obj)
        .map(([key, value]) => [key, removeUndefinedFields(value)]) // Recurse
        .filter(([_, value]) => value !== undefined), // Remove undefined fields
    ) as T;
  }
  // Return non-object types as-is
  return obj;
}

export function fallbackToUndefined<T>(obj: T): T | undefined {
  return obj === undefined ||
    obj === null ||
    obj === false ||
    (typeof obj === "object" && Object.keys(obj).length === 0)
    ? undefined
    : obj;
}
