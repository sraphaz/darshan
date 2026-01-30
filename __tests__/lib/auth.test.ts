import {
  getSessionFromCookie,
  sessionCookieHeader,
  clearSessionCookieHeader,
  type Session,
} from "@/lib/auth";

describe("lib/auth", () => {
  describe("sessionCookieHeader e getSessionFromCookie", () => {
    it("round-trip: header gerado é lido de volta", () => {
      const session: Session = { email: "a@b.com" };
      const header = sessionCookieHeader(session);
      const parsed = getSessionFromCookie(header);
      expect(parsed?.email).toBe("a@b.com");
    });

    it("getSessionFromCookie retorna null para header null", () => {
      expect(getSessionFromCookie(null)).toBeNull();
    });

    it("getSessionFromCookie retorna null quando cookie não existe", () => {
      expect(getSessionFromCookie("other=val")).toBeNull();
    });

    it("sessionCookieHeader contém Path e HttpOnly", () => {
      const h = sessionCookieHeader({ email: "x@y.com" });
      expect(h).toContain("Path=/");
      expect(h).toContain("HttpOnly");
    });

    it("getSessionFromCookie retorna null para sessão com email vazio", () => {
      const header = sessionCookieHeader({ email: "" });
      expect(getSessionFromCookie(header)).toBeNull();
    });

    it("getSessionFromCookie retorna null para valor malformado no cookie", () => {
      expect(getSessionFromCookie("darshan_session=not-valid-base64!!!")).toBeNull();
      expect(getSessionFromCookie("darshan_session=")).toBeNull();
    });
  });

  describe("clearSessionCookieHeader", () => {
    it("retorna header que limpa a sessão", () => {
      const h = clearSessionCookieHeader();
      expect(h).toContain("darshan_session=;");
      expect(h).toContain("Max-Age=0");
    });
  });
});
