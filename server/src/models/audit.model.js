import mongoose, { Schema } from "mongoose";

const ACTION_TYPES = {
  HEALTHCHECK: "HEALTHCHECK",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  RETRIEVE: "RETRIEVE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  ASSIGN: "ASSIGN",
  REMOVE: "REMOVE",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  PAYMENT: "PAYMENT",
  QUALITY_CHECK: "QUALITY_CHECK",
  BULK_UPDATE: "BULK_UPDATE",
};

const ENTITY_TYPES = {
  SYSTEM_CHECK: "SYSTEM_CHECK",
  ADMIN: "ADMIN",
  USER: "USER",
  MPC: "MPC",
  BMC: "BMC",
  MPP: "MPP",
  ROLE: "ROLE",
  ORDER: "ORDER",
  PAYMENT: "PAYMENT",
  COLLECTION: "COLLECTION",
  QUALITY_TEST: "QUALITY_TEST",
  ROUTE: "ROUTE",
  FARMER: "FARMER",
  SYSTEM: "SYSTEM",
};



const changeLogSchema = new Schema({
  field: {
    type: String,
    required: true,
  },
  oldValue: Schema.Types.Mixed,
  newValue: Schema.Types.Mixed,
  reason: String,
});

const auditSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: Object.values(ACTION_TYPES),
      index: true,
    },
    entity: {
      type: String,
      required: true,
      enum: Object.values(ENTITY_TYPES),
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function (v) {
          return this.action === ACTION_TYPES.RETRIEVE || ACTION_TYPES.HEALTHCHECK || !!v;
        },
        message: "Entity ID is required for retrieve action",
      },
      index: true,
    },
    performedBy: {
      type: Schema.Types.Mixed,
      required: true,
      ref: "User",
      index: true,
    },
    changes: [
      {
        type: changeLogSchema,
        default: undefined,
      },
    ],
    metadata: {
      ipAddress: String,
      userAgent: String,
      location: String,
      deviceInfo: String,
      additionalInfo: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILURE", "PENDING"],
      default: "SUCCESS",
    },
    errorDetails: {
      code: String,
      message: String,
      stack: String,
    },
  },
  {
    timestamps: true,
    collection: "audits",
  }
);

auditSchema.index({ entity: 1, createdAt: -1 });
auditSchema.index({ performedBy: 1, createdAt: -1 });
auditSchema.index({ action: 1, entity: 1, createdAt: -1 });

auditSchema.index({
  "metadata.additionalInfo": "text",
  "changes.reason": "text",
});

export const Audit = mongoose.model("Audit", auditSchema);
export { ACTION_TYPES, ENTITY_TYPES };