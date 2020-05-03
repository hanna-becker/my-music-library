import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {TodoItem} from "../../models/TodoItem";
import {UpdateTodoRequest} from "../../requests/UpdateTodoRequest";

const XAWS = AWSXRay.captureAWS(AWS);

export class TodoItemsAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoItemsTable = process.env.TODOS_TABLE) {
    }

    async getTodoItemsByUser(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todoItemsTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        return result.Items as TodoItem[];
    }

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todoItemsTable,
            Item: todoItem
        }).promise();

        return todoItem as TodoItem;
    }

    async updateTodoItem(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<{ message: string; success: boolean; }> {
        try {
            const {name, dueDate, done} = updateTodoRequest;
            await this.docClient.update({
                TableName: this.todoItemsTable,
                Key: {userId, todoId},
                UpdateExpression: "set #nm=:n, dueDate=:dd, done=:do",
                ExpressionAttributeNames: {
                    "#nm": "name"
                },
                ExpressionAttributeValues: {
                    ":n": name,
                    ":dd": dueDate,
                    ":do": done
                },
                ReturnValues: "UPDATED_NEW"
            }).promise();
            return {
                message: `Successfully updated todo item with id ${todoId}`,
                success: true
            };
        } catch (e) {
            return {
                message: JSON.stringify(e),
                success: false
            };
        }
    }

    async deleteTodoItem(userId: string, todoId: string): Promise<{ message: string; success: boolean; }> {
        try {
            await this.docClient.delete({
                TableName: this.todoItemsTable,
                Key: {userId, todoId},
            }).promise();
            return {
                message: `Successfully deleted todo item with id ${todoId}`,
                success: true
            };
        } catch (e) {
            return {
                message: JSON.stringify(e),
                success: false
            };
        }
    }

    async getTodoItem(userId: string, todoId: string): Promise<TodoItem> {
        const result = await this.docClient.get({
            TableName: this.todoItemsTable,
            Key: {userId, todoId},
        }).promise();

        return result.Item as TodoItem;
    }

    async storeAttachmentUrlInDb(userId: string, todoId: string, attachmentUrl: string): Promise<{ message: string; success: boolean; }> {
        try {
            await this.docClient.update({
                TableName: this.todoItemsTable,
                Key: {userId, todoId},
                UpdateExpression: "set attachmentUrl=:a",
                ExpressionAttributeValues: {
                    ":a": attachmentUrl
                },
                ReturnValues: "UPDATED_NEW"
            }).promise();
            return {
                message: `Successfully stored attachmentUrl in todo item with id ${todoId}`,
                success: true
            };
        } catch (e) {
            return {
                message: JSON.stringify(e),
                success: false
            };
        }
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance');
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient();
}
