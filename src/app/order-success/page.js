"use client";

import { Container, Card, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <Container className="py-5 text-center">
      <Card className="shadow-sm border-0 rounded-4 p-5">
        <Card.Body>
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success display-1"></i>
          </div>
          <h2 className="mb-3 fw-bold text-success">Order Received!</h2>
          <p className="lead text-muted mb-4">
            Thank you for your order. We have received it and will process it shortly.
          </p>
          <Link href="/products" className="btn btn-dark rounded-pill px-4 py-2">
            Continue Shopping
          </Link>
        </Card.Body>
      </Card>
    </Container>
  );
}
