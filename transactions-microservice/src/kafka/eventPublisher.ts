import { producer } from "./producer";

export async function publishEvent(accountId: string, type: string, payload: any) {
  await producer.send({
    topic: "transactions",
    messages: [
        {
        key: accountId,
        value: JSON.stringify({
            type: type,
            account_id: accountId,
            data: payload,
            timestamp: new Date().toISOString(),
        }),
        },
    ],
    });
}