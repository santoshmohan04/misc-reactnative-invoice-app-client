import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';

import Routes from './components/Routes';
import { useIsAuthenticated } from './store/hooks';

/**
 * Main app component called by App.js
 * Specifies status bar properties and includes routes component
 * Uses RTK hooks for auth state
 */
function Main() {
    const isAuthenticated = useIsAuthenticated();

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={'#1c313a'} barStyle={'light-content'}/>
            <Routes isLoggedIn={isAuthenticated}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default Main;
