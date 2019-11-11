import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Category, Parcel, Poi, Pole, Project, Segment, Station} from "../../../../entities";
import {Image, Platform, StyleSheet, Text, TextInput, View} from "react-native";
import CheckBox from "../../../../components/checkbox";
import {COLORS} from "../../../../styles/colors";
import SvgUri from "react-native-svg-uri";
import Icon from 'react-native-vector-icons/Ionicons';
import {showDialogContent} from "../../../../redux/modules/dialogs";
import {
    categoryPoiSelected,
    changeControls,
    locationParcelsSelector,
    locationPoisSelector, locationPolesSelector, locationSegmentsSelector, locationSelector,
    locationStationsSelector, moduleName
} from "../../../../redux/modules/map";
import {segment_statuses, parcel_statuses} from "../../../../redux/utils";
import {categorySelector} from "../../../../redux/modules/admin";

interface IMapProps {
    project: Project,
    showDialogContent: Function,
    changeControls: Function,
    pois: Array<Poi>,
    showPois: boolean,
    projects: Array<Project>,
    segments: Array<Segment>,
    stations: Array<Station>,
    parcels: Array<Parcel>,
    poles: Array<Pole>,
    parcelsStatusSelected: Array<any>,
    segmentsStatusSelected: Array<any>,
    categoryPoiSelected: Array<number>,
    categories: Array<Category>,
}

interface IMapState {
    search: string,
    rendered: boolean,
}

class DrawerEntities extends Component<IMapProps, IMapState> {

    constructor(p) {
        super(p);
    }

    state = {
        search: '',
        rendered: false
    };

    componentDidUpdate(prevProps: Readonly<IMapProps>, prevState: Readonly<IMapState>, snapshot?: any): void {
        if(this.props.categories.length && !this.state.rendered)  {
            this.props.categories.forEach((cat)=> {
                this.props.categoryPoiSelected.push(cat.id);
            });

            this.setState({
                rendered: true
            });
        }
    }


    private onSelectItem = (name: string) => {
        this.props.changeControls({name, value: !this.props[name]})
    };

    private onSelectSubItem = (name: string, list: any, title: string) => {
        const props: any = this.props;
        const itemFilter = list.filter((el: any) => el.title === title)[0];
        const value: any = props[name];

        const indexInStore = value.indexOf(itemFilter.id);
        if (indexInStore < 0) {
            value.push(itemFilter.id);
        } else {
            value.splice(indexInStore, 1);
        }
        this.props.changeControls({name, value: [...value]});
        if (name.match('segment')) {
            this.props.changeControls({name: 'segmentList', value: Date.now()});
        } else if (name.match('parcel')) {
            this.props.changeControls({name: 'parcelList', value: Date.now()});
        } else if (name.match('category')) {
            this.props.changeControls({name: 'poiList', value: Date.now()});
        }
    };

    private onSearch = (value: string) => {
        this.setState({
            search: value
        })
    };

