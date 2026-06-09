import requests
from django.conf import settings

from .models import ZohoSyncLog


class ZohoBooksClient:
    def __init__(self, access_token):
        self.access_token = access_token
        self.base_url = settings.ZOHO_API_DOMAIN.rstrip("/")
        self.organization_id = settings.ZOHO_ORGANIZATION_ID

    def request(self, method, path, *, module, payload=None):
        url = f"{self.base_url}/{path.lstrip('/')}"
        params = {"organization_id": self.organization_id}
        log = ZohoSyncLog.objects.create(module=module, direction="crm_to_zoho", status="pending", request_payload=payload or {})
        try:
            result = requests.request(
                method,
                url,
                params=params,
                json=payload,
                headers={"Authorization": f"Zoho-oauthtoken {self.access_token}"},
                timeout=30,
            )
            response_payload = result.json() if result.content else {}
            log.response_payload = response_payload
            log.status = "success" if result.ok else "failed"
            if not result.ok:
                log.error_message = result.text
            log.save()
            result.raise_for_status()
            return response_payload
        except Exception as exc:
            log.status = "failed"
            log.error_message = str(exc)
            log.save()
            raise
