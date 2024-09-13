import { DynamoDBDocumentClient 
    , PutCommand
    , GetCommand} from "@aws-sdk/lib-dynamodb";


export class AccountCustomerRepository {

    private dbClient: DynamoDBDocumentClient;
    private accountId: String;

    constructor(dbClient: DynamoDBDocumentClient, accountId: string) {
        this.dbClient = dbClient;
        this.accountId = accountId;
    }

    save = async (customer: any) => {
        await this.dbClient.send(
            new PutCommand({
                TableName: `account-customer`,
                Item: customer,
            })
        );
    }

    get = async (accountId: string, cellPhone: string) => {
        const response = await this.dbClient.send(
            new GetCommand({
                TableName: `account-customer`,
                Key: {
                    "accountId": accountId,
                    "cellPhone": cellPhone
                },
            })
        );
      
        return response.Item;
    };
}