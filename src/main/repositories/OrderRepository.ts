import { DatabaseConnection } from '../mongodb/DatabaseConnection';


export class OrderRepository {

    private dbClient: DatabaseConnection;
    private accountId: String;

    constructor(dbClient: DatabaseConnection, accountId: string) {
        this.dbClient = dbClient;
        this.accountId = accountId;
    }

    save = async (order: any) => {
        const db = await this.dbClient.connect();

        await db.collection(`order-${this.accountId}`).replaceOne(
            {
                "orderDateAndPlace": order.orderDateAndPlace,
                "orderNumber": order.orderNumber
            },
            order,
            { upsert: true }
        );
    }

    list = async (placeId: string) : Promise<Array<any>> => {

        var currentDateTime = new Date();
        currentDateTime.setUTCHours(currentDateTime.getUTCHours() - 5);
        console.log(`--currentDateTime ${currentDateTime}`);
        const orderDateAndPlace = `${currentDateTime.toISOString().split('T')[0]}:${placeId}`

        const db = await this.dbClient.connect();

        // Query de DynamoDB devuelve siempre ordenado ascendentemente por la
        // sort key (orderNumber), aunque no se declare ScanIndexForward.
        // El orden es crítico: el reduce del Service acumula sobre la secuencia.
        return await db.collection(`order-${this.accountId}`)
            .find(
                { "orderDateAndPlace": orderDateAndPlace },
                { projection: { _id: 0 } }
            )
            .sort({ "orderNumber": 1 })
            .toArray();
    }
}
