"use client";

import { useState } from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import { products } from "./productData";
import { useCart } from "./cart/CartContext";

const getWeight = (size) => {
  const weights = {
    "250gm": 0.25,
    "500gm": 0.5,
    "1kg": 1,
    "2kg": 2,
    "Default": 0.25, // assuming default is 250gm
  };
  return weights[size] || 0;
};

export default function Shop() {
  const { addToCart, totalWeight, setToastMessage, setShowToast, setToastType } = useCart();
  const [selectedSizes, setSelectedSizes] = useState({});

  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  return (
    <Container className="py-5">
      <h2 className="text-center fw-bold mb-4">Our Products</h2>
      <Row>
        {products.map((product, index) => (
          <Col md={3} sm={6} xs={12} key={`${product.id}-${index}`} className="mb-4">
            <Card className="h-100 text-center shadow-sm border-0">
              <Image
                src={product.image}
                alt={product.name}
                width={350}
                height={350}
                className="img-fluid d-inline-block rounded-top"
              />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text className="text-success fw-semibold">
                Sale Price {product.price}
                </Card.Text>
                {/* Size selector */}
                <div className="mb-3">
                  <div className="d-flex gap-2 flex-wrap justify-content-center">
                    {["250gm", "500gm", "1kg", "2kg"].map((sz) => {
                      const selectedSize = selectedSizes[product.id] || "250gm";
                      return (
                        <button
                          key={sz}
                          className={`btn btn-sm border-0 fw-semibold ${selectedSize === sz ? 'btn-warning text-dark shadow-sm' : 'btn-light text-muted'}`}
                          onClick={() => handleSizeChange(product.id, sz)}
                          style={{ fontFamily: 'var(--font-jost)', Width: '40px' }}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="d-flex justify-content-center gap-2">
                  <Link href={`/product/${product.id}`} passHref className="w-50">
                    <Button 
                      variant="outline-dark" 
                      size="sm" 
                      className="fw-semibold w-100"
                      style={{ fontFamily: 'var(--font-jost)' }} 
                    >
                      View Details
                    </Button>
                  </Link>

                  {/* add explicit default size & quantity when adding from list */}
                  <Button
                    variant="dark"
                    size="sm"
                    className="fw-semibold w-50"
                    style={{ fontFamily: 'var(--font-jost)' }}
                    onClick={() => {
                      const selectedSize = selectedSizes[product.id] || "250gm";
                      const weight = getWeight(selectedSize);
                      if (totalWeight + weight > 5) {
                        setToastMessage("Cannot add more than 5kg to cart");
                        setToastType("danger");
                        setShowToast(true);
                      } else {
                        addToCart({ ...product, size: selectedSize, quantity: 1 });
                      }
                    }}
                  >
                 <i className="bi bi-cart me-1"></i>Add to Cart
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
