import {TodoItem} from '../models/TodoItem'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {TodoPagination} from "../models/TodoPagination";
import {encodeNextKey} from "../helpers/query/queryParameter";

export default class TodosAcess {
    constructor(private docClient: DocumentClient, private tableName: string) {
    }

    async create(todo: TodoItem): Promise<TodoItem> {
        await this.docClient
            .put({
                TableName: this.tableName,
                Item: todo
            })
            .promise()

        return todo as TodoItem
    }

    async delete(todoId: string, userId: string): Promise<any> {
        const result = await this.docClient
            .delete({
                TableName: this.tableName,
                Key: {
                    todoId: todoId,
                    userId: userId
                }
            })
            .promise()

        console.log(result)
        return result
    }

    async getById(todoId: string, userId: string): Promise<TodoItem> {
        const result = await this.docClient
            .get({
                TableName: this.tableName,
                Key: {
                    todoId,
                    userId
                }
            })
            .promise()

        const item = result.Item

        return item as TodoItem
    }

    async updateAttachmentUrl(
        todoId: string,
        userId: string,
        attachmentUrl: string
    ) {
        await this.docClient
            .update({
                TableName: this.tableName,
                Key: {
                    todoId,
                    userId
                },
                UpdateExpression: 'set attachmentUrl = :attachmentUrl',
                ExpressionAttributeValues: {
                    ':attachmentUrl': attachmentUrl
                }
            })
            .promise()
    }

    async findAll(userId: string, limit: number, key: any): Promise<TodoPagination> {
        console.log('Finding all Todos', userId)

        const query = await this.docClient.query({
            TableName: this.tableName,
            Limit: limit,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ExclusiveStartKey: key
        }).promise()

        return {
            items: query.Items as TodoItem[],
            nextKey: encodeNextKey(query.LastEvaluatedKey)
        }
    }
}
