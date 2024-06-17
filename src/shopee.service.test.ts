import { getPerformance } from './shopee.service';

describe('getPerformance', () => {
    const options = { start: '2024-01-01', end: '2024-06-17' };
    it.each(['179124960', '653870673'])('getPerformance/$', async (shopId) => {
        try {
            const result = await getPerformance(shopId, options);
            expect(result).toBeDefined();
        } catch (error) {
            throw error;
        }
    });
});
