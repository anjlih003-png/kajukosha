// paste into browser console on your running site (or open this file in editor and copy)
// then run in browser console on http://localhost:3000
const order = {
  id: "1234",
  items: [
    { name: "Chocolate Cake", size: "Medium", quantity: 1, priceNumber: 500 }
  ],
  customer: {
    name: "Monika",
    email: "kajukosha@gmail.com",
    phone: "9877391718"
  },
  total: 500,
  createdAt: new Date().toISOString()
};

fetch("/api/order", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(order)
})
.then(res => res.json())
.then(data => console.log("Response:", data))
.catch(err => console.error("Error:", err));