import { z } from "zod";

/**
 * Reference Object
 * @see https://spec.openapis.org/oas/v3.1.0#reference-object
 */
export const ReferenceObjectSchema = z.object({
  $ref: z.string(),
  summary: z.string().optional(),
  description: z.string().optional(),
});
export type ReferenceObject = z.infer<typeof ReferenceObjectSchema>;

/**
 * Schema Object
 * @see https://spec.openapis.org/oas/v3.1.0#schema-object
 */
const SchemaObjectSchema = z.lazy(() =>
  z.union([
    z
      .object({
        $id: z.string().optional(),
        $schema: z.string().optional(),
        $ref: z.string().optional(),
        type: z.union([z.string(), z.array(z.string())]).optional(),
        properties: z.record(z.string(), SchemaObjectSchema).optional(),
        items: z
          .union([SchemaObjectSchema, z.array(SchemaObjectSchema)])
          .optional(),
        required: z.array(z.string()).optional(),
        enum: z.array(z.any()).optional(),
        allOf: z.array(SchemaObjectSchema).optional(),
        oneOf: z.array(SchemaObjectSchema).optional(),
        anyOf: z.array(SchemaObjectSchema).optional(),
        not: SchemaObjectSchema.optional(),
        additionalProperties: z
          .union([z.boolean(), SchemaObjectSchema])
          .optional(),
        description: z.string().optional(),
        format: z.string().optional(),
        discriminator: DiscriminatorObjectSchema.optional(),
        xml: XMLObjectSchema.optional(),
        // Include other JSON Schema fields as needed
      })
      .catchall(z.any()),
    ReferenceObjectSchema,
  ]),
);
type SchemaObject = z.infer<typeof SchemaObjectSchema>;

/**
 * Discriminator Object
 * @see https://spec.openapis.org/oas/v3.1.0#discriminator-object
 */
const DiscriminatorObjectSchema = z.object({
  propertyName: z.string(),
  mapping: z.record(z.string()).optional(),
});

/**
 * XML Object
 * @see https://spec.openapis.org/oas/v3.1.0#xml-object
 */
const XMLObjectSchema = z.object({
  name: z.string().optional(),
  namespace: z.string().optional(),
  prefix: z.string().optional(),
  attribute: z.boolean().optional(),
  wrapped: z.boolean().optional(),
});

/**
 * External Documentation Object
 * @see https://spec.openapis.org/oas/v3.1.0#external-documentation-object
 */
const ExternalDocumentationObjectSchema = z.object({
  description: z.string().optional(),
  url: z.string().url(),
});

/**
 * Example Object
 * @see https://spec.openapis.org/oas/v3.1.0#example-object
 */
const ExampleObjectSchema = z.object({
  summary: z.string().optional(),
  description: z.string().optional(),
  value: z.any().optional(),
  externalValue: z.string().url().optional(),
});

/**
 * Media Type Object
 * @see https://spec.openapis.org/oas/v3.1.0#media-type-object
 */
const MediaTypeObjectSchema = z.object({
  schema: SchemaObjectSchema.optional(),
  example: z.any().optional(),
  examples: z
    .record(z.string(), z.union([ExampleObjectSchema, ReferenceObjectSchema]))
    .optional(),
  encoding: z.record(z.string(), z.any()).optional(), // Define Encoding Object if needed
});

/**
 * Header Object
 * @see https://spec.openapis.org/oas/v3.1.0#header-object
 */
const HeaderObjectSchema = z.union([
  z.object({
    description: z.string().optional(),
    required: z.boolean().optional(),
    deprecated: z.boolean().optional(),
    style: z.string().optional(),
    explode: z.boolean().optional(),
    allowReserved: z.boolean().optional(),
    schema: SchemaObjectSchema.optional(),
    example: z.any().optional(),
    examples: z
      .record(z.string(), z.union([ExampleObjectSchema, ReferenceObjectSchema]))
      .optional(),
    content: z.record(z.string(), MediaTypeObjectSchema).optional(),
  }),
  ReferenceObjectSchema,
]);

/**
 * Parameter Object
 * @see https://spec.openapis.org/oas/v3.1.0#parameter-object
 */
const NonReferencedParameterObjectSchema = z.object({
  name: z.string(),
  in: z.enum(["query", "header", "path", "cookie"]),
  description: z.string().optional(),
  required: z.boolean().optional(),
  deprecated: z.boolean().optional(),
  allowEmptyValue: z.boolean().optional(),
  style: z.string().optional(),
  explode: z.boolean().optional(),
  allowReserved: z.boolean().optional(),
  schema: SchemaObjectSchema.optional(),
  example: z.any().optional(),
  examples: z
    .record(z.string(), z.union([ExampleObjectSchema, ReferenceObjectSchema]))
    .optional(),
  content: z.record(z.string(), MediaTypeObjectSchema).optional(),
});
type NonReferencedParameterObject = z.infer<
  typeof NonReferencedParameterObjectSchema
