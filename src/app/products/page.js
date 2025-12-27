"use client";

import { useState, useMemo } from "react";
import { Container, Row, Col, Card, Button, Form, Badge } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import { products } from "../productData";
import { useCart } from "../cart/CartContext";

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

function parsePrice(val) {
    if (!val) return 0;
    if (typeof val === "number") return val;
    const m = String(val).match(/[\d]+(?:\.[\d]+)?/);
    return m ? parseFloat(m[0]) : 0;
}

export default function ProductsPage() {
    const { addToCart, totalWeight, setToastMessage, setShowToast, setToastType } = useCart();

    // Filter state
    const [query, setQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState(new Set());
    const [selectedSizes, setSelectedSizes] = useState(new Set());
    const [priceRange, setPriceRange] = useState([0, 1000]); // [min, max]
    const [sortBy, setSortBy] = useState("");

    // Size selection for products
    const [productSelectedSizes, setProductSelectedSizes] = useState({});

    // Derived lists
    const categories = useMemo(() => Array.from(new Set(products.map(p => p.category || "General"))).sort(), []);
    const sizes = useMemo(() => {
        const s = new Set();
        products.forEach(p => {
            if (Array.isArray(p.sizes)) p.sizes.forEach(sz => s.add(sz));
            else if (p.size) s.add(p.size);
        });
        return Array.from(s).sort();
    }, []);

    const makeToggle = (setter) => (value) => setter(prev => {
        const next = new Set(prev);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        return next;
    });

    const toggleCategory = makeToggle(setSelectedCategories);
    const toggleSize = makeToggle(setSelectedSizes);

    // Filtered products
    const filtered = useMemo(() => {
        let list = products.filter(p => {
            const priceNum = parsePrice(p.price);

            // Search filter
            const q = query.trim().toLowerCase();
            if (q && !(p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))) return false;

            // Category filter
            if (selectedCategories.size > 0) {
                const cat = p.category || "General";
                if (!selectedCategories.has(cat)) return false;
            }

            // Size filter
            if (selectedSizes.size > 0) {
                const productSizes = Array.isArray(p.sizes) ? p.sizes : p.size ? [p.size] : ["Default"];
                if (!productSizes.some(sz => selectedSizes.has(sz))) return false;
            }

            // Price range filter
            if (priceNum < priceRange[0] || priceNum > priceRange[1]) return false;

            return true;
        });

        // Sorting (do not mutate original array)
        if (sortBy === "price-asc") list = [...list].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        if (sortBy === "price-desc") list = [...list].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));

        return list;
    }, [query, selectedCategories, selectedSizes, priceRange, sortBy]);

    const clearFilters = () => {
        setQuery("");
        setSelectedCategories(new Set());
        setSelectedSizes(new Set());
        setPriceRange([0, 1000]);
        setSortBy("");
    };

    const handleSizeChange = (productId, size) => {
        setProductSelectedSizes(prev => ({ ...prev, [productId]: size }));
    };

    return (
        <Container className="py-5">
            <h1 className="text-center mb-5" >Our Products</h1>
            <Row>
                {/* Filter Panel */}
                <Col md={3}>
                    <Card className="mb-3">
                        <Card.Body style={{ fontFamily: 'var(--font-inter)', textAlign: 'left' }}>
                            <h5 className="mb-3">Filters</h5>

                            <Form.Group className="mb-3">
                                <Form.Label>Search</Form.Label>
                                <Form.Control type="search" placeholder="Search products..." value={query} onChange={e => setQuery(e.target.value)} />
                            </Form.Group>

                            <hr />
                            <Form.Label className="fw-semibold">Category</Form.Label>
                            {categories.map(cat => (
                                <Form.Check key={cat} type="checkbox" id={`cat-${cat}`} label={cat} checked={selectedCategories.has(cat)} onChange={() => toggleCategory(cat)} />
                            ))}

                            <hr />
                            <Form.Label className="fw-semibold">Size</Form.Label>
                            {sizes.length === 0 ? <div className="text-muted small">No size options</div> :
                                sizes.map(sz => <Form.Check key={sz} type="checkbox" id={`size-${sz}`} label={sz} checked={selectedSizes.has(sz)} onChange={() => toggleSize(sz)} />)}

                            <hr />
                            <Form.Label className="fw-semibold">Price Range</Form.Label>
                            <div className="mb-3 px-2">
                                <div className="d-flex gap-2 align-items-center">
                                    <Form.Control
                                        type="number"
                                        min={0}
                                        value={priceRange[0]}
                                        onChange={(e) => {
                                            const min = Number(e.target.value || 0);
                                            setPriceRange(prev => [Math.min(min, prev[1]), prev[1]]);
                                        }}
                                    />
                                    <span className="mx-1">—</span>
                                    <Form.Control
                                        type="number"
                                        min={0}
                                        value={priceRange[1]}
                                        onChange={(e) => {
                                            const max = Number(e.target.value || 0);
                                            setPriceRange(prev => [prev[0], Math.max(max, prev[0])]);
                                        }}
                                    />
                                </div>
                                <div className="d-flex justify-content-between mt-1">
                                    <small>₹{priceRange[0]}</small>
                                    <small>₹{priceRange[1]}</small>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between">
                                <Button variant="outline-secondary" size="sm" onClick={clearFilters}>Clear</Button>
                                <Badge bg="info" pill>{filtered.length}</Badge>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Products Grid */}
                <Col md={9}>
                    <Row xs={1} sm={2} lg={3} className="g-4">
                        {filtered.map((product, idx) => {
                            const productSizes = Array.isArray(product.sizes) ? product.sizes : product.size ? [product.size] : ["Default"];
                            const defaultSize = productSizes[0] || "Default";

                            return (
                                <Col key={`${product.id}-${idx}`}>
                                    <Card className="h-100 shadow-sm">
                                        <Link href={`/product/${product.id}`} className="text-decoration-none text-reset">
                                            <div style={{ height: 220, position: "relative", overflow: "hidden" }}>
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    width={420}
                                                    height={220}
                                                    style={{ objectFit: "contain", width: "100%", height: "220px" }}
                                                    className="img-fluid"
                                                />
                                            </div>
                                        </Link>
                                        <Card.Body className="d-flex flex-column">
                                            <h6 className="card-title mb-1">{product.name}</h6>
                                            <div className="mb-2 text-success fw-semibold">{product.price}</div>
                                            <div className="mb-3">
                                                <div className="d-flex gap-2 flex-wrap justify-content-start">
                                                    {productSizes.map((sz) => {
                                                        const selectedSize = productSelectedSizes[product.id] || productSizes[0];
                                                        return (
                                                            <button
                                                                key={sz}
                                                                className={`btn btn-sm border-0 fw-semibold ${selectedSize === sz ? 'btn-warning text-dark shadow-sm' : 'btn-light text-muted'}`}
                                                                onClick={() => handleSizeChange(product.id, sz)}
                                                                style={{ fontFamily: 'var(--font-jost)', minWidth: '50px', fontSize: '12px' }}
                                                            >
                                                                {sz}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="mt-auto d-flex gap-2">
                                                <Link href={`/product/${product.id}`} className="btn btn-outline-dark btn-sm">View Details</Link>
                                                <Button variant="dark" size="sm" onClick={() => {
                                                    const selectedSize = productSelectedSizes[product.id] || productSizes[0];
                                                    const weight = getWeight(selectedSize);
                                                    if (totalWeight + weight > 5) {
                                                        setToastMessage("Cannot add more than 5kg to cart");
                                                        setToastType("danger");
                                                        setShowToast(true);
                                                    } else {
                                                        addToCart({ ...product, size: selectedSize, quantity: 1 });
                                                    }
                                                }}>
                                                    <span className="me-2"><i className="bi bi-cart"></i></span>Add to Cart
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>

                    {filtered.length === 0 && <div className="text-center mt-5 text-muted">No products found for selected filters.</div>}
                </Col>
            </Row>
        </Container>
    );
}
