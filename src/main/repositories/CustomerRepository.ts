import { DynamoDBDocumentClient 
    , PutCommand
    , GetCommand} from "@aws-sdk/lib-dynamodb";


export class CustomerRepository {

    private dbClient: DynamoDBDocumentClient;

    constructor(dbClient: DynamoDBDocumentClient) {
        this.dbClient = dbClient;
    }

    save = async (customer: any) => {
        await this.dbClient.send(
            new PutCommand({
                TableName: `customer`,
                Item: customer,
            })
        );
    }

    get = async (cellPhone: string) => {
        const response = await this.dbClient.send(
            new GetCommand({
                TableName: `customer`,
                Key: {
                    "cellPhone": cellPhone
                },
            })
        );
      
        return response.Item;
    };
}