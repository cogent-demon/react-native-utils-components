import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { useDetectDevice } from 'react-native-utils-toolkit';
import { styles } from './styles';
import { CModal } from './type';

const { height: h } = useDetectDevice;

const defaultProps = {
  visible: false,
  transparent: false,
  height: h / 2,
  styles: {},
  headerStyle: {},
  backgroundColor: 'rgba(0,0,0,0.4)',
};

const ModalComponent: CModal = props => {
  const {
    visible,
    height = h / 2,
    onRequestClose,
    transparent,
    style,
    backgroundColor,
    headerStyle,
    renderHeader,
    supportedOrientations
  } = props;
  const [viewHeight] = useState(new Animated.Value(0));
  const [isShow, setIsShow] = useState<boolean>(visible);

  useEffect(() => {
    setIsShow(visible);
  }, [visible])

  const onShow = () => {
    Animated.timing(viewHeight, {
      toValue: height,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => { });
  };

  const onClose = () => {
    Animated.timing(viewHeight, {
      toValue: 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      setIsShow(false);
      if (onRequestClose) {
        onRequestClose();
      }
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return true;
      },
      onPanResponderEnd: (evt, gestureState) => {
        return true;
      },
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const { moveY } = gestureState;
        const getHeight = h - moveY;
        Animated.timing(viewHeight, {
          toValue: getHeight,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: false,
        }).start(() => { });
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { moveY } = gestureState;
        const getHeight = h - moveY;
        if (getHeight < height - 50) {
          onClose();
        } else {
          Animated.timing(viewHeight, {
            toValue: height,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: false,
          }).start(() => { });
        }
      },
    }),
  ).current;

  return (
    <Modal
      visible={isShow}
      transparent={transparent}
      supportedOrientations={supportedOrientations}
      style={{ flex: 1 }}
      onShow={() => {
        onShow();
      }}>
      <View
        style={[
          {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: backgroundColor,
          },
          style,
        ]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.header, headerStyle]}>
          {renderHeader ? renderHeader() : <View style={styles.pan} />}
        </Animated.View>
        <Animated.View
          style={{
            backgroundColor: 'white',
            height: viewHeight,
          }}>
          {props?.children}
        </Animated.View>
      </View>
    </Modal>
  );
};

ModalComponent.defaultProps = defaultProps;
export default ModalComponent;
