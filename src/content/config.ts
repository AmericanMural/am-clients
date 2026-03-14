import { defineCollection, z } from "astro:content";

import { createProjectSchema } from "../lib/projects";

const projects = defineCollection({
  type: "content",
  schema: ({ image }) => createProjectSchema(z, image()),
});

export const collections = {
  projects,
};
