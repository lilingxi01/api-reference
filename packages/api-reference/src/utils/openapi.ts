import {
  APIReferenceCore,
  ContentType,
  Route,
  RouteMethod,
  RouteParameter,
  RouteParameters,
  RouteParameterSchema,
  RouteResponse,
} from "@/types/core";
import { fallbackToUndefined, removeUndefinedFields } from "@/utils/clean";
import { OpenAPIV3_1 } from "openapi-types";

function separateNestedTags(tags: string[]): string[][] {
  return tags.map((tag) => tag.split(" > "));
}

function derefRequestBody(
  requestBody: OpenAPIV3_1.RequestBodyObject | OpenAPIV3_1.ReferenceObject,
  spec: OpenAPIV3_1.Document,
): OpenAPIV3_1.RequestBodyObject | null {
  if ("$ref" in requestBody) {
    const refName = requestBody.$ref.replace("#/components/requestBodies/", "");
    const refRequestBody = spec.components?.requestBodies?.[refName];
    if (refRequestBody && "$ref" in refRequestBody) {
      return derefRequestBody(refRequestBody, spec);
    }
    return refRequestBody ?? null;
  }
  return requestBody;
}

function derefSchema(
  schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined,
  spec: OpenAPIV3_1.Document,
): OpenAPIV3_1.SchemaObject | null {
  if (!schema) {
    return null;
  }
  if (!("$ref" in schema)) {
    return schema;
  }
  const refName = schema.$ref.replace("#/components/schemas/", "");
  const refSchema = spec.components?.schemas?.[refName];
  if (!refSchema) {
    return null;
  }
  return refSchema;
}

function derefParameter(
  ref: string,
  spec: OpenAPIV3_1.Document,
): OpenAPIV3_1.ParameterObject | null {
  const refName = ref.replace("#/components/parameters/", "");
  const param = spec.components?.parameters?.[refName];
  if (!param) {
    return null;
  }
  if ("$ref" in param) {
    return derefParameter(param.$ref, spec);
  }
  return param || null;
}

function derefParameters(
  params:
    | (OpenAPIV3_1.ParameterObject | OpenAPIV3_1.ReferenceObject)[]
    | undefined,
  spec: OpenAPIV3_1.Document,
): OpenAPIV3_1.ParameterObject[] {
  return (params || [])
    .map((param) => {
      if ("$ref" in param) {
        return derefParameter(param.$ref, spec);
      }
      return param;
    })
    .filter((param): param is OpenAPIV3_1.ParameterObject => param !== null);
}

function derefResponse(
  response: OpenAPIV3_1.ResponseObject | OpenAPIV3_1.ReferenceObject,
  spec: OpenAPIV3_1.Document,
): OpenAPIV3_1.ResponseObject | null {
  if ("$ref" in response) {
    const refName = response.$ref.replace("#/components/responses/", "");
    const refResponse = spec.components?.responses?.[refName];
    if (!refResponse) {
      return null;
    }
    if ("$ref" in refResponse) {
      return derefResponse(refResponse, spec);
    }
    return refResponse;
  }
  return response;
}

function schemaToRouteParameters(
  schema: OpenAPIV3_1.SchemaObject,
  spec: OpenAPIV3_1.Document,
): RouteParameters {
  const deferredSchema = derefSchema(schema, spec);
  if (!deferredSchema) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(deferredSchema.properties ?? {}).map(([key, value]) => {
      const deferredSchema = derefSchema(value, spec);
      return [
        key,
        {
          title: deferredSchema?.title ?? undefined,
          description: value.description ?? undefined,
          required: fallbackToUndefined(
            deferredSchema?.required?.includes(key),
          ),
          ...schemaToRouteParameterSchema(value, spec),
        },
      ] satisfies [string, RouteParameter];
    }),
  );
}

function schemaToRouteParameterSchema(
  schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
  spec: OpenAPIV3_1.Document,
): RouteParameterSchema {
  const deferredSchema = derefSchema(schema, spec);
  // TODO: Handle union types
  if (
    !deferredSchema ||
    !deferredSchema.type ||
    Array.isArray(deferredSchema.type)
  ) {
    return {
      type: "never",
    };
  }
  if (deferredSchema.type === "array") {
    return {
      type: "array",
      items: schemaToRouteParameterSchema(deferredSchema.items, spec),
    };
  } else if (deferredSchema.type === "object") {
    return {
      type: "object",
      properties: schemaToRouteParameters(deferredSchema, spec),
    };
  } else {
    switch (deferredSchema.type) {
      case "string":
        if (deferredSchema.format === "binary") {
          return {
            type: "file",
          };
        }
        return {
          type: "string",
          format: deferredSchema.format,
          default: deferredSchema.default,
        };
      case "number":
      case "integer":
        return {
          type: deferredSchema.type,
          format: deferredSchema.format,
          minimum: deferredSchema.minimum,
          maximum: deferredSchema.maximum,
          default: deferredSchema.default,
        };
      default:
        return {
          type: deferredSchema.type,
        };
    }
  }
}

