import base64
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import argparse

parser = argparse.ArgumentParser(description="A simple argparse example")
parser.add_argument("email_content", type=str, help="What to send in email")  # Positional argument
args = parser.parse_args()
# Define the required Gmail API scopes
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",  # Read emails
    "https://www.googleapis.com/auth/gmail.send"      # Send emails
]

# Load credentials from token.json (created after OAuth authentication)
creds = Credentials.from_authorized_user_file("token.json", SCOPES)

# Create the Gmail API service
service = build("gmail", "v1", credentials=creds)

def create_message(sender, to, subject, message_text):
    message = MIMEText(message_text)
    message["to"] = to
    message["from"] = sender
    message["subject"] = subject
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

    return {"raw": raw_message}

    
def send_message(service, sender, to, subject, message_text):
    message = create_message(sender, to, subject, message_text)

    sent_msg = (
        service.users().messages().send(userId="me", body=message).execute()
    )
    print(f"Message sent! ID: {sent_msg['id']}")

    
send_message(service, "surgedile@gmail.com", "surgedile@gmail.com", "Daily Obituary", f"{args.email_content}")