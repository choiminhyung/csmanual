/** Google Docs에서 텍스트를 가져오는 순수 fetcher. 캐시·상태 없음. */
export async function fetchGoogleDoc(docId: string): Promise<string> {
  const url = `https://docs.google.com/document/d/${docId}/export?format=txt`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Google Docs 가져오기 실패 (${res.status})`)
  return res.text()
}
