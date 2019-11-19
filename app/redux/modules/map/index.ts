import {API, appName} from '../../../config';
import {Record} from 'immutable';
import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {createSelector} from 'reselect';
import {SIGN_OUT_SUCCESS} from '../auth';
import _ from 'lodash';
import {moment} from '../../utils';
import {Pole, Parcel, Segment, Station, Poi, Project, GPSCoordinate, Powerline} from "../../../entities";

import {
    FETCH_LOCATION_POLES_REQUEST,
    FETCH_LOCATION_POLES_SUCCESS,
    FETCH_LOCATION_POLES,
    FETCH_LOCATION_POLES_ERROR,

    ADD_POLE,
    ADD_POLE_REQUEST,
    ADD_POLE_ERROR,
    ADD_POLE_SUCCESS,

    addPoleSaga,
    fetchLocationPolesSaga,
    FETCH_POLES_OFFLINE,
    fetchPolesOfflineSaga
} from './poles';

import {
    FETCH_LOCATION_PARCElS_REQUEST,
    FETCH_LOCATION_PARCElS_SUCCESS,
    FETCH_LOCATION_PARCElS,
    FETCH_LOCATION_PARCElS_ERROR,

    ADD_PARCElS,
    ADD_PARCElS_REQUEST,
    ADD_PARCElS_ERROR,
    ADD_PARCElS_SUCCESS,

    editParcelSaga,
    addParcelSaga,
    fetchLocationParcelSaga,
    EDIT_PARCElS,
    EDIT_PARCElS_SUCCESS,
    DELETE_LOCATION_PARCElS_SUCCESS,
    deleteParcelSaga,
    DELETE_PARCElS,
    FETCH_PARCELS_OFFLINE_REQUEST,
    fetchParcelsOfflineSaga,
    FETCH_PARCELS_OFFLINE,
    EDIT_PARCEL_OFFLINE,
    editParcelOfflineSaga
} from './parcels';
import {
    LOADED_PROJECT_DATA,
    moduleName,
} from './config';
import {
    ADD_SEGMENTS_SUCCESS,
    FETCH_LOCATION_SEGMENTS_SUCCESS,
    FETCH_LOCATION_SEGMENTS,
    ADD_SEGMENTS,
    fetchLocationSegmentSaga,
    addSegmentSaga, FETCH_SEGMENTS_OFFLINE
} from "./segments";
import {
    FETCH_LOCATIONS,
    FETCH_LOCATIONS_REQUEST,
    FETCH_LOCATIONS_ERROR,
    FETCH_LOCATIONS_SUCCESS,
    ADD_LOCATIONS,
    ADD_LOCATIONS_REQUEST,
    ADD_LOCATIONS_ERROR,
    ADD_LOCATIONS_SUCCESS,
    SELECT_LOCATION,
    SELECT_LOCATION_SUCCESS,
    addLocationSaga,
    fetchLocationsSaga,
    selectLocationSaga, FETCH_LOCATIONS_OFFLINE, fetchLocationsOfflineSaga
} from "./locations";
import {
    FETCH_LOCATION_STATIONS_SUCCESS,
    FETCH_LOCATION_STATIONS_ERROR,
    FETCH_LOCATION_STATIONS_REQUEST,
    fetchLocationStations, ADD_STATIONS_REQUEST, fetchLocationStationSaga, FETCH_LOCATION_STATIONS, EDIT_STATION_OFFLINE
} from "./stations";

import * as POI from "./poi";
import * as SEGMENTS from "./segments";
import * as STATIONS from "./stations";
import * as POLES from "./poles";
import * as PARCELS from "./parcels";
import * as POWERLINES from "./powerlines";

import {parcel_statuses, segment_statuses} from "../../utils";
import {AsyncStorage} from "react-native";
import {EDIT_POI_OFFLINE} from "./poi";

export * from './config';

