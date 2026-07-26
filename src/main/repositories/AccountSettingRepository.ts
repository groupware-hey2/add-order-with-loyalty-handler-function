import { DatabaseConnection } from '../mongodb/DatabaseConnection';


export class AccountSettingRepository {

    private dbClient: DatabaseConnection;

    constructor(dbClient: DatabaseConnection) {
        this.dbClient = dbClient;
    }

    get = async (accountId: string) => {
        const db = await this.dbClient.connect();

        const item = await db.collection(`account-setting`).findOne(
            {
                "accountId": accountId
            },
            { projection: { _id: 0 } }
        );

        return item ?? undefined;
    };
}
