import { Kafka, Producer, Partitioners } from 'kafkajs';
import prismaClient from './prisma';
import fs from "fs";
import path from "path";

process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

function getEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

const kafka = new Kafka({
  clientId: "chat-app",
  brokers: [getEnvVariable('KAFKA_BROKER')],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")]
  },
  sasl: {
    username: getEnvVariable('KAFKA_USERNAME'),
    password: getEnvVariable('KAFKA_PASSWORD'),
    mechanism: 'plain'
  }
});

let producer: Producer | null = null;

export async function createProducer() {
  if (producer) return producer;
  const _producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner 
  });
  await _producer.connect();
  producer = _producer;
  return _producer;
}

export async function produceMessage(message: string) {
  console.log("message in producer", message);
  const producer = await createProducer();
  await producer.send({
    topic: 'chat-message',
    messages: [
      {
        key: `message-${Date.now()}`,
        value: message
      }
    ]
  });
  return true;
}

export async function consumerMessage() {
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({
    topics: ['chat-message'],
    fromBeginning: true
  });
  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ topic, partition, message }) => {
      console.log("message", message);
      if (!message) return;
      try {
        console.log("new message receiving");
        await prismaClient.message.create({
          data: {
            text: message.value?.toString() ?? '',
          }
        });
      } catch (error) {
        console.log("Something is wrong at Kafka consumer");
        consumer.pause([{ topic: 'chat-message' }]);
        setTimeout(() => {
          consumer.resume([{ topic: "chat-message" }]);
        }, 60 * 1000);
      }
    }
  });
}

export default kafka;
