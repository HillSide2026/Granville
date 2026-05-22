import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { Button, Card, Col, Container, Form, Row, Image } from "@themesberg/react-bootstrap";

import { portalClient } from "../api/client";
import { Routes } from "../routes";
import BrandMark from "../assets/img/brand/dark.svg";

export default function SignUp() {
  const history = useHistory();
  const [form, setForm] = useState({
    organization: "",
    email: "",
    region: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await portalClient.signUp(form);
    history.push(result.redirectTo);
  };

  return (
    <main className="d-flex align-items-center min-vh-100 bg-soft">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card border="light" className="shadow-sm">
              <Card.Body className="p-4 p-lg-5">
                <div className="d-flex align-items-center mb-4">
                  <Image src={BrandMark} width={36} height={36} alt="Granville mark" />
                  <div className="ms-3">
                    <span className="text-uppercase text-gray-600 small fw-bold">Granville</span>
                    <h1 className="h3 mb-0">Start portal onboarding</h1>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  Create an initial access request for your organization&apos;s authenticated Granville workspace.
                </p>

                <Form onSubmit={handleSubmit}>
                  <Form.Group id="organization" className="mb-3">
                    <Form.Label>Legal entity name</Form.Label>
                    <Form.Control
                      autoFocus
                      required
                      name="organization"
                      type="text"
                      placeholder="Organization legal name"
                      value={form.organization}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group id="email" className="mb-3">
                    <Form.Label>Work email</Form.Label>
                    <Form.Control
                      required
                      name="email"
                      type="email"
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group id="region" className="mb-4">
                    <Form.Label>Primary operating region</Form.Label>
                    <Form.Control
                      required
                      name="region"
                      type="text"
                      placeholder="Canada, United Kingdom, Europe, etc."
                      value={form.region}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100" disabled={submitting}>
                    {submitting ? "Submitting..." : "Request portal access"}
                  </Button>
                </Form>

                <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal">
                    Already provisioned?
                    <Card.Link as={Link} to={Routes.Signin.path} className="fw-bold ms-1">
                      Sign in
                    </Card.Link>
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
