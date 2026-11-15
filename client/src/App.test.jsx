import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

vi.stubGlobal("fetch", async (url) => {
  if (url.endsWith("/api/classes")) return { ok: true, json: async () => [
    { id: 8, title: "Saturday Spin", coach: "Dan", starts_at: "2026-10-17T09:00:00", capacity: 4, booked: 3 }
  ]};
  return { ok: true, json: async () => [] };
});

test("renders spots left correctly", async () => {
  render(<App />);
  expect(await screen.findByText("Almost full! 1 left")).toBeTruthy();
});
