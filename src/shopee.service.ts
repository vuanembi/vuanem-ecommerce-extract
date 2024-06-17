import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import ndjson from 'ndjson';

import axios from 'axios';
import { DateTime } from 'luxon';
import { BigQuery } from '@google-cloud/bigquery';

const bigqueryClient = new BigQuery();

type ShopeeAdsPerformance = {
    date: string;
    impression: number;
    clicks: number;
    ctr: number;
    direct_order: number;
    broad_order: number;
    direct_conversions: number;
    broad_conversions: number;
    direct_item_sold: number;
    broad_item_sold: number;
    direct_gmv: number;
    broad_gmv: number;
    expense: number;
    cost_per_conversion: number;
    direct_roas: number;
    broad_roas: number;
};

export const getPerformance = async (shopId: string, options: { start: string; end: string }) => {
    const response = await axios.request<ShopeeAdsPerformance[]>({
        method: 'GET',
        url: `https://bi-dev.vuanem.com/api/shopee/${shopId}/ads`,
        params: options,
    });
    const data = response.data.map((row) => ({ ...row, _batched_at: DateTime.utc().toISO(), shop_id: shopId }));

    await pipeline(
        Readable.from(data),
        ndjson.stringify(),
        bigqueryClient
            .dataset('IP_Shopee')
            .table('DailyPerformance_hist')
            .createWriteStream({
                writeDisposition: 'WRITE_APPEND',
                schema: {
                    fields: [
                        { name: 'date', type: 'STRING' },
                        { name: 'impression', type: 'NUMERIC' },
                        { name: 'clicks', type: 'NUMERIC' },
                        { name: 'ctr', type: 'NUMERIC' },
                        { name: 'direct_order', type: 'NUMERIC' },
                        { name: 'broad_order', type: 'NUMERIC' },
                        { name: 'direct_conversions', type: 'NUMERIC' },
                        { name: 'broad_conversions', type: 'NUMERIC' },
                        { name: 'direct_item_sold', type: 'NUMERIC' },
                        { name: 'broad_item_sold', type: 'NUMERIC' },
                        { name: 'direct_gmv', type: 'NUMERIC' },
                        { name: 'broad_gmv', type: 'NUMERIC' },
                        { name: 'expense', type: 'NUMERIC' },
                        { name: 'cost_per_conversion', type: 'NUMERIC' },
                        { name: 'direct_roas', type: 'NUMERIC' },
                        { name: 'broad_roas', type: 'NUMERIC' },
                        { name: 'shop_id', type: 'STRING' },
                        { name: '_batched_at', type: 'TIMESTAMP' },
                    ],
                },
                sourceFormat: 'NEWLINE_DELIMITED_JSON',
                createDisposition: 'CREATE_IF_NEEDED',
            }),
    );

    return true;
};
