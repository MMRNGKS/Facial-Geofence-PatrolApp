/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable comma-dangle */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ImageBackground, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Border, Color, FontFamily, FontSize } from '../GlobalStyles';
import { TextInput } from 'react-native-paper';
import { horizontalScale, moderateScale, verticalScale } from '../Metrics';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

type LogInProps = {
    onLogin?: () => void;
};

const LogIn: React.FC<LogInProps> = ({ onLogin }) => {
    const db = firestore();
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const checkInternetConnection = async () => {
            const netInfoState = await NetInfo.fetch();
            if (!netInfoState.isConnected) {
                Toast.show('No internet connection.', Toast.LONG);
            }
        };

        checkInternetConnection();
    }, []);

    const handleClear = () => {
        setPin('');
    };

    const handleProceed = async () => {

        // Check internet connection
        const netInfoState = await NetInfo.fetch();
        if (!netInfoState.isConnected) {
            Toast.show('No internet connection.', Toast.LONG);
            return;
        }

        try {
            const collectionName = 'Users';
            const documentId = pin;
            const userDocRef = db.collection(collectionName).doc(documentId);
            setLoading(true);
            const docSnapshot = await userDocRef.get();
            if (docSnapshot.exists) {
                // Perform the update if necessary
                setLoading(false);

                try {
                    await AsyncStorage.setItem('user', JSON.stringify(pin));
                } catch (error) {
                    console.log(error);
                }

                if (onLogin) {
                    onLogin();
                }

                // Clear the pin
                handleClear();
            } else {
                if (!pin) {
                    setLoading(false);
                    Toast.show('Please input your Badge Number first.', Toast.LONG);
                    return; // Exit the function early
                } else {
                    setLoading(false);
                    Toast.show('Badge Number not registered.', Toast.LONG);
                }
            }
        } catch (error) {
            setLoading(false);
            Toast.show('An error occurred, Please try again.', Toast.LONG);
        }
    };

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

                <View style={styles.loginWindow}>
                    <Text style={[styles.login, styles.loginTypo]}>LOGIN</Text>
                    <View style={styles.loginLine} />
                    <View style={styles.container2}>
                        <Text style={[styles.pleaseInputYour, styles.loginTypo]}>
                            Please input your badge number.
                        </Text>
                        <TextInput mode="outlined" label="Badge Number" outlineColor="#6c7ac7" textColor="#2d2f64" outlineStyle={{ borderRadius: 8, }}
                            style={styles.badge} value={pin} onChangeText={setPin} keyboardType="numeric" theme={{
                                colors: {
                                    primary: Color.darkslateblue,
                                    onSurfaceVariant: '#808080',
                                },
                            }}
                        />
                        <View style={styles.button}>
                            <TouchableOpacity
                                style={[styles.proceedButton, styles.buttonLayout]}
                                activeOpacity={0.2}
                                onPress={() => { handleProceed(); }}>
                                <Text style={styles.textTypo}>Proceed</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.indicator}>
                            {loading ? (
                                <ActivityIndicator color="#6c7ac7" size="large" />
                            ) : (<Text />)}
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
    indicator: {
        marginTop: 15,
    },
    badge: {
        width: '70%',
        marginTop: verticalScale(30),
        borderRadius: Border.br_3xs,
    },
    button: {
        marginTop: verticalScale(30),
    },
    buttonLayout: {
        height: 41,
        width: 255,
        borderRadius: Border.br_3xs,
    },
    loginWindow: {
        top: '41.5%',
        left: 0,
        borderTopLeftRadius: Border.br_xl,
        borderTopRightRadius: Border.br_xl,
        width: '100%',
        bottom: 0,
        backgroundColor: Color.whitesmoke,
        position: 'absolute',
    },
    loginTypo: {
        fontFamily: FontFamily.vigaRegular,
        fontWeight: 'bold',
    },
    login: {
        fontSize: FontSize.size_15xl,
        color: Color.darkslateblue,
        marginLeft: '8%',
        marginTop: '8%',
    },
    loginLine: {
        borderColor: '#2d2f64',
        borderTopWidth: moderateScale(3),
        width: horizontalScale(110),
        height: verticalScale(3),
        borderStyle: 'solid',
        marginLeft: '6.5%',
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
    pleaseInputYour: {
        color: Color.steelblue,
        textAlign: 'center',
        width: horizontalScale(308),
        fontSize: FontSize.size_xl,
        fontFamily: FontFamily.vigaRegular,
        marginTop: horizontalScale(30),
    },
    proceedButton: {
        backgroundColor: Color.darkblue,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textTypo: {
        color: Color.white,
        fontFamily: FontFamily.robotoBold,
        fontWeight: '700',
        fontSize: FontSize.size_xl,
    },
});

export default LogIn;
