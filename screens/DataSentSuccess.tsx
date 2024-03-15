/* eslint-disable prettier/prettier */
import React from 'react';
import { StyleSheet, View, ImageBackground, Text, TouchableOpacity, Image } from 'react-native';
import { Border, Color, FontFamily, FontSize } from '../GlobalStyles';
import { NavigationProp } from '@react-navigation/native';
import { horizontalScale, verticalScale } from '../Metrics';

type DataSentSuccessProps = {
    navigation: NavigationProp<any>;
};

const DataSentSuccess: React.FC<DataSentSuccessProps> = ({ navigation }) => {
    return (
        <ImageBackground
            source={require('../assets/splashscreenbg.png')}
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                <View style={[styles.logoShadow, styles.logoLayout]} />
                <View style={[styles.logo, styles.logoLayout]}>
                    <Image
                        source={require('../assets/LOGO.png')}
                        style={styles.logoImage}
                    />
                </View>
                <Text style={[styles.Text, styles.Typo]}>SENTINEX</Text>
                <View style={styles.successWindow}>
                    <Image
                        style={styles.successIcon}
                        source={require('../assets/success-icon.png')}
                    />
                    <View style={styles.container2}>
                        <Text style={[styles.sentSuccess, styles.successTypo]}>
                            Data sent successfully!
                        </Text>
                        <View style={styles.button}>
                            <TouchableOpacity
                                style={[styles.confirmButton, styles.buttonLayout]}
                                activeOpacity={0.2}
                                onPress={() => {
                                    navigation.navigate('Home');
                                }}>
                                <Text style={styles.textTypo}>Confirm & Exit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
    container: {
        flex: 1,
        alignItems: 'center',
    },
    container2: {
        marginTop: '20%',
        position: 'absolute',
        alignItems: 'center',
        width: '100%',
    },
    button: {
        marginTop: verticalScale(30),
    },
    buttonLayout: {
        height: 41,
        width: 255,
        borderRadius: Border.br_3xs,
    },
    successWindow: {
        top: '61.5%',
        left: 0,
        borderTopLeftRadius: Border.br_xl,
        borderTopRightRadius: Border.br_xl,
        width: '100%',
        bottom: 0,
        backgroundColor: Color.whitesmoke,
        alignItems: 'center',
        position: 'absolute',
    },
    successTypo: {
        fontFamily: FontFamily.vigaRegular,
        fontWeight: 'bold',
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
        marginTop: verticalScale(54),
        padding: 5,
    },
    logoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'center', // Adjust the resizeMode as needed
    },
    sentSuccess: {
        color: Color.steelblue,
        textAlign: 'center',
        width: horizontalScale(308),
        fontSize: FontSize.size_xl,
        fontFamily: FontFamily.vigaRegular,
        marginTop: verticalScale(30),
    },
    confirmButton: {
        backgroundColor: Color.darkslateblue,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textTypo: {
        color: Color.white,
        fontFamily: FontFamily.robotoBold,
        fontWeight: '700',
        fontSize: FontSize.size_xl,
    },
    successIcon: {
        marginTop: verticalScale(30),
        width: 59,
        height: 59,
    },
    Typo: {
        fontFamily: FontFamily.vigaRegular,
        fontSize: FontSize.size_15xl,
        marginVertical: verticalScale(280),
    },
    Text: {
        color: Color.white,
    },
});

export default DataSentSuccess;
