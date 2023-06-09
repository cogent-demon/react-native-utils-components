import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import Text from '../Text';
import { useDetectDevice, useScale } from 'react-native-utils-toolkit';
import { styles } from './styles';
import { Hierarchy } from './type';

const { scale } = useScale;
const {isAndroid, isIOS} = useDetectDevice;

const defaultProps = {
  style: {},
  textStyle: {},
  buttonStyle: {},
  buttonTextStyle: {},
  iconColor: 'black'
}

let selectItem: any = [];

const HierarchyComponent: Hierarchy = (props) => {
  const { 
    data, 
    textField, 
    childField, 
    style, 
    textStyle, 
    fontFamily, 
    buttonStyle,
    buttonTextStyle, 
    iconColor, 
  } = props;

  const [listData] = useState<any>(data);
  const [key, setKey] = useState(Math.random());

  const parent = (item: any) => {
    if (item && item[childField]) {
      const check = item[childField].filter((child: any) => !child.tick);
      if (check.length === 0) {
        item.tick = true;
      } else {
        item.tick = false;
      }
      parent(item.parent);
      reload();
    }
  };

  const onTick = (item: any) => {
    item.tick = true;
    parent(item.parent);
    if (item[childField]) {
      item[childField].map((child: any) => onTick(child));
    }
    reload();
  };

  const onUnTick = (item: any) => {
    item.tick = false;
    parent(item.parent);
    if (item[childField]) {
      item[childField].map((child: any) => onUnTick(child));
    }
    reload();
  };

  const showChild = (item: any) => {
    item.show = !item.show;
    reload();
  };

  const reload = () => {
    setKey(Math.random());
    selectItem = [];
    selectItemTick(listData);
  };

  const selectItemTick = (data: any) => {
    data.map((item: any) => {
      if (item.tick) {
        selectItem.push(item);
      }
      if (item[childField]) {
        selectItemTick(item[childField]);
      }
    });
  };

  useEffect(() => {
    if(!props?.buttonName){
      props.onSelect(selectItem);
    }
    
  }, [selectItem]);

  const font = () => {
    if (fontFamily) {
      return {
        fontFamily: fontFamily
      }
    } else {
      return {}
    }
  }

  const renderList = (item: any, childs: any, index: number) => {
    if (!item.show) {
      item.show = false;
    }
    if (!item.tick) {
      item.tick = false;
    }
    return (
      <View style={styles.item} key={index}>
        <View style={styles.rowItem}>
          {childs && childs.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                showChild(item);
              }}>
              <Text style={[styles.showIcon, { color: iconColor }, isAndroid && item.show && {paddingLeft: scale(5)}]}>{item.show ? '-' : '+'}</Text>
            </TouchableOpacity>
          ) : <Text style={styles.showIcon}>{`  `}</Text>}
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              if (!item.tick) {
                onTick(item);
              } else {
                onUnTick(item);
              }
            }}>
            <View style={styles.center}>
              {item.tick ? <Text style={[styles.tick, { color: iconColor }]}>☑</Text> : <Text style={[isIOS ? styles.unTick : styles.tick, { color: iconColor }]}>☐</Text>}
              <Text style={[styles.name, textStyle, font()]} numberOfLines={3}>{item[textField]}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={[!item.show && { height: 0 }]}>
          {childs &&
            childs.map((data: any, index: number) => {
              if (!data.parent) {
                data.parent = item;
              }
              return renderList(data, data[childField], index);
            })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={listData}
        renderItem={({ item, index }) => renderList(item, item[childField], index)}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        extraData={key}
      />
      {props?.buttonName ? <TouchableOpacity style={[styles.btn, buttonStyle]} onPress={() => {
        props.onSelect(selectItem);
      }}>
        <Text style={[styles.btnName, buttonTextStyle, font()]}>{props.buttonName}</Text>
      </TouchableOpacity> : null}
    </View>
  );
};

HierarchyComponent.defaultProps = defaultProps;

export default HierarchyComponent;


