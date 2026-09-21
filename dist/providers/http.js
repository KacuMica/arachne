export class HttpProvider {
    name;
    endpoint;
    headers;
    body;
    extract;
    constructor(name, endpoint, headers, body, extract) {
        this.name = name;
        this.endpoint = endpoint;
        this.headers = headers;
        this.body = body;
        this.extract = extract;
    }
    async complete(system, prompt) {
        const response = await fetch(this.endpoint, { method: "POST", headers: { "content-type": "application/json", ...this.headers }, body: JSON.stringify(this.body(system, prompt)) });
        if (!response.ok)
            throw new Error(`${this.name} request failed (${response.status}): ${await response.text()}`);
        return this.extract(await response.json());
    }
}
export function openAiCompatible(kind, model, baseUrl, apiKey) {
    return new HttpProvider(kind, `${baseUrl.replace(/\/$/, "")}/chat/completions`, apiKey ? { authorization: `Bearer ${apiKey}` } : {}, (system, prompt) => ({ model, messages: [{ role: "system", content: system }, { role: "user", content: prompt }], temperature: 0.1 }), json => json.choices?.[0]?.message?.content ?? "");
}
//# sourceMappingURL=http.js.map