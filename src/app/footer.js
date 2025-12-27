'use client';

import { Container, Row, Col, Form, Button } from "react-bootstrap";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../public/images/logo.png"; // Adjust path to your logo

export default function Footer() {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-5">
      <Container>
        <Row className="mb-4">
          {/* Logo & About */}
          <Col md={4} className="mb-3">
            <Link href="/">
              <Image src={Logo} alt="Kaju Kosha" width={150} height={52} />
            </Link>
            <p className="mt-3">
              Premium dry fruits supplier in India. Fresh, high-quality cashews, almonds, pistachios, and more delivered to your doorstep.
            </p>
          </Col>

          {/* Quick Links */}
          <Col md={2} className="mb-3">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link href="/" className="text-light text-decoration-none">Home</Link></li>
              <li><Link href="/#aboutus" className="text-light text-decoration-none">About Us</Link></li>
              <li><Link href="/#contact" className="text-light text-decoration-none">Contact</Link></li>
              <li><Link href="/products" className="text-light text-decoration-none">Shop</Link></li>
            </ul>
          </Col>

          {/* Contact Info */}
          <Col md={3} className="mb-3">
            <h5>Contact</h5>
            <p>Email: info@kajukosha.com</p>
            <p>Phone: +91 12345 67890</p>
            <p>Address: Jalandhar, Punjab, India</p>
          </Col>

          {/* Newsletter */}
          <Col md={3} className="mb-3">
            <h5>Newsletter</h5>
            <p>Subscribe to get latest offers and updates</p>
            <Form className="d-flex">
              <Form.Control
                type="email"
                placeholder="Enter email"
                className="rounded-start"
              />
              <Button variant="dark" className="rounded-end">
                Subscribe
              </Button>
            </Form>

            {/* Social Icons */}
            <div className="mt-3 d-flex gap-2">
              <Link href="#" className="text-light fs-5"><i className="bi bi-facebook"></i></Link>
              <Link href="#" className="text-light fs-5"><i className="bi bi-instagram"></i></Link>
              <Link href="#" className="text-light fs-5"><i className="bi bi-twitter"></i></Link>
              <Link href="#" className="text-light fs-5"><i className="bi bi-youtube"></i></Link>
            </div>
          </Col>
        </Row>

        <hr className="bg-light" />
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <p className="mb-0">&copy; {new Date().getFullYear()} Kaju Kosha. All rights reserved.</p>
          <p className="mb-0 text-light">FSSAI License: 22125020001653</p>
        </div>
      </Container>
    </footer>
  );
}
