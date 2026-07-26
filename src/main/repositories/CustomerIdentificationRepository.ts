import { DatabaseConnection } from '../mongodb/DatabaseConnection';


export class CustomerIdentificationRepository {

    private dbClient: DatabaseConnection;

    constructor(dbClient: DatabaseConnection) {
        this.dbClient = dbClient;
    }

    save = async (customerIdentification: any) => {
        const db = await this.dbClient.connect();

        await db.collection(`customer-identification`).replaceOne(
            {
                "identification": customerIdentification.identification,
                "cellPhone": customerIdentification.cellPhone
            },
            customerIdentification,
            { upsert: true }
        );
    }

    getAll = async (identification: string) : Promise<Record<string, any>[] | undefined> => {
        console.log(`--getAll`);

        const db = await this.dbClient.connect();

        // Query ordenado ascendentemente por la sort key (cellPhone).
        // ProjectionExpression "identification, cellPhone".
        return await db.collection(`customer-identification`)
            .find(
                { "identification": identification },
                {
                    projection: {
                        _id: 0
                        , identification: 1
                        , cellPhone: 1
                    }
                }
            )
            .sort({ "cellPhone": 1 })
            .toArray();
    }
}
