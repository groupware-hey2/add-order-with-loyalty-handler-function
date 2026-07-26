import { DatabaseConnection } from '../mongodb/DatabaseConnection';


export class CustomerRepository {

    private dbClient: DatabaseConnection;

    constructor(dbClient: DatabaseConnection) {
        this.dbClient = dbClient;
    }

    save = async (customer: any) => {
        const db = await this.dbClient.connect();

        await db.collection(`customer`).replaceOne(
            {
                "cellPhone": customer.cellPhone
            },
            customer,
            { upsert: true }
        );
    }

    get = async (cellPhone: string) => {
        const db = await this.dbClient.connect();

        const item = await db.collection(`customer`).findOne(
            {
                "cellPhone": cellPhone
            },
            { projection: { _id: 0 } }
        );

        return item ?? undefined;
    };
}
