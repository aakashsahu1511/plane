import React, { useState } from "react";
import { useRouter } from "next/router";
import { mutate } from "swr";
// services
import { ClipboardDocumentListIcon, PlusIcon } from "@heroicons/react/24/outline";
import type { NextPage } from "next";
import projectService from "services/project.service";
// layouts
import AppLayout from "layouts/app-layout";
// components
import { JoinProjectModal } from "components/project/join-project-modal";
import { ProjectCard } from "components/project";
import ConfirmProjectDeletion from "components/project/confirm-project-deletion";
// ui
import { HeaderButton, EmptySpace, EmptySpaceItem, Loader } from "components/ui";
import { Breadcrumbs, BreadcrumbItem } from "components/breadcrumbs";
// icons
// hooks
import useProjects from "hooks/use-projects";
import useWorkspaces from "hooks/use-workspaces";
// types
// constants
import { PROJECT_MEMBERS } from "constants/fetch-keys";

const ProjectsPage: NextPage = () => {
  // router
  const router = useRouter();
  const { workspaceSlug } = router.query;
  // context data
  const { activeWorkspace } = useWorkspaces();
  const { projects } = useProjects();
  // states
  const [deleteProject, setDeleteProject] = useState<string | null>(null);
  const [selectedProjectToJoin, setSelectedProjectToJoin] = useState<string | null>(null);

  return (
    <AppLayout
      breadcrumbs={
        <Breadcrumbs>
          <BreadcrumbItem title={`${activeWorkspace?.name ?? "Workspace"} Projects`} />
        </Breadcrumbs>
      }
      right={
        <HeaderButton
          Icon={PlusIcon}
          label="Add Project"
          onClick={() => {
            const e = new KeyboardEvent("keydown", { key: "p", ctrlKey: true });
            document.dispatchEvent(e);
          }}
        />
      }
    >
      <JoinProjectModal
        data={projects?.find((item) => item.id === selectedProjectToJoin)}
        onClose={() => setSelectedProjectToJoin(null)}
        onJoin={async () => {
          const project = projects?.find((item) => item.id === selectedProjectToJoin);
          if (!project) return;
          await projectService
            .joinProject(workspaceSlug as string, {
              project_ids: [project.id],
            })
            .then(async () => {
              mutate(PROJECT_MEMBERS(project.id));
              setSelectedProjectToJoin(null);
            })
            .catch(() => {
              setSelectedProjectToJoin(null);
            });
        }}
      />
      <ConfirmProjectDeletion
        isOpen={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        data={projects?.find((item) => item.id === deleteProject) ?? null}
      />
      {projects ? (
        <>
          {projects.length === 0 ? (
            <div className="grid h-full w-full place-items-center px-4 sm:px-0">
              <EmptySpace
                title="You don't have any project yet."
                description="Projects are a collection of issues. They can be used to represent the development work for a product, project, or service."
                Icon={ClipboardDocumentListIcon}
              >
                <EmptySpaceItem
                  title="Create a new project"
                  description={
                    <span>
                      Use{" "}
                      <pre className="inline rounded bg-gray-100 px-2 py-1">Ctrl/Command + P</pre>{" "}
                      shortcut to create a new project
                    </span>
                  }
                  Icon={PlusIcon}
                  action={() => {
                    const e = new KeyboardEvent("keydown", { key: "p", ctrlKey: true });
                    document.dispatchEvent(e);
                  }}
                />
              </EmptySpace>
            </div>
          ) : (
            <div className="h-full w-full space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((item) => (
                  <ProjectCard
                    key={item.id}
                    project={item}
                    workspaceSlug={(activeWorkspace as any)?.slug}
                    setToJoinProject={setSelectedProjectToJoin}
                    setDeleteProject={setDeleteProject}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <Loader className="grid grid-cols-3 gap-4">
          <Loader.Item height="100px" />
          <Loader.Item height="100px" />
          <Loader.Item height="100px" />
          <Loader.Item height="100px" />
          <Loader.Item height="100px" />
          <Loader.Item height="100px" />
        </Loader>
      )}
    </AppLayout>
  );
};

export default ProjectsPage;