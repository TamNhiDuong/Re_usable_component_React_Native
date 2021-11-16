import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  FlatList,
  UIManager,
  ViewPropTypes,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import reject from 'lodash/reject';
import find from 'lodash/find';
import get from 'lodash/get';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import colors from '../../../config/colors';
import nodeTypes from './nodeTypes';
import { OPEN_SANS } from '../../../config/settings';

// set UIManager LayoutAnimationEnabledExperimental
if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const defaultSearchIcon = (
  <Icon name="magnify" size={20} color={colors.darkGrey} style={{ marginRight: 10 }} />
);

export default class MultiSelect extends Component {
  static propTypes = {
    single: PropTypes.bool,
    selectedItems: PropTypes.array,
    items: PropTypes.array.isRequired,
    uniqueKey: PropTypes.string,
    tagBorderColor: PropTypes.string,
    tagTextColor: PropTypes.string,
    tagContainerStyle: ViewPropTypes.style,
    fontFamily: PropTypes.string,
    tagRemoveIconColor: PropTypes.string,
    onSelectedItemsChange: PropTypes.func.isRequired,
    selectedItemFontFamily: PropTypes.string,
    selectedItemTextColor: PropTypes.string,
    itemFontFamily: PropTypes.string,
    itemTextColor: PropTypes.string,
    itemFontSize: PropTypes.number,
    selectedItemIconColor: PropTypes.string,
    searchIcon: nodeTypes,
    searchInputPlaceholderText: PropTypes.string,
    searchInputStyle: PropTypes.object,
    selectText: PropTypes.string,
    styleDropdownMenu: ViewPropTypes.style,
    styleDropdownMenuSubsection: ViewPropTypes.style,
    styleInputGroup: ViewPropTypes.style,
    styleItemsContainer: ViewPropTypes.style,
    styleListContainer: ViewPropTypes.style,
    styleRowList: ViewPropTypes.style,
    styleSelectorContainer: ViewPropTypes.style,
    styleTextDropdown: Text.propTypes.style,
    styleTextDropdownSelected: Text.propTypes.style,
    styleTextTag: Text.propTypes.style,
    altFontFamily: PropTypes.string,
    hideSubmitButton: PropTypes.bool,
    hideDropdown: PropTypes.bool,
    styleSubmitButton: Text.propTypes.style,
    submitButtonText: PropTypes.string,
    textColor: PropTypes.string,
    fontSize: PropTypes.number,
    fixedHeight: PropTypes.bool,
    hideTags: PropTypes.bool,
    canAddItems: PropTypes.bool,
    onAddItem: PropTypes.func,
    onChangeInput: PropTypes.func,
    displayKey: PropTypes.string,
    textInputProps: PropTypes.object,
    flatListProps: PropTypes.object,
    filterMethod: PropTypes.string,
    onClearSelector: PropTypes.func,
    onToggleList: PropTypes.func,
    removeSelected: PropTypes.bool,
    noItemsText: PropTypes.string,
    textInputEditable: PropTypes.bool,
  };

