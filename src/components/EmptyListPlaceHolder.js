import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {ScrollView, View, Text} from 'react-native';

/**
 * Placeholder component for empty lists
 * Should preview image and text
 */
export default class EmptyListPlaceHolder extends Component<{}> {
    render() {
        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    {/*<Image style={{width: 120, height: 120}}*/}
                    {/*       source={require(`../assets/images/empty-${this.props.type}-list.png`)}/>*/}
                    <Text style={styles.logoText}> {this.props.message}</Text>
                </ScrollView>
            </View>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    logoText: {
        textAlign: 'center',
        fontSize: 16,
        marginVertical: 15,
        color: 'rgba(0,0,0,0.7)',
    },
});
