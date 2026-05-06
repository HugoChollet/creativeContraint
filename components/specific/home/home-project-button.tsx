import { MainButton } from "@/components/generic/main-button";
import {
  getHomeProjectConfig,
  getHomeProjectType,
} from "@/constants/home-projects";
import { getProjectColor } from "@/constants/theme";
import { useProfile } from "@/hooks/use-profile";
import { useStyles } from "@/hooks/use-styles";
import { Project } from "@/types/projects";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export interface HomeProjectRecord {
  id: string;
  name: string;
  description: string;
  language?: Project["language"];
  tags?: Project["tags"];
  color?: string;
  is_public: boolean;
  owner_id: string;
  source: Project["source"];
}

interface ProfileRecord {
  id: string;
  username: string | null;
}

const EMPTY_PROFILE: ProfileRecord = {
  id: "",
  username: null,
};

interface HomeProjectButtonProps {
  project: HomeProjectRecord;
  currentUserId?: string;
}

export default function HomeProjectButton({
  project,
  currentUserId,
}: HomeProjectButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useStyles();
  const config = getHomeProjectConfig(project.name);
  const routeType = getHomeProjectType(project.name) ?? project.name;
  const shouldFetchOwnerProfile =
    project.source !== "official" && project.owner_id !== currentUserId;
  const { data: ownerProfile } = useProfile<ProfileRecord>(
    "profiles",
    EMPTY_PROFILE,
    {
      profileId: project.owner_id,
      enabled: shouldFetchOwnerProfile,
    },
  );

  const subtitle =
    project.source === "official"
      ? t("screen:home.project_source_official")
      : project.owner_id === currentUserId
        ? t("screen:home.project_source_you")
        : t("screen:home.project_source_user", {
            username: ownerProfile.username ?? project.owner_id.slice(0, 8),
          });

  const cardColor = getProjectColor({
    label: routeType,
    color: project.color,
    theme,
  });

  return (
    <MainButton
      title={project.name}
      subtitle={subtitle}
      description={project.description}
      tags={project.tags}
      color={cardColor}
      image={config?.image}
      onPress={() =>
        router.push({
          pathname: "/lab",
          params: { id: project.id, type: routeType },
        })
      }
    />
  );
}
