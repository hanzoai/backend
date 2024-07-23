"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingFactory = void 0;
exports.getLogs = getLogs;
const metadataService_1 = require("../metadataService");
const logging_1 = require("@google-cloud/logging");
// function tryParseJSONObject(jsonString: string) {
//   try {
//     var o = JSON.parse(jsonString);
//     if (o && typeof o === "object") {
//       return o;
//     }
//   } catch (e) {}
//   return null;
// }
// export async function getFunctionLogs(req: Request) {
//   if (!req.params.functionName) throw Error("No function Name provided");
//   // Creates a client
//   const projectId = await getProjectId();
//   const logging = new Logging({ projectId });
//   const filter = `resource.labels.function_name = "${req.params.functionName}"`;
//   const pageSize = 100;
//   const orderBy = "timestamp desc";
//   const options = {
//     filter,
//     pageSize,
//     orderBy,
//   };
//   const [entries] = await logging.getEntries(options);
//   console.log(`entry ${entries.length}`);
//   return _.groupBy(
//     entries.map((entry) => {
//       const { labels, timestamp, textPayload, payload } = entry.toJSON() as any;
//       return {
//         labels,
//         timestamp,
//         textPayload,
//         payload,
//         jsonPayload: tryParseJSONObject(textPayload),
//       };
//     }),
//     "labels.execution_id"
//   );
// }
async function getLogs(req) {
    // Creates a client
    const projectId = await (0, metadataService_1.getProjectId)();
    const logging = new logging_1.Logging({ projectId });
    const pageSize = 100;
    const orderBy = "timestamp desc";
    const options = {
        filter: req.query.filter,
        pageSize,
        orderBy: (req.query.orderBy ?? orderBy),
    };
    const [entries] = await logging.getEntries(options);
    console.log(`entry ${entries.length}`);
    return entries.map((entry) => {
        return entry.toJSON();
    });
}
var LoggingFactory_1 = require("./LoggingFactory");
Object.defineProperty(exports, "LoggingFactory", { enumerable: true, get: function () { return LoggingFactory_1.LoggingFactory; } });
//# sourceMappingURL=index.js.map