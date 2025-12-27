// src/app/login/page.js
'use client';

import { useState, useEffect } from 'react';  // Added useEffect
import { useRouter, useSearchParams } from 'next/navigation';  // Added useSearchParams
import { useAuth } from '@/context/AuthContext';

import Link from 'next/link';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');  // Added success message state
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();  // Added useSearchParams hook

  // Add this useEffect to handle the success message
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Registration successful! Please log in with your credentials.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { email });
      const result = await login(email, password);
      
      console.log('Login result:', result);
      
      if (result && result.success) {
        console.log('Login successful, redirecting to home page');
        router.push('/');
      } else {
        const errorMsg = result?.message || 'Login failed. Please check your credentials and try again.';
        console.error('Login failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login. Please try again.');
      
      // Check if the error is due to network issues
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h3 className="mb-1">Welcome Back</h3>
                <p className="text-muted">Sign in to continue to Kaju Kosha</p>
              </div>

              {successMessage && <Alert variant="success" className="rounded-3">{successMessage}</Alert>}
              {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

              {/* Rest of your form remains the same */}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-pill"
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label>Password</Form.Label>
                    <Link href="/forgot-password" className="text-decoration-none small">
                      Forgot password?
                    </Link>
                  </div>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-pill"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 rounded-pill py-2 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary text-decoration-none">
                      Sign up
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}