const MapRecord = {
    drawModeList: [
        'Poles',
        'Segments',
        // 'PowerLines',
        'Parcels'
    ],
    drawMode: 'Poles',
    tempPosition: [],
    segments: [],
    pois: [],
    powerlines: [],
    selected_powerlines: [],
    locations: [],
    poles: [],
    stations: [],
    categoryPoiSelected: [],
    parcelsStatusSelected: parcel_statuses.map((el: any) => el.id),
    segmentsStatusSelected: segment_statuses.map((el: any) => el.id),
    parcels: [],
    dateFilter: 'All',
    mapZoom: 5,
    mapCenter: new GPSCoordinate([18.773329940003237, 51.72390325453768]),
    location: null,

    parcelList: Date.now(),
    polesList: Date.now(),
    segmentList: Date.now(),
    stationList: Date.now(),
    poiList: Date.now(),

    allowAddPoi: false,
    showPois: false,
    showSegments: false,
    showStations: false,
    showParcels: false,
    showPoles: false,
    loading: false,
    isDrawerOpen: false,
    isTablesOpen: false,
    isChecked: false,
    error: null,
};

export async function applyGEOPosition(location: any) {
    if(location) {
        await AsyncStorage.setItem('location', JSON.stringify(location));
    } else {
        await AsyncStorage.removeItem('location');
    }
}

export const ReducerRecord: any = Record(_.cloneDeep(MapRecord));

export const CONTROLS_CHANGE = `${appName}/${moduleName}/CONTROLS_CHANGE`;
export const CONTROLS_CHANGE_SUCCESS = `${appName}/${moduleName}/CONTROLS_CHANGE_SUCCESS`;


