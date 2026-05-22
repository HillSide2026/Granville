import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { Button, Card, Col, Container, Form, Row, Image } from "@themesberg/react-bootstrap";

import { portalClient } from "../api/client";
import { Routes } from "../routes";
import BrandMark from "../assets/img/brand/dark.svg";

export default function SignIn() {
  const history = useHistory();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await portalClient.signIn(form);
    history.push(result.redirectTo);
  };

  return (
    <main className="d-flex align-items-center min-vh-100 bg-soft">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={5}>
            <Card border="light" className="shadow-sm">
              <Card.Body className="p-4 p-lg-5">
                <div className="d-flex align-items-center mb-4">
                  <Image src={BrandMark} width={36} height={36} alt="Granville mark" />
                  <div className="ms-3">
                    <span className="text-uppercase text-gray-600 small fw-bold">Granville</span>
                    <h1 className="h3 mb-0">Portal sign in</h1>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  Authenticated access for onboarding, account balances, and customer activity.
                </p>

                <Form onSubmit={handleSubmit}>
                  <Form.Group id="email" className="mb-3">
                    <Form.Label>Work email</Form.Label>
                    <Form.Control
                      autoFocus
                      required
                      name="email"
                      type="email"
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group id="password" className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      required
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100" disabled={submitting}>
                    {submitting ? "Signing in..." : "Sign in"}
                  </Button>
                </Form>

                <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal">
                    Need access?
                    <Card.Link as={Link} to={Routes.Signup.path} className="fw-bold ms-1">
                      Start onboarding
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
