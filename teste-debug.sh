#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsImtpZCI6InFVd0F6M05CUnpudlFiZUIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2V4cHB5cmplcXhqZ2x3ZGNpanNrLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJhMThhMTU5Zi05YTExLTQzNzktOGJhNS1jMGNmYzdmMDJkYWMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYzNTYzMDc1LCJpYXQiOjE3NjM1NTk0NzUsImVtYWlsIjoiYW5hLmNlY2k3MzczQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJhbmEuY2VjaTczNzNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJBbmEgQ2Vjw61saWEiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6ImExOGExNTlmLTlhMTEtNDM3OS04YmE1LWMwY2ZjN2YwMmRhYyJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzYzNDg5NDQ1fV0sInNlc3Npb25faWQiOiIwNmU3NTFhZS0wYWQxLTQyZDktODM4Ny0yNzVjZDlkZmMzOWEiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ._qEsNSEMTdi3f67RQaX3c5Ib6nSJoW6_CyC-QS_3f38"

echo "🔍 DEBUG: Ver resposta crua (sem jq)"
echo "===================================="
echo ""

echo "1️⃣  Teste sem auth (público):"
echo "Status code + Response:"
curl -v http://localhost:3000/api/cards/test 2>&1 | grep -E "(< HTTP|^\{|error)"
echo ""
echo ""

echo "2️⃣  Listar cartões (COM token):"
echo "Status code + Response:"
curl -v -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/cards/list 2>&1 | grep -E "(< HTTP|^\{|error)"
echo ""
echo ""

echo "3️⃣  Teste SEM jq (resposta completa):"
curl -s http://localhost:3000/api/cards/test
echo ""
echo ""

echo "4️⃣  Ver os LOGS do terminal onde o vercel dev está rodando!"
echo "    Deve aparecer os logs com 🔵 [CARDS/...] se a função foi invocada"
echo ""

