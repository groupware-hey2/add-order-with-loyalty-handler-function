import AWS from 'aws-sdk';
import {v4 as uuidv4} from 'uuid';
const sqs = new AWS.SQS();

import { OrderRepository } from "./repositories/OrderRepository";
import { CustomerRepository } from "./repositories/CustomerRepository";
import { AccountCustomerRepository } from "./repositories/AccountCustomerRepository";
import { AccountSettingRepository } from "./repositories/AccountSettingRepository";
import { WhatsappWorkflowRepository } from "./repositories/WhatsappWorkflowRepository";
import { CustomerIdentificationRepository } from "./repositories/CustomerIdentificationRepository";
import { Hey2FlowApi } from "./Hey2FlowApi";
import { FcmGoogleApi } from "./FcmGoogleApi";



export class Service {

  private orderRepository: OrderRepository;
  private customerRepository: CustomerRepository;
  private accountCustomerRepository: AccountCustomerRepository;
  private accountSettingRepository: AccountSettingRepository;
  private whatsappWorkflowRepository: WhatsappWorkflowRepository;
  private customerIdentificationRepository: CustomerIdentificationRepository;
  private hey2FlowApi: Hey2FlowApi;
  private fcmGoogleApi: FcmGoogleApi;
  private accountId: string;

  constructor(orderRepository: OrderRepository
    , customerRepository: CustomerRepository
    , accountCustomerRepository: AccountCustomerRepository
    , accountSettingRepository: AccountSettingRepository
    , whatsappWorkflowRepository: WhatsappWorkflowRepository
    , customerIdentificationRepository: CustomerIdentificationRepository
    , hey2FlowApi: Hey2FlowApi
    , fcmGoogleApi: FcmGoogleApi
    , accountId: string) {
      this.orderRepository = orderRepository;
      this.customerRepository = customerRepository;
      this.accountCustomerRepository = accountCustomerRepository;
      this.accountSettingRepository = accountSettingRepository;
      this.whatsappWorkflowRepository = whatsappWorkflowRepository;
      this.customerIdentificationRepository = customerIdentificationRepository;
      this.hey2FlowApi = hey2FlowApi;
      this.fcmGoogleApi = fcmGoogleApi;
      this.accountId = accountId;
  }

    invoke = async (order: any, customer: any) => {
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

        if (customer?.identification != null && customer?.identification.length != 0) {
          await this.customerIdentificationRepository.save({cellPhone: customer.cellPhone, identification: customer.identification});
        }

        await this.processCustomer(customer, this.accountId, order.placeId);

        const accountCustomer = await this.accountCustomerRepository.get(this.accountId, customer.cellPhone); 
        if (!accountCustomer) {
          console.log('--AccountCustomer no exist');
          var dateTime = new Date();
          let createdTime = dateTime.getTime();
          await this.accountCustomerRepository.save({accountId: this.accountId, cellPhone: customer.cellPhone, createdAt: dateTime.toISOString(), createdTime, loyaltyProgramAccepted: false}); 
        } else {
          await this.accountCustomerRepository.save({...accountCustomer, loyaltyProgramAccepted: accountCustomer.loyaltyProgramAccepted ? accountCustomer.loyaltyProgramAccepted : false}); 
        }
    }

    processCustomer = async (customer: any, accountId: string, placeId: number) => {
      try {
        var dateTime = new Date();
        let createdTime = dateTime.getTime();
        const customer_ = await this.customerRepository.get(customer?.cellPhone); 
        
        if (!customer_) {
            console.log('--Customer no exist');
            // await this.customerRepository.save({cellPhone, createdAt: dateTime.toISOString(), createdTime}); 

            const listActiveWorkflow = await this.whatsappWorkflowRepository.list(accountId) as any[];
            const filteredWorkflows = listActiveWorkflow.filter(workflow => workflow.type === 'FORM');
            if (filteredWorkflows.length > 0) {
              const index = Math.floor(Math.random() * filteredWorkflows.length);
              await this.hey2FlowApi.execute(accountId, placeId, filteredWorkflows[index].id, customer?.cellPhone);
            }

            await this.sendDataToDap("main", {...customer, createdAt: dateTime.toISOString(), createdTime: Math.floor(createdTime/1000), rowRegisterTime: Math.floor(createdTime/1000)}, 'customer', 'CREATE');
            // await this.sendDataToDap(accountId, {cellPhone, createdAt: dateTime.toISOString(), createdTime: Math.floor(createdTime/1000), rowRegisterTime: Math.floor(createdTime/1000)}, 'account-customer', 'CREATE');
        } else {
          if (!customer_.termsAndConditionsAccepted) {
            const listActiveWorkflow = await this.whatsappWorkflowRepository.list(accountId) as any[];
            const filteredWorkflows = listActiveWorkflow.filter(workflow => workflow.type === 'FORM');
            if (filteredWorkflows.length > 0) {
              const index = Math.floor(Math.random() * filteredWorkflows.length);
              await this.hey2FlowApi.execute(accountId, placeId, filteredWorkflows[index].id, customer?.cellPhone);
            }
          }
        }

        await this.customerRepository.save({...customer_, ...customer});
        console.log('--customerRepository save');

        const accountCustomer = await this.accountCustomerRepository.get(accountId, customer?.cellPhone); 
        if (!accountCustomer) {
          console.log('--AccountCustomer no exist');
          await this.accountCustomerRepository.save({accountId, cellPhone: customer?.cellPhone, placeId, createdAt: dateTime.toISOString(), createdTime}); 
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
            QueueUrl: 'https://sqs.us-east-1.amazonaws.com/603858357127/hey2-dev-send-data-to-dap-queue'
          };

          await sqs.sendMessage(params).promise();
          console.log('--SQS hey2-dev-send-data-to-dap-queue');
      } catch (error) {
          console.error('--Error al enviar el mensaje:', error);
      }
    }
}