export default function reducer(state = new ReducerRecord(), action: any) {
    const {type, payload, error} = action;

    switch (type) {
        case STATIONS.EDIT_STATIONS_REQUEST:
        case STATIONS.DELETE_STATIONS_REQUEST:
        case POLES.DELETE_POLE_REQUEST:
        case POLES.EDIT_POLE_REQUEST:
        case SEGMENTS.EDIT_SEGMENTS_REQUEST:
        case SEGMENTS.DELETE_SEGMENTS_REQUEST:
        case POI.ADD_POI_REQUEST:
        case ADD_STATIONS_REQUEST:
        case ADD_POLE_REQUEST:
        case ADD_LOCATIONS_REQUEST:
        case FETCH_LOCATION_POLES_REQUEST:
        case FETCH_LOCATIONS_REQUEST:
            return state
                .set('loading', false)
                .set('error', null);


        case ADD_LOCATIONS_SUCCESS: {
            return state
                .set('loading', false)
                .set('locations', [...state.locations, action.payload])
                .set('tempPosition', [])
                .set('error', null);
        }

        case FETCH_LOCATION_POLES_SUCCESS: {
            // const loaded = state.poles.map((el: any) => el.id);
            // for (let i = 0; i < action.payload.length; i++) {
            //     if (loaded.indexOf(action.payload[i].id) < 0) {
            //         state.poles.push(action.payload[i]);
            //         loaded.push(action.payload[i].id);
            //     }
            // }
            return state
                .set('loading', false)
                .set('polesList', Date.now())
                .set('poles', [...action.payload.map((el: any) => new Pole(el))])
                .set('error', null);
        }
        case ADD_POLE_SUCCESS: {
            return state
                .set('loading', false)
                .set('polesList', Date.now())
                .set('poles', [...state.poles, new Pole(action.payload)])
                .set('tempPosition', [])
                .set('error', null);
        }
        case POLES.DELETE_POLE_SUCCESS: {
            return state
                .set('loading', false)
                .set('polesList', Date.now())
                .set('poles', [...state.poles.filter((el: Poi) => el.id !== action.payload.id)])
                .set('error', null);
        }
        case POLES.EDIT_POLE_SUCCESS: {
            return state
                .set('loading', false)
                .set('polesList', Date.now())
                .set('poles', [...state.poles.map((el: Poi) => {
                    if (el.id === action.payload.id) return new Pole(action.payload);
                    return el
                })])
                .set('error', null);
        }

        case FETCH_LOCATION_SEGMENTS_SUCCESS: {
            // const loaded = state.segments.map((el: any) => el.id);
            // for (let i = 0; i < action.payload.length; i++) {
            //     if (loaded.indexOf(action.payload[i].id) < 0) {
            //         state.segments.push(action.payload[i]);
            //         loaded.push(action.payload[i].id);
            //     }
            // }
            return state
                .set('loading', false)
                .set('segmentList', Date.now())
                .set('segments', [...action.payload.map((el: any) => new Segment(el))])
                .set('error', null);
        }
        case ADD_SEGMENTS_SUCCESS: {
            const loaded = state.segments.map((el: any) => el.id);
            for (let i = 0; i < action.payload.length; i++) {
                if (loaded.indexOf(action.payload[i].id) < 0) {
                    state.poles.push(action.payload[i]);
                    loaded.push(action.payload[i].id);
                }
            }
            return state
                .set('loading', false)
                .set('segmentList', Date.now())
                .set('segments', [...state.segments.map((el: any) => new Segment(el))])
                .set('error', null);
        }
        case SEGMENTS.DELETE_SEGMENTS_SUCCESS: {
            return state
                .set('loading', false)
                .set('segmentList', Date.now())
                .set('segments', [...state.segments.filter((el: Poi) => el.id !== action.payload.id)])
                .set('error', null);
        }
        case SEGMENTS.EDIT_SEGMENTS_SUCCESS: {
            return state
                .set('loading', false)
                .set('segmentList', Date.now())
                .set('segments', [...state.segments.map((el: Poi) => {
                    if (el.id === action.payload.id) return new Segment(action.payload);
                    return el
                })])
                .set('error', null);
        }

        case FETCH_LOCATION_STATIONS_SUCCESS: {
            // const loaded = state.stations.map((el: any) => el.id);
            // for (let i = 0; i < action.payload.length; i++) {
            //     if (loaded.indexOf(action.payload[i].id) < 0) {
            //         state.stations.push(action.payload[i]);
            //         loaded.push(action.payload[i].id);
            //     }
            // }
            return state
                .set('loading', false)
                .set('stationList', Date.now())
                .set('stations', [...action.payload.map((el: any) => new Station(el))])
                .set('error', null);
        }
        case STATIONS.ADD_STATIONS_SUCCESS: {
            return state
                .set('loading', false)
                .set('stationList', Date.now())
                .set('stations', [...state.stations, new Station(action.payload)])
                .set('error', null);
        }
        case STATIONS.DELETE_STATIONS_SUCCESS: {
            return state
                .set('loading', false)
                .set('stationList', Date.now())
                .set('stations', [...state.stations.filter((el: Station) => el.id !== action.payload.id)])
                .set('error', null);
        }
        case STATIONS.EDIT_STATIONS_SUCCESS: {
            return state
                .set('loading', false)
                .set('stationList', Date.now())
                .set('stations', [...state.stations.map((el: Station) => {
                    if (el.id === action.payload.id) return new Station(action.payload);
                    return el
                })])
                .set('error', null);
        }

        case CONTROLS_CHANGE_SUCCESS: {
            if (action.payload.name === 'selected_powerlines') {
                return state
                    .set('parcelList', Date.now())
                    .set('polesList', Date.now())
                    .set('loading', false)
                    .set(action.payload.name, action.payload.value)
                    .set('error', null)
            }
            return state
                .set('loading', false)
                .set(action.payload.name, action.payload.value)
                .set('error', null);
        }

        case ADD_PARCElS_SUCCESS: {
            return state
                .set('loading', false)
                .set('parcels', [...state.parcels, new Parcel(action.payload)])
                .set('tempPosition', [])
                .set('error', null);
        }
        case FETCH_LOCATION_PARCElS_SUCCESS: {
            // const loaded = state.parcels.map((el: any) => el.id);
            // for (let i = 0; i < action.payload.length; i++) {
            //     if (loaded.indexOf(action.payload[i].id) < 0) {
            //         state.parcels.push(action.payload[i]);
            //         loaded.push(action.payload[i].id);
            //     }
            // }
            return state
                .set('loading', false)
                .set('parcelList', Date.now())
                .set('parcels', [...action.payload.map((el: any) => new Parcel(el))])
                .set('error', null);
        }
        case EDIT_PARCElS_SUCCESS: {
            return state
                .set('loading', false)
                .set('parcelList', Date.now())
                .set('parcels', [...state.parcels.map((el: Parcel) => {
                    if (el.id === action.payload.id) {
                        return new Parcel(action.payload);
                    }
                    return el
                })])
                .set('error', null);
        }
        case DELETE_LOCATION_PARCElS_SUCCESS: {
            return state
                .set('loading', false)
                .set('parcelList', Date.now())
                .set('parcels', [...state.parcels.filter((el: Poi) => el.id !== action.payload.id)])
                .set('error', null);
        }

        case POI.FETCH_LOCATION_POIS_SUCCESS: {
            // const loaded = state.pois.map((el: any) => el.id);
            // for (let i = 0; i < action.payload.length; i++) {
            //     if (loaded.indexOf(action.payload[i].id) < 0) {
            //         state.pois.push(action.payload[i]);
            //         loaded.push(action.payload[i].id);
            //     }
            // }
            return state
                .set('loading', false)
                .set('poiList', Date.now())
                .set('pois', [...action.payload.map((el: any) => new Poi(el))])
                .set('error', null);
        }
        case POI.POI_DELETE_SUCCESS: {
            return state
                .set('loading', false)
                .set('poiList', Date.now())
                .set('pois', [...state.pois.filter((el: Poi) => el.id !== action.payload.id)])
                .set('error', null);
        }
        case POI.POI_EDIT_SUCCESS: {
            return state
                .set('loading', false)
                .set('poiList', Date.now())
                .set('pois', [...state.pois.map((el: Poi) => {
                    if (el.id === action.payload.id) return new Poi(action.payload);
                    return el;
                })])
                .set('error', null);
        }
        case POI.ADD_POI_SUCCESS: {
            return state
                .set('loading', false)
                .set('poiList', Date.now())
                // .set('pois', [...state.pois, new Poi(action.payload)])
                .set('pois', [...state.pois.filter((el: any) => el.id !== action.payload.id), new Poi(action.payload)])
                .set('error', null);

        }

        case SELECT_LOCATION_SUCCESS: {
            return state
                .set('location', action.payload)
                .set('error', null);
        }
        case FETCH_LOCATIONS_SUCCESS: {
            const list = action.payload;
            const _list = list.filter((el: any) => el.id === 3449);
            return state
                .set('loading', false)
                .set('locations', _list.length ? [new Project(_list[0]), ...list.filter((el: any) => el.id !== 3449).map((el) => new Project(el))] : [...list.map((el) => new Project(el))])
                .set('error', null);
        }
        case POWERLINES.FETCH_LOCATION_POWERLINES_SUCCESS: {
            // const loaded = state.powerlines.map((el: any) => el.id);
            // for (let i = 0; i < action.payload.length; i++) {
            //     if (loaded.indexOf(action.payload[i].id) < 0) {
            //         state.powerlines.push(action.payload[i]);
            //         loaded.push(action.payload[i].id);
            //     }
            // }

            return state
                .set('loading', false)
                .set('powerlines', [...action.payload.map((el) => new Powerline(el))])
                .set('error', null);
        }

        case SIGN_OUT_SUCCESS: {
            LOADED_PROJECT_DATA.PROJECTS = {};
            return new ReducerRecord(_.cloneDeep(MapRecord));
        }

        case POLES.DELETE_POLE_ERROR:
        case POLES.EDIT_POLE_ERROR:
        case SEGMENTS.EDIT_SEGMENTS_ERROR:
        case SEGMENTS.DELETE_SEGMENTS_ERROR:
        case PARCELS.DELETE_LOCATION_PARCElS_ERROR:
        case PARCELS.EDIT_PARCElS_ERROR:
        case POI.EDIT_POI_ERROR:
        case POI.DELETE_POI_ERROR:
        case POI.FETCH_LOCATION_POIS_ERROR:
        case FETCH_LOCATION_STATIONS_ERROR:
        case FETCH_LOCATION_POLES_ERROR:
        case ADD_POLE_ERROR:
        case ADD_LOCATIONS_ERROR:
        case FETCH_LOCATIONS_ERROR:
            return state
                .set('loading', false)
                .set('isChecked', true)
                .set('error', error);

        default:
            return state;
    }
}


