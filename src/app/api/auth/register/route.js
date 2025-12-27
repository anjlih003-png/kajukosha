import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    console.log('=== Registration Request Received ===');
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('Request body:', { ...requestBody, password: '***' });
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Invalid request data',
          error: parseError.message 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, email, password } = requestBody;
    
    // Input validation
    if (!name || !email || !password) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      
      const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
      console.error('Validation error:', errorMessage);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          message: errorMessage,
          missingFields 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMessage = 'Please enter a valid email address';
      console.error('Validation error:', errorMessage);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          message: errorMessage
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Password validation
    if (password.length < 6) {
      const errorMessage = 'Password must be at least 6 characters long';
      console.error('Validation error:', errorMessage);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          message: errorMessage
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Connecting to database...');
    let db;
    try {
      const dbConnection = await connectToDatabase();
      db = dbConnection.db;
      console.log('Successfully connected to database');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Database connection failed',
          error: dbError.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    try {
      // Check if user already exists
      console.log('Checking for existing user with email:', email);
      const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (existingUser) {
        console.log('User already exists with email:', email);
        return new Response(
          JSON.stringify({ 
            success: false,
            message: 'User already exists with this email',
            error: 'EMAIL_EXISTS'
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Hash password
      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user
      const newUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Creating new user...');
      const result = await db.collection('users').insertOne(newUser);
      console.log('User created with ID:', result.insertedId);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            _id: result.insertedId,
            ...userWithoutPassword
          },
          message: 'Registration successful'
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (dbError) {
      console.error('Database operation error:', {
        error: dbError,
        message: dbError.message,
        code: dbError.code,
        stack: dbError.stack
      });
      
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Database operation failed',
          error: dbError.message,
          code: dbError.code
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Registration Error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName,
      stack: error.stack,
      env: {
        MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
        JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'
      }
    });

    // More specific error messages
    let errorMessage = 'An unexpected error occurred';
    
    if (error.name === 'MongoServerError' && error.code === 11000) {
      errorMessage = 'This email is already registered';
    } else if (error.name === 'MongoNetworkError') {
      errorMessage = 'Could not connect to database. Please check your internet connection.';
    } else if (error.message.includes('MongoDB connection')) {
      errorMessage = 'Database connection failed. Please try again later.';
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        } 
      }
    );
  }
}