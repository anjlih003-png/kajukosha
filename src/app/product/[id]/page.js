"use client";

import { useState, useMemo } from "react"; // useMemo for price calculation performance
import { useParams, useRouter } from "next/navigation";
import { products } from "../../productData"; // Ensure this path is correct
import Image from "next/image";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
} from "react-bootstrap";
import { useCart } from "@/app/cart/CartContext"; // Ensure this path is correct
import "bootstrap/dist/css/bootstrap.min.css";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Link from "next/link";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";


// आपको यहां Bootstrap Icons CSS भी इंपोर्ट करना होगा यदि आप bi bi-cart का उपयोग कर रहे हैं।
// जैसे: import 'bootstrap-icons/font/bootstrap-icons.css';

const getWeight = (size) => {
  const weights = {
    "250gm": 0.25,
    "500gm": 0.5,
    "1kg": 1,
    "2kg": 2,
    "Default": 0.25,
  };
  return weights[size] || 0;
};

// Price multipliers based on size (Assuming basePrice is for 250gm)
const sizeMultipliers = {
  "250gm": 1,
  "500gm": 2,
  "1kg": 4,
  "2kg": 8,
};

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, totalWeight, setToastMessage, setShowToast, setToastType } = useCart();

  // Quantity
  const [quantity, setQuantity] = useState(1);
  const MAX_QUANTITY = 15;

  // Sizes and selection
  const sizes = ["250gm", "500gm", "1kg", "2kg"];
  const [selectedSize, setSelectedSize] = useState("250gm");

  const product = products.find((p) => String(p.id) === id);

  // --- Delivery Checker State ---
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState({
    status: null, // null, 'checking', 'available', 'unavailable', 'error'
    message: "",
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // --- Reset quantity and delivery on size change ---
  const handleSizeChange = (newSize) => {
    setSelectedSize(newSize);
    setQuantity(1); // Reset quantity for better UX
    setDeliveryInfo({ status: null, message: "" }); // Reset delivery info
  };

  // --- Price and Weight Calculation (using useMemo for optimization) ---
  const { weightPerUnit, maxAllowed, basePrice, pricePerUnit, subtotal, gstAmount, totalPrice } = useMemo(() => {
    if (!product) return { weightPerUnit: 0, maxAllowed: 0, basePrice: 0, pricePerUnit: 0, subtotal: 0, gstAmount: 0, totalPrice: 0 };
    const weightPerUnit = getWeight(selectedSize);
    const maxAllowedWeight = 5 - totalWeight;
    const maxAllowed = Math.min(MAX_QUANTITY, Math.max(0, Math.floor(maxAllowedWeight / weightPerUnit)));

    // Safe parsing: Convert to string first to handle numbers or undefined safely
    const basePrice = parseFloat(String(product.price || '0').replace(/[^\d.]/g, "")) || 0;
    const pricePerUnit = basePrice * (sizeMultipliers[selectedSize] || 1);
    
    const subtotal = pricePerUnit * quantity;
    const gstAmount = subtotal * 0.18; // 18% GST
    const totalPrice = subtotal + gstAmount;

    return { weightPerUnit, maxAllowed, basePrice, pricePerUnit, subtotal, gstAmount, totalPrice };
  }, [product, selectedSize, quantity, totalWeight]);


  const increment = () =>
    setQuantity((q) => (q < maxAllowed ? q + 1 : q));
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    const newWeight = quantity * weightPerUnit;

    if (totalWeight + newWeight > 5) {
      setToastMessage("Cannot add more than 5kg to cart (Limit Reached)");
      setToastType("danger");
      setShowToast(true);
      return;
    }

    addToCart({
      ...product,
      size: selectedSize,
      quantity,
      price: pricePerUnit, // per unit price for selected size
      subtotal: subtotal,
      gst: gstAmount,
      total: totalPrice,
      deliveryCharge: deliveryCharge,
      pincode: pincode,
      deliveryDate: selectedDate,
      deliveryTime: selectedTime
    });
    setToastMessage(`${product.name} (${selectedSize} x ${quantity}) added!`);
    setToastType("success");
    setShowToast(true);
    // Add toast to display message (using context toast if available)
  };

  const handleBuyNow = () => {
    const newWeight = quantity * weightPerUnit;

    if (totalWeight + newWeight > 5) {
      setToastMessage("Cannot add more than 5kg to cart (Limit Reached)");
      setToastType("danger");
      setShowToast(true);
      return;
    }

    addToCart({
      ...product,
      size: selectedSize,
      quantity,
      price: pricePerUnit,
      subtotal: subtotal,
      gst: gstAmount,
      total: totalPrice,
      deliveryDate: selectedDate,
      deliveryTime: selectedTime,
      pincode: pincode,
      deliveryCharge: deliveryCharge
    });
    router.push("/checkout");
  };

  // --- Delivery Logic ---
  const pincodeData = {
    "110001": 40,
    "400001": 60,
    "560001": 80,
    "800001": 50,
    "834001": 50,
    "144001": 30
  };
  const deliveryTimeSlots = ["Morning (9am - 12pm)", "Afternoon (1pm - 4pm)", "Evening (5pm - 8pm)"];


  const handleCheckDelivery = () => {
    if (!pincode || pincode.length !== 6) {
      setDeliveryInfo({ status: "error", message: "Please enter a valid 6-digit pincode." });
      return;
    }
    setDeliveryInfo({ status: "checking", message: "Checking availability..." });

    setTimeout(() => {
      if (pincodeData[pincode]) {
        const charge = pincodeData[pincode];
        setDeliveryCharge(charge);
        setDeliveryInfo({ status: "available", message: `Great! Delivery is available. Delivery Charges: ₹${charge}` });
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split("T")[0]); // Pre-select tomorrow
      } else {
        setDeliveryInfo({ status: "unavailable", message: "Sorry, delivery is not available for this pincode." });
      }
    }, 1000); // Simulate network delay
  };


  if (!product)
    return <h3 className="text-center mt-5">Product not found</h3>;

  return (
    <Container className="py-3">
      {/* Breadcrumb */}
       <Breadcrumb className="mb-4 pistachio-breadcrumb">
      <Breadcrumb.Item linkAs={Link} href="/">
        Home
      </Breadcrumb.Item>
      <Breadcrumb.Item linkAs={Link} href="/products">
        Products
      </Breadcrumb.Item>
      <Breadcrumb.Item active>
        {product.name}
      </Breadcrumb.Item>
    </Breadcrumb>



      {/* Product Card - Use full white card with gentle shadow for premium look */}
      <Card className="border-0  ">
        <Row className="g-0"> {/* g-0 removes gutter for seamless design */}
          {/* Image Column */}
          <Col md={6} className="text-center" style={{ backgroundColor: '#f8f9fa', borderTopLeftRadius: '1rem', borderBottomLeftRadius: '1rem' }}>
            <div className="position-relative" style={{ height: '400px', width: '100%' }}>
              <Image
                src={product.image}
                alt={product.name}
                layout="fill"
                objectFit="contain"
                className="img-fluid rounded-4"
              />
            </div>
          </Col>

          {/* Details Column */}
          <Col md={6} className="p-md-5 p-4">
            <h1 className="fw-bolder mb-3" style={{ textTransform: 'uppercase', color: '#343a40' }}>{product.name}</h1>
            <p className="text-secondary mb-4 lead" style={{ fontSize: '1.1rem' }}>{product.desc}</p>

            {/* Price Display */}
            <h3 className="fw-bolder mb-3" style={{ color: '#28a745' }}> {/* Primary color for price */}
              ₹{(subtotal + (deliveryInfo.status === 'available' ? deliveryCharge : 0)).toFixed(2)}
            </h3>

            {/* Product Details Table/List */}
            <div className="mb-4">
                <small className="d-block mb-1"><strong>Nutrition:</strong> {product.nutrition}</small>
                <small className="d-block mb-1"><strong>Ingredients:</strong> {product.ingredients}</small>
                <small className="d-block mb-1"><strong>Origin:</strong> {product.origin}</small>
                <small className="d-block mb-1"><strong>Shelf Life:</strong> {product.shelfLife}</small>
                <small className="d-block"><strong>Storage:</strong> {product.storage}</small>
            </div>


            {/* Size selector */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold mb-3">Select Size</Form.Label>
              <div className="d-flex gap-2 flex-wrap">
                {sizes.map((sz, idx) => (
                  <div key={sz}>
                    <input
                      type="radio"
                      className="btn-check"
                      name="size"
                      id={`size-${idx}`}
                      autoComplete="off"
                      value={sz}
                      checked={selectedSize === sz}
                      onChange={(e) => handleSizeChange(e.target.value)}
                    />
                    <label
                      className={`btn ${selectedSize === sz ? 'btn-dark text-white shadow-sm' : 'btn-outline-secondary text-dark'} px-4 py-2`}
                      htmlFor={`size-${idx}`}
                      style={{ borderRadius: '8px', minWidth: '70px', fontWeight: '500' }}
                    >
                      {sz}
                    </label>
                  </div>
                ))}
              </div>
            </Form.Group>

            {/* Delivery Pincode Checker - HIDDEN */}
            <Form.Group className="mb-4 d-none">
              <Form.Label className="fw-bold mb-2">Check Delivery Availability</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Form.Control
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  style={{ maxWidth: "150px" }}
                />
                <Button variant="outline-dark" onClick={handleCheckDelivery} disabled={deliveryInfo.status === 'checking'}>
                  {deliveryInfo.status === 'checking' ? 'Checking...' : 'Check'}
                </Button>
              </div>
              {deliveryInfo.message && (
                <div className={`mt-2 small ${
                    deliveryInfo.status === 'available' ? 'text-success' :
                    deliveryInfo.status === 'unavailable' || deliveryInfo.status === 'error' ? 'text-danger' : 'text-muted'
                }`}>
                  {deliveryInfo.message}
                </div>
              )}
            </Form.Group>

            {/* Date and Time Slot Selector (Conditional) - HIDDEN */}
            <div className="d-none">
            {deliveryInfo.status === 'available' && (
              <Card className="p-3 bg-light border-0 mb-4">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">1. Select Delivery Date</Form.Label>
                  <Flatpickr
                    className="form-control"
                    value={selectedDate}
                    onChange={([date]) => {
                      const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                      setSelectedDate(offsetDate.toISOString().split('T')[0]);
                    }}
                    options={{
                      minDate: "today",
                      dateFormat: "Y-m-d",
                    }}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className="fw-bold">2. Select Time Slot</Form.Label>
                  <div className="d-flex gap-2 flex-wrap">
                    {deliveryTimeSlots.map(slot => (
                      <div key={slot}>
                        <input type="radio" className="btn-check" name="deliveryTime" id={`time-${slot}`} value={slot} checked={selectedTime === slot} onChange={(e) => setSelectedTime(e.target.value)} />
                        <label className={`btn btn-sm ${selectedTime === slot ? 'btn-success' : 'btn-outline-success'}`} htmlFor={`time-${slot}`}>
                          {slot}
                        </label>
                      </div>
                    ))}
                  </div>
                </Form.Group>
              </Card>
            )}
            </div>


            {/* Quantity */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold mb-3">Quantity</Form.Label>
              <div className="d-flex align-items-stretch" style={{ width: '150px' }}>
                <Button
                  variant="outline-dark" // Consistent dark border
                  onClick={decrement}
                  disabled={quantity <= 1}
                  style={{ borderRadius: '50px 0 0 50px' }}
                >
                  −
                </Button>
                <span className="flex-grow-1 text-center py-2 fw-semibold border-top border-bottom border-dark">
                  {quantity}
                </span>
                <Button
                  variant="outline-dark"
                  onClick={increment}
                  disabled={quantity >= maxAllowed || maxAllowed < 1}
                  style={{ borderRadius: '0 50px 50px 0' }}
                >
                  +
                </Button>
              </div>
                {maxAllowed < 1 && <small className="text-danger mt-2 d-block">Maximum cart weight (5kg) reached.</small>}
            </Form.Group>

            {/* Action Buttons */}
            <div className="d-flex gap-3 mt-3">
              <Button
                variant="outline-dark"
                className="rounded-pill px-4 py-3 fw-bold flex-grow-1"
                onClick={handleAddToCart}
                disabled={maxAllowed < 1}
              >
                <i className="bi bi-cart me-2"></i>Add to Cart
              </Button>
              <Button
                variant="dark"
                className="rounded-pill px-4 py-3 fw-bold flex-grow-1"
                onClick={handleBuyNow}
                disabled={maxAllowed < 1}
              >
                Buy Now
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}