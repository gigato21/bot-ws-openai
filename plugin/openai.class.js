class OpenAiClass {
    openAiOptions = {
        model: '',
        temperature: 0,
        apiKey: '',
        baseURL: 'https://api.openai.com/v1' // valor por defecto
    }

    constructor(_options = {
        model: 'gpt-3.5-turbo-0301',
        temperature: 0,
        apiKey: '',
        baseURL: 'https://api.openai.com/v1'
    }) {
        if (!_options?.apiKey) {
            throw new Error('apiKey no puede ser vacío')
        }

        this.openAiOptions = { ...this.openAiOptions, ..._options }
    }

    /**
     * Construye encabezados HTTP
     */
    buildHeader = () => {
        const headers = new Headers()
        headers.append('Content-Type', 'application/json')
        headers.append('Authorization', `Bearer ${this.openAiOptions.apiKey}`)
        return headers
    }

    /**
     * Enviar solicitud de embedding
     * @param {*} input
     * @param {*} model
     * @returns
     */
    sendEmbedding = async (input, model = 'text-embedding-ada-002') => {
        const headers = this.buildHeader()
        const raw = JSON.stringify({ input, model })

        const requestOptions = {
            method: 'POST',
            headers,
            body: raw,
            redirect: 'follow',
        }

        const url = `${this.openAiOptions.baseURL}/embeddings`
        const response = await fetch(url, requestOptions)
        return response.json()
    }

    /**
     * Enviar chat tipo conversación
     * @param {*} messages
     * @returns
     */
    sendChat = async (messages = []) => {
        const headers = this.buildHeader()

        const raw = JSON.stringify({
            model: this.openAiOptions.model,
            temperature: this.openAiOptions.temperature,
            messages,
        })

        const requestOptions = {
            method: 'POST',
            headers,
            body: raw,
            redirect: 'follow',
        }

        const url = `${this.openAiOptions.baseURL}/chat/completions`
        const response = await fetch(url, requestOptions)
        return response.json()
    }

    /**
     * Enviar prompt para modelo de completion
     * @param {*} prompt
     * @returns
     */
    sendCompletions = async (prompt = undefined) => {
        const headers = this.buildHeader()

        const raw = JSON.stringify({
            model: this.openAiOptions.model,
            temperature: this.openAiOptions.temperature,
            prompt,
        })

        const requestOptions = {
            method: 'POST',
            headers,
            body: raw,
            redirect: 'follow',
        }

        const url = `${this.openAiOptions.baseURL}/completions`
        const response = await fetch(url, requestOptions)
        return response.json()
    }
}

module.exports = OpenAiClass
