import urllib.request
import urllib.parse
import json

def test_login_and_fetch():
    BASE_URL = "http://127.0.0.1:8000"
    
    # 1. Login
    login_data = urllib.parse.urlencode({
        "username": "director@googleschool.demo",
        "password": "password"
    }).encode()
    
    print(f"Attempting login to {BASE_URL}/token...")
    try:
        req = urllib.request.Request(f"{BASE_URL}/token", data=login_data, method="POST")
        with urllib.request.urlopen(req) as response:
            if response.status != 200:
                print(f"Login Failed: {response.status}")
                return
            data = json.loads(response.read().decode())
            
        token = data.get("access_token")
        print(f"Login Success! Token: {token[:10]}...")
        
        # 2. Fetch Classes
        print("Fetching classes...")
        headers = {"Authorization": f"Bearer {token}"}
        req_classes = urllib.request.Request(f"{BASE_URL}/classes/", headers=headers, method="GET")
        
        with urllib.request.urlopen(req_classes) as response:
            if response.status == 200:
                classes = json.loads(response.read().decode())
                print(f"Classes Fetch Success! Found {len(classes)} classes.")
            else:
                print(f"Classes Fetch Failed: {response.status}")
            
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} {e.reason}")
        print(e.read().decode())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login_and_fetch()