export const stateSelector = (state: any) => state[moduleName];
export const locationsSelector = createSelector(stateSelector, state => state.locations);
export const locationSelector = createSelector(stateSelector, state => state.location);
export const powerlinesSelector = createSelector(stateSelector, state => state.powerlines.filter((el: any) => el.projectId === state.location.id));
export const powerlineSelector = createSelector(stateSelector, state => state.selected_powerlines);
export const categoryPoiSelected = createSelector(stateSelector, state => state.categoryPoiSelected);
export const polesSelector = createSelector(stateSelector, state => state.poles);
export const locationPoisSelector = createSelector(stateSelector, state => {
    const _m = moment(state.dateFilter);
    return state.pois.filter((el: Poi) => {
        return el.projectId === state.location.id &&
            (state.dateFilter === 'All' || _m.isSameOrBefore(el.updatedAt)) &&
            (
               state.categoryPoiSelected.indexOf(el.categoryId) > -1
            )
    })
});
export const locationPolesSelector = createSelector(stateSelector, state => {
    const _m = moment(state.dateFilter);
    return state.poles.filter((el: any) => {
        return el.projectId === state.location.id && (state.selected_powerlines.indexOf(el.powerLineId) > -1) && (state.dateFilter === 'All' || _m.isSameOrBefore(el.updatedAt))
    })
});
export const locationParcelsSelector = createSelector(stateSelector, state => {
    const _m = moment(state.dateFilter);
    return state.parcels.filter((el: any) => {
        return el.projectId === state.location.id &&
            (state.selected_powerlines.indexOf(el.powerLineId) > -1) &&
            (state.dateFilter === 'All' || _m.isSameOrBefore(el.updatedAt)) && state.parcelsStatusSelected.indexOf(el.status) > -1
    })
});
export const locationStationsSelector = createSelector(stateSelector, state => {
    const _m = moment(state.dateFilter);
    return state.stations.filter((el: any) => {
        return el.projectId === state.location.id && (state.dateFilter === 'All' || _m.isSameOrBefore(el.updatedAt))
    })
});
export const locationSegmentsSelector = createSelector(stateSelector, state => {
    const _m = moment(state.dateFilter);
    return state.segments.filter((el: any) => {
        return el.projectId === state.location.id &&
            (state.selected_powerlines.indexOf(el.powerLineId) > -1) &&
            (state.dateFilter === 'All' || _m.isAfter(el.updatedAt)) && state.segmentsStatusSelected.indexOf(el.status) > -1
    })
});
export const errorSelector = createSelector(stateSelector, state => state.error);
export const drawerStateSelector = createSelector(stateSelector, state => state.isDrawerOpen);
export const tablesStateSelector = createSelector(stateSelector, state => state.isTablesOpen);
export const currentModeSelector = createSelector(stateSelector, state => state.drawMode);
export const modesSelector = createSelector(stateSelector, state => state.drawModeList);
export const lastGeoPostionsSelector = createSelector(stateSelector, state => state.tempPosition);


