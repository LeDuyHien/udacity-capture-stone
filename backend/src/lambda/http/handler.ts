import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import {CreateTodoRequest} from '../../requests/CreateTodoRequest'
import {getUserId} from '../../helpers/auth/utils'
import {createLogger} from '../../helpers/logging/logger'
import {formatJSONResponse} from '../../libs/api-gateway'
import todoService from '../../businessLogic'
import {v4} from 'uuid'
import {parseLimitParameter, parseNextKeyParameter} from "../../helpers/query/queryParameter";

export const createTodo = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const log = createLogger('Handler: Creating a new Todo')

        try {
            const newTodo: CreateTodoRequest = JSON.parse(event.body)

            log.info('handler: Creating a new Todo', newTodo)

            const toDoItem = await todoService.create(getUserId(event), newTodo)

            log.info('handler: Successfully create a new Todo', toDoItem)

            return formatJSONResponse(201, {
                item: toDoItem
            })
        } catch (e) {
            log.error(`createTodo Handler: Error creating Todo: ${e.message}`)

            return formatJSONResponse(500, {
                message: e.message
            })
        }
    }
)

export const deleteTodo = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const log = createLogger('Handler: Deleting a Todo by Id')
        try {
            const userId = getUserId(event)

            const todoId = event.pathParameters.todoId
            log.info('Handler: Deleting a Todo by Id ', todoId)

            const deleteData = await todoService.delete(todoId, userId)

            return formatJSONResponse(200, {
                result: deleteData
            })
        } catch (e) {
            log.error(`Handler: Error deleting Todo: ${e.message}`)

            return formatJSONResponse(500, {
                message: e.message
            })
        }
    }
)

export const generateUploadUrl = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const log = createLogger('Handler: Generate upload url')

        const todoId = event.pathParameters.todoId
        const attachmentId = v4()

        const uploadedUrl = await todoService.generateUploadUrl(attachmentId)
        log.info('Handler: Generated upload url: ', uploadedUrl)

        try {
            log.info(
                `Handler: Update Todo Attachment URL ${uploadedUrl} with attachment id = ${attachmentId} for todo with id = ${todoId}`
            )
            await todoService.updateAttachmentUrl(getUserId(event), todoId, attachmentId)

            return {
                statusCode: 202,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify({
                    uploadUrl: uploadedUrl
                })
            }
        } catch (e) {
            log.error(`Handler: Error update Todos Attachment URL: ${e.message}`)
        }
    }
)

export const getTodos = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const log = createLogger('Handler: Getting all Todo')
        log.info('Handler: Getting all Todo')
        // Pagination
        const limit = parseLimitParameter(event) || 9
        const key = parseNextKeyParameter(event);
        const userId = getUserId(event)

        const todos = await todoService.findAll(userId, limit, key)

        // Check if this is last page, set nextKey empty
        if (todos.nextKey !== null) {
            const nextKeyDecode = decodeURIComponent(todos.nextKey);
            const nextKey = JSON.parse(nextKeyDecode)

            log.info("Check next page")
            const checkLastPage = await todoService.findAll(userId, 1, nextKey);
            if (checkLastPage.items === null || checkLastPage.items.length === 0) {
                todos.nextKey = null
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                "items": todos.items,
                "nextKey": todos.nextKey
            }),
        };
    }
)
