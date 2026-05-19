import { MainButton } from "@/components/generic/main-button";
import {
  getHomeProjectColorFromTags,
  getHomeProjectConfig,
  getHomeProjectImageFromTags,
} from "@/constants/home-projects";
import {
  HomeContextProject,
  useHomeProjects,
} from "@/contexts/home-projects-context";
import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

interface HomeProjectButtonProps {
  project: HomeContextProject;
  currentUserId?: string;
}

export default function HomeProjectButton({
  project,
  currentUserId,
}: HomeProjectButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useStyles();
  const { setActiveProjectId } = useHomeProjects();
  const routeImage = getHomeProjectConfig(project.routeType)?.image;
  const tagImage = getHomeProjectImageFromTags(project.tags);
  const image =
    project.source === "official"
      ? (routeImage ?? tagImage)
      : (tagImage ?? routeImage);

  const subtitle =
    project.source === "official"
      ? t("screen:home.project_source_official")
      : project.owner_id === currentUserId
        ? t("screen:home.project_source_you")
        : t("screen:home.project_source_user", {
            username: project.ownerUsername ?? project.owner_id.slice(0, 8),
          });

  const cardColor =
    project.color ??
    (project.source === "official"
      ? getProjectColor({
          label: project.routeType,
          theme,
        })
      : getHomeProjectColorFromTags(project.tags));

  return (
    <MainButton
      title={project.name}
      subtitle={subtitle}
      description={project.description}
      tags={project.tags}
      color={cardColor}
      image={image}
      onPress={() => {
        // Lab is a sibling route, so we store the selected project in shared context first.
        setActiveProjectId(project.id);
        router.push({
          pathname: "/lab",
          params: { id: project.id, type: project.routeType },
        });
      }}
    />
  );
}
