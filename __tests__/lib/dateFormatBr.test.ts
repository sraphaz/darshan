import {
  toBrDate,
  fromBrDate,
  maskBrDate,
  maskBrTime,
  fromBrTime,
} from "@/lib/dateFormatBr";

describe("lib/dateFormatBr", () => {
  describe("toBrDate", () => {
    it("converte YYYY-MM-DD para DD/MM/AAAA", () => {
      expect(toBrDate("2025-01-15")).toBe("15/01/2025");
    });
    it("retorna vazio para undefined ou formato inválido", () => {
      expect(toBrDate(undefined)).toBe("");
      expect(toBrDate("")).toBe("");
      expect(toBrDate("15/01/2025")).toBe("");
      expect(toBrDate("2025-1-5")).toBe("");
    });
  });

  describe("fromBrDate", () => {
    it("converte DD/MM/AAAA para YYYY-MM-DD", () => {
      expect(fromBrDate("15/01/2025")).toBe("2025-01-15");
      expect(fromBrDate("15012025")).toBe("2025-01-15");
    });
    it("retorna vazio para string com menos de 8 dígitos", () => {
      expect(fromBrDate("150125")).toBe("");
    });
    it("retorna vazio para datas inválidas", () => {
      expect(fromBrDate("00/01/2025")).toBe("");
      expect(fromBrDate("32/01/2025")).toBe("");
      expect(fromBrDate("15/00/2025")).toBe("");
      expect(fromBrDate("15/13/2025")).toBe("");
    });
    it("retorna vazio para ano fora do intervalo 1900-2100", () => {
      expect(fromBrDate("15/01/1899")).toBe("");
      expect(fromBrDate("15/01/2101")).toBe("");
    });
  });

  describe("maskBrDate", () => {
    it("aplica máscara DD/MM/AAAA", () => {
      expect(maskBrDate("1")).toBe("1");
      expect(maskBrDate("15")).toBe("15");
      expect(maskBrDate("151")).toBe("15/1");
      expect(maskBrDate("1501")).toBe("15/01");
      expect(maskBrDate("15012025")).toBe("15/01/2025");
      expect(maskBrDate("15/01/2025")).toBe("15/01/2025");
    });
  });

  describe("maskBrTime", () => {
    it("aplica máscara HH:mm", () => {
      expect(maskBrTime("1")).toBe("1");
      expect(maskBrTime("12")).toBe("12");
      expect(maskBrTime("123")).toBe("12:3");
      expect(maskBrTime("1234")).toBe("12:34");
    });
  });

  describe("fromBrTime", () => {
    it("normaliza HH:mm", () => {
      expect(fromBrTime("12:34")).toBe("12:34");
      expect(fromBrTime("1234")).toBe("12:34");
      expect(fromBrTime("123")).toBe("12:3");
    });
    it("limita hora e minuto", () => {
      expect(fromBrTime("25:00")).toBe("23:00");
      expect(fromBrTime("12:99")).toBe("12:59");
    });
    it("retorna br quando menos de 3 dígitos", () => {
      expect(fromBrTime("1")).toBe("1");
      expect(fromBrTime("12")).toBe("12");
    });
  });
});
