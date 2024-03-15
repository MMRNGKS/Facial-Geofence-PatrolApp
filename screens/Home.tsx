/* eslint-disable prettier/prettier */
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, PermissionsAndroid, Image, ImageBackground, TouchableOpacity, ActivityIndicator, BackHandler, Modal } from 'react-native';
import { Border, Color, FontFamily, FontSize } from '../GlobalStyles';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { horizontalScale, moderateScale, verticalScale } from '../Metrics';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';

type HomeProps = {
    navigation: NavigationProp<any>;
    onLogin?: () => void;
};

const requestLocationPermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        console.log('granted', granted);
        if (granted === 'granted') {
            console.log('You can use Geolocation');
            return true;
        } else {
            console.log('You cannot use Geolocation');
            return false;
        }
    } catch (err) {
        return false;
    }
};


const Home: React.FC<HomeProps> = ({ navigation, onLogin }) => {
    const [pin, setPin] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [yourBooleanVariable, setYourBooleanVariable] = useState(false);
    const [modalVisible1, setModalVisible1] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [modalData, setModalData] = useState<any>(null);

    // state to hold location
    const [location, setLocation] = useState<GeoPosition | null>(null);

    useEffect(() => {
        const fetchDataFromAsyncStorage = async () => {
            try {
                const savedUser = await AsyncStorage.getItem('user');
                if (savedUser !== null) {
                    const parsedPin = JSON.parse(savedUser);
                    setPin(parsedPin);
                    console.log('From AsyncStorage User PIN: ', parsedPin);
                } else {
                    console.log('User data not found in storage.');
                }

            } catch (error) {
                console.error(error);
            }
        };

        const checkInternetConnection = async () => {
            const netInfoState = await NetInfo.fetch();
            if (!netInfoState.isConnected) {
                Toast.show('No internet connection.', Toast.LONG);
            }
        };

        const fetchLocation = async () => {
            try {
                const permissionResult = await requestLocationPermission();

                if (permissionResult) {
                    Geolocation.getCurrentPosition(
                        position => {
                            setLocation(position);
                        },
                        error => {
                            console.log(error.code, error.message);
                            setLocation(null); // Set location to null on error
                        },
                        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
                    );
                }
            } catch (error) {
                console.error('Error fetching location:', error);
            }
        };

        const fetchDateTime = async () => {
            //Get Date & Time
            try {
                const response = await fetch('http://worldtimeapi.org/api/timezone/Asia/Manila');
                const data = await response.json();
                const { datetime } = data;
    
                // Update state with Philippine time
                setDateTime(datetime);
            } catch (error) {
                // Handle error
                console.error('Error fetching Philippine time:', error);
            }
        };


        fetchDataFromAsyncStorage();
        checkInternetConnection();
        fetchLocation();
        fetchDateTime();
    }, []);

      useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (loading) {
                    // Data is still being sent, show a message or take appropriate action
                    Toast.show('Data is still being sent. Please wait.', Toast.LONG);
                    return true; // Prevent default back button behavior
                } else {
                    // Data is not being sent, allow default back button behavior
                    return false;
                }
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [loading])
    );

    const handleActivity = async (booleanValue: boolean) => {

        setLoading(true);

        // Check internet connection
        const netInfoState = await NetInfo.fetch();
        if (!netInfoState.isConnected) {
            setLoading(false);
            Toast.show('No internet connection.', Toast.LONG);
            return;
        }

        //Launch Camera
        ImagePicker.openCamera({
            mediaType: 'photo',
            useFrontCamera: true,
        }).then((image) => {
            console.log(image);
            if (image) {
                sendImageToAPI(image, booleanValue);
            } else {
                console.log('Image source is undefined.');
            }
        }).catch((error) => {
            setLoading(false);
            // Handle any errors that occur during camera opening
            if (error.code === 'E_PICKER_CANCELLED') {
                // Camera was closed without taking a picture
                console.log('Camera closed without taking a picture.');
            } else {
                setLoading(false);
                // Handle other errors
                console.error(error);
            }
        });
    };

    const sendImageToAPI = async (imageData: any, booleanValue: boolean) => {
        try {
            // Resize the image to 300x400 pixels
            const resizedImage = await ImageResizer.createResizedImage(
                imageData.path,
                300, // target width
                400, // target height
                'JPEG', // format
                80, // quality
            );
            console.log(resizedImage);
    
            // Create form data with the resized image
            const formData = new FormData();
            formData.append('id', pin);
            formData.append('file', {
                uri: resizedImage.uri,
                type: 'image/jpeg', // Adjust this if needed based on the format
                name: 'image.jpg',
            });
    
            // Send the resized image to the API
            const response = await fetch('http://192.168.0.29:5000/compare_faces', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            const data = await response.json();
            console.log('Response from API:', data);

            if (data.error) {
                // Show error message
                setModalData( data.error );
                setLoading(false);
                setModalVisible1(true);
            } else if (data.identified_name) {
                // Show identified name
                setModalData(data.identified_name );
                sendData(booleanValue);
            } else {
                // Unexpected response, handle as needed
                console.log('Unexpected API response:', data);
            }
            // Show modal

            // Handle API response as needed
        } catch (error) {
            setLoading(false);
            console.error('Error sending image to API:', error);
        }
      };

    const sendData = async (booleanValue: boolean) => {

        //Get Date & Time
        try {
            const response = await fetch('http://worldtimeapi.org/api/timezone/Asia/Manila');
            const data = await response.json();
            const { datetime } = data;
    
            // Update state with Philippine time
            setDateTime(datetime);
            console.log(datetime);
          } catch (error) {
            // Handle error
            console.error('Error fetching Philippine time:', error);
          }

        //Send Data to Firestore
        try {
            firestore()
                .collection('Users')
                .doc(pin.toString())
                .update({
                    status: booleanValue ? 'Timed In' : 'Pulled Out',
                    timestamp: new Date(dateTime),
                    location: location ? new firestore.GeoPoint(location.coords.latitude, location.coords.longitude) : null,
                })
                .then(() => {
                    firestore()
                        .collection('Logs')
                        .add({
                            status: yourBooleanVariable ? 'Timed In' : 'Pulled Out',
                            timestamp: new Date(dateTime),
                            location: location ? new firestore.GeoPoint(location.coords.latitude, location.coords.longitude) : null,
                        });
                })
                .then(() => {
                    setLoading(false);
                    console.log('User updated!');
                    console.log('Log created!');
                    setModalVisible2(true);
                })
                .catch(error => {
                    console.error('Error updating user:', error);
                    console.error('Error creating log:', error);
                });
                console.log(booleanValue ? 'Timed In' : 'Pulled Out');
        } catch (e) {
            console.log(e);
        }
    };

    const removeUser = async () => {
        const keysToRemove = ['user'];
        try {
            await AsyncStorage.multiRemove(keysToRemove);
            if (onLogin) {
                onLogin();
            }
            console.log('Removed User');
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
        <ImageBackground
            source={require('../assets/splashscreenbg.png')}
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                <View style={styles.userName}>
                    <Text style={styles.userText}>User: {pin}</Text>
                </View>
                <View style={styles.logout}>
                    <TouchableOpacity style={styles.logButStyle}
                        activeOpacity={0.2} onPress={() => {
                            removeUser();
                        } }>
                        <Text style={styles.logoutText}>LOG OUT</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.logoShadow, styles.logoLayout]} />
                <View style={[styles.logo, styles.logoLayout]}>
                    <Image
                        source={require('../assets/LOGO.png')}
                        style={styles.logoImage} />
                </View>
                <View style={styles.patrolOptionWindow}>
                    <Text style={[styles.patrolOption, styles.patrolOptionTypo]}>PATROL ATTENDANCE</Text>
                    <View style={styles.patrolOptionLine} />
                    <View style={styles.container2}>
                        <Text style={[styles.pleaseInputYour, styles.patrolOptionTypo]}>
                            Please choose your status.
                        </Text>

                        <View style={styles.button}>
                            <TouchableOpacity
                                style={[styles.proceedButton, styles.buttonLayout]}
                                activeOpacity={0.2}
                                onPress={async () => {
                                    // Check for internet connection
                                    const netInfoState = await NetInfo.fetch();
                                    if (!netInfoState.isConnected) {
                                        Toast.show('No internet connection.', Toast.LONG);
                                    } else {
                                        if (loading) {
                                            // Data is still being sent, show a message or take appropriate action
                                            Toast.show('Data is still being sent. Please wait.', Toast.LONG);
                                        } else {
                                            setYourBooleanVariable(true);
                                            handleActivity(true);
                                        }
                                    }
                                } }>
                                <Text style={styles.textTypo}>TIME IN</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.button}>
                            <TouchableOpacity
                                style={[styles.proceedButton, styles.buttonLayout]}
                                activeOpacity={0.2}
                                onPress={async () => {
                                    // Check for internet connection
                                    const netInfoState = await NetInfo.fetch();
                                    if (!netInfoState.isConnected) {
                                        Toast.show('No internet connection.', Toast.LONG);
                                    } else {
                                        if (loading) {
                                            // Data is still being sent, show a message or take appropriate action
                                            Toast.show('Data is still being sent. Please wait.', Toast.LONG);
                                        } else {
                                            setYourBooleanVariable(false);
                                            handleActivity(false);
                                        }
                                    }
                                } }>
                                <Text style={styles.textTypo}>PULL OUT</Text>
                            </TouchableOpacity>
                            <View style={styles.indicator}>
                                {loading ? (
                                    <ActivityIndicator color="#6c7ac7" size="large" />
                                ) : (<Text />)}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </ImageBackground>
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible1}
            onRequestClose={() => {
                setModalVisible1(false);
            } }>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {modalData && <Text style={styles.textMod1}>{modalData}</Text>}
                        <TouchableOpacity onPress={() => setModalVisible1(false)}>
                            <Text style={styles.textMod2}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible2}
            onRequestClose={() => {
                setModalVisible2(false);
            } }>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={{color: Color.darkblue, fontSize: 16,}}>You are now {yourBooleanVariable ? 'Timed In' : 'Pulled Out'}</Text>
                        {modalData && <Text style={styles.textMod1}>{modalData}</Text>}
                        <TouchableOpacity onPress={() => setModalVisible2(false)}>
                            <Text style={styles.textMod2}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            </>
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
        marginTop: '15%',
        position: 'absolute',
        alignItems: 'center',
        width: '100%',
    },
    button: {
        marginTop: verticalScale(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
    },
    buttonLayout: {
        height: 41,
        width: 255,
        borderRadius: Border.br_3xs,
    },
    patrolOptionWindow: {
        top: '50%',
        left: 0,
        borderTopLeftRadius: Border.br_xl,
        borderTopRightRadius: Border.br_xl,
        width: '100%',
        bottom: 0,
        backgroundColor: Color.whitesmoke,
        position: 'absolute',
    },
    patrolOptionTypo: {
        fontFamily: FontFamily.vigaRegular,
        fontWeight: 'bold',
    },
    patrolOption: {
        fontSize: FontSize.size_15xl,
        color: Color.darkslateblue,
        marginLeft: '8%',
        marginTop: '8%',
    },
    patrolOptionLine: {
        borderColor: '#2d2f64',
        borderTopWidth: moderateScale(3),
        width: '75%',
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
        marginTop: verticalScale(120),
        padding: 5,
    },
    logoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'center',
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
    timeFillIcon: {
        aspectRatio: moderateScale(0.8),
        resizeMode: 'center',
    },
    dropdown1: {
        height: 50,
        width: 255,
        borderColor: Color.cornflowerblue,
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    dropdown2: {
        height: 50,
        width: 255,
        borderColor: Color.cornflowerblue,
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    label: {
        position: 'absolute',
        backgroundColor: Color.whitesmoke,
        left: 22,
        zIndex: 999,
        paddingHorizontal: 3,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#808080',
        marginLeft: horizontalScale(5),
    },
    selectedTextStyle: {
        fontSize: 16,
        marginLeft: horizontalScale(5),
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: Color.cornflowerblue,
    },
    input: {
        marginLeft: '4%',
        borderColor: Color.cornflowerblue,
        height: 50,
        width: '20%',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        fontSize: 16,
        color: Color.darkslateblue,
    },
    userName: {
        position: 'absolute',
        top: 0,
        left: 0,
        marginTop: verticalScale(10), // Adjust the marginTop as needed
        marginLeft: horizontalScale(7), // Adjust the marginRight as needed
    },
    userText: {
        color: Color.whitesmoke,
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: FontFamily.robotoBold,
    },
    logout: {
        position: 'absolute',
        top: 0,
        right: 0,
        marginTop: verticalScale(10), // Adjust the marginTop as needed
        marginRight: horizontalScale(7), // Adjust the marginRight as needed
    },
    logoutText: {
        color: Color.whitesmoke,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: FontFamily.robotoBold,
    },
    logButStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        height: verticalScale(30),
        width: horizontalScale(65),
        backgroundColor: Color.cornflowerblue,
        borderRadius: 5,
    },
    indicator: {
        marginTop: 20, // Adjust this value as needed
        alignItems: 'center',
        marginBottom: '5%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    textMod1: {
        color: Color.darkblue,
        fontFamily: FontFamily.robotoBold,
        fontSize: 20,
    },
    textMod2: {
        color: Color.darkblue,
        fontFamily: FontFamily.robotoBold,
        fontWeight: '700',
        fontSize: 20,
        marginTop: 18,
    },
});

export default Home;
