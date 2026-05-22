import React, { useState } from "react";
import SimpleBar from "simplebar-react";
import { useLocation, Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faChartPie,
  faCog,
  faExchangeAlt,
  faTimes,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { Nav, Badge, Image, Button, Card, Navbar } from "@themesberg/react-bootstrap";

import { Routes, primaryNavigation } from "../routes";
import BrandMark from "../assets/img/brand/light.svg";

const iconMap = {
  dashboard: faChartPie,
  accounts: faWallet,
  activity: faExchangeAlt,
  settings: faCog,
};

export default function Sidebar({ organization }) {
  const location = useLocation();
  const { pathname } = location;
  const [show, setShow] = useState(false);
  const showClass = show ? "show" : "";

  const onCollapse = () => setShow(!show);

  const NavItem = ({ title, link, icon }) => {
    const navItemClassName = pathname === link ? "active" : "";

    return (
      <Nav.Item className={navItemClassName} onClick={() => setShow(false)}>
        <Nav.Link as={Link} to={link}>
          <span className="sidebar-icon">
            <FontAwesomeIcon icon={icon} />
          </span>
          <span className="sidebar-text">{title}</span>
        </Nav.Link>
      </Nav.Item>
    );
  };

  return (
    <>
      <Navbar expand={false} collapseOnSelect variant="dark" className="navbar-theme-primary px-4 d-md-none">
        <Navbar.Brand as={Link} to={Routes.Dashboard.path} className="me-lg-5">
          <Image src={BrandMark} className="navbar-brand-light" />
        </Navbar.Brand>
        <Navbar.Toggle as={Button} aria-controls="main-navbar" onClick={onCollapse}>
          <FontAwesomeIcon icon={faBars} />
        </Navbar.Toggle>
      </Navbar>

      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar className={`collapse ${showClass} sidebar d-md-block bg-primary text-white`}>
          <div className="sidebar-inner px-4 pt-3">
            <Nav className="flex-column pt-3 pt-md-0">
              <Nav.Item className="mb-4">
                <Nav.Link as={Link} to={Routes.Dashboard.path} className="d-flex align-items-center">
                  <Image src={BrandMark} className="sidebar-icon svg-icon" />
                  <span className="sidebar-text fw-bold">Granville Portal</span>
                </Nav.Link>
              </Nav.Item>

              {primaryNavigation.map((item) => (
                <NavItem
                  key={item.path}
                  title={item.title}
                  link={item.path}
                  icon={iconMap[item.icon]}
                />
              ))}

              <Card className="bg-white border-0 shadow-sm mt-4">
                <Card.Body className="text-dark">
                  <small className="text-uppercase text-gray-600 fw-bold d-block mb-2">Portal Shell</small>
                  <h6 className="mb-2">{organization ? organization.name : "Customer organization"}</h6>
                  <p className="small text-gray-700 mb-3">
                    Customer onboarding, balances, activity, and settings now share one reduced route surface.
                  </p>
                  <Badge bg="light" className="text-dark border">
                    Phase 1 cleanup
                  </Badge>
                </Card.Body>
              </Card>

              <Nav.Item className="mt-3 d-md-none">
                <Nav.Link onClick={onCollapse}>
                  <span className="sidebar-icon">
                    <FontAwesomeIcon icon={faTimes} />
                  </span>
                  <span className="sidebar-text">Close</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  );
}
