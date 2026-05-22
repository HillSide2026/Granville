import React, { useEffect, useState } from "react";
import { Card, Form, Button, Alert, ListGroup } from "@themesberg/react-bootstrap";

export function OrganizationSettingsForm({ settings, onSave, saving, savedAt }) {
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <Card border="light" className="bg-white shadow-sm mb-4">
      <Card.Body>
        <h5 className="mb-4">Profile and reporting</h5>

        {savedAt ? <Alert variant="success">Settings saved {savedAt}.</Alert> : null}

        <Form onSubmit={handleSubmit}>
          <Form.Group id="displayName" className="mb-3">
            <Form.Label>Display name</Form.Label>
            <Form.Control
              required
              name="displayName"
              value={form.displayName || ""}
              onChange={handleChange}
              type="text"
            />
          </Form.Group>

          <Form.Group id="title" className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Control required name="title" value={form.title || ""} onChange={handleChange} type="text" />
          </Form.Group>

          <Form.Group id="email" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control required name="email" value={form.email || ""} onChange={handleChange} type="email" />
          </Form.Group>

          <Form.Group id="phone" className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control required name="phone" value={form.phone || ""} onChange={handleChange} type="text" />
          </Form.Group>

          <Form.Group id="timezone" className="mb-3">
            <Form.Label>Timezone</Form.Label>
            <Form.Control
              required
              name="timezone"
              value={form.timezone || ""}
              onChange={handleChange}
              type="text"
            />
          </Form.Group>

          <Form.Group id="reportingPreference" className="mb-3">
            <Form.Label>Reporting preference</Form.Label>
            <Form.Control
              name="reportingPreference"
              value={form.reportingPreference || ""}
              onChange={handleChange}
              type="text"
            />
          </Form.Group>

          <Form.Group id="alertPreference" className="mb-4">
            <Form.Label>Alert preference</Form.Label>
            <Form.Control
              name="alertPreference"
              value={form.alertPreference || ""}
              onChange={handleChange}
              type="text"
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save settings"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export function OperationalContactsCard({ contacts }) {
  return (
    <Card border="light" className="shadow-sm">
      <Card.Header className="border-bottom border-light">
        <h5 className="mb-0">Operational contacts</h5>
      </Card.Header>
      <Card.Body>
        <ListGroup className="list-group-flush">
          {contacts.map((contact) => (
            <ListGroup.Item key={contact.role} className="px-0">
              <strong className="d-block">{contact.role}</strong>
              <span className="d-block">{contact.name}</span>
              <small className="text-gray-600">{contact.detail}</small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
