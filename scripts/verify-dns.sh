#!/bin/bash
set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain>}"
SERVER_IP="${2:-}"

echo "=== DNS Verification for $DOMAIN ==="
echo ""

PASS=0
FAIL=0
WARN=0

check_dns() {
    local label="$1"
    local type="$2"
    local name="$3"
    local expected="${4:-}"
    
    result=$(dig +short "$name" "$type" 2>/dev/null | head -1)
    
    if [ -z "$result" ]; then
        echo "  FAIL  $label: No $type record found for $name"
        FAIL=$((FAIL + 1))
    elif [ -n "$expected" ] && [ "$result" != "$expected" ]; then
        echo "  WARN  $label: $type $name = $result (expected: $expected)"
        WARN=$((WARN + 1))
    else
        echo "  PASS  $label: $type $name = $result"
        PASS=$((PASS + 1))
    fi
}

echo "[1] A Record (Root domain)"
check_dns "Root A record" "A" "$DOMAIN" "$SERVER_IP"
echo ""

echo "[2] CNAME Record (WWW)"
check_dns "WWW CNAME" "CNAME" "www.$DOMAIN"
echo ""

echo "[3] MX Records"
mx_result=$(dig +short "$DOMAIN" MX 2>/dev/null)
if echo "$mx_result" | grep -q "mx1.resend.com"; then
    echo "  PASS  MX record points to resend"
    PASS=$((PASS + 1))
else
    echo "  WARN  MX record not found for resend (may not be configured yet)"
    WARN=$((WARN + 1))
fi
echo ""

echo "[4] SPF Record"
spf_result=$(dig +short "$DOMAIN" TXT 2>/dev/null | grep "v=spf1")
if echo "$spf_result" | grep -q "include:resend.com"; then
    echo "  PASS  SPF record includes resend.com"
    PASS=$((PASS + 1))
elif [ -n "$spf_result" ]; then
    echo "  WARN  SPF record found but doesn't include resend.com: $spf_result"
    WARN=$((WARN + 1))
else
    echo "  FAIL  No SPF record found"
    FAIL=$((FAIL + 1))
fi
echo ""

echo "[5] DMARC Record"
dmarc_result=$(dig +short "_dmarc.$DOMAIN" TXT 2>/dev/null)
if [ -n "$dmarc_result" ]; then
    echo "  PASS  DMARC record found: $dmarc_result"
    PASS=$((PASS + 1))
else
    echo "  WARN  No DMARC record found (add after email setup)"
    WARN=$((WARN + 1))
fi
echo ""

echo "[6] DKIM Record"
dkim_result=$(dig +short "resend._domainkey.$DOMAIN" TXT 2>/dev/null)
if [ -n "$dkim_result" ]; then
    echo "  PASS  DKIM record found"
    PASS=$((PASS + 1))
else
    echo "  WARN  No DKIM record found (add from Resend dashboard)"
    WARN=$((WARN + 1))
fi
echo ""

echo "=== DNS Verification Summary ==="
echo "  Passed:   $PASS"
echo "  Warnings: $WARN"
echo "  Failed:   $FAIL"
echo ""

if [ "$FAIL" -gt 0 ]; then
    echo "DNS NOT FULLY CONFIGURED - fix failures above before proceeding."
    exit 1
elif [ "$WARN" -gt 0 ]; then
    echo "DNS PARTIALLY CONFIGURED - some records may still need setup (email/DKIM)."
    exit 0
else
    echo "ALL DNS CHECKS PASSED!"
    exit 0
fi