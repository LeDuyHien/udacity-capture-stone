import { v4 } from 'uuid'
import TodosAcess from '../dataLayer/todosAcess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { createLogger } from '../helpers/logging/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoStorage } from '../helpers/attachmentUtils/attachmentUtils'
import {TodoPagination} from "../models/TodoPagination";

const logger = createLogger('Service: Todo')

export default class Todos {
  constructor(
    private todoStorage: TodoStorage,
    private todoRepository: TodosAcess
  ) {
  }

  async create(userId: string, createRequest: CreateTodoRequest): Promise<CreateTodoRequest> {
    const newTodo: TodoItem = Object.assign({}, createRequest, {
      todoId: v4(),
      userId: userId,
      attachmentUrl: '',
      done: false,
      createdAt: new Date().getTime().toString()
    })
    logger.info(
      `Service: Create a new Todo for user with [request: ${newTodo}, userId: ${userId}]`
    )
    return await this.todoRepository.create(newTodo)
  }

  async delete(todoId: string, userId: string): Promise<any> {
    logger.info(
      `Service: Delete a Todo for user with [todoId: ${todoId}, userId: ${userId}]`
    )
    return await this.todoRepository.delete(todoId, userId)
  }

  async generateUploadUrl(attachId: string): Promise<string> {
    logger.info(`Service: Generate Todos Upload URL for attachment with [attachmentId: ${attachId}]`)
    return await this.todoStorage.getUploadUrl(attachId)
  }

  async updateAttachmentUrl(
    userId: string,
    todoId: string,
    attachId: string
  ) {
    const attachUrl = await this.todoStorage.getAttachmentUrl(attachId)

    const item = await this.todoRepository.getById(todoId, userId)
    logger.info(
      `Service: Update Todos Attachment URL for user with [todoId: ${todoId}, userId: ${userId}]`
    )

    if (!item) {
      logger.error(
        'Service: Error update Todos Attachment URL: Item not found'
      )
      throw new Error('Item not found')
    }
    if (item.userId !== userId) {
      logger.error(
        'Service: Error update Todos Attachment URL: User is not authorized to update item'
      )
      throw new Error('User is not authorized to update item')
    }

    await this.todoRepository.updateAttachmentUrl(
      todoId,
      userId,
      attachUrl
    )
  }

  async findAll(userId: string, limit: number, key: any): Promise<TodoPagination> {
    logger.info(`Service: Getting all Todos for userId: ${userId}`)

    return this.todoRepository.findAll(userId, limit, key)
  }
}
