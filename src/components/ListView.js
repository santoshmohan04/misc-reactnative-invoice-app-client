import React, {Component} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

/**
 * Component that maps list parameters to a list item component dynamically
 */
export default class ListView extends Component {
    render() {
        return (
            <Pressable style={styles.row} onPress={this.props.handleClickEvent}>
                <View style={styles.body}>
                    <Text>{this.props.title}</Text>
                    <Text style={styles.note} numberOfLines={1}>{this.props.subtitle}</Text>
                </View>
                <View style={styles.right}>
                    <Text>{this.props.right}</Text>
                    {this.props.rightSub && <Text style={styles.note} numberOfLines={1}>{this.props.rightSub}</Text>}
                </View>
            </Pressable>
        );
    }
}

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
