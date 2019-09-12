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
}

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