import { DatabaseConnection } from '../mongodb/DatabaseConnection';


export class AccountCustomerRepository {

    private dbClient: DatabaseConnection;
    private accountId: String;

    constructor(dbClient: DatabaseConnection, accountId: string) {
        this.dbClient = dbClient;
        this.accountId = accountId;
    }

    save = async (customer: any) => {
        const db = await this.dbClient.connect();

        await db.collection(`account-customer`).replaceOne(
            {
                "accountId": customer.accountId,
                "cellPhone": customer.cellPhone
            },
            customer,
            { upsert: true }
        );
    }

    get = async (accountId: string, cellPhone: string) => {
        const db = await this.dbClient.connect();

        const item = await db.collection(`account-customer`).findOne(
            {
                "accountId": accountId,
                "cellPhone": cellPhone
            },
            { projection: { _id: 0 } }
        );

        return item ?? undefined;
    };
}
