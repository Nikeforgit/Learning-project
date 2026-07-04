import { getFilterMode } from "./filterTest";

describe("getFilterMode", () => {
    test("range", () => {
        expect(
            getFilterMode({ min: true, max: true })
        ).toBe("range");
    });
    test("min", () => {
        expect(
            getFilterMode({ min: true, max: false })
        ).toBe("min");
    });
    test("max", () => {
        expect(
            getFilterMode({min: false, max: true })
        ).toBe("max");
    })
    test("off", () => {
        expect(
            getFilterMode({ min: false, max: false })
        ).toBe("off")
    });
});