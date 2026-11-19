import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Typography } from './components';
import { tokens as t } from './tokens';

/** Healthcare app tab treatment, adapted to EMA destinations. */
export function BottomNavigation({
  state,
  navigation,
  insets,
}: BottomTabBarProps) {
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, t.space.sm) },
      ]}
    >
      <View style={styles.row} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const selected = state.index === index;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={route.name}
              accessibilityState={{ selected }}
              aria-selected={selected}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!selected && !event.defaultPrevented)
                  navigation.navigate(route.name, route.params);
              }}
              onLongPress={() =>
                navigation.emit({ type: 'tabLongPress', target: route.key })
              }
              style={({ pressed }) => [
                styles.tab,
                selected && styles.selected,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={
                  route.name === 'Home'
                    ? selected
                      ? 'home'
                      : 'home-outline'
                    : 'person-outline'
                }
                size={t.size.icon}
                color={selected ? t.color.primary : t.color.muted}
                accessible={false}
              />
              <Typography
                variant="small"
                style={{ color: selected ? t.color.primary : t.color.muted }}
              >
                {route.name}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  bar: {
    backgroundColor: t.color.page,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.color.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: t.size.maxContent,
    alignSelf: 'center',
    paddingHorizontal: t.space.xxl,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: t.size.touch,
    flex: 1,
    marginHorizontal: t.space.md,
    paddingVertical: t.space.md,
    gap: t.space.sm,
    borderTopWidth: 2,
    borderTopColor: 'transparent',
  },
  selected: { backgroundColor: t.color.tint, borderTopColor: t.color.primary },
  pressed: { backgroundColor: t.color.tint },
});
