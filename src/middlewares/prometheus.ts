import promBundle from "express-prom-bundle";

const prometheusMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
});

export default prometheusMiddleware;
