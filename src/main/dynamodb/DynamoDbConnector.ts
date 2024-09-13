import { DynamoDBClient, DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export class DynamoDbConnector {

    constructor() {

    }

    getConnection = async () => {
        console.log(`--getConnection`);
        try {

            const client: DynamoDBClient = new DynamoDBClient({
                region: 'us-east-1'
            });
            console.log(`--getConnection susses`);
            return  DynamoDBDocumentClient.from(client);
        } catch (error) {
            console.error(`--Error: ${JSON.stringify(error)}`);

            return;
        }
        
    }

}