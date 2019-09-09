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

export const statuses = [
    {
        value: 1,
        text: 'Undefined'
    },
    {
        value: 2,
        text: 'Permission grandted'
    },
    {
        value: 3,
        text: 'no permission'
    },
];

export const segment_statuses = [
    {
        value: 'puste',
        text: 'Puste'
    },
    {
        value: 'zadrzewione',
        text: 'Zadrzewione'
    },
    {
        value: 'pilne',
        text: 'Pilne'
    },
    {
        value: 'wylaczenie',
        text: 'Wylaczenie'
    },
    {
        value: 'serwis',
        text: 'Serwis'
    },
    {
        value: 'niezweryfikowane',
        text: 'Niezweryfikowane'
    },
    {
        value: 'brak zgody',
        text: 'Brak Zgody'
    },
];