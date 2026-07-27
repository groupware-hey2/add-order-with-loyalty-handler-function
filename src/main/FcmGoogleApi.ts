
import axios, { AxiosResponse } from 'axios';
//import { google } from 'googleapis';
import { GoogleAuth, OAuth2Client } from 'google-auth-library';
var MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
var SCOPES = [MESSAGING_SCOPE];

export class FcmGoogleApi {
    private apiUrl: string = "https://fcm.googleapis.com/v1";
    private project: string;

    private maxRetries: number = 2;

    constructor(project: string = "diloq-connect") {
        this.project = project;
    }

    send = async (topic: string, retryCount: number = 0): Promise<any | null> => {
        console.log(`--send:  ${topic}`);
        axios.defaults.timeout = 5000; // 5 second
        try {
            const body = {
                message:{
                   topic: topic
                   , data : {
                    action : "SYNC_DATA",
                 }
                }
             };

            const apiAccessToken = await this.getAccessToken();
            console.log(`--apiAccessToken: ${apiAccessToken}` );
            const { data, status } = await axios.post(`${this.apiUrl}/projects/${this.project}/messages:send`
                                                    , body
                                                    , {
                                                        headers: {
                                                            'Authorization': `Bearer ${apiAccessToken}`,
                                                            'Content-Type': 'application/json',
                                                            'Accept': 'application/json'
                                                        }
                                                    });

            console.log(`--Response FcmGoogle status API: ${status}` );
            console.log(`--Response FcmGoogle data API: ${JSON.stringify(data)}` );
            if (data) {
                return data;
            } else {
                return null;
            }

        } catch (error) {
            // Manejar cualquier error de la solicitud
            console.error('- FcmGoogle Error:', error);

            // Reintentar si no hemos alcanzado el número máximo de reintentos
            if (retryCount < this.maxRetries) {
                console.log(`--Retry (Retry ${retryCount + 1} of ${this.maxRetries})...`);
                return await this.send(topic, retryCount + 1);
            } else {
                console.error(`--Max retries (${this.maxRetries}).`);
                return null;
            }
        }
    }

    getAccessToken = (): Promise<string | null | undefined> => {
        console.log(`--getAccessToken`);
        return new Promise((resolve, reject) => {
          //const key = require("hey2-9d82d-199c276475c9.json");
          const key = {client_email: "firebase-adminsdk-fbsvc@diloq-connect.iam.gserviceaccount.com", private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDiWLHz1g85f9AC\nyF1L9FJ3JwW+j5GoHOXqyoEhVEOcCtys7/QjKDFVjwbUBpRruJVCnvSGADoOCYp1\nZ0I99EYd4e7EHyHYdX4cLgpEAOfic13+BjVNHxFaaQNtjhNQwQZAGFTM+v1CB6DG\nZJLSdVJ49ZBMtY7WsqvnnZOc8ttiSt+YTJpqZzH3pv/fk0k0Itmt37K0pN6NDtdp\nm3WUAZefNQjHIGW3hB2jNZzvCDHlPEESvZlljS5YKuGG5eZvy7vw7gx6Qp8x5U0B\nXt9bC9W6ZoHxzH6R+GLpW96S9AFbhRHlSTBvzMrhyzNmX/xP6oKEEtQRYkOGZXb+\n0ocY9XZVAgMBAAECggEAFjii789aG0kDAOLu1eAcoHoCRF0P7bM4lz5eQwlkwdMH\nKys7iqANh9rMzs/+jjzG2o2EcAthp7MkFraWeEKdB54AtNxhlECkqtuSQm7cVQ0C\nc0fkv7eHGpsorP6/wrPQi0ZYPO9/IZZiIFgLWgIOoLVq/zzr0wQjgE+mCEiHZTTJ\nTezJ/YtSwDwqrknXn2HhCPv6eylVopYQW/khGbas+tm/l/idM008LLnD1o38+xob\nmOuFmlYOCY+oYxRzmimCagK3GbKwDDoMJIKNj/i8qUDgMmGunsQug1K/28+rTdio\nta4PKw7WTr3Ip4Mqe+5QL7LHb7s9A9t+vg+ClEbgAQKBgQDz7rQTMtGDAGSJFxlI\nHofj4UTvfRFIWsTK4NyDf+pMjsnYdHk+oNDAg+cX4BeZW+pNDLiHEwho9mDAA/zj\ntE0COGumH/f3kMinG2oKryj/XuBRExk3bUlYzyzItTzhMfuFi7XwuhPS2AJdVH/H\ncGozCy0bpLadEgvsY0KHtxE6VQKBgQDti0XuLURYAWi0Rzjp4PHr5bXrcBVs0cYm\n320EliENupr/PB/TI1YKXQ+hnSa6ExrHQpz2tvVwAslWUkFQdHfHgbcdheiL0gxR\n7A5fRiyo61a0hS5DtCEukX/jjQr0pxyVuf4B/jeZ/qPbWZUBlOfV9RQ6WpRiSvMF\npto3u0dMAQKBgGGGfCR42t7/VzKgM5Fr83Seags9+5zr/WYHhOJmT+yP4g9Sce8i\nKJPvqIMZKxY7c2+euF/4shIU/xWGAqOfQHK00AU5HtCx6Cc3hKwE3+VJr3F6q0hH\nv11sZ0FPhKmcbC02cGVwX+CaUEe0Muov/aWuwDgfIIun3XCDNuQ/wvmJAoGAU3pJ\nNf1UcjT0jb4lwxMZEVRljPqTnO1PXGPSFPWJYiC8zYtch794QiYYEyx96pBCLdo7\n/Puo3xcrmBlJ+LMlUMhGCKsBYPmM+NEi79piYW5qxv+ylXpc2tepANeVDQsZIYj+\nOccT1RtGjBQ8KBUjL+5zkFo6oRxDsS3ErCc1VAECgYEAoPQoqlokMyYjLrr+a+Ij\nrRI4RiyAFYwY2No1KhrnpmvrCliaEhpau3RcfKY0nqhkv+L88WBbehsATQ4/p5iq\nxiE3Xx5yRwfGpzPDcz+EWilYotgdUohCTVmJYXtbC2pwrkajYbcQk/uPa0BEmGME\nFTpSB3xxA3akD0gLS2Etnsc=\n-----END PRIVATE KEY-----\n"};
          const client = new GoogleAuth({
            credentials: {
              client_email: key.client_email,
              private_key: key.private_key,
            },
            scopes: SCOPES,
          });

          client.getAccessToken().then((res) => {
            //const accessToken = res.token;
            console.log(`--res ${JSON.stringify(res)}`);
            resolve(res);
          }).catch((err) => {
            console.error(`--error ${JSON.stringify(err)}`);
            reject(err);
          });

          /*
          const jwtClient = new google.auth.JWT(
            key.client_email,
            undefined,
            key.private_key,
            SCOPES,
            undefined
          );
      
          jwtClient.authorize((err, tokens) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(tokens?.access_token);
          });
          */
        });
      }
}