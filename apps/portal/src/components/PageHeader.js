import React from "react";
import { Row, Col, Badge } from "@themesberg/react-bootstrap";

export default function PageHeader({ eyebrow, title, description, badge }) {
  return (
    <Row className="align-items-center py-4">
      <Col xs={12} xl={8}>
        {eyebrow ? <span className="text-uppercase text-gray-600 small fw-bold">{eyebrow}</span> : null}
        <h1 className="h3 mb-2 mt-2">{title}</h1>
        <p className="mb-0 text-gray-700">{description}</p>
      </Col>
      <Col xs={12} xl={4} className="text-xl-end mt-3 mt-xl-0">
        {badge ? (
          <Badge bg="light" className="text-dark border">
            {badge}
          </Badge>
        ) : null}
      </Col>
    </Row>
  );
}
