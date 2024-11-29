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
      properties: RouteParameters;
    }
  | {
      type: "file";
    }
  | {
      type: "string";
      // "uuid" | "date" | "date-time" | "password" | "byte" | "textarea"
      format?: string;
      minLength?: number;
      maxLength?: number;
      pattern?: string;
    }
  | {
      type: "number" | "integer";
      // "double" | "float" | "int32" | "int64"
      format?: string;
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
  description?: string;
  required?: boolean;
  schema?: RouteParameterSchema;
};

export type RouteParameters = {
  [key: string]: RouteParameter;
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
  pathParams?: RouteParameters;
  queryParams?: RouteParameters;
  contentType?: ContentType;
  body?: RouteParameters;
  headers?: RouteParameters;
  response: {
    [status: number]: {
      contentType: ContentType;
      body?: RouteParameters;
      headers?: RouteParameters;
    };
  };
};

export type APIReferenceCore = {
  routes: Route[];
  domainURLs?: string[];
  authorization?: RouteAuthorization;
};
