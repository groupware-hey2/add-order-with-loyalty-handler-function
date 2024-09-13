
import axios, { AxiosResponse } from 'axios';
//import { google } from 'googleapis';
import { GoogleAuth, OAuth2Client } from 'google-auth-library';
var MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
var SCOPES = [MESSAGING_SCOPE];

export class FcmGoogleApi {
    private apiUrl: string = "https://fcm.googleapis.com/v1";
    private project: string;

    private maxRetries: number = 2;

    constructor(project: string = "hey2-9d82d") {
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
          const key = {client_email: "firebase-adminsdk-jgfzj@hey2-9d82d.iam.gserviceaccount.com", private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCqsbSdiYwGnICS\nhBtDvbbgGWkJZAc10WIA+8dM1gZgkEoECNEc3ZTw96Z1dcuQRUmLuhwdtZSxmldQ\nzIfQyJZ/C7vCpG0vCoWJvXt5i4LIkVeiwyvZNpqK8br3AA/ZnV4LWFnyeY+9XNBD\nCIv7XjehZQZTq/q+P86J3pEs4NTWOg+hr9Kmu6a2/+YRKKa5NpPpFIpDJZtPLDG6\nrhcKOnQZctittZV+/fZIo0jnzq67eFZVi2b+aM6S3YFLmYCWmlPeujMDWQpOqBL3\nqUzTxfezxkMAkRYAwDcNbhHjT8oLeeoAOKdmBTlB30ZawrMyyrimndNAtYDHJpF7\nMqfe/F8zAgMBAAECggEAArdjGjb7EmeTmspvi8gR45imNZ759Ypc+PhR50J6qjco\nd4VBQYPXMibGwrlWGFOVX9LLKZtMyRzCBWOmJDoSq5x6Z4R8NAmCwYPjo38rymsq\n1xHjC9IU/RZY/kOzDyiPu398p4YaI45iWKIsHT+WOufIKcdsyJZsW4CZlGguHTCb\nWVmjTvM1jLnFqaRsdpnNpqXSqRfapsARSxo2ccCna+D4w1XdjvZJyXBr86Kqs8nK\nvgdDVHqkmwPcozIWaC/u9pNtwQqqBQ5bYBHcv4A4J8n+06mEbZKFrIxJwIt4vbID\nYMJ3WmRYOdo2sh8Y7zT6yAEvW/L9m2g195gYNSrcCQKBgQDu5wRZJHhykq2OtPWY\nwjdZNQro53iohyE96JhrWtkdubAAT/TOIyW/yHuMsZKpHtPIkC/C5GpOV2uXHQsa\nkG6FLJ8xY7P3L8g9TKlkzbtnrjUdDXwiD8z7p/B3UREF+XgtwVgU7ccwnGeZUktb\nrDyPgZa3eSx2iGM5mn13Pk+jqwKBgQC26QfIQ2J7kelu8hF4a2LTSbBGwBntJS1b\n7NsrPxwKBvKJCp1n1Ba6K6o1Nf62sGvlo1eyHwPl2ZnexXFoo6O2y79wG0pX+K69\nzlKwgzM8Z5Mi17LMXVoFODrIJUZki1xYfFns/hf5w9l7HzRnkFMlusSslkTtiJq3\nCtwOiByqmQKBgQDq6SozZVMyhdw3KOUeUksOYsPZhFH2lPkw4NePKIO5YO8ZP4Xe\ndF0YGdCy5aDqvy9MVctA/k0xv3BB5QMYGdEzDk9yxzEc7FUfQZSHVGzkZD5B1RKs\ng5DyG46uJH5yu31asHUmDzEAMasE7hC/kbry+V/0BSidXTsEV07rw8+XhQKBgQCk\nQ5LhnuKK5vck0/AsnQQbjEnqwAqIlqKts4EAzaR4vNSDjizeWfIvL5ekQeGGX9oG\nWTMgnAn8Gfe9wMOgnZUhTMmX/Go/pu4HN4u7SZhx3vKcj+na7tsxZNYleJRHJ4C/\nVq3L0EXn4KMnl1aQy2RgteJ6vFkamVuYlwAZbNORwQKBgF/yQI/TyjfbADZc1/Li\no0CmcRcUi0HbVfPBlwP725xaGDOqAfs/nSz5O1BhW1jwEVFHBcEkVDeQzJraiykG\nAi9ZX9MzmVc3obdwn6UWevz7yCJCuGHtdwMiYe3c+Dpusbq/46f7FTygxZW0Rj6g\nMXmG6JQ1s9LQAGE9RlDJ7CJu\n-----END PRIVATE KEY-----\n"};
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