import { useStyles } from "@/hooks/use-styles";
import { Modal, Pressable, StyleSheet, View } from "react-native";

interface Props {
  children: React.ReactNode;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export function ModalGeneric({ children, visible, setVisible }: Props) {
  const { globalStyles, colors } = useStyles();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setVisible(false)}
        />

        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.hardContainer },
          ]}
        >
          {/* On peut ajouter un View interne pour forcer le layout si besoin */}
          <View style={styles.innerContainer}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24, // Espace sur les côtés
  },
  modalContent: {
    width: "100%", // Prend toute la largeur moins le padding de l'overlay
    borderRadius: 20,
    padding: 20,
    // Sur Android, maxHeight peut bugger si le contenu n'est pas scrollable.
    // On utilise minHeight pour s'assurer qu'il ne s'écrase pas.
    minHeight: 300,
    elevation: 5,
  },
  innerContainer: {
    // Force les enfants à se disposer verticalement avec de l'espace
    width: "100%",
    gap: 12, // Ajoute un espace automatique entre chaque bouton/élément (React Native récent)
  },
});
