import React, {Component} from 'react';
import {Upload, Pole, Parcel, Segment, Station, Category, Project, Powerline} from "../../../../entities";
import {segment_statuses, parcel_statuses, segment_operation_type, checkError} from "../../../../redux/utils";

import {Form, Field} from 'react-native-validate-form';
import {
    View,
    Text,
    StyleSheet,
    ScrollView, Alert,
} from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import {required} from "../../../../utils/validators";
import {TextField} from 'react-native-material-textfield';
import MultiSelect from "react-native-multiple-select";
import NumericInput from 'react-native-numeric-input';
import {PrimaryButton} from "../../../buttons/primary.button";
import DateTimePicker from "react-native-modal-datetime-picker";

import UploadComponent from "../../../upload.component";

interface IMapProps {
    isAdmin: any,
    itemsList: any,
    position: any,
    selectedItem: any,
    location: any,
    connection: boolean,
    categories: Array<Category>,
    projects: Array<Project>,
    powerlines: Array<Powerline>,
    tempPosition: Array<any>,
    onFinishEditItem: Function,
    changeControls: Function,
    editItem: Function,
    editItemOffline: Function,
    onDeleteItem: Function,
    onAddItem: Function,
    setDialogSaveButton: Function,
    setDialogDeleteButton: Function,
    showAlert: Function,
    showDialogContent: Function
}

interface IMapState {
    uploads: Array<Upload>,
    formErrors: any,
    fieldError: any,
    status: any,
    date: any,
    id: any,
    __pending: boolean
}

export const TYPES = {
    NONE: -1,
    PARCEL: 1,
    POLE: 2,
    STATION: 3,
    SEGMENT: 4,
    POI: 5,
};

export default class MainModalDialog extends Component<IMapProps, IMapState> {
    protected editTitle: boolean = false;
    protected title: string = '';
    protected type: number = TYPES.NONE;
    protected canDelete: boolean = false;
    static defaultProps: {
        categories: [],
        projects: [],
        powerlines: [],
        itemsList: null,
        position: null,
        tempPosition: [],
        onAddItem: () => false,
        onDeleteItem: () => false,
        onFinishEditItem: () => false,
        changeControls: () => false
    };

    constructor(p: any) {
        super(p);
        this.state = {
            __pending: false,
            formErrors: [],
            fieldError: {},
            ...p.selectedItem
        };
    }

    private select: any = null;
    private form: any = null;

    componentDidMount(): void {
        if(this.canDelete) {
            this.props.setDialogDeleteButton(
                (
                    <PrimaryButton
                        style={{width: 70, marginRight: 10}}
                        title={'Delete'}
                        onPress={this.handleDelete}
                    />
                )
            )
        }
        this.props.setDialogSaveButton(
            (
                <PrimaryButton
                    style={{width: 70, marginRight: 10}}
                    title={'Save'}
                    onPress={this.handleSubmit}
                />
            )
        )
    }

    componentWillUnmount(): void {
        this.props.setDialogSaveButton(null);
        this.props.setDialogDeleteButton(null);
    }

    componentWillReceiveProps(nextProps: any, nextContext: any): void {
        if (nextProps.itemsList !== this.props.itemsList) {
            this.setState({__pending: false});
            this.handleCancel({});
        }
    }

    private onFieldChange = (key: string) => {
        return (val: any) => {
            const newState: any ={
                [key]: val
            };
            this.setState(newState);
        }
    };

    private onChange = (e: any) => {
        let value = e.target.value;
        if(e.target.getAttribute instanceof Function) {
            value = parseFloat(value);
            const min = parseInt(e.target.getAttribute('min'));
            const max = parseInt(e.target.getAttribute('max'));
            if(!isNaN(max) && value > max) {
                value = max;
            }
            if(!isNaN(min) && value < min) {
                value = min;
            }
        }

        const newState: any = {
            [e.target.name]: value
        };
        this.setState(newState);
    };

    private handleSubmit = () => {
        // const fields = this.getFields();
        const formErrors = [];
        const fieldError = {};
        // const editItem: any = {
        //     ...this.state,
        // };
        //
        // fields.forEach((field) => {
        //
        //     console.log('name', field.name);
        //     console.log('item', editItem);
        //    if(!editItem[field.name]) {
        //        console.log('inner');
        //        formErrors.push({name: field.name, error: 'This is required field'});
        //    }
        // });
        let result: any = this.form.validate();

        result.map((field) => {
            formErrors.push({name: field.fieldName, error: field.error});
        });

        formErrors.forEach((field) => {
            fieldError[field.name] = field.error;
        });

        this.setState({
            formErrors,
            fieldError
        });
    };

    protected handleSave = async () => {
        try {
            this.setState({__pending: true});
            const editItem: any = {
                ...this.state,
            };
            if (this.type === TYPES.SEGMENT) {
                if (editItem.operation_type) editItem.operation_type = editItem.operation_type ? editItem.operation_type.join(",") : '';
            }

            if(this.props.connection) {
               // await this.props.editItemOffline(editItem);
                await this.props.editItem(editItem);
            } else {
                await this.props.editItemOffline(editItem);
            }
            if(this.props.onFinishEditItem instanceof Function) this.props.onFinishEditItem();
        } catch (e) {
            // toast.show(e.response ? e.response.data.error || e.response.data.message : e.meesage || e, {
            //     position: toast.POSITION.TOP_LEFT
            // });
        } finally {
        }
    };

