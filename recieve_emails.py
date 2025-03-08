from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Define the required Gmail API scopes
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",  # Read emails
    "https://www.googleapis.com/auth/gmail.send"      # Send emails
]

# Load credentials from token.json (created after OAuth authentication)
creds = Credentials.from_authorized_user_file("token.json", SCOPES)

# Create the Gmail API service
service = build("gmail", "v1", credentials=creds)
def list_messages(service, user_id="me"):
    results = service.users().messages().list(userId=user_id, maxResults=10).execute()
    messages = results.get("messages", [])

    if not messages:
        print("No messages found.")
    else:
        print("Recent messages:")
        for msg in messages:
            print(f"- ID: {msg['id']}")

    return messages  # Returns a list of message IDs
def get_message(service, msg_id, user_id="me"):
    msg = service.users().messages().get(userId=user_id, id=msg_id).execute()

    print(f"From: {msg['payload']['headers']}")
    print(f"Snippet: {msg['snippet']}")  # Short preview of the message

    return msg  # Returns the full message object

# messages = list_messages(service)
# if messages:
#     get_message(service, messages[0]['id'])  # Fetch the first email