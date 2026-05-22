import React from "react";
import { Card, Table } from "@themesberg/react-bootstrap";

import StatusBadge from "./StatusBadge";

export function AccountsTable({ accounts }) {
  return (
    <Card border="light" className="shadow-sm">
      <Card.Header className="border-bottom border-light">
        <h5 className="mb-0">Accounts</h5>
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive className="table-centered table-nowrap mb-0 rounded">
          <thead className="thead-light">
            <tr>
              <th className="border-0">Account</th>
              <th className="border-0">Currency</th>
              <th className="border-0">Available</th>
              <th className="border-0">Reserved</th>
              <th className="border-0">Purpose</th>
              <th className="border-0">Region</th>
              <th className="border-0">Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>
                  <strong>{account.name}</strong>
                </td>
                <td>{account.currency}</td>
                <td>{account.available}</td>
                <td>{account.reserved}</td>
                <td>{account.purpose}</td>
                <td>{account.region}</td>
                <td>
                  <StatusBadge status={account.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export function ActivityTable({ activity }) {
  return (
    <Card border="light" className="shadow-sm">
      <Card.Header className="border-bottom border-light">
        <h5 className="mb-0">Recent activity</h5>
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive className="table-centered table-nowrap mb-0 rounded">
          <thead className="thead-light">
            <tr>
              <th className="border-0">Reference</th>
              <th className="border-0">Type</th>
              <th className="border-0">Counterparty</th>
              <th className="border-0">Amount</th>
              <th className="border-0">Rail</th>
              <th className="border-0">Updated</th>
              <th className="border-0">Status</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.id}</strong>
                </td>
                <td>{item.type}</td>
                <td>{item.counterparty}</td>
                <td>{item.amount}</td>
                <td>{item.rail}</td>
                <td>{item.updatedAt}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