>;
const ParameterObjectSchema = z.union([
  NonReferencedParameterObjectSchema,
  ReferenceObjectSchema,
]);
type ParameterObject = z.infer<typeof ParameterObjectSchema>;

/**
 * Request Body Object
 * @see https://spec.openapis.org/oas/v3.1.0#request-body-object
 */
const RequestBodyObjectSchema = z.union([
  z.object({
    description: z.string().optional(),
    content: z.record(z.string(), MediaTypeObjectSchema),
    required: z.boolean().optional(),
  }),
  ReferenceObjectSchema,
]);

/**
 * Link Object
 * @see https://spec.openapis.org/oas/v3.1.0#link-object
 */
const LinkObjectSchema = z.union([
  z.object({
    operationRef: z.string().optional(),
    operationId: z.string().optional(),
    parameters: z.record(z.any()).optional(),
    requestBody: z.any().optional(),
    description: z.string().optional(),
    server: z.lazy(() => ServerObjectSchema).optional(),
  }),
  ReferenceObjectSchema,
]);

/**
 * Response Object
 * @see https://spec.openapis.org/oas/v3.1.0#response-object
 */
const ResponseObjectSchema = z.union([
  z.object({
    description: z.string(),
    headers: z
      .record(z.string(), z.union([HeaderObjectSchema, ReferenceObjectSchema]))
      .optional(),
    content: z.record(z.string(), MediaTypeObjectSchema).optional(),
    links: z
      .record(z.string(), z.union([LinkObjectSchema, ReferenceObjectSchema]))
      .optional(),
  }),
  ReferenceObjectSchema,
]);

/**
 * Security Requirement Object
 * @see https://spec.openapis.org/oas/v3.1.0#security-requirement-object
 */
const SecurityRequirementObjectSchema = z.record(z.array(z.string()));

/**
 * Server Variable Object
 * @see https://spec.openapis.org/oas/v3.1.0#server-variable-object
 */
const ServerVariableObjectSchema = z.object({
  enum: z.array(z.string()).optional(),
  default: z.string(),
  description: z.string().optional(),
});

/**
 * Server Object
 * @see https://spec.openapis.org/oas/v3.1.0#server-object
 */
const ServerObjectSchema = z.object({
  url: z.string(),
  description: z.string().optional(),
  variables: z.record(z.string(), ServerVariableObjectSchema).optional(),
});

/**
 * Callback Object
 * @see https://spec.openapis.org/oas/v3.1.0#callback-object
 */
export const CallbackObjectSchema = z.union([
  z.record(
    z.string(),
    z.lazy(() => PathItemObjectSchema),
  ),
  ReferenceObjectSchema,
]);
export type CallbackObject = z.infer<typeof CallbackObjectSchema>;

/**
 * Operation Object
 * @see https://spec.openapis.org/oas/v3.1.0#operation-object
 */
const OperationObjectBaseSchema = z.object({
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  externalDocs: ExternalDocumentationObjectSchema.optional(),
  operationId: z.string().optional(),
  parameters: z.array(ParameterObjectSchema).optional(),
  requestBody: RequestBodyObjectSchema.optional(),
  responses: z.record(z.string(), ResponseObjectSchema),
  deprecated: z.boolean().optional(),
  security: z.array(SecurityRequirementObjectSchema).optional(),
  servers: z.array(ServerObjectSchema).optional(),
});
type OperationObject = z.infer<typeof OperationObjectBaseSchema> & {
  callbacks?: Record<string, CallbackObject>;
};
const OperationObjectSchema: z.ZodSchema<OperationObject> =
  OperationObjectBaseSchema.extend({
    callbacks: z
      .record(
        z.string(),
        z.union([CallbackObjectSchema, ReferenceObjectSchema]),
      )
      .optional(),
  });

/**
 * Path Item Object
 * @see https://spec.openapis.org/oas/v3.1.0#path-item-object
 */
const NonReferencedPathItemObjectSchema = z.object({
  $ref: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  get: OperationObjectSchema.optional(),
  put: OperationObjectSchema.optional(),
  post: OperationObjectSchema.optional(),
  delete: OperationObjectSchema.optional(),
  options: OperationObjectSchema.optional(),
  head: OperationObjectSchema.optional(),
  patch: OperationObjectSchema.optional(),
  trace: OperationObjectSchema.optional(),
  servers: z.array(ServerObjectSchema).optional(),
  parameters: z.array(ParameterObjectSchema).optional(),
});
type NonReferencedPathItemObject = z.infer<
  typeof NonReferencedPathItemObjectSchema
>;
export const PathItemObjectSchema = z.union([
  NonReferencedPathItemObjectSchema,
  ReferenceObjectSchema,
]);
export type PathItemObject = z.infer<typeof PathItemObjectSchema>;

/**
 * Paths Object
 * @see https://spec.openapis.org/oas/v3.1.0#paths-object
 */
