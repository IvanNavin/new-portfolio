/**
 * Client
 **/

import * as runtime from "./runtime/library.js";
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model Pokemon
 *
 */
export type Pokemon = $Result.DefaultSelection<Prisma.$PokemonPayload>;
/**
 * Model User
 *
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>;
/**
 * Model Card
 *
 */
export type Card = $Result.DefaultSelection<Prisma.$CardPayload>;
/**
 * Model Apartment
 *
 */
export type Apartment = $Result.DefaultSelection<Prisma.$ApartmentPayload>;
/**
 * Model ApartmentList
 *
 */
export type ApartmentList =
  $Result.DefaultSelection<Prisma.$ApartmentListPayload>;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Pokemon
 * const pokemon = await prisma.pokemon.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = "log" extends keyof ClientOptions
    ? ClientOptions["log"] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions["log"]>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["other"] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Pokemon
   * const pokemon = await prisma.pokemon.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(
    optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>,
  );
  $on<V extends U>(
    eventType: V,
    callback: (
      event: V extends "query" ? Prisma.QueryEvent : Prisma.LogEvent,
    ) => void,
  ): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (
      prisma: Omit<PrismaClient, runtime.ITXClientDenyList>,
    ) => $Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>;

  /**
   * `prisma.pokemon`: Exposes CRUD operations for the **Pokemon** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Pokemon
   * const pokemon = await prisma.pokemon.findMany()
   * ```
   */
  get pokemon(): Prisma.PokemonDelegate<ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.card`: Exposes CRUD operations for the **Card** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Cards
   * const cards = await prisma.card.findMany()
   * ```
   */
  get card(): Prisma.CardDelegate<ExtArgs>;

  /**
   * `prisma.apartment`: Exposes CRUD operations for the **Apartment** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Apartments
   * const apartments = await prisma.apartment.findMany()
   * ```
   */
  get apartment(): Prisma.ApartmentDelegate<ExtArgs>;

  /**
   * `prisma.apartmentList`: Exposes CRUD operations for the **ApartmentList** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more ApartmentLists
   * const apartmentLists = await prisma.apartmentList.findMany()
   * ```
   */
  get apartmentList(): Prisma.ApartmentListDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;
  export import NotFoundError = runtime.NotFoundError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics;
  export type Metric<T> = runtime.Metric<T>;
  export type MetricHistogram = runtime.MetricHistogram;
  export type MetricHistogramBucket = runtime.MetricHistogramBucket;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> =
    T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<
    T extends (...args: any) => $Utils.JsPromise<any>,
  > = PromiseType<ReturnType<T>>;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? "Please either choose `select` or `include`."
    : T extends SelectAndOmit
      ? "Please either choose `select` or `omit`."
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends BigInt
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<
    __Either<O, K>
  >;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = O extends unknown ? _Either<O, K, strict> : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O
    ? O[K]
    : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown
    ? AtStrict<O, K>
    : never;
  export type At<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ?
          | (K extends keyof O ? { [P in K]: O[P] } & O : O)
          | ({ [P in keyof O as P extends K ? K : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<
    T,
    U = Omit<T, "_avg" | "_sum" | "_count" | "_min" | "_max">,
  > = IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<"OR", K>, Extends<"AND", K>>,
      Extends<"NOT", K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<
            UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never
          >
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<
    T,
    K extends Enumerable<keyof T> | keyof T,
  > = Prisma__Pick<T, MaybeTupleToUnion<K>>;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}`
    ? never
    : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName: {
    Pokemon: "Pokemon";
    User: "User";
    Card: "Card";
    Apartment: "Apartment";
    ApartmentList: "ApartmentList";
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  export type Datasources = {
    db?: Datasource;
  };

  interface TypeMapCb
    extends $Utils.Fn<
      { extArgs: $Extensions.InternalArgs; clientOptions: PrismaClientOptions },
      $Utils.Record<string, any>
    > {
    returns: Prisma.TypeMap<
      this["params"]["extArgs"],
      this["params"]["clientOptions"]
    >;
  }

  export type TypeMap<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    ClientOptions = {},
  > = {
    meta: {
      modelProps: "pokemon" | "user" | "card" | "apartment" | "apartmentList";
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      Pokemon: {
        payload: Prisma.$PokemonPayload<ExtArgs>;
        fields: Prisma.PokemonFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.PokemonFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PokemonPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.PokemonFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PokemonPayload>;
          };
          findFirst: {
            args: Prisma.PokemonFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PokemonPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.PokemonFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PokemonPayload>;
          };
          findMany: {
            args: Prisma.PokemonFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PokemonPayload>[];
          };
          create: {
            args: Prisma.PokemonCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PokemonPayload>;
          };
          createMany: {
            args: Prisma.PokemonCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.PokemonCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PokemonPayload>[];
          };
          delete: {
            args: Prisma.PokemonDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PokemonPayload>;
          };
          update: {
            args: Prisma.PokemonUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PokemonPayload>;
          };
          deleteMany: {
            args: Prisma.PokemonDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.PokemonUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.PokemonUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PokemonPayload>;
          };
          aggregate: {
            args: Prisma.PokemonAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregatePokemon>;
          };
          groupBy: {
            args: Prisma.PokemonGroupByArgs<ExtArgs>;
            result: $Utils.Optional<PokemonGroupByOutputType>[];
          };
          count: {
            args: Prisma.PokemonCountArgs<ExtArgs>;
            result: $Utils.Optional<PokemonCountAggregateOutputType> | number;
          };
        };
      };
      User: {
        payload: Prisma.$UserPayload<ExtArgs>;
        fields: Prisma.UserFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateUser>;
          };
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>;
            result: $Utils.Optional<UserGroupByOutputType>[];
          };
          count: {
            args: Prisma.UserCountArgs<ExtArgs>;
            result: $Utils.Optional<UserCountAggregateOutputType> | number;
          };
        };
      };
      Card: {
        payload: Prisma.$CardPayload<ExtArgs>;
        fields: Prisma.CardFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.CardFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CardPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.CardFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CardPayload>;
          };
          findFirst: {
            args: Prisma.CardFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CardPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.CardFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CardPayload>;
          };
          findMany: {
            args: Prisma.CardFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CardPayload>[];
          };
          create: {
            args: Prisma.CardCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CardPayload>;
          };
          createMany: {
            args: Prisma.CardCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.CardCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CardPayload>[];
          };
          delete: {
            args: Prisma.CardDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CardPayload>;
          };
          update: {
            args: Prisma.CardUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CardPayload>;
          };
          deleteMany: {
            args: Prisma.CardDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.CardUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.CardUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CardPayload>;
          };
          aggregate: {
            args: Prisma.CardAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateCard>;
          };
          groupBy: {
            args: Prisma.CardGroupByArgs<ExtArgs>;
            result: $Utils.Optional<CardGroupByOutputType>[];
          };
          count: {
            args: Prisma.CardCountArgs<ExtArgs>;
            result: $Utils.Optional<CardCountAggregateOutputType> | number;
          };
        };
      };
      Apartment: {
        payload: Prisma.$ApartmentPayload<ExtArgs>;
        fields: Prisma.ApartmentFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.ApartmentFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.ApartmentFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>;
          };
          findFirst: {
            args: Prisma.ApartmentFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.ApartmentFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>;
          };
          findMany: {
            args: Prisma.ApartmentFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>[];
          };
          create: {
            args: Prisma.ApartmentCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>;
          };
          createMany: {
            args: Prisma.ApartmentCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.ApartmentCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>[];
          };
          delete: {
            args: Prisma.ApartmentDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>;
          };
          update: {
            args: Prisma.ApartmentUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>;
          };
          deleteMany: {
            args: Prisma.ApartmentDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.ApartmentUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.ApartmentUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentPayload>;
          };
          aggregate: {
            args: Prisma.ApartmentAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateApartment>;
          };
          groupBy: {
            args: Prisma.ApartmentGroupByArgs<ExtArgs>;
            result: $Utils.Optional<ApartmentGroupByOutputType>[];
          };
          count: {
            args: Prisma.ApartmentCountArgs<ExtArgs>;
            result: $Utils.Optional<ApartmentCountAggregateOutputType> | number;
          };
        };
      };
      ApartmentList: {
        payload: Prisma.$ApartmentListPayload<ExtArgs>;
        fields: Prisma.ApartmentListFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.ApartmentListFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentListPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.ApartmentListFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentListPayload>;
          };
          findFirst: {
            args: Prisma.ApartmentListFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentListPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.ApartmentListFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentListPayload>;
          };
          findMany: {
            args: Prisma.ApartmentListFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentListPayload>[];
          };
          create: {
            args: Prisma.ApartmentListCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentListPayload>;
          };
          createMany: {
            args: Prisma.ApartmentListCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.ApartmentListCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentListPayload>[];
          };
          delete: {
            args: Prisma.ApartmentListDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentListPayload>;
          };
          update: {
            args: Prisma.ApartmentListUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentListPayload>;
          };
          deleteMany: {
            args: Prisma.ApartmentListDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.ApartmentListUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.ApartmentListUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApartmentListPayload>;
          };
          aggregate: {
            args: Prisma.ApartmentListAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateApartmentList>;
          };
          groupBy: {
            args: Prisma.ApartmentListGroupByArgs<ExtArgs>;
            result: $Utils.Optional<ApartmentListGroupByOutputType>[];
          };
          count: {
            args: Prisma.ApartmentListCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<ApartmentListCountAggregateOutputType>
              | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<
    "define",
    Prisma.TypeMapCb,
    $Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = "pretty" | "colorless" | "minimal";
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
  }

  /* Types for Logging */
  export type LogLevel = "info" | "query" | "warn" | "error";
  export type LogDefinition = {
    level: LogLevel;
    emit: "stdout" | "event";
  };

  export type GetLogType<T extends LogLevel | LogDefinition> =
    T extends LogDefinition
      ? T["emit"] extends "event"
        ? T["level"]
        : never
      : never;
  export type GetEvents<T extends any> =
    T extends Array<LogLevel | LogDefinition>
      ?
          | GetLogType<T[0]>
          | GetLogType<T[1]>
          | GetLogType<T[2]>
          | GetLogType<T[3]>
      : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | "findUnique"
    | "findUniqueOrThrow"
    | "findMany"
    | "findFirst"
    | "findFirstOrThrow"
    | "create"
    | "createMany"
    | "createManyAndReturn"
    | "update"
    | "updateMany"
    | "upsert"
    | "delete"
    | "deleteMany"
    | "executeRaw"
    | "queryRaw"
    | "aggregate"
    | "count"
    | "runCommandRaw"
    | "findRaw"
    | "groupBy";

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName;
    action: PrismaAction;
    args: any;
    dataPath: string[];
    runInTransaction: boolean;
  };

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>;

  // tested in getLogLevel.test.ts
  export function getLogLevel(
    log: Array<LogLevel | LogDefinition>,
  ): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<
    Prisma.DefaultPrismaClient,
    runtime.ITXClientDenyList
  >;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    cards: number;
  };

  export type UserCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    cards?: boolean | UserCountOutputTypeCountCardsArgs;
  };

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCardsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: CardWhereInput;
  };

  /**
   * Count Type ApartmentListCountOutputType
   */

  export type ApartmentListCountOutputType = {
    apartments: number;
  };

  export type ApartmentListCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    apartments?: boolean | ApartmentListCountOutputTypeCountApartmentsArgs;
  };

  // Custom InputTypes
  /**
   * ApartmentListCountOutputType without action
   */
  export type ApartmentListCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ApartmentListCountOutputType
     */
    select?: ApartmentListCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * ApartmentListCountOutputType without action
   */
  export type ApartmentListCountOutputTypeCountApartmentsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: ApartmentWhereInput;
  };

  /**
   * Models
   */

  /**
   * Model Pokemon
   */

  export type AggregatePokemon = {
    _count: PokemonCountAggregateOutputType | null;
    _avg: PokemonAvgAggregateOutputType | null;
    _sum: PokemonSumAggregateOutputType | null;
    _min: PokemonMinAggregateOutputType | null;
    _max: PokemonMaxAggregateOutputType | null;
  };

  export type PokemonAvgAggregateOutputType = {
    id: number | null;
    base_experience: number | null;
    height: number | null;
    weight: number | null;
    order: number | null;
    hp: number | null;
    attack: number | null;
    defense: number | null;
    special_attack: number | null;
    special_defense: number | null;
    speed: number | null;
  };

  export type PokemonSumAggregateOutputType = {
    id: number | null;
    base_experience: number | null;
    height: number | null;
    weight: number | null;
    order: number | null;
    hp: number | null;
    attack: number | null;
    defense: number | null;
    special_attack: number | null;
    special_defense: number | null;
    speed: number | null;
  };

  export type PokemonMinAggregateOutputType = {
    id: number | null;
    name: string | null;
    name_clean: string | null;
    img: string | null;
    base_experience: number | null;
    height: number | null;
    weight: number | null;
    is_default: boolean | null;
    order: number | null;
    hp: number | null;
    attack: number | null;
    defense: number | null;
    special_attack: number | null;
    special_defense: number | null;
    speed: number | null;
  };

  export type PokemonMaxAggregateOutputType = {
    id: number | null;
    name: string | null;
    name_clean: string | null;
    img: string | null;
    base_experience: number | null;
    height: number | null;
    weight: number | null;
    is_default: boolean | null;
    order: number | null;
    hp: number | null;
    attack: number | null;
    defense: number | null;
    special_attack: number | null;
    special_defense: number | null;
    speed: number | null;
  };

  export type PokemonCountAggregateOutputType = {
    id: number;
    name: number;
    name_clean: number;
    abilities: number;
    types: number;
    img: number;
    base_experience: number;
    height: number;
    weight: number;
    is_default: number;
    order: number;
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
    _all: number;
  };

  export type PokemonAvgAggregateInputType = {
    id?: true;
    base_experience?: true;
    height?: true;
    weight?: true;
    order?: true;
    hp?: true;
    attack?: true;
    defense?: true;
    special_attack?: true;
    special_defense?: true;
    speed?: true;
  };

  export type PokemonSumAggregateInputType = {
    id?: true;
    base_experience?: true;
    height?: true;
    weight?: true;
    order?: true;
    hp?: true;
    attack?: true;
    defense?: true;
    special_attack?: true;
    special_defense?: true;
    speed?: true;
  };

  export type PokemonMinAggregateInputType = {
    id?: true;
    name?: true;
    name_clean?: true;
    img?: true;
    base_experience?: true;
    height?: true;
    weight?: true;
    is_default?: true;
    order?: true;
    hp?: true;
    attack?: true;
    defense?: true;
    special_attack?: true;
    special_defense?: true;
    speed?: true;
  };

  export type PokemonMaxAggregateInputType = {
    id?: true;
    name?: true;
    name_clean?: true;
    img?: true;
    base_experience?: true;
    height?: true;
    weight?: true;
    is_default?: true;
    order?: true;
    hp?: true;
    attack?: true;
    defense?: true;
    special_attack?: true;
    special_defense?: true;
    speed?: true;
  };

  export type PokemonCountAggregateInputType = {
    id?: true;
    name?: true;
    name_clean?: true;
    abilities?: true;
    types?: true;
    img?: true;
    base_experience?: true;
    height?: true;
    weight?: true;
    is_default?: true;
    order?: true;
    hp?: true;
    attack?: true;
    defense?: true;
    special_attack?: true;
    special_defense?: true;
    speed?: true;
    _all?: true;
  };

  export type PokemonAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Pokemon to aggregate.
     */
    where?: PokemonWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Pokemon to fetch.
     */
    orderBy?:
      | PokemonOrderByWithRelationInput
      | PokemonOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: PokemonWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Pokemon from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Pokemon.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Pokemon
     **/
    _count?: true | PokemonCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: PokemonAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: PokemonSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: PokemonMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: PokemonMaxAggregateInputType;
  };

  export type GetPokemonAggregateType<T extends PokemonAggregateArgs> = {
    [P in keyof T & keyof AggregatePokemon]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePokemon[P]>
      : GetScalarType<T[P], AggregatePokemon[P]>;
  };

  export type PokemonGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: PokemonWhereInput;
    orderBy?:
      | PokemonOrderByWithAggregationInput
      | PokemonOrderByWithAggregationInput[];
    by: PokemonScalarFieldEnum[] | PokemonScalarFieldEnum;
    having?: PokemonScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PokemonCountAggregateInputType | true;
    _avg?: PokemonAvgAggregateInputType;
    _sum?: PokemonSumAggregateInputType;
    _min?: PokemonMinAggregateInputType;
    _max?: PokemonMaxAggregateInputType;
  };

  export type PokemonGroupByOutputType = {
    id: number;
    name: string;
    name_clean: string;
    abilities: string[];
    types: string[];
    img: string | null;
    base_experience: number;
    height: number;
    weight: number;
    is_default: boolean;
    order: number;
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
    _count: PokemonCountAggregateOutputType | null;
    _avg: PokemonAvgAggregateOutputType | null;
    _sum: PokemonSumAggregateOutputType | null;
    _min: PokemonMinAggregateOutputType | null;
    _max: PokemonMaxAggregateOutputType | null;
  };

  type GetPokemonGroupByPayload<T extends PokemonGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<PokemonGroupByOutputType, T["by"]> & {
          [P in keyof T & keyof PokemonGroupByOutputType]: P extends "_count"
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PokemonGroupByOutputType[P]>
            : GetScalarType<T[P], PokemonGroupByOutputType[P]>;
        }
      >
    >;

  export type PokemonSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      name_clean?: boolean;
      abilities?: boolean;
      types?: boolean;
      img?: boolean;
      base_experience?: boolean;
      height?: boolean;
      weight?: boolean;
      is_default?: boolean;
      order?: boolean;
      hp?: boolean;
      attack?: boolean;
      defense?: boolean;
      special_attack?: boolean;
      special_defense?: boolean;
      speed?: boolean;
    },
    ExtArgs["result"]["pokemon"]
  >;

  export type PokemonSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      name_clean?: boolean;
      abilities?: boolean;
      types?: boolean;
      img?: boolean;
      base_experience?: boolean;
      height?: boolean;
      weight?: boolean;
      is_default?: boolean;
      order?: boolean;
      hp?: boolean;
      attack?: boolean;
      defense?: boolean;
      special_attack?: boolean;
      special_defense?: boolean;
      speed?: boolean;
    },
    ExtArgs["result"]["pokemon"]
  >;

  export type PokemonSelectScalar = {
    id?: boolean;
    name?: boolean;
    name_clean?: boolean;
    abilities?: boolean;
    types?: boolean;
    img?: boolean;
    base_experience?: boolean;
    height?: boolean;
    weight?: boolean;
    is_default?: boolean;
    order?: boolean;
    hp?: boolean;
    attack?: boolean;
    defense?: boolean;
    special_attack?: boolean;
    special_defense?: boolean;
    speed?: boolean;
  };

  export type $PokemonPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: "Pokemon";
    objects: {};
    scalars: $Extensions.GetPayloadResult<
      {
        id: number;
        name: string;
        name_clean: string;
        abilities: string[];
        types: string[];
        img: string | null;
        base_experience: number;
        height: number;
        weight: number;
        is_default: boolean;
        order: number;
        hp: number;
        attack: number;
        defense: number;
        special_attack: number;
        special_defense: number;
        speed: number;
      },
      ExtArgs["result"]["pokemon"]
    >;
    composites: {};
  };

  type PokemonGetPayload<
    S extends boolean | null | undefined | PokemonDefaultArgs,
  > = $Result.GetResult<Prisma.$PokemonPayload, S>;

  type PokemonCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<PokemonFindManyArgs, "select" | "include" | "distinct"> & {
    select?: PokemonCountAggregateInputType | true;
  };

  export interface PokemonDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["Pokemon"];
      meta: { name: "Pokemon" };
    };
    /**
     * Find zero or one Pokemon that matches the filter.
     * @param {PokemonFindUniqueArgs} args - Arguments to find a Pokemon
     * @example
     * // Get one Pokemon
     * const pokemon = await prisma.pokemon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PokemonFindUniqueArgs>(
      args: SelectSubset<T, PokemonFindUniqueArgs<ExtArgs>>,
    ): Prisma__PokemonClient<
      $Result.GetResult<
        Prisma.$PokemonPayload<ExtArgs>,
        T,
        "findUnique"
      > | null,
      null,
      ExtArgs
    >;

    /**
     * Find one Pokemon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PokemonFindUniqueOrThrowArgs} args - Arguments to find a Pokemon
     * @example
     * // Get one Pokemon
     * const pokemon = await prisma.pokemon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PokemonFindUniqueOrThrowArgs>(
      args: SelectSubset<T, PokemonFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__PokemonClient<
      $Result.GetResult<
        Prisma.$PokemonPayload<ExtArgs>,
        T,
        "findUniqueOrThrow"
      >,
      never,
      ExtArgs
    >;

    /**
     * Find the first Pokemon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PokemonFindFirstArgs} args - Arguments to find a Pokemon
     * @example
     * // Get one Pokemon
     * const pokemon = await prisma.pokemon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PokemonFindFirstArgs>(
      args?: SelectSubset<T, PokemonFindFirstArgs<ExtArgs>>,
    ): Prisma__PokemonClient<
      $Result.GetResult<Prisma.$PokemonPayload<ExtArgs>, T, "findFirst"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first Pokemon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PokemonFindFirstOrThrowArgs} args - Arguments to find a Pokemon
     * @example
     * // Get one Pokemon
     * const pokemon = await prisma.pokemon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PokemonFindFirstOrThrowArgs>(
      args?: SelectSubset<T, PokemonFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__PokemonClient<
      $Result.GetResult<Prisma.$PokemonPayload<ExtArgs>, T, "findFirstOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Pokemon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PokemonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Pokemon
     * const pokemon = await prisma.pokemon.findMany()
     *
     * // Get first 10 Pokemon
     * const pokemon = await prisma.pokemon.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const pokemonWithIdOnly = await prisma.pokemon.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PokemonFindManyArgs>(
      args?: SelectSubset<T, PokemonFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$PokemonPayload<ExtArgs>, T, "findMany">
    >;

    /**
     * Create a Pokemon.
     * @param {PokemonCreateArgs} args - Arguments to create a Pokemon.
     * @example
     * // Create one Pokemon
     * const Pokemon = await prisma.pokemon.create({
     *   data: {
     *     // ... data to create a Pokemon
     *   }
     * })
     *
     */
    create<T extends PokemonCreateArgs>(
      args: SelectSubset<T, PokemonCreateArgs<ExtArgs>>,
    ): Prisma__PokemonClient<
      $Result.GetResult<Prisma.$PokemonPayload<ExtArgs>, T, "create">,
      never,
      ExtArgs
    >;

    /**
     * Create many Pokemon.
     * @param {PokemonCreateManyArgs} args - Arguments to create many Pokemon.
     * @example
     * // Create many Pokemon
     * const pokemon = await prisma.pokemon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PokemonCreateManyArgs>(
      args?: SelectSubset<T, PokemonCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Pokemon and returns the data saved in the database.
     * @param {PokemonCreateManyAndReturnArgs} args - Arguments to create many Pokemon.
     * @example
     * // Create many Pokemon
     * const pokemon = await prisma.pokemon.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Pokemon and only return the `id`
     * const pokemonWithIdOnly = await prisma.pokemon.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PokemonCreateManyAndReturnArgs>(
      args?: SelectSubset<T, PokemonCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$PokemonPayload<ExtArgs>,
        T,
        "createManyAndReturn"
      >
    >;

    /**
     * Delete a Pokemon.
     * @param {PokemonDeleteArgs} args - Arguments to delete one Pokemon.
     * @example
     * // Delete one Pokemon
     * const Pokemon = await prisma.pokemon.delete({
     *   where: {
     *     // ... filter to delete one Pokemon
     *   }
     * })
     *
     */
    delete<T extends PokemonDeleteArgs>(
      args: SelectSubset<T, PokemonDeleteArgs<ExtArgs>>,
    ): Prisma__PokemonClient<
      $Result.GetResult<Prisma.$PokemonPayload<ExtArgs>, T, "delete">,
      never,
      ExtArgs
    >;

    /**
     * Update one Pokemon.
     * @param {PokemonUpdateArgs} args - Arguments to update one Pokemon.
     * @example
     * // Update one Pokemon
     * const pokemon = await prisma.pokemon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PokemonUpdateArgs>(
      args: SelectSubset<T, PokemonUpdateArgs<ExtArgs>>,
    ): Prisma__PokemonClient<
      $Result.GetResult<Prisma.$PokemonPayload<ExtArgs>, T, "update">,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Pokemon.
     * @param {PokemonDeleteManyArgs} args - Arguments to filter Pokemon to delete.
     * @example
     * // Delete a few Pokemon
     * const { count } = await prisma.pokemon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PokemonDeleteManyArgs>(
      args?: SelectSubset<T, PokemonDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Pokemon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PokemonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Pokemon
     * const pokemon = await prisma.pokemon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PokemonUpdateManyArgs>(
      args: SelectSubset<T, PokemonUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one Pokemon.
     * @param {PokemonUpsertArgs} args - Arguments to update or create a Pokemon.
     * @example
     * // Update or create a Pokemon
     * const pokemon = await prisma.pokemon.upsert({
     *   create: {
     *     // ... data to create a Pokemon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Pokemon we want to update
     *   }
     * })
     */
    upsert<T extends PokemonUpsertArgs>(
      args: SelectSubset<T, PokemonUpsertArgs<ExtArgs>>,
    ): Prisma__PokemonClient<
      $Result.GetResult<Prisma.$PokemonPayload<ExtArgs>, T, "upsert">,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Pokemon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PokemonCountArgs} args - Arguments to filter Pokemon to count.
     * @example
     * // Count the number of Pokemon
     * const count = await prisma.pokemon.count({
     *   where: {
     *     // ... the filter for the Pokemon we want to count
     *   }
     * })
     **/
    count<T extends PokemonCountArgs>(
      args?: Subset<T, PokemonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], PokemonCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Pokemon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PokemonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends PokemonAggregateArgs>(
      args: Subset<T, PokemonAggregateArgs>,
    ): Prisma.PrismaPromise<GetPokemonAggregateType<T>>;

    /**
     * Group by Pokemon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PokemonGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends PokemonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PokemonGroupByArgs["orderBy"] }
        : { orderBy?: PokemonGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, PokemonGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors
      ? GetPokemonGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Pokemon model
     */
    readonly fields: PokemonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Pokemon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PokemonClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Pokemon model
   */
  interface PokemonFieldRefs {
    readonly id: FieldRef<"Pokemon", "Int">;
    readonly name: FieldRef<"Pokemon", "String">;
    readonly name_clean: FieldRef<"Pokemon", "String">;
    readonly abilities: FieldRef<"Pokemon", "String[]">;
    readonly types: FieldRef<"Pokemon", "String[]">;
    readonly img: FieldRef<"Pokemon", "String">;
    readonly base_experience: FieldRef<"Pokemon", "Int">;
    readonly height: FieldRef<"Pokemon", "Int">;
    readonly weight: FieldRef<"Pokemon", "Int">;
    readonly is_default: FieldRef<"Pokemon", "Boolean">;
    readonly order: FieldRef<"Pokemon", "Int">;
    readonly hp: FieldRef<"Pokemon", "Int">;
    readonly attack: FieldRef<"Pokemon", "Int">;
    readonly defense: FieldRef<"Pokemon", "Int">;
    readonly special_attack: FieldRef<"Pokemon", "Int">;
    readonly special_defense: FieldRef<"Pokemon", "Int">;
    readonly speed: FieldRef<"Pokemon", "Int">;
  }

  // Custom InputTypes
  /**
   * Pokemon findUnique
   */
  export type PokemonFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pokemon
     */
    select?: PokemonSelect<ExtArgs> | null;
    /**
     * Filter, which Pokemon to fetch.
     */
    where: PokemonWhereUniqueInput;
  };

  /**
   * Pokemon findUniqueOrThrow
   */
  export type PokemonFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pokemon
     */
    select?: PokemonSelect<ExtArgs> | null;
    /**
     * Filter, which Pokemon to fetch.
     */
    where: PokemonWhereUniqueInput;
  };

  /**
   * Pokemon findFirst
   */
  export type PokemonFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pokemon
     */
    select?: PokemonSelect<ExtArgs> | null;
    /**
     * Filter, which Pokemon to fetch.
     */
    where?: PokemonWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Pokemon to fetch.
     */
    orderBy?:
      | PokemonOrderByWithRelationInput
      | PokemonOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Pokemon.
     */
    cursor?: PokemonWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Pokemon from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Pokemon.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Pokemon.
     */
    distinct?: PokemonScalarFieldEnum | PokemonScalarFieldEnum[];
  };

  /**
   * Pokemon findFirstOrThrow
   */
  export type PokemonFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pokemon
     */
    select?: PokemonSelect<ExtArgs> | null;
    /**
     * Filter, which Pokemon to fetch.
     */
    where?: PokemonWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Pokemon to fetch.
     */
    orderBy?:
      | PokemonOrderByWithRelationInput
      | PokemonOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Pokemon.
     */
    cursor?: PokemonWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Pokemon from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Pokemon.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Pokemon.
     */
    distinct?: PokemonScalarFieldEnum | PokemonScalarFieldEnum[];
  };

  /**
   * Pokemon findMany
   */
  export type PokemonFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pokemon
     */
    select?: PokemonSelect<ExtArgs> | null;
    /**
     * Filter, which Pokemon to fetch.
     */
    where?: PokemonWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Pokemon to fetch.
     */
    orderBy?:
      | PokemonOrderByWithRelationInput
      | PokemonOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Pokemon.
     */
    cursor?: PokemonWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Pokemon from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Pokemon.
     */
    skip?: number;
    distinct?: PokemonScalarFieldEnum | PokemonScalarFieldEnum[];
  };

  /**
   * Pokemon create
   */
  export type PokemonCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pokemon
     */
    select?: PokemonSelect<ExtArgs> | null;
    /**
     * The data needed to create a Pokemon.
     */
    data: XOR<PokemonCreateInput, PokemonUncheckedCreateInput>;
  };

  /**
   * Pokemon createMany
   */
  export type PokemonCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Pokemon.
     */
    data: PokemonCreateManyInput | PokemonCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Pokemon createManyAndReturn
   */
  export type PokemonCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pokemon
     */
    select?: PokemonSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Pokemon.
     */
    data: PokemonCreateManyInput | PokemonCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Pokemon update
   */
  export type PokemonUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pokemon
     */
    select?: PokemonSelect<ExtArgs> | null;
    /**
     * The data needed to update a Pokemon.
     */
    data: XOR<PokemonUpdateInput, PokemonUncheckedUpdateInput>;
    /**
     * Choose, which Pokemon to update.
     */
    where: PokemonWhereUniqueInput;
  };

  /**
   * Pokemon updateMany
   */
  export type PokemonUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Pokemon.
     */
    data: XOR<PokemonUpdateManyMutationInput, PokemonUncheckedUpdateManyInput>;
    /**
     * Filter which Pokemon to update
     */
    where?: PokemonWhereInput;
  };

  /**
   * Pokemon upsert
   */
  export type PokemonUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pokemon
     */
    select?: PokemonSelect<ExtArgs> | null;
    /**
     * The filter to search for the Pokemon to update in case it exists.
     */
    where: PokemonWhereUniqueInput;
    /**
     * In case the Pokemon found by the `where` argument doesn't exist, create a new Pokemon with this data.
     */
    create: XOR<PokemonCreateInput, PokemonUncheckedCreateInput>;
    /**
     * In case the Pokemon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PokemonUpdateInput, PokemonUncheckedUpdateInput>;
  };

  /**
   * Pokemon delete
   */
  export type PokemonDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pokemon
     */
    select?: PokemonSelect<ExtArgs> | null;
    /**
     * Filter which Pokemon to delete.
     */
    where: PokemonWhereUniqueInput;
  };

  /**
   * Pokemon deleteMany
   */
  export type PokemonDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Pokemon to delete
     */
    where?: PokemonWhereInput;
  };

  /**
   * Pokemon without action
   */
  export type PokemonDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pokemon
     */
    select?: PokemonSelect<ExtArgs> | null;
  };

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  export type UserMinAggregateOutputType = {
    id: string | null;
    email: string | null;
    name: string | null;
  };

  export type UserMaxAggregateOutputType = {
    id: string | null;
    email: string | null;
    name: string | null;
  };

  export type UserCountAggregateOutputType = {
    id: number;
    email: number;
    name: number;
    _all: number;
  };

  export type UserMinAggregateInputType = {
    id?: true;
    email?: true;
    name?: true;
  };

  export type UserMaxAggregateInputType = {
    id?: true;
    email?: true;
    name?: true;
  };

  export type UserCountAggregateInputType = {
    id?: true;
    email?: true;
    name?: true;
    _all?: true;
  };

  export type UserAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Users
     **/
    _count?: true | UserCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: UserMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: UserMaxAggregateInputType;
  };

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>;
  };

  export type UserGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: UserWhereInput;
    orderBy?:
      | UserOrderByWithAggregationInput
      | UserOrderByWithAggregationInput[];
    by: UserScalarFieldEnum[] | UserScalarFieldEnum;
    having?: UserScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserCountAggregateInputType | true;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
  };

  export type UserGroupByOutputType = {
    id: string;
    email: string;
    name: string | null;
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof UserGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], UserGroupByOutputType[P]>
          : GetScalarType<T[P], UserGroupByOutputType[P]>;
      }
    >
  >;

  export type UserSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      email?: boolean;
      name?: boolean;
      cards?: boolean | User$cardsArgs<ExtArgs>;
      _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["user"]
  >;

  export type UserSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      email?: boolean;
      name?: boolean;
    },
    ExtArgs["result"]["user"]
  >;

  export type UserSelectScalar = {
    id?: boolean;
    email?: boolean;
    name?: boolean;
  };

  export type UserInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    cards?: boolean | User$cardsArgs<ExtArgs>;
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type UserIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $UserPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: "User";
    objects: {
      cards: Prisma.$CardPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        email: string;
        name: string | null;
      },
      ExtArgs["result"]["user"]
    >;
    composites: {};
  };

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> =
    $Result.GetResult<Prisma.$UserPayload, S>;

  type UserCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<UserFindManyArgs, "select" | "include" | "distinct"> & {
    select?: UserCountAggregateInputType | true;
  };

  export interface UserDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["User"];
      meta: { name: "User" };
    };
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(
      args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(
      args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(
      args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     *
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserFindManyArgs>(
      args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">
    >;

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     *
     */
    create<T extends UserCreateArgs>(
      args: SelectSubset<T, UserCreateArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">,
      never,
      ExtArgs
    >;

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserCreateManyArgs>(
      args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(
      args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">
    >;

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     *
     */
    delete<T extends UserDeleteArgs>(
      args: SelectSubset<T, UserDeleteArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">,
      never,
      ExtArgs
    >;

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserUpdateArgs>(
      args: SelectSubset<T, UserUpdateArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserDeleteManyArgs>(
      args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserUpdateManyArgs>(
      args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(
      args: SelectSubset<T, UserUpsertArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
     **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], UserCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends UserAggregateArgs>(
      args: Subset<T, UserAggregateArgs>,
    ): Prisma.PrismaPromise<GetUserAggregateType<T>>;

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs["orderBy"] }
        : { orderBy?: UserGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors
      ? GetUserGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the User model
     */
    readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    cards<T extends User$cardsArgs<ExtArgs> = {}>(
      args?: Subset<T, User$cardsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findMany"> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", "String">;
    readonly email: FieldRef<"User", "String">;
    readonly name: FieldRef<"User", "String">;
  }

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findMany
   */
  export type UserFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User create
   */
  export type UserCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>;
  };

  /**
   * User createMany
   */
  export type UserCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User update
   */
  export type UserUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
  };

  /**
   * User upsert
   */
  export type UserUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput;
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>;
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
  };

  /**
   * User delete
   */
  export type UserDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput;
  };

  /**
   * User.cards
   */
  export type User$cardsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null;
    where?: CardWhereInput;
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[];
    cursor?: CardWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[];
  };

  /**
   * User without action
   */
  export type UserDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
  };

  /**
   * Model Card
   */

  export type AggregateCard = {
    _count: CardCountAggregateOutputType | null;
    _min: CardMinAggregateOutputType | null;
    _max: CardMaxAggregateOutputType | null;
  };

  export type CardMinAggregateOutputType = {
    id: string | null;
    word: string | null;
    translation: string | null;
    remembered: boolean | null;
    createdAt: Date | null;
    userId: string | null;
  };

  export type CardMaxAggregateOutputType = {
    id: string | null;
    word: string | null;
    translation: string | null;
    remembered: boolean | null;
    createdAt: Date | null;
    userId: string | null;
  };

  export type CardCountAggregateOutputType = {
    id: number;
    word: number;
    translation: number;
    remembered: number;
    createdAt: number;
    userId: number;
    _all: number;
  };

  export type CardMinAggregateInputType = {
    id?: true;
    word?: true;
    translation?: true;
    remembered?: true;
    createdAt?: true;
    userId?: true;
  };

  export type CardMaxAggregateInputType = {
    id?: true;
    word?: true;
    translation?: true;
    remembered?: true;
    createdAt?: true;
    userId?: true;
  };

  export type CardCountAggregateInputType = {
    id?: true;
    word?: true;
    translation?: true;
    remembered?: true;
    createdAt?: true;
    userId?: true;
    _all?: true;
  };

  export type CardAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Card to aggregate.
     */
    where?: CardWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: CardWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Cards.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Cards
     **/
    _count?: true | CardCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: CardMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: CardMaxAggregateInputType;
  };

  export type GetCardAggregateType<T extends CardAggregateArgs> = {
    [P in keyof T & keyof AggregateCard]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCard[P]>
      : GetScalarType<T[P], AggregateCard[P]>;
  };

  export type CardGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: CardWhereInput;
    orderBy?:
      | CardOrderByWithAggregationInput
      | CardOrderByWithAggregationInput[];
    by: CardScalarFieldEnum[] | CardScalarFieldEnum;
    having?: CardScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CardCountAggregateInputType | true;
    _min?: CardMinAggregateInputType;
    _max?: CardMaxAggregateInputType;
  };

  export type CardGroupByOutputType = {
    id: string;
    word: string;
    translation: string;
    remembered: boolean;
    createdAt: Date;
    userId: string;
    _count: CardCountAggregateOutputType | null;
    _min: CardMinAggregateOutputType | null;
    _max: CardMaxAggregateOutputType | null;
  };

  type GetCardGroupByPayload<T extends CardGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CardGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof CardGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], CardGroupByOutputType[P]>
          : GetScalarType<T[P], CardGroupByOutputType[P]>;
      }
    >
  >;

  export type CardSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      word?: boolean;
      translation?: boolean;
      remembered?: boolean;
      createdAt?: boolean;
      userId?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["card"]
  >;

  export type CardSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      word?: boolean;
      translation?: boolean;
      remembered?: boolean;
      createdAt?: boolean;
      userId?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["card"]
  >;

  export type CardSelectScalar = {
    id?: boolean;
    word?: boolean;
    translation?: boolean;
    remembered?: boolean;
    createdAt?: boolean;
    userId?: boolean;
  };

  export type CardInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type CardIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $CardPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: "Card";
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        word: string;
        translation: string;
        remembered: boolean;
        createdAt: Date;
        userId: string;
      },
      ExtArgs["result"]["card"]
    >;
    composites: {};
  };

  type CardGetPayload<S extends boolean | null | undefined | CardDefaultArgs> =
    $Result.GetResult<Prisma.$CardPayload, S>;

  type CardCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<CardFindManyArgs, "select" | "include" | "distinct"> & {
    select?: CardCountAggregateInputType | true;
  };

  export interface CardDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["Card"];
      meta: { name: "Card" };
    };
    /**
     * Find zero or one Card that matches the filter.
     * @param {CardFindUniqueArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CardFindUniqueArgs>(
      args: SelectSubset<T, CardFindUniqueArgs<ExtArgs>>,
    ): Prisma__CardClient<
      $Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUnique"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one Card that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CardFindUniqueOrThrowArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CardFindUniqueOrThrowArgs>(
      args: SelectSubset<T, CardFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__CardClient<
      $Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUniqueOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find the first Card that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardFindFirstArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CardFindFirstArgs>(
      args?: SelectSubset<T, CardFindFirstArgs<ExtArgs>>,
    ): Prisma__CardClient<
      $Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findFirst"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first Card that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardFindFirstOrThrowArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CardFindFirstOrThrowArgs>(
      args?: SelectSubset<T, CardFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__CardClient<
      $Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findFirstOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Cards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cards
     * const cards = await prisma.card.findMany()
     *
     * // Get first 10 Cards
     * const cards = await prisma.card.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const cardWithIdOnly = await prisma.card.findMany({ select: { id: true } })
     *
     */
    findMany<T extends CardFindManyArgs>(
      args?: SelectSubset<T, CardFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findMany">
    >;

    /**
     * Create a Card.
     * @param {CardCreateArgs} args - Arguments to create a Card.
     * @example
     * // Create one Card
     * const Card = await prisma.card.create({
     *   data: {
     *     // ... data to create a Card
     *   }
     * })
     *
     */
    create<T extends CardCreateArgs>(
      args: SelectSubset<T, CardCreateArgs<ExtArgs>>,
    ): Prisma__CardClient<
      $Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "create">,
      never,
      ExtArgs
    >;

    /**
     * Create many Cards.
     * @param {CardCreateManyArgs} args - Arguments to create many Cards.
     * @example
     * // Create many Cards
     * const card = await prisma.card.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends CardCreateManyArgs>(
      args?: SelectSubset<T, CardCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Cards and returns the data saved in the database.
     * @param {CardCreateManyAndReturnArgs} args - Arguments to create many Cards.
     * @example
     * // Create many Cards
     * const card = await prisma.card.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Cards and only return the `id`
     * const cardWithIdOnly = await prisma.card.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends CardCreateManyAndReturnArgs>(
      args?: SelectSubset<T, CardCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "createManyAndReturn">
    >;

    /**
     * Delete a Card.
     * @param {CardDeleteArgs} args - Arguments to delete one Card.
     * @example
     * // Delete one Card
     * const Card = await prisma.card.delete({
     *   where: {
     *     // ... filter to delete one Card
     *   }
     * })
     *
     */
    delete<T extends CardDeleteArgs>(
      args: SelectSubset<T, CardDeleteArgs<ExtArgs>>,
    ): Prisma__CardClient<
      $Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "delete">,
      never,
      ExtArgs
    >;

    /**
     * Update one Card.
     * @param {CardUpdateArgs} args - Arguments to update one Card.
     * @example
     * // Update one Card
     * const card = await prisma.card.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends CardUpdateArgs>(
      args: SelectSubset<T, CardUpdateArgs<ExtArgs>>,
    ): Prisma__CardClient<
      $Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "update">,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Cards.
     * @param {CardDeleteManyArgs} args - Arguments to filter Cards to delete.
     * @example
     * // Delete a few Cards
     * const { count } = await prisma.card.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends CardDeleteManyArgs>(
      args?: SelectSubset<T, CardDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Cards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cards
     * const card = await prisma.card.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends CardUpdateManyArgs>(
      args: SelectSubset<T, CardUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one Card.
     * @param {CardUpsertArgs} args - Arguments to update or create a Card.
     * @example
     * // Update or create a Card
     * const card = await prisma.card.upsert({
     *   create: {
     *     // ... data to create a Card
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Card we want to update
     *   }
     * })
     */
    upsert<T extends CardUpsertArgs>(
      args: SelectSubset<T, CardUpsertArgs<ExtArgs>>,
    ): Prisma__CardClient<
      $Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "upsert">,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Cards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardCountArgs} args - Arguments to filter Cards to count.
     * @example
     * // Count the number of Cards
     * const count = await prisma.card.count({
     *   where: {
     *     // ... the filter for the Cards we want to count
     *   }
     * })
     **/
    count<T extends CardCountArgs>(
      args?: Subset<T, CardCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], CardCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Card.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends CardAggregateArgs>(
      args: Subset<T, CardAggregateArgs>,
    ): Prisma.PrismaPromise<GetCardAggregateType<T>>;

    /**
     * Group by Card.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends CardGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CardGroupByArgs["orderBy"] }
        : { orderBy?: CardGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, CardGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors
      ? GetCardGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Card model
     */
    readonly fields: CardFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Card.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CardClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>,
    ): Prisma__UserClient<
      | $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">
      | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Card model
   */
  interface CardFieldRefs {
    readonly id: FieldRef<"Card", "String">;
    readonly word: FieldRef<"Card", "String">;
    readonly translation: FieldRef<"Card", "String">;
    readonly remembered: FieldRef<"Card", "Boolean">;
    readonly createdAt: FieldRef<"Card", "DateTime">;
    readonly userId: FieldRef<"Card", "String">;
  }

  // Custom InputTypes
  /**
   * Card findUnique
   */
  export type CardFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null;
    /**
     * Filter, which Card to fetch.
     */
    where: CardWhereUniqueInput;
  };

  /**
   * Card findUniqueOrThrow
   */
  export type CardFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null;
    /**
     * Filter, which Card to fetch.
     */
    where: CardWhereUniqueInput;
  };

  /**
   * Card findFirst
   */
  export type CardFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null;
    /**
     * Filter, which Card to fetch.
     */
    where?: CardWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Cards.
     */
    cursor?: CardWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Cards.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Cards.
     */
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[];
  };

  /**
   * Card findFirstOrThrow
   */
  export type CardFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null;
    /**
     * Filter, which Card to fetch.
     */
    where?: CardWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Cards.
     */
    cursor?: CardWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Cards.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Cards.
     */
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[];
  };

  /**
   * Card findMany
   */
  export type CardFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null;
    /**
     * Filter, which Cards to fetch.
     */
    where?: CardWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Cards.
     */
    cursor?: CardWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Cards.
     */
    skip?: number;
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[];
  };

  /**
   * Card create
   */
  export type CardCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null;
    /**
     * The data needed to create a Card.
     */
    data: XOR<CardCreateInput, CardUncheckedCreateInput>;
  };

  /**
   * Card createMany
   */
  export type CardCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Cards.
     */
    data: CardCreateManyInput | CardCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Card createManyAndReturn
   */
  export type CardCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Cards.
     */
    data: CardCreateManyInput | CardCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Card update
   */
  export type CardUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null;
    /**
     * The data needed to update a Card.
     */
    data: XOR<CardUpdateInput, CardUncheckedUpdateInput>;
    /**
     * Choose, which Card to update.
     */
    where: CardWhereUniqueInput;
  };

  /**
   * Card updateMany
   */
  export type CardUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Cards.
     */
    data: XOR<CardUpdateManyMutationInput, CardUncheckedUpdateManyInput>;
    /**
     * Filter which Cards to update
     */
    where?: CardWhereInput;
  };

  /**
   * Card upsert
   */
  export type CardUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null;
    /**
     * The filter to search for the Card to update in case it exists.
     */
    where: CardWhereUniqueInput;
    /**
     * In case the Card found by the `where` argument doesn't exist, create a new Card with this data.
     */
    create: XOR<CardCreateInput, CardUncheckedCreateInput>;
    /**
     * In case the Card was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CardUpdateInput, CardUncheckedUpdateInput>;
  };

  /**
   * Card delete
   */
  export type CardDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null;
    /**
     * Filter which Card to delete.
     */
    where: CardWhereUniqueInput;
  };

  /**
   * Card deleteMany
   */
  export type CardDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Cards to delete
     */
    where?: CardWhereInput;
  };

  /**
   * Card without action
   */
  export type CardDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null;
  };

  /**
   * Model Apartment
   */

  export type AggregateApartment = {
    _count: ApartmentCountAggregateOutputType | null;
    _min: ApartmentMinAggregateOutputType | null;
    _max: ApartmentMaxAggregateOutputType | null;
  };

  export type ApartmentMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    startDate: Date | null;
    endDate: Date | null;
    apartmentListId: string | null;
  };

  export type ApartmentMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    startDate: Date | null;
    endDate: Date | null;
    apartmentListId: string | null;
  };

  export type ApartmentCountAggregateOutputType = {
    id: number;
    name: number;
    startDate: number;
    endDate: number;
    apartmentListId: number;
    _all: number;
  };

  export type ApartmentMinAggregateInputType = {
    id?: true;
    name?: true;
    startDate?: true;
    endDate?: true;
    apartmentListId?: true;
  };

  export type ApartmentMaxAggregateInputType = {
    id?: true;
    name?: true;
    startDate?: true;
    endDate?: true;
    apartmentListId?: true;
  };

  export type ApartmentCountAggregateInputType = {
    id?: true;
    name?: true;
    startDate?: true;
    endDate?: true;
    apartmentListId?: true;
    _all?: true;
  };

  export type ApartmentAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Apartment to aggregate.
     */
    where?: ApartmentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Apartments to fetch.
     */
    orderBy?:
      | ApartmentOrderByWithRelationInput
      | ApartmentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: ApartmentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Apartments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Apartments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Apartments
     **/
    _count?: true | ApartmentCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: ApartmentMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: ApartmentMaxAggregateInputType;
  };

  export type GetApartmentAggregateType<T extends ApartmentAggregateArgs> = {
    [P in keyof T & keyof AggregateApartment]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApartment[P]>
      : GetScalarType<T[P], AggregateApartment[P]>;
  };

  export type ApartmentGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: ApartmentWhereInput;
    orderBy?:
      | ApartmentOrderByWithAggregationInput
      | ApartmentOrderByWithAggregationInput[];
    by: ApartmentScalarFieldEnum[] | ApartmentScalarFieldEnum;
    having?: ApartmentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ApartmentCountAggregateInputType | true;
    _min?: ApartmentMinAggregateInputType;
    _max?: ApartmentMaxAggregateInputType;
  };

  export type ApartmentGroupByOutputType = {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date | null;
    apartmentListId: string;
    _count: ApartmentCountAggregateOutputType | null;
    _min: ApartmentMinAggregateOutputType | null;
    _max: ApartmentMaxAggregateOutputType | null;
  };

  type GetApartmentGroupByPayload<T extends ApartmentGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<ApartmentGroupByOutputType, T["by"]> & {
          [P in keyof T & keyof ApartmentGroupByOutputType]: P extends "_count"
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApartmentGroupByOutputType[P]>
            : GetScalarType<T[P], ApartmentGroupByOutputType[P]>;
        }
      >
    >;

  export type ApartmentSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      startDate?: boolean;
      endDate?: boolean;
      apartmentListId?: boolean;
      apartmentList?: boolean | ApartmentListDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["apartment"]
  >;

  export type ApartmentSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      startDate?: boolean;
      endDate?: boolean;
      apartmentListId?: boolean;
      apartmentList?: boolean | ApartmentListDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["apartment"]
  >;

  export type ApartmentSelectScalar = {
    id?: boolean;
    name?: boolean;
    startDate?: boolean;
    endDate?: boolean;
    apartmentListId?: boolean;
  };

  export type ApartmentInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    apartmentList?: boolean | ApartmentListDefaultArgs<ExtArgs>;
  };
  export type ApartmentIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    apartmentList?: boolean | ApartmentListDefaultArgs<ExtArgs>;
  };

  export type $ApartmentPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: "Apartment";
    objects: {
      apartmentList: Prisma.$ApartmentListPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        startDate: Date;
        endDate: Date | null;
        apartmentListId: string;
      },
      ExtArgs["result"]["apartment"]
    >;
    composites: {};
  };

  type ApartmentGetPayload<
    S extends boolean | null | undefined | ApartmentDefaultArgs,
  > = $Result.GetResult<Prisma.$ApartmentPayload, S>;

  type ApartmentCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<ApartmentFindManyArgs, "select" | "include" | "distinct"> & {
    select?: ApartmentCountAggregateInputType | true;
  };

  export interface ApartmentDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["Apartment"];
      meta: { name: "Apartment" };
    };
    /**
     * Find zero or one Apartment that matches the filter.
     * @param {ApartmentFindUniqueArgs} args - Arguments to find a Apartment
     * @example
     * // Get one Apartment
     * const apartment = await prisma.apartment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApartmentFindUniqueArgs>(
      args: SelectSubset<T, ApartmentFindUniqueArgs<ExtArgs>>,
    ): Prisma__ApartmentClient<
      $Result.GetResult<
        Prisma.$ApartmentPayload<ExtArgs>,
        T,
        "findUnique"
      > | null,
      null,
      ExtArgs
    >;

    /**
     * Find one Apartment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApartmentFindUniqueOrThrowArgs} args - Arguments to find a Apartment
     * @example
     * // Get one Apartment
     * const apartment = await prisma.apartment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApartmentFindUniqueOrThrowArgs>(
      args: SelectSubset<T, ApartmentFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__ApartmentClient<
      $Result.GetResult<
        Prisma.$ApartmentPayload<ExtArgs>,
        T,
        "findUniqueOrThrow"
      >,
      never,
      ExtArgs
    >;

    /**
     * Find the first Apartment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentFindFirstArgs} args - Arguments to find a Apartment
     * @example
     * // Get one Apartment
     * const apartment = await prisma.apartment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApartmentFindFirstArgs>(
      args?: SelectSubset<T, ApartmentFindFirstArgs<ExtArgs>>,
    ): Prisma__ApartmentClient<
      $Result.GetResult<
        Prisma.$ApartmentPayload<ExtArgs>,
        T,
        "findFirst"
      > | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first Apartment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentFindFirstOrThrowArgs} args - Arguments to find a Apartment
     * @example
     * // Get one Apartment
     * const apartment = await prisma.apartment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApartmentFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ApartmentFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__ApartmentClient<
      $Result.GetResult<
        Prisma.$ApartmentPayload<ExtArgs>,
        T,
        "findFirstOrThrow"
      >,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Apartments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Apartments
     * const apartments = await prisma.apartment.findMany()
     *
     * // Get first 10 Apartments
     * const apartments = await prisma.apartment.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const apartmentWithIdOnly = await prisma.apartment.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ApartmentFindManyArgs>(
      args?: SelectSubset<T, ApartmentFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findMany">
    >;

    /**
     * Create a Apartment.
     * @param {ApartmentCreateArgs} args - Arguments to create a Apartment.
     * @example
     * // Create one Apartment
     * const Apartment = await prisma.apartment.create({
     *   data: {
     *     // ... data to create a Apartment
     *   }
     * })
     *
     */
    create<T extends ApartmentCreateArgs>(
      args: SelectSubset<T, ApartmentCreateArgs<ExtArgs>>,
    ): Prisma__ApartmentClient<
      $Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "create">,
      never,
      ExtArgs
    >;

    /**
     * Create many Apartments.
     * @param {ApartmentCreateManyArgs} args - Arguments to create many Apartments.
     * @example
     * // Create many Apartments
     * const apartment = await prisma.apartment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ApartmentCreateManyArgs>(
      args?: SelectSubset<T, ApartmentCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Apartments and returns the data saved in the database.
     * @param {ApartmentCreateManyAndReturnArgs} args - Arguments to create many Apartments.
     * @example
     * // Create many Apartments
     * const apartment = await prisma.apartment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Apartments and only return the `id`
     * const apartmentWithIdOnly = await prisma.apartment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ApartmentCreateManyAndReturnArgs>(
      args?: SelectSubset<T, ApartmentCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$ApartmentPayload<ExtArgs>,
        T,
        "createManyAndReturn"
      >
    >;

    /**
     * Delete a Apartment.
     * @param {ApartmentDeleteArgs} args - Arguments to delete one Apartment.
     * @example
     * // Delete one Apartment
     * const Apartment = await prisma.apartment.delete({
     *   where: {
     *     // ... filter to delete one Apartment
     *   }
     * })
     *
     */
    delete<T extends ApartmentDeleteArgs>(
      args: SelectSubset<T, ApartmentDeleteArgs<ExtArgs>>,
    ): Prisma__ApartmentClient<
      $Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "delete">,
      never,
      ExtArgs
    >;

    /**
     * Update one Apartment.
     * @param {ApartmentUpdateArgs} args - Arguments to update one Apartment.
     * @example
     * // Update one Apartment
     * const apartment = await prisma.apartment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ApartmentUpdateArgs>(
      args: SelectSubset<T, ApartmentUpdateArgs<ExtArgs>>,
    ): Prisma__ApartmentClient<
      $Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "update">,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Apartments.
     * @param {ApartmentDeleteManyArgs} args - Arguments to filter Apartments to delete.
     * @example
     * // Delete a few Apartments
     * const { count } = await prisma.apartment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ApartmentDeleteManyArgs>(
      args?: SelectSubset<T, ApartmentDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Apartments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Apartments
     * const apartment = await prisma.apartment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ApartmentUpdateManyArgs>(
      args: SelectSubset<T, ApartmentUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one Apartment.
     * @param {ApartmentUpsertArgs} args - Arguments to update or create a Apartment.
     * @example
     * // Update or create a Apartment
     * const apartment = await prisma.apartment.upsert({
     *   create: {
     *     // ... data to create a Apartment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Apartment we want to update
     *   }
     * })
     */
    upsert<T extends ApartmentUpsertArgs>(
      args: SelectSubset<T, ApartmentUpsertArgs<ExtArgs>>,
    ): Prisma__ApartmentClient<
      $Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "upsert">,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Apartments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentCountArgs} args - Arguments to filter Apartments to count.
     * @example
     * // Count the number of Apartments
     * const count = await prisma.apartment.count({
     *   where: {
     *     // ... the filter for the Apartments we want to count
     *   }
     * })
     **/
    count<T extends ApartmentCountArgs>(
      args?: Subset<T, ApartmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], ApartmentCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Apartment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends ApartmentAggregateArgs>(
      args: Subset<T, ApartmentAggregateArgs>,
    ): Prisma.PrismaPromise<GetApartmentAggregateType<T>>;

    /**
     * Group by Apartment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends ApartmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApartmentGroupByArgs["orderBy"] }
        : { orderBy?: ApartmentGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, ApartmentGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetApartmentGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Apartment model
     */
    readonly fields: ApartmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Apartment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApartmentClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    apartmentList<T extends ApartmentListDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, ApartmentListDefaultArgs<ExtArgs>>,
    ): Prisma__ApartmentListClient<
      | $Result.GetResult<
          Prisma.$ApartmentListPayload<ExtArgs>,
          T,
          "findUniqueOrThrow"
        >
      | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Apartment model
   */
  interface ApartmentFieldRefs {
    readonly id: FieldRef<"Apartment", "String">;
    readonly name: FieldRef<"Apartment", "String">;
    readonly startDate: FieldRef<"Apartment", "DateTime">;
    readonly endDate: FieldRef<"Apartment", "DateTime">;
    readonly apartmentListId: FieldRef<"Apartment", "String">;
  }

  // Custom InputTypes
  /**
   * Apartment findUnique
   */
  export type ApartmentFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null;
    /**
     * Filter, which Apartment to fetch.
     */
    where: ApartmentWhereUniqueInput;
  };

  /**
   * Apartment findUniqueOrThrow
   */
  export type ApartmentFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null;
    /**
     * Filter, which Apartment to fetch.
     */
    where: ApartmentWhereUniqueInput;
  };

  /**
   * Apartment findFirst
   */
  export type ApartmentFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null;
    /**
     * Filter, which Apartment to fetch.
     */
    where?: ApartmentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Apartments to fetch.
     */
    orderBy?:
      | ApartmentOrderByWithRelationInput
      | ApartmentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Apartments.
     */
    cursor?: ApartmentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Apartments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Apartments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Apartments.
     */
    distinct?: ApartmentScalarFieldEnum | ApartmentScalarFieldEnum[];
  };

  /**
   * Apartment findFirstOrThrow
   */
  export type ApartmentFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null;
    /**
     * Filter, which Apartment to fetch.
     */
    where?: ApartmentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Apartments to fetch.
     */
    orderBy?:
      | ApartmentOrderByWithRelationInput
      | ApartmentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Apartments.
     */
    cursor?: ApartmentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Apartments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Apartments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Apartments.
     */
    distinct?: ApartmentScalarFieldEnum | ApartmentScalarFieldEnum[];
  };

  /**
   * Apartment findMany
   */
  export type ApartmentFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null;
    /**
     * Filter, which Apartments to fetch.
     */
    where?: ApartmentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Apartments to fetch.
     */
    orderBy?:
      | ApartmentOrderByWithRelationInput
      | ApartmentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Apartments.
     */
    cursor?: ApartmentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Apartments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Apartments.
     */
    skip?: number;
    distinct?: ApartmentScalarFieldEnum | ApartmentScalarFieldEnum[];
  };

  /**
   * Apartment create
   */
  export type ApartmentCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null;
    /**
     * The data needed to create a Apartment.
     */
    data: XOR<ApartmentCreateInput, ApartmentUncheckedCreateInput>;
  };

  /**
   * Apartment createMany
   */
  export type ApartmentCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Apartments.
     */
    data: ApartmentCreateManyInput | ApartmentCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Apartment createManyAndReturn
   */
  export type ApartmentCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Apartments.
     */
    data: ApartmentCreateManyInput | ApartmentCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Apartment update
   */
  export type ApartmentUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null;
    /**
     * The data needed to update a Apartment.
     */
    data: XOR<ApartmentUpdateInput, ApartmentUncheckedUpdateInput>;
    /**
     * Choose, which Apartment to update.
     */
    where: ApartmentWhereUniqueInput;
  };

  /**
   * Apartment updateMany
   */
  export type ApartmentUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Apartments.
     */
    data: XOR<
      ApartmentUpdateManyMutationInput,
      ApartmentUncheckedUpdateManyInput
    >;
    /**
     * Filter which Apartments to update
     */
    where?: ApartmentWhereInput;
  };

  /**
   * Apartment upsert
   */
  export type ApartmentUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null;
    /**
     * The filter to search for the Apartment to update in case it exists.
     */
    where: ApartmentWhereUniqueInput;
    /**
     * In case the Apartment found by the `where` argument doesn't exist, create a new Apartment with this data.
     */
    create: XOR<ApartmentCreateInput, ApartmentUncheckedCreateInput>;
    /**
     * In case the Apartment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApartmentUpdateInput, ApartmentUncheckedUpdateInput>;
  };

  /**
   * Apartment delete
   */
  export type ApartmentDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null;
    /**
     * Filter which Apartment to delete.
     */
    where: ApartmentWhereUniqueInput;
  };

  /**
   * Apartment deleteMany
   */
  export type ApartmentDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Apartments to delete
     */
    where?: ApartmentWhereInput;
  };

  /**
   * Apartment without action
   */
  export type ApartmentDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null;
  };

  /**
   * Model ApartmentList
   */

  export type AggregateApartmentList = {
    _count: ApartmentListCountAggregateOutputType | null;
    _min: ApartmentListMinAggregateOutputType | null;
    _max: ApartmentListMaxAggregateOutputType | null;
  };

  export type ApartmentListMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type ApartmentListMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type ApartmentListCountAggregateOutputType = {
    id: number;
    name: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type ApartmentListMinAggregateInputType = {
    id?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type ApartmentListMaxAggregateInputType = {
    id?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type ApartmentListCountAggregateInputType = {
    id?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type ApartmentListAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which ApartmentList to aggregate.
     */
    where?: ApartmentListWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ApartmentLists to fetch.
     */
    orderBy?:
      | ApartmentListOrderByWithRelationInput
      | ApartmentListOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: ApartmentListWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ApartmentLists from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ApartmentLists.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ApartmentLists
     **/
    _count?: true | ApartmentListCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: ApartmentListMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: ApartmentListMaxAggregateInputType;
  };

  export type GetApartmentListAggregateType<
    T extends ApartmentListAggregateArgs,
  > = {
    [P in keyof T & keyof AggregateApartmentList]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApartmentList[P]>
      : GetScalarType<T[P], AggregateApartmentList[P]>;
  };

  export type ApartmentListGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: ApartmentListWhereInput;
    orderBy?:
      | ApartmentListOrderByWithAggregationInput
      | ApartmentListOrderByWithAggregationInput[];
    by: ApartmentListScalarFieldEnum[] | ApartmentListScalarFieldEnum;
    having?: ApartmentListScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ApartmentListCountAggregateInputType | true;
    _min?: ApartmentListMinAggregateInputType;
    _max?: ApartmentListMaxAggregateInputType;
  };

  export type ApartmentListGroupByOutputType = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    _count: ApartmentListCountAggregateOutputType | null;
    _min: ApartmentListMinAggregateOutputType | null;
    _max: ApartmentListMaxAggregateOutputType | null;
  };

  type GetApartmentListGroupByPayload<T extends ApartmentListGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<ApartmentListGroupByOutputType, T["by"]> & {
          [P in keyof T &
            keyof ApartmentListGroupByOutputType]: P extends "_count"
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApartmentListGroupByOutputType[P]>
            : GetScalarType<T[P], ApartmentListGroupByOutputType[P]>;
        }
      >
    >;

  export type ApartmentListSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      apartments?: boolean | ApartmentList$apartmentsArgs<ExtArgs>;
      _count?: boolean | ApartmentListCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["apartmentList"]
  >;

  export type ApartmentListSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs["result"]["apartmentList"]
  >;

  export type ApartmentListSelectScalar = {
    id?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type ApartmentListInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    apartments?: boolean | ApartmentList$apartmentsArgs<ExtArgs>;
    _count?: boolean | ApartmentListCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type ApartmentListIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $ApartmentListPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: "ApartmentList";
    objects: {
      apartments: Prisma.$ApartmentPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs["result"]["apartmentList"]
    >;
    composites: {};
  };

  type ApartmentListGetPayload<
    S extends boolean | null | undefined | ApartmentListDefaultArgs,
  > = $Result.GetResult<Prisma.$ApartmentListPayload, S>;

  type ApartmentListCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<ApartmentListFindManyArgs, "select" | "include" | "distinct"> & {
    select?: ApartmentListCountAggregateInputType | true;
  };

  export interface ApartmentListDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["ApartmentList"];
      meta: { name: "ApartmentList" };
    };
    /**
     * Find zero or one ApartmentList that matches the filter.
     * @param {ApartmentListFindUniqueArgs} args - Arguments to find a ApartmentList
     * @example
     * // Get one ApartmentList
     * const apartmentList = await prisma.apartmentList.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApartmentListFindUniqueArgs>(
      args: SelectSubset<T, ApartmentListFindUniqueArgs<ExtArgs>>,
    ): Prisma__ApartmentListClient<
      $Result.GetResult<
        Prisma.$ApartmentListPayload<ExtArgs>,
        T,
        "findUnique"
      > | null,
      null,
      ExtArgs
    >;

    /**
     * Find one ApartmentList that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApartmentListFindUniqueOrThrowArgs} args - Arguments to find a ApartmentList
     * @example
     * // Get one ApartmentList
     * const apartmentList = await prisma.apartmentList.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApartmentListFindUniqueOrThrowArgs>(
      args: SelectSubset<T, ApartmentListFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__ApartmentListClient<
      $Result.GetResult<
        Prisma.$ApartmentListPayload<ExtArgs>,
        T,
        "findUniqueOrThrow"
      >,
      never,
      ExtArgs
    >;

    /**
     * Find the first ApartmentList that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentListFindFirstArgs} args - Arguments to find a ApartmentList
     * @example
     * // Get one ApartmentList
     * const apartmentList = await prisma.apartmentList.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApartmentListFindFirstArgs>(
      args?: SelectSubset<T, ApartmentListFindFirstArgs<ExtArgs>>,
    ): Prisma__ApartmentListClient<
      $Result.GetResult<
        Prisma.$ApartmentListPayload<ExtArgs>,
        T,
        "findFirst"
      > | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first ApartmentList that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentListFindFirstOrThrowArgs} args - Arguments to find a ApartmentList
     * @example
     * // Get one ApartmentList
     * const apartmentList = await prisma.apartmentList.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApartmentListFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ApartmentListFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__ApartmentListClient<
      $Result.GetResult<
        Prisma.$ApartmentListPayload<ExtArgs>,
        T,
        "findFirstOrThrow"
      >,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more ApartmentLists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentListFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApartmentLists
     * const apartmentLists = await prisma.apartmentList.findMany()
     *
     * // Get first 10 ApartmentLists
     * const apartmentLists = await prisma.apartmentList.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const apartmentListWithIdOnly = await prisma.apartmentList.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ApartmentListFindManyArgs>(
      args?: SelectSubset<T, ApartmentListFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$ApartmentListPayload<ExtArgs>, T, "findMany">
    >;

    /**
     * Create a ApartmentList.
     * @param {ApartmentListCreateArgs} args - Arguments to create a ApartmentList.
     * @example
     * // Create one ApartmentList
     * const ApartmentList = await prisma.apartmentList.create({
     *   data: {
     *     // ... data to create a ApartmentList
     *   }
     * })
     *
     */
    create<T extends ApartmentListCreateArgs>(
      args: SelectSubset<T, ApartmentListCreateArgs<ExtArgs>>,
    ): Prisma__ApartmentListClient<
      $Result.GetResult<Prisma.$ApartmentListPayload<ExtArgs>, T, "create">,
      never,
      ExtArgs
    >;

    /**
     * Create many ApartmentLists.
     * @param {ApartmentListCreateManyArgs} args - Arguments to create many ApartmentLists.
     * @example
     * // Create many ApartmentLists
     * const apartmentList = await prisma.apartmentList.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ApartmentListCreateManyArgs>(
      args?: SelectSubset<T, ApartmentListCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many ApartmentLists and returns the data saved in the database.
     * @param {ApartmentListCreateManyAndReturnArgs} args - Arguments to create many ApartmentLists.
     * @example
     * // Create many ApartmentLists
     * const apartmentList = await prisma.apartmentList.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ApartmentLists and only return the `id`
     * const apartmentListWithIdOnly = await prisma.apartmentList.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ApartmentListCreateManyAndReturnArgs>(
      args?: SelectSubset<T, ApartmentListCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$ApartmentListPayload<ExtArgs>,
        T,
        "createManyAndReturn"
      >
    >;

    /**
     * Delete a ApartmentList.
     * @param {ApartmentListDeleteArgs} args - Arguments to delete one ApartmentList.
     * @example
     * // Delete one ApartmentList
     * const ApartmentList = await prisma.apartmentList.delete({
     *   where: {
     *     // ... filter to delete one ApartmentList
     *   }
     * })
     *
     */
    delete<T extends ApartmentListDeleteArgs>(
      args: SelectSubset<T, ApartmentListDeleteArgs<ExtArgs>>,
    ): Prisma__ApartmentListClient<
      $Result.GetResult<Prisma.$ApartmentListPayload<ExtArgs>, T, "delete">,
      never,
      ExtArgs
    >;

    /**
     * Update one ApartmentList.
     * @param {ApartmentListUpdateArgs} args - Arguments to update one ApartmentList.
     * @example
     * // Update one ApartmentList
     * const apartmentList = await prisma.apartmentList.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ApartmentListUpdateArgs>(
      args: SelectSubset<T, ApartmentListUpdateArgs<ExtArgs>>,
    ): Prisma__ApartmentListClient<
      $Result.GetResult<Prisma.$ApartmentListPayload<ExtArgs>, T, "update">,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more ApartmentLists.
     * @param {ApartmentListDeleteManyArgs} args - Arguments to filter ApartmentLists to delete.
     * @example
     * // Delete a few ApartmentLists
     * const { count } = await prisma.apartmentList.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ApartmentListDeleteManyArgs>(
      args?: SelectSubset<T, ApartmentListDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more ApartmentLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentListUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApartmentLists
     * const apartmentList = await prisma.apartmentList.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ApartmentListUpdateManyArgs>(
      args: SelectSubset<T, ApartmentListUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one ApartmentList.
     * @param {ApartmentListUpsertArgs} args - Arguments to update or create a ApartmentList.
     * @example
     * // Update or create a ApartmentList
     * const apartmentList = await prisma.apartmentList.upsert({
     *   create: {
     *     // ... data to create a ApartmentList
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApartmentList we want to update
     *   }
     * })
     */
    upsert<T extends ApartmentListUpsertArgs>(
      args: SelectSubset<T, ApartmentListUpsertArgs<ExtArgs>>,
    ): Prisma__ApartmentListClient<
      $Result.GetResult<Prisma.$ApartmentListPayload<ExtArgs>, T, "upsert">,
      never,
      ExtArgs
    >;

    /**
     * Count the number of ApartmentLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentListCountArgs} args - Arguments to filter ApartmentLists to count.
     * @example
     * // Count the number of ApartmentLists
     * const count = await prisma.apartmentList.count({
     *   where: {
     *     // ... the filter for the ApartmentLists we want to count
     *   }
     * })
     **/
    count<T extends ApartmentListCountArgs>(
      args?: Subset<T, ApartmentListCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], ApartmentListCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a ApartmentList.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentListAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends ApartmentListAggregateArgs>(
      args: Subset<T, ApartmentListAggregateArgs>,
    ): Prisma.PrismaPromise<GetApartmentListAggregateType<T>>;

    /**
     * Group by ApartmentList.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApartmentListGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends ApartmentListGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApartmentListGroupByArgs["orderBy"] }
        : { orderBy?: ApartmentListGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, ApartmentListGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetApartmentListGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ApartmentList model
     */
    readonly fields: ApartmentListFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApartmentList.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApartmentListClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    apartments<T extends ApartmentList$apartmentsArgs<ExtArgs> = {}>(
      args?: Subset<T, ApartmentList$apartmentsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$ApartmentPayload<ExtArgs>, T, "findMany"> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the ApartmentList model
   */
  interface ApartmentListFieldRefs {
    readonly id: FieldRef<"ApartmentList", "String">;
    readonly name: FieldRef<"ApartmentList", "String">;
    readonly createdAt: FieldRef<"ApartmentList", "DateTime">;
    readonly updatedAt: FieldRef<"ApartmentList", "DateTime">;
  }

  // Custom InputTypes
  /**
   * ApartmentList findUnique
   */
  export type ApartmentListFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ApartmentList
     */
    select?: ApartmentListSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentListInclude<ExtArgs> | null;
    /**
     * Filter, which ApartmentList to fetch.
     */
    where: ApartmentListWhereUniqueInput;
  };

  /**
   * ApartmentList findUniqueOrThrow
   */
  export type ApartmentListFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ApartmentList
     */
    select?: ApartmentListSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentListInclude<ExtArgs> | null;
    /**
     * Filter, which ApartmentList to fetch.
     */
    where: ApartmentListWhereUniqueInput;
  };

  /**
   * ApartmentList findFirst
   */
  export type ApartmentListFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ApartmentList
     */
    select?: ApartmentListSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentListInclude<ExtArgs> | null;
    /**
     * Filter, which ApartmentList to fetch.
     */
    where?: ApartmentListWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ApartmentLists to fetch.
     */
    orderBy?:
      | ApartmentListOrderByWithRelationInput
      | ApartmentListOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ApartmentLists.
     */
    cursor?: ApartmentListWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ApartmentLists from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ApartmentLists.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ApartmentLists.
     */
    distinct?: ApartmentListScalarFieldEnum | ApartmentListScalarFieldEnum[];
  };

  /**
   * ApartmentList findFirstOrThrow
   */
  export type ApartmentListFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ApartmentList
     */
    select?: ApartmentListSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentListInclude<ExtArgs> | null;
    /**
     * Filter, which ApartmentList to fetch.
     */
    where?: ApartmentListWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ApartmentLists to fetch.
     */
    orderBy?:
      | ApartmentListOrderByWithRelationInput
      | ApartmentListOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ApartmentLists.
     */
    cursor?: ApartmentListWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ApartmentLists from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ApartmentLists.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ApartmentLists.
     */
    distinct?: ApartmentListScalarFieldEnum | ApartmentListScalarFieldEnum[];
  };

  /**
   * ApartmentList findMany
   */
  export type ApartmentListFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ApartmentList
     */
    select?: ApartmentListSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentListInclude<ExtArgs> | null;
    /**
     * Filter, which ApartmentLists to fetch.
     */
    where?: ApartmentListWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ApartmentLists to fetch.
     */
    orderBy?:
      | ApartmentListOrderByWithRelationInput
      | ApartmentListOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ApartmentLists.
     */
    cursor?: ApartmentListWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ApartmentLists from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ApartmentLists.
     */
    skip?: number;
    distinct?: ApartmentListScalarFieldEnum | ApartmentListScalarFieldEnum[];
  };

  /**
   * ApartmentList create
   */
  export type ApartmentListCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ApartmentList
     */
    select?: ApartmentListSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentListInclude<ExtArgs> | null;
    /**
     * The data needed to create a ApartmentList.
     */
    data: XOR<ApartmentListCreateInput, ApartmentListUncheckedCreateInput>;
  };

  /**
   * ApartmentList createMany
   */
  export type ApartmentListCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many ApartmentLists.
     */
    data: ApartmentListCreateManyInput | ApartmentListCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * ApartmentList createManyAndReturn
   */
  export type ApartmentListCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ApartmentList
     */
    select?: ApartmentListSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many ApartmentLists.
     */
    data: ApartmentListCreateManyInput | ApartmentListCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * ApartmentList update
   */
  export type ApartmentListUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ApartmentList
     */
    select?: ApartmentListSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentListInclude<ExtArgs> | null;
    /**
     * The data needed to update a ApartmentList.
     */
    data: XOR<ApartmentListUpdateInput, ApartmentListUncheckedUpdateInput>;
    /**
     * Choose, which ApartmentList to update.
     */
    where: ApartmentListWhereUniqueInput;
  };

  /**
   * ApartmentList updateMany
   */
  export type ApartmentListUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update ApartmentLists.
     */
    data: XOR<
      ApartmentListUpdateManyMutationInput,
      ApartmentListUncheckedUpdateManyInput
    >;
    /**
     * Filter which ApartmentLists to update
     */
    where?: ApartmentListWhereInput;
  };

  /**
   * ApartmentList upsert
   */
  export type ApartmentListUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ApartmentList
     */
    select?: ApartmentListSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentListInclude<ExtArgs> | null;
    /**
     * The filter to search for the ApartmentList to update in case it exists.
     */
    where: ApartmentListWhereUniqueInput;
    /**
     * In case the ApartmentList found by the `where` argument doesn't exist, create a new ApartmentList with this data.
     */
    create: XOR<ApartmentListCreateInput, ApartmentListUncheckedCreateInput>;
    /**
     * In case the ApartmentList was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApartmentListUpdateInput, ApartmentListUncheckedUpdateInput>;
  };

  /**
   * ApartmentList delete
   */
  export type ApartmentListDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ApartmentList
     */
    select?: ApartmentListSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentListInclude<ExtArgs> | null;
    /**
     * Filter which ApartmentList to delete.
     */
    where: ApartmentListWhereUniqueInput;
  };

  /**
   * ApartmentList deleteMany
   */
  export type ApartmentListDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which ApartmentLists to delete
     */
    where?: ApartmentListWhereInput;
  };

  /**
   * ApartmentList.apartments
   */
  export type ApartmentList$apartmentsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apartment
     */
    select?: ApartmentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentInclude<ExtArgs> | null;
    where?: ApartmentWhereInput;
    orderBy?:
      | ApartmentOrderByWithRelationInput
      | ApartmentOrderByWithRelationInput[];
    cursor?: ApartmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: ApartmentScalarFieldEnum | ApartmentScalarFieldEnum[];
  };

  /**
   * ApartmentList without action
   */
  export type ApartmentListDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ApartmentList
     */
    select?: ApartmentListSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApartmentListInclude<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: "ReadUncommitted";
    ReadCommitted: "ReadCommitted";
    RepeatableRead: "RepeatableRead";
    Serializable: "Serializable";
  };

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const PokemonScalarFieldEnum: {
    id: "id";
    name: "name";
    name_clean: "name_clean";
    abilities: "abilities";
    types: "types";
    img: "img";
    base_experience: "base_experience";
    height: "height";
    weight: "weight";
    is_default: "is_default";
    order: "order";
    hp: "hp";
    attack: "attack";
    defense: "defense";
    special_attack: "special_attack";
    special_defense: "special_defense";
    speed: "speed";
  };

  export type PokemonScalarFieldEnum =
    (typeof PokemonScalarFieldEnum)[keyof typeof PokemonScalarFieldEnum];

  export const UserScalarFieldEnum: {
    id: "id";
    email: "email";
    name: "name";
  };

  export type UserScalarFieldEnum =
    (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];

  export const CardScalarFieldEnum: {
    id: "id";
    word: "word";
    translation: "translation";
    remembered: "remembered";
    createdAt: "createdAt";
    userId: "userId";
  };

  export type CardScalarFieldEnum =
    (typeof CardScalarFieldEnum)[keyof typeof CardScalarFieldEnum];

  export const ApartmentScalarFieldEnum: {
    id: "id";
    name: "name";
    startDate: "startDate";
    endDate: "endDate";
    apartmentListId: "apartmentListId";
  };

  export type ApartmentScalarFieldEnum =
    (typeof ApartmentScalarFieldEnum)[keyof typeof ApartmentScalarFieldEnum];

  export const ApartmentListScalarFieldEnum: {
    id: "id";
    name: "name";
    createdAt: "createdAt";
    updatedAt: "updatedAt";
  };

  export type ApartmentListScalarFieldEnum =
    (typeof ApartmentListScalarFieldEnum)[keyof typeof ApartmentListScalarFieldEnum];

  export const SortOrder: {
    asc: "asc";
    desc: "desc";
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const QueryMode: {
    default: "default";
    insensitive: "insensitive";
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const NullsOrder: {
    first: "first";
    last: "last";
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Int"
  >;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Int[]"
  >;

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "String"
  >;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "String[]"
  >;

  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Boolean"
  >;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "DateTime"
  >;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "DateTime[]"
  >;

  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Float"
  >;

  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Float[]"
  >;

  /**
   * Deep Input Types
   */

  export type PokemonWhereInput = {
    AND?: PokemonWhereInput | PokemonWhereInput[];
    OR?: PokemonWhereInput[];
    NOT?: PokemonWhereInput | PokemonWhereInput[];
    id?: IntFilter<"Pokemon"> | number;
    name?: StringFilter<"Pokemon"> | string;
    name_clean?: StringFilter<"Pokemon"> | string;
    abilities?: StringNullableListFilter<"Pokemon">;
    types?: StringNullableListFilter<"Pokemon">;
    img?: StringNullableFilter<"Pokemon"> | string | null;
    base_experience?: IntFilter<"Pokemon"> | number;
    height?: IntFilter<"Pokemon"> | number;
    weight?: IntFilter<"Pokemon"> | number;
    is_default?: BoolFilter<"Pokemon"> | boolean;
    order?: IntFilter<"Pokemon"> | number;
    hp?: IntFilter<"Pokemon"> | number;
    attack?: IntFilter<"Pokemon"> | number;
    defense?: IntFilter<"Pokemon"> | number;
    special_attack?: IntFilter<"Pokemon"> | number;
    special_defense?: IntFilter<"Pokemon"> | number;
    speed?: IntFilter<"Pokemon"> | number;
  };

  export type PokemonOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    name_clean?: SortOrder;
    abilities?: SortOrder;
    types?: SortOrder;
    img?: SortOrderInput | SortOrder;
    base_experience?: SortOrder;
    height?: SortOrder;
    weight?: SortOrder;
    is_default?: SortOrder;
    order?: SortOrder;
    hp?: SortOrder;
    attack?: SortOrder;
    defense?: SortOrder;
    special_attack?: SortOrder;
    special_defense?: SortOrder;
    speed?: SortOrder;
  };

  export type PokemonWhereUniqueInput = Prisma.AtLeast<
    {
      id?: number;
      AND?: PokemonWhereInput | PokemonWhereInput[];
      OR?: PokemonWhereInput[];
      NOT?: PokemonWhereInput | PokemonWhereInput[];
      name?: StringFilter<"Pokemon"> | string;
      name_clean?: StringFilter<"Pokemon"> | string;
      abilities?: StringNullableListFilter<"Pokemon">;
      types?: StringNullableListFilter<"Pokemon">;
      img?: StringNullableFilter<"Pokemon"> | string | null;
      base_experience?: IntFilter<"Pokemon"> | number;
      height?: IntFilter<"Pokemon"> | number;
      weight?: IntFilter<"Pokemon"> | number;
      is_default?: BoolFilter<"Pokemon"> | boolean;
      order?: IntFilter<"Pokemon"> | number;
      hp?: IntFilter<"Pokemon"> | number;
      attack?: IntFilter<"Pokemon"> | number;
      defense?: IntFilter<"Pokemon"> | number;
      special_attack?: IntFilter<"Pokemon"> | number;
      special_defense?: IntFilter<"Pokemon"> | number;
      speed?: IntFilter<"Pokemon"> | number;
    },
    "id"
  >;

  export type PokemonOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    name_clean?: SortOrder;
    abilities?: SortOrder;
    types?: SortOrder;
    img?: SortOrderInput | SortOrder;
    base_experience?: SortOrder;
    height?: SortOrder;
    weight?: SortOrder;
    is_default?: SortOrder;
    order?: SortOrder;
    hp?: SortOrder;
    attack?: SortOrder;
    defense?: SortOrder;
    special_attack?: SortOrder;
    special_defense?: SortOrder;
    speed?: SortOrder;
    _count?: PokemonCountOrderByAggregateInput;
    _avg?: PokemonAvgOrderByAggregateInput;
    _max?: PokemonMaxOrderByAggregateInput;
    _min?: PokemonMinOrderByAggregateInput;
    _sum?: PokemonSumOrderByAggregateInput;
  };

  export type PokemonScalarWhereWithAggregatesInput = {
    AND?:
      | PokemonScalarWhereWithAggregatesInput
      | PokemonScalarWhereWithAggregatesInput[];
    OR?: PokemonScalarWhereWithAggregatesInput[];
    NOT?:
      | PokemonScalarWhereWithAggregatesInput
      | PokemonScalarWhereWithAggregatesInput[];
    id?: IntWithAggregatesFilter<"Pokemon"> | number;
    name?: StringWithAggregatesFilter<"Pokemon"> | string;
    name_clean?: StringWithAggregatesFilter<"Pokemon"> | string;
    abilities?: StringNullableListFilter<"Pokemon">;
    types?: StringNullableListFilter<"Pokemon">;
    img?: StringNullableWithAggregatesFilter<"Pokemon"> | string | null;
    base_experience?: IntWithAggregatesFilter<"Pokemon"> | number;
    height?: IntWithAggregatesFilter<"Pokemon"> | number;
    weight?: IntWithAggregatesFilter<"Pokemon"> | number;
    is_default?: BoolWithAggregatesFilter<"Pokemon"> | boolean;
    order?: IntWithAggregatesFilter<"Pokemon"> | number;
    hp?: IntWithAggregatesFilter<"Pokemon"> | number;
    attack?: IntWithAggregatesFilter<"Pokemon"> | number;
    defense?: IntWithAggregatesFilter<"Pokemon"> | number;
    special_attack?: IntWithAggregatesFilter<"Pokemon"> | number;
    special_defense?: IntWithAggregatesFilter<"Pokemon"> | number;
    speed?: IntWithAggregatesFilter<"Pokemon"> | number;
  };

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[];
    OR?: UserWhereInput[];
    NOT?: UserWhereInput | UserWhereInput[];
    id?: StringFilter<"User"> | string;
    email?: StringFilter<"User"> | string;
    name?: StringNullableFilter<"User"> | string | null;
    cards?: CardListRelationFilter;
  };

  export type UserOrderByWithRelationInput = {
    id?: SortOrder;
    email?: SortOrder;
    name?: SortOrderInput | SortOrder;
    cards?: CardOrderByRelationAggregateInput;
  };

  export type UserWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      email?: string;
      AND?: UserWhereInput | UserWhereInput[];
      OR?: UserWhereInput[];
      NOT?: UserWhereInput | UserWhereInput[];
      name?: StringNullableFilter<"User"> | string | null;
      cards?: CardListRelationFilter;
    },
    "id" | "email"
  >;

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder;
    email?: SortOrder;
    name?: SortOrderInput | SortOrder;
    _count?: UserCountOrderByAggregateInput;
    _max?: UserMaxOrderByAggregateInput;
    _min?: UserMinOrderByAggregateInput;
  };

  export type UserScalarWhereWithAggregatesInput = {
    AND?:
      | UserScalarWhereWithAggregatesInput
      | UserScalarWhereWithAggregatesInput[];
    OR?: UserScalarWhereWithAggregatesInput[];
    NOT?:
      | UserScalarWhereWithAggregatesInput
      | UserScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"User"> | string;
    email?: StringWithAggregatesFilter<"User"> | string;
    name?: StringNullableWithAggregatesFilter<"User"> | string | null;
  };

  export type CardWhereInput = {
    AND?: CardWhereInput | CardWhereInput[];
    OR?: CardWhereInput[];
    NOT?: CardWhereInput | CardWhereInput[];
    id?: StringFilter<"Card"> | string;
    word?: StringFilter<"Card"> | string;
    translation?: StringFilter<"Card"> | string;
    remembered?: BoolFilter<"Card"> | boolean;
    createdAt?: DateTimeFilter<"Card"> | Date | string;
    userId?: StringFilter<"Card"> | string;
    user?: XOR<UserRelationFilter, UserWhereInput>;
  };

  export type CardOrderByWithRelationInput = {
    id?: SortOrder;
    word?: SortOrder;
    translation?: SortOrder;
    remembered?: SortOrder;
    createdAt?: SortOrder;
    userId?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type CardWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: CardWhereInput | CardWhereInput[];
      OR?: CardWhereInput[];
      NOT?: CardWhereInput | CardWhereInput[];
      word?: StringFilter<"Card"> | string;
      translation?: StringFilter<"Card"> | string;
      remembered?: BoolFilter<"Card"> | boolean;
      createdAt?: DateTimeFilter<"Card"> | Date | string;
      userId?: StringFilter<"Card"> | string;
      user?: XOR<UserRelationFilter, UserWhereInput>;
    },
    "id"
  >;

  export type CardOrderByWithAggregationInput = {
    id?: SortOrder;
    word?: SortOrder;
    translation?: SortOrder;
    remembered?: SortOrder;
    createdAt?: SortOrder;
    userId?: SortOrder;
    _count?: CardCountOrderByAggregateInput;
    _max?: CardMaxOrderByAggregateInput;
    _min?: CardMinOrderByAggregateInput;
  };

  export type CardScalarWhereWithAggregatesInput = {
    AND?:
      | CardScalarWhereWithAggregatesInput
      | CardScalarWhereWithAggregatesInput[];
    OR?: CardScalarWhereWithAggregatesInput[];
    NOT?:
      | CardScalarWhereWithAggregatesInput
      | CardScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"Card"> | string;
    word?: StringWithAggregatesFilter<"Card"> | string;
    translation?: StringWithAggregatesFilter<"Card"> | string;
    remembered?: BoolWithAggregatesFilter<"Card"> | boolean;
    createdAt?: DateTimeWithAggregatesFilter<"Card"> | Date | string;
    userId?: StringWithAggregatesFilter<"Card"> | string;
  };

  export type ApartmentWhereInput = {
    AND?: ApartmentWhereInput | ApartmentWhereInput[];
    OR?: ApartmentWhereInput[];
    NOT?: ApartmentWhereInput | ApartmentWhereInput[];
    id?: StringFilter<"Apartment"> | string;
    name?: StringFilter<"Apartment"> | string;
    startDate?: DateTimeFilter<"Apartment"> | Date | string;
    endDate?: DateTimeNullableFilter<"Apartment"> | Date | string | null;
    apartmentListId?: StringFilter<"Apartment"> | string;
    apartmentList?: XOR<ApartmentListRelationFilter, ApartmentListWhereInput>;
  };

  export type ApartmentOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    startDate?: SortOrder;
    endDate?: SortOrderInput | SortOrder;
    apartmentListId?: SortOrder;
    apartmentList?: ApartmentListOrderByWithRelationInput;
  };

  export type ApartmentWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: ApartmentWhereInput | ApartmentWhereInput[];
      OR?: ApartmentWhereInput[];
      NOT?: ApartmentWhereInput | ApartmentWhereInput[];
      name?: StringFilter<"Apartment"> | string;
      startDate?: DateTimeFilter<"Apartment"> | Date | string;
      endDate?: DateTimeNullableFilter<"Apartment"> | Date | string | null;
      apartmentListId?: StringFilter<"Apartment"> | string;
      apartmentList?: XOR<ApartmentListRelationFilter, ApartmentListWhereInput>;
    },
    "id"
  >;

  export type ApartmentOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    startDate?: SortOrder;
    endDate?: SortOrderInput | SortOrder;
    apartmentListId?: SortOrder;
    _count?: ApartmentCountOrderByAggregateInput;
    _max?: ApartmentMaxOrderByAggregateInput;
    _min?: ApartmentMinOrderByAggregateInput;
  };

  export type ApartmentScalarWhereWithAggregatesInput = {
    AND?:
      | ApartmentScalarWhereWithAggregatesInput
      | ApartmentScalarWhereWithAggregatesInput[];
    OR?: ApartmentScalarWhereWithAggregatesInput[];
    NOT?:
      | ApartmentScalarWhereWithAggregatesInput
      | ApartmentScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"Apartment"> | string;
    name?: StringWithAggregatesFilter<"Apartment"> | string;
    startDate?: DateTimeWithAggregatesFilter<"Apartment"> | Date | string;
    endDate?:
      | DateTimeNullableWithAggregatesFilter<"Apartment">
      | Date
      | string
      | null;
    apartmentListId?: StringWithAggregatesFilter<"Apartment"> | string;
  };

  export type ApartmentListWhereInput = {
    AND?: ApartmentListWhereInput | ApartmentListWhereInput[];
    OR?: ApartmentListWhereInput[];
    NOT?: ApartmentListWhereInput | ApartmentListWhereInput[];
    id?: StringFilter<"ApartmentList"> | string;
    name?: StringFilter<"ApartmentList"> | string;
    createdAt?: DateTimeFilter<"ApartmentList"> | Date | string;
    updatedAt?: DateTimeFilter<"ApartmentList"> | Date | string;
    apartments?: ApartmentListRelationFilter;
  };

  export type ApartmentListOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    apartments?: ApartmentOrderByRelationAggregateInput;
  };

  export type ApartmentListWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: ApartmentListWhereInput | ApartmentListWhereInput[];
      OR?: ApartmentListWhereInput[];
      NOT?: ApartmentListWhereInput | ApartmentListWhereInput[];
      name?: StringFilter<"ApartmentList"> | string;
      createdAt?: DateTimeFilter<"ApartmentList"> | Date | string;
      updatedAt?: DateTimeFilter<"ApartmentList"> | Date | string;
      apartments?: ApartmentListRelationFilter;
    },
    "id"
  >;

  export type ApartmentListOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: ApartmentListCountOrderByAggregateInput;
    _max?: ApartmentListMaxOrderByAggregateInput;
    _min?: ApartmentListMinOrderByAggregateInput;
  };

  export type ApartmentListScalarWhereWithAggregatesInput = {
    AND?:
      | ApartmentListScalarWhereWithAggregatesInput
      | ApartmentListScalarWhereWithAggregatesInput[];
    OR?: ApartmentListScalarWhereWithAggregatesInput[];
    NOT?:
      | ApartmentListScalarWhereWithAggregatesInput
      | ApartmentListScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"ApartmentList"> | string;
    name?: StringWithAggregatesFilter<"ApartmentList"> | string;
    createdAt?: DateTimeWithAggregatesFilter<"ApartmentList"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"ApartmentList"> | Date | string;
  };

  export type PokemonCreateInput = {
    name: string;
    name_clean: string;
    abilities?: PokemonCreateabilitiesInput | string[];
    types?: PokemonCreatetypesInput | string[];
    img?: string | null;
    base_experience: number;
    height: number;
    weight: number;
    is_default: boolean;
    order: number;
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };

  export type PokemonUncheckedCreateInput = {
    id?: number;
    name: string;
    name_clean: string;
    abilities?: PokemonCreateabilitiesInput | string[];
    types?: PokemonCreatetypesInput | string[];
    img?: string | null;
    base_experience: number;
    height: number;
    weight: number;
    is_default: boolean;
    order: number;
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };

  export type PokemonUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string;
    name_clean?: StringFieldUpdateOperationsInput | string;
    abilities?: PokemonUpdateabilitiesInput | string[];
    types?: PokemonUpdatetypesInput | string[];
    img?: NullableStringFieldUpdateOperationsInput | string | null;
    base_experience?: IntFieldUpdateOperationsInput | number;
    height?: IntFieldUpdateOperationsInput | number;
    weight?: IntFieldUpdateOperationsInput | number;
    is_default?: BoolFieldUpdateOperationsInput | boolean;
    order?: IntFieldUpdateOperationsInput | number;
    hp?: IntFieldUpdateOperationsInput | number;
    attack?: IntFieldUpdateOperationsInput | number;
    defense?: IntFieldUpdateOperationsInput | number;
    special_attack?: IntFieldUpdateOperationsInput | number;
    special_defense?: IntFieldUpdateOperationsInput | number;
    speed?: IntFieldUpdateOperationsInput | number;
  };

  export type PokemonUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number;
    name?: StringFieldUpdateOperationsInput | string;
    name_clean?: StringFieldUpdateOperationsInput | string;
    abilities?: PokemonUpdateabilitiesInput | string[];
    types?: PokemonUpdatetypesInput | string[];
    img?: NullableStringFieldUpdateOperationsInput | string | null;
    base_experience?: IntFieldUpdateOperationsInput | number;
    height?: IntFieldUpdateOperationsInput | number;
    weight?: IntFieldUpdateOperationsInput | number;
    is_default?: BoolFieldUpdateOperationsInput | boolean;
    order?: IntFieldUpdateOperationsInput | number;
    hp?: IntFieldUpdateOperationsInput | number;
    attack?: IntFieldUpdateOperationsInput | number;
    defense?: IntFieldUpdateOperationsInput | number;
    special_attack?: IntFieldUpdateOperationsInput | number;
    special_defense?: IntFieldUpdateOperationsInput | number;
    speed?: IntFieldUpdateOperationsInput | number;
  };

  export type PokemonCreateManyInput = {
    id?: number;
    name: string;
    name_clean: string;
    abilities?: PokemonCreateabilitiesInput | string[];
    types?: PokemonCreatetypesInput | string[];
    img?: string | null;
    base_experience: number;
    height: number;
    weight: number;
    is_default: boolean;
    order: number;
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };

  export type PokemonUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string;
    name_clean?: StringFieldUpdateOperationsInput | string;
    abilities?: PokemonUpdateabilitiesInput | string[];
    types?: PokemonUpdatetypesInput | string[];
    img?: NullableStringFieldUpdateOperationsInput | string | null;
    base_experience?: IntFieldUpdateOperationsInput | number;
    height?: IntFieldUpdateOperationsInput | number;
    weight?: IntFieldUpdateOperationsInput | number;
    is_default?: BoolFieldUpdateOperationsInput | boolean;
    order?: IntFieldUpdateOperationsInput | number;
    hp?: IntFieldUpdateOperationsInput | number;
    attack?: IntFieldUpdateOperationsInput | number;
    defense?: IntFieldUpdateOperationsInput | number;
    special_attack?: IntFieldUpdateOperationsInput | number;
    special_defense?: IntFieldUpdateOperationsInput | number;
    speed?: IntFieldUpdateOperationsInput | number;
  };

  export type PokemonUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number;
    name?: StringFieldUpdateOperationsInput | string;
    name_clean?: StringFieldUpdateOperationsInput | string;
    abilities?: PokemonUpdateabilitiesInput | string[];
    types?: PokemonUpdatetypesInput | string[];
    img?: NullableStringFieldUpdateOperationsInput | string | null;
    base_experience?: IntFieldUpdateOperationsInput | number;
    height?: IntFieldUpdateOperationsInput | number;
    weight?: IntFieldUpdateOperationsInput | number;
    is_default?: BoolFieldUpdateOperationsInput | boolean;
    order?: IntFieldUpdateOperationsInput | number;
    hp?: IntFieldUpdateOperationsInput | number;
    attack?: IntFieldUpdateOperationsInput | number;
    defense?: IntFieldUpdateOperationsInput | number;
    special_attack?: IntFieldUpdateOperationsInput | number;
    special_defense?: IntFieldUpdateOperationsInput | number;
    speed?: IntFieldUpdateOperationsInput | number;
  };

  export type UserCreateInput = {
    id?: string;
    email: string;
    name?: string | null;
    cards?: CardCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateInput = {
    id?: string;
    email: string;
    name?: string | null;
    cards?: CardUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
    cards?: CardUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
    cards?: CardUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateManyInput = {
    id?: string;
    email: string;
    name?: string | null;
  };

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
  };

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
  };

  export type CardCreateInput = {
    id?: string;
    word: string;
    translation: string;
    remembered?: boolean;
    createdAt?: Date | string;
    user: UserCreateNestedOneWithoutCardsInput;
  };

  export type CardUncheckedCreateInput = {
    id?: string;
    word: string;
    translation: string;
    remembered?: boolean;
    createdAt?: Date | string;
    userId: string;
  };

  export type CardUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    word?: StringFieldUpdateOperationsInput | string;
    translation?: StringFieldUpdateOperationsInput | string;
    remembered?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutCardsNestedInput;
  };

  export type CardUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    word?: StringFieldUpdateOperationsInput | string;
    translation?: StringFieldUpdateOperationsInput | string;
    remembered?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    userId?: StringFieldUpdateOperationsInput | string;
  };

  export type CardCreateManyInput = {
    id?: string;
    word: string;
    translation: string;
    remembered?: boolean;
    createdAt?: Date | string;
    userId: string;
  };

  export type CardUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    word?: StringFieldUpdateOperationsInput | string;
    translation?: StringFieldUpdateOperationsInput | string;
    remembered?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type CardUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    word?: StringFieldUpdateOperationsInput | string;
    translation?: StringFieldUpdateOperationsInput | string;
    remembered?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    userId?: StringFieldUpdateOperationsInput | string;
  };

  export type ApartmentCreateInput = {
    id?: string;
    name: string;
    startDate: Date | string;
    endDate?: Date | string | null;
    apartmentList: ApartmentListCreateNestedOneWithoutApartmentsInput;
  };

  export type ApartmentUncheckedCreateInput = {
    id?: string;
    name: string;
    startDate: Date | string;
    endDate?: Date | string | null;
    apartmentListId: string;
  };

  export type ApartmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    apartmentList?: ApartmentListUpdateOneRequiredWithoutApartmentsNestedInput;
  };

  export type ApartmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    apartmentListId?: StringFieldUpdateOperationsInput | string;
  };

  export type ApartmentCreateManyInput = {
    id?: string;
    name: string;
    startDate: Date | string;
    endDate?: Date | string | null;
    apartmentListId: string;
  };

  export type ApartmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  };

  export type ApartmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    apartmentListId?: StringFieldUpdateOperationsInput | string;
  };

  export type ApartmentListCreateInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    apartments?: ApartmentCreateNestedManyWithoutApartmentListInput;
  };

  export type ApartmentListUncheckedCreateInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    apartments?: ApartmentUncheckedCreateNestedManyWithoutApartmentListInput;
  };

  export type ApartmentListUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    apartments?: ApartmentUpdateManyWithoutApartmentListNestedInput;
  };

  export type ApartmentListUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    apartments?: ApartmentUncheckedUpdateManyWithoutApartmentListNestedInput;
  };

  export type ApartmentListCreateManyInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ApartmentListUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ApartmentListUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    has?: string | StringFieldRefInput<$PrismaModel> | null;
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>;
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type PokemonCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    name_clean?: SortOrder;
    abilities?: SortOrder;
    types?: SortOrder;
    img?: SortOrder;
    base_experience?: SortOrder;
    height?: SortOrder;
    weight?: SortOrder;
    is_default?: SortOrder;
    order?: SortOrder;
    hp?: SortOrder;
    attack?: SortOrder;
    defense?: SortOrder;
    special_attack?: SortOrder;
    special_defense?: SortOrder;
    speed?: SortOrder;
  };

  export type PokemonAvgOrderByAggregateInput = {
    id?: SortOrder;
    base_experience?: SortOrder;
    height?: SortOrder;
    weight?: SortOrder;
    order?: SortOrder;
    hp?: SortOrder;
    attack?: SortOrder;
    defense?: SortOrder;
    special_attack?: SortOrder;
    special_defense?: SortOrder;
    speed?: SortOrder;
  };

  export type PokemonMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    name_clean?: SortOrder;
    img?: SortOrder;
    base_experience?: SortOrder;
    height?: SortOrder;
    weight?: SortOrder;
    is_default?: SortOrder;
    order?: SortOrder;
    hp?: SortOrder;
    attack?: SortOrder;
    defense?: SortOrder;
    special_attack?: SortOrder;
    special_defense?: SortOrder;
    speed?: SortOrder;
  };

  export type PokemonMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    name_clean?: SortOrder;
    img?: SortOrder;
    base_experience?: SortOrder;
    height?: SortOrder;
    weight?: SortOrder;
    is_default?: SortOrder;
    order?: SortOrder;
    hp?: SortOrder;
    attack?: SortOrder;
    defense?: SortOrder;
    special_attack?: SortOrder;
    special_defense?: SortOrder;
    speed?: SortOrder;
  };

  export type PokemonSumOrderByAggregateInput = {
    id?: SortOrder;
    base_experience?: SortOrder;
    height?: SortOrder;
    weight?: SortOrder;
    order?: SortOrder;
    hp?: SortOrder;
    attack?: SortOrder;
    defense?: SortOrder;
    special_attack?: SortOrder;
    special_defense?: SortOrder;
    speed?: SortOrder;
  };

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type CardListRelationFilter = {
    every?: CardWhereInput;
    some?: CardWhereInput;
    none?: CardWhereInput;
  };

  export type CardOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder;
    email?: SortOrder;
    name?: SortOrder;
  };

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder;
    email?: SortOrder;
    name?: SortOrder;
  };

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder;
    email?: SortOrder;
    name?: SortOrder;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type UserRelationFilter = {
    is?: UserWhereInput;
    isNot?: UserWhereInput;
  };

  export type CardCountOrderByAggregateInput = {
    id?: SortOrder;
    word?: SortOrder;
    translation?: SortOrder;
    remembered?: SortOrder;
    createdAt?: SortOrder;
    userId?: SortOrder;
  };

  export type CardMaxOrderByAggregateInput = {
    id?: SortOrder;
    word?: SortOrder;
    translation?: SortOrder;
    remembered?: SortOrder;
    createdAt?: SortOrder;
    userId?: SortOrder;
  };

  export type CardMinOrderByAggregateInput = {
    id?: SortOrder;
    word?: SortOrder;
    translation?: SortOrder;
    remembered?: SortOrder;
    createdAt?: SortOrder;
    userId?: SortOrder;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type ApartmentListRelationFilter = {
    is?: ApartmentListWhereInput;
    isNot?: ApartmentListWhereInput;
  };

  export type ApartmentCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    startDate?: SortOrder;
    endDate?: SortOrder;
    apartmentListId?: SortOrder;
  };

  export type ApartmentMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    startDate?: SortOrder;
    endDate?: SortOrder;
    apartmentListId?: SortOrder;
  };

  export type ApartmentMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    startDate?: SortOrder;
    endDate?: SortOrder;
    apartmentListId?: SortOrder;
  };

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?:
      | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
      | Date
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: NestedDateTimeNullableFilter<$PrismaModel>;
  };

  export type ApartmentListRelationFilter = {
    every?: ApartmentWhereInput;
    some?: ApartmentWhereInput;
    none?: ApartmentWhereInput;
  };

  export type ApartmentOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type ApartmentListCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ApartmentListMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ApartmentListMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PokemonCreateabilitiesInput = {
    set: string[];
  };

  export type PokemonCreatetypesInput = {
    set: string[];
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type PokemonUpdateabilitiesInput = {
    set?: string[];
    push?: string | string[];
  };

  export type PokemonUpdatetypesInput = {
    set?: string[];
    push?: string | string[];
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
  };

  export type CardCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<CardCreateWithoutUserInput, CardUncheckedCreateWithoutUserInput>
      | CardCreateWithoutUserInput[]
      | CardUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | CardCreateOrConnectWithoutUserInput
      | CardCreateOrConnectWithoutUserInput[];
    createMany?: CardCreateManyUserInputEnvelope;
    connect?: CardWhereUniqueInput | CardWhereUniqueInput[];
  };

  export type CardUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<CardCreateWithoutUserInput, CardUncheckedCreateWithoutUserInput>
      | CardCreateWithoutUserInput[]
      | CardUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | CardCreateOrConnectWithoutUserInput
      | CardCreateOrConnectWithoutUserInput[];
    createMany?: CardCreateManyUserInputEnvelope;
    connect?: CardWhereUniqueInput | CardWhereUniqueInput[];
  };

  export type CardUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<CardCreateWithoutUserInput, CardUncheckedCreateWithoutUserInput>
      | CardCreateWithoutUserInput[]
      | CardUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | CardCreateOrConnectWithoutUserInput
      | CardCreateOrConnectWithoutUserInput[];
    upsert?:
      | CardUpsertWithWhereUniqueWithoutUserInput
      | CardUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: CardCreateManyUserInputEnvelope;
    set?: CardWhereUniqueInput | CardWhereUniqueInput[];
    disconnect?: CardWhereUniqueInput | CardWhereUniqueInput[];
    delete?: CardWhereUniqueInput | CardWhereUniqueInput[];
    connect?: CardWhereUniqueInput | CardWhereUniqueInput[];
    update?:
      | CardUpdateWithWhereUniqueWithoutUserInput
      | CardUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | CardUpdateManyWithWhereWithoutUserInput
      | CardUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: CardScalarWhereInput | CardScalarWhereInput[];
  };

  export type CardUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<CardCreateWithoutUserInput, CardUncheckedCreateWithoutUserInput>
      | CardCreateWithoutUserInput[]
      | CardUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | CardCreateOrConnectWithoutUserInput
      | CardCreateOrConnectWithoutUserInput[];
    upsert?:
      | CardUpsertWithWhereUniqueWithoutUserInput
      | CardUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: CardCreateManyUserInputEnvelope;
    set?: CardWhereUniqueInput | CardWhereUniqueInput[];
    disconnect?: CardWhereUniqueInput | CardWhereUniqueInput[];
    delete?: CardWhereUniqueInput | CardWhereUniqueInput[];
    connect?: CardWhereUniqueInput | CardWhereUniqueInput[];
    update?:
      | CardUpdateWithWhereUniqueWithoutUserInput
      | CardUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | CardUpdateManyWithWhereWithoutUserInput
      | CardUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: CardScalarWhereInput | CardScalarWhereInput[];
  };

  export type UserCreateNestedOneWithoutCardsInput = {
    create?: XOR<
      UserCreateWithoutCardsInput,
      UserUncheckedCreateWithoutCardsInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutCardsInput;
    connect?: UserWhereUniqueInput;
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type UserUpdateOneRequiredWithoutCardsNestedInput = {
    create?: XOR<
      UserCreateWithoutCardsInput,
      UserUncheckedCreateWithoutCardsInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutCardsInput;
    upsert?: UserUpsertWithoutCardsInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<
        UserUpdateToOneWithWhereWithoutCardsInput,
        UserUpdateWithoutCardsInput
      >,
      UserUncheckedUpdateWithoutCardsInput
    >;
  };

  export type ApartmentListCreateNestedOneWithoutApartmentsInput = {
    create?: XOR<
      ApartmentListCreateWithoutApartmentsInput,
      ApartmentListUncheckedCreateWithoutApartmentsInput
    >;
    connectOrCreate?: ApartmentListCreateOrConnectWithoutApartmentsInput;
    connect?: ApartmentListWhereUniqueInput;
  };

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
  };

  export type ApartmentListUpdateOneRequiredWithoutApartmentsNestedInput = {
    create?: XOR<
      ApartmentListCreateWithoutApartmentsInput,
      ApartmentListUncheckedCreateWithoutApartmentsInput
    >;
    connectOrCreate?: ApartmentListCreateOrConnectWithoutApartmentsInput;
    upsert?: ApartmentListUpsertWithoutApartmentsInput;
    connect?: ApartmentListWhereUniqueInput;
    update?: XOR<
      XOR<
        ApartmentListUpdateToOneWithWhereWithoutApartmentsInput,
        ApartmentListUpdateWithoutApartmentsInput
      >,
      ApartmentListUncheckedUpdateWithoutApartmentsInput
    >;
  };

  export type ApartmentCreateNestedManyWithoutApartmentListInput = {
    create?:
      | XOR<
          ApartmentCreateWithoutApartmentListInput,
          ApartmentUncheckedCreateWithoutApartmentListInput
        >
      | ApartmentCreateWithoutApartmentListInput[]
      | ApartmentUncheckedCreateWithoutApartmentListInput[];
    connectOrCreate?:
      | ApartmentCreateOrConnectWithoutApartmentListInput
      | ApartmentCreateOrConnectWithoutApartmentListInput[];
    createMany?: ApartmentCreateManyApartmentListInputEnvelope;
    connect?: ApartmentWhereUniqueInput | ApartmentWhereUniqueInput[];
  };

  export type ApartmentUncheckedCreateNestedManyWithoutApartmentListInput = {
    create?:
      | XOR<
          ApartmentCreateWithoutApartmentListInput,
          ApartmentUncheckedCreateWithoutApartmentListInput
        >
      | ApartmentCreateWithoutApartmentListInput[]
      | ApartmentUncheckedCreateWithoutApartmentListInput[];
    connectOrCreate?:
      | ApartmentCreateOrConnectWithoutApartmentListInput
      | ApartmentCreateOrConnectWithoutApartmentListInput[];
    createMany?: ApartmentCreateManyApartmentListInputEnvelope;
    connect?: ApartmentWhereUniqueInput | ApartmentWhereUniqueInput[];
  };

  export type ApartmentUpdateManyWithoutApartmentListNestedInput = {
    create?:
      | XOR<
          ApartmentCreateWithoutApartmentListInput,
          ApartmentUncheckedCreateWithoutApartmentListInput
        >
      | ApartmentCreateWithoutApartmentListInput[]
      | ApartmentUncheckedCreateWithoutApartmentListInput[];
    connectOrCreate?:
      | ApartmentCreateOrConnectWithoutApartmentListInput
      | ApartmentCreateOrConnectWithoutApartmentListInput[];
    upsert?:
      | ApartmentUpsertWithWhereUniqueWithoutApartmentListInput
      | ApartmentUpsertWithWhereUniqueWithoutApartmentListInput[];
    createMany?: ApartmentCreateManyApartmentListInputEnvelope;
    set?: ApartmentWhereUniqueInput | ApartmentWhereUniqueInput[];
    disconnect?: ApartmentWhereUniqueInput | ApartmentWhereUniqueInput[];
    delete?: ApartmentWhereUniqueInput | ApartmentWhereUniqueInput[];
    connect?: ApartmentWhereUniqueInput | ApartmentWhereUniqueInput[];
    update?:
      | ApartmentUpdateWithWhereUniqueWithoutApartmentListInput
      | ApartmentUpdateWithWhereUniqueWithoutApartmentListInput[];
    updateMany?:
      | ApartmentUpdateManyWithWhereWithoutApartmentListInput
      | ApartmentUpdateManyWithWhereWithoutApartmentListInput[];
    deleteMany?: ApartmentScalarWhereInput | ApartmentScalarWhereInput[];
  };

  export type ApartmentUncheckedUpdateManyWithoutApartmentListNestedInput = {
    create?:
      | XOR<
          ApartmentCreateWithoutApartmentListInput,
          ApartmentUncheckedCreateWithoutApartmentListInput
        >
      | ApartmentCreateWithoutApartmentListInput[]
      | ApartmentUncheckedCreateWithoutApartmentListInput[];
    connectOrCreate?:
      | ApartmentCreateOrConnectWithoutApartmentListInput
      | ApartmentCreateOrConnectWithoutApartmentListInput[];
    upsert?:
      | ApartmentUpsertWithWhereUniqueWithoutApartmentListInput
      | ApartmentUpsertWithWhereUniqueWithoutApartmentListInput[];
    createMany?: ApartmentCreateManyApartmentListInputEnvelope;
    set?: ApartmentWhereUniqueInput | ApartmentWhereUniqueInput[];
    disconnect?: ApartmentWhereUniqueInput | ApartmentWhereUniqueInput[];
    delete?: ApartmentWhereUniqueInput | ApartmentWhereUniqueInput[];
    connect?: ApartmentWhereUniqueInput | ApartmentWhereUniqueInput[];
    update?:
      | ApartmentUpdateWithWhereUniqueWithoutApartmentListInput
      | ApartmentUpdateWithWhereUniqueWithoutApartmentListInput[];
    updateMany?:
      | ApartmentUpdateManyWithWhereWithoutApartmentListInput
      | ApartmentUpdateManyWithWhereWithoutApartmentListInput[];
    deleteMany?: ApartmentScalarWhereInput | ApartmentScalarWhereInput[];
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatFilter<$PrismaModel> | number;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> =
    {
      equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
      in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
      notIn?:
        | Date[]
        | string[]
        | ListDateTimeFieldRefInput<$PrismaModel>
        | null;
      lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      not?:
        | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
        | Date
        | string
        | null;
      _count?: NestedIntNullableFilter<$PrismaModel>;
      _min?: NestedDateTimeNullableFilter<$PrismaModel>;
      _max?: NestedDateTimeNullableFilter<$PrismaModel>;
    };

  export type CardCreateWithoutUserInput = {
    id?: string;
    word: string;
    translation: string;
    remembered?: boolean;
    createdAt?: Date | string;
  };

  export type CardUncheckedCreateWithoutUserInput = {
    id?: string;
    word: string;
    translation: string;
    remembered?: boolean;
    createdAt?: Date | string;
  };

  export type CardCreateOrConnectWithoutUserInput = {
    where: CardWhereUniqueInput;
    create: XOR<
      CardCreateWithoutUserInput,
      CardUncheckedCreateWithoutUserInput
    >;
  };

  export type CardCreateManyUserInputEnvelope = {
    data: CardCreateManyUserInput | CardCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type CardUpsertWithWhereUniqueWithoutUserInput = {
    where: CardWhereUniqueInput;
    update: XOR<
      CardUpdateWithoutUserInput,
      CardUncheckedUpdateWithoutUserInput
    >;
    create: XOR<
      CardCreateWithoutUserInput,
      CardUncheckedCreateWithoutUserInput
    >;
  };

  export type CardUpdateWithWhereUniqueWithoutUserInput = {
    where: CardWhereUniqueInput;
    data: XOR<CardUpdateWithoutUserInput, CardUncheckedUpdateWithoutUserInput>;
  };

  export type CardUpdateManyWithWhereWithoutUserInput = {
    where: CardScalarWhereInput;
    data: XOR<
      CardUpdateManyMutationInput,
      CardUncheckedUpdateManyWithoutUserInput
    >;
  };

  export type CardScalarWhereInput = {
    AND?: CardScalarWhereInput | CardScalarWhereInput[];
    OR?: CardScalarWhereInput[];
    NOT?: CardScalarWhereInput | CardScalarWhereInput[];
    id?: StringFilter<"Card"> | string;
    word?: StringFilter<"Card"> | string;
    translation?: StringFilter<"Card"> | string;
    remembered?: BoolFilter<"Card"> | boolean;
    createdAt?: DateTimeFilter<"Card"> | Date | string;
    userId?: StringFilter<"Card"> | string;
  };

  export type UserCreateWithoutCardsInput = {
    id?: string;
    email: string;
    name?: string | null;
  };

  export type UserUncheckedCreateWithoutCardsInput = {
    id?: string;
    email: string;
    name?: string | null;
  };

  export type UserCreateOrConnectWithoutCardsInput = {
    where: UserWhereUniqueInput;
    create: XOR<
      UserCreateWithoutCardsInput,
      UserUncheckedCreateWithoutCardsInput
    >;
  };

  export type UserUpsertWithoutCardsInput = {
    update: XOR<
      UserUpdateWithoutCardsInput,
      UserUncheckedUpdateWithoutCardsInput
    >;
    create: XOR<
      UserCreateWithoutCardsInput,
      UserUncheckedCreateWithoutCardsInput
    >;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutCardsInput = {
    where?: UserWhereInput;
    data: XOR<
      UserUpdateWithoutCardsInput,
      UserUncheckedUpdateWithoutCardsInput
    >;
  };

  export type UserUpdateWithoutCardsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
  };

  export type UserUncheckedUpdateWithoutCardsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
  };

  export type ApartmentListCreateWithoutApartmentsInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ApartmentListUncheckedCreateWithoutApartmentsInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ApartmentListCreateOrConnectWithoutApartmentsInput = {
    where: ApartmentListWhereUniqueInput;
    create: XOR<
      ApartmentListCreateWithoutApartmentsInput,
      ApartmentListUncheckedCreateWithoutApartmentsInput
    >;
  };

  export type ApartmentListUpsertWithoutApartmentsInput = {
    update: XOR<
      ApartmentListUpdateWithoutApartmentsInput,
      ApartmentListUncheckedUpdateWithoutApartmentsInput
    >;
    create: XOR<
      ApartmentListCreateWithoutApartmentsInput,
      ApartmentListUncheckedCreateWithoutApartmentsInput
    >;
    where?: ApartmentListWhereInput;
  };

  export type ApartmentListUpdateToOneWithWhereWithoutApartmentsInput = {
    where?: ApartmentListWhereInput;
    data: XOR<
      ApartmentListUpdateWithoutApartmentsInput,
      ApartmentListUncheckedUpdateWithoutApartmentsInput
    >;
  };

  export type ApartmentListUpdateWithoutApartmentsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ApartmentListUncheckedUpdateWithoutApartmentsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ApartmentCreateWithoutApartmentListInput = {
    id?: string;
    name: string;
    startDate: Date | string;
    endDate?: Date | string | null;
  };

  export type ApartmentUncheckedCreateWithoutApartmentListInput = {
    id?: string;
    name: string;
    startDate: Date | string;
    endDate?: Date | string | null;
  };

  export type ApartmentCreateOrConnectWithoutApartmentListInput = {
    where: ApartmentWhereUniqueInput;
    create: XOR<
      ApartmentCreateWithoutApartmentListInput,
      ApartmentUncheckedCreateWithoutApartmentListInput
    >;
  };

  export type ApartmentCreateManyApartmentListInputEnvelope = {
    data:
      | ApartmentCreateManyApartmentListInput
      | ApartmentCreateManyApartmentListInput[];
    skipDuplicates?: boolean;
  };

  export type ApartmentUpsertWithWhereUniqueWithoutApartmentListInput = {
    where: ApartmentWhereUniqueInput;
    update: XOR<
      ApartmentUpdateWithoutApartmentListInput,
      ApartmentUncheckedUpdateWithoutApartmentListInput
    >;
    create: XOR<
      ApartmentCreateWithoutApartmentListInput,
      ApartmentUncheckedCreateWithoutApartmentListInput
    >;
  };

  export type ApartmentUpdateWithWhereUniqueWithoutApartmentListInput = {
    where: ApartmentWhereUniqueInput;
    data: XOR<
      ApartmentUpdateWithoutApartmentListInput,
      ApartmentUncheckedUpdateWithoutApartmentListInput
    >;
  };

  export type ApartmentUpdateManyWithWhereWithoutApartmentListInput = {
    where: ApartmentScalarWhereInput;
    data: XOR<
      ApartmentUpdateManyMutationInput,
      ApartmentUncheckedUpdateManyWithoutApartmentListInput
    >;
  };

  export type ApartmentScalarWhereInput = {
    AND?: ApartmentScalarWhereInput | ApartmentScalarWhereInput[];
    OR?: ApartmentScalarWhereInput[];
    NOT?: ApartmentScalarWhereInput | ApartmentScalarWhereInput[];
    id?: StringFilter<"Apartment"> | string;
    name?: StringFilter<"Apartment"> | string;
    startDate?: DateTimeFilter<"Apartment"> | Date | string;
    endDate?: DateTimeNullableFilter<"Apartment"> | Date | string | null;
    apartmentListId?: StringFilter<"Apartment"> | string;
  };

  export type CardCreateManyUserInput = {
    id?: string;
    word: string;
    translation: string;
    remembered?: boolean;
    createdAt?: Date | string;
  };

  export type CardUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    word?: StringFieldUpdateOperationsInput | string;
    translation?: StringFieldUpdateOperationsInput | string;
    remembered?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type CardUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    word?: StringFieldUpdateOperationsInput | string;
    translation?: StringFieldUpdateOperationsInput | string;
    remembered?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type CardUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    word?: StringFieldUpdateOperationsInput | string;
    translation?: StringFieldUpdateOperationsInput | string;
    remembered?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ApartmentCreateManyApartmentListInput = {
    id?: string;
    name: string;
    startDate: Date | string;
    endDate?: Date | string | null;
  };

  export type ApartmentUpdateWithoutApartmentListInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  };

  export type ApartmentUncheckedUpdateWithoutApartmentListInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  };

  export type ApartmentUncheckedUpdateManyWithoutApartmentListInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  };

  /**
   * Aliases for legacy arg types
   */
  /**
   * @deprecated Use UserCountOutputTypeDefaultArgs instead
   */
  export type UserCountOutputTypeArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = UserCountOutputTypeDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use ApartmentListCountOutputTypeDefaultArgs instead
   */
  export type ApartmentListCountOutputTypeArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = ApartmentListCountOutputTypeDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use PokemonDefaultArgs instead
   */
  export type PokemonArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = PokemonDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use UserDefaultArgs instead
   */
  export type UserArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = UserDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use CardDefaultArgs instead
   */
  export type CardArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = CardDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use ApartmentDefaultArgs instead
   */
  export type ApartmentArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = ApartmentDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use ApartmentListDefaultArgs instead
   */
  export type ApartmentListArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = ApartmentListDefaultArgs<ExtArgs>;

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
