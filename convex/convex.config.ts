import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
import cache from "@convex-dev/action-cache/convex.config";
import workflow from "@convex-dev/workflow/convex.config";

const app = defineApp();
app.use(betterAuth);
app.use(cache);
app.use(workflow);

export default app;