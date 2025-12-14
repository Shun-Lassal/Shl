/**
 * Utilities for consistent field inclusion/exclusion in database queries
 */

/**
 * Prisma select object for excluding sensitive fields
 */
export const selectWithoutPassword = {
  id: true,
  username: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export const selectWithPassword = {
  id: true,
  username: true,
  email: true,
  password: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Generic field selector helper
 */
export const createSelectObject = (fields: string[]) => {
  return fields.reduce((acc, field) => {
    acc[field] = true;
    return acc;
  }, {} as Record<string, boolean>);
};

/**
 * Exclude fields from select object
 */
export const excludeFields = (selectObj: Record<string, boolean>, fieldsToExclude: string[]) => {
  const result = { ...selectObj };
  fieldsToExclude.forEach((field) => {
    delete result[field];
  });
  return result;
};
