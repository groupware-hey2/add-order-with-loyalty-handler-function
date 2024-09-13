
import axios, { AxiosResponse } from 'axios';

export class Hey2FlowApi {
    private apiUrl: string = "https://api.hey2.co/v1";
    private maxRetries: number = 2;

    constructor() {

    }

    execute = async (accountId: string, placeId: number, flowId: string, to: string, retryCount: number = 0): Promise<any | null> => {
        console.log(`--execute:`);
        axios.defaults.timeout = 5000; // 5 second
        try {
            const { data, status } = await axios.post(`${this.apiUrl}/flows/${flowId}/execute?accountId=${accountId}&placeId=${placeId}`
                                                    , JSON.stringify({
                                                            "to": to
                                                        })
                                                    , {
                                                        headers: {
                                                            'Accept': 'application/json'
                                                            , 'Content-Type': 'application/json'
                                                        }
                                                    });

            console.log(`--Response status API: ${status}` );
            console.log(`--Response data API: ${JSON.stringify(data)}` );
            if (data) {
                return data;
            } else {
                return null;
            }

        } catch (error) {
            // Manejar cualquier error de la solicitud
            console.error('- Error:', error);

            // Reintentar si no hemos alcanzado el número máximo de reintentos
            if (retryCount < this.maxRetries) {
                console.log(`--Retry (Retry ${retryCount + 1} of ${this.maxRetries})...`);
                return await this.execute(accountId, placeId, flowId, to, retryCount + 1);
            } else {
                console.error(`--Max retries (${this.maxRetries}).`);
                return null;
            }
        }
    }
}