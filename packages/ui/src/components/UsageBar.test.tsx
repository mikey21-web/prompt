import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UsageBar } from "./UsageBar";

describe("UsageBar", () => {
  it("shows used and limit", () => {
    render(<UsageBar used={10} limit={25} />);
    expect(screen.getByText("10 used")).toBeTruthy();
    expect(screen.getByText("25/day")).toBeTruthy();
  });

  it("caps at 100% visually when over limit", () => {
    const { container } = render(<UsageBar used={30} limit={25} />);
    const bar = container.querySelector("[style*='width']");
    expect(bar?.getAttribute("style")).toContain("100%");
  });

  it("uses red color when near limit", () => {
    const { container } = render(<UsageBar used={23} limit={25} />);
    const bar = container.querySelector(".bg-red-500");
    expect(bar).toBeTruthy();
  });

  it("uses yellow color in middle range", () => {
    const { container } = render(<UsageBar used={18} limit={25} />);
    const bar = container.querySelector(".bg-yellow-500");
    expect(bar).toBeTruthy();
  });

  it("uses green color at low usage", () => {
    const { container } = render(<UsageBar used={5} limit={25} />);
    const bar = container.querySelector(".bg-emerald-500");
    expect(bar).toBeTruthy();
  });
});
