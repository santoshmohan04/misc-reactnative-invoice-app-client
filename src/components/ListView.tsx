import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ListViewProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  rightSub?: React.ReactNode;
  handleClickEvent?: () => void;
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
}) => {
  return (
    <Pressable style={styles.row} onPress={handleClickEvent}>
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
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
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
