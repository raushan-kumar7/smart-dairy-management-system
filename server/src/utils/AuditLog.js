import { asyncHandler } from "./AsyncHandler.js";
import { ApiError } from "./ApiError.js";
import { ACTION_TYPES, Audit, ENTITY_TYPES } from "../models/audit.model.js";

/**
 * Creates a detailed audit log entry
 * @param {Object} params - Audit parameters
 * @param {string} params.action - Action performed (from ACTION_TYPES)
 * @param {string} params.entity - Entity type (from ENTITY_TYPES)
 * @param {string} params.entityId - ID of the affected entity
 * @param {string} params.performedBy - ID of the user performing the action
 * @param {Object} [params.oldData] - Previous state of the entity
 * @param {Object} [params.newData] - New state of the entity
 * @param {Object} [params.metadata] - Additional contextual information
 * @param {string} [params.reason] - Reason for the change
 * @returns {Promise<Object>} Created audit log entry
 * @throws {Error} If required parameters are missing or invalid
 */

const createAuditLog = asyncHandler(
  async ({
    action,
    entity,
    entityId,
    performedBy,
    oldData = null,
    newData = null,
    metadata = {},
    reason = "",
  }) => {
    if (!ACTION_TYPES[action]) {
      throw new ApiError(400, `Invalid action type: ${action}`);
    }

    if (!ENTITY_TYPES[entity] && entity !== "SYSTEM") {
      throw new ApiError(400, `Invalid entity type: ${entity}`);
    }

    const changes =
      oldData && newData ? calculateChanges(oldData, newData, reason) : undefined;

    const auditLog = await Audit.create({
      action,
      entity,
      entityId,
      performedBy: performedBy || "SYSTEM",
      changes,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
      },
    });

    return auditLog;
  }
);

/**
 * Calculates detailed changes between two states of an entity
 * @param {Object} oldData - Previous state
 * @param {Object} newData - New state
 * @param {string} reason - Reason for changes
 * @returns {Array} Array of change objects
 */
const calculateChanges = (oldData, newData, reason) => {
  const changes = [];
  const processedFields = new Set();

  [...Object.keys(oldData), ...Object.keys(newData)].forEach((field) => {
    if (processedFields.has(field)) return;
    processedFields.add(field);

    const oldValue = oldData[field];
    const newValue = newData[field];

    if (!isEqual(oldValue, newValue)) {
      changes.push({
        field,
        oldValue,
        newValue,
        reason,
      });
    }
  });

  return changes;
};

const isEqual = (val1, val2) => {
  return JSON.stringify(val1) === JSON.stringify(val2);
};

const queryAuditLogs = asyncHandler(
  async ({
    entity,
    entityId,
    action,
    performedBy,
    startDate,
    endDate,
    page = 1,
    limit = 25,
    sortField = "createdAt",
    sortOrder = "desc",
  }) => {
    const query = {};

    if (entity) query.entity = entity;
    if (entityId) query.entityId = entityId;
    if (action) query.action = action;
    if (performedBy) query.performedBy = performedBy;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const [logs, total] = await Promise.all([
      Audit.find(query)
        .sort({ [sortField]: sortOrder === "desc" ? "-1" : "1" })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("performedBy", "name email role")
        .lean(),
      Audit.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
);

export { createAuditLog, queryAuditLogs };