import { DatabaseConnection } from '../mongodb/DatabaseConnection';


export class WhatsappWorkflowRepository {

    private dbClient: DatabaseConnection;

    constructor(dbClient: DatabaseConnection) {
        this.dbClient = dbClient;
    }

    list = async (accountId: string) => {
        const db = await this.dbClient.connect();

        // KeyConditionExpression "#pk = :accountId" + FilterExpression
        // "#status = :status": el filtro se suma a la misma condición del find.
        // ScanIndexForward: true -> orden ascendente por la sort key (id).
        return await db.collection(`whatsapp-workflow`)
            .find(
                {
                    "accountId": accountId,
                    "status": "ACTIVE"
                },
                { projection: { _id: 0 } }
            )
            .sort({ "id": 1 })
            .toArray();
    }
}
