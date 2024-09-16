import { DynamoDBDocumentClient 
    , PutCommand
    , QueryCommand } from "@aws-sdk/lib-dynamodb";


export class CustomerIdentificationRepository {

    private dbClient: DynamoDBDocumentClient;

    constructor(dbClient: DynamoDBDocumentClient) {
        this.dbClient = dbClient;
    }

    save = async (customerIdentification: any) => {
        await this.dbClient.send(
            new PutCommand({
                TableName: `customer-identification`,
                Item: customerIdentification,
            })
        );
    }

    getAll = async (identification: string) : Promise<Record<string, any>[] | undefined> => {
        console.log(`--getAll`);
        const command = new QueryCommand({
            ProjectionExpression: "identification, cellPhone"
            , TableName: `customer-identification`
            , KeyConditionExpression: "#pk = :pk"
            , ExpressionAttributeNames: {
                "#pk": "identification", 
            }
            , ExpressionAttributeValues: {
                ":pk": identification, 
            }
        });

        const { Items }  = await this.dbClient.send(command);
        return Items;
    }
}