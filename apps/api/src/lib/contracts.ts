export interface RouteDefinition {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  summary: string;
  auth: "public" | "user" | "admin";
  tags?: string[];
}

export interface DtoDefinition {
  name: string;
  fields: string[];
}

export interface ModuleBlueprint {
  domain: string;
  basePath: string;
  description: string;
  controllers: string[];
  services: string[];
  repositories: string[];
  guards?: string[];
  jobs?: string[];
  websocketEvents?: string[];
  dtos?: DtoDefinition[];
  routes: RouteDefinition[];
}

export function defineModule(blueprint: ModuleBlueprint) {
  return blueprint;
}

