def test_signup(client):
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "newuser@example.com",
            "password": "strongpassword123",
            "full_name": "New User",
            "business_name": "New Business"
        }
    )
    assert response.status_code == 201
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_signup_duplicate_email(client, test_user):
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "test@example.com",
            "password": "strongpassword123",
            "full_name": "Duplicate User",
            "business_name": "Duplicate Business"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()

def test_login_success(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_password(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "test@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401

def test_login_nonexistent_user(client):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "nobody@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 401

def test_protected_route_without_token(client):
    response = client.get("/api/v1/settings/business")
    assert response.status_code == 401

def test_protected_route_with_token(client, auth_headers):
    response = client.get("/api/v1/settings/business", headers=auth_headers)
    assert response.status_code == 200
