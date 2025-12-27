"use client";

import { Container, Card, Button, Form, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../cart/CartContext";

export default function PaymentPage() {
  const router = useRouter();
  const { cart, clearCart, total } = useCart();
  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load address from localStorage
    const savedAddress = localStorage.getItem("shippingAddress");
    if (savedAddress) {
      setAddress(JSON.parse(savedAddress));
    } else {
      // If no address, redirect back to address page
      router.push("/address");
    }
  }, [router]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!address) return;
    setLoading(true);
    setError("");

    try {
      if (paymentMethod === "online") {
        const res = await loadRazorpay();
        if (!res) {
          setError("Razorpay SDK failed to load. Are you online?");
          setLoading(false);
          return;
        }

        // 1. Create Order on Server
        const orderRes = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total }),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || "Server error");

        // 2. Open Razorpay Options
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Kaju Store",
          description: "Purchase of dry fruits",
          order_id: orderData.id,
          handler: async function (response) {
             // 3. Verify Payment
             const verifyRes = await fetch("/api/payment/verify", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                 razorpay_order_id: response.razorpay_order_id,
                 razorpay_payment_id: response.razorpay_payment_id,
                 razorpay_signature: response.razorpay_signature,
               }),
             });

             const verifyData = await verifyRes.json();
             if (verifyData.verified) {
               // 4. Place Final Order
               await submitOrder("online", response.razorpay_payment_id);
             } else {
               setError("Payment verification failed");
               setLoading(false);
             }
          },
          prefill: {
            name: address.fullName,
            email: "customer@example.com",
            contact: address.phoneNumber,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        
      } else {
        // COD Order
        await submitOrder("cod");
      }
    } catch (err) {
      console.error("Order error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const submitOrder = async (method, paymentId = null) => {
      try {
        const orderData = {
            id: Date.now().toString(),
            items: cart,
            customer: {
              name: address.fullName,
              email: "customer@example.com",
              phone: address.phoneNumber,
              address: address
            },
            total: total,
            paymentMethod: method,
            paymentId: paymentId,
            createdAt: new Date().toISOString(),
          };
    
          const res = await fetch("/api/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
          });
    
          const data = await res.json();
    
          if (res.ok && data.ok) {
            clearCart();
            router.push("/order-success");
          } else {
            setError(data.error || "Failed to place order. Please try again.");
            setLoading(false);
          }
      } catch (err) {
          setError("Failed to submit order.");
          setLoading(false);
      }
  };

  return (
    <Container className="py-5 text-center">
      <h2 className="mb-4 fw-bold">Payment</h2>
      <Card className="shadow-sm border-0 rounded-4 p-5">
        <Card.Body>
          <h4 className="mb-4">Choose Payment Method</h4>
          
          {error && <Alert variant="danger">{error}</Alert>}

          {address && (
            <div className="mb-4 text-start bg-light p-3 rounded">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Shipping Address</strong>
                    <Button variant="link" size="sm" onClick={() => router.push("/address")}>Edit</Button>
                </div>
                <div>{address.fullName}</div>
                <div>{address.addressLine1}, {address.addressLine2 ? address.addressLine2 + ',' : ''} {address.city}</div>
                <div>{address.state} - {address.zipCode}</div>
                <div>Phone: {address.phoneNumber}</div>
            </div>
          )}

          <div className="mb-4 d-flex gap-3 text-start">
            <Form.Check 
              type="radio"
              id="online"
              label="Online Payment (UPI, Cards, NetBanking)"
              name="paymentMethod"
              value="online"
              checked={paymentMethod === "online"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mb-2 p-3 border rounded"
            />
            <Form.Check 
              type="radio"
              id="cod"
              label="Cash on Delivery (COD)"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mb-2 p-3 border rounded"
            />
          </div>

        <div className="d-flex gap-3">

          <Button 
            variant="dark" 
            className="w-100   rounded-pill fw-bold  " 
            onClick={handlePlaceOrder}
            disabled={loading || cart.length === 0}
          >
            {loading ? "Processing..." : `Place Order (₹${total.toFixed(2)})`}
          </Button>
          
          <Button variant="outline-secondary" className="btn-outline-dark w-100 rounded-pill" onClick={() => router.push("/address")}>
            Back to Address
          </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
