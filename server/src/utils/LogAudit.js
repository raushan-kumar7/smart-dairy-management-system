import { getGeoLocation } from "./GeoLocation.js";
import { createAuditLog } from "./AuditLog.js";

const logAudit = async (req, action, entity, reason) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const geo = getGeoLocation(ip);

  return await createAuditLog({
    action,
    entity,
    performedBy: req.user._id,
    reason,
    metadata: {
      ...geo,
      deviceInfo: req.headers["user-agent"],
    },
  });
};

export { logAudit };