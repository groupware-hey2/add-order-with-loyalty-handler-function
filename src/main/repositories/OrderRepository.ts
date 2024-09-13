import { DynamoDBDocumentClient 
    , PutCommand
    , QueryCommand} from "@aws-sdk/lib-dynamodb";


export class OrderRepository {

    private dbClient: DynamoDBDocumentClient;
    private accountId: String;

    constructor(dbClient: DynamoDBDocumentClient, accountId: string) {
        this.dbClient = dbClient;
        this.accountId = accountId;
    }

    save = async (order: any) => {
        await this.dbClient.send(
            new PutCommand({
                TableName: `order-${this.accountId}`,
                Item: order,
            })
        );
    }

    list = async (placeId: string) : Promise<Array<any>> => {

        var currentDateTime = new Date(); 
        currentDateTime.setUTCHours(currentDateTime.getUTCHours() - 5);
        console.log(`--currentDateTime ${currentDateTime}`);
        const orderDateAndPlace = `${currentDateTime.toISOString().split('T')[0]}:${placeId}`

        const command = new QueryCommand({
            TableName: `order-${this.accountId}`,
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "orderDateAndPlace", 
            },
            ExpressionAttributeValues: {
                ":pk": orderDateAndPlace, 
            },
            ConsistentRead: true,
          });

        const { Items }  = await this.dbClient.send(command);
        return Items ? Items : [];
        //return {Items}
    }
}