import React from "react";
import { Row, Col } from "@themesberg/react-bootstrap";

export default function Footer({ organization }) {
  return (
    <footer className="footer section py-4">
      <Row className="align-items-center">
        <Col xs={12} lg={6} className="mb-3 mb-lg-0">
          <small className="text-gray-700">
            Granville customer portal shell for authenticated onboarding, balances, and payment activity.
          </small>
        </Col>
        <Col xs={12} lg={6} className="text-lg-end">
          <small className="text-gray-600">
            {organization ? `${organization.clientId} · ${organization.legalName}` : "Granville portal"}
          </small>
        </Col>
      </Row>
    </footer>
  );
}
