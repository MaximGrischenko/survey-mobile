import {SQLite} from 'expo-sqlite';

export const db = () => {
    return new Promise((resolve) => SQLite.openDatabase("survey", "1.0", "demo", 1024 * 1000 * 100, resolve));//50mb

};
