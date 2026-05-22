import React from "react";
import { Badge } from "@themesberg/react-bootstrap";

const variantByStatus = {
  active: "success",
  monitoring: "info",
  completed: "success",
  processing: "primary",
  pending: "warning",
  "pending approval": "warning",
  "in review": "warning",
  "in progress": "warning",
  ready: "success",
  blocked: "danger",
};

export default function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const variant = variantByStatus[normalized] || "secondary";

  return (
    <Badge bg={variant} className="text-uppercase fw-semibold">
      {status}
    </Badge>
  );
}