const PathsObjectSchema = z.record(z.string(), PathItemObjectSchema);

/**
 * Security Scheme Object
 * @see https://spec.openapis.org/oas/v3.1.0#security-scheme-object
 */
const SecuritySchemeObjectSchema = z.union([
  z.object({
    type: z.literal("apiKey"),
    name: z.string(),
    in: z.enum(["query", "header", "cookie"]),
    description: z.string().optional(),
  }),
  z.object({
    type: z.literal("http"),
    scheme: z.string(),
    bearerFormat: z.string().optional(),
    description: z.string().optional(),
  }),
  z.object({
    type: z.literal("mutualTLS"),
    description: z.string().optional(),
  }),
  z.object({
    type: z.literal("oauth2"),
    flows: z.any(), // Define OAuthFlows Object for detailed validation
    description: z.string().optional(),
  }),
  z.object({
    type: z.literal("openIdConnect"),
    openIdConnectUrl: z.string().url(),
    description: z.string().optional(),
  }),
]);

/**
 * Components Object
 * @see https://spec.openapis.org/oas/v3.1.0#components-object
 */
const ComponentsObjectSchema = z.object({
  schemas: z.record(z.string(), SchemaObjectSchema).optional(),
  responses: z
    .record(z.string(), z.union([ResponseObjectSchema, ReferenceObjectSchema]))
    .optional(),
  // TODO: Remove duplicate union types of ParameterObjectSchema
  parameters: z
    .record(z.string(), z.union([ParameterObjectSchema, ReferenceObjectSchema]))
    .optional(),
  examples: z
    .record(z.string(), z.union([ExampleObjectSchema, ReferenceObjectSchema]))
    .optional(),
  requestBodies: z
    .record(
      z.string(),
      z.union([RequestBodyObjectSchema, ReferenceObjectSchema]),
    )
    .optional(),
  headers: z
    .record(z.string(), z.union([HeaderObjectSchema, ReferenceObjectSchema]))
    .optional(),
  securitySchemes: z
    .record(
      z.string(),
      z.union([SecuritySchemeObjectSchema, ReferenceObjectSchema]),
    )
    .optional(),
  links: z
    .record(z.string(), z.union([LinkObjectSchema, ReferenceObjectSchema]))
    .optional(),
  callbacks: z
    .record(z.string(), z.union([CallbackObjectSchema, ReferenceObjectSchema]))
    .optional(),
  pathItems: z
    .record(z.string(), z.union([PathItemObjectSchema, ReferenceObjectSchema]))
    .optional(),
});
type ComponentsObject = z.infer<typeof ComponentsObjectSchema>;

/**
 * Contact Object
 * @see https://spec.openapis.org/oas/v3.1.0#contact-object
 */
const ContactObjectSchema = z.object({
  name: z.string().optional(),
  url: z.string().url().optional(),
  email: z.string().email().optional(),
});

/**
 * License Object
 * @see https://spec.openapis.org/oas/v3.1.0#license-object
 */
const LicenseObjectSchema = z.object({
  name: z.string(),
  identifier: z.string().optional(),
  url: z.string().url().optional(),
});

/**
 * Info Object
 * @see https://spec.openapis.org/oas/v3.1.0#info-object
 */
const InfoObjectSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  description: z.string().optional(),
  termsOfService: z.string().url().optional(),
  contact: ContactObjectSchema.optional(),
  license: LicenseObjectSchema.optional(),
  version: z.string(),
});

/**
 * Tag Object
 * @see https://spec.openapis.org/oas/v3.1.0#tag-object
 */
const TagObjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  externalDocs: ExternalDocumentationObjectSchema.optional(),
});

/**
 * OpenAPI Document
 *
 * Please note that this schema is not exhaustive and may need to be extended in the future based on our advanced use cases.
 * Right now, it fits perfectly for our current use case.
 *
 * @see https://spec.openapis.org/oas/v3.1.0#openapi-document
 */
export const OpenAPISpecSchema = z.object({
  openapi: z.string().regex(/^3\.1\.\d+$/),
  info: InfoObjectSchema,
  jsonSchemaDialect: z.string().url().optional(),
  servers: z.array(ServerObjectSchema).optional(),
  paths: PathsObjectSchema,
  webhooks: z.record(z.string(), PathItemObjectSchema).optional(),
  components: ComponentsObjectSchema.optional(),
  security: z.array(SecurityRequirementObjectSchema).optional(),
  tags: z.array(TagObjectSchema).optional(),
  externalDocs: ExternalDocumentationObjectSchema.optional(),
});

/**
 * OpenAPI Document Type
 *
 * This type is used to represent the OpenAPI document. You should use `OpenAPISpecSchema` for OpenAPI document validation.
 * Only use OpenAPI document after validation via `OpenAPISpecSchema`.
 */
export type OpenAPISpec = z.infer<typeof OpenAPISpecSchema>;
