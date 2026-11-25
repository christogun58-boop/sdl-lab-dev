const express = require("express");
const path = require("path");
const { evaluateTriage } = require("./triageEngine");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// In-memory store for quick prototyping
const bookings = [];

// 1. Triage Assessment Endpoint
app.post("/api/triage", (req, res) => {
  const { patientName, symptoms } = req.body;
  if (!patientName || !Array.isArray(symptoms)) {
    return res.status(400).json({ error: "patientName and symptoms[] are required." });
  }

  const result = evaluateTriage(symptoms);
  res.json({ patientName, ...result });
});

// 2. Book Appointment Endpoint
app.post("/api/bookings", (req, res) => {
  const { patientName, phone, priority, slot } = req.body;
  if (!patientName || !phone || !slot) {
    return res.status(400).json({ error: "patientName, phone, and slot are required." });
  }

  const booking = {
    id: `BK-${Date.now()}`,
    patientName,
    phone,
    priority: priority || "GREEN",
    slot,
    status: "CONFIRMED",
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);
  res.status(201).json({ message: "Appointment confirmed", booking });
});

// 3. View All Bookings (Clinic Queue)
app.get("/api/bookings", (req, res) => {
  res.json({ total: bookings.length, bookings });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Telemedicine Hub running on http://localhost:${PORT}`));
