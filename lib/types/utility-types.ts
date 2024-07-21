export type OptionalKeys<T> = {
    [K in keyof T]: {} extends Pick<T, K> ? K : never;
}[keyof T];

export type OptionalOnly<T extends Record<string, unknown>> = Pick<
    T,
    OptionalKeys<T>
>;

export type Defaults<T extends Record<string, unknown>> = Required<
    OptionalOnly<T>
>;

type SchemaObject = {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
};

type SchemaString = {
    type: "string";
};

type SchemaBoolean = {
    type: "boolean";
};

type SchemaNumber = {
    type: "number";
};

type UnionElement = { const: string };

type SchemaUnion = {
    oneOf: Array<UnionElement>;
};

type ToUnion<T extends SchemaUnion> = T["oneOf"][number]["const"];

type InferProperties<T extends SchemaObject["properties"]> = {
    [K in keyof T]: T[K] extends SchemaObject
        ? Prettify<InferSchema<T[K]>>
        : T[K] extends SchemaString
        ? string
        : T[K] extends SchemaNumber
        ? number
        : T[K] extends SchemaBoolean
        ? boolean
        : T[K] extends SchemaUnion
        ? ToUnion<T[K]>
        : T[K];
};

type SetOptional<T, K extends keyof T> = Omit<T, K> & {
    [P in K]?: T[P];
};

type A<T extends Record<string, unknown>> = keyof T;

export type InferSchema<T extends Record<string, unknown>> =
    T extends SchemaObject
        ? T["required"] extends string[]
            ? T["required"][number] extends keyof T["properties"]
                ? Prettify<
                      SetOptional<
                          InferProperties<T["properties"]>,
                          Exclude<
                              keyof InferProperties<T["properties"]> & string,
                              T["required"][number]
                          >
                      >
                  >
                : Prettify<InferProperties<T["properties"]>>
            : Prettify<InferProperties<T["properties"]>>
        : never;

type Mutable<T> = {
    -readonly [K in keyof T]: T[K] extends Record<string, unknown>
        ? Prettify<Mutable<T[K]>>
        : T[K] extends readonly unknown[]
        ? [...T[K]]
        : T[K];
};

type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

export type Infer<T extends Record<string, unknown>> = InferSchema<Mutable<T>>;
