import projects from "../../controllers/projects";


export default defineEventHandler(async () => {
    const data = await projects.findAll();
    return {
        count: data.length,
        data: data,
        message: 'findAll'
    };
})