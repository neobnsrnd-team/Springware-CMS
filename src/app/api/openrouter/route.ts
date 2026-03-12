// src/app/api/openrouter/route.ts
import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
    try {
        const url = "https://openrouter.ai/api/v1/chat/completions";
        const DEFAULT_MODEL = 'openai/gpt-4o-mini';
        const DEFAULT_TEMPERATURE = 0.6;
        const DEFAULT_TOP_P = 0.9;
        const DEFAULT_NUM = 1;

        const body = await req.json();
        const { question, context, system, functs = [], temperature, topP, num, model } = body;

        const messages = [
            { role: 'system', content: system },
            { role: 'assistant', content: context || '' },
            { role: 'user', content: question }
        ];

        try {
            if (functs.length > 0) {
                // --- Function Calling Branch ---

                const tools = [
                    {
                        type: "function",
                        function: {
                            ...functs[0]
                        }
                    }
                ];

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: 'anthropic/claude-3.5-sonnet',
                        /*
                        Models for function calling:
                        - anthropic/claude-3.5-sonnet
                        - qwen/qwen-2.5-72b-instruct
                        */
                        messages,
                        temperature: parseFloat(temperature) || DEFAULT_TEMPERATURE,
                        top_p: parseFloat(topP) || DEFAULT_TOP_P,
                        n: parseInt(num) || DEFAULT_NUM,
                        tools,
                    })
                });

                const data = await response.json();

                if (data && data.error && data.error.message) {
                    return NextResponse.json(
                        { ok: false, status: 404, error: data.error.message },
                        { status: 200 }
                    );
                }

                const answer = functs.length === 0
                    ? data
                    : (data.choices[0].message.tool_calls
                        ? data.choices[0].message.tool_calls[0].function.arguments
                        : data.choices[0].message);
                const usage = data.usage;

                return NextResponse.json({ answer, usage });

            } else {
                // --- Content Generation Branch ---

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: model || DEFAULT_MODEL,
                        messages,
                        temperature: parseFloat(temperature) || DEFAULT_TEMPERATURE,
                        top_p: parseFloat(topP) || DEFAULT_TOP_P,
                        n: parseInt(num) || DEFAULT_NUM
                    })
                });

                const data = await response.json();
                const answer = data;
                const usage = data.usage;

                return NextResponse.json({ answer, usage });
            }

        } catch (error) {
            return NextResponse.json(
                { ok: false, status: 500, error: error instanceof Error ? error.message : 'Unknown error' },
                { status: 200 }
            );
        }

    } catch (e) {
        return NextResponse.json(
            { ok: true, status: 500, error: 'Something went wrong.' },
            { status: 200 }
        );
    }
}