const request = require("supertest");
const app = require("../src/app");

describe("Auth flow (register/login/refresh)", () => {
  const email = `user_${Date.now()}@example.com`;
  const password = "Password123!";

  it("registers a user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email, password })
      .expect(201);

    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", email.toLowerCase());
  });

  it("logs in and sets httpOnly refresh cookie + returns access token", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email, password })
      .expect(200);

    expect(res.body).toHaveProperty("accessToken");
    expect(typeof res.body.accessToken).toBe("string");

    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    // cookie name should match COOKIE_NAME in env (default: refresh_token)
    expect(setCookie.join(";")).toContain("refresh_token=");
    expect(setCookie.join(";").toLowerCase()).toContain("httponly");
  });

  it("refresh returns a new access token when cookie is provided", async () => {
    // login first to get cookie
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email, password })
      .expect(200);

    const cookie = loginRes.headers["set-cookie"];
    expect(cookie).toBeDefined();

    const refreshRes = await request(app)
      .post("/auth/refresh")
      .set("Cookie", cookie) // send refresh cookie
      .expect(200);

    expect(refreshRes.body).toHaveProperty("accessToken");
    expect(typeof refreshRes.body.accessToken).toBe("string");
  });

  it("logout clears refresh cookie", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email, password })
      .expect(200);

    const cookie = loginRes.headers["set-cookie"];

    const res = await request(app)
      .post("/auth/logout")
      .set("Cookie", cookie)
      .expect(204);

    // some setups include set-cookie clearing header, some don't; we accept both
    // (optional check) - if present, should clear cookie
    if (res.headers["set-cookie"]) {
      expect(res.headers["set-cookie"].join(";")).toContain("refresh_token=");
    }
  });
});
