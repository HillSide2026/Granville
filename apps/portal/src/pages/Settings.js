import React, { useEffect, useState } from "react";
import { Col, Row, Spinner } from "@themesberg/react-bootstrap";

import { portalClient } from "../api/client";
import PageHeader from "../components/PageHeader";
import { OrganizationSettingsForm, OperationalContactsCard } from "../components/Forms";
import { OrganizationSnapshotCard } from "../components/Widgets";

export default function Settings() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    let mounted = true;

    portalClient.getSettings().then((nextData) => {
      if (mounted) {
        setData(nextData);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const saveSettings = async (nextSettings) => {
    setSaving(true);
    const saved = await portalClient.saveSettings(nextSettings);
    setData((current) => ({
      ...current,
      settings: saved.settings,
      profile: saved.profile,
    }));
    setSavedAt(saved.savedAt);
    setSaving(false);
  };

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
        eyebrow="Settings"
        title="Profile and controls"
        description="Profile, reporting, and operational contact details for the authenticated customer shell."
        badge={data.organization.status}
      />

      <Row>
        <Col xs={12} xl={4} className="mb-4">
          <OrganizationSnapshotCard organization={data.organization} profile={data.profile} />
        </Col>
        <Col xs={12} xl={8} className="mb-4">
          <OrganizationSettingsForm
            settings={data.settings}
            onSave={saveSettings}
            saving={saving}
            savedAt={savedAt}
          />
        </Col>
      </Row>

      <OperationalContactsCard contacts={data.contacts} />
    </>
  );
}
