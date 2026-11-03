import tags from "~~/server/controllers/tags";

export default defineEventHandler(async () => {
  const data = await tags.findAllTags();
  return {
    count: data.length,
    data: data,
    message: "findAll",
  };
});
