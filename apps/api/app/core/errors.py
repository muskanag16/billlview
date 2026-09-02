from fastapi import HTTPException, status

class UnauthorizedError(HTTPException):
    def __init__(self, detail: str = "Not authenticated"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": detail},
            headers={"WWW-Authenticate": "Bearer"},
        )

class InvalidCredentialsError(HTTPException):
    def __init__(self, detail: str = "Incorrect email or password"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": detail},
            headers={"WWW-Authenticate": "Bearer"},
        )

class ResourceNotFoundError(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": detail},
        )

class ResourceAlreadyExistsError(HTTPException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "ALREADY_EXISTS", "message": detail},
        )
