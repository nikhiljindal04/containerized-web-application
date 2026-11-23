import mongoose from "mongoose";
import User from "./src/models/userModel.js";
import { MONGO_URI } from "./src/config/serverConfig.js";

const BASE_URL = "http://localhost:3000/api/v1/auth";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log("Connecting to MongoDB for test suite...");
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB Connected for tests.");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Cleanup test users before running
  await User.deleteMany({
    email: { $in: ["testuser@example.com", "adminuser@example.com", "duplicate@example.com"] },
  });

  try {
    // 1. Validation test: password too short
    console.log("\n--- Test 1: Validation on Signup (Password too short) ---");
    const res1 = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser",
        email: "testuser@example.com",
        password: "123",
      }),
    });
    const data1 = await res1.json();
    assert(res1.status === 400 && data1.success === false, "Returns 400 when password is under 6 chars");

    // 2. Signup regular user
    console.log("\n--- Test 2: Signup Regular User ---");
    const res2 = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
      }),
    });
    const data2 = await res2.json();
    assert(res2.status === 201 && data2.success === true, "Regular user registered with 201 Created");
    assert(data2.data.token != null, "JWT token returned on registration");
    assert(data2.data.user.password === undefined, "Password omitted from user response");
    assert(data2.data.user.role === "user", "Default role is 'user'");
    const userToken = data2.data.token;

    // 3. Signup duplicate email
    console.log("\n--- Test 3: Duplicate Email Check ---");
    const res3 = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "otheruser",
        email: "testuser@example.com",
        password: "password123",
      }),
    });
    const data3 = await res3.json();
    assert(res3.status === 409 && data3.success === false, "Returns 409 Conflict on duplicate email");

    // 4. Signup Admin user
    console.log("\n--- Test 4: Signup Admin User ---");
    const res4 = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "adminuser",
        email: "adminuser@example.com",
        password: "adminpassword123",
        role: "admin",
      }),
    });
    const data4 = await res4.json();
    assert(res4.status === 201 && data4.data.user.role === "admin", "Admin user registered with role 'admin'");
    const adminToken = data4.data.token;

    // 5. Signin with wrong password
    console.log("\n--- Test 5: Signin with Wrong Password ---");
    const res5 = await fetch(`${BASE_URL}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "testuser@example.com",
        password: "wrongpassword",
      }),
    });
    const data5 = await res5.json();
    assert(res5.status === 401 && data5.success === false, "Returns 401 on incorrect password");

    // 6. Signin with valid credentials
    console.log("\n--- Test 6: Signin with Valid Credentials ---");
    const res6 = await fetch(`${BASE_URL}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "testuser@example.com",
        password: "password123",
      }),
    });
    const data6 = await res6.json();
    assert(res6.status === 200 && data6.data.token != null, "Signed in successfully and received JWT");

    // 7. Protected route (/me) without token
    console.log("\n--- Test 7: Protected Route (/me) Without Token ---");
    const res7 = await fetch(`${BASE_URL}/me`);
    const data7 = await res7.json();
    assert(res7.status === 401 && data7.success === false, "Returns 401 Unauthorized when no token provided");

    // 8. Protected route (/me) with invalid token
    console.log("\n--- Test 8: Protected Route (/me) With Invalid Token ---");
    const res8 = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: "Bearer invalid.token.value" },
    });
    const data8 = await res8.json();
    assert(res8.status === 401 && data8.success === false, "Returns 401 Unauthorized with invalid token");

    // 9. Protected route (/me) with valid user token
    console.log("\n--- Test 9: Protected Route (/me) With Valid Token ---");
    const res9 = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data9 = await res9.json();
    assert(res9.status === 200 && data9.data.email === "testuser@example.com", "Returns user profile with valid Bearer token");

    // 10. Role-based Authorization: Regular user accessing Admin-only route
    console.log("\n--- Test 10: Authorization Check: Regular User Accessing Admin Route ---");
    const res10 = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data10 = await res10.json();
    assert(res10.status === 403 && data10.success === false, "Returns 403 Forbidden when role does not match");

    // 11. Role-based Authorization: Admin user accessing Admin-only route
    console.log("\n--- Test 11: Authorization Check: Admin User Accessing Admin Route ---");
    const res11 = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data11 = await res11.json();
    assert(res11.status === 200 && Array.isArray(data11.data), "Returns 200 and user list for Admin");

    // 12. Logout endpoint
    console.log("\n--- Test 12: Logout Endpoint ---");
    const res12 = await fetch(`${BASE_URL}/logout`, { method: "POST" });
    const data12 = await res12.json();
    assert(res12.status === 200 && data12.success === true, "Logout returns 200 and clears session");

  } finally {
    // Cleanup
    console.log("\nCleaning up test data in MongoDB...");
    await User.deleteMany({
      email: { $in: ["testuser@example.com", "adminuser@example.com", "duplicate@example.com"] },
    });
    console.log(`\nTest Summary: ${passed} Passed, ${failed} Failed.`);
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
