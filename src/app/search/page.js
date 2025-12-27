'use client'; // <-- THIS IS REQUIRED

import { useSearchParams } from "next/navigation";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import { products } from "../productData"; // adjust path
import { useCart } from "../cart/CartContext";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  const { addToCart } = useCart();

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.desc.toLowerCase().includes(query)
  );

  return (
    <Container className="py-5">
      <h2 className="mb-4">Search Results for "{query}"</h2>

      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <Row>
          {filteredProducts.map((product) => (
            <Col md={4} sm={6} xs={12} key={product.id} className="mb-4">
              <Card className="h-100 text-center shadow-sm border-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={350}
                  height={350}
                  className="img-fluid rounded-top"
                />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text className="text-success fw-semibold">
                    {product.price}
                  </Card.Text>
                  <div className="d-flex justify-content-center gap-2">
                    <Link href={`/product/${product.id}`} passHref>
                      <Button variant="outline-dark" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="dark"
                      size="sm"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
