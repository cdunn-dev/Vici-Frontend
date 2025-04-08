/**
 * Utility Types
 * 
 * General purpose TypeScript utility types used across the application.
 */

/**
 * Makes all properties of T nullable
 */
export type Nullable<T> = { [P in keyof T]: T[P] | null };

/**
 * Makes all properties of T optional
 */
export type Partial<T> = { [P in keyof T]?: T[P] };

/**
 * Makes all properties of T required
 */
export type Required<T> = { [P in keyof T]-?: T[P] };

/**
 * Makes all properties of T readonly
 */
export type Readonly<T> = { readonly [P in keyof T]: T[P] };

/**
 * Pick specific properties from T
 */
export type Pick<T, K extends keyof T> = { [P in K]: T[P] };

/**
 * Omit specific properties from T
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Extract keys from T where the property type is assignable to U
 */
export type ExtractPropertyKeys<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];

/**
 * Deep partial type - makes all properties and nested properties optional
 */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

/**
 * Wait for promises to resolve
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Represents a function with any signature
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * Represents a constructor with any signature
 */
export type AnyConstructor = new (...args: any[]) => any;

/**
 * Represents a record with string keys and values of type T
 */
export type Dictionary<T> = Record<string, T>;

/**
 * Represents a record with string keys and any value
 */
export type AnyDictionary = Dictionary<any>;

/**
 * Represents an object with keys from union type K and values of type T
 */
export type DictionaryOf<K extends string | number | symbol, T> = { [P in K]: T };

/**
 * Represents a function that takes parameters of type P and returns type R
 */
export type Func<P extends any[], R> = (...args: P) => R;

/**
 * Represents an asynchronous function that takes parameters of type P and returns Promise<R>
 */
export type AsyncFunc<P extends any[], R> = (...args: P) => Promise<R>;

/**
 * Makes specific properties of T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes specific properties of T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Makes specific properties of T nullable
 */
export type NullableBy<T, K extends keyof T> = Omit<T, K> & { [P in K]: T[P] | null };

/**
 * Makes specific properties of T readonly
 */
export type ReadonlyBy<T, K extends keyof T> = Omit<T, K> & Readonly<Pick<T, K>>; 