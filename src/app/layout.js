import "./style.css";

import { AuthProvider } from '@/context/AuthContext'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Inter } from "next/font/google";
import Header from "./navbar";
import Footer from "./footer";
import { CartProvider } from "./cart/CartContext";


// Load Inter font with optimized configuration
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Only include weights you actually use
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif']
});

export const metadata = {
  title: "Dry Fruit Wholesale Supplier in India | Kaju Kosha",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans`} style={{ fontFamily: '"Inter", sans-serif' }}>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