    render() {
        const {
            parcelsStatusSelected,
            segmentsStatusSelected,
            categoryPoiSelected
        } = this.props;

        const elements: any = [
            {
                name: 'showPoles',
                title: ({styles}) => (
                    <View style={localStyles.entity}>
                        <Text style={styles}>Electrical pole ({this.props.poles.length})</Text>
                        {/*<SvgUri source={require('../../../../../assets/images/pole.svg')}*/}
                        {/*        width={20}*/}
                        {/*        height={20}*/}
                        {/*/>*/}
                        <Image style={{width: 20, height: 20, resizeMode: 'center'}} source={require('../../../../../assets/images/drawer-pole.png')}/>
                    </View>
                )
            },
            {
                name: 'showSegments',
                title: ({styles}) => (
                    <View style={localStyles.entity}>
                        <Text style={styles}>Powerline segment ({this.props.segments.length})</Text>
                        {/*<SvgUri source={require('../../../../../assets/images/segment.svg')}*/}
                        {/*        width={20}*/}
                        {/*        height={20}*/}
                        {/*/>*/}
                        <Image style={{width: 20, height: 20, resizeMode: 'center'}} source={require('../../../../../assets/images/drawer-segment.png')}/>
                    </View>
                ),
                selected: segmentsStatusSelected,
                subName: 'segmentsStatusSelected',
                children: segment_statuses,
                hasStatus: true,
            },
            {
                name: 'showStations',
                title: ({styles}) => (
                    <View style={localStyles.entity}>
                        <Text style={styles}>Stations ({this.props.stations.length})</Text>
                        {/*<SvgUri source={require('../../../../../assets/images/station.svg')}*/}
                        {/*        width={20}*/}
                        {/*        height={20}*/}
                        {/*/>*/}
                        <Image style={{width: 20, height: 20, resizeMode: 'center'}} source={require('../../../../../assets/images/drawer-station.png')}/>
                    </View>
                )
            },
            {
                name: 'showParcels',
                title: ({styles}) => (
                    <View style={localStyles.entity}>
                        <Text style={styles}>Land parcel ({this.props.parcels.length})</Text>
                        {/*<SvgUri source={require('../../../../../assets/images/parcel.svg')}*/}
                        {/*        width={20}*/}
                        {/*        height={20}*/}
                        {/*/>*/}
                        <Image style={{width: 20, height: 20, resizeMode: 'center'}} source={require('../../../../../assets/images/drawer-parcel.png')}/>
                    </View>
                ),
                selected: parcelsStatusSelected,
                subName: 'parcelsStatusSelected',
                children: parcel_statuses,
                hasStatus: true,
            },
            {
                name: 'showPois',
                title: ({styles}) => (
                    <View style={localStyles.entity}>
                        <Text style={styles}>POI ({this.props.pois.length})</Text>
                        {/*<SvgUri source={require('../../../../../assets/images/poi.svg')}*/}
                        {/*        width={20}*/}
                        {/*        height={20}*/}
                        {/*/>*/}
                        <Image style={{width: 20, height: 20, resizeMode: 'center'}} source={require('../../../../../assets/images/drawer-poi.png')}/>
                    </View>
                ),
                selected: categoryPoiSelected,
                subName: 'categoryPoiSelected',
                children: this.props.categories,
                hasCategory: true
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
                                    <CheckBox
                                        key={el.name}
                                        onPress={() => this.onSelectItem(el.name)}
                                        selected={selected}
                                        text={el.title({styles: styleItem})}
                                    />
                                    {
                                        el.children && el.hasStatus && this.props[el.name] &&  (
                                            <View style={localStyles.statuses}>
                                                <Text style={localStyles.title}>Select Status:</Text>
                                                {
                                                    el.children.map((sub: any) => {
                                                        const checked: boolean = el.selected.indexOf(sub.id) > -1;
                                                        return (
                                                            <CheckBox
                                                                key={sub.id}
                                                                onPress={() => this.onSelectSubItem(el.subName, el.children, sub.title)}
                                                                selected={checked}
                                                                text={<View><Text style={styleItem}>{sub.title}</Text></View>}
                                                            />
                                                        )
                                                    })
                                                }
                                            </View>
                                        )
                                    }
                                    {
                                        this.props.showPois && el.hasCategory && el.children && this.props[el.name] && (
                                            <View style={localStyles.categories}>
                                                <Text style={localStyles.title}>Select Category:</Text>
                                                <View style={localStyles.search}>
                                                    <Icon name={Platform.OS === 'ios' ? 'ios-search' : 'md-search'} size={30} />
                                                    <TextInput
                                                        style={localStyles.input}
                                                        placeholder={'Search poi(s)...'}
                                                        placeholderTextColor={COLORS.TEXT_COLOR}
                                                        onChangeText={this.onSearch}
                                                        value={this.state.search}
                                                    />
                                                </View>
                                                {
                                                    el.children.filter((el) => {
                                                        if (this.state.search) {
                                                            return el.title.toLowerCase().match(this.state.search.toLowerCase())
                                                        } else {
                                                            return true
                                                        }
                                                    }).map((sub: any) => {
                                                        const checked: boolean = el.selected.indexOf(sub.id) > -1;
                                                        return (
                                                            <CheckBox
                                                                key={sub.id}
                                                                onPress={() => this.onSelectSubItem(el.subName, el.children, sub.title)}
                                                                selected={checked}
                                                                text={<View><Text style={styleItem}>{sub.title}</Text></View>}
                                                            />
                                                        )
                                                    })
                                                }
                                            </View>
                                        )
                                    }
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
    statuses: {
        flex: 1,
        paddingTop: 20,
        paddingBottom: 20,
        marginBottom: 20,
        marginLeft: 20,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#979797',
        borderBottomEndRadius: 1,
    },
    categories: {
        flex: 1,
        paddingTop: 20,
        marginLeft: 20,
        width: '100%',
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
    search: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 30,
        marginLeft: 5,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.PRIMARY,
        borderBottomEndRadius: 1,
    }
});

const mapStateToProps = (state: any) => ({
    pois: locationPoisSelector(state),
    parcels: locationParcelsSelector(state),
    stations: locationStationsSelector(state),
    project: locationSelector(state),
    poles: locationPolesSelector(state),
    segments: locationSegmentsSelector(state),
    showPois: state[moduleName].showPois,
    showStations: state[moduleName].showStations,
    showSegments: state[moduleName].showSegments,
    showParcels: state[moduleName].showParcels,
    showPoles: state[moduleName].showPoles,
    parcelsStatusSelected: state[moduleName].parcelsStatusSelected,
    segmentsStatusSelected: state[moduleName].segmentsStatusSelected,

    categoryPoiSelected: categoryPoiSelected(state),
    categories: categorySelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        showDialogContent,
        changeControls,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DrawerEntities);