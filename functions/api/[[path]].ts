/// <reference types="@cloudflare/workers-types" />

import { handleApi, type ApiEnv } from "../../src/api/handler";

export const onRequest: PagesFunction<ApiEnv> = ({ request, env }) => handleApi(request, env);
