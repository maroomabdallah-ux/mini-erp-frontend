const STORAGE_KEY = "erp_document_target";

export function openDocument(onNavigate, target) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(target));
  onNavigate?.(target.route);
}

export function consumeDocumentTarget(route) {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const target = JSON.parse(raw);
    if (target.route !== route) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return target;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
