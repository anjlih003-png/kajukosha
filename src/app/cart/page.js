"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { Container, Table, Button } from "react-bootstrap";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, total } = useCart();
  const router = useRouter();

  if (!cart || cart.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h3>Your cart is empty 🛍️</h3>
        <Link href="/" className="btn btn-dark mt-3">
          Continue Shopping
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Your Cart</h2>
      <div className="table-responsive">
        <Table striped bordered hover className="align-middle mb-0">
          <thead>
            <tr>
              <th>Product</th>
              <th>Variant</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Line Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, idx) => {
              const priceNum =
                Number(item.priceNumber) || Number(String(item.price).replace(/[^0-9.]/g, "")) || 0;
              const lineTotal = priceNum * (Number(item.quantity) || 1);

              return (
                <tr key={`${item.id}-${item.size || "default"}-${idx}`}>
                  <td>
                    <Link
                      href={`/product/${item.id}`}
                      className="d-flex align-items-center gap-2 text-decoration-none text-reset"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={50}
                        height={50}
                        className="rounded"
                      />
                      <span>{item.name}</span>
                    </Link>
                  </td>
                  <td>{item.size || "Default"}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price}</td>
                  <td>₹{lineTotal}</td>
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeFromCart(item)}
                    >
                      <i className="bi bi-trash" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={4} className="text-end fw-bold">
                Total:
              </td>
              <td colSpan={2} className="fw-bold">
                ₹{total}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>

      <div className="text-end mt-3">
        <Button variant="outline-danger" className="me-2" onClick={clearCart}>
          Clear Cart
        </Button>
        <Button variant="dark" onClick={() => router.push("/checkout")}>
          Checkout
        </Button>
      </div>
    </Container>
  );
}