function parametersToRouteParameters(
  params: OpenAPIV3_1.ParameterObject[],
  spec: OpenAPIV3_1.Document,
): RouteParameters {
  return Object.fromEntries(
    params.map((param) => {
      const deferredSchema = derefSchema(param.schema, spec);
      return [
        param.name,
        {
          title: deferredSchema?.title ?? undefined,
          description: param.description,
          required: fallbackToUndefined(param.required),
          ...(deferredSchema
            ? schemaToRouteParameterSchema(deferredSchema, spec)
            : {
                type: "never",
              }),
        },
      ] satisfies [string, RouteParameter];
    }),
  );
}

function transformRequestBody(
  requestBody:
    | OpenAPIV3_1.RequestBodyObject
    | OpenAPIV3_1.ReferenceObject
    | undefined,
  spec: OpenAPIV3_1.Document,
): {
  content: RouteParameterSchema;
  contentType?: ContentType;
} | null {
  if (!requestBody) {
    return null;
  }
  const deferredRequestBody = derefRequestBody(requestBody, spec);
  if (!deferredRequestBody) {
    return null;
  }
  const rawContentType = Object.keys(deferredRequestBody.content ?? {})[0];
  const rawSchema = deferredRequestBody.content?.[rawContentType]?.schema;
  const deferredSchema = derefSchema(rawSchema, spec);
  const contentType = contentTypeToEnum(rawContentType);
  if (!deferredSchema) {
    return null;
  }
  return {
    content: schemaToRouteParameterSchema(deferredSchema, spec),
    contentType: contentType,
  };
}

function contentTypeToEnum(contentType: string): ContentType {
  switch (contentType) {
    case "application/json":
      return ContentType.JSON;
    case "application/x-www-form-urlencoded":
      return ContentType.URLENCODED;
    case "multipart/form-data":
      return ContentType.MULTIPART;
    default:
      return ContentType.JSON;
  }
}

function transformResponses(
  responses: OpenAPIV3_1.ResponsesObject | undefined,
  spec: OpenAPIV3_1.Document,
): {
  [key: string]: RouteResponse;
} {
  if (!responses) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(responses).map(([statusCodeText, response]) => {
      const statusCodeNumber = isNaN(parseInt(statusCodeText))
        ? 500
        : parseInt(statusCodeText);
      const deferredResponse = derefResponse(response, spec);
      const contentType = Object.keys(deferredResponse?.content ?? {})[0];
      const schema = deferredResponse?.content?.[contentType]?.schema;
      const deferredSchema = derefSchema(schema, spec);
      return [
        statusCodeNumber,
        {
          contentType: contentTypeToEnum(contentType),
          description: deferredResponse?.description,
          body: deferredSchema
            ? schemaToRouteParameterSchema(deferredSchema, spec)
            : undefined,
        },
      ] satisfies [number, RouteResponse];
    }),
  );
}

function handlePathItem(params: {
  path: string;
  method: RouteMethod;
  operation: OpenAPIV3_1.OperationObject;
  spec: OpenAPIV3_1.Document;
}): Route {
  const { path, method, operation, spec } = params;
  const derefParams = derefParameters(operation.parameters, spec);
  const pathParams = derefParams.filter((param) => param.in === "path");
  const queryParams = derefParams.filter((param) => param.in === "query");
  const bodyParams = transformRequestBody(operation.requestBody, spec);
  return {
    id: operation.operationId,
    method: method,
    path: path,
    title: operation.summary ?? path,
    tags: operation.tags ? separateNestedTags(operation.tags) : [],
    pathParams: fallbackToUndefined(
      parametersToRouteParameters(pathParams, spec),
    ),
    queryParams: fallbackToUndefined(
      parametersToRouteParameters(queryParams, spec),
    ),
    contentType: bodyParams?.contentType,
    body: fallbackToUndefined(bodyParams?.content),
    responses: transformResponses(operation.responses, spec),
  };
}

export function transformOpenAPISpec(
  spec: OpenAPIV3_1.Document,
): APIReferenceCore {
  const routes: Route[] = [];
  for (const path in spec.paths) {
    const pathItem = spec.paths[path];
    if (!pathItem) {
      continue;
    }
    if ("get" in pathItem && pathItem.get) {
      routes.push(
        handlePathItem({
          path: path,
          method: RouteMethod.GET,
          operation: pathItem.get,
          spec: spec,
        }),
      );
    }
    if ("post" in pathItem && pathItem.post) {
      routes.push(
        handlePathItem({
          path: path,
          method: RouteMethod.POST,
          operation: pathItem.post,
          spec: spec,
        }),
      );
    }
  }

  const cleanedSpec = removeUndefinedFields({
    domainURLs: spec.servers?.map((server) => server.url),
    routes,
  });

  if (!cleanedSpec) {
    throw new Error("No API reference data found in the OpenAPI spec");
  }

  return cleanedSpec;
}
