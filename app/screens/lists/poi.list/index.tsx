import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import MainList, {TYPES} from "../main.list";
import {showDialogContent} from "../../../redux/modules/dialogs";
import {locationPoisSelector, moduleName} from "../../../redux/modules/map";
import {searchSelector} from "../../../redux/modules/auth";

class Edit extends MainList {
    constructor(p: any) {
        super(p);
        this.title = 'Poi';
        this.type = TYPES.POI;
    }

    render() {
        return super._render();
    }
}

const mapStateToProps = (state: any) => ({
    selectedList: locationPoisSelector(state),
    search: searchSelector(state),
    loading: state[moduleName].loading
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        showDialogContent
    }, dispatch)
);

const list = connect(mapStateToProps, mapDispatchToProps)(Edit);
export default list;

// import React, {Component} from 'react';
// import {connect} from 'react-redux';
// import {bindActionCreators} from 'redux';
// import {Parcel, Pole, Segment, Station} from "../../../entities";
// import {
//     FlatList,
//     Platform,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableHighlight,
//     TouchableOpacity,
//     View
// } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import {CirclesLoader} from 'react-native-indicator';
// import {COLORS} from "../../../styles/colors";
// import {locationPoisSelector, locationStationsSelector, moduleName} from "../../../redux/modules/map.viewer";
// import {searchSelector} from "../../../redux/modules/auth";
// import {showDialogContent} from "../../../redux/modules/dialogs";
// import EditPoiDialog from "../../map.viewer/dialogs/edit.poi";
//
//
// interface IMapProps {
//     pois: Array<Station>,
//     search: string,
//     loading: boolean,
//     showDialogContent: Function
// }
//
// class PoiList extends Component<IMapProps> {
//
//     private renderSeparator = () => {
//         return (
//             <View
//                 style={{
//                     height: 1,
//                     width: "100%",
//                     backgroundColor: "#CED0CE",
//                 }}
//             />
//         );
//     };
//
//     private showDialog = (poi) => {
//         const {showDialogContent} = this.props;
//         showDialogContent(
//             {
//                 content: (
//                     <EditPoiDialog selectedItem={poi} />
//                 ),
//                 header: (
//                     <Text>Edit Stations ({poi.id})</Text>
//                 )
//             }
//         );
//     };
//
//     private entityFilter(list: Array<any>, search: string) {
//         if(!search) return list;
//         let _list = [];
//         const keys = list.length ? list[0].keys() : [];
//         console.log('keys', keys);
//         for (let i = 0; i < list.length; i++) {
//             const el: any = list[i];
//             if(search) {
//                 let isInSearch = false;
//                 // console.log('------------', el);
//                 for(let j = 0; j < keys.length; j++) {
//                     const val = el[keys[j]];
//                     // console.log('search -- ', val && val.toString().toLowerCase(), search.toLowerCase());
//                     if(val && val.toString().toLowerCase().match(search.toLowerCase())) {
//                         // console.log('FOUND', val.toString().toLowerCase(), search.toLowerCase());
//                         isInSearch = true;
//                         break;
//                     }
//                 }
//                 if (!isInSearch) continue;
//             }
//             _list.push(el);
//         }
//         return _list;
//     }
//
//     render() {
//         return (
//             <View style={localStyles.wrapper}>
//                 {
//                     !this.props.pois.length ? (
//                         <Text style={localStyles.warning}>Please select some Project</Text>
//                     ) : (
//                         <View style={localStyles.wrapper}>
//                             <ScrollView contentContainerStyle={localStyles.scroll}>
//                                 <FlatList
//                                     nestedScrollEnabled={true}
//                                     ItemSeparatorComponent={this.renderSeparator}
//                                     data={this.entityFilter(this.props.pois, this.props.search)}
//                                     renderItem={({item, separators}) => {
//                                         return (
//                                             <View style={localStyles.row}>
//                                                 <Text style={localStyles.item}>{item['title']}</Text>
//                                                 <TouchableOpacity onPress={() => this.showDialog(item)}>
//                                                     <Icon name={Platform.OS === 'ios' ? 'ios-play' : 'md-play'} size={30} />
//                                                 </TouchableOpacity>
//                                             </View>
//                                         )
//                                     }}
//                                 />
//                             </ScrollView>
//                         </View>
//                     )
//                 }
//             </View>
//         )
//     }
// }
//
// const localStyles = StyleSheet.create({
//     wrapper: {
//         flex: 1,
//     },
//     scroll: {
//         flex: 1,
//         width: '100%',
//         marginTop: 90,
//         paddingBottom: 30
//     },
//     row: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         height: 40,
//         paddingLeft: 10,
//         paddingRight: 10,
//     },
//     item: {
//         fontSize: 16,
//         color: COLORS.TEXT_COLOR
//     },
//     warning: {
//         fontSize: 20,
//         color: COLORS.TEXT_COLOR,
//         marginTop: 90
//     }
// });
//
// const mapStateToProps = (state: any) => ({
//     pois: locationPoisSelector(state),
//     search: searchSelector(state),
//     loading: state[moduleName].loading
// });
//
// const mapDispatchToProps = (dispatch: any) => (
//     bindActionCreators({
//         showDialogContent
//     }, dispatch)
// );
//
// export default connect(mapStateToProps, mapDispatchToProps)(PoiList);