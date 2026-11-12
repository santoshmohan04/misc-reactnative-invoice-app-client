import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ListViewProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  rightSub?: React.ReactNode;
  handleClickEvent?: () => void;
  actions?: Array<{ label: string; onPress: () => void }>;
}

/**
 * Component that maps list parameters to a list item component dynamically
 */
const ListView: React.FC<ListViewProps> = ({
  title,
  subtitle,
  right,
  rightSub,
  handleClickEvent,
  actions,
}) => {
  return (
    <View style={styles.row}>
      <Pressable style={styles.main} onPress={handleClickEvent}>
        <View style={styles.body}>
          <Text>{title}</Text>
          <Text style={styles.note} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.right}>
          <Text>{right}</Text>
          {rightSub ? (
            <Text style={styles.note} numberOfLines={1}>
              {rightSub}
            </Text>
          ) : null}
        </View>
      </Pressable>
      {actions?.length ? (
        <View style={styles.actions}>
          {actions.map((a) => (
            <Pressable key={a.label} onPress={a.onPress} style={styles.actionBtn}>
              <Text style={styles.actionText}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.4)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actionText: { color: '#2563eb', fontSize: 12, fontWeight: '600' },
  body: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
    maxWidth: '45%',
  },
  note: {
    color: 'rgba(0,0,0,0.55)',
    fontSize: 12,
  },
});

export default ListView;
