import { AddButton } from "@/components/generic/add-button";
import { MainButton } from "@/components/generic/main-button";
import { HOME_PROJECTS } from "@/constants/home-projects";
import { useHomeProjects } from "@/contexts/home-projects-context";
import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

export default function GuestHomeView() {
  const router = useRouter();
  const { t } = useTranslation();
  const { globalStyles, theme, colors } = useStyles();
  const { clearActiveProject } = useHomeProjects();

  return (
    <View style={globalStyles.screenContainer}>
      <Text style={[globalStyles.title, { marginBottom: 20 }]}>
        {t("screen:home.project_choice")}
      </Text>

      <ScrollView>
        {HOME_PROJECTS.map((project) => (
          <MainButton
            key={project.type}
            title={t(project.labelKey)}
            color={getProjectColor({ label: project.type, theme })}
            image={project.image}
            onPress={() => {
              clearActiveProject();
              router.push({
                pathname: "/lab",
                params: { id: 1, type: project.type },
              });
            }}
          />
        ))}
        <AddButton
          projectColor={colors.tint}
          label={t("screen:lab.add-button.label-project")}
          onClick={() =>
            router.push({
              pathname: "/project-browse",
              params: { id: 1, type: "new" },
            })
          }
        />
      </ScrollView>
    </View>
  );
}
