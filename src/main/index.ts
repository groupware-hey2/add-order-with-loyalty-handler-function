
import { SQSEvent, Context } from 'aws-lambda';
import { DynamoDbConnector } from "./dynamodb/DynamoDbConnector";
import { Service } from "./Service";
import { OrderRepository } from "./repositories/OrderRepository";
import { CustomerRepository } from "./repositories/CustomerRepository";
import { AccountCustomerRepository } from "./repositories/AccountCustomerRepository";
import { AccountSettingRepository } from "./repositories/AccountSettingRepository";
import { WhatsappWorkflowRepository } from "./repositories/WhatsappWorkflowRepository";
import { CustomerIdentificationRepository } from "./repositories/CustomerIdentificationRepository";
import { Hey2FlowApi } from "./Hey2FlowApi";
import { FcmGoogleApi } from "./FcmGoogleApi";

export const handler = async (event: SQSEvent, context: Context) => {
  console.log(`--handler :: add-order-handler ${JSON.stringify(event)}`);

  const dbConnect = await new DynamoDbConnector().getConnection();
  console.log(`--handler dbConnect`);

  for (const record of event.Records) {
      const messageBody = record.body;
      const attributes = record.attributes;
      const messageId = record.messageId
      const messageAttributes = record.messageAttributes;
      console.log('--Attributes:', JSON.stringify(attributes));
      console.log('--MessageId:', messageId);
      console.log('--Mensaje recibido:', messageBody);
      console.log('--MessageAttributes:', JSON.stringify(messageAttributes));

      const data = JSON.parse(messageBody || "{}");
      const order = data.order;
      const customer = data.customer;
      console.log(`--Order ${JSON.stringify(order)}`);
      console.log(`--Customer ${JSON.stringify(customer)}`);
      const accountId = data.accountId;

      await new Service(new OrderRepository(dbConnect!!, accountId)
                                          , new CustomerRepository(dbConnect!!)
                                          , new AccountCustomerRepository(dbConnect!!, accountId)
                                          , new AccountSettingRepository(dbConnect!!)
                                          , new WhatsappWorkflowRepository(dbConnect!!)
                                          , new CustomerIdentificationRepository(dbConnect!!)
                                          , new Hey2FlowApi()
                                          , new FcmGoogleApi()
                                          , accountId).invoke(order, customer);

  }
      
  return {
      statusCode: 200,
      body: JSON.stringify("OK")
  }
}