import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Category, Poi} from "../../../../../entities";
import {StyleSheet, Text, View} from "react-native";
import CheckBox from "../../../../../components/checkbox";
import {COLORS} from "../../../../../styles/colors";
import SvgUri from "react-native-svg-uri";

import {locationPoisSelector, moduleName, changeControls, categoryPoiSelected} from "../../../../../redux/modules/map";
import {categorySelector} from "../../../../../redux/modules/admin";

interface IMapProps {
    pois: Array<Poi>,
    category_poi_selected: Array<number>,
    categories: Array<Category>,
    changeControls: Function,
    showPois: boolean,
}

interface IMapState {
    search: string
}

class PoiEntity extends Component<IMapProps, IMapState> {
    state = {
        search: ''
    };

    private onSelectItem = (name: string) => {
        this.props.changeControls({name, value: !this.props[name]})
    };

    private onSelectSubItem = (name: string, list: any, title: string) => {
        const props: any = this.props;
        const itemFilter = list.filter((el: any) => el.text === title)[0];
        const value: any = props[name];

        const indexInStore = value.indexOf(itemFilter.value);
        if (indexInStore < 0) {
            value.push(itemFilter.value);
        } else {
            value.splice(indexInStore, 1);
        }
        this.props.changeControls({name, value: [...value]});
        if (name.match('poi')) {
            this.props.changeControls({name: 'poiList', value: Date.now()});
        }
    };

    render() {
        const {pois, showPois, categories, category_poi_selected} = this.props;
        const elements: any = [
            {
                name: 'showPois',
                title: ({styles}) => (
                    <View style={localStyles.entity}>
                        <Text style={styles}>POI ({this.props.pois.length})</Text>
                        <SvgUri source={require('../../../../../../assets/images/poi.svg')}
                                width={20}
                                height={20}
                        />
                    </View>
                )
            }
        ];
        return (
            <View style={localStyles.container}>
                <Text style={localStyles.title}>Select Entities:</Text>
                <View>
                    {
                        elements.map((el: any) => {
                            const selected = this.props[el.name];
                            let styleItem = selected ? [localStyles.selected] : [localStyles.item];

                            return (
                                <View key={el.name}>
                                    <Text>POI</Text>
                                    {/*<CheckBox*/}
                                    {/*    key={el.name}*/}
                                    {/*    onPress={() => this.onSelectItem(el.name)}*/}
                                    {/*    selected={selected}*/}
                                    {/*    text= {<View><Text style={styleItem}>{el.title}</Text></View>}*/}

                                    {/*/>*/}
                                    {/*{*/}
                                    {/*    showPois ? (*/}
                                    {/*        categories.filter((el: Category) => {*/}
                                    {/*            if (this.state.search) {*/}
                                    {/*                return el.title.toLowerCase().match(this.state.search.toLowerCase())*/}
                                    {/*            } else {*/}
                                    {/*                return true*/}
                                    {/*            }*/}
                                    {/*        }).map((sub: Category) => {*/}
                                    {/*            const checked: boolean = category_poi_selected.indexOf(sub.id) > -1;*/}
                                    {/*            return (*/}
                                    {/*                <CheckBox*/}
                                    {/*                    key={sub.id}*/}
                                    {/*                    onPress={() => this.onSelectSubItem(el.subName, el.children, sub.title)}*/}
                                    {/*                    selected={checked}*/}
                                    {/*                    text={'Category'}*/}
                                    {/*                />*/}
                                    {/*            )*/}
                                    {/*        })*/}
                                    {/*    ) : null*/}
                                    {/*}*/}
                                </View>
                            )
                        })
                    }
                </View>
            </View>
        )
    }
}

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
        paddingBottom: 30,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#979797',
        borderBottomEndRadius: 1,
    },
    subContainer: {
        flex: 1,
        paddingTop: 30,
        paddingBottom: 30,
        marginBottom: 30,
        marginLeft: 30,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#979797',
        borderBottomEndRadius: 1,
    },
    title: {
        paddingBottom: 20,
        opacity: 0.5,
        color: COLORS.TEXT_COLOR
    },
    entity: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    item: {
        padding: 10,
        fontSize: 16,
        height: 40,
        opacity: 0.7,
    },
    selected: {
        padding: 10,
        fontSize: 16,
        height: 40,
        opacity: 1,
    },
});

const mapStateToProps = (state: any) => {
    return {
        showPois: state[moduleName].showPois,
        pois: locationPoisSelector(state),
        categoryPoiSelected: categoryPoiSelected(state),
        categories: categorySelector(state),
        error: state[moduleName].error,
    }
};

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeControls
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(PoiEntity);