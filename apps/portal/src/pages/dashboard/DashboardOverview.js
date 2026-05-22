import React, { useEffect, useState } from "react";
import { Col, Row, Spinner } from "@themesberg/react-bootstrap";

import { portalClient } from "../../api/client";
import PageHeader from "../../components/PageHeader";
import { ActivityTable, AccountsTable } from "../../components/Tables";
import {
  MetricCard,
  BalanceSummaryCard,
  NotificationsCard,
  OnboardingChecklistCard,
  OrganizationSnapshotCard,
} from "../../components/Widgets";

export default function DashboardOverview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;

    portalClient.getDashboard().then((nextData) => {
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
        eyebrow="Overview"
        title="Customer portal"
        description="A focused operational shell for onboarding, balances, account visibility, and payment activity."
        badge={data.organization.onboardingStatus}
      />

      <Row className="mb-4">
        {data.metrics.map((metric) => (
          <Col xs={12} md={6} xl={3} className="mb-4" key={metric.label}>
            <MetricCard {...metric} />
          </Col>
        ))}
      </Row>

      <Row className="mb-4">
        <Col xs={12} xl={4} className="mb-4">
          <OrganizationSnapshotCard organization={data.organization} profile={data.profile} />
        </Col>
        <Col xs={12} xl={4} className="mb-4">
          <OnboardingChecklistCard items={data.onboardingChecklist} />
        </Col>
        <Col xs={12} xl={4} className="mb-4">
          <NotificationsCard items={data.notifications} />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12} xl={4} className="mb-4">
          <BalanceSummaryCard balances={data.balances} />
        </Col>
        <Col xs={12} xl={8} className="mb-4">
          <AccountsTable accounts={data.accounts} />
        </Col>
      </Row>

      <ActivityTable activity={data.activity} />
    </>
  );
}
