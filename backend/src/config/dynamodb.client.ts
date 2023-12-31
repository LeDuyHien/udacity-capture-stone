import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const dynamoDBClient = (): DocumentClient => {
  if (process.env.IS_OFFLINE) {
    return new AWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
      accessKeyId: "fackeaccesskey",
      secretAccessKey: "fackesecretkey",
    });
  }
  return new AWS.DynamoDB.DocumentClient();
};

export default dynamoDBClient;
