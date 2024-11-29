import {
  APIReferenceCore,
  Route,
  RouteMethod,
  RouteParameter,
  RouteParameterSchema,
} from "@/types/core";
import { OpenAPIV3_1 } from "openapi-types";

function separateNestedTags(tags: string[]): string[][] {
  return tags.map((tag) => tag.split(" > "));
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

function schemaToRouteParameterSchema(
  deferredSchema: OpenAPIV3_1.SchemaObject,
  spec: OpenAPIV3_1.Document,
): RouteParameterSchema {
  // TODO: Handle union types
  if (!deferredSchema.type || Array.isArray(deferredSchema.type)) {
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
      properties: Object.fromEntries(
        Object.entries(deferredSchema.properties ?? {}).map(([key, value]) => {
          const deferredSchema = derefSchema(value, spec);
          return [
            key,
            {
              title: deferredSchema?.title ?? undefined,
              name: key,
              description: value.description ?? undefined,
              required: deferredSchema?.required?.includes(key) ?? false,
              schema: schemaToRouteParameterSchema(value, spec),
            },
          ] satisfies [string, RouteParameter];
        }),
      ),
    };
  } else {
    return {
      type: deferredSchema.type,
    };
  }
}

function parameterToRouteParameter(
  param: OpenAPIV3_1.ParameterObject,
  spec: OpenAPIV3_1.Document,
): RouteParameter {
  const deferredSchema = derefSchema(param.schema, spec);
  return {
    title: deferredSchema?.title ?? undefined,
    name: param.name,
    description: param.description,
    required: param.required,
    schema: deferredSchema
      ? schemaToRouteParameterSchema(deferredSchema, spec)
      : undefined,
  };
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
  operation.requestBody;
  return {
    id: operation.operationId,
    method: method,
    path: path,
    title: operation.summary ?? path,
    tags: operation.tags ? separateNestedTags(operation.tags) : [],
    pathParams: pathParams.map((param) =>
      parameterToRouteParameter(param, spec),
    ),
    queryParams: queryParams.map((param) =>
      parameterToRouteParameter(param, spec),
    ),
    // TODO: Handle request body
    // TODO: Handle responses
    response: {},
  };
}

export function transformOpenAPISpec(
  spec: OpenAPIV3_1.Document,
): APIReferenceCore {
  const serverURLs = spec.servers?.map((server) => server.url);
  const domainURLs: [string, ...string[]] =
    serverURLs && serverURLs.length > 0
      ? [serverURLs[0], ...serverURLs.slice(1)]
      : [""];

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
  }

  return {
    domainURLs,
    routes,
  };
}
