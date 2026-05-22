import React from "react";
import { Card, ListGroup, Row, Col } from "@themesberg/react-bootstrap";

import StatusBadge from "./StatusBadge";

export function MetricCard({ label, value, detail }) {
  return (
    <Card border="light" className="shadow-sm h-100">
      <Card.Body>
        <span className="text-uppercase text-gray-600 small fw-bold">{label}</span>
        <h3 className="mt-3 mb-2">{value}</h3>
        <p className="mb-0 text-gray-700">{detail}</p>
      </Card.Body>
    </Card>
  );
}

export function BalanceSummaryCard({ balances }) {
  return (
    <Card border="light" className="shadow-sm h-100">
      <Card.Header className="border-bottom border-light">
        <h5 className="mb-0">Balance summary</h5>
      </Card.Header>
      <Card.Body>
        <ListGroup className="list-group-flush">
          {balances.map((balance) => (
            <ListGroup.Item key={balance.currency} className="px-0">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{balance.currency}</strong>
                  <p className="small text-gray-700 mb-0">{balance.detail}</p>
                </div>
                <div className="text-end">
                  <div className="fw-bold">{balance.available}</div>
                  <small className="text-gray-600">Reserved {balance.reserved}</small>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

export function OnboardingChecklistCard({ items }) {
  return (
    <Card border="light" className="shadow-sm h-100">
      <Card.Header className="border-bottom border-light">
        <h5 className="mb-0">Onboarding status</h5>
      </Card.Header>
      <Card.Body>
        <ListGroup className="list-group-flush">
          {items.map((item) => (
            <ListGroup.Item key={item.id} className="px-0">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <strong>{item.title}</strong>
                <StatusBadge status={item.status} />
              </div>
              <p className="small text-gray-700 mb-0">{item.description}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

export function NotificationsCard({ items }) {
  return (
    <Card border="light" className="shadow-sm h-100">
      <Card.Header className="border-bottom border-light">
        <h5 className="mb-0">Notifications</h5>
      </Card.Header>
      <Card.Body>
        <ListGroup className="list-group-flush">
          {items.map((item) => (
            <ListGroup.Item key={item.id} className="px-0">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <strong>{item.title}</strong>
                <StatusBadge status={item.status} />
              </div>
              <p className="small text-gray-700 mb-1">{item.message}</p>
              <small className="text-gray-600">{item.time}</small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

export function OrganizationSnapshotCard({ organization, profile }) {
  return (
    <Card border="light" className="shadow-sm h-100">
      <Card.Header className="border-bottom border-light">
        <h5 className="mb-0">Organization snapshot</h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Col xs={12}>
            <small className="text-uppercase text-gray-600 fw-bold d-block">Legal entity</small>
            <span>{organization.legalName}</span>
          </Col>
          <Col xs={6}>
            <small className="text-uppercase text-gray-600 fw-bold d-block">Client ID</small>
            <span>{organization.clientId}</span>
          </Col>
          <Col xs={6}>
            <small className="text-uppercase text-gray-600 fw-bold d-block">Domicile</small>
            <span>{organization.domicile}</span>
          </Col>
          <Col xs={6}>
            <small className="text-uppercase text-gray-600 fw-bold d-block">Coverage</small>
            <span>{organization.segment}</span>
          </Col>
          <Col xs={6}>
            <small className="text-uppercase text-gray-600 fw-bold d-block">Portal status</small>
            <StatusBadge status={organization.status} />
          </Col>
          <Col xs={12}>
            <small className="text-uppercase text-gray-600 fw-bold d-block">Primary operator</small>
            <span>
              {profile.name} · {profile.role}
            </span>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
