'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar, Nav, Form, Button, Badge, Dropdown, Toast, Container } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { useCart } from "./cart/CartContext";
// import Logo from "../../public/images/logo.png";



export default function Header() {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { cart, totalItems, toastMessage, showToast, hideToast, toastType } = useCart();

  // client-only state to avoid SSR/CSR mismatch
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setMounted(true);

    const readUser = () => {
      try {
        const raw = localStorage.getItem("user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch (e) {
        setUser(null);
      }
    };

    readUser();

    const onAuthChanged = () => readUser();

    // listen custom event (same tab) and storage (other tabs)
    window.addEventListener("authChanged", onAuthChanged);
    window.addEventListener("storage", onAuthChanged);

    return () => {
      window.removeEventListener("authChanged", onAuthChanged);
      window.removeEventListener("storage", onAuthChanged);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
    setSearchTerm("");
    setExpanded(false);
  };

  const handleLogout = () => {
    try { localStorage.removeItem("user"); } catch (e) { }
    setUser(null);
    // optionally clear cart: if your context exposes clearCart you can call it here
    router.push("/login");
  };

  return (
    <>
      {/* Toast */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }} aria-live="polite" aria-atomic="true">
        <Toast onClose={hideToast} show={showToast} delay={2000} autohide bg="success">
          <Toast.Header closeButton={false}>
            <strong className="me-auto">
              <i className="bi bi-check-circle-fill me-2" />
              {toastMessage}
            </strong>
          </Toast.Header>
        </Toast>
      </div>

    <Navbar expand="lg" bg="white" className="shadow-sm sticky-top" expanded={expanded}>
  <Container fluid>
    {/* Logo Section - Left aligned */}
    <Navbar.Brand as={Link} href="/" className="me-0 me-lg-4">
      {/* <Image 
        src={Logo} 
        alt="Kaju Kosha" 
        width={180} 
        height={62} 
        className="d-inline-block align-top"
        priority
      /> */}
      <img src="/images/logo.png"   className="d-inline-block align-top" alt="Logo"    width={180} 
        height={62} />
    </Navbar.Brand>

    {/* Mobile Toggle Button */}
    <Navbar.Toggle 
      aria-controls="main-navbar" 
      onClick={() => setExpanded(!expanded)}
      className="border-0"
    />

    {/* Main Navigation */}
    <Navbar.Collapse id="main-navbar">
      {/* Center-aligned Navigation Links */}
      <Nav className="mx-auto my-3 my-lg-0">
        <Nav.Link href="#aboutus" className="px-3" onClick={() => setExpanded(false)}>
          About Us
        </Nav.Link>
        <Nav.Link href="/products" className="px-3" onClick={() => setExpanded(false)}>
          Our Products
        </Nav.Link>
        <Nav.Link href="/contact" className="px-3" onClick={() => setExpanded(false)}>
          Contact Us
        </Nav.Link>
      </Nav>

      {/* Right-aligned Icons and Actions */}
      <div className="d-flex align-items-center gap-3">
        {/* Search Form */}
        <Form className="d-none d-md-flex" onSubmit={handleSearch}>
          <div className="position-relative">
            <Form.Control
              type="search"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-pill ps-3 pe-5"
              style={{ minWidth: '200px' }}
            />
            <Button 
              variant="link" 
              type="submit" 
              className="position-absolute end-0 top-50 translate-middle-y p-0 me-2"
              style={{ transform: 'translateY(-50%)' }}
            >
              <i className="bi bi-search text-muted"></i>
            </Button>
          </div>
        </Form>

        {/* Cart Icon */}
        <Link 
          href="/cart" 
          className="position-relative text-decoration-none text-dark"
          onClick={() => setExpanded(false)}
        >
          <i className="bi bi-cart3 fs-5"></i>
          {mounted && totalItems > 0 && (
            <Badge 
              pill 
              bg="danger" 
              className="position-absolute top-0 start-100 translate-middle"
              style={{ fontSize: '0.6rem' }}
            >
              {totalItems}
            </Badge>
          )}
        </Link>

        {/* User Actions */}
       {mounted ? (
  user ? (
    <Dropdown className="ms-2" align="end">
      <Dropdown.Toggle variant="link" id="userDropdown">
        <i className="bi bi-person-circle fs-5"></i>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.ItemText className="fw-bold">{user.name}</Dropdown.ItemText>
        <Dropdown.Divider />
        <Dropdown.Item as={Link} href="/account" onClick={() => setExpanded(false)}>
          <i className="bi bi-person me-2"></i>My Account
        </Dropdown.Item>
        <Dropdown.Item as="button" className="text-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  ) : (
    <Link href="/login" className="btn btn-outline-primary btn-sm ms-2" onClick={() => setExpanded(false)}>
      Login
    </Link>
  )
) : (
  <div className="ms-2" style={{ width: '60px' }}></div>
)}
      </div>
    </Navbar.Collapse>
  </Container>
</Navbar>


      {/* Toast */}
      <div
        className="position-fixed top-0 end-0 p-3"
        style={{ zIndex: 1080 }}
        aria-live="polite"
        aria-atomic="true"
      >
        <Toast
          onClose={hideToast}
          show={showToast}
          delay={3000}
          autohide
          bg={toastType}
          className="shadow-lg rounded-3 text-white"
        >
          <Toast.Header className={`bg-${toastType} text-white`}>
            <i className={`bi ${toastType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
            <strong className="me-auto">
              {toastType === 'success' ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </div>
    </>
  );
}
