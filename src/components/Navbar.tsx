import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

const Navigation: React.FunctionComponent = () => {
    const handleClick = () => {
      document.cookie = 'ssid=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      location.reload();
    };
  
    return (
      <Navbar bg="dark" variant="dark" sticky="top">
        <Container className="row justify-content-between">
          <Navbar.Brand>AmongUs AI</Navbar.Brand>
          <Nav className="me-auto">
            <NavDropdown
              title="Settings"
              id="basic-nav-dropdown"
              className="justify-content-center">
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleClick}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          {/* </Navbar.Collapse> */}
        </Container>
      </Navbar>
    );
  };
  
  export default Navigation;