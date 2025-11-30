"""
Script to download checkup audio from the hospital backend API.
Handles authentication and saves the audio file locally.
"""

import requests
import os
import sys

# Configuration
BASE_URL = "http://localhost:3002"
EMAIL = "doctor@hospital.com"
PASSWORD = "password123"

def login(email: str, password: str) -> str:
    """
    Login and get the access token.
    """
    print(f"Logging in as {email}...")
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": email,
            "password": password
        }
    )
    
    if response.status_code != 200 and response.status_code != 201:
        print(f"Login failed: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    data = response.json()
    token = data.get("access_token") or data.get("accessToken") or data.get("token")
    
    if not token:
        print("No access token in response:")
        print(data)
        sys.exit(1)
    
    print("Login successful!")
    return token


def download_audio(token: str, checkup_id: int, output_dir: str = ".") -> str:
    """
    Download audio for a specific checkup.
    
    Args:
        token: JWT access token
        checkup_id: The ID of the checkup
        output_dir: Directory to save the audio file
        
    Returns:
        Path to the downloaded file
    """
    print(f"Downloading audio for checkup {checkup_id}...")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Try download endpoint first
    response = requests.get(
        f"{BASE_URL}/checkups/{checkup_id}/audio",
        headers=headers,
        stream=True
    )
    
    if response.status_code == 404:
        print(f"No audio found for checkup {checkup_id}")
        return None
    
    if response.status_code != 200:
        print(f"Failed to download audio: {response.status_code}")
        print(response.text)
        return None
    
    # Get filename from Content-Disposition header or generate one
    content_disposition = response.headers.get("Content-Disposition", "")
    if "filename=" in content_disposition:
        filename = content_disposition.split("filename=")[1].strip('"')
    else:
        # Determine extension from content type
        content_type = response.headers.get("Content-Type", "audio/webm")
        ext_map = {
            "audio/webm": "webm",
            "audio/mp3": "mp3",
            "audio/mpeg": "mp3",
            "audio/wav": "wav",
            "audio/m4a": "m4a",
            "audio/mp4": "m4a",
            "audio/ogg": "ogg",
        }
        ext = ext_map.get(content_type, "webm")
        filename = f"checkup_{checkup_id}_audio.{ext}"
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    filepath = os.path.join(output_dir, filename)
    
    # Write the audio file
    with open(filepath, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    file_size = os.path.getsize(filepath)
    print(f"Audio saved to: {filepath} ({file_size / 1024:.2f} KB)")
    
    return filepath


def list_checkups_with_audio(token: str) -> list:
    """
    Get list of checkups that have audio recordings.
    This requires querying checkup history first.
    """
    print("Fetching checkup history...")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(
        f"{BASE_URL}/checkups/history",
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"Failed to fetch checkups: {response.status_code}")
        return []
    
    checkups = response.json()
    
    # Filter checkups that have audio
    checkups_with_audio = []
    for checkup in checkups:
        if checkup.get("audio") or checkup.get("hasAudio"):
            checkups_with_audio.append({
                "id": checkup.get("id"),
                "date": checkup.get("createdAt"),
                "diagnosis": checkup.get("diagnosis", "")[:50],
            })
    
    return checkups_with_audio


def main():
    """
    Main function - download audio for a specific checkup or list available checkups.
    """
    # Parse command line arguments
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python download_audio.py <checkup_id>       - Download audio for specific checkup")
        print("  python download_audio.py list               - List checkups with audio")
        print("  python download_audio.py all                - Download all available audio files")
        print("")
        print("Examples:")
        print("  python download_audio.py 1")
        print("  python download_audio.py list")
        print("  python download_audio.py all")
        sys.exit(1)
    
    # Login first
    token = login(EMAIL, PASSWORD)
    
    arg = sys.argv[1]
    
    if arg == "list":
        # List checkups with audio
        checkups = list_checkups_with_audio(token)
        if not checkups:
            print("No checkups with audio found.")
        else:
            print(f"\nFound {len(checkups)} checkup(s) with audio:")
            for c in checkups:
                print(f"  ID: {c['id']} | Date: {c['date']} | Diagnosis: {c['diagnosis']}...")
    
    elif arg == "all":
        # Download all audio files
        checkups = list_checkups_with_audio(token)
        if not checkups:
            print("No checkups with audio found.")
        else:
            output_dir = "downloaded_audio"
            print(f"\nDownloading {len(checkups)} audio file(s) to '{output_dir}/'...")
            for c in checkups:
                download_audio(token, c['id'], output_dir)
    
    else:
        # Download specific checkup audio
        try:
            checkup_id = int(arg)
        except ValueError:
            print(f"Invalid checkup ID: {arg}")
            sys.exit(1)
        
        output_dir = "downloaded_audio"
        download_audio(token, checkup_id, output_dir)


if __name__ == "__main__":
    main()
