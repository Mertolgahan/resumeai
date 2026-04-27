#!/bin/bash
set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain>}"
PROTOCOL="https"
URL="${PROTOCOL}://${DOMAIN}"

echo "=== Post-Deploy Verification for $URL ==="
echo ""

PASS=0
FAIL=0
WARN=0

check() {
  local label="$1"
  local url="$2"
  local expected_status="${3:-200}"
  local actual_status
  
  actual_status=$(curl -sk -o /dev/null -w "%{http_code}" "$url" 2>/dev/null) || actual_status="000"
  
  if [ "$actual_status" = "$expected_status" ]; then
    echo "  PASS [$actual_status] $label"
    PASS=$((PASS + 1))
  elif [ "$actual_status" = "000" ]; then
    echo "  FAIL [no response] $label"
    FAIL=$((FAIL + 1))
  else
    echo "  WARN [$actual_status] $label (expected $expected_status)"
    WARN=$((WARN + 1))
  fi
}

echo "[1] Health & Infrastructure"
check "Health endpoint" "$URL/api/health" "200"
check "Homepage loads" "$URL/" "200"
check "Login page" "$URL/login" "200"
check "Signup page" "$URL/signup" "200"
check "Pricing page" "$URL/pricing" "200"
echo ""

echo "[2] Service Configuration"
HEALTH_JSON=$(curl -sk "$URL/api/health" 2>/dev/null || echo "{}")
for SERVICE in supabase stripe auth openrouter googleOAuth githubOAuth resend; do
  STATUS=$(echo "$HEALTH_JSON" | grep -o "\"$SERVICE\":\(true\|false\)" | cut -d: -f2)
  if [ "$STATUS" = "true" ]; then
    echo "  PASS  $SERVICE configured"
    PASS=$((PASS + 1))
  elif [ "$STATUS" = "false" ]; then
    echo "  WARN  $SERVICE NOT configured"
    WARN=$((WARN + 1))
  else
    echo "  INFO  $SERVICE status unknown"
  fi
done
echo ""

echo "[3] Static Assets"
check "Favicon" "$URL/favicon.ico" "200"
check "Sitemap" "$URL/sitemap.xml" "200"
check "Robots.txt" "$URL/robots.txt" "200"
echo ""

echo "[4] SSL"
SSL_EXPIRY=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$SSL_EXPIRY" ]; then
  echo "  PASS  SSL certificate expires: $SSL_EXPIRY"
  PASS=$((PASS + 1))
else
  echo "  WARN  Could not check SSL certificate"
  WARN=$((WARN + 1))
fi
echo ""

echo "=== Verification Summary ==="
echo "  Passed:  $PASS"
echo "  Warnings: $WARN"
echo "  Failed:  $FAIL"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "DEPLOYMENT HAS ISSUES - review failures above."
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo "DEPLOYED WITH WARNINGS - some services not fully configured."
  echo "Core app is running. Configure missing services to enable all features."
  exit 0
else
  echo "ALL CHECKS PASSED - deployment is fully operational!"
  exit 0
fi