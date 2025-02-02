import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createAuditLog } from "../utils/AuditLog.js";
import { getGeoLocation } from "../utils/GeoLocation.js";
import os from "os";
import mongoose from "mongoose";

const healthcheck = asyncHandler(async (req, res) => {
  const ip = req.ip;
  const geo = await getGeoLocation(ip);
  
  // Gather detailed system information
  const systemInfo = {
    // Server Status
    status: "active",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    
    // Node.js Information
    node: {
      version: process.version,
      environment: process.env.NODE_ENV,
      memoryUsage: {
        ...process.memoryUsage(),
        heapUsedPercentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      }
    },
    
    // System Resources
    system: {
      platform: process.platform,
      arch: process.arch,
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      memoryUsagePercent: Math.round((1 - os.freemem() / os.totalmem()) * 100),
      loadAverage: os.loadavg()
    },
    
    // Database Status
    database: {
      status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: Object.keys(mongoose.connection.collections).length
    },
    
    // Request Information
    request: {
      protocol: req.protocol,
      host: req.get("host"),
      path: req.path,
      method: req.method,
      userAgent: req.headers["user-agent"],
      ip: ip,
      timestamp: Date.now()
    }
  };
  
  await createAuditLog({
    action: "HEALTHCHECK",
    entity: "SYSTEM",
    performedBy: req.user?._id || "SYSTEM",
    reason: "System Health Monitoring",
    metadata: {
      ...geo,
      deviceInfo: req.headers["user-agent"],
      systemMetrics: {
        cpuLoad: systemInfo.system.loadAverage[0],
        memoryUsage: systemInfo.system.memoryUsagePercent,
        uptime: systemInfo.uptime
      }
    }
  });

  // Add status checks for critical services
  const healthStatus = 
    systemInfo.system.memoryUsagePercent < 90 && 
    systemInfo.database.status === "connected" &&
    systemInfo.system.loadAverage[0] < os.cpus().length * 0.8;

  return res.status(200).json(
    new ApiResponse(
      200, 
      systemInfo, 
      healthStatus ? "System is healthy" : "System needs attention"
    )
  );
});

export { healthcheck };