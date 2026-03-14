type ZodFactory = {
  object: (...args: any[]) => any;
  string: () => any;
  literal: (value: string) => any;
  array: (schema: any) => any;
};

export function createProjectSchema(zod: ZodFactory, imageSchema: any) {
  const projectImage = zod.object({
    image: imageSchema,
    alt: zod.string().trim().min(1),
    label: zod.string().trim().min(1).optional(),
  });

  return zod.object({
    title: zod.string().trim().min(1),
    template: zod.literal("room-loop"),
    description: zod.string().trim().min(1).optional(),
    walls: zod.array(projectImage).length(4),
    ceiling: projectImage.optional(),
  });
}
