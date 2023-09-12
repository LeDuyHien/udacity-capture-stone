import dynamoDBClient from "../config/dynamodb.client";
import TodosAcess from "./todosAcess";

console.log("Todo Table: ", process.env.TODO_TABLE);

const todoRepository = new TodosAcess(
  dynamoDBClient(),
  process.env.TODO_TABLE
);

export default todoRepository;
