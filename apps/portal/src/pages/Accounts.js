import React, { useEffect, useState } from "react";
import { Card, Col, Row, Spinner } from "@themesberg/react-bootstrap";

import { portalClient } from "../api/client";
import PageHeader from "../components/PageHeader";
import { AccountsTable } from "../components/Tables";
import { BalanceSummaryCard } from "../components/Widgets";

export default function Accounts() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;

    portalClient.getAccounts().then((nextData) => {
      if (mounted) {
        setData(nextData);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!data) {
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Accounts"
        title="Account coverage"
        description="A reduced operating view of customer balances, account purpose, and readiness."
        badge={data.organization.status}
      />

      <Row className="mb-4">
        <Col xs={12} xl={4} className="mb-4 mb-xl-0">
          <BalanceSummaryCard balances={data.balances} />
        </Col>
        <Col xs={12} xl={8}>
          <Card border="light" className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">Coverage note</h5>
              <p className="text-gray-700 mb-0">
                This shell keeps account visibility separate from the public site and the ops console while
                preserving a clean handoff path to the Granville API.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AccountsTable accounts={data.accounts} />
    </>
  );
}
