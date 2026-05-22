import React from "react";
import { Link } from "react-router-dom";
import { Button, Card, Col, Container, Row } from "@themesberg/react-bootstrap";

import { Routes } from "../routes";

export default function NotFound() {
  return (
    <main className="d-flex align-items-center min-vh-100 bg-soft">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={5}>
            <Card border="light" className="shadow-sm text-center">
              <Card.Body className="p-4 p-lg-5">
                <span className="text-uppercase text-gray-600 small fw-bold">Granville</span>
                <h1 className="h3 mt-3">Page not found</h1>
                <p className="text-gray-700 mb-4">
                  The requested portal route is not available in the Phase 1 shell.
                </p>
                <Button as={Link} to={Routes.Signin.path} variant="primary" className="me-2">
                  Sign in
                </Button>
                <Button as={Link} to={Routes.Dashboard.path} variant="outline-primary">
                  Go to dashboard
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
