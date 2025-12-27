"use client";

import { Container, Row, Col, Card, ListGroup, Button } from "react-bootstrap";
import { useCart } from "../cart/CartContext";
import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

export default function CheckoutPage() {
    const { cart } = useCart();
    const router = useRouter();

    // Safe number helper
    const safeNum = (val) => {
        if (!val) return 0;
        const clean = String(val).replace(/[^\d.]/g, "");
        const num = Number(clean);
        return isNaN(num) ? 0 : num;
    };

    const { subtotal, gstTotal, deliveryTotal, finalTotal, itemCount } =
        useMemo(() => {
            if (!cart || cart.length === 0)
                return {
                    subtotal: 0,
                    gstTotal: 0,
                    deliveryTotal: 0,
                    finalTotal: 0,
                    itemCount: 0,
                };

            let sub = 0;
            let count = 0;

            cart.forEach((item) => {
                const qty = safeNum(item.quantity) || 1;
                const price = safeNum(item.price);
                sub += price * qty;
                count += qty;
            });

            const gst = sub * 0.05;
            const delivery = sub < 500 ? 50 : 0;

            return {
                subtotal: sub,
                gstTotal: gst,
                deliveryTotal: delivery,
                finalTotal: sub + gst + delivery,
                itemCount: count,
            };
        }, [cart]);


    if (!cart || cart.length === 0) {
        return (
            <Container className="py-5 text-center">
                <h2>Your cart is empty</h2>
                <Link href="/products" className="btn btn-dark mt-3 px-4 rounded-pill">
                    Shop Now
                </Link>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold">Checkout</h2>

            <Row>
                <Col md={8}>
                    <Card className="mb-4 border-0 shadow-sm">
                        <Card.Header className="bg-white fw-bold py-3">
                            Order Summary
                        </Card.Header>

                        <ListGroup variant="flush">
                            {cart.map((item) => {
                                const qty = safeNum(item.quantity) || 1;
                                const price = safeNum(item.price);
                                const total = price * qty;

                                return (
                                    <ListGroup.Item
                                        key={`${item.id}-${item.size}`}
                                        className="py-3"
                                    >
                                        <div className="d-flex align-items-center">
                                            <div
                                                style={{
                                                    width: "70px",
                                                    height: "70px",
                                                    position: "relative",
                                                }}
                                                className="me-3"
                                            >
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="rounded"
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </div>

                                            <div className="flex-grow-1 d-flex justify-content-between">
                                                <div>
                                                    <h6 className="fw-bold mb-1">{item.name}</h6>
                                                    <small className="text-muted">
                                                        Size: {item.size} | Qty: {qty}
                                                    </small>
                                                </div>
                                                <div className="fw-bold">₹{total.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                );
                            })}
                        </ListGroup>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-light">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4">Price Details</h5>

                            <div className="d-flex justify-content-between mb-2">
                                <span>Base Price ({itemCount} items)</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <span>GST (5%)</span>
                                <span>₹{gstTotal.toFixed(2)}</span>
                            </div>

                            <div className="d-flex justify-content-between mb-3">
                                <span>Delivery Charges</span>
                                <span className="text-success">
                                    {deliveryTotal > 0 ? `₹${deliveryTotal.toFixed(2)}` : "Free"}
                                </span>
                            </div>

                            {deliveryTotal > 0 && (
                                <small className="text-muted d-block mt-1">
                                    A delivery charge of ₹50 has been applied as the order value is below ₹500.
                                </small>
                            )}

                            <hr />

                            <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                                <span>Total Payable</span>
                                <span>₹{finalTotal.toFixed(2)}</span>
                            </div>

                            <Button
                                variant="dark"
                                className="w-100 py-3 rounded-pill fw-bold"
                                onClick={() => router.push("/address")}
                            >
                                Proceed to Address
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
