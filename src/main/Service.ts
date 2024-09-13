import AWS from 'aws-sdk';
import {v4 as uuidv4} from 'uuid';
const sqs = new AWS.SQS();

import { OrderRepository } from "./repositories/OrderRepository";
import { CustomerRepository } from "./repositories/CustomerRepository";
import { AccountCustomerRepository } from "./repositories/AccountCustomerRepository";
import { AccountSettingRepository } from "./repositories/AccountSettingRepository";
import { WhatsappWorkflowRepository } from "./repositories/WhatsappWorkflowRepository";
import { Hey2FlowApi } from "./Hey2FlowApi";
import { FcmGoogleApi } from "./FcmGoogleApi";



export class Service {

  private orderRepository: OrderRepository;
  private customerRepository: CustomerRepository;
  private accountCustomerRepository: AccountCustomerRepository;
  private accountSettingRepository: AccountSettingRepository;
  private whatsappWorkflowRepository: WhatsappWorkflowRepository;
  private hey2FlowApi: Hey2FlowApi;
  private fcmGoogleApi: FcmGoogleApi;
  private accountId: string;

  constructor(orderRepository: OrderRepository
    , customerRepository: CustomerRepository
    , accountCustomerRepository: AccountCustomerRepository
    , accountSettingRepository: AccountSettingRepository
    , whatsappWorkflowRepository: WhatsappWorkflowRepository
    , hey2FlowApi: Hey2FlowApi
    , fcmGoogleApi: FcmGoogleApi
    , accountId: string) {
      this.orderRepository = orderRepository;
      this.customerRepository = customerRepository;
      this.accountCustomerRepository = accountCustomerRepository;
      this.accountSettingRepository = accountSettingRepository;
      this.whatsappWorkflowRepository = whatsappWorkflowRepository;
      this.hey2FlowApi = hey2FlowApi;
      this.fcmGoogleApi = fcmGoogleApi;
      this.accountId = accountId;
  }

    invoke = async (order: any) => {
        console.log('--Service :: add-order-handler');
        try {
          const accountSetting = await this.accountSettingRepository.get(this.accountId);
          order.prefix = accountSetting?.orderPrefix;
        } catch (error: any) {
          
        }
        await this.orderRepository.save(order); 
        // await this.processCustomer(order.clientCellPhone, this.accountId, order.placeId);
        await this.fcmGoogleApi.send(this.accountId);
        await this.sendDataToDap(this.accountId, {...order, rowRegisterTime: Math.floor(order.createdTime/1000)}, 'order', 'CREATE');
    }

    processCustomer = async (cellPhone: string, accountId: string, placeId: number) => {
      try {
        var dateTime = new Date();
        let createdTime = dateTime.getTime();
        const customer = await this.customerRepository.get(cellPhone); 
        if (!customer) {
            console.log('--Customer no exist');
            await this.customerRepository.save({cellPhone, createdAt: dateTime.toISOString(), createdTime}); 

            const listActiveWorkflow = await this.whatsappWorkflowRepository.list(accountId) as any[];
            const filteredWorkflows = listActiveWorkflow.filter(workflow => workflow.type === 'FORM');
            if (filteredWorkflows.length > 0) {
              const index = Math.floor(Math.random() * filteredWorkflows.length);
              await this.hey2FlowApi.execute(accountId, placeId, filteredWorkflows[index].id, cellPhone);
            }

            await this.sendDataToDap("main", {cellPhone, createdAt: dateTime.toISOString(), createdTime: Math.floor(createdTime/1000), rowRegisterTime: Math.floor(createdTime/1000)}, 'customer', 'CREATE');
            // await this.sendDataToDap(accountId, {cellPhone, createdAt: dateTime.toISOString(), createdTime: Math.floor(createdTime/1000), rowRegisterTime: Math.floor(createdTime/1000)}, 'account-customer', 'CREATE');
        } else {
          if (!customer.termsAndConditionsAccepted) {
            const listActiveWorkflow = await this.whatsappWorkflowRepository.list(accountId) as any[];
            const filteredWorkflows = listActiveWorkflow.filter(workflow => workflow.type === 'FORM');
            if (filteredWorkflows.length > 0) {
              const index = Math.floor(Math.random() * filteredWorkflows.length);
              await this.hey2FlowApi.execute(accountId, placeId, filteredWorkflows[index].id, cellPhone);
            }
          }
        }

        const accountCustomer = await this.accountCustomerRepository.get(accountId, cellPhone); 
        if (!accountCustomer) {
          console.log('--AccountCustomer no exist');
          await this.accountCustomerRepository.save({accountId, cellPhone, createdAt: dateTime.toISOString(), createdTime}); 
        }

      } catch (error: any) {
        console.log(`--Error creating customer ${error}`);
      }
    }

    sendDataToDap =  async (accountId: string, data: any, table: string, action: string) => {
      console.log(`--sendDataToDap accountId ${accountId} - table ${table} - action ${action}`);
      try {

          const params = {
            MessageBody: `{"accountId":"${accountId}", "data":${JSON.stringify({...data
                                                              , createdAt: data.createdAt.replace('T',' ').split('.')[0]
                                                              , createdTime: Math.floor(data.createdTime/1000)
                                                              , calledAt: data.calledAt.replace('T',' ').split('.')[0]
                                                              , calledTime: Math.floor(data.calledTime/1000)
                                                              , deliveredAt: data.deliveredAt.replace('T',' ').split('.')[0]
                                                              , deliveredTime: Math.floor(data.deliveredTime/1000)})}, "table":"${table}", "action":"${action}"}`,
            QueueUrl: 'https://sqs.us-east-1.amazonaws.com/767397894059/hey2-prod-send-data-to-dap-queue'
          };

          await sqs.sendMessage(params).promise();
          console.log('--SQS hey2-prod-send-data-to-dap-queue');
      } catch (error) {
          console.error('--Error al enviar el mensaje:', error);
      }
    }
}