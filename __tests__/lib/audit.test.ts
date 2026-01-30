import { audit } from "@/lib/audit";

const fs = require("fs");
jest.mock("fs", () => ({
  existsSync: jest.fn(() => false),
  mkdirSync: jest.fn(),
  appendFileSync: jest.fn(),
}));

describe("lib/audit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(false);
  });

  it("grava linha no audit.log com event e subject", () => {
    audit("login_email", "a@b.com");
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.appendFileSync).toHaveBeenCalled();
    const [path, line] = (fs.appendFileSync as jest.Mock).mock.calls[0];
    expect(path).toContain("audit.log");
    expect(line).toContain("login_email");
    expect(line).toContain("a@b.com");
  });

  it("inclui details quando passado", () => {
    audit("credits_add", "u@x.com", { amount: 50, balanceAfter: 150 });
    const [, line] = (fs.appendFileSync as jest.Mock).mock.calls[0];
    expect(line).toContain("credits_add");
    expect(line).toContain("50");
    expect(line).toContain("150");
  });

  it("não quebra quando appendFileSync lança", () => {
    (fs.appendFileSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error("disk full");
    });
    const spy = jest.spyOn(console, "error").mockImplementation();
    expect(() => audit("logout", "a@b.com")).not.toThrow();
    expect(spy).toHaveBeenCalledWith("[audit] write failed:", expect.any(Error));
    spy.mockRestore();
  });
});
