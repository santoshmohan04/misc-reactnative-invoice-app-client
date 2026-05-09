import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Button, Text, XStack} from 'tamagui';
import {Actions} from '../utils/NavigationService';

/**
 * Header component with back button for all level 2 pages
 */
class InnerPageHeader extends Component<{}> {

    goBack() {
        Actions.pop();
        Actions.refresh();
    }

    render() {
        return (
            <XStack style={styles.header}>
                <Button chromeless onPress={this.goBack}>
                    <Ionicons name={'arrow-back'} size={22} color='#0f172a'/>
                </Button>
                <Text style={styles.title}>{this.props.title}</Text>
                <Button chromeless disabled opacity={0}>
                    <Ionicons name={'arrow-back'} size={22} color='transparent'/>
                </Button>
            </XStack>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
});

export default InnerPageHeader;
