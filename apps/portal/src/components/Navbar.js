import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCog, faSignOutAlt, faUserShield } from "@fortawesome/free-solid-svg-icons";
import {
  Row,
  Col,
  Nav,
  Navbar,
  Dropdown,
  Container,
  ListGroup,
} from "@themesberg/react-bootstrap";

import { Routes } from "../routes";
import StatusBadge from "./StatusBadge";

export default function TopNavbar({ title, organization, profile, notifications }) {
  const history = useHistory();
  const [items, setItems] = useState(notifications);

  useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  const unreadCount = items.filter((item) => !item.read).length;

  const markNotificationsAsRead = () => {
    setItems(items.map((item) => ({ ...item, read: true })));
  };

  const signOut = () => {
    history.push(Routes.Signin.path);
  };

  return (
    <Navbar variant="dark" expanded className="ps-0 pe-2 pb-0">
      <Container fluid className="px-0">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <span className="text-uppercase text-gray-600 small fw-bold">{title}</span>
            <h2 className="h5 mb-0 mt-1">{organization ? organization.name : "Granville customer portal"}</h2>
          </div>

          <Nav className="align-items-center">
            <Dropdown as={Nav.Item} onToggle={markNotificationsAsRead}>
              <Dropdown.Toggle as={Nav.Link} className="text-dark icon-notifications me-lg-3">
                <span className="icon icon-sm">
                  <FontAwesomeIcon icon={faBell} />
                  {unreadCount > 0 ? (
                    <span className="icon-badge rounded-circle unread-notifications" />
                  ) : null}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-center mt-2 py-0">
                <ListGroup className="list-group-flush">
                  <ListGroup.Item className="border-bottom border-light py-3">
                    <strong>Operational notifications</strong>
                  </ListGroup.Item>

                  {items.map((item) => (
                    <ListGroup.Item key={item.id} className="border-bottom border-light">
                      <Row className="align-items-center">
                        <Col xs={9}>
                          <h4 className="h6 mb-1">{item.title}</h4>
                          <p className="font-small text-gray-700 mb-1">{item.message}</p>
                          <small className="text-gray-600">{item.time}</small>
                        </Col>
                        <Col xs={3} className="text-end">
                          <StatusBadge status={item.status} />
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle as={Nav.Link} className="pt-1 px-0">
                <div className="media d-flex align-items-center">
                  <div className="icon icon-shape icon-sm rounded-circle bg-primary text-white">
                    <FontAwesomeIcon icon={faUserShield} />
                  </div>
                  <div className="media-body ms-2 text-dark align-items-center d-none d-lg-block">
                    <span className="mb-0 font-small fw-bold">{profile ? profile.name : "Portal user"}</span>
                  </div>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu className="user-dropdown dropdown-menu-right mt-2">
                <Dropdown.Item className="fw-bold text-gray-700">
                  <div>{profile ? profile.role : "Treasury operator"}</div>
                  <small>{profile ? profile.email : "user@example.com"}</small>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item className="fw-bold" onClick={() => history.push(Routes.Settings.path)}>
                  <FontAwesomeIcon icon={faCog} className="me-2" /> Settings
                </Dropdown.Item>
                <Dropdown.Item className="fw-bold" onClick={signOut}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-danger me-2" /> Sign out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
}
