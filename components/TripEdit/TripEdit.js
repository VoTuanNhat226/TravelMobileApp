import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import APIs, { endpoints } from '../../configs/APIs';
import TripDetailStyle from './TripDetailStyle';

const TripEdit = ({ route, navigation}) => {
  const { tripId } = route.params;
  const [trip, setTrip] = useState(null);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    fetchTripDetail();
  }, []);

  const fetchTripDetail = async () => {
    try {
      const response = await APIs.get(`${endpoints['tripsDetail']}/${tripIdId}`);
      setTrip(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết trip:', error);
      Alert.alert('Error', 'Lỗi khi lấy chi tiết trip');
    }
  };


};

export default TripEdit;