import { MainButton } from "@/components/generic/main-button";
import {
  getHomeGeneratorColorFromTags,
  getHomeGeneratorConfig,
  getHomeGeneratorImageFromTags,
} from "@/constants/home-generators";
import {
  HomeContextGenerator,
  useHomeGenerators,
} from "@/contexts/home-generators-context";
import { getGeneratorColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

interface HomeGeneratorButtonProps {
  project: HomeContextGenerator;
  currentUserId?: string;
}

export default function HomeGeneratorButton({
  project,
  currentUserId,
}: HomeGeneratorButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useStyles();
  const { setActiveGeneratorId } = useHomeGenerators();
  const routeImage = getHomeGeneratorConfig(project.routeType)?.image;
  const tagImage = getHomeGeneratorImageFromTags(project.tags);
  const image =
    project.source === "official"
      ? (routeImage ?? tagImage)
      : (tagImage ?? routeImage);

  const subtitle =
    project.source === "official"
      ? t("screen:home.generator_source_official")
      : project.owner_id === currentUserId
        ? t("screen:home.generator_source_you")
        : t("screen:home.generator_source_user", {
            username: project.ownerUsername ?? project.owner_id.slice(0, 8),
          });

  const cardColor =
    project.color ??
    (project.source === "official"
      ? getGeneratorColor({
          label: project.routeType,
          theme,
        })
      : getHomeGeneratorColorFromTags(project.tags));

  return (
    <MainButton
      title={project.name}
      subtitle={subtitle}
      description={project.description}
      tags={project.tags}
      color={cardColor}
      image={image}
      onPress={() => {
        // Generators is a sibling route, so we store the selected generator in shared context first.
        setActiveGeneratorId(project.id);
        router.push({
          pathname: "/generators",
          params: { id: project.id, type: project.routeType },
        });
      }}
    />
  );
}
