import _ from 'lodash';

export const moment = (date) => {
    const d1 = new Date(date);
    return {
        isSameOrBefore: (date: string) => {
            return d1.getTime() <= new Date(date).getTime()
        },
        isAfter: (date: Date) => {
            return d1.getTime() > new Date(date).getTime()
        }
    }
};

export const checkError = (nextProps: any, curProps: any, onSuccess: Function, toast: any) => {
    if (!toast) return null;
    if (nextProps.error && !_.isEqual(nextProps.error, curProps.error)) {
        if (nextProps.error.error) {
            if (nextProps.error.error.original) {
                toast.show(nextProps.error.error.original.detail, {
                    position: toast.POSITION.TOP_LEFT
                });
            } else {
                if (typeof nextProps.error.error === "string") {
                    toast.show(nextProps.error.error, {
                        position: toast.POSITION.TOP_LEFT
                    });
                } else {
                    toast.show(nextProps.error.message, {
                        position: toast.POSITION.TOP_LEFT
                    });
                }
            }
        } else {
            toast.show(nextProps.error.error || nextProps.error.message, {
                position: toast.POSITION.TOP_LEFT
            });
        }
        onSuccess();
    }
};

export const segment_operation_type = [
    {
        value: 'mulcher giraffe',
        text: 'mulcher giraffe'
    },
    {
        value: 'chainsaw',
        text: 'chainsaw'
    },
    {
        value: 'arborists',
        text: 'arborists'
    }
];

export const parcel_statuses = [
    {
        id: 1,
        value: 1,
        title: 'Undefined'
    },
    {
        id: 2,
        value: 2,
        title: 'Permission grandted'
    },
    {
        id: 3,
        value: 3,
        title: 'no permission'
    },
];

export const segment_statuses = [
    {
        id: 'puste',
        value: 'puste',
        title: 'Puste'
    },
    {
        id: 'zadrzewione',
        value: 'zadrzewione',
        title: 'Zadrzewione'
    },
    {
        id: 'pilne',
        value: 'pilne',
        title: 'Pilne'
    },
    {
        id: 'wylaczenie',
        value: 'wylaczenie',
        title: 'Wylaczenie'
    },
    {
        id: 'serwis',
        value: 'serwis',
        title: 'Serwis'
    },
    {
        id: 'niezweryfikowane',
        value: 'niezweryfikowane',
        title: 'Niezweryfikowane'
    },
    {
        id: 'brak zgody',
        value: 'brak zgody',
        title: 'Brak Zgody'
    },
];