export function changeControls(data: any) {
    return {
        type: CONTROLS_CHANGE,
        payload: data
    };
}

export const changeControlsSaga = function* (action: any) {
    yield put({
        type: CONTROLS_CHANGE_SUCCESS,
        payload: action.payload
    });
};

export const saga = function* () {
    yield all([
        takeEvery(FETCH_LOCATIONS, fetchLocationsSaga),
        takeEvery(FETCH_LOCATIONS_OFFLINE, fetchLocationsOfflineSaga),

        takeEvery(ADD_LOCATIONS, addLocationSaga),
        takeEvery(SELECT_LOCATION, selectLocationSaga),

        takeEvery(FETCH_POLES_OFFLINE, fetchPolesOfflineSaga),
        takeEvery(ADD_POLE, addPoleSaga),
        takeEvery(POLES.EDIT_POLE, POLES.editItemSaga),
        takeEvery(POLES.EDIT_POLE_OFFLINE, POLES.editPoleOfflineSaga),
        takeEvery(POLES.DELETE_POLE, POLES.deleteParcelSaga),
        takeEvery(FETCH_LOCATION_POLES, fetchLocationPolesSaga),

        takeEvery(CONTROLS_CHANGE, changeControlsSaga),

        takeEvery(ADD_PARCElS, addParcelSaga),
        takeEvery(EDIT_PARCElS, editParcelSaga),
        takeEvery(EDIT_PARCEL_OFFLINE, editParcelOfflineSaga),
        takeEvery(DELETE_PARCElS, deleteParcelSaga),
        takeEvery(FETCH_LOCATION_PARCElS, fetchLocationParcelSaga),
        takeEvery(FETCH_PARCELS_OFFLINE, fetchParcelsOfflineSaga),

        takeEvery(FETCH_LOCATION_SEGMENTS, fetchLocationSegmentSaga),
        takeEvery(ADD_SEGMENTS, addSegmentSaga),
        takeEvery(SEGMENTS.FETCH_SEGMENTS_OFFLINE, SEGMENTS.fetchSegmentsOfflineSaga),
        takeEvery(SEGMENTS.EDIT_SEGMENTS, SEGMENTS.editItemSaga),
        takeEvery(SEGMENTS.EDIT_SEGMENT_OFFLINE, SEGMENTS.editSegmentOfflineSaga),
        takeEvery(SEGMENTS.DELETE_SEGMENTS, SEGMENTS.deleteItemSaga),

        takeEvery(FETCH_LOCATION_STATIONS, fetchLocationStationSaga),
        takeEvery(STATIONS.FETCH_STATIONS_OFFLINE, STATIONS.fetchStationsOfflineSaga),
        takeEvery(STATIONS.EDIT_STATIONS, STATIONS.editItemSaga),
        takeEvery(STATIONS.EDIT_STATION_OFFLINE, STATIONS.editStationOfflineSaga),
        takeEvery(STATIONS.DELETE_STATIONS, STATIONS.deleteItemSaga),

        takeEvery(POI.FETCH_LOCATION_POIS, POI.fetchLocationPoiSaga),
        takeEvery(POI.FETCH_POIS_OFFLINE, POI.fetchPoiOfflineSaga),
        takeEvery(POI.ADD_POI, POI.addPoiSaga),
        takeEvery(POI.ADD_POI_OFFLINE, POI.addPoiOfflineSaga),
        takeEvery(POI.POI_DELETE, POI.removePoiSaga),
        takeEvery(POI.DELETE_POI_OFFLINE, POI.removePoiOfflineSaga),
        takeEvery(POI.POI_EDIT, POI.editPoiSaga),
        takeEvery(POI.EDIT_POI_OFFLINE, POI.editPoiOfflineSaga),
        takeEvery(POI.FETCH_POIS_OFFLINE, POI.fetchPoiOfflineSaga),

        takeEvery(POWERLINES.FETCH_LOCATION_POWERLINES, POWERLINES.fetchProjectPowerlinesSaga),
        takeEvery(POWERLINES.FETCH_POWERLINES_OFFLINE, POWERLINES.fetchPowelinesOfflineSaga),
    ]);
};
