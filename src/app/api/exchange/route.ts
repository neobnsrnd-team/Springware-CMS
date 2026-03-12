import { NextResponse } from 'next/server';

/**
 * GET /api/exchange
 * 환율 데이터 플레이스홀더 API
 *
 * 실제 운영 시 아래 데이터 소스 중 하나로 교체하세요:
 * - 한국수출입은행 환율 API: https://www.koreaexim.go.kr/site/program/financial/exchangeJSON
 * - 한국은행 경제통계시스템: https://ecos.bok.or.kr/api/
 * - 서울외국환중개: https://www.smbs.biz
 *
 * 응답 형식: { [currency: string]: { buy: number, sell: number, change: number } }
 */
export async function GET() {
    // TODO: 실제 환율 API로 교체
    // const res = await fetch(`https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${process.env.EXIM_API_KEY}&data=AP01`);
    // const data = await res.json();
    // return NextResponse.json(transformExchangeData(data));

    const rates = {
        USD: { buy: 1325.50, sell: 1296.50, change: 3.50 },
        EUR: { buy: 1445.20, sell: 1408.30, change: -5.20 },
        JPY: { buy: 944.85, sell: 923.25, change: 1.15 },
        CNY: { buy: 184.60, sell: 179.80, change: -0.80 },
        GBP: { buy: 1685.40, sell: 1642.30, change: 8.90 },
        HKD: { buy: 170.50, sell: 166.20, change: 0.30 },
    };

    return NextResponse.json(rates, {
        headers: {
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
        }
    });
}
