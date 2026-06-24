const axios = require('axios');

async function testBooking() {
  try {
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      email: "test_student123@cuet.ac.bd",
      password: "password123"
    });
    const token = loginRes.data.token;

    // test fetching bookings for resource on date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const getRes = await axios.get(`http://localhost:8080/api/bookings/resource/15/date/${dateStr}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Bookings:", getRes.data);

  } catch (err) {
    if (err.response) {
      console.error("FAILED:", err.response.status, err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
}

testBooking();
