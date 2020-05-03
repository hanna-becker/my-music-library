import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {getTodoItemsByUser} from "../businessLogic/todoItems";
import {createLogger} from "../../utils/logger";
import {getUserId} from "../utils";
import {TodoItem} from "../../models/TodoItem";

const logger = createLogger('getTodos');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('event: ', event);

    const userId: string = getUserId(event);

    const items: TodoItem[] = await getTodoItemsByUser(userId);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            items
        })
    };
};


