import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createProjectSchema } from "./projects";

describe("createProjectSchema", () => {
  it("accepts a room-loop project with exactly four walls", () => {
    const schema = createProjectSchema(z, z.string());

    const parsed = schema.parse({
      title: "Groh-FDE1",
      template: "room-loop",
      description: "Four-wall room loop",
      walls: [
        { image: "wall-1.jpg", alt: "Wall one", label: "North" },
        { image: "wall-2.jpg", alt: "Wall two", label: "East" },
        { image: "wall-3.jpg", alt: "Wall three", label: "South" },
        { image: "wall-4.jpg", alt: "Wall four", label: "West" },
      ],
    });

    expect(parsed.walls).toHaveLength(4);
  });

  it("rejects room-loop projects that do not have four walls", () => {
    const schema = createProjectSchema(z, z.string());

    const result = schema.safeParse({
      title: "Too Short",
      template: "room-loop",
      walls: [
        { image: "wall-1.jpg", alt: "Wall one" },
        { image: "wall-2.jpg", alt: "Wall two" },
        { image: "wall-3.jpg", alt: "Wall three" },
      ],
    });

    expect(result.success).toBe(false);
  });
});
