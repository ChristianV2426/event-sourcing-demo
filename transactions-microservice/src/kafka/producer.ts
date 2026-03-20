import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "transactions-service",
  brokers: ["kafka:9092"],
});

export const producer = kafka.producer();

export async function connectProducer() {
  await producer.connect();
  console.log("Kafka producer connected");
}