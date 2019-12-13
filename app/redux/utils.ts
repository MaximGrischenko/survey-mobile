import _ from 'lodash';
import {API} from "../config";

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

// export const checkError = (nextProps: any, curProps: any, onSuccess: Function, toast: any) => {
//     if (!toast) return null;
//     if (nextProps.error && !_.isEqual(nextProps.error, curProps.error)) {
//         if (nextProps.error.error) {
//             if (nextProps.error.error.original) {
//                 toast.show(nextProps.error.error.original.detail, {
//                     position: toast.POSITION.TOP_LEFT
//                 });
//             } else {
//                 if (typeof nextProps.error.error === "string") {
//                     toast.show(nextProps.error.error, {
//                         position: toast.POSITION.TOP_LEFT
//                     });
//                 } else {
//                     toast.show(nextProps.error.message, {
//                         position: toast.POSITION.TOP_LEFT
//                     });
//                 }
//             }
//         } else {
//             toast.show(nextProps.error.error || nextProps.error.message, {
//                 position: toast.POSITION.TOP_LEFT
//             });
//         }
//         onSuccess();
//     }
// };

export const segment_operation_type = [
    {
        id: 1,
        value: 'mulczer',
        text: 'mulczer'
    },
    {
        id: 2,
        value: 'żyrafa',
        text: 'żyrafa'
    },
    {
        id: 3,
        value: 'piła',
        text: 'piła'
    },
    {
        id: 4,
        value: 'arboryści',
        text: 'arboryści'
    }
];

export const parcel_statuses = [
    {
        id: 1,
        value: 'Niezweryfikowane',
        title: 'Niezweryfikowane'
    },
    {
        id: 2,
        value: 'Zgoda',
        title: 'Zgoda'
    },
    {
        id: 3,
        value: 'Brak Zgody',
        title: 'Brak Zgody'
    },
];

export const parcel_ownership = [
    {
        id: 1,
        value: 'Forest',
        title: 'Forest'
    },
    {
        id: 2,
        value: 'Waters',
        title: 'Waters'
    },
    {
        id: 3,
        value: 'Roads',
        title: 'Roads'
    },
    {
        id: 4,
        value: 'Private',
        title: 'Private'
    },
    {
        id: 5,
        value: 'Other',
        title: 'Other'
    }
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