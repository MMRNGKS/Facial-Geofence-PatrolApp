/* eslint-disable prettier/prettier */
import * as React from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, Border, Color } from '../GlobalStyles';
import { horizontalScale, verticalScale } from '../Metrics';

const SplashScreen1 = () => {
    return (
        <ImageBackground
            source={require('../assets/splashscreenbg1.png')}
            style={styles.backgroundImage}>
            <View style={styles.splashScreen1}>
                <View style={[styles.logoShadow, styles.logoLayout]} />
                <View style={[styles.logo, styles.logoLayout]}>
                    <Image
                        source={require('../assets/LOGO.png')}
                        style={styles.logoImage}
                    />
                </View>
                <Text style={[styles.Text, styles.Typo]}>
                    SENTINEX
                </Text>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        backgroundColor: '#00112C',
    },
    Typo: {
        fontFamily: FontFamily.vigaRegular,
        fontSize: FontSize.size_15xl,
        position: 'absolute',
        marginTop: verticalScale(425),
    },
    Text: {
        color: Color.white,
    },
    logoShadow: {
        top: verticalScale(7),
        left: horizontalScale(113),
        backgroundColor: Color.gray_200,
    },
    logo: {
        backgroundColor: Color.whitesmoke,
    },
    logoLayout: {
        height: 149,
        width: 149,
        borderRadius: Border.br_xl,
        position: 'absolute',
        marginTop: verticalScale(200),
        padding: 5,
    },
    logoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'center', // Adjust the resizeMode as needed
    },
    splashScreen1: {
        alignItems: 'center',
    },
});

export default SplashScreen1;
