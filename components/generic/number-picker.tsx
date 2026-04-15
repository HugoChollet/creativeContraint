import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NumberPickerProps {
  min: number;
  max: number;
  initialValue?: number;
  onValueChange: (value: number) => void;
  step?: number;
}

const ITEM_HEIGHT = 20;
const VISIBLE_ITEMS = 3;

export const NumberPicker: React.FC<NumberPickerProps> = ({
  min,
  max,
  initialValue = min,
  onValueChange,
  step = 1,
}) => {
  const { globalStyles, colors } = useStyles();
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const listRef = useRef<FlatList<string | number>>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const data = useMemo(() => {
    const items = [];
    for (let i = min; i <= max; i += step) {
      items.push(i);
    }
    return items;
  }, [min, max, step]);

  // Spacers for top and bottom centering
  const listData = ["", ...data, ""];

  useEffect(() => {
    setSelectedValue(initialValue);
    const selectedIndex = data.indexOf(initialValue);

    if (selectedIndex >= 0) {
      listRef.current?.scrollToOffset({
        offset: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [data, initialValue]);

  useEffect(
    () => () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    },
    [],
  );

  const updateValue = useCallback(
    (yOffset: number) => {
      const index = Math.round(yOffset / ITEM_HEIGHT);
      const newValue = data[index];

      if (newValue !== undefined && newValue !== selectedValue) {
        setSelectedValue(newValue);
        onValueChange(newValue);
      }
    },
    [data, selectedValue, onValueChange],
  );

  const snapToNearestValue = useCallback(
    (yOffset: number, animated = true) => {
      const index = Math.max(
        0,
        Math.min(data.length - 1, Math.round(yOffset / ITEM_HEIGHT)),
      );
      const snappedOffset = index * ITEM_HEIGHT;

      listRef.current?.scrollToOffset({
        offset: snappedOffset,
        animated,
      });

      updateValue(snappedOffset);
    },
    [data.length, updateValue],
  );

  const adjustValue = useCallback(
    (direction: 1 | -1) => {
      const currentIndex = data.indexOf(selectedValue);

      if (currentIndex < 0) {
        return;
      }

      const nextIndex = Math.max(
        0,
        Math.min(data.length - 1, currentIndex + direction),
      );

      if (nextIndex === currentIndex) {
        return;
      }

      snapToNearestValue(nextIndex * ITEM_HEIGHT);
    },
    [data, selectedValue, snapToNearestValue],
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;

    if (Platform.OS === "web") {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        snapToNearestValue(y);
      }, 100); // 100ms threshold to assume scroll has stopped
    }
  };

  const handleScrollEndDrag = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    snapToNearestValue(event.nativeEvent.contentOffset.y);
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    snapToNearestValue(
      event.nativeEvent.contentOffset.y,
      Platform.OS !== "web",
    );
  };

  const renderItem = ({ item }: { item: string | number }) => {
    const isSelected = item === selectedValue;
    return (
      <View
        style={{
          height: ITEM_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={[
            globalStyles.text,
            styles.label,
            { color: isSelected ? colors.text : colors.textDiscreet },
            isSelected && styles.selectedLabel,
          ]}
        >
          {item}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            height: ITEM_HEIGHT * VISIBLE_ITEMS,
            backgroundColor: colors.background,
            borderColor: colors.borderColor,
          },
        ]}
      >
        <View
          style={[
            styles.indicator,
            { backgroundColor: colors.shadeContainer },
          ]}
          pointerEvents="none"
        />
        <FlatList
          ref={listRef}
          data={listData}
          renderItem={renderItem}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT} // Works on modern web browsers
          decelerationRate="fast"
          onScroll={handleScroll}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16} // 60fps
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          initialScrollIndex={data.indexOf(initialValue)}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            {
              backgroundColor: colors.shadeContainer,
              borderColor: colors.borderColor,
            },
            selectedValue === min && styles.controlButtonDisabled,
          ]}
          onPress={() => adjustValue(-1)}
          disabled={selectedValue === min}
        >
          <Ionicons
            name="chevron-up"
            size={16}
            color={selectedValue === min ? colors.disable : colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            {
              backgroundColor: colors.shadeContainer,
              borderColor: colors.borderColor,
            },
            selectedValue === max && styles.controlButtonDisabled,
          ]}
          onPress={() => adjustValue(1)}
          disabled={selectedValue === max}
        >
          <Ionicons
            name="chevron-down"
            size={16}
            color={selectedValue === max ? colors.disable : colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  container: {
    width: 60,
    borderRadius: 15,
    borderWidth: 1,
    overflow: "hidden",
  },
  controls: {
    justifyContent: "space-between",
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  controlButton: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonDisabled: {
    opacity: 0.6,
  },
  indicator: {
    position: "absolute",
    top: ITEM_HEIGHT,
    left: 5,
    right: 5,
    height: ITEM_HEIGHT,
    borderRadius: 10,
    zIndex: -1,
  },
  label: {
    fontSize: 12,
  },
  selectedLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
});