  static defaultProps = {
    single: false,
    selectedItems: [],
    uniqueKey: '_id',
    tagBorderColor: colors.darkGrey,
    tagTextColor: colors.darkGrey,
    fontFamily: OPEN_SANS,
    tagRemoveIconColor: colors.darkGrey,
    selectedItemFontFamily: OPEN_SANS,
    selectedItemTextColor: colors.textBlackMedium,
    searchIcon: defaultSearchIcon,
    itemFontFamily: '',
    itemTextColor: colors.greyText,
    itemFontSize: 12,
    selectedItemIconColor: colors.darkGrey,
    searchInputPlaceholderText: 'Search',
    searchInputStyle: { color: colors.greyText },
    textColor: colors.greyText,
    selectText: 'Select',
    altFontFamily: '',
    hideSubmitButton: false,
    submitButtonText: 'Done',
    fontSize: 14,
    fixedHeight: false,
    hideTags: false,
    hideDropdown: false,
    onChangeInput: () => {},
    displayKey: 'name',
    canAddItems: false,
    onAddItem: () => {},
    onClearSelector: () => {},
    onToggleList: () => {},
    removeSelected: false,
    noItemsText: 'No items to display.',
    textInputEditable: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      selector: false,
      searchTerm: '',
    };
  }

  shouldComponentUpdate() {
    return true;
  }

  getSelectedItemsExt = (optionalSelctedItems) => (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}>
      {this._displaySelectedItems(optionalSelctedItems)}
    </View>
  );

  _onChangeInput = (value) => {
    const { onChangeInput } = this.props;
    if (onChangeInput) {
      onChangeInput(value);
    }
    this.setState({ searchTerm: value });
  };

  _getSelectLabel = () => {
    const { selectText, single, selectedItems, displayKey } = this.props;
    if (!selectedItems || selectedItems.length === 0) {
      return selectText;
    }
    if (single) {
      const item = selectedItems[0];
      const foundItem = this._findItem(item);
      return get(foundItem, displayKey) || selectText;
    }
    return `${selectText} (${selectedItems.length} selected)`;
  };

  _findItem = (itemKey) => {
    const { items, uniqueKey } = this.props;
    return find(items, (singleItem) => singleItem[uniqueKey] === itemKey) || {};
  };

  _displaySelectedItems = (optionalSelectedItems) => {
    const {
      fontFamily,
      tagContainerStyle,
      tagRemoveIconColor,
      uniqueKey,
      tagTextColor,
      selectedItems,
      displayKey,
      styleTextTag,
    } = this.props;
    const actualSelectedItems = optionalSelectedItems || selectedItems;
    return actualSelectedItems.map((singleSelectedItem) => {
      const item = this._findItem(singleSelectedItem);
      if (!item[displayKey]) return null;
      return (
        <View
          style={[
            styles.selectedItem,
            {
              width: item[displayKey].length * 9 + 40,
              justifyContent: 'center',
              height: 30,
              backgroundColor: colors.dateWrapperGrey,
            },
            tagContainerStyle || {},
          ]}
          key={item[uniqueKey]}>
          <Text
            style={[
              {
                flex: 1,
                color: tagTextColor,
                fontSize: 12,
              },
              styleTextTag && styleTextTag,
              fontFamily ? { fontFamily } : {},
            ]}
            numberOfLines={1}>
            {item[displayKey]}
          </Text>
          <TouchableOpacity
            style={{ marginHorizontal: 5 }}
            onPress={() => {
              this._removeItem(item);
            }}>
            <Icon
              name="close-circle"
              style={{
                color: tagRemoveIconColor,
                fontSize: 22,
              }}
            />
          </TouchableOpacity>
        </View>
      );
    });
  };

  _removeItem = (item) => {
    const { uniqueKey, selectedItems, onSelectedItemsChange } = this.props;
    const newItems = reject(selectedItems, (singleItem) => item[uniqueKey] === singleItem);
    // broadcast new selected items state to parent component
    onSelectedItemsChange(newItems);
  };

  _removeAllItems = () => {
    const { onSelectedItemsChange } = this.props;
    // broadcast new selected items state to parent component
    onSelectedItemsChange([]);
  };

  _clearSelector = () => {
    this.setState({
      selector: false,
    });
  };

  _clearSelectorCallback = () => {
    const { onClearSelector } = this.props;
    this._clearSelector();
    if (onClearSelector) {
      onClearSelector();
    }
  };

  _toggleSelector = () => {
    const { onToggleList } = this.props;
    this.setState({
      selector: !this.state.selector,
    });
    if (onToggleList) {
      onToggleList();
    }
  };

  _clearSearchTerm = () => {
    this.setState({
      searchTerm: '',
    });
  };

  _submitSelection = () => {
    this._toggleSelector();
    // reset searchTerm
    this._clearSearchTerm();
  };

  _itemSelected = (item) => {
    const { uniqueKey, selectedItems } = this.props;
    return selectedItems.indexOf(item[uniqueKey]) !== -1;
  };

  _addItem = () => {
    const { uniqueKey, items, selectedItems, onSelectedItemsChange, onAddItem } = this.props;
    let newItems = [];
    let newSelectedItems = [];
    const newItemName = this.state.searchTerm;
    if (newItemName) {
      const newItemId = newItemName
        .split(' ')
        .filter((word) => word.length)
        .join('-');
      newItems = [...items, { [uniqueKey]: newItemId, name: newItemName }];
      newSelectedItems = [...selectedItems, newItemId];
      onAddItem(newItems);
      onSelectedItemsChange(newSelectedItems);
      this._clearSearchTerm();
    }
  };

  _toggleItem = (item) => {
    const { single, uniqueKey, selectedItems, onSelectedItemsChange } = this.props;
    if (single) {
      this._submitSelection();
      onSelectedItemsChange([item[uniqueKey]]);
    } else {
      const status = this._itemSelected(item);
      let newItems = [];
      if (status) {
        newItems = reject(selectedItems, (singleItem) => item[uniqueKey] === singleItem);
      } else {
        newItems = [...selectedItems, item[uniqueKey]];
      }
      // broadcast new selected items state to parent component
      onSelectedItemsChange(newItems);
    }
  };

  _itemStyle = (item) => {
    const {
      selectedItemFontFamily,
      selectedItemTextColor,
      itemFontFamily,
      itemTextColor,
      itemFontSize,
    } = this.props;
    const isSelected = this._itemSelected(item);
    const fontFamily = {};
    if (isSelected && selectedItemFontFamily) {
      fontFamily.fontFamily = selectedItemFontFamily;
    } else if (!isSelected && itemFontFamily) {
      fontFamily.fontFamily = itemFontFamily;
    }
    const color = isSelected ? { color: selectedItemTextColor } : { color: itemTextColor };
    return {
      ...fontFamily,
      ...color,
      fontSize: itemFontSize,
    };
  };

  _getRow = (item) => {
    const { selectedItemIconColor, displayKey, styleRowList } = this.props;
    return (
      <TouchableOpacity
        disabled={item.disabled}
        onPress={() => this._toggleItem(item)}
        style={[styleRowList && styleRowList, { paddingLeft: 20, paddingRight: 20 }]}>
        <View style={[styles.row, styles.itemRow]}>
          <Text
            style={[
              styles.selectionTxt,
              this._itemStyle(item),
              item.disabled ? { color: 'grey' } : {},
            ]}>
            {item[displayKey]}
          </Text>
          {this._itemSelected(item) ? (
            <Icon
              name="check"
              style={{
                fontSize: 20,
                color: selectedItemIconColor,
              }}
            />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  _getRowNew = (item) => (
    <TouchableOpacity
      disabled={item.disabled}
      onPress={() => this._addItem(item)}
      style={{ paddingLeft: 20, paddingRight: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={[
            styles.selectionTxt,
            this._itemStyle(item),
            item.disabled ? { color: 'grey' } : {},
          ]}>
          Add {item.name} (tap or press return)
        </Text>
      </View>
    </TouchableOpacity>
  );

  _filterItems = (searchTerm) => {
    switch (this.props.filterMethod) {
      case 'full':
        return this._filterItemsFull(searchTerm);
      default:
        return this._filterItemsPartial(searchTerm);
    }
  };

  _filterItemsPartial = (searchTerm) => {
    const { items, displayKey } = this.props;
    const filteredItems = [];
    items.forEach((item) => {
      const parts = searchTerm.trim().split(/[ \-:]+/);
      const regex = new RegExp(`(${parts.join('|')})`, 'ig');
      if (regex.test(get(item, displayKey))) {
        filteredItems.push(item);
      }
    });
    return filteredItems;
  };

  _filterItemsFull = (searchTerm) => {
    const { items, displayKey } = this.props;
    const filteredItems = [];
    items.forEach((item) => {
      if (item[displayKey].toLowerCase().indexOf(searchTerm.trim().toLowerCase()) >= 0) {
        filteredItems.push(item);
      }
    });
    return filteredItems;
  };

  _renderItems = () => {
    const {
      canAddItems,
      items,
      fontFamily,
      uniqueKey,
      selectedItems,
      flatListProps,
      styleListContainer,
      removeSelected,
      noItemsText,
    } = this.props;
    const { searchTerm } = this.state;
    let component = null;
    // If searchTerm matches an item in the list, we should not add a new
    // element to the list.
    let searchTermMatch;
    let itemList;
    let addItemRow;
    let renderItems = searchTerm ? this._filterItems(searchTerm) : items;
    // Filtering already selected items
    if (removeSelected) {
      renderItems = renderItems.filter((item) => !selectedItems.includes(item[uniqueKey]));
    }
    if (renderItems.length) {
      itemList = (
        <FlatList
          style={{ height: renderItems.length >= 3 ? 110 : 80 }}
          data={renderItems}
          extraData={selectedItems}
          keyExtractor={(item) => item[uniqueKey]}
          listKey={(item) => item[uniqueKey]}
          renderItem={(rowData) => this._getRow(rowData.item)}
          {...flatListProps}
          nestedScrollEnabled
        />
      );
      searchTermMatch = renderItems.filter((item) => item.name === searchTerm).length;
    } else if (!canAddItems) {
      itemList = (
        <View style={styles.row}>
          <Text
            style={[
              {
                flex: 1,
                marginTop: 20,
                textAlign: 'center',
                color: colors.activeYellow,
              },
              fontFamily ? { fontFamily } : {},
            ]}>
            {noItemsText}
          </Text>
        </View>
      );
    }

    if (canAddItems && !searchTermMatch && searchTerm.length) {
      addItemRow = this._getRowNew({ name: searchTerm });
    }
    component = (
      <View style={styleListContainer && styleListContainer}>
        {itemList}
        {addItemRow}
      </View>
    );
    return component;
  };

  render() {
    const {
      selectedItems,
      single,
      fontFamily,
      searchInputPlaceholderText,
      searchInputStyle,
      styleDropdownMenu,
      styleDropdownMenuSubsection,
      hideSubmitButton,
      hideDropdown,
      styleSubmitButton,
      submitButtonText,
      fixedHeight,
      hideTags,
      textInputProps,
      styleInputGroup,
      styleItemsContainer,
      styleSelectorContainer,
      searchIcon,
      textInputEditable,
    } = this.props;
    const { searchTerm, selector } = this.state;
    return (
      <View style={{ flexDirection: 'column' }}>
        {selector ? (
          <View
            style={[
              styles.selectorView(fixedHeight),
              styleSelectorContainer && styleSelectorContainer,
            ]}>
            {textInputEditable ? (
              <View style={[styles.inputGroup, styleInputGroup && styleInputGroup]}>
                {searchIcon}
                <TextInput
                  autoFocus
                  onChangeText={this._onChangeInput}
                  onSubmitEditing={this._addItem}
                  placeholder={searchInputPlaceholderText}
                  placeholderTextColor={colors.greyText}
                  underlineColorAndroid="transparent"
                  style={[searchInputStyle, { flex: 1 }]}
                  value={searchTerm}
                  editable={textInputEditable}
                  {...textInputProps}
                />
                {/* Arrow up */}
                {!hideDropdown && (
                  <Icon name="menu-up" onPress={this._submitSelection} style={styles.indicator} />
                )}
              </View>
            ) : (
              <View style={[styles.dropdownView, styleDropdownMenu && styleDropdownMenu]}>
                <View
                  style={[
                    styles.subSection,
                    styleDropdownMenuSubsection && styleDropdownMenuSubsection,
                  ]}>
                  <TouchableWithoutFeedback onPress={this._submitSelection}>
                    <View style={styles.row}>
                      <Text
                        style={[
                          styles.labelTxt,
                          {
                            fontFamily: fontFamily,
                            color:
                              this.props.selectedItems.length > 0
                                ? colors.darkGrey
                                : colors.greyText,
                          },
                        ]}
                        numberOfLines={1}>
                        {this._getSelectLabel()}
                      </Text>
                      <Icon name={'menu-up'} style={styles.indicator} />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            )}

            {/* List of choices */}
            <View style={{ flexDirection: 'column' }}>
              <View style={(styleItemsContainer && styleItemsContainer, styles.itemsContainer)}>
                {this._renderItems()}
                {/* Done button at the bottom */}
                {!single && !hideSubmitButton && (
                  <TouchableOpacity onPress={() => this._submitSelection()} style={[styles.button]}>
                    <Text
                      style={[
                        styles.buttonText,
                        styleSubmitButton && styleSubmitButton,
                        fontFamily ? { fontFamily } : {},
                      ]}>
                      {submitButtonText}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ) : (
          // Input field showing selected item
          <View style={styleSelectorContainer && styleSelectorContainer}>
            <View style={[styles.dropdownView, styleDropdownMenu && styleDropdownMenu]}>
              <View
                style={[
                  styles.subSection,
                  styleDropdownMenuSubsection && styleDropdownMenuSubsection,
                ]}>
                <TouchableWithoutFeedback onPress={this._toggleSelector}>
                  <View style={styles.row}>
                    <Text
                      style={[
                        styles.labelTxt,
                        {
                          fontFamily: fontFamily,
                          color:
                            this.props.selectedItems.length > 0 ? colors.darkGrey : colors.greyText,
                        },
                      ]}
                      numberOfLines={1}>
                      {this._getSelectLabel()}
                    </Text>
                    <Icon name={'menu-down'} style={styles.indicator} />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
            {!single && !hideTags && selectedItems.length ? (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}>
                {this._displaySelectedItems()}
              </View>
            ) : null}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  subSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    fontSize: 30,
    color: colors.darkGrey,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingTop: 3,
    paddingRight: 3,
    paddingBottom: 3,
    margin: 3,
    borderRadius: 20,
  },
  button: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.greyText,
    fontSize: 14,
  },
  selectorView: (fixedHeight) => {
    const style = {
      flexDirection: 'column',
      elevation: 2,
    };
    if (fixedHeight) {
      style.height = 250;
    }
    return style;
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  dropdownView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsContainer: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1.41,

    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionTxt: {
    flex: 1,
    paddingTop: 5,
    paddingBottom: 5,
  },
  labelTxt: {
    flex: 1,
    fontSize: 14,
  },
  itemRow: { borderBottomWidth: 0.5, borderBottomColor: colors.borderGrey, height: 35 },
});
