#!/usr/bin/env bash

uvicorn STUDYMATE_BACKEND.server:app \
  --host 0.0.0.0 \
  --port $PORT \
  --proxy-headers \
  --forwarded-allow-ips="*"
