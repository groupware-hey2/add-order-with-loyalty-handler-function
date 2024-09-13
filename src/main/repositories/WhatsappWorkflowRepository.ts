import { DynamoDBDocumentClient 
    , QueryCommand } from "@aws-sdk/lib-dynamodb";


export class WhatsappWorkflowRepository {

    private dbClient: DynamoDBDocumentClient;

    constructor(dbClient: DynamoDBDocumentClient) {
        this.dbClient = dbClient;
    }

    list = async (accountId: string) => {
        const command = new QueryCommand({
            TableName: `whatsapp-workflow`,
            KeyConditionExpression: "#pk = :pk",
            FilterExpression: "#status = :status",
            ExpressionAttributeNames: {
                "#pk": "accountId", 
                "#status": "status",
            },
            ExpressionAttributeValues: {
                ":pk": accountId, 
                ":status": "ACTIVE",
            },
            ConsistentRead: true,
            ScanIndexForward: true,
          });

        const { Items }  = await this.dbClient.send(command);
        return Items;
    }
}