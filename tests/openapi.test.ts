import { describe, test, expect } from "@jest/globals";
import {
  transformOpenAPISpec,
  APIReferenceCore,
  ContentType,
  RouteMethod,
} from "api-reference";
import { OpenAPIV3_1 } from "openapi-types";

describe("GET request transformation", () => {
  const exampleSpec: OpenAPIV3_1.Document = {
    openapi: "3.1.0",
    info: {
      title: "Test API",
      version: "0.1.0",
    },
    paths: {
      "/users": {
        get: {
          tags: ["Users"],
          summary: "List Users",
          description: "List all users.",
          operationId: "list_users_users_get",
          parameters: [
            {
              name: "limit",
              in: "query",
              description: "Maximum number of users to return",
              required: false,
              schema: {
                type: "integer",
                description: "Maximum number of users to return",
                maximum: 50,
                minimum: 1,
                default: 50,
                title: "Limit",
              },
            },
            {
              name: "cursor",
              in: "query",
              description:
                "Cursor from the previous call to list users, used to retrieve the next set of results",
              required: false,
              schema: {
                type: "string",
                description:
                  "Cursor from the previous call to list users, used to retrieve the next set of results",
                title: "Cursor",
              },
            },
          ],
          responses: {
            "200": {
              description: "Successful Response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/GetUsersResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/users/{user_id}": {
        get: {
          tags: ["Users"],
          summary: "Get User",
          description: "Get the details of a given user.",
          operationId: "get_user_users__user_id__get",
          parameters: [
            {
              name: "user_id",
              in: "path",
              description: "User ID of the user to get details of",
              required: true,
              schema: {
                type: "string",
                description: "User ID of the user to get details of",
                format: "uuid",
                title: "User ID",
              },
            },
          ],
          responses: {
            "200": {
              description: "Successful Response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/GetUserResponse",
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        GetUsersResponse: {
          type: "array",
          items: {
            $ref: "#/components/schemas/GetUserResponse",
          },
        },
        GetUserResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "User ID",
            },
            name: {
              type: "string",
              description: "User's name",
            },
          },
          required: ["id", "name"],
          title: "GetUserResponse",
        },
      },
    },
  };

  const expectedSpec: APIReferenceCore = {
    routes: [
      {
        id: "list_users_users_get",
        path: "/users",
        method: RouteMethod.GET,
        title: "List Users",
        tags: [["Users"]],
        queryParams: {
          limit: {
            description: "Maximum number of users to return",
            title: "Limit",
            type: "integer",
            maximum: 50,
            minimum: 1,
            default: 50,
          },
          cursor: {
            description:
              "Cursor from the previous call to list users, used to retrieve the next set of results",
            title: "Cursor",
            type: "string",
          },
        },
        responses: {
          200: {
            contentType: ContentType.JSON,
            description: "Successful Response",
            body: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "uuid",
                    description: "User ID",
                  },
                  name: {
                    type: "string",
                    description: "User's name",
                  },
                },
              },
            },
          },
        },
      },
      {
        id: "get_user_users__user_id__get",
        path: "/users/{user_id}",
        method: RouteMethod.GET,
        title: "Get User",
        tags: [["Users"]],
        pathParams: {
          user_id: {
            type: "string",
            description: "User ID of the user to get details of",
            format: "uuid",
            title: "User ID",
            required: true,
          },
        },
        responses: {
          200: {
            contentType: ContentType.JSON,
            description: "Successful Response",
            body: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                  description: "User ID",
                },
                name: {
                  type: "string",
                  description: "User's name",
                },
              },
            },
          },
        },
      },
    ],
  };

  const transformedSpec = transformOpenAPISpec(exampleSpec);

  test("Path parameters", () => {
    for (const [index, route] of transformedSpec.routes.entries()) {
      expect(route.pathParams).toEqual(expectedSpec.routes[index].pathParams);
    }
  });

  test("Query parameters", () => {
    for (const [index, route] of transformedSpec.routes.entries()) {
      expect(route.queryParams).toEqual(expectedSpec.routes[index].queryParams);
    }
  });

  test("Total equality", () => {
    expect(expectedSpec).toMatchObject(transformedSpec);
  });
});
