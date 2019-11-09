import {API} from "../../config";

export async function uploadAssetsAsync (file: any, token: any) {
    return new Promise((resolve, reject) => {

        const body = new FormData();
        body.append('filesData', file);
        const xhr = new XMLHttpRequest();

        xhr.open('POST', `${API}api/uploads`);
        xhr.setRequestHeader('authorization', token);
        xhr.responseType = 'json';
        xhr.send(body);
        xhr.onerror = function(e) {
            reject(e)
        };
        xhr.onload = function() {
            let responseObj = xhr.response;
            resolve(responseObj);
        };
    });
}