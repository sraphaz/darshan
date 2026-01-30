import { logger } from "@/lib/logger";

const fs = require("fs");
jest.mock("fs", () => ({
  existsSync: jest.fn(() => false),
  mkdirSync: jest.fn(),
  appendFileSync: jest.fn(),
}));

describe("lib/logger", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(false);
  });

  it("chama appendFileSync ao logar error", () => {
    logger.error("test error");
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.appendFileSync).toHaveBeenCalled();
    const call = (fs.appendFileSync as jest.Mock).mock.calls[0];
    expect(call[1]).toContain("test error");
    expect(call[1]).toContain("ERROR");
  });

  it("chama appendFileSync ao logar info", () => {
    logger.info("test info");
    expect(fs.appendFileSync).toHaveBeenCalled();
    const call = (fs.appendFileSync as jest.Mock).mock.calls[0];
    expect(call[1]).toContain("test info");
  });

  it("aceita meta no segundo argumento", () => {
    logger.warn("warn msg", { code: 429 });
    const call = (fs.appendFileSync as jest.Mock).mock.calls[0];
    expect(call[1]).toContain("429");
  });

  it("debug chama write", () => {
    const orig = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = "debug";
    logger.debug("debug msg");
    expect(fs.appendFileSync).toHaveBeenCalled();
    process.env.LOG_LEVEL = orig;
  });

  it("não quebra quando appendFileSync lança", () => {
    (fs.appendFileSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error("disk full");
    });
    const spy = jest.spyOn(console, "error").mockImplementation();
    expect(() => logger.error("fail")).not.toThrow();
    expect(spy).toHaveBeenCalledWith("[logger] write failed:", expect.any(Error));
    spy.mockRestore();
  });

  it("chama mkdirSync quando diretório não existe", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    logger.info("test");
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it("não chama mkdirSync quando diretório já existe", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    logger.warn("test");
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });
});
