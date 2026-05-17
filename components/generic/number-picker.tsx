import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
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

function buildValues(min: number, max: number, step: number) {
  const values: number[] = [];

  for (let value = min; value <= max; value += step) {
    values.push(value);
  }

  return values;
}

function PickerControls({
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
}: {
  canDecrease: boolean;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  const { colors } = useStyles();

  return (
    <View style={styles.controls}>
      <TouchableOpacity
        style={[
          styles.controlButton,
          {
            backgroundColor: colors.shadeContainer,
            borderColor: colors.borderColor,
          },
          !canDecrease && styles.controlButtonDisabled,
        ]}
        onPress={onDecrease}
        disabled={!canDecrease}
      >
        <Ionicons
          name="chevron-up"
          size={16}
          color={canDecrease ? colors.text : colors.disable}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.controlButton,
          {
            backgroundColor: colors.shadeContainer,
            borderColor: colors.borderColor,
          },
          !canIncrease && styles.controlButtonDisabled,
        ]}
        onPress={onIncrease}
        disabled={!canIncrease}
      >
        <Ionicons
          name="chevron-down"
          size={16}
          color={canIncrease ? colors.text : colors.disable}
        />
      </TouchableOpacity>
    </View>
  );
}

function MobilePicker({
  values,
  selectedValue,
  onSelect,
}: {
  values: number[];
  selectedValue: number;
  onSelect: (value: number) => void;
}) {
  const { colors } = useStyles();

  return (
    <View
      style={[
        styles.mobileContainer,
        {
          backgroundColor: colors.background,
          borderColor: colors.borderColor,
        },
      ]}
    >
      {/* Native Picker gives us the reliable mobile wheel behavior. */}
      <Picker
        selectedValue={selectedValue}
        onValueChange={(value) => {
          if (typeof value === "number") {
            onSelect(value);
          }
        }}
        style={[styles.mobilePicker, { color: colors.text }]}
        itemStyle={[styles.mobilePickerItem, { color: colors.text }]}
        dropdownIconColor={colors.text}
      >
        {values.map((value) => (
          <Picker.Item
            key={value}
            label={String(value)}
            value={value}
            color={colors.text}
          />
        ))}
      </Picker>
    </View>
  );
}

function WebPicker({
  values,
  selectedValue,
  onSelect,
}: {
  values: number[];
  selectedValue: number;
  onSelect: (value: number) => void;
}) {
  const { globalStyles, colors } = useStyles();
  const listRef = useRef<FlatList<number | string>>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listData = useMemo(() => ["", ...values, ""], [values]);

  const snapToValue = useCallback(
    (value: number, animated = true) => {
      const index = values.indexOf(value);

      if (index < 0) {
        return;
      }

      listRef.current?.scrollToOffset({
        offset: index * ITEM_HEIGHT,
        animated,
      });
      onSelect(value);
    },
    [onSelect, values],
  );

  const snapFromOffset = useCallback(
    (offset: number, animated = true) => {
      // The list may stop between rows on web, so we round to the nearest item
      // and then force the scroll position back onto that exact row.
      const index = Math.max(
        0,
        Math.min(values.length - 1, Math.round(offset / ITEM_HEIGHT)),
      );

      snapToValue(values[index], animated);
    },
    [snapToValue, values],
  );

  useEffect(() => {
    snapToValue(selectedValue, false);
  }, [selectedValue, snapToValue]);

  useEffect(
    () => () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    },
    [],
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Web does not always fire momentum-end the way native does,
    // so we treat a short pause as "scroll finished".
    scrollTimeout.current = setTimeout(() => {
      snapFromOffset(offset);
    }, 100);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    snapFromOffset(event.nativeEvent.contentOffset.y);
  };

  return (
    <View
      style={[
        styles.webContainer,
        {
          backgroundColor: colors.background,
          borderColor: colors.borderColor,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[styles.indicator, { backgroundColor: colors.shadeContainer }]}
      />
      <FlatList
        ref={listRef}
        data={listData}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          const isSelected = item === selectedValue;

          return (
            <View style={styles.webRow}>
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
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        initialScrollIndex={values.indexOf(selectedValue)}
      />
    </View>
  );
}

export const NumberPicker = ({
  min,
  max,
  initialValue = min,
  onValueChange,
  step = 1,
}: NumberPickerProps) => {
  const values = useMemo(() => buildValues(min, max, step), [min, max, step]);
  const [selectedValue, setSelectedValue] = useState(initialValue);

  useEffect(() => {
    setSelectedValue(initialValue);
  }, [initialValue]);

  const selectedIndex = values.indexOf(selectedValue);

  // This is the single source of truth for value changes:
  // both the buttons and the platform-specific pickers go through here.
  const selectValue = (value: number) => {
    if (value === selectedValue || !values.includes(value)) {
      return;
    }

    setSelectedValue(value);
    onValueChange(value);
  };

  // Buttons operate on the current index so they work the same on web and mobile.
  const moveSelection = (direction: 1 | -1) => {
    if (selectedIndex < 0) {
      return;
    }

    const nextIndex = Math.max(
      0,
      Math.min(values.length - 1, selectedIndex + direction),
    );

    selectValue(values[nextIndex]);
  };

  return (
    <View style={styles.wrapper}>
      {Platform.OS === "web" ? (
        <WebPicker
          values={values}
          selectedValue={selectedValue}
          onSelect={selectValue}
        />
      ) : (
        <MobilePicker
          values={values}
          selectedValue={selectedValue}
          onSelect={selectValue}
        />
      )}

      <PickerControls
        canDecrease={selectedIndex > 0}
        canIncrease={selectedIndex >= 0 && selectedIndex < values.length - 1}
        onDecrease={() => moveSelection(-1)}
        onIncrease={() => moveSelection(1)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 56,
  },
  mobileContainer: {
    width: 80,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  mobilePicker: {
    width: "100%",
    height: "100%",
  },
  mobilePickerItem: {
    fontSize: 16,
  },
  webContainer: {
    width: 60,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    borderRadius: 15,
    borderWidth: 1,
    overflow: "hidden",
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
  webRow: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
  },
  selectedLabel: {
    fontSize: 16,
    fontWeight: "700",
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
});
