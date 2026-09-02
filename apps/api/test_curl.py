import urllib.request
import json
try:
    req = urllib.request.Request("http://127.0.0.1:8080/api/v1/settings/")
    req.add_header("Authorization", "Bearer invalidtoken")  # Or valid, but we just want to see if it responds or crashes
    res = urllib.request.urlopen(req)
    print("STATUS:", res.status)
except Exception as e:
    print("ERROR:", str(e))
