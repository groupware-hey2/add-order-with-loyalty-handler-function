import { DynamoDBDocumentClient 
    , GetCommand} from "@aws-sdk/lib-dynamodb";


export class AccountSettingRepository {

    private dbClient: DynamoDBDocumentClient;

    constructor(dbClient: DynamoDBDocumentClient) {
        this.dbClient = dbClient;
    }

    get = async (accountId: string) => {
        const response = await this.dbClient.send(
            new GetCommand({
                TableName: `account-setting`,
                Key: {
                    "accountId": accountId
                },
            })
        );
      
        return response.Item;
    };
}