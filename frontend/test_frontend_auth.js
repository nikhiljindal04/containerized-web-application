import axios from "axios";

const BACKEND_URL = "http://localhost:3000";
const FRONTEND_URL = "http://localhost:5173";

async function runIntegrationTest() {
  console.log("=== Starting Frontend <-> Backend Auth Integration Tests ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, description) {
    if (condition) {
      console.log(`✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${description}`);
      failed++;
    }
  }

  // 1. Check Frontend Dev Server is serving the SPA routes
  console.log("\n[1] Testing Frontend Vite Dev Server routes:");
  try {
    const rootRes = await fetch(`${FRONTEND_URL}/`);
    assert(rootRes.status === 200, "Frontend root (/) responded with 200 OK");
    const rootHtml = await rootRes.text();
    assert(rootHtml.includes('<div id="root"></div>'), "Frontend serves index.html with #root element");

    const signupRes = await fetch(`${FRONTEND_URL}/signup`);
    assert(signupRes.status === 200, "Frontend /signup route served by Vite (200 OK)");

    const signinRes = await fetch(`${FRONTEND_URL}/signin`);
    assert(signinRes.status === 200, "Frontend /signin route served by Vite (200 OK)");
  } catch (err) {
    console.error("Vite server check failed:", err.message);
    failed++;
  }

  // 2. Test Frontend API Client functions against Backend
  console.log("\n[2] Testing Frontend API Client with Backend:");
  const testEmail = `fe_user_${Date.now()}@example.com`;
  const testUsername = `fe_user_${Date.now()}`.slice(0, 18);
  const testPassword = "Password123!";

  const client = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  // A. Signup Test
  let token = null;
  let userId = null;
  try {
    const signupRes = await client.post("/api/v1/auth/signup", {
      username: testUsername,
      email: testEmail,
      password: testPassword,
    });

    assert(signupRes.status === 201, "Signup API returned 201 Created");
    assert(signupRes.data.success === true, "Signup response success is true");
    assert(signupRes.data.data.token != null, "Signup returned JWT token");
    assert(signupRes.data.data.user.email === testEmail, "Signup returned matching user email");
    assert(signupRes.data.data.user.password === undefined, "User password is redacted");

    token = signupRes.data.data.token;
    userId = signupRes.data.data.user._id;
  } catch (err) {
    console.error("Signup test failed:", err.response?.data || err.message);
    failed++;
  }

  // B. Duplicate Signup check
  try {
    await client.post("/api/v1/auth/signup", {
      username: testUsername,
      email: testEmail,
      password: testPassword,
    });
    assert(false, "Duplicate signup should have failed");
  } catch (err) {
    assert(err.response?.status === 409, "Duplicate signup correctly rejected with 409 Conflict");
    assert(err.response?.data?.message?.includes("already exists"), "Duplicate signup returns helpful error message");
  }

  // C. Signin with incorrect password
  try {
    await client.post("/api/v1/auth/signin", {
      identifier: testEmail,
      password: "WrongPassword!",
    });
    assert(false, "Invalid password signin should have failed");
  } catch (err) {
    assert(err.response?.status === 401, "Invalid password rejected with 401 Unauthorized");
    assert(err.response?.data?.message?.includes("Invalid"), "Invalid password error message returned");
  }

  // D. Signin with email and valid password
  try {
    const signinRes = await client.post("/api/v1/auth/signin", {
      identifier: testEmail,
      password: testPassword,
    });

    assert(signinRes.status === 200, "Signin with email returned 200 OK");
    assert(signinRes.data.data.token != null, "Signin returned valid JWT token");
    assert(signinRes.data.data.user.username === testUsername, "Signin returned user profile");
    token = signinRes.data.data.token;
  } catch (err) {
    console.error("Signin test failed:", err.response?.data || err.message);
    failed++;
  }

  // E. Signin with username and valid password
  try {
    const signinUserRes = await client.post("/api/v1/auth/signin", {
      identifier: testUsername,
      password: testPassword,
    });

    assert(signinUserRes.status === 200, "Signin with username returned 200 OK");
    assert(signinUserRes.data.data.user.email === testEmail, "Signin by username matches account email");
  } catch (err) {
    console.error("Signin by username failed:", err.response?.data || err.message);
    failed++;
  }

  // F. Authenticated GET /api/v1/auth/me using Authorization header
  try {
    const profileRes = await client.get("/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert(profileRes.status === 200, "Protected /api/v1/auth/me accessible with Bearer token");
    assert(profileRes.data.data.username === testUsername, "Profile data matches authenticated user");
  } catch (err) {
    console.error("Profile test failed:", err.response?.data || err.message);
    failed++;
  }

  // G. Logout API
  try {
    const logoutRes = await client.post("/api/v1/auth/logout");
    assert(logoutRes.status === 200, "Logout API returned 200 OK");
  } catch (err) {
    console.error("Logout test failed:", err.response?.data || err.message);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Integration Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runIntegrationTest().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
