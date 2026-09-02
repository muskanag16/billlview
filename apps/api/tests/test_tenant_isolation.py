def test_tenant_isolation_clients(client, auth_headers, auth_headers2):
    # User 1 creates a client
    res1 = client.post(
        "/api/v1/clients/",
        headers=auth_headers,
        json={"name": "User 1 Client", "email": "u1@example.com"}
    )
    assert res1.status_code == 201
    client1_id = res1.json()["id"]

    # User 2 tries to get User 1's client
    res2 = client.get(f"/api/v1/clients/{client1_id}", headers=auth_headers2)
    assert res2.status_code == 404

    # User 2 lists clients, should not see User 1's
    res3 = client.get("/api/v1/clients/", headers=auth_headers2)
    assert res3.status_code == 200
    assert len(res3.json()) == 0

def test_tenant_isolation_invoices(client, auth_headers, auth_headers2):
    # User 1 creates a client
    res_client = client.post(
        "/api/v1/clients/",
        headers=auth_headers,
        json={"name": "User 1 Client", "email": "u1@example.com"}
    )
    client1_id = res_client.json()["id"]

    # User 1 creates an invoice
    res_inv = client.post(
        "/api/v1/invoices/",
        headers=auth_headers,
        json={
            "client_id": client1_id,
            "issue_date": "2024-01-01",
            "due_date": "2024-01-15",
            "items": [{"description": "Dev", "quantity": "1", "rate": "100"}]
        }
    )
    assert res_inv.status_code == 201
    invoice1_id = res_inv.json()["id"]

    # User 2 tries to get User 1's invoice
    res2 = client.get(f"/api/v1/invoices/{invoice1_id}", headers=auth_headers2)
    assert res2.status_code == 404

    # User 2 tries to update User 1's invoice
    res3 = client.put(
        f"/api/v1/invoices/{invoice1_id}",
        headers=auth_headers2,
        json={
            "client_id": client1_id,
            "issue_date": "2024-01-01",
            "due_date": "2024-01-15",
            "items": []
        }
    )
    assert res3.status_code == 404
