import { acceptHMRUpdate, defineStore } from "pinia";
import type { CreateProject, Project } from "~/types";
import { useTokenStore } from "./tokenStore";

export const useProjectsStore = defineStore("project", () => {
  const n = useNotifications();

  const tokenStore = useTokenStore();

  const allProjects = ref<Project[]>([]);

  const projects = computed<Project[]>(() => allProjects.value);

  const currentProjectId = ref<number>()
  const currentProject = computed<Project | undefined>(() => {
    return projects.value.find((src) => src.id === currentProjectId.value);
  });

  const loading = ref(false);

  const fetchAllProjects = async () => {
    const url = "/api/projects";
    loading.value = true;
    try {
      const response = await tokenStore.get(url);
      allProjects.value = response.data;
    } finally {
      loading.value = false;
    }
  };

  // const fetchSingleProject = async (projectId: number) => {
  //   const url = `/api/project/${projectId}`;
  //   loading.value = true;
  //   try {
  //     const response = await tokenStore.get(url);
  //     allProjects.value = allProjects.value.filter((proj) => proj.id !== projectId);
  //     allProjects.value.push(response.data);
  //   } finally {
  //     loading.value = false;
  //   }
  // };

  const patchProject = async (projId: number, projectData: any) => {
    loading.value = true;
    const url = "/api/projects";
    projectData.id = projId;
    try {
      const newProject = await tokenStore.patch(url, projectData);
      allProjects.value = allProjects.value.filter((proj) => proj.id !== projId);
      allProjects.value.push(newProject.data);
    } finally {
      loading.value = false;
    }
  };

  const createProject = async (projectdata: CreateProject) => {
    loading.value = true;
    const url = "/api/projects";
    try {
      const response = await tokenStore.post(url, projectdata);
      const newProject = response.data;
      allProjects.value.push(newProject);
      return newProject;
    } finally {
      loading.value = false;
    }
  };

  // const deleteSource = async (sourceData: DeleteSource) => {
  //   loading.value = true;
  //   const url = "/api/sources";
  //   try {
  //     const newSource = await tokenStore.del(url, sourceData);
  //     allSources.value = allSources.value.filter((s) => s.id !== sourceData.id);
  //     n.addNotification({ text: "Deleted", level: "success" });
  //   } finally {
  //     loading.value = false;
  //   }
  // };

  return {
    allProjects,
    projects,
    fetchAllProjects,
    createProject,
    patchProject,
    currentProjectId,
    currentProject,
    loading,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSourcesStore, import.meta.hot));
}
