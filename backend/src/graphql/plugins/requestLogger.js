import logger from "../../utils/logger.js";

export const requestLoggerPlugin = {
  async requestDidStart(requestContext) {
    const startedAt = Date.now();
    const operationName = requestContext.request.operationName || "anonymous";

    return {
      async willSendResponse(ctx) {
        logger.info("GraphQL request completed", {
          operationName,
          durationMs: Date.now() - startedAt,
          errors: ctx.errors?.length || 0,
        });
      },
      async didEncounterErrors(ctx) {
        ctx.errors.forEach((error) => {
          logger.error("GraphQL error", {
            operationName,
            message: error.message,
            code: error.extensions?.code,
          });
        });
      },
    };
  },
};

export default requestLoggerPlugin;
