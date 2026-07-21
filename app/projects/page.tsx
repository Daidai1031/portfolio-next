import ProjectsClient from "./ProjectsClient";
import { getAllProjects } from "@/lib/projects";

export default function AllProjectsPage() {
  const allProjects = getAllProjects();

  return <ProjectsClient projects={allProjects} />;
}
