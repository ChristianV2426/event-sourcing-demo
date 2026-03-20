import json
from time import time
from confluent_kafka import Consumer, KafkaException


consumer_conf = {
    "bootstrap.servers": "kafka:9092",
    "group.id": "notification-service",
    "auto.offset.reset": "earliest"
}

print("\n\nStarting notification service...")
print("Connecting to Kafka..\n\n")

consumer = Consumer(consumer_conf)
while True:
    try:
        consumer.subscribe(["transactions"])
        break
    except KafkaException as e:
        print(f"Kafka connection error: {e}")
        print("Retrying in 5 seconds...\n")
        time.sleep(5)


print("\nSuccessfully connected to Kafka!")
print("Waiting for events...\n\n")

while True:
    message = consumer.poll(1.0)

    if message is None:
        continue

    elif message.error():
        print(f"Kafka error: {message.error()}")
        continue

    else:
        event = message.value().decode("utf-8")
        data = json.loads(event)
        account_id = data.get("account_id", "unknown_account")
        event_type = data.get("type", "unknown_event")
        payload = data.get("data", {})

        print("🔔 Sending Notification:")
        print(f"Account ID: {account_id}")
        print(f"Event type: {event_type}")
        print(f"Payload: {payload}")
        print("-" * 40, "\n\n")