    protected handleCancel = (e: any) => {
        this.props.showDialogContent(false);
    };

    protected handleDelete = () => {
        const editItem: any = {...this.state};
        const title = `Are you sure to delete Poi (${editItem.id})`;

        Alert.alert(
            title,
            '',
            [
                {
                    text: 'Delete',
                    onPress: () => this.onDelete(editItem)
                },
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel pressed'),
                    style: 'cancel'
                }
            ],
            {
                cancelable: true
            }
        )
    };

    private onDelete = async (item) => {
        try {
            this.props.onDeleteItem(item);
            if(this.props.onFinishEditItem instanceof Function) this.props.onFinishEditItem();
        } catch (e) {
            console.log(e);
        } finally {
            this.props.setDialogDeleteButton(null);
        }
    };

    private onUploadFile = (fileList) => {
        this.setState({
            uploads: [
                ...this.state.uploads,
                ...fileList
            ]
        })
    };

    private  onUpdateFile = (fileList) => {
        this.setState({
            uploads: [
                ...fileList
            ]
        })
    };

    private handleToggle = () => {
        console.log('select', this.select);
    };

    private getFields = () => {
        const fields = [];
        const {state} = this;
        const {isAdmin} = this.props;

        if (this.type === TYPES.PARCEL) {
            fields.push(
                {
                    title: 'Status',
                    name: 'status',
                    options: parcel_statuses
                },
                ...Parcel.edit_keys.map((el: string) => ({
                    title: el,
                    name: el,
                    disabled:!isAdmin
                }))
            );
        } else if (this.type === TYPES.POLE) {
            fields.push(
                {
                    title: 'Powerline',
                    name: 'powerLineId',
                    options: this.props.powerlines.map((el: any) => ({
                        text: el.title,
                        value: el.id
                    })),
                    disabled:!isAdmin
                },
                ...Pole.edit_keys.map((el: string) => ({
                    title: el,
                    name: el,
                    disabled:!isAdmin
                }))
            );
        } else if (this.type === TYPES.SEGMENT) {
            fields.push(
                {
                    title: 'Status',
                    name: 'status',
                    options: segment_statuses
                },
                {
                    options: [0, 25, 50, 75, 100].map((el: number) => ({
                        value: el,
                        text: el
                    })),
                    name: 'vegetation_status',
                    title: 'Vegetation status',
                    disabled:!isAdmin
                },
                {
                    type: 2,
                    step: 1,
                    min: 0,
                    max: 10,
                    name: 'distance_lateral',
                    title: 'Distance lateral'
                },
                {
                    type: 2,
                    step: 1,
                    min: 0,
                    max: 15,
                    name: 'distance_bottom',
                    title: 'Distance bottom'
                },
                ...Segment.edit_keys.map((el: string) => ({
                    title: el,
                    name: el,
                    disabled:!isAdmin
                }))
            );
            if (state.status === segment_statuses[3].value) {
                fields.push(
                    {
                        type: 6,
                        step: 1,
                        min: 1,
                        max: 12,
                        name: 'shutdown_time',
                        title: 'Shutdown time'
                    },
                    {
                        name: 'track',
                        title: 'Track',
                        options: [1, 2].map((el: number) => ({
                            value: el,
                            text: el
                        }))
                    },
                );
            }
            if ([
                segment_statuses[1].value,
                segment_statuses[2].value,
                segment_statuses[3].value,
                segment_statuses[4].value,
                segment_statuses[6].value,
            ].indexOf(state.status) > -1
            ) {
                fields.push(
                    {
                        type: 3,
                        name: 'operation_type',
                        title: 'Operation type',
                        options: segment_operation_type.map((el: any) => ({
                            value: el.value,
                            text: el.text,
                            name: el.text,
                            id: el.id
                        }))
                    },
                    {
                        type: 4,
                        // step: 1,
                        // min: 1,
                        // max: 12,
                        name: 'time_of_operation',
                        title: 'time of operation'
                    },
                );
            }
            if ([
                segment_statuses[4].value
            ].indexOf(state.status) > -1
            ) {
                fields.push(
                    {
                        name: 'time_for_next_entry',
                        title: 'time for next entry'
                    }
                );
            }
            if ([
                segment_statuses[6].value
            ].indexOf(state.status) > -1
            ) {
                fields.push(
                    {
                        name: 'parcel_number_for_permit',
                        title: 'parcel number for permit'
                    }
                );
            }
        } else if (this.type === TYPES.STATION) {
            fields.push(
                ...Station.edit_keys.map((el: string) => ({
                    title: el,
                    name: el,
                    disabled:!isAdmin
                }))
            );
        } else if (this.type === TYPES.POI) {
            fields.push(
                {
                    title: 'Project',
                    name: 'projectId',
                    options: this.props.projects.map((el: any) => ({
                        text: el.title,
                        value: el.id
                    })),
                    disabled:!isAdmin
                },
                {
                    title: 'Category',
                    name: 'categoryId',
                    required: true,
                    // removeLater: 1,
                    options: this.props.categories.map((el: any) => ({
                        text: el.title,
                        value: el.id
                    })),
                    disabled:!isAdmin
                },

            );
        }
        return fields;
    };

    private confirm = () => {

    };

    private cancel = () => {

    };

    protected _render() {
        const state: any = this.state;
        const {title, comment}: any = this.state;
        const {selectedItem}: any = this.props;
        const fields = this.getFields();

        return (
            <ScrollView>
                <Form
                    style={localStyles.form}
                    ref={(ref) => this.form = ref}
                    validate={true}
                    submit={() => this.handleSave()}
                    failed={() => console.log('failed')}
                    errors={this.state.formErrors}
                >
                    {
                        fields.map((el: any) => {
                            if(el.type === 2) {
                                return (
                                    <View key={el.name} style={localStyles.distance}>
                                        <Text style={localStyles.label}>{el.name}:</Text>
                                        <NumericInput
                                            value={state[el.name]}
                                            minValue={el.min}
                                            maxValue={el.max}
                                            onChange={(value) => this.onChange({target: {name: el.name, value}})}
                                            totalWidth={150}
                                            totalHeight={40}
                                            type={'up-down'}
                                            iconSize={15}
                                            step={el.step}
                                            valueType='integer'
                                        />
                                    </View>
                                )
                            } else if(el.type === 3) {
                                return (
                                    <View key={el.name} style={{marginTop: 20}}>
                                        <MultiSelect
                                            hideSubmitButton={true}
                                            uniqueKey={'name'}
                                            selectText={el.name}
                                            styleDropdownMenuSubsection={{height: 60, paddingLeft: 10}}
                                            styleInputGroup={{height: 60, justifyContent: 'flex-end', flexDirection: 'row'}}
                                            ref={(ref) => { this.select = ref }}
                                            searchInputStyle={{display: 'none', width: 0}}
                                            styleRowList={{height: 40}}
                                            textColor={'#000'}
                                            itemTextColor={'#000'}
                                            searchInputPlaceholderText={'Search...'}
                                            selectedItems={state[el.name]}
                                            items={el.options}
                                            onSelectedItemsChange={(value) => this.onChange({target: {name: el.name, value}})}
                                        />
                                    </View>
                                )
                            } else if(el.type === 4) {
                                return (
                                    <View key={el.name}>
                                        <DateTimePicker onConfirm={this.confirm} onCancel={this.cancel} />
                                    </View>
                                )
                            } else if(el.options) {
                                return (
                                    <Field
                                        key={el.name}
                                        onChangeText={this.onFieldChange(el.name)}
                                        label={el.title}
                                        placeholder={el.name}
                                        value={state[el.name]}
                                        data={el.options.map((el: any) => ({
                                            label: el.text,
                                            value: el.value
                                        }))}
                                        disabled={el.disabled}
                                        component={Dropdown}
                                    />
                                )
                            } else {
                                return (
                                    <Field
                                        required
                                        key={el.name}
                                        label={el.name}
                                        placeholder={`Enter ${el.name}`}
                                        component={TextField}
                                        validations={[required]}
                                        name={el.name}
                                        value={state[el.name] || ''}
                                        error={this.state.fieldError[el.name]}
                                        disabled={el.disabled}
                                        onChangeText={this.onFieldChange(el.name)}
                                        customStyle={{width: '100%'}}
                                    />
                                )
                            }
                        })
                    }
                    {
                        this.editTitle ? (
                            <View style={localStyles.title}>
                                <Field
                                    required
                                    label={"Title"}
                                    placeholder={`Enter title`}
                                    component={TextField}
                                    validations={[required]}
                                    name={'title'}
                                    value={title || ''}
                                    error={this.state.fieldError['title']}
                                    onChangeText={this.onFieldChange('title')}
                                    customStyle={{width: '100%'}}
                                />
                            </View>
                        ) : <View/>
                    }
                    <Field
                        component={TextField}
                        label={'Notes'}
                        placeholder="Enter notes"
                        name={ 'comment'}
                        multiline={true}
                        numberOfLines={5}
                        value={comment || ''}
                        onChangeText = {this.onFieldChange('comment')}
                        customStyle = {{width: '100%'}}
                    />
                    {
                        <UploadComponent
                            files={selectedItem.uploads}
                            onUpload = {this.onUploadFile}
                            onUpdate = {this.onUpdateFile}
                        />
                    }
                </Form>
            </ScrollView>
        )
    }
}

const localStyles = StyleSheet.create({
    modalTitle: {},
    form: {
        paddingLeft: 10,
        paddingRight: 10,
    },
    distance: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 10
    },
    label: {
        marginRight: 20
    },
    title: {
        marginTop: 20
    }
});