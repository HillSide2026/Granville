import React, { useEffect, useState } from "react";
import { Col, Row, Spinner } from "@themesberg/react-bootstrap";

import { portalClient } from "../api/client";
import PageHeader from "../components/PageHeader";
import { ActivityTable } from "../components/Tables";
import { MetricCard } from "../components/Widgets";

export default function Transactions() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;

    portalClient.getActivity().then((nextData) => {
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
        eyebrow="Activity"
        title="Payment activity"
        description="A neutral placeholder activity feed that can later be backed directly by Granville API reads."
        badge={`${data.summary.total} records`}
      />

      <Row className="mb-4">
        <Col xs={12} md={4} className="mb-4">
          <MetricCard
            label="Pending approval"
            value={String(data.summary.pending)}
            detail="Items waiting for a customer release decision"
          />
        </Col>
        <Col xs={12} md={4} className="mb-4">
          <MetricCard
            label="Processing"
            value={String(data.summary.processing)}
            detail="Items still moving through the placeholder workflow"
          />
        </Col>
        <Col xs={12} md={4} className="mb-4">
          <MetricCard
            label="Completed"
            value={String(data.summary.completed)}
            detail="Settled or confirmed activity records"
          />
        </Col>
      </Row>

      <ActivityTable activity={data.activity} />
    </>
  );
}
