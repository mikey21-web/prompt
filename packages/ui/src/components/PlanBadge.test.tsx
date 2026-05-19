import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlanBadge } from "./PlanBadge";

describe("PlanBadge", () => {
  it("renders Free for free plan", () => {
    render(<PlanBadge plan="free" />);
    expect(screen.getByText("Free")).toBeTruthy();
  });

  it("renders Pro for pro plan", () => {
    render(<PlanBadge plan="pro" />);
    expect(screen.getByText("Pro")).toBeTruthy();
  });

  it("renders Team for team plan", () => {
    render(<PlanBadge plan="team" />);
    expect(screen.getByText("Team")).toBeTruthy();
  });
});
