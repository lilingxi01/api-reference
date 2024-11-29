import { OpenAPIV3_1 } from "openapi-types";
import { z } from "zod";

export enum RouteMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
  HEAD = "head",
}

export enum ContentType {
  JSON = "application/json",
  URLENCODED = "application/x-www-form-urlencoded",
  MULTIPART = "multipart/form-data",
}

export type RouteAuthorization = {};

export type RouteParameterSchema =
  | {
      type: "array";
      items: RouteParameterSchema;
    }
  | {
      type: "object";
      properties: Record<string, RouteParameter>;
    }
  | {
      type: "string";
      minLength?: number;
      maxLength?: number;
      pattern?: string;
    }
  | {
      type: "number" | "integer";
      minimum?: number;
      maximum?: number;
      exclusiveMinimum?: number;
      exclusiveMaximum?: number;
    }
  | {
      type: "boolean";
    }
  | {
      type: "null";
    }
  | {
      type: "never";
    };

export type RouteParameter = {
  title?: string;
  name: string;
  description?: string;
  required?: boolean;
  schema?: RouteParameterSchema;
};

export type Route = {
  id?: string;
  domainURLs?: string[];
  path: string;
  title: string;
  description?: string;
  tags: string[][];
  method: RouteMethod;
  authorization?: RouteAuthorization;
  pathParams?: RouteParameter[];
  queryParams?: RouteParameter[];
  contentType?: ContentType;
  body?: RouteParameter[];
  headers?: RouteParameter[];
  response: {
    [status: number]: {
      contentType: ContentType;
      body?: RouteParameter[];
      headers?: RouteParameter[];
    };
  };
};

export type APIReferenceCore = {
  routes: Route[];
  domainURLs?: string[];
  authorization?: RouteAuthorization;
};
