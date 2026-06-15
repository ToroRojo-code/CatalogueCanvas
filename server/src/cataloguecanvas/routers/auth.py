from __future__ import annotations
import sqlite3
import time

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel

from ..auth import (
    SESSION_COOKIE,
    SESSION_MAX_AGE,
    create_session_token,
    is_valid_session,
    verify_admin_password,
)
from ..db import get_connection
from ..settings import settings

router = APIRouter(prefix="/api", tags=["auth"])

_failed_attempts: dict[str, list[float]] = {}
_LOGIN_WINDOW_SECONDS = 300
_LOGIN_MAX_ATTEMPTS = 5


def get_db():
    conn = get_connection(settings.db_path)
    try:
        yield conn
    finally:
        conn.close()


class LoginRequest(BaseModel):
    password: str


@router.post("/login")
def login(body: LoginRequest, request: Request, response: Response, conn: sqlite3.Connection = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    attempts = [t for t in _failed_attempts.get(client_ip, []) if now - t < _LOGIN_WINDOW_SECONDS]

    if len(attempts) >= _LOGIN_MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="too many login attempts, try again later")

    if not verify_admin_password(conn, body.password):
        attempts.append(now)
        _failed_attempts[client_ip] = attempts
        raise HTTPException(status_code=401, detail="invalid password")

    _failed_attempts.pop(client_ip, None)

    token = create_session_token()
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        samesite="strict",
        secure=settings.cookie_secure,
    )
    return {"ok": True}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(SESSION_COOKIE)
    return {"ok": True}


@router.get("/me")
def me(request: Request):
    token = request.cookies.get(SESSION_COOKIE)
    return {"authenticated": is_valid_session(token